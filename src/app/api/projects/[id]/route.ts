import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, softDeleteProject, hardDeleteProject } from '@/lib/db/store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const project = getProjectById(id, includeDeleted);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener proyecto';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorUserId = req.headers.get('x-user-id') || undefined;

    const updated = updateProject(id, body, actorUserId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar proyecto';
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
      hardDeleteProject(id);
    } else {
      softDeleteProject(id, actorUserId);
    }

    return NextResponse.json({ success: true, message: permanent ? 'Proyecto eliminado permanentemente' : 'Proyecto enviado a la papelera' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar proyecto';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
