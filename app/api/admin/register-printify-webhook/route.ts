import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const password = request.nextUrl.searchParams.get('password');
  
  if (password !== 'mason2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
  const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

  if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
    return NextResponse.json({ 
      error: 'Missing PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID env vars' 
    }, { status: 500 });
  }

  const webhookUrl = 'https://petprintsstudio.com/api/webhooks/printify';
  
  // Webhook topics to register
  const topics = [
    'order:shipment:created',  // When order ships
    'order:shipment:delivered', // When order is delivered
  ];

  const results = [];

  for (const topic of topics) {
    try {
      const response = await fetch(
        `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/webhooks.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic,
            url: webhookUrl,
          }),
        }
      );

      const data = await response.json();
      results.push({
        topic,
        status: response.status,
        data,
      });
    } catch (error) {
      results.push({
        topic,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({
    message: 'Webhook registration attempted',
    webhookUrl,
    results,
  });
}

// GET to list existing webhooks
export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get('password');
  
  if (password !== 'mason2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
  const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

  if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
    return NextResponse.json({ 
      error: 'Missing PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID env vars' 
    }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/webhooks.json`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json({
      shopId: PRINTIFY_SHOP_ID,
      webhooks: data,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
