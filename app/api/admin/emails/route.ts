import { NextRequest, NextResponse } from 'next/server';

// Resend API for fetching sent emails
const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface ResendEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  last_event: string;
}

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get('password');
  
  if (password !== 'mason2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
  }
  
  try {
    // Fetch recent emails from Resend API
    const response = await fetch('https://api.resend.com/emails', {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch emails',
        details: errorText 
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Format the emails for display
    const emails = (data.data || []).map((email: ResendEmail) => ({
      id: email.id,
      from: email.from,
      to: Array.isArray(email.to) ? email.to.join(', ') : email.to,
      subject: email.subject,
      createdAt: email.created_at,
      status: email.last_event || 'sent',
    }));
    
    return NextResponse.json({ 
      emails,
      total: emails.length,
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
