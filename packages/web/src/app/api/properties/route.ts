import { NextRequest, NextResponse } from 'next/server';
import {
  mockProperties,
  mockLocations,
  type PropertyStatus,
  type PropertySortField,
} from '@urban-wealth/core';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const location = searchParams.get('location');
    const sort = searchParams.get('sort') as PropertySortField | null;
    const minYield = searchParams.get('minYield');
    const maxYield = searchParams.get('maxYield');

    let properties = [...mockProperties];

    // Filter by status
    if (
      statusParam &&
      ['open', 'coming_soon', 'funded'].includes(statusParam)
    ) {
      properties = properties.filter(
        (p) => p.status === (statusParam as PropertyStatus)
      );
    }

    // Filter by location
    if (location && mockLocations.includes(location)) {
      properties = properties.filter((p) => p.location === location);
    }

    // Filter by yield range
    if (minYield) {
      const min = parseFloat(minYield);
      if (!isNaN(min)) {
        properties = properties.filter((p) => p.annualYield >= min);
      }
    }
    if (maxYield) {
      const max = parseFloat(maxYield);
      if (!isNaN(max)) {
        properties = properties.filter((p) => p.annualYield <= max);
      }
    }

    // Sort
    switch (sort) {
      case 'yield':
        properties.sort((a, b) => b.annualYield - a.annualYield);
        break;
      case 'appreciation':
        properties.sort(
          (a, b) => b.projectedAppreciation - a.projectedAppreciation
        );
        break;
      case 'funded':
        properties.sort((a, b) => b.funded - a.funded);
        break;
      case 'newest':
      default:
        properties.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        break;
    }

    return NextResponse.json({
      properties,
      total: properties.length,
      locations: mockLocations,
    });
  } catch (error) {
    console.error('Properties error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
