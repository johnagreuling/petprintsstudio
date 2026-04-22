import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

interface OrderEmail {
  id: number;
  customer_email: string;
  customer_name: string;
  status: string;
  created_at: string;
  product_name: string;
}

interface SessionEmail {
  session_id: string;
  customer_email: string | null;
  pet_name: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  const password = request.nextUrl.searchParams.get('password');
  
  if (password !== 'mason2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Fetch orders with customer emails
    const ordersResult = await sql`
      SELECT id, customer_email, customer_name, status, created_at, product_name
      FROM orders
      WHERE customer_email IS NOT NULL AND customer_email != ''
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const orders = ordersResult.rows as OrderEmail[];
    
    // Fetch sessions with customer emails (from direct orders)
    const sessionsResult = await sql`
      SELECT session_id, customer_email, pet_name, created_at
      FROM sessions
      WHERE customer_email IS NOT NULL AND customer_email != ''
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const sessions = sessionsResult.rows as SessionEmail[];
    
    // Combine and format as emails
    const orderEmails = orders.map((order) => ({
      id: `order-${order.id}`,
      type: 'order',
      to: order.customer_email,
      subject: `Your Pet Portrait Order - ${order.product_name}`,
      createdAt: order.created_at,
      status: order.status === 'shipped' ? 'delivered' : order.status === 'paid' ? 'sent' : order.status,
      customerName: order.customer_name,
    }));
    
    const sessionEmails = sessions.map((session) => ({
      id: `session-${session.session_id}`,
      type: 'direct_order',
      to: session.customer_email,
      subject: `Your Pet Portrait for ${session.pet_name || 'Your Pet'}`,
      createdAt: session.created_at,
      status: 'sent',
      customerName: null,
    }));
    
    // Merge and sort by date
    const allEmails = [...orderEmails, ...sessionEmails]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
    
    // Calculate stats
    const stats = {
      total: allEmails.length,
      orders: orderEmails.length,
      directOrders: sessionEmails.length,
    };
    
    return NextResponse.json({ 
      emails: allEmails,
      stats,
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
