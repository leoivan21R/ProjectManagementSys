import { NextRequest, NextResponse } from 'next/server';
import { addMemberToProject, removeMemberFromProject } from '@/lib/db/store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorUserId = req.headers.get('x-user-id') || undefined;

    if (!body.userId || !body.responsibility) {
      return NextResponse.json(
        { success: false, error: 'Usuario y responsabilidad son requeridos' },
        { status: 400 }
      );
    }

    const member = addMemberToProject(id, body.userId, body.responsibility, actorUserId);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar miembro';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const actorUserId = req.headers.get('x-user-id') || undefined;

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Identificador de miembro requerido' }, { status: 400 });
    }

    removeMemberFromProject(memberId, actorUserId);
    return NextResponse.json({ success: true, message: 'Miembro retirado del proyecto' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al remover miembro';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
