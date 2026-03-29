import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const dbInvestments = await prisma.investment.findMany({
      where: { userId: session.userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalInvested = dbInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalProperties = new Set(dbInvestments.map((inv) => inv.propertyId)).size;
    const estimatedAnnualIncome = dbInvestments.reduce((sum, inv) => sum + inv.estimatedAnnualIncome, 0);

    // Aggregate per property for the holdings view
    const holdingsMap = new Map<string, {
      propertyId: string;
      propertyTitle: string;
      amount: number;
      ownershipPercentage: number;
      estimatedAnnualIncome: number;
      status: string;
    }>();
    for (const inv of dbInvestments) {
      const existing = holdingsMap.get(inv.propertyId);
      if (existing) {
        existing.amount += inv.amount;
        existing.ownershipPercentage += inv.ownershipPercentage;
        existing.estimatedAnnualIncome += inv.estimatedAnnualIncome;
      } else {
        holdingsMap.set(inv.propertyId, {
          propertyId: inv.propertyId,
          propertyTitle: inv.property.title,
          amount: inv.amount,
          ownershipPercentage: inv.ownershipPercentage,
          estimatedAnnualIncome: inv.estimatedAnnualIncome,
          status: inv.status === 'COMPLETED' ? 'Completed' : 'Pending',
        });
      }
    }

    // Raw event log for the transaction history
    const investments = dbInvestments.map((inv) => ({
      id: inv.id,
      propertyTitle: inv.property.title,
      amount: inv.amount,
      status: inv.status === 'COMPLETED' ? 'Completed' : 'Pending',
      createdAt: inv.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalInvested,
      totalProperties,
      estimatedAnnualIncome,
      holdings: Array.from(holdingsMap.values()),
      investments,
    });
  } catch (error) {
    console.error('Dashboard error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
