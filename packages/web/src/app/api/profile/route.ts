import { NextRequest, NextResponse } from 'next/server';
import { updateProfileSchema } from '@urban-wealth/core';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.toLowerCase(),
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email } = parsed.data;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser && existingUser.id !== session.userId) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        fullName,
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Profile PUT error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
