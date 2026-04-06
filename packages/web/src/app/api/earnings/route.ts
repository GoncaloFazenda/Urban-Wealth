import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const [wallet, payouts] = await Promise.all([
      prisma.wallet.findUnique({
        where: { userId: session.userId },
      }),
      prisma.yieldPayout.findMany({
        where: { userId: session.userId },
        include: {
          investment: {
            include: { property: { select: { title: true, location: true } } },
          },
        },
        orderBy: { month: 'desc' },
      }),
    ]);

    // Group payouts by month, then by property within each month
    type PropertyEntry = { title: string; location: string; amount: number };
    type MonthEntry = { month: string; total: number; properties: PropertyEntry[] };
    const monthlyPayouts = new Map<string, MonthEntry>();

    for (const payout of payouts) {
      const monthKey = payout.month.toISOString().slice(0, 7); // YYYY-MM
      const propertyId = payout.investment.propertyId;

      if (!monthlyPayouts.has(monthKey)) {
        monthlyPayouts.set(monthKey, { month: monthKey, total: 0, properties: [] });
      }
      const monthEntry = monthlyPayouts.get(monthKey)!;
      monthEntry.total += payout.amount;

      // Merge into existing property entry for this month if one exists
      const propEntry = monthEntry.properties.find((p) => p.title === payout.investment.property.title);
      if (propEntry) {
        propEntry.amount += payout.amount;
      } else {
        monthEntry.properties.push({
          title: payout.investment.property.title,
          location: payout.investment.property.location,
          amount: payout.amount,
        });
      }
    }

    return NextResponse.json({
      balance: wallet?.balance ?? 0,
      totalEarned: payouts.reduce((sum, p) => sum + p.amount, 0),
      history: Array.from(monthlyPayouts.values()),
    });
  } catch (error) {
    console.error('Earnings error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load earnings' }, { status: 500 });
  }
}
