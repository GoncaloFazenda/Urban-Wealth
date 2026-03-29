import { NextRequest, NextResponse } from 'next/server';
import { createPropertySchema } from '@urban-wealth/core';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const statusToDb: Record<string, string> = {
  open: 'OPEN',
  coming_soon: 'COMING_SOON',
  funded: 'FUNDED',
};

const statusToCore: Record<string, string> = {
  OPEN: 'open',
  COMING_SOON: 'coming_soon',
  FUNDED: 'funded',
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { investments: true } },
      },
    });

    return NextResponse.json({
      properties: properties.map((p) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        totalValue: p.totalValue,
        funded: p.funded,
        annualYield: p.annualYield,
        status: statusToCore[p.status] ?? 'open',
        availableShares: p.availableShares,
        investmentCount: p._count.investments,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Admin properties error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createPropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        title: parsed.data.title,
        location: parsed.data.location,
        photoUrls: parsed.data.photoUrls,
        totalValue: parsed.data.totalValue,
        funded: parsed.data.funded,
        annualYield: parsed.data.annualYield,
        projectedAppreciation: parsed.data.projectedAppreciation,
        status: (statusToDb[parsed.data.status] ?? 'OPEN') as 'OPEN' | 'COMING_SOON' | 'FUNDED',
        description: parsed.data.description,
        availableShares: parsed.data.availableShares,
        platformFee: parsed.data.platformFee,
      },
    });

    return NextResponse.json({ property: { id: property.id } }, { status: 201 });
  } catch (error) {
    console.error('Admin create property error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
