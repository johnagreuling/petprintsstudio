import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import axios from 'axios'
import { PRODUCTS } from '@/lib/config'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
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

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as any

  try {
    await fulfillOrder(session)
  } catch (err) {
    console.error('Fulfillment error for session', session.id, err)
    // Don't return error — payment captured. Alert yourself here in production.
  }

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

  // Primary product
  const primaryProduct = PRODUCTS.find(p => p.id === meta.primaryProductId)
  if (primaryProduct) {
    lineItems.push({
      print_provider_id: 1,
      blueprint_id: primaryProduct.printifyBlueprintId,
      variant_id: primaryProduct.printifyVariantId,
      print_areas: {
        front: [{ src: meta.imageUrl, scale: 1, x: 0.5, y: 0.5, angle: 0 }],
      },
      quantity: 1,
    })
  }

  // Extra products
  if (meta.extraProductIds) {
    for (const id of meta.extraProductIds.split(',').filter(Boolean)) {
      const p = PRODUCTS.find(x => x.id === id)
      if (p) {
        lineItems.push({
          print_provider_id: 1,
          blueprint_id: p.printifyBlueprintId,
          variant_id: p.printifyVariantId,
          print_areas: {
            front: [{ src: meta.imageUrl, scale: 1, x: 0.5, y: 0.5, angle: 0 }],
          },
          quantity: 1,
        })
      }
    }
  }

  if (!lineItems.length) {
    console.log('No physical products to fulfill for session', session.id)
    return
  }

  // Create Printify order
  const order = await axios.post(
    `${'https://api.printify.com/v1'}/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
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

  // Auto-submit to production
  await axios.post(
    `${'https://api.printify.com/v1'}/shops/${process.env.PRINTIFY_SHOP_ID}/orders/${order.data.id}/send_to_production.json`,
    {},
    { headers }
  )

  console.log(`✅ Printify order ${order.data.id} created & submitted for ${session.id}`)
}
