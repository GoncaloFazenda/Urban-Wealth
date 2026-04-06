import { NextRequest, NextResponse } from 'next/server';
import { createListingSchema } from '@urban-wealth/core';
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

    const result = listings.map((l) => ({
      id: l.id,
      sellerId: l.sellerId,
      investmentId: l.investmentId,
      propertyId: l.propertyId,
      sharesAmount: l.sharesAmount,
      ownershipPct: l.ownershipPct,
      askPrice: l.askPrice,
      pricePerPercent: l.pricePerPercent,
      status: l.status.toLowerCase(),
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      propertyTitle: l.property.title,
      propertyLocation: l.property.location,
      propertyPhotoUrl: l.property.photoUrls[0] ?? '',
      propertyTotalValue: l.property.totalValue,
      propertyAnnualYield: l.property.annualYield,
      sellerName: l.seller.fullName,
    }));

    return NextResponse.json({ listings: result });
  } catch (error) {
    console.error('Marketplace list error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load marketplace' }, { status: 500 });
  }
}

// POST /api/marketplace — create a new listing
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createListingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { investmentId, sharesAmount, askPrice } = parsed.data;

    // Verify investment ownership
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: { property: true },
    });

    if (!investment || investment.userId !== session.userId) {
      return NextResponse.json({ error: 'Investment not found or not owned by you' }, { status: 404 });
    }

    if (investment.status === 'SOLD') {
      return NextResponse.json({ error: 'This investment has already been fully sold' }, { status: 400 });
    }

    // Check available position (investment amount minus active listings total)
    const activeListings = await prisma.listing.aggregate({
      where: { investmentId, status: 'ACTIVE' },
      _sum: { sharesAmount: true },
    });
    const activeTotal = activeListings._sum.sharesAmount ?? 0;
    const availableAmount = investment.amount - activeTotal;

    if (sharesAmount > availableAmount) {
      return NextResponse.json(
        { error: `Cannot list more than your available position (€${availableAmount.toLocaleString()} available)` },
        { status: 400 }
      );
    }

    // Calculate derived fields
    const ownershipPct = (sharesAmount / investment.amount) * investment.ownershipPercentage;
    const pricePerPercent = askPrice / ownershipPct;

    const listing = await prisma.listing.create({
      data: {
        sellerId: session.userId,
        investmentId,
        propertyId: investment.propertyId,
        sharesAmount,
        ownershipPct,
        askPrice,
        pricePerPercent,
        status: 'ACTIVE',
      },
    });

    // Notify users who have this property on their watchlist
    const watchlistUsers = await prisma.watchlist.findMany({
      where: {
        propertyId: investment.propertyId,
        userId: { not: session.userId },
      },
      select: { userId: true },
    });

    if (watchlistUsers.length > 0) {
      await prisma.notification.createMany({
        data: watchlistUsers.map((w) => ({
          userId: w.userId,
          type: 'WATCHLIST_LISTING' as const,
          title: 'New listing for watched property',
          message: `A ${ownershipPct.toFixed(2)}% stake in ${investment.property.title} is now available for €${askPrice.toLocaleString()}.`,
          data: { listingId: listing.id, propertyId: investment.propertyId },
        })),
      });
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Create listing error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
