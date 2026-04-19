'use client'
import Link from 'next/link'

export default function About() {
  return (
    <main style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .serif{font-family:'Cormorant Garamond',serif}
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--muted:rgba(245,240,232,.5);--border:rgba(245,240,232,.08)}
      `}</style>

      <nav style={{padding:'18px 48px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(245,240,232,.06)'}}>
        <Link href="/" style={{textDecoration:'none',color:'var(--cream)',display:'flex',alignItems:'center',gap:8}}>
          <span>🐾</span><span className="serif" style={{fontSize:20}}>Pet Prints Studio</span>
        </Link>
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <Link href="/styles" style={{color:'var(--muted)',textDecoration:'none',fontSize:11,letterSpacing:'.18em',textTransform:'uppercase'}}>Styles</Link>
          <Link href="/shop" style={{color:'var(--muted)',textDecoration:'none',fontSize:11,letterSpacing:'.18em',textTransform:'uppercase'}}>Catalog</Link>
          <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'12px 28px',fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none'}}>Start Their Story</Link>
        </div>
      </nav>

      <div style={{maxWidth:640,margin:'0 auto',padding:'80px 24px 120px'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Our Story</div>
          <h1 className="serif" style={{fontSize:'clamp(36px,5vw,56px)',fontWeight:400,lineHeight:1.05}}>Built by People Who<br/><em style={{color:'var(--gold)'}}>Love Their Pets</em></h1>
        </div>

        <div style={{fontSize:15,lineHeight:2,color:'var(--muted)'}}>
          <p style={{marginBottom:28}}>
            Pet Prints Studio started with a simple frustration: every pet portrait service we tried gave us a generic dog in a costume. Not <em style={{color:'var(--cream)'}}>our</em> dog. Not the one who steals socks, hates the vacuum, and sleeps exclusively on the left side of the couch.
          </p>
          <p style={{marginBottom:28}}>
            We wanted something that actually captured who they are — their personality, their world, the little details that make them <em style={{color:'var(--cream)'}}>them</em>. So we built it.
          </p>
          <p style={{marginBottom:28}}>
            Our portrait engine uses the latest AI generation models, hand-tuned across 32 artistic styles — from classical oil painting to neon pop art. But technology is only half the story. The other half is the questionnaire: we ask about your pet&rsquo;s name, personality, favorite things, and the details that matter to you. That information shapes every portrait, making each one genuinely unique.
          </p>
          <p style={{marginBottom:28}}>
            Then we took it further. We compose an original song for each pet — their name in the lyrics, their spirit in the melody. A QR code on the portrait links to the song, so anyone who sees the art can hear the music. It&rsquo;s a complete sensory experience: something you can see, hear, and hold.
          </p>
          <p style={{marginBottom:28,color:'var(--cream)'}}>
            We print on gallery-quality canvas, archival fine art paper, sherpa blankets, mugs, hoodies, and more. Every product is made to order and shipped to your door. No mass production. No compromises.
          </p>
          <p style={{marginBottom:48}}>
            Based in Wilmington, North Carolina. Built for pet lovers everywhere.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:48}}>
          {[
            {n:'32',l:'Custom Art Styles'},
            {n:'1,000+',l:'Portraits Created'},
            {n:'4.9★',l:'Customer Rating'},
          ].map(({n,l})=>(
            <div key={l} style={{background:'#141414',border:'1px solid var(--border)',padding:'28px 20px',textAlign:'center'}}>
              <div className="serif" style={{fontSize:28,color:'var(--gold)',marginBottom:6}}>{n}</div>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)'}}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',padding:'40px',background:'#141414',border:'1px solid var(--border)',borderRadius:8}}>
          <p className="serif" style={{fontSize:22,color:'var(--cream)',marginBottom:16,fontStyle:'italic'}}>Every pet has a story worth telling.</p>
          <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'16px 36px',fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block'}}>🐾 Start Their Story</Link>
        </div>
      </div>

      <footer style={{background:'#080808',padding:'44px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--border)',flexWrap:'wrap',gap:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}><span>🐾</span><span className="serif" style={{fontSize:18}}>Pet Prints Studio</span></div>
        <div style={{fontSize:11,color:'var(--muted)'}}>© 2025 Pet Prints Studio</div>
        <div style={{display:'flex',gap:24}}>
          {[{l:'FAQ',h:'/faq'},{l:'Shipping & Returns',h:'/shipping'},{l:'About',h:'/about'},{l:'Contact',h:'mailto:support@petprintsstudio.com'}].map(({l,h})=>(
            <Link key={l} href={h} style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none'}}>{l}</Link>
          ))}
        </div>
      </footer>
    </main>
  )
}
