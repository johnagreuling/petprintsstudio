'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function BespokePage() {
  const [email, setEmail] = useState('')
  const [petName, setPetName] = useState('')
  const [vision, setVision] = useState('')
  const [orderId, setOrderId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email.trim() || !vision.trim()) {
      setError('Email and your vision are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/bespoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, petName, vision, orderId }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch (e) {
      setError('Something went wrong — please try again or email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--soft:#141414;--muted:rgba(245,240,232,.45);--border:rgba(245,240,232,.08)}
        .serif{font-family:'Cormorant Garamond',serif}
        .btn-gold{background:var(--gold);color:var(--ink);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:12px;padding:18px 40px;border:none;cursor:pointer;transition:all .3s;width:100%}
        .btn-gold:hover{background:var(--cream)}.btn-gold:disabled{opacity:.35;cursor:not-allowed}
        .input{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;transition:border-color .3s}
        .input:focus{border-color:var(--gold)}
        .input::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        .textarea{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;height:140px;resize:none;transition:border-color .3s}
        .textarea:focus{border-color:var(--gold)}
        .textarea::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        @media(max-width:640px){
          nav{padding:14px 16px !important}
          main{padding:32px 16px 80px !important}
          h1{font-size:clamp(32px,8vw,52px) !important}
          .input,.textarea{font-size:16px !important}
        }
      `}</style>

      <nav style={{padding:'18px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(245,240,232,.06)',position:'sticky',top:0,background:'#0A0A0A',zIndex:100}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'inherit'}}>
          <span>🐾</span>
          <span className="serif" style={{fontSize:20}}>Pet Prints Studio</span>
        </Link>
        <Link href="/create" style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none'}}>← Back to Create</Link>
      </nav>

      <main style={{maxWidth:720,margin:'0 auto',padding:'72px 24px 100px'}}>

        {/* ── HERO ── */}
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'var(--gold)',marginBottom:18,fontWeight:600}}>Signature · Commissioned</div>
          <h1 className="serif" style={{fontSize:'clamp(44px,7vw,72px)',fontWeight:400,letterSpacing:'-.02em',lineHeight:1.05,marginBottom:22}}>
            Work <em style={{color:'var(--gold)'}}>1-on-1</em> with<br/>one of our artists.
          </h1>
          <p style={{color:'var(--muted)',fontSize:16,lineHeight:1.75,maxWidth:540,margin:'0 auto'}}>
            For the portraits that matter most. A human artist reviews your photo, crafts a custom concept, and hand-refines every detail until it's right.
          </p>
          <div style={{marginTop:32,display:'inline-flex',alignItems:'baseline',gap:14,padding:'18px 32px',background:'#141414',border:'1px solid rgba(201,168,76,.3)'}}>
            <span className="serif" style={{fontSize:44,color:'var(--gold)',fontWeight:400,lineHeight:1}}>$49</span>
            <span style={{fontSize:11,color:'var(--muted)',letterSpacing:'.2em',textTransform:'uppercase'}}>on top of your portrait</span>
          </div>
        </div>

        {/* ── WHAT YOU GET ── */}
        <div style={{marginBottom:56}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:22,fontWeight:600,textAlign:'center'}}>What's Included</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:3}}>
            {[
              { icon: '👁️', title: 'Human review of your photo', body: 'An artist studies your pet\'s face, features, and story before generating anything.' },
              { icon: '✍️', title: 'A bespoke creative brief', body: 'We write a custom concept that captures who your pet actually is — not a template.' },
              { icon: '🎨', title: 'Hand-refined final portrait', body: 'Multiple rounds of refinement until every detail feels right. Identity, mood, light.' },
              { icon: '📦', title: 'Priority production + shipping', body: 'Your signature portrait moves to the front of the queue. Typically ready in 7–10 days.' },
            ].map(item => (
              <div key={item.title} style={{padding:'22px 26px',background:'#141414',border:'1px solid rgba(245,240,232,.06)',display:'flex',gap:18,alignItems:'flex-start'}}>
                <div style={{fontSize:28,lineHeight:1,flexShrink:0}}>{item.icon}</div>
                <div>
                  <div className="serif" style={{fontSize:18,fontWeight:400,marginBottom:4}}>{item.title}</div>
                  <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROCESS ── */}
        <div style={{marginBottom:56}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:22,fontWeight:600,textAlign:'center'}}>How It Works</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:3}}>
            {[
              { n: '01', title: 'Tell us about your pet', body: 'Submit the form below with your vision — any details, references, or reference photos you want us to work from.' },
              { n: '02', title: 'We scope and confirm', body: 'Within 24 hours, one of our artists responds with a concept sketch and payment link.' },
              { n: '03', title: 'We create, you review', body: 'First proof in 3–5 days. Up to 3 rounds of revisions until it\'s exactly right.' },
              { n: '04', title: 'Shipped to your door', body: 'Printed on your choice of medium with the signature artist certificate and song QR code.' },
            ].map(item => (
              <div key={item.n} style={{padding:'22px 26px',background:'#0D0D0D',border:'1px solid rgba(245,240,232,.05)',display:'flex',gap:22,alignItems:'flex-start'}}>
                <div className="serif" style={{fontSize:28,color:'var(--gold)',fontWeight:400,lineHeight:1,letterSpacing:'-.02em',flexShrink:0,minWidth:44}}>{item.n}</div>
                <div>
                  <div className="serif" style={{fontSize:18,fontWeight:400,marginBottom:4}}>{item.title}</div>
                  <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── REQUEST FORM ── */}
        {!submitted ? (
          <div style={{background:'linear-gradient(135deg,rgba(201,168,76,.04),rgba(10,10,10,.4))',border:'1px solid rgba(201,168,76,.25)',padding:'32px 32px 36px'}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:10,fontWeight:600}}>Request a Commission</div>
            <h2 className="serif" style={{fontSize:32,fontWeight:400,marginBottom:10,letterSpacing:'-.01em'}}>Tell us about <em style={{color:'var(--gold)'}}>your pet</em>.</h2>
            <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.7,marginBottom:26}}>We'll respond within 24 hours with a concept sketch and payment link.</p>

            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Your email <span style={{color:'var(--gold)'}}>*</span></label>
                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Your pet's name</label>
                <input className="input" placeholder="Mason, Luna, Biscuit..." value={petName} onChange={e=>setPetName(e.target.value)}/>
              </div>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Your vision <span style={{color:'var(--gold)'}}>*</span></label>
                <textarea className="textarea" placeholder="Describe what you want. The style, the scene, the feeling. Any references or specific details. The more, the better." value={vision} onChange={e=>setVision(e.target.value)}/>
              </div>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Recent order ID <span style={{opacity:.5}}>(optional — if upgrading a portrait)</span></label>
                <input className="input" placeholder="cs_live_..." value={orderId} onChange={e=>setOrderId(e.target.value)}/>
              </div>

              {error && <div style={{color:'#C4622D',fontSize:13,padding:'12px 16px',background:'rgba(196,98,45,.08)',border:'1px solid rgba(196,98,45,.2)'}}>{error}</div>}

              <button className="btn-gold" disabled={submitting} onClick={handleSubmit} style={{marginTop:6}}>
                {submitting ? 'Sending...' : 'Submit Commission Request →'}
              </button>
              <div style={{fontSize:11,color:'var(--muted)',textAlign:'center',marginTop:4}}>
                No charge until we confirm scope and send your payment link.
              </div>
            </div>
          </div>
        ) : (
          <div style={{background:'linear-gradient(135deg,rgba(201,168,76,.08),rgba(10,10,10,.4))',border:'1px solid rgba(201,168,76,.4)',padding:'48px 32px',textAlign:'center'}}>
            <div style={{fontSize:60,marginBottom:20}}>✓</div>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14,fontWeight:600}}>Request Received</div>
            <h2 className="serif" style={{fontSize:36,fontWeight:400,marginBottom:14,letterSpacing:'-.01em'}}>Thank you.</h2>
            <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.75,maxWidth:440,margin:'0 auto'}}>
              One of our artists will reach out within 24 hours at <span style={{color:'var(--cream)'}}>{email}</span> with a concept sketch and payment link.
            </p>
            <Link href="/create" style={{display:'inline-block',marginTop:32,padding:'12px 28px',border:'1px solid var(--gold)',color:'var(--gold)',fontSize:11,letterSpacing:'.15em',textTransform:'uppercase',textDecoration:'none'}}>← Back to Create</Link>
          </div>
        )}

        {/* ── FAQ ── */}
        <div style={{marginTop:64,paddingTop:40,borderTop:'1px solid rgba(245,240,232,.06)'}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:22,fontWeight:600,textAlign:'center'}}>Common Questions</div>
          <div style={{display:'flex',flexDirection:'column',gap:24}}>
            {[
              { q: 'Why $49 on top?', a: 'Human artist time. Concept development, review cycles, and hand-tuning each generation. The standard flow is fully automated — Signature is not.' },
              { q: 'How is this different from the standard portrait?', a: 'Standard portraits are AI-generated from your photo in minutes. Signature includes a human artist directing the entire process — concept, composition, refinement.' },
              { q: 'Can I still pick the print medium and song?', a: 'Yes. Signature works with all the same prints, blankets, mugs, and apparel. Your custom song is still included.' },
              { q: 'What if I don\'t love the result?', a: 'Up to 3 rounds of revisions included. If you\'re still not satisfied, we refund the $49 upcharge — you only pay for the base portrait.' },
            ].map(item => (
              <div key={item.q}>
                <div className="serif" style={{fontSize:18,fontWeight:400,marginBottom:6,color:'var(--cream)'}}>{item.q}</div>
                <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.75}}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
