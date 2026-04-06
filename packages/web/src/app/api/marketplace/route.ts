import { NextRequest, NextResponse } from 'next/server';
import { createBulkListingSchema } from '@urban-wealth/core';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace — list all active listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') ?? 'newest';

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (propertyId) where.propertyId = propertyId;
    if (minPrice || maxPrice) {
      const askPriceFilter: Record<string, number> = {};
      if (minPrice) askPriceFilter.gte = parseFloat(minPrice);
      if (maxPrice) askPriceFilter.lte = parseFloat(maxPrice);
      where.askPrice = askPriceFilter;
    }

    const orderBy: Record<string, string> =
      sort === 'price_asc'
        ? { askPrice: 'asc' }
        : sort === 'price_desc'
          ? { askPrice: 'desc' }
          : { createdAt: 'desc' };

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
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
        seller: {
          select: { fullName: true },
        },
      },
    });

    // Group sub-listings by groupId so buyers see one card per sell action.
    // Listings without a groupId are their own group.
    type RawListing = typeof listings[number];
    const groupMap = new Map<string, RawListing[]>();
    for (const l of listings) {
      const key = l.groupId ?? l.id;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(l);
    }

    const result = Array.from(groupMap.values()).map((group) => {
      const first = group[0]!;
      return {
        // Buyers use this id to purchase; the purchase handler resolves the group
        id: first.groupId ?? first.id,
        sellerId: first.sellerId,
        propertyId: first.propertyId,
        sharesAmount: group.reduce((s, l) => s + l.sharesAmount, 0),
        ownershipPct: group.reduce((s, l) => s + l.ownershipPct, 0),
        askPrice: group.reduce((s, l) => s + l.askPrice, 0),
        pricePerPercent: first.pricePerPercent,
        status: first.status.toLowerCase(),
        createdAt: first.createdAt.toISOString(),
        updatedAt: first.updatedAt.toISOString(),
        propertyTitle: first.property.title,
        propertyLocation: first.property.location,
        propertyPhotoUrl: first.property.photoUrls[0] ?? '',
        propertyTotalValue: first.property.totalValue,
        propertyAnnualYield: first.property.annualYield,
        sellerName: first.seller.fullName,
      };
    });

    // Re-sort after grouping (Map ordering is insertion-order which matches DB orderBy)
    return NextResponse.json({ listings: result });
  } catch (error) {
    console.error('Marketplace list error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load marketplace' }, { status: 500 });
  }
}

// POST /api/marketplace — create one or more listings atomically
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createBulkListingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slices, groupId } = parsed.data;

    // Validate all slices up-front before touching the DB
    const resolved = await Promise.all(
      slices.map(async (slice) => {
        const investment = await prisma.investment.findUnique({
          where: { id: slice.investmentId },
          include: { property: true },
        });
        return { slice, investment };
      })
    );

    for (const { slice, investment } of resolved) {
      if (!investment || investment.userId !== session.userId) {
        return NextResponse.json({ error: 'Investment not found or not owned by you' }, { status: 404 });
      }
      if ((investment.status as string) === 'SOLD') {
        return NextResponse.json({ error: 'One of the investments has already been fully sold' }, { status: 400 });
      }
      const agg = await prisma.listing.aggregate({
        where: { investmentId: slice.investmentId, status: 'ACTIVE' },
        _sum: { sharesAmount: true },
      });
      const available = investment.amount - (agg._sum.sharesAmount ?? 0);
      if (slice.sharesAmount > available + 0.01) {
        return NextResponse.json(
          { error: `Cannot list more than your available position (€${available.toLocaleString()} available)` },
          { status: 400 }
        );
      }
    }

    // Create all listings in a single transaction — all succeed or none do
    const listings = await prisma.$transaction(
      resolved.map(({ slice, investment }) => {
        const inv = investment!;
        const ownershipPct = (slice.sharesAmount / inv.amount) * inv.ownershipPercentage;
        const pricePerPercent = ownershipPct > 0 ? slice.askPrice / ownershipPct : 0;
        return prisma.listing.create({
          data: {
            groupId: groupId ?? null,
            sellerId: session.userId,
            investmentId: slice.investmentId,
            propertyId: inv.propertyId,
            sharesAmount: slice.sharesAmount,
            ownershipPct,
            askPrice: slice.askPrice,
            pricePerPercent,
            status: 'ACTIVE',
          },
        });
      })
    );

    // Fire alerts once using the first slice's property (all slices are for the same property)
    const firstInv = resolved[0]!.investment!;
    const totalAskPrice = slices.reduce((s, sl) => s + sl.askPrice, 0);
    const totalOwnershipPct = listings.reduce((s: number, l: { ownershipPct: number }) => s + l.ownershipPct, 0);

    const [newListingAlerts, priceAlerts] = await Promise.all([
      prisma.alert.findMany({
        where: { propertyId: firstInv.propertyId, triggerType: 'NEW_LISTING', active: true, userId: { not: session.userId } },
        select: { userId: true },
      }),
      prisma.alert.findMany({
        where: { propertyId: firstInv.propertyId, triggerType: 'LISTING_PRICE_BELOW', active: true, conditionValue: { gte: totalAskPrice }, userId: { not: session.userId } },
        select: { userId: true },
      }),
    ]);

    const notifyUserIds = [...new Set([...newListingAlerts.map((a: { userId: string }) => a.userId), ...priceAlerts.map((a: { userId: string }) => a.userId)])];
    if (notifyUserIds.length > 0) {
      await prisma.notification.createMany({
        data: notifyUserIds.map((userId: string) => ({
          userId,
          type: 'ALERT_TRIGGERED' as const,
          title: 'New marketplace listing',
          message: `A ${totalOwnershipPct.toFixed(2)}% stake in ${firstInv.property.title} is now available for €${totalAskPrice.toLocaleString()}.`,
          data: { listingId: listings[0]!.id, propertyId: firstInv.propertyId },
        })),
      });
    }

    return NextResponse.json({ listings }, { status: 201 });
  } catch (error) {
    console.error('Create listing error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
