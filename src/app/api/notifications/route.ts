import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markNotificationRead, deleteNotification, clearNotifications } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;

    const notifs = getNotifications(userId);
    return NextResponse.json({ success: true, data: notifs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener notificaciones';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Identificador requerido' }, { status: 400 });
    }

    markNotificationRead(body.id);
    return NextResponse.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar notificación';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      clearNotifications();
      return NextResponse.json({ success: true, message: 'Todas las notificaciones han sido eliminadas' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identificador requerido' }, { status: 400 });
    }

    deleteNotification(id);
    return NextResponse.json({ success: true, message: 'Notificación eliminada' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar notificación';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

