import { NextResponse } from 'next/server';
import { getSystemStats } from '@/lib/db/store';

export async function GET() {
  try {
    const stats = getSystemStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener estadísticas';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
