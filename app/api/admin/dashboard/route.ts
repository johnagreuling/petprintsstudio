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

export async function GET(request: Request) {
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
          return NextResponse.json(await searchSessions({ limit: 10 }));
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
      recentSessions,
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
        recentSessions,
      },
      meta: {
        days,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
