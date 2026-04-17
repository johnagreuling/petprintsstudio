import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { email, petName, vision, orderId } = await req.json()

    if (!email || !vision) {
      return NextResponse.json({ error: 'Email and vision are required' }, { status: 400 })
    }

    // Basic sanitization — prevent obvious abuse
    const clean = (s: string) => String(s || '').slice(0, 2000).replace(/[<>]/g, '')
    const cleanEmail = clean(email)
    const cleanPetName = clean(petName)
    const cleanVision = clean(vision)
    const cleanOrderId = clean(orderId)

    if (!process.env.RESEND_API_KEY) {
      // If Resend isn't configured, still return OK — log server-side for manual follow-up
      console.error('[BESPOKE REQUEST — RESEND NOT CONFIGURED]', { cleanEmail, cleanPetName, cleanVision, cleanOrderId })
      return NextResponse.json({ ok: true })
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'support@petprintsstudio.com'
    const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px">
        <div style="background:#141414;border:1px solid rgba(201,168,76,.3);padding:32px;margin-bottom:20px">
          <div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">New Bespoke Commission Request</div>
          <h1 style="font-size:28px;font-weight:400;color:#F5F0E8;margin:0 0 24px">🎨 ${cleanPetName || 'Unknown pet'}</h1>

          <div style="background:#0A0A0A;border:1px solid rgba(245,240,232,.08);padding:16px;margin-bottom:12px">
            <div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Customer Email</div>
            <div style="font-size:16px;font-weight:600"><a href="mailto:${cleanEmail}" style="color:#C9A84C;text-decoration:none">${cleanEmail}</a></div>
          </div>

          ${cleanPetName ? `<div style="background:#0A0A0A;border:1px solid rgba(245,240,232,.08);padding:16px;margin-bottom:12px">
            <div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Pet Name</div>
            <div style="font-size:14px">${cleanPetName}</div>
          </div>` : ''}

          ${cleanOrderId ? `<div style="background:#0A0A0A;border:1px solid rgba(245,240,232,.08);padding:16px;margin-bottom:12px">
            <div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Existing Order ID</div>
            <div style="font-size:13px;font-family:monospace;color:rgba(245,240,232,.8)">${cleanOrderId}</div>
          </div>` : ''}

          <div style="background:#0A0A0A;border:2px solid rgba(201,168,76,.4);padding:16px;margin-bottom:24px">
            <div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Their Vision</div>
            <div style="font-size:14px;line-height:1.8;color:rgba(245,240,232,.9);white-space:pre-wrap">${cleanVision}</div>
          </div>

          <div style="font-size:11px;color:rgba(245,240,232,.5);margin-top:16px;line-height:1.7">
            Respond within 24 hours with a concept sketch and payment link.
          </div>
        </div>
        <div style="font-size:11px;color:rgba(245,240,232,.2);text-align:center">Submitted ${new Date().toISOString()}</div>
      </div>
    </body></html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Pet Prints Studio <orders@petprintsstudio.com>',
        to: adminEmail,
        reply_to: cleanEmail,
        subject: `🎨 Bespoke Request — ${cleanPetName || cleanEmail}`,
        html,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Resend error:', res.status, errText)
      return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Bespoke submission error:', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
