import { NextRequest, NextResponse } from 'next/server';
import { restoreProject } from '@/lib/db/store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actorUserId = req.headers.get('x-user-id') || undefined;

    restoreProject(id, actorUserId);
    return NextResponse.json({ success: true, message: 'Proyecto restaurado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al restaurar proyecto';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
