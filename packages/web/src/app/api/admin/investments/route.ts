import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
        property: { select: { title: true, location: true } },
      },
    });

    return NextResponse.json({
      investments: investments.map((inv) => ({
        id: inv.id,
        userName: inv.user.fullName,
        userEmail: inv.user.email,
        propertyTitle: inv.property.title,
        propertyLocation: inv.property.location,
        amount: inv.amount,
        ownershipPercentage: inv.ownershipPercentage,
        platformFee: inv.platformFee,
        status: inv.status.toLowerCase(),
        createdAt: inv.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Admin investments error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load investments' }, { status: 500 });
  }
}
