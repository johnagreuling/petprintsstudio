import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('DB init error:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('DB init error:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
