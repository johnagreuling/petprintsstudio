import { NextRequest, NextResponse } from 'next/server';
import { searchSessions, getSessionCount, initializeDatabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
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
    
    // Ensure images are parsed (JSONB can sometimes come back as string)
    const parsedSessions = sessions.map((s: any) => ({
      ...s,
      images: typeof s.images === 'string' ? JSON.parse(s.images) : (s.images || []),
      questionnaire: typeof s.questionnaire === 'string' ? JSON.parse(s.questionnaire) : (s.questionnaire || {}),
    }));
    
    return NextResponse.json({
      sessions: parsedSessions,
      total: totalCount,
      limit,
      offset
    });
  } catch (error) {
    console.error('Admin sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions', details: String(error) }, { status: 500 });
  }
}
