import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [totalUsers, totalProperties, investmentAgg, recentInvestments] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.investment.aggregate({
        _sum: { amount: true, platformFee: true },
        _count: true,
      }),
      prisma.investment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true } },
          property: { select: { title: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProperties,
      totalInvestments: investmentAgg._count,
      totalVolume: investmentAgg._sum.amount ?? 0,
      totalFees: investmentAgg._sum.platformFee ?? 0,
      recentInvestments: recentInvestments.map((inv) => ({
        id: inv.id,
        userId: inv.userId,
        userName: inv.user.fullName,
        userEmail: inv.user.email,
        propertyTitle: inv.property.title,
        amount: inv.amount,
        status: inv.status,
        createdAt: inv.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
