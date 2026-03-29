import { NextRequest, NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { changePasswordSchema } from '@urban-wealth/core';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AUTH_CONSTANTS } from '@/lib/constants';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash and save new password
    const newHash = await hash(newPassword, AUTH_CONSTANTS.BCRYPT_COST_FACTOR);
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
