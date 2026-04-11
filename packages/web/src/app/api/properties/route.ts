import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { coreToDb as dbStatusMap, dbToCore as coreStatusMap } from '@/lib/propertyStatus';

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const location = searchParams.get('location');
    const sort = searchParams.get('sort');
    const minYield = searchParams.get('minYield');
    const maxYield = searchParams.get('maxYield');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // Pagination
    const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limitParam ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

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

    const [dbProperties, total] = await Promise.all([
      prisma.property.findMany({ where, orderBy, skip, take: limit }),
      prisma.property.count({ where }),
    ]);

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

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      properties,
      total,
      page,
      limit,
      totalPages,
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
