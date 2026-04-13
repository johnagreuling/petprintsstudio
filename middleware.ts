import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect /admin routes (but not /api/admin which handles its own auth)
  if (pathname.startsWith('/admin')) {
    // Check for auth cookie
    const authCookie = request.cookies.get('pps_admin_auth');
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // If no password set in env, allow access (dev mode)
    if (!adminPassword) {
      return NextResponse.next();
    }
    
    // Check if authenticated
    if (authCookie?.value === adminPassword) {
      return NextResponse.next();
    }
    
    // Check for password in query string (for initial login)
    const passwordParam = request.nextUrl.searchParams.get('password');
    if (passwordParam === adminPassword) {
      // Set auth cookie and redirect to clean URL
      const response = NextResponse.redirect(new URL(pathname, request.url));
      response.cookies.set('pps_admin_auth', adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return response;
    }
    
    // Not authenticated - show login page
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login — Pet Prints Studio</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: system-ui, -apple-system, sans-serif;
            background: #000;
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 12px;
            padding: 32px;
            width: 100%;
            max-width: 400px;
          }
          .logo { font-size: 48px; text-align: center; margin-bottom: 16px; }
          h1 { font-size: 24px; text-align: center; margin-bottom: 8px; }
          p { color: #71717a; text-align: center; margin-bottom: 24px; }
          input {
            width: 100%;
            padding: 12px 16px;
            background: #09090b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fff;
            font-size: 16px;
            margin-bottom: 16px;
          }
          input:focus { outline: none; border-color: #d4af37; }
          button {
            width: 100%;
            padding: 12px 16px;
            background: #d4af37;
            color: #000;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          }
          button:hover { background: #c4a030; }
          .error { color: #ef4444; text-align: center; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🐾</div>
          <h1>Admin Login</h1>
          <p>Enter password to access the dashboard</p>
          <form method="GET">
            <input type="password" name="password" placeholder="Password" autofocus required />
            <button type="submit">Login</button>
          </form>
        </div>
      </body>
      </html>`,
      {
        status: 401,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
