import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import axios from 'axios'

/**
 * Printify Webhook Handler
 * 
 * Handles order status updates from Printify:
 * - order:created
 * - order:sent-to-production
 * - order:shipment:created (most important - has tracking)
 * - order:shipment:delivered
 * - order:canceled
 * 
 * Setup: In Printify dashboard, add webhook URL:
 * https://petprintsstudio.com/api/webhooks/printify
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log(`\n📦 Printify webhook received:`, body.type || 'unknown')
    console.log(JSON.stringify(body, null, 2))

    const { type, resource } = body

    switch (type) {
      case 'order:created':
        await handleOrderCreated(resource)
        break
      case 'order:sent-to-production':
        await handleSentToProduction(resource)
        break
      case 'order:shipment:created':
        await handleShipmentCreated(resource)
        break
      case 'order:shipment:delivered':
        await handleDelivered(resource)
        break
      case 'order:canceled':
        await handleCanceled(resource)
        break
      default:
        console.log(`ℹ️ Unhandled Printify event type: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Printify webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleOrderCreated(resource: any) {
  console.log(`✅ Printify order created: ${resource.id}`)
  // Order already recorded when we created it, but we can update metadata if needed
}

async function handleSentToProduction(resource: any) {
  console.log(`🏭 Order sent to production: ${resource.id}`)
  
  await sql`
    UPDATE orders 
    SET status = 'processing', updated_at = NOW()
    WHERE printify_order_id = ${resource.id}
  `
}

async function handleShipmentCreated(resource: any) {
  const { id, shipments } = resource
  
  console.log(`📦 Shipment created for order ${id}`)
  
  // Update order status
  await sql`
    UPDATE orders 
    SET status = 'shipped', updated_at = NOW()
    WHERE printify_order_id = ${id}
  `
  
  // Get customer email from our database
  const orderResult = await sql`
    SELECT customer_email, customer_name, product_name 
    FROM orders 
    WHERE printify_order_id = ${id}
    LIMIT 1
  `
  
  if (orderResult.rows.length === 0) {
    console.log(`⚠️ No order found for Printify ID: ${id}`)
    return
  }
  
  const order = orderResult.rows[0]
  
  // Send shipping notification to customer
  if (order.customer_email && shipments?.length > 0) {
    const shipment = shipments[0]
    await sendShippingNotification({
      email: order.customer_email,
      name: order.customer_name || 'there',
      productName: order.product_name || 'Your Portrait',
      carrier: shipment.carrier || 'Carrier',
      trackingNumber: shipment.tracking_number || '',
      trackingUrl: shipment.tracking_url || '',
    })
  }
}

async function handleDelivered(resource: any) {
  console.log(`✅ Order delivered: ${resource.id}`)
  
  await sql`
    UPDATE orders 
    SET status = 'fulfilled', updated_at = NOW()
    WHERE printify_order_id = ${resource.id}
  `
}

async function handleCanceled(resource: any) {
  console.log(`❌ Order canceled: ${resource.id}`)
  
  await sql`
    UPDATE orders 
    SET status = 'cancelled', updated_at = NOW()
    WHERE printify_order_id = ${resource.id}
  `
  
  // TODO: Trigger refund in Stripe if needed
}

async function sendShippingNotification(data: {
  email: string
  name: string
  productName: string
  carrier: string
  trackingNumber: string
  trackingUrl: string
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) {
    console.log('No RESEND_API_KEY — skipping shipping notification')
    return
  }

  const trackingLink = data.trackingUrl || `https://www.google.com/search?q=${data.carrier}+tracking+${data.trackingNumber}`

  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif;margin:0;padding:0">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-size:32px">🐾</div>
    <div style="font-size:22px;margin-top:8px">Pet Prints Studio</div>
  </div>
  <div style="background:#141414;border:1px solid rgba(245,240,232,.08);padding:32px;margin-bottom:24px">
    <div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#22c55e;margin-bottom:12px">📦 YOUR ORDER HAS SHIPPED!</div>
    <h1 style="font-size:26px;font-weight:400;color:#F5F0E8;margin:0 0 16px">Hi ${data.name}!</h1>
    <p style="color:rgba(245,240,232,.6);font-size:15px;line-height:1.8;margin:0 0 24px">
      Great news! <strong style="color:#F5F0E8">${data.productName}</strong> is on its way to you.
    </p>
    
    <div style="background:#0A0A0A;padding:16px;border:1px solid rgba(245,240,232,.08);margin-bottom:24px">
      <div style="font-size:10px;color:#C9A84C;letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px">Tracking Info</div>
      <div style="font-size:14px;margin-bottom:4px"><strong>Carrier:</strong> ${data.carrier}</div>
      ${data.trackingNumber ? `<div style="font-size:14px"><strong>Tracking #:</strong> ${data.trackingNumber}</div>` : ''}
    </div>
    
    <a href="${trackingLink}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:16px 32px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none">📍 TRACK YOUR PACKAGE</a>
  </div>
  <div style="text-align:center;color:rgba(245,240,232,.3);font-size:11px">
    <p>© Pet Prints Studio · petprintsstudio.com</p>
  </div>
</div></body></html>`

  try {
    await axios.post('https://api.resend.com/emails', {
      from: 'Pet Prints Studio <orders@petprintsstudio.com>',
      to: data.email,
      subject: `📦 Your Portrait Has Shipped!`,
      html,
    }, { headers: { Authorization: `Bearer ${RESEND_KEY}` } })
    console.log(`📧 Shipping notification sent to ${data.email}`)
  } catch (err) {
    console.error('Shipping notification email failed:', err)
  }
}

// GET handler for webhook verification (Printify sends a GET to verify)
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Printify webhook endpoint active' })
}
