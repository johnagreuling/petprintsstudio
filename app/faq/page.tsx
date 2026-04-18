'use client'
import Link from 'next/link'

const FAQS = [
  {
    q: 'How does it work?',
    a: 'Upload a clear photo of your pet, tell us a little about them (name, personality, favorite things), pick a style from our curated library, and we generate your portrait. You pick your favorite, choose a product, and we handle printing and shipping.',
  },
  {
    q: 'How long does it take to get my portraits?',
    a: 'Your 32 AI-generated portraits are ready in about 5–7 minutes. Once you pick your favorite and place your order, prints and canvas ship within 5–7 business days. Digital downloads are delivered instantly.',
  },
  {
    q: 'What photo works best?',
    a: 'A clear, well-lit, front-facing photo gives the best results. Natural light is ideal. Avoid heavy filters, extreme angles, or photos where your pet is very far away. The closer and clearer, the better the portrait will look.',
  },
  {
    q: 'What are the 32 styles?',
    a: 'We offer a curated library of hand-tuned artistic styles across five families: Classic Portraits (museum black, Rembrandt, baroque), Painterly Fine Art (oil, watercolor, impressionist, charcoal), Golden Hour (coastal, autumn, snow day), Lifestyle (convertible ride, library study, yacht marina), and Pop & Fantasy (neon glow, comic hero, retro pop). Every style is included in every order.',
  },
  {
    q: 'What products do you offer?',
    a: 'Gallery-wrapped canvas prints (8×10" to 24×36"), archival fine art prints, a 15oz ceramic mug, a sherpa blanket (50×60"), a throw pillow, a premium hoodie, a canvas tote bag, and a phone case. All printed with your chosen portrait.',
  },
  {
    q: 'What is the Custom Pet Song?',
    a: 'We compose an original song about your pet — their name in the lyrics, their personality in the melody. It\'s a full-length, professionally produced track delivered as an MP3. A QR code on your portrait links to the song so anyone can scan and listen.',
  },
  {
    q: 'What does "starting at $49" mean?',
    a: 'Fine art prints start at $39. Gallery-wrapped canvas prints start at $79 for 8×10". The most popular size is 16×20" canvas at $129. Digital portrait bundles, songs, and other products are add-ons you can select at checkout.',
  },
  {
    q: 'Can I get a portrait of multiple pets?',
    a: 'Currently each portrait features one pet. We\'re working on multi-pet portraits and will announce when they\'re available. In the meantime, you can order separate portraits and display them together.',
  },
  {
    q: 'What if I don\'t like any of the portraits?',
    a: 'We stand behind our work. If none of our styles capture your pet the way you envisioned, contact us and we\'ll work with you to make it right. Your satisfaction matters more than a single sale.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes. We ship to the US, Canada, UK, Australia, Germany, France, Netherlands, Spain, Italy, Japan, and New Zealand. Standard shipping is free. Express shipping (2–4 business days) is available for $14.99.',
  },
  {
    q: 'Is my photo stored securely?',
    a: 'Yes. Your photo is used only to generate your portraits and is stored securely. We never share, sell, or use your photos for any other purpose.',
  },
  {
    q: 'Can I use this as a memorial for a pet who has passed?',
    a: 'Absolutely. Many of our customers create portraits to honor a pet they\'ve lost. It\'s one of the most meaningful uses of our service, and we treat every memorial order with special care.',
  },
]

export default function FAQ() {
  return (
    <main style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .serif{font-family:'Cormorant Garamond',serif}
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--muted:rgba(245,240,232,.5);--border:rgba(245,240,232,.08)}
        details{border-bottom:1px solid var(--border)}
        details summary{cursor:pointer;padding:24px 0;font-size:16px;font-weight:500;color:var(--cream);list-style:none;display:flex;justify-content:space-between;align-items:center}
        details summary::-webkit-details-marker{display:none}
        details summary::after{content:'+';font-size:22px;color:var(--gold);font-weight:300;transition:transform .2s}
        details[open] summary::after{content:'−'}
        details div{padding:0 0 24px;font-size:14px;color:var(--muted);line-height:1.85;max-width:640px}
      `}</style>

      {/* Nav */}
      <nav style={{padding:'18px 48px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(245,240,232,.06)'}}>
        <Link href="/" style={{textDecoration:'none',color:'var(--cream)',display:'flex',alignItems:'center',gap:8}}>
          <span>🐾</span><span className="serif" style={{fontSize:20}}>Pet Prints Studio</span>
        </Link>
        <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'12px 28px',fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none'}}>Start Their Story</Link>
      </nav>

      {/* Content */}
      <div style={{maxWidth:720,margin:'0 auto',padding:'80px 24px 120px'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Support</div>
          <h1 className="serif" style={{fontSize:'clamp(36px,5vw,56px)',fontWeight:400,lineHeight:1.05}}>Frequently Asked<br/><em style={{color:'var(--gold)'}}>Questions</em></h1>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <details key={i}>
              <summary>{faq.q}</summary>
              <div>{faq.a}</div>
            </details>
          ))}
        </div>

        <div style={{textAlign:'center',marginTop:64,padding:'40px',background:'#141414',border:'1px solid var(--border)',borderRadius:8}}>
          <p style={{fontSize:14,color:'var(--muted)',marginBottom:16}}>Still have questions?</p>
          <a href="mailto:support@petprintsstudio.com" style={{color:'var(--gold)',fontSize:13,textDecoration:'none',letterSpacing:'.05em'}}>Contact us → support@petprintsstudio.com</a>
        </div>
      </div>

      {/* Footer */}
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
