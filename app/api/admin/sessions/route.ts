import { NextRequest, NextResponse } from 'next/server';
import { searchSessions, getSessionCount, initializeDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Initialize DB on first call
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const [sessions, totalCount] = await Promise.all([
      searchSessions({ search, startDate, endDate, limit, offset }),
      getSessionCount()
    ]);
    
    return NextResponse.json({
      sessions,
      total: totalCount,
      limit,
      offset
    });
  } catch (error) {
    console.error('Admin sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
