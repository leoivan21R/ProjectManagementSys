import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByTaskId, addComment } from '@/lib/db/store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = getCommentsByTaskId(id);
    return NextResponse.json({ success: true, data: comments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener comentarios';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.userId || !body.content || !body.content.trim()) {
      return NextResponse.json({ success: false, error: 'Usuario y contenido del comentario son requeridos' }, { status: 400 });
    }

    const comment = addComment(id, body.userId, body.content.trim());
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al añadir comentario';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
