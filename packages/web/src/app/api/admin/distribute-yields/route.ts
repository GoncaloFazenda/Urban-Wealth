import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Distribute for the previous month
    const now = new Date();
    const distributionMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // The last day of the distribution month (i.e. end of the period we're paying for)
    const distributionMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Find all completed investments whose yield has started on or before the distribution month.
    // Investments with null yieldStartDate (created before the field was added) are treated as eligible.
    const investments = await prisma.investment.findMany({
      where: {
        status: 'COMPLETED',
        OR: [
          { yieldStartDate: { lte: distributionMonthEnd } },
          { yieldStartDate: null },
        ],
      },
      include: {
        property: { select: { annualYield: true, totalValue: true } },
      },
    });

    let totalDistributed = 0;
    let payoutsCreated = 0;
    let skipped = 0;

    for (const investment of investments) {
      // Monthly yield = (annualYield% * totalValue * ownershipPercentage%) / 12
      const monthlyYield =
        (investment.property.annualYield / 100) *
        investment.property.totalValue *
        (investment.ownershipPercentage / 100) /
        12;

      if (monthlyYield <= 0) continue;

      try {
        await prisma.$transaction(async (tx) => {
          // Create payout (unique constraint on investmentId+month prevents duplicates)
          await tx.yieldPayout.create({
            data: {
              userId: investment.userId,
              investmentId: investment.id,
              amount: Math.round(monthlyYield * 100) / 100,
              month: distributionMonth,
            },
          });

          // Upsert wallet balance
          await tx.wallet.upsert({
            where: { userId: investment.userId },
            create: {
              userId: investment.userId,
              balance: Math.round(monthlyYield * 100) / 100,
            },
            update: {
              balance: { increment: Math.round(monthlyYield * 100) / 100 },
            },
          });
        });

        totalDistributed += monthlyYield;
        payoutsCreated++;
      } catch (error) {
        // Unique constraint violation = already distributed for this month
        if (
          error instanceof Error &&
          error.message.includes('Unique constraint')
        ) {
          skipped++;
          continue;
        }
        throw error;
      }
    }

    return NextResponse.json({
      month: distributionMonth.toISOString().slice(0, 7),
      investmentsProcessed: investments.length,
      payoutsCreated,
      skipped,
      totalDistributed: Math.round(totalDistributed * 100) / 100,
    });
  } catch (error) {
    console.error('Distribution error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}
