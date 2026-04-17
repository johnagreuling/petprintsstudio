import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRODUCTS } from '@/lib/config'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const {
      imageUrl,
      primaryProductId,           // NEW: product ID string instead of full object
      extras,                      // array of full product objects from client
      extraSizes,
      extraColors,
      styleName,
      petName,
      petType,
      songGenre,                   // NEW: chosen music genre
      songAnswers,                 // NEW: answers to song questionnaire
      sessionFolder,
    } = await req.json()

    // Look up primary product server-side from the id
    const primaryProduct = PRODUCTS.find(p => p.id === primaryProductId)
    if (!primaryProduct) {
      return NextResponse.json({ error: 'Invalid primary product id' }, { status: 400 })
    }

    const petLabel = petName ? `${petName}'s` : 'Your Pet'
    const lineItems: any[] = []

    // ── PRIMARY PORTRAIT PRODUCT ──
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${petLabel} ${styleName} Portrait — ${primaryProduct.name} ${primaryProduct.size}`,
          description: `AI-generated ${(styleName || '').toLowerCase()} pet portrait on ${primaryProduct.name.toLowerCase()}. Includes custom ${songGenre || 'custom'} song with QR code.`,
          images: [imageUrl],
          metadata: {
            productId: primaryProduct.id,
            size: primaryProduct.size,
            variantId: String(primaryProduct.printifyVariantId),
            blueprintId: String(primaryProduct.printifyBlueprintId),
            imageUrl,
          },
        },
        unit_amount: Math.round(primaryProduct.price * 100),
      },
      quantity: 1,
    })

    // ── CUSTOM SONG — always included, $0 line item for visibility ──
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `🎵 Custom ${songGenre || 'Custom'} Song for ${petLabel}`,
          description: `A one-of-a-kind AI-composed song written for ${petName || 'your pet'}, delivered via QR code on the portrait.`,
        },
        unit_amount: 0,   // Included free — but shown on receipt
      },
      quantity: 1,
    })

    // ── FEEL — extra products (blankets, apparel, mugs, etc) ──
    for (const extra of (extras || [])) {
      const sz = extraSizes?.[extra.id]
      const cl = extraColors?.[extra.id]
      const variant = [cl, sz].filter(Boolean).join(' / ')
      const nameSuffix = variant ? ` (${variant})` : ''
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${petLabel} Portrait — ${extra.name}${nameSuffix}`,
            description: extra.description || '',
            images: [imageUrl],
            metadata: {
              productId: extra.id,
              variantId: String(extra.printifyVariantId),
              blueprintId: String(extra.printifyBlueprintId),
              imageUrl,
              size: sz || '',
              color: cl || '',
            },
          },
          unit_amount: Math.round(extra.price * 100),
        },
        quantity: 1,
      })
    }

    // Stringify song answers for metadata (Stripe metadata values must be strings, max 500 chars)
    const songAnswersStr = JSON.stringify(songAnswers || {}).slice(0, 499)

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
        petType: petType || '',
        styleName: styleName || '',
        primaryProductId: primaryProduct.id,
        songGenre: songGenre || '',
        songAnswers: songAnswersStr,
        sessionFolder: sessionFolder || '',
        extraProductIds: (extras || []).map((e: any) => e.id).join(','),
      },
    })

    // ── Fire-and-forget: generate song brief + send admin email ──
    // Don't await — return checkout URL immediately so user gets to Stripe fast.
    fireSongBriefAndEmail({
      petName: petName || '',
      petType: petType || 'pet',
      styleName: styleName || '',
      songGenre: songGenre || '',
      songAnswers: songAnswers || {},
      sessionFolder: sessionFolder || '',
      firstImageUrl: imageUrl,
    }).catch(e => console.error('Song brief/email failed (non-blocking):', e))

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  SONG BRIEF + ADMIN EMAIL (fired after checkout session created)
// ═══════════════════════════════════════════════════════════════════════════
async function fireSongBriefAndEmail(args: {
  petName: string
  petType: string
  styleName: string
  songGenre: string
  songAnswers: Record<string, string>
  sessionFolder: string
  firstImageUrl: string
}) {
  const { petName, petType, styleName, songGenre, songAnswers, sessionFolder, firstImageUrl } = args

  // 1. Call creative-brief to generate Suno prompt
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.petprintsstudio.com'
  let brief: any = null
  try {
    // Compose a narrative input for the brief from the song answers
    const favoritePlace = [songAnswers.favOutdoor, songAnswers.favSpot, songAnswers.town].filter(Boolean).join(', ')
    const specialObjects = [songAnswers.favToy, songAnswers.favGame].filter(Boolean).join(', ')
    const additionalNotes = [songAnswers.whatMakesThemSpecial, songAnswers.anythingElse].filter(Boolean).join(' | ')

    const r = await fetch(`${appUrl}/api/creative-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petName,
        petType,
        favoritePlace,
        specialObjects,
        mood: '',
        musicStyle: songGenre,
        selectedStyleName: styleName,
        additionalNotes,
      }),
    })
    if (r.ok) brief = await r.json()
  } catch (e) {
    console.error('Creative brief generation failed:', e)
  }

  if (!brief || !process.env.RESEND_API_KEY) return

  // 2. Send admin notification email with Suno prompt
  const adminEmail = process.env.ADMIN_EMAIL || 'support@petprintsstudio.com'
  const petLabel = petName || 'Unknown'
  const songTitle = brief.song_title || `${petName}'s Song`
  const sunoPrompt = brief.suno_prompt_full || ''
  const portraitTitle = brief.portrait_title || ''
  const answersPreview = Object.entries(songAnswers).filter(([_, v]) => v).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join('<br>')

  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:40px 24px"><div style="background:#141414;border:1px solid rgba(201,168,76,.3);padding:32px;margin-bottom:20px"><div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">New Paid Order — Song Request</div><h1 style="font-size:28px;font-weight:400;color:#F5F0E8;margin:0 0 8px">🎵 ${petLabel} — ${songGenre}</h1><p style="color:rgba(245,240,232,.5);font-size:14px;margin:0 0 24px">${portraitTitle}</p><div style="background:#0A0A0A;border:1px solid rgba(245,240,232,.08);padding:16px;margin-bottom:16px"><div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Song Title</div><div style="font-size:16px;font-weight:600">${songTitle}</div></div><div style="background:#0A0A0A;border:2px solid rgba(201,168,76,.4);padding:16px;margin-bottom:16px"><div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Suno Prompt — Copy to suno.com/create</div><div style="font-size:14px;line-height:1.8;color:rgba(245,240,232,.9);white-space:pre-wrap">${sunoPrompt}</div></div><div style="background:#0A0A0A;border:1px solid rgba(245,240,232,.08);padding:16px;margin-bottom:24px"><div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Customer's Song Answers</div><div style="font-size:12px;line-height:1.8;color:rgba(245,240,232,.7)">${answersPreview || '(no answers provided)'}</div></div><a href="${appUrl}/admin/songs" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none">→ Open Song Admin to paste MP3 URL</a></div><div style="font-size:11px;color:rgba(245,240,232,.2);text-align:center">Session: ${sessionFolder}</div></div></body></html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Pet Prints Studio <orders@petprintsstudio.com>',
      to: adminEmail,
      subject: `🎵 Paid Order — ${petLabel} (${songGenre}): "${songTitle}"`,
      html,
    }),
  })
}
