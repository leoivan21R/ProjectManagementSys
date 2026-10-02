import { NextRequest, NextResponse } from 'next/server';
import { getTaskById, updateTask, softDeleteTask, hardDeleteTask } from '@/lib/db/store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const task = getTaskById(id, includeDeleted);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Tarea no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener tarea';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorUserId = req.headers.get('x-user-id') || undefined;

    const updated = updateTask(id, body, actorUserId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar tarea';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';
    const actorUserId = req.headers.get('x-user-id') || undefined;

    if (permanent) {
      hardDeleteTask(id);
    } else {
      softDeleteTask(id, actorUserId);
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'Tarea eliminada permanentemente' : 'Tarea trasladada a la papelera',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar tarea';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
