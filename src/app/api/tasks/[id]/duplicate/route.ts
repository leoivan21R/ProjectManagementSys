import { NextRequest, NextResponse } from 'next/server';
import { duplicateTask } from '@/lib/db/store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actorUserId = req.headers.get('x-user-id') || undefined;

    const copy = duplicateTask(id, actorUserId);
    return NextResponse.json({ success: true, data: copy, message: 'Tarea duplicada exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al duplicar tarea';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
