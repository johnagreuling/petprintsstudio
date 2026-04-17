import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import axios from 'axios'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PRODUCTS } from '@/lib/config'
import { createOrder, updateOrderStatus } from '@/lib/db'
import { upscaleForPrint } from '@/lib/upscale'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const stripe = getStripe()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`📥 Stripe webhook received: ${event.type}`)

  if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true })

  const session = event.data.object as any
  try { 
    await fulfillOrder(session, stripe) 
  } catch (err) { 
    console.error('Fulfillment error for session', session.id, err) 
  }

  return NextResponse.json({ received: true })
}

async function fulfillOrder(session: any, stripe: Stripe) {
  const meta = session.metadata!
  const shipping = session.shipping_details
  const customer = session.customer_details!

  console.log(`\n════════════════════════════════════════`)
  console.log(`🛒 FULFILLING ORDER: ${session.id}`)
  console.log(`   Pet: ${meta.petName || 'Unknown'}`)
  console.log(`   Style: ${meta.styleName}`)
  console.log(`   Memory: ${meta.isMemory}`)
  console.log(`   Customer: ${customer.email}`)
  console.log(`════════════════════════════════════════\n`)

  // Get full line items from Stripe for accurate pricing
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  const totalCents = session.amount_total || lineItems.data.reduce((sum: number, item: any) => sum + (item.amount_total || 0), 0)

  // Record order in database
  let orderId: number | null = null
  try {
    const primaryProduct = PRODUCTS.find(p => p.id === meta.primaryProductId)
    orderId = await createOrder({
      sessionId: meta.sessionFolder || session.id,
      customerEmail: customer.email || '',
      customerName: customer.name || shipping?.name || '',
      productType: primaryProduct?.category || 'Canvas',
      productName: `${meta.petName || 'Pet'} ${meta.styleName} - ${primaryProduct?.name || 'Portrait'} ${primaryProduct?.size || ''}`,
      quantity: 1,
      subtotalCents: totalCents,
      stripePaymentId: session.payment_intent as string | undefined,
    })
    if (orderId) {
      await updateOrderStatus(orderId, 'paid')
      console.log(`✅ Order #${orderId} recorded in database`)
    }
  } catch (err) {
    console.error('Failed to record order in database:', err)
  }

  // Build shipping address
  const address = shipping ? {
    first_name: (shipping.name || customer.name || 'Customer').split(' ')[0],
    last_name:  (shipping.name || customer.name || '').split(' ').slice(1).join(' ') || ' ',
    email:    customer.email || '',
    phone:    customer.phone || '',
    country:  shipping.address?.country || 'US',
    region:   shipping.address?.state || '',
    address1: shipping.address?.line1 || '',
    address2: shipping.address?.line2 || '',
    city:     shipping.address?.city || '',
    zip:      shipping.address?.postal_code || '',
  } : null

  const headers = {
    Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  // Get accessible image URL (presign if needed)
  let accessibleImageUrl = meta.imageUrl
  if (meta.imageUrl?.includes('r2.dev')) {
    try {
      const r2 = new S3Client({ 
        region: 'auto', 
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, 
        credentials: { 
          accessKeyId: process.env.R2_ACCESS_KEY_ID!, 
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! 
        } 
      })
      const r2Base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || ''
      const imageKey = meta.imageUrl.replace(r2Base + '/', '')
      accessibleImageUrl = await getSignedUrl(r2, new GetObjectCommand({ 
        Bucket: process.env.R2_BUCKET_NAME!, 
        Key: imageKey 
      }), { expiresIn: 7 * 24 * 3600 }) // 7 days for Printify to process
      console.log(`🔗 Presigned image URL generated`)
    } catch (err) {
      console.error('Failed to presign image URL:', err)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRINT UPSCALE (fal.ai Clarity)
  // Upscale the selected portrait to print-grade resolution before
  // handing it to Printify. Fails gracefully: if upscale errors, we
  // continue with the original URL so the order never blocks.
  // ─────────────────────────────────────────────────────────────────
  try {
    const upscaleResult = await upscaleForPrint(accessibleImageUrl, meta.sessionFolder)
    if (upscaleResult.upscaled) {
      accessibleImageUrl = upscaleResult.url
      console.log(`🖼️  Print upscale succeeded in ${upscaleResult.durationMs}ms`)
    } else {
      console.warn(`⚠️  Print upscale failed — proceeding with original. ${upscaleResult.error}`)
    }
  } catch (err) {
    console.error('Upscale block error (continuing with original):', err)
  }

  // Build Printify line items
  const printifyLineItems: any[] = []

  const primaryProduct = PRODUCTS.find(p => p.id === meta.primaryProductId)
  if (primaryProduct && address) {
    printifyLineItems.push({
      print_provider_id: primaryProduct.printifyProviderId || 1,
      blueprint_id: primaryProduct.printifyBlueprintId,
      variant_id: Number(primaryProduct.printifyVariantId),
      print_areas: { front: accessibleImageUrl },
      quantity: 1,
    })
  }

  if (meta.extraProductIds) {
    for (const id of meta.extraProductIds.split(',').filter(Boolean)) {
      const p = PRODUCTS.find(x => x.id === id)
      if (p) {
        printifyLineItems.push({
          print_provider_id: p.printifyProviderId || 1,
          blueprint_id: p.printifyBlueprintId,
          variant_id: p.printifyVariantId,
          print_areas: { front: accessibleImageUrl },
          quantity: 1,
        })
      }
    }
  }

  // Create Printify order
  let printifyOrderId: string | null = null
  if (printifyLineItems.length && address) {
    try {
      const orderPayload = {
        external_id: session.id,
        label: `Pet Prints Studio — ${meta.petName || 'Pet'} — ${meta.styleName}`,
        line_items: printifyLineItems,
        shipping_method: 1,
        send_shipping_notification: true,
        address_to: address,
      }
      console.log('📦 Creating Printify order:', JSON.stringify(orderPayload, null, 2))

      const order = await axios.post(
        `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
        orderPayload,
        { headers }
      )
      printifyOrderId = order.data.id
      console.log(`✅ Printify order created: ${printifyOrderId}`)

      // Send to production
      await axios.post(
        `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders/${printifyOrderId}/send_to_production.json`, 
        {}, 
        { headers }
      )
      console.log(`🚀 Printify order sent to production`)

      // Update order status in DB
      if (orderId) {
        await updateOrderStatus(orderId, 'processing', printifyOrderId || undefined)
      }
    } catch (err: any) {
      console.error('Printify order creation failed:', err.response?.data || err.message)
    }
  } else {
    console.log('ℹ️ No physical products to fulfill (digital only or missing address)')
  }

  // Send admin notification email
  await sendAdminNotification({
    sessionId: session.id,
    petName: meta.petName || 'Unknown',
    styleName: meta.styleName,
    customerEmail: customer.email || '',
    customerName: customer.name || '',
    totalCents,
    imageUrl: meta.imageUrl,
    isMemory: meta.isMemory === 'true',
    wantSong: meta.wantSong === 'true',
    printifyOrderId,
  })

  // Send customer digital download email
  const wantDigital = meta.wantBundle === 'true' || meta.wantAllImages === 'true'
  if (wantDigital && customer.email) {
    try {
      await sendDigitalDownloadEmail({ 
        email: customer.email, 
        name: customer.name || 'there', 
        petName: meta.petName || 'your pet', 
        imageUrl: accessibleImageUrl, 
        sessionFolder: meta.sessionFolder || '', 
        wantAllImages: meta.wantAllImages === 'true' 
      })
      console.log(`📧 Digital download email sent to ${customer.email}`)
    } catch(e) { 
      console.error('Digital email failed:', e) 
    }
  }

  // Send customer order confirmation email
  if (customer.email) {
    await sendOrderConfirmationEmail({
      email: customer.email,
      name: customer.name || 'there',
      petName: meta.petName || 'your pet',
      styleName: meta.styleName,
      imageUrl: meta.imageUrl,
      totalCents,
    })
  }

  console.log(`\n✅ ORDER FULFILLMENT COMPLETE: ${session.id}\n`)
}

async function sendAdminNotification(data: {
  sessionId: string
  petName: string
  styleName: string
  customerEmail: string
  customerName: string
  totalCents: number
  imageUrl: string
  isMemory: boolean
  wantSong: boolean
  printifyOrderId: string | null
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'johnagreuling@icloud.com'
  
  if (!RESEND_KEY) {
    console.log('No RESEND_API_KEY — skipping admin notification')
    return
  }

  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif;margin:0;padding:0">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="background:#141414;border:1px solid rgba(201,168,76,.3);padding:32px;margin-bottom:20px">
    <div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#22c55e;margin-bottom:12px">💰 NEW ORDER RECEIVED</div>
    <h1 style="font-size:28px;font-weight:400;color:#F5F0E8;margin:0 0 8px">${data.petName}'s Portrait</h1>
    <p style="color:rgba(245,240,232,.5);font-size:14px;margin:0 0 24px">${data.styleName}</p>
    
    <div style="display:grid;gap:12px;margin-bottom:24px">
      <div style="background:#0A0A0A;padding:12px 16px;border:1px solid rgba(245,240,232,.08)">
        <div style="font-size:10px;color:#C9A84C;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px">Customer</div>
        <div style="font-size:14px">${data.customerName}</div>
        <div style="font-size:12px;color:rgba(245,240,232,.5)">${data.customerEmail}</div>
      </div>
      <div style="background:#0A0A0A;padding:12px 16px;border:1px solid rgba(245,240,232,.08)">
        <div style="font-size:10px;color:#C9A84C;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px">Order Total</div>
        <div style="font-size:20px;color:#22c55e;font-weight:600">$${(data.totalCents / 100).toFixed(2)}</div>
      </div>
      ${data.isMemory ? `<div style="background:rgba(201,168,76,.1);padding:12px 16px;border:1px solid rgba(201,168,76,.3)">
        <div style="font-size:12px;color:#C9A84C">✨ MEMORY PORTRAIT — Review questionnaire answers</div>
      </div>` : ''}
      ${data.wantSong ? `<div style="background:rgba(168,85,247,.1);padding:12px 16px;border:1px solid rgba(168,85,247,.3)">
        <div style="font-size:12px;color:#a855f7">🎵 SONG REQUESTED — Generate Suno prompt</div>
      </div>` : ''}
      ${data.printifyOrderId ? `<div style="background:#0A0A0A;padding:12px 16px;border:1px solid rgba(245,240,232,.08)">
        <div style="font-size:10px;color:#C9A84C;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px">Printify Order</div>
        <div style="font-size:14px">${data.printifyOrderId}</div>
      </div>` : ''}
    </div>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none">→ Open Admin Dashboard</a>
  </div>
  <div style="font-size:11px;color:rgba(245,240,232,.2);text-align:center">Session: ${data.sessionId}</div>
</div></body></html>`

  try {
    await axios.post('https://api.resend.com/emails', {
      from: process.env.RESEND_FROM_EMAIL || 'Pet Prints Studio <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      subject: `💰 New Order: ${data.petName} — $${(data.totalCents / 100).toFixed(2)}`,
      html,
    }, { headers: { Authorization: `Bearer ${RESEND_KEY}` } })
    console.log(`📧 Admin notification sent to ${ADMIN_EMAIL}`)
  } catch (err) {
    console.error('Admin notification email failed:', err)
  }
}

async function sendOrderConfirmationEmail(data: {
  email: string
  name: string
  petName: string
  styleName: string
  imageUrl: string
  totalCents: number
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return

  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif;margin:0;padding:0">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-size:32px">🐾</div>
    <div style="font-size:22px;margin-top:8px">Pet Prints Studio</div>
  </div>
  <div style="background:#141414;border:1px solid rgba(245,240,232,.08);padding:32px;margin-bottom:24px">
    <div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">Order Confirmed</div>
    <h1 style="font-size:26px;font-weight:400;color:#F5F0E8;margin:0 0 16px">Hi ${data.name}!</h1>
    <p style="color:rgba(245,240,232,.6);font-size:15px;line-height:1.8;margin:0 0 24px">
      Thank you for your order! <strong style="color:#F5F0E8">${data.petName}'s ${data.styleName}</strong> portrait is now in production.
    </p>
    <div style="background:#0A0A0A;padding:16px;border:1px solid rgba(245,240,232,.08);margin-bottom:16px">
      <div style="font-size:10px;color:#C9A84C;letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px">What's Next</div>
      <div style="font-size:14px;line-height:1.8;color:rgba(245,240,232,.7)">
        📦 Your print ships in <strong style="color:#F5F0E8">5–7 business days</strong><br/>
        📧 You'll receive tracking info when it ships
      </div>
    </div>
    <div style="font-size:20px;color:#C9A84C;font-weight:600;text-align:center;margin-top:24px">
      Order Total: $${(data.totalCents / 100).toFixed(2)}
    </div>
  </div>
  <div style="text-align:center;color:rgba(245,240,232,.3);font-size:11px">
    <p>Questions? Reply to this email or visit petprintsstudio.com</p>
    <p>© Pet Prints Studio</p>
  </div>
</div></body></html>`

  try {
    await axios.post('https://api.resend.com/emails', {
      from: process.env.RESEND_FROM_EMAIL || 'Pet Prints Studio <onboarding@resend.dev>',
      to: data.email,
      subject: `🎨 Order Confirmed — ${data.petName}'s Portrait`,
      html,
    }, { headers: { Authorization: `Bearer ${RESEND_KEY}` } })
    console.log(`📧 Order confirmation sent to ${data.email}`)
  } catch (err) {
    console.error('Order confirmation email failed:', err)
  }
}

async function sendDigitalDownloadEmail({ email, name, petName, imageUrl, sessionFolder, wantAllImages }: { 
  email: string
  name: string
  petName: string
  imageUrl: string
  sessionFolder: string
  wantAllImages: boolean 
}) {
  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif;margin:0;padding:0">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-size:32px">🐾</div>
    <div style="font-size:22px;margin-top:8px">Pet Prints Studio</div>
  </div>
  <div style="background:#141414;border:1px solid rgba(245,240,232,.08);padding:32px;margin-bottom:24px">
    <div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">Digital Download Ready</div>
    <h1 style="font-size:26px;font-weight:400;color:#F5F0E8;margin:0 0 16px">Hi ${name}!</h1>
    <p style="color:rgba(245,240,232,.6);font-size:15px;line-height:1.8;margin:0 0 24px">
      Your portrait of <strong style="color:#F5F0E8">${petName}</strong> is ready — full resolution, no watermark.
    </p>
    <a href="${imageUrl}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:16px 32px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none">↓ DOWNLOAD YOUR PORTRAIT</a>
    <p style="color:rgba(245,240,232,.3);font-size:11px;margin:16px 0 0">Link expires in 72 hours.</p>
  </div>
  <div style="text-align:center;color:rgba(245,240,232,.3);font-size:11px">
    <p>© Pet Prints Studio · petprintsstudio.com</p>
  </div>
</div></body></html>`

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) { 
    console.log('No RESEND_API_KEY — would send to:', email)
    return 
  }
  
  await axios.post('https://api.resend.com/emails', { 
    from: process.env.RESEND_FROM_EMAIL || 'Pet Prints Studio <onboarding@resend.dev>', 
    to: email, 
    subject: `Your ${petName} Portrait is Ready 🐾`, 
    html 
  }, { headers: { Authorization: `Bearer ${RESEND_KEY}` } })
}
