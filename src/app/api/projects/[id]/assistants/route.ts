import { NextRequest, NextResponse } from 'next/server';
import { addAssistant, removeAssistant, updateAssistant } from '@/lib/db/store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorUserId = req.headers.get('x-user-id') || undefined;

    if (!body.userId || !body.responsibility) {
      return NextResponse.json(
        { success: false, error: 'Usuario y responsabilidad son obligatorios' },
        { status: 400 }
      );
    }

    const assistant = addAssistant(id, body.userId, body.responsibility, actorUserId);
    return NextResponse.json({ success: true, data: assistant }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al añadir asistente';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');
    const actorUserId = req.headers.get('x-user-id') || undefined;

    if (!assistantId) {
      return NextResponse.json({ success: false, error: 'Identificador de asistente requerido' }, { status: 400 });
    }

    removeAssistant(assistantId, actorUserId);
    return NextResponse.json({ success: true, message: 'Asistente removido correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al remover asistente';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.assistantId || !body.responsibility) {
      return NextResponse.json({ success: false, error: 'Identificador y responsabilidad requeridos' }, { status: 400 });
    }

    const updated = updateAssistant(body.assistantId, body.responsibility);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar asistente';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
