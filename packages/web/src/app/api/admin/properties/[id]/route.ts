import { NextRequest, NextResponse } from 'next/server';
import { createPropertySchema } from '@urban-wealth/core';
import { z } from 'zod';
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({
      property: {
        id: property.id,
        title: property.title,
        location: property.location,
        photoUrls: property.photoUrls,
        totalValue: property.totalValue,
        funded: property.funded,
        annualYield: property.annualYield,
        projectedAppreciation: property.projectedAppreciation,
        status: statusToCore[property.status] ?? 'open',
        description: property.description,
        availableShares: property.availableShares,
        platformFee: property.platformFee,
        createdAt: property.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin property detail error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load property' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createPropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const oldProperty = await prisma.property.findUnique({ where: { id } });
    if (!oldProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const property = await prisma.property.update({
      where: { id },
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

    // Fire YIELD_ABOVE alerts if yield changed
    if (parsed.data.annualYield !== oldProperty.annualYield) {
      const yieldAlerts = await prisma.alert.findMany({
        where: {
          propertyId: id,
          triggerType: 'YIELD_ABOVE',
          active: true,
          conditionValue: { lte: parsed.data.annualYield }, // User's threshold <= new yield = match
        },
        select: { userId: true },
      });

      if (yieldAlerts.length > 0) {
        await prisma.notification.createMany({
          data: yieldAlerts.map((a) => ({
            userId: a.userId,
            type: 'ALERT_TRIGGERED' as const,
            title: 'Yield alert triggered',
            message: `${property.title} yield updated to ${parsed.data.annualYield}% (was ${oldProperty.annualYield}%).`,
            data: { propertyId: id, newYield: parsed.data.annualYield, oldYield: oldProperty.annualYield },
          })),
        });
      }
    }

    return NextResponse.json({ property: { id: property.id } });
  } catch (error) {
    console.error('Admin update property error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Check if property has investments
    const investmentCount = await prisma.investment.count({ where: { propertyId: id } });
    if (investmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete property with existing investments' },
        { status: 409 }
      );
    }

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('Admin delete property error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
