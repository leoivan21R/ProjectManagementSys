import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/db/store';

export async function GET() {
  try {
    const users = getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al listar usuarios';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email || !body.fullName || !body.jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Correo electrónico, nombre completo y cargo son obligatorios' },
        { status: 400 }
      );
    }

    const newUser = createUser({
      email: body.email.trim(),
      fullName: body.fullName.trim(),
      role: body.role || 'TEAM_MEMBER',
      jobTitle: body.jobTitle.trim(),
      department: body.department?.trim() || 'General',
      avatarUrl:
        body.avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(body.fullName)}`,
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar usuario';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Identificador de usuario requerido' }, { status: 400 });
    }

    const updated = updateUser(body.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const actorUserId = req.headers.get('x-user-id') || undefined;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Identificador de usuario requerido' }, { status: 400 });
    }

    deleteUser(userId, actorUserId);
    return NextResponse.json({ success: true, message: 'Miembro eliminado del directorio exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

