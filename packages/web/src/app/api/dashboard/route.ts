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
        // Any PENDING investment makes the whole holding PENDING
        if (inv.status === 'PENDING') existing.status = 'Pending';
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

    // --- Analytics ---

    // Allocation breakdown (amount per property)
    const allocation = Array.from(holdingsMap.values()).map((h) => ({
      name: h.propertyTitle,
      value: h.amount,
    }));

    // Monthly investment timeline (cumulative)
    const monthlyMap = new Map<string, number>();
    const sortedInvestments = [...dbInvestments].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    let cumulative = 0;
    for (const inv of sortedInvestments) {
      const month = inv.createdAt.toISOString().slice(0, 7); // YYYY-MM
      cumulative += inv.amount;
      monthlyMap.set(month, cumulative);
    }
    const timeline = Array.from(monthlyMap.entries()).map(([month, total]) => ({
      month,
      total,
    }));

    // Yield comparison per property
    const yieldComparison = Array.from(holdingsMap.values()).map((h) => ({
      name: h.propertyTitle,
      invested: h.amount,
      annualIncome: h.estimatedAnnualIncome,
      yieldPercent: h.amount > 0
        ? parseFloat(((h.estimatedAnnualIncome / h.amount) * 100).toFixed(2))
        : 0,
    }));

    // Total estimated appreciation
    let totalAppreciation = 0;
    for (const inv of dbInvestments) {
      totalAppreciation += inv.estimatedAppreciationGain;
    }

    return NextResponse.json({
      totalInvested,
      totalProperties,
      estimatedAnnualIncome,
      totalAppreciation,
      holdings: Array.from(holdingsMap.values()),
      investments,
      analytics: {
        allocation,
        timeline,
        yieldComparison,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
