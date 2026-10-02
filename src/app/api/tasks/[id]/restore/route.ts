import { NextRequest, NextResponse } from 'next/server';
import { restoreTask } from '@/lib/db/store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actorUserId = req.headers.get('x-user-id') || undefined;

    restoreTask(id, actorUserId);
    return NextResponse.json({ success: true, message: 'Tarea restaurada exitosamente de la papelera' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al restaurar tarea';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
