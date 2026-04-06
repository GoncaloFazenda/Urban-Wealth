import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createAlertSchema = z.object({
  propertyId: z.string().uuid(),
  triggerType: z.enum(['NEW_LISTING', 'YIELD_ABOVE', 'LISTING_PRICE_BELOW']),
  conditionValue: z.number().positive().optional(),
}).refine(
  (data) => {
    // YIELD_ABOVE and LISTING_PRICE_BELOW require a conditionValue
    if (data.triggerType === 'YIELD_ABOVE' || data.triggerType === 'LISTING_PRICE_BELOW') {
      return data.conditionValue !== undefined;
    }
    return true;
  },
  { message: 'Condition value is required for this trigger type', path: ['conditionValue'] }
);

// GET /api/alerts — list user's alerts
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    const where: Record<string, unknown> = { userId: session.userId };
    if (propertyId) where.propertyId = propertyId;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: { title: true, annualYield: true, totalValue: true, location: true },
        },
      },
    });

    const result = alerts.map((a) => ({
      id: a.id,
      propertyId: a.propertyId,
      triggerType: a.triggerType,
      conditionValue: a.conditionValue,
      active: a.active,
      createdAt: a.createdAt.toISOString(),
      propertyTitle: a.property.title,
      propertyYield: a.property.annualYield,
      propertyLocation: a.property.location,
    }));

    return NextResponse.json({ alerts: result });
  } catch (error) {
    console.error('List alerts error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load alerts' }, { status: 500 });
  }
}

// POST /api/alerts — create a new alert
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { propertyId, triggerType, conditionValue } = parsed.data;

    // Verify property exists
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check for duplicate alert (same user, property, trigger type)
    const existing = await prisma.alert.findFirst({
      where: {
        userId: session.userId,
        propertyId,
        triggerType: triggerType as 'NEW_LISTING' | 'YIELD_ABOVE' | 'LISTING_PRICE_BELOW',
        active: true,
      },
    });

    if (existing) {
      // Update existing alert's condition value instead of creating duplicate
      const updated = await prisma.alert.update({
        where: { id: existing.id },
        data: { conditionValue: conditionValue ?? null },
      });
      return NextResponse.json({ alert: updated, updated: true });
    }

    const alert = await prisma.alert.create({
      data: {
        userId: session.userId,
        propertyId,
        triggerType: triggerType as 'NEW_LISTING' | 'YIELD_ABOVE' | 'LISTING_PRICE_BELOW',
        conditionValue: conditionValue ?? null,
        active: true,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Create alert error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
