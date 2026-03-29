import { NextRequest, NextResponse } from 'next/server';
import { investmentSchema, PLATFORM_FEE_RATE } from '@urban-wealth/core';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { AUTH_CONSTANTS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limit per user
    const rateLimitResult = checkRateLimit(
      `invest:${session.userId}`,
      {
        maxRequests: AUTH_CONSTANTS.RATE_LIMIT_INVEST_MAX,
        windowMs: AUTH_CONSTANTS.RATE_LIMIT_INVEST_WINDOW_MS,
      }
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many investment requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const parsed = investmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { propertyId, amount } = parsed.data;

    // Find property from DB
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check property status
    if (property.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'This property is not currently open for investment' },
        { status: 400 }
      );
    }

    // Calculate financials
    const ownershipPercentage = (amount / property.totalValue) * 100;
    const estimatedAnnualIncome =
      property.totalValue *
      (property.annualYield / 100) *
      (ownershipPercentage / 100);
    const estimatedAppreciationGain =
      property.totalValue *
      (property.projectedAppreciation / 100) *
      (ownershipPercentage / 100);
    const platformFee = amount * PLATFORM_FEE_RATE;

    // Lock the property row so concurrent requests queue rather than race
    const investment = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM properties WHERE id = ${property.id} FOR UPDATE`;

      const { _sum } = await tx.investment.aggregate({
        where: { propertyId: property.id },
        _sum: { amount: true },
      });
      const alreadyInvested = _sum.amount ?? 0;
      const remainingValue = property.totalValue - alreadyInvested;

      if (amount > remainingValue) {
        throw Object.assign(
          new Error('Investment amount exceeds remaining available value'),
          { code: 'CAPACITY_EXCEEDED' }
        );
      }

      const newFunded = ((alreadyInvested + amount) / property.totalValue) * 100;

      const inv = await tx.investment.create({
        data: {
          userId: session.userId,
          propertyId: property.id,
          amount,
          ownershipPercentage,
          estimatedAnnualIncome,
          estimatedAppreciationGain,
          platformFee,
          status: 'COMPLETED',
        },
      });

      await tx.property.update({
        where: { id: property.id },
        data: { funded: newFunded },
      });

      return inv;
    });

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'CAPACITY_EXCEEDED') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Investment error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to process investment' },
      { status: 500 }
    );
  }
}
