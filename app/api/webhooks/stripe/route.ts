import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import axios from 'axios'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PRODUCTS } from '@/lib/config'

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
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true })

  const session = event.data.object as any
  try { await fulfillOrder(session) }
  catch (err) { console.error('Fulfillment error for session', session.id, err) }

  return NextResponse.json({ received: true })
}

async function fulfillOrder(session: any) {
  const meta = session.metadata!
  const shipping = session.shipping_details!
  const customer = session.customer_details!

  const address = {
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
  }

  const headers = {
    Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  const lineItems: any[] = []

  const primaryProduct = PRODUCTS.find(p => p.id === meta.primaryProductId)
  if (primaryProduct) {
    lineItems.push({
      print_provider_id: primaryProduct.printifyProviderId || 1,
      blueprint_id: primaryProduct.printifyBlueprintId,
      variant_id: Number(meta.variantId || primaryProduct.printifyVariantId),
      print_areas: { front: [{ src: meta.imageUrl, scale: 1, x: 0.5, y: 0.5, angle: 0 }] },
      quantity: 1,
    })
  }

  if (meta.extraProductIds) {
    for (const id of meta.extraProductIds.split(',').filter(Boolean)) {
      const p = PRODUCTS.find(x => x.id === id)
      if (p) lineItems.push({
        print_provider_id: p.printifyProviderId || 1,
        blueprint_id: p.printifyBlueprintId,
        variant_id: p.printifyVariantId,
        print_areas: { front: [{ src: meta.imageUrl, scale: 1, x: 0.5, y: 0.5, angle: 0 }] },
        quantity: 1,
      })
    }
  }

  if (!lineItems.length) {
    console.log('No physical products to fulfill for session', session.id)
  } else {
    const order = await axios.post(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
      {
        external_id: session.id,
        label: `Pet Prints Studio — ${meta.petName || 'Pet'} — ${meta.styleName}`,
        line_items: lineItems,
        shipping_method: 1,
        send_shipping_notification: true,
        address_to: address,
      },
      { headers }
    )
    await axios.post(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders/${order.data.id}/send_to_production.json`, {}, { headers })
    console.log(`✅ Printify order ${order.data.id} created & submitted for ${session.id}`)
  }

  // Digital delivery
  const wantDigital = meta.wantBundle === 'true' || meta.wantAllImages === 'true'
  if (wantDigital && customer.email) {
    try {
      await sendDigitalDownloadEmail({ email: customer.email, name: customer.name || 'there', petName: meta.petName || 'your pet', imageUrl: meta.imageUrl, sessionFolder: meta.sessionFolder || '', wantAllImages: meta.wantAllImages === 'true' })
      console.log(`📧 Digital download email sent to ${customer.email}`)
    } catch(e) { console.error('Digital email failed:', e) }
  }
}

async function sendDigitalDownloadEmail({ email, name, petName, imageUrl, sessionFolder, wantAllImages }: { email: string; name: string; petName: string; imageUrl: string; sessionFolder: string; wantAllImages: boolean }) {
  const r2 = new S3Client({ region: 'auto', endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! } })
  const r2Base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || ''
  const imageKey = imageUrl.replace(r2Base + '/', '')
  const signedUrl = await getSignedUrl(r2, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: imageKey }), { expiresIn: 72 * 3600 })

  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;padding:40px 24px"><div style="text-align:center;margin-bottom:32px"><div style="font-size:32px">🐾</div><div style="font-size:22px;margin-top:8px">Pet Prints Studio</div></div><div style="background:#141414;border:1px solid rgba(245,240,232,.08);padding:32px;margin-bottom:24px"><div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">Digital Download Ready</div><h1 style="font-size:26px;font-weight:400;color:#F5F0E8;margin:0 0 16px">Hi ${name}!</h1><p style="color:rgba(245,240,232,.6);font-size:15px;line-height:1.8;margin:0 0 24px">Your portrait of <strong style="color:#F5F0E8">${petName}</strong> is ready — full resolution, no watermark.</p><a href="${signedUrl}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:16px 32px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none">↓ DOWNLOAD YOUR PORTRAIT</a><p style="color:rgba(245,240,232,.3);font-size:11px;margin:16px 0 0">Link expires in 72 hours.</p></div><div style="background:#141414;border:1px solid rgba(245,240,232,.08);padding:24px;margin-bottom:24px"><div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px">Your Print Order</div><p style="color:rgba(245,240,232,.6);font-size:14px;line-height:1.8;margin:0">Your print is in production and ships within 5–7 business days.</p></div><div style="text-align:center;color:rgba(245,240,232,.3);font-size:11px"><p>© Pet Prints Studio · petprintsstudio.com</p></div></div></body></html>`

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) { console.log('No RESEND_API_KEY — would send to:', email, 'URL:', signedUrl.slice(0,80)); return }
  await axios.post('https://api.resend.com/emails', { from: 'Pet Prints Studio <orders@petprintsstudio.com>', to: email, subject: `Your ${petName} Portrait is Ready 🐾`, html }, { headers: { Authorization: `Bearer ${RESEND_KEY}` } })
}
