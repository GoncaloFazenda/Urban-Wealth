import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        wallet: { select: { balance: true } },
        investments: {
          include: {
            property: { select: { title: true, location: true, annualYield: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalInvested = user.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalAnnualIncome = user.investments.reduce((sum, inv) => sum + inv.estimatedAnnualIncome, 0);

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.toLowerCase(),
        createdAt: user.createdAt.toISOString(),
        walletBalance: user.wallet?.balance ?? 0,
        totalInvested,
        totalAnnualIncome,
        investments: user.investments.map((inv) => ({
          id: inv.id,
          propertyTitle: inv.property.title,
          propertyLocation: inv.property.location,
          propertyYield: inv.property.annualYield,
          amount: inv.amount,
          ownershipPercentage: inv.ownershipPercentage,
          estimatedAnnualIncome: inv.estimatedAnnualIncome,
          status: inv.status.toLowerCase(),
          yieldStartDate: inv.yieldStartDate?.toISOString() ?? null,
          createdAt: inv.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Admin user detail error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load user' }, { status: 500 });
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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Prevent admins from demoting themselves
    if (id === session.userId) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dbRole = parsed.data.role === 'admin' ? 'ADMIN' : 'USER';
    const user = await prisma.user.update({
      where: { id },
      data: { role: dbRole },
      select: { id: true, fullName: true, email: true, role: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Admin update user error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
