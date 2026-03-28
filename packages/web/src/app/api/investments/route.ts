import { NextRequest, NextResponse } from 'next/server';
import {
  investmentSchema,
  mockProperties,
  PLATFORM_FEE_RATE,
} from '@urban-wealth/core';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { AUTH_CONSTANTS } from '@/lib/constants';

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

    // Find property
    const property = mockProperties.find((p) => p.id === propertyId);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check property status
    if (property.status !== 'open') {
      return NextResponse.json(
        { error: 'This property is not currently open for investment' },
        { status: 400 }
      );
    }

    // Check remaining value
    const remainingValue =
      property.totalValue * ((100 - property.funded) / 100);
    if (amount > remainingValue) {
      return NextResponse.json(
        { error: 'Investment amount exceeds remaining available value' },
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

    // In production, this would be a Prisma transaction.
    // For mock data, we just return the calculated result.
    const investment = {
      id: crypto.randomUUID(),
      userId: session.userId,
      propertyId,
      amount,
      ownershipPercentage,
      estimatedAnnualIncome,
      estimatedAppreciationGain,
      platformFee,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      propertyTitle: property.title,
      propertyPhotoUrl: property.photoUrls[0] ?? '',
    };

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error) {
    console.error('Investment error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to process investment' },
      { status: 500 }
    );
  }
}
