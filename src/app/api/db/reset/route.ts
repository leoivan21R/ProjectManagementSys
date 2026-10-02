import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db/store';

export async function POST() {
  try {
    resetDatabase();
    return NextResponse.json({ success: true, message: 'Base de datos restaurada con datos iniciales' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al restaurar base de datos';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
