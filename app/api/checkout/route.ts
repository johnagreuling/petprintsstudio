import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { DIGITAL_BUNDLE_PRICE, MEMORY_UPGRADE_PRICE } from '@/lib/config'

// Initialize lazily so missing key doesn't crash build
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const { imageUrl, primaryProduct, primarySize, extras, wantBundle, wantAllImages, wantSong, styleName, petName, isMemory, sessionFolder } = await req.json()

    const petLabel = petName ? `${petName}'s` : 'Your Pet'
    const lineItems: any[] = []

    // Primary product
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${petLabel} ${styleName} Portrait — ${primaryProduct.name} ${primaryProduct.size}${primarySize ? ` (${primarySize})` : ''}`,
          description: `AI-generated ${styleName.toLowerCase()} pet portrait, printed on ${primaryProduct.description}`,
          images: [imageUrl],
          metadata: {
            productId: primaryProduct.id,
            size: primaryProduct.size,
            variantId: String(primaryProduct.printifyVariantId),
            blueprintId: String(primaryProduct.printifyBlueprintId),
            imageUrl,
            appSize: primarySize || '',
          },
        },
        unit_amount: Math.round(primaryProduct.price * 100),
      },
      quantity: 1,
    })

    // Memory upgrade
    if (isMemory) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Memory Portrait Upgrade', description: 'Custom scene with personal easter eggs, human-reviewed' },
          unit_amount: Math.round(MEMORY_UPGRADE_PRICE * 100),
        },
        quantity: 1,
      })
    }

    // Digital bundle
    if (wantBundle) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'All 32 Digital Portrait Files', description: 'High-resolution digital files of all 32 generated portraits' },
          unit_amount: Math.round(DIGITAL_BUNDLE_PRICE * 100),
        },
        quantity: 1,
      })
    }

    // All 32 portrait digital files
    if (wantAllImages) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `All 32 Portrait Files — ${petLabel} Session`, description: 'Every one of the 32 AI-generated portraits in full resolution. Delivered digitally.' },
          unit_amount: 2999,
        },
        quantity: 1,
      })
    }

    // Custom pet song
    if (wantSong) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `Custom Song for ${petLabel} Pet`, description: 'A one-of-a-kind AI-composed song written for your pet using their memory portrait details. Delivered as MP3.' },
          unit_amount: 1900,
        },
        quantity: 1,
      })
    }

    // Extra products
    for (const extra of (extras || [])) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${petLabel} Portrait — ${extra.name} ${extra.size}`,
            description: extra.description,
            images: [imageUrl],
            metadata: {
              productId: extra.id,
              variantId: String(extra.printifyVariantId),
              blueprintId: String(extra.printifyBlueprintId),
              imageUrl,
            },
          },
          unit_amount: Math.round(extra.price * 100),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'ES', 'IT', 'JP', 'NZ'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Standard Shipping (5–7 business days)',
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1499, currency: 'usd' },
            display_name: 'Express Shipping (2–4 business days)',
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
      metadata: {
        imageUrl,
        petName: petName || '',
        styleName,
        primaryProductId: primaryProduct.id,
        isMemory: String(isMemory),
        wantBundle: String(wantBundle),
        wantAllImages: String(wantAllImages),
        wantSong: String(wantSong),
        sessionFolder: sessionFolder || '',
        extraProductIds: (extras || []).map((e: any) => e.id).join(','),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
