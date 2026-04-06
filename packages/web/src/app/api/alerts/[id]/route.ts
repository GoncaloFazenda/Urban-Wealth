import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/alerts/[id] — toggle active or update conditionValue
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid alert ID' }, { status: 400 });
    }

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert || alert.userId !== session.userId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const patchSchema = z.object({
      active: z.boolean().optional(),
      conditionValue: z.number().positive().nullable().optional(),
    });

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ alert: updated });
  } catch (error) {
    console.error('Patch alert error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

// DELETE /api/alerts/[id] — delete an alert
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid alert ID' }, { status: 400 });
    }

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert || alert.userId !== session.userId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await prisma.alert.delete({ where: { id } });

    return NextResponse.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
