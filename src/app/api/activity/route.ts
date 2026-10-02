import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;
    const taskId = searchParams.get('taskId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const logs = getActivityLogs({ projectId, taskId, limit });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener registros de actividad';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
