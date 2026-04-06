import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/my-listings — current user's listings
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: { sellerId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            title: true,
            location: true,
            photoUrls: true,
            totalValue: true,
            annualYield: true,
          },
        },
        trade: {
          select: {
            id: true,
            amount: true,
            platformFee: true,
            buyerId: true,
            createdAt: true,
          },
        },
      },
    });

    const result = listings.map((l) => ({
      id: l.id,
      propertyId: l.propertyId,
      sharesAmount: l.sharesAmount,
      ownershipPct: l.ownershipPct,
      askPrice: l.askPrice,
      status: l.status.toLowerCase(),
      createdAt: l.createdAt.toISOString(),
      propertyTitle: l.property.title,
      propertyLocation: l.property.location,
      propertyPhotoUrl: l.property.photoUrls[0] ?? '',
      trade: l.trade
        ? {
            id: l.trade.id,
            amount: l.trade.amount,
            platformFee: l.trade.platformFee,
            createdAt: l.trade.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ listings: result });
  } catch (error) {
    console.error('My listings error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load your listings' }, { status: 500 });
  }
}
