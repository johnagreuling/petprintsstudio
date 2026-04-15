import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, checkoutLink, customerEmail, customerPhone, petName, personalMessage } = await req.json()

    if (!imageUrl || !checkoutLink) {
      return NextResponse.json({ error: 'Missing image URL or checkout link' }, { status: 400 })
    }

    if (!customerEmail && !customerPhone) {
      return NextResponse.json({ error: 'Please provide email or phone number' }, { status: 400 })
    }

    const results: string[] = []

    // Send email if provided
    if (customerEmail) {
      try {
        await sendEmail({
          to: customerEmail,
          imageUrl,
          checkoutLink,
          petName,
          personalMessage,
        })
        results.push(`Email sent to ${customerEmail}`)
      } catch (err: any) {
        console.error('Email send failed:', err)
        return NextResponse.json({ error: `Email failed: ${err.message}` }, { status: 500 })
      }
    }

    // Send SMS if provided
    if (customerPhone) {
      try {
        await sendSMS({
          to: customerPhone,
          checkoutLink,
          petName,
        })
        results.push(`SMS sent to ${customerPhone}`)
      } catch (err: any) {
        console.error('SMS send failed:', err)
        // Don't fail if SMS fails but email succeeded
        if (!customerEmail) {
          return NextResponse.json({ error: `SMS failed: ${err.message}` }, { status: 500 })
        }
        results.push(`SMS failed: ${err.message}`)
      }
    }

    console.log(`📤 Direct order sent:`, results.join(', '))
    
    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    console.error('Send direct order error:', err)
    return NextResponse.json({ error: err.message || 'Failed to send' }, { status: 500 })
  }
}

async function sendEmail({ to, imageUrl, checkoutLink, petName, personalMessage }: {
  to: string
  imageUrl: string
  checkoutLink: string
  petName?: string
  personalMessage?: string
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const petLabel = petName ? `${petName}'s` : 'Your'
  const messageBlock = personalMessage 
    ? `<div style="background:rgba(201,168,76,.08);border-left:3px solid #C9A84C;padding:16px 20px;margin-bottom:24px;font-style:italic;color:rgba(245,240,232,.7)">${personalMessage}</div>`
    : ''

  const html = `<!DOCTYPE html>
<html>
<body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif;margin:0;padding:0">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-size:32px">🐾</div>
    <div style="font-size:22px;margin-top:8px">Pet Prints Studio</div>
  </div>
  
  <div style="background:#141414;border:1px solid rgba(245,240,232,.08);padding:32px;margin-bottom:24px">
    <div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">
      ${petLabel} Portrait is Ready
    </div>
    
    <h1 style="font-size:26px;font-weight:400;color:#F5F0E8;margin:0 0 20px">
      Your custom portrait is waiting!
    </h1>
    
    ${messageBlock}
    
    <div style="margin-bottom:24px">
      <img src="${imageUrl}" alt="Your Portrait" style="width:100%;max-width:400px;display:block;margin:0 auto;border:1px solid rgba(245,240,232,.1)"/>
    </div>
    
    <p style="color:rgba(245,240,232,.6);font-size:15px;line-height:1.8;margin:0 0 24px">
      Click below to choose your print size and complete your order. We offer canvas prints, fine art prints, blankets, and more!
    </p>
    
    <div style="text-align:center">
      <a href="${checkoutLink}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:18px 40px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-decoration:none">
        Choose Your Print →
      </a>
    </div>
    
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(245,240,232,.08)">
      <div style="display:flex;justify-content:center;gap:24px;font-size:11px;color:rgba(245,240,232,.4)">
        <span>🔒 Secure Checkout</span>
        <span>📦 Ships in 5–7 days</span>
        <span>✓ Satisfaction Guaranteed</span>
      </div>
    </div>
  </div>
  
  <div style="text-align:center;color:rgba(245,240,232,.3);font-size:11px">
    <p>Questions? Just reply to this email.</p>
    <p>© Pet Prints Studio · petprintsstudio.com</p>
  </div>
  
</div>
</body>
</html>`

  await axios.post('https://api.resend.com/emails', {
    from: 'Pet Prints Studio <orders@petprintsstudio.com>',
    to,
    subject: `${petLabel} Portrait is Ready! 🎨`,
    html,
  }, {
    headers: { Authorization: `Bearer ${RESEND_KEY}` }
  })
}

async function sendSMS({ to, checkoutLink, petName }: {
  to: string
  checkoutLink: string
  petName?: string
}) {
  const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
  const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN
  const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER

  // If Twilio not configured, just log
  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_FROM) {
    console.log(`📱 SMS would be sent to ${to}:`)
    console.log(`Your ${petName ? petName + "'s" : ''} portrait is ready! Choose your print and checkout here: ${checkoutLink}`)
    throw new Error('Twilio not configured - SMS not sent')
  }

  const message = petName
    ? `🐾 ${petName}'s portrait is ready! Choose your print size and checkout: ${checkoutLink}`
    : `🐾 Your pet portrait is ready! Choose your print size and checkout: ${checkoutLink}`

  // Clean phone number
  let phone = to.replace(/\D/g, '')
  if (!phone.startsWith('1') && phone.length === 10) {
    phone = '1' + phone
  }
  phone = '+' + phone

  await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    new URLSearchParams({
      To: phone,
      From: TWILIO_FROM,
      Body: message,
    }),
    {
      auth: {
        username: TWILIO_SID,
        password: TWILIO_AUTH,
      },
    }
  )
}
