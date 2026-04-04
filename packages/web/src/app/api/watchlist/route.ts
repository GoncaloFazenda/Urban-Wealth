import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const coreStatusMap: Record<string, string> = {
  OPEN: 'open',
  COMING_SOON: 'coming_soon',
  FUNDED: 'funded',
};

// GET /api/watchlist — list user's watchlisted properties
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.watchlist.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
      },
    });

    const properties = items.map((item) => ({
      id: item.property.id,
      title: item.property.title,
      location: item.property.location,
      photoUrls: item.property.photoUrls,
      totalValue: item.property.totalValue,
      funded: item.property.funded,
      annualYield: item.property.annualYield,
      projectedAppreciation: item.property.projectedAppreciation,
      status: coreStatusMap[item.property.status] ?? 'open',
      description: item.property.description,
      availableShares: item.property.availableShares,
      createdAt: item.property.createdAt.toISOString(),
      platformFee: item.property.platformFee,
      savedAt: item.createdAt.toISOString(),
    }));

    // Also return just the IDs for quick lookup
    const propertyIds = items.map((item) => item.propertyId);

    return NextResponse.json({ properties, propertyIds });
  } catch (error) {
    console.error('Watchlist GET error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load watchlist' }, { status: 500 });
  }
}

// POST /api/watchlist — toggle a property in watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = z.object({ propertyId: z.string().uuid() }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    const { propertyId } = parsed.data;

    // Check if already watchlisted
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_propertyId: {
          userId: session.userId,
          propertyId,
        },
      },
    });

    if (existing) {
      // Remove from watchlist
      await prisma.watchlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    } else {
      // Add to watchlist
      await prisma.watchlist.create({
        data: {
          userId: session.userId,
          propertyId,
        },
      });
      return NextResponse.json({ saved: true }, { status: 201 });
    }
  } catch (error) {
    console.error('Watchlist POST error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
  }
}
