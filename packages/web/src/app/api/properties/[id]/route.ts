import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const coreStatusMap: Record<string, string> = {
  OPEN: 'open',
  COMING_SOON: 'coming_soon',
  FUNDED: 'funded',
};

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const parsed = paramsSchema.safeParse(resolvedParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const dbProperty = await prisma.property.findUnique({
      where: { id: parsed.data.id },
    });

    if (!dbProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = {
      id: dbProperty.id,
      title: dbProperty.title,
      location: dbProperty.location,
      photoUrls: dbProperty.photoUrls,
      totalValue: dbProperty.totalValue,
      funded: dbProperty.funded,
      annualYield: dbProperty.annualYield,
      projectedAppreciation: dbProperty.projectedAppreciation,
      status: coreStatusMap[dbProperty.status] ?? 'open',
      description: dbProperty.description,
      availableShares: dbProperty.availableShares,
      createdAt: dbProperty.createdAt.toISOString(),
      platformFee: dbProperty.platformFee,
    };

    return NextResponse.json({ property });
  } catch (error) {
    console.error('Property detail error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
