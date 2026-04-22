import { NextResponse } from 'next/server';
import { 
  getDashboardStats, 
  getDailyApiSpend, 
  getDailyRevenue, 
  getDailyPageViews,
  getTopPages,
  getTopReferrers,
  getVisitorLocations,
  getApiUsageStats,
  getOrders,
  searchSessions
} from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

// Helper to parse JSONB fields that may come back as strings
function parseSessionImages(sessions: any[]) {
  return sessions.map((s: any) => ({
    ...s,
    images: typeof s.images === 'string' ? JSON.parse(s.images) : (s.images || []),
    questionnaire: typeof s.questionnaire === 'string' ? JSON.parse(s.questionnaire) : (s.questionnaire || {}),
  }));
}

export async function GET(request: Request) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const section = searchParams.get('section'); // Optional: get specific section only
    
    // If requesting specific section, return just that
    if (section) {
      switch (section) {
        case 'stats':
          return NextResponse.json(await getDashboardStats());
        case 'api-daily':
          return NextResponse.json(await getDailyApiSpend(days));
        case 'revenue-daily':
          return NextResponse.json(await getDailyRevenue(days));
        case 'traffic-daily':
          return NextResponse.json(await getDailyPageViews(days));
        case 'top-pages':
          return NextResponse.json(await getTopPages(days, 10));
        case 'referrers':
          return NextResponse.json(await getTopReferrers(days, 10));
        case 'locations':
          return NextResponse.json(await getVisitorLocations(days, 15));
        case 'api-breakdown':
          return NextResponse.json(await getApiUsageStats(days));
        case 'recent-orders':
          return NextResponse.json(await getOrders({ limit: 10 }));
        case 'recent-sessions':
          const sessions = await searchSessions({ limit: 10 });
          return NextResponse.json(parseSessionImages(sessions));
        default:
          return NextResponse.json({ error: 'Unknown section' }, { status: 400 });
      }
    }
    
    // Return full dashboard data
    const [
      stats,
      dailyApiSpend,
      dailyRevenue,
      dailyTraffic,
      topPages,
      referrers,
      locations,
      recentOrders,
      recentSessionsRaw,
    ] = await Promise.all([
      getDashboardStats(),
      getDailyApiSpend(days),
      getDailyRevenue(days),
      getDailyPageViews(days),
      getTopPages(days, 10),
      getTopReferrers(days, 10),
      getVisitorLocations(days, 15),
      getOrders({ limit: 10 }),
      searchSessions({ limit: 10 }),
    ]);
    
    return NextResponse.json({
      stats,
      charts: {
        dailyApiSpend,
        dailyRevenue,
        dailyTraffic,
      },
      tables: {
        topPages,
        referrers,
        locations,
        recentOrders,
        recentSessions: parseSessionImages(recentSessionsRaw),
      },
      meta: {
        days,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data', details: String(error) },
      { status: 500 }
    );
  }
}
