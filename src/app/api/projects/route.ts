import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const archivedParam = searchParams.get('archived');
    const archived = archivedParam !== null ? archivedParam === 'true' : undefined;

    const projects = getProjects({ includeDeleted, archived });
    return NextResponse.json({ success: true, data: projects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al listar proyectos';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    if (!body.title || !body.startDate || !body.targetDate || !body.managerId) {
      return NextResponse.json(
        { success: false, error: 'Título, fecha de inicio, fecha estimada y Project Manager son obligatorios' },
        { status: 400 }
      );
    }

    if (new Date(body.targetDate) < new Date(body.startDate)) {
      return NextResponse.json(
        { success: false, error: 'La fecha estimada de culminación no puede ser anterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    const project = createProject(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear proyecto';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
