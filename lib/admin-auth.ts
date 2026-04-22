import { NextResponse } from 'next/server';

export async function requireAdminAuth(request: Request): Promise<NextResponse | null> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return null;

  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  if (cookies.pps_admin_auth === adminPassword) return null;
  if (request.headers.get('x-admin-auth') === adminPassword) return null;

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
