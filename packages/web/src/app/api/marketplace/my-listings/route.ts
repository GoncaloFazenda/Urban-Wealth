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

    // Group listings by groupId so multi-investment sells appear as one row.
    // Listings without a groupId are treated as their own group.
    const groupMap = new Map<string, typeof listings>();
    for (const l of listings) {
      const key = l.groupId ?? l.id;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(l);
    }

    const result = Array.from(groupMap.values()).map((group) => {
      const first = group[0]!;
      const totalShares = group.reduce((s, l) => s + l.sharesAmount, 0);
      const totalOwnership = group.reduce((s, l) => s + l.ownershipPct, 0);
      const totalAsk = group.reduce((s, l) => s + l.askPrice, 0);
      // Group status: if any sub-listing is active the group is active;
      // if all are sold the group is sold; otherwise cancelled.
      const statuses = group.map((l) => l.status);
      const groupStatus = statuses.some((s) => s === 'ACTIVE')
        ? 'active'
        : statuses.every((s) => s === 'SOLD')
          ? 'sold'
          : 'cancelled';
      const trade = group.find((l) => l.trade)?.trade ?? null;
      const totalTradeAmount = group.reduce((s, l) => s + (l.trade?.amount ?? 0), 0);
      const totalTradeFee = group.reduce((s, l) => s + (l.trade?.platformFee ?? 0), 0);

      return {
        id: first.groupId ?? first.id,   // stable identifier for the group
        listingIds: group.map((l) => l.id),
        propertyId: first.propertyId,
        sharesAmount: totalShares,
        ownershipPct: totalOwnership,
        askPrice: totalAsk,
        status: groupStatus,
        createdAt: first.createdAt.toISOString(),
        propertyTitle: first.property.title,
        propertyLocation: first.property.location,
        propertyPhotoUrl: first.property.photoUrls[0] ?? '',
        trade: trade
          ? {
              id: trade.id,
              amount: totalTradeAmount,
              platformFee: totalTradeFee,
              createdAt: trade.createdAt.toISOString(),
            }
          : null,
      };
    });

    // Sort merged groups newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ listings: result });
  } catch (error) {
    console.error('My listings error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load your listings' }, { status: 500 });
  }
}
