import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For mock data, return an empty portfolio.
    // In production, this would query Prisma for the user's investments.
    return NextResponse.json({
      totalInvested: 0,
      totalProperties: 0,
      estimatedAnnualIncome: 0,
      investments: [],
      transactions: [],
    });
  } catch (error) {
    console.error('Dashboard error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
