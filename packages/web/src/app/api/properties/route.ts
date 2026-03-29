import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const dbStatusMap: Record<string, string> = {
  open: 'OPEN',
  coming_soon: 'COMING_SOON',
  funded: 'FUNDED',
};

const coreStatusMap: Record<string, string> = {
  OPEN: 'open',
  COMING_SOON: 'coming_soon',
  FUNDED: 'funded',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const location = searchParams.get('location');
    const sort = searchParams.get('sort');
    const minYield = searchParams.get('minYield');
    const maxYield = searchParams.get('maxYield');

    // Build Prisma where clause
    const where: Prisma.PropertyWhereInput = {};

    if (statusParam && dbStatusMap[statusParam]) {
      where.status = dbStatusMap[statusParam] as Prisma.EnumPropertyStatusFilter;
    }

    if (location) {
      where.location = location;
    }

    if (minYield || maxYield) {
      where.annualYield = {};
      if (minYield) {
        const min = parseFloat(minYield);
        if (!isNaN(min)) where.annualYield.gte = min;
      }
      if (maxYield) {
        const max = parseFloat(maxYield);
        if (!isNaN(max)) where.annualYield.lte = max;
      }
    }

    // Build orderBy
    let orderBy: Prisma.PropertyOrderByWithRelationInput;
    switch (sort) {
      case 'yield':
        orderBy = { annualYield: 'desc' };
        break;
      case 'appreciation':
        orderBy = { projectedAppreciation: 'desc' };
        break;
      case 'funded':
        orderBy = { funded: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const dbProperties = await prisma.property.findMany({ where, orderBy });

    // Map DB enums back to core types for the frontend
    const properties = dbProperties.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      photoUrls: p.photoUrls,
      totalValue: p.totalValue,
      funded: p.funded,
      annualYield: p.annualYield,
      projectedAppreciation: p.projectedAppreciation,
      status: coreStatusMap[p.status] ?? 'open',
      description: p.description,
      availableShares: p.availableShares,
      createdAt: p.createdAt.toISOString(),
      platformFee: p.platformFee,
    }));

    // Get distinct locations for the filter dropdown
    const locationRows = await prisma.property.findMany({
      select: { location: true },
      distinct: ['location'],
      orderBy: { location: 'asc' },
    });
    const locations = locationRows.map((r) => r.location);

    return NextResponse.json({
      properties,
      total: properties.length,
      locations,
    });
  } catch (error) {
    console.error('Properties error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
