import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db/store';
import { TaskStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;
    const assigneeId = searchParams.get('assigneeId') || undefined;
    const status = (searchParams.get('status') as TaskStatus) || undefined;
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const tasks = getTasks({ projectId, assigneeId, status, includeDeleted });
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al listar tareas';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorUserId = req.headers.get('x-user-id') || undefined;

    if (!body.projectId || !body.title || !body.startDate || !body.dueDate || !body.assigneeId) {
      return NextResponse.json(
        { success: false, error: 'Proyecto, título, fechas y persona responsable son requeridos' },
        { status: 400 }
      );
    }

    if (new Date(body.dueDate) < new Date(body.startDate)) {
      return NextResponse.json(
        { success: false, error: 'La fecha estimada de culminación no puede ser anterior a la de comienzo' },
        { status: 400 }
      );
    }

    const task = createTask(body, actorUserId);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear tarea';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
