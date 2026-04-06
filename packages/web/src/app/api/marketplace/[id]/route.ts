import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/marketplace/[id] — single listing detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            title: true,
            location: true,
            photoUrls: true,
            totalValue: true,
            annualYield: true,
            projectedAppreciation: true,
            funded: true,
            status: true,
          },
        },
        seller: {
          select: { fullName: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      listing: {
        id: listing.id,
        sellerId: listing.sellerId,
        investmentId: listing.investmentId,
        propertyId: listing.propertyId,
        sharesAmount: listing.sharesAmount,
        ownershipPct: listing.ownershipPct,
        askPrice: listing.askPrice,
        pricePerPercent: listing.pricePerPercent,
        status: listing.status.toLowerCase(),
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        propertyTitle: listing.property.title,
        propertyLocation: listing.property.location,
        propertyPhotoUrl: listing.property.photoUrls[0] ?? '',
        propertyTotalValue: listing.property.totalValue,
        propertyAnnualYield: listing.property.annualYield,
        propertyAppreciation: listing.property.projectedAppreciation,
        propertyFunded: listing.property.funded,
        propertyStatus: listing.property.status.toLowerCase(),
        sellerName: listing.seller.fullName,
      },
    });
  } catch (error) {
    console.error('Listing detail error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load listing' }, { status: 500 });
  }
}

// DELETE /api/marketplace/[id] — cancel a listing (seller only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== session.userId) {
      return NextResponse.json({ error: 'You can only cancel your own listings' }, { status: 403 });
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Only active listings can be cancelled' }, { status: 400 });
    }

    await prisma.listing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel listing error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to cancel listing' }, { status: 500 });
  }
}
