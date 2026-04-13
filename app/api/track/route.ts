import { NextResponse } from 'next/server';
import { logPageView } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const body = await request.json();
    
    // Get visitor info from headers (Vercel provides geo data)
    const country = headersList.get('x-vercel-ip-country') || undefined;
    const city = headersList.get('x-vercel-ip-city') || undefined;
    const region = headersList.get('x-vercel-ip-country-region') || undefined;
    const userAgent = headersList.get('user-agent') || undefined;
    
    // Generate or use existing visitor ID (passed from client)
    const visitorId = body.visitorId || crypto.randomUUID();
    
    await logPageView({
      path: body.path || '/',
      referrer: body.referrer || undefined,
      userAgent,
      country,
      city,
      region,
      visitorId,
    });
    
    return NextResponse.json({ success: true, visitorId });
  } catch (error) {
    console.error('Track API error:', error);
    // Don't fail silently - but also don't break the user experience
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

// Also support GET for simple beacon tracking
export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const { searchParams } = new URL(request.url);
    
    const country = headersList.get('x-vercel-ip-country') || undefined;
    const city = headersList.get('x-vercel-ip-city') || undefined;
    const region = headersList.get('x-vercel-ip-country-region') || undefined;
    const userAgent = headersList.get('user-agent') || undefined;
    
    const visitorId = searchParams.get('v') || crypto.randomUUID();
    
    await logPageView({
      path: searchParams.get('p') || '/',
      referrer: searchParams.get('r') || undefined,
      userAgent,
      country,
      city,
      region,
      visitorId,
    });
    
    // Return a 1x1 transparent GIF for beacon tracking
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(gif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Track beacon error:', error);
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(gif, {
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}
