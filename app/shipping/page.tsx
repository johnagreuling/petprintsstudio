'use client'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

export default function Shipping() {
  return (
    <main style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .serif{font-family:'Cormorant Garamond',serif}
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--muted:rgba(245,240,232,.5);--border:rgba(245,240,232,.08)}
        h2{font-size:24px;font-weight:400;margin-bottom:16px;color:var(--cream)}
        p,li{font-size:14px;line-height:1.85;color:var(--muted)}
        section{margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid var(--border)}
        section:last-of-type{border-bottom:none}
      `}
          @media (max-width: 720px) {
            .ship-rates { grid-template-columns: 1fr !important; gap: 10px !important; }
            h1 { font-size: 36px !important; line-height: 1.05 !important; }
          }</style>

      <SiteNav currentPage="shipping" />

      <div style={{maxWidth:680,margin:'0 auto',padding:'80px 24px 120px'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Policies</div>
          <h1 className="serif" style={{fontSize:'clamp(36px,5vw,56px)',fontWeight:400,lineHeight:1.05}}>Shipping &<br/><em style={{color:'var(--gold)'}}>Returns</em></h1>
        </div>

        <section>
          <h2 className="serif">Shipping</h2>
          <p style={{marginBottom:16}}>All physical products are printed on demand and ship from our production partners in the United States. We ship to 11 countries worldwide.</p>
          <div className="ship-rates" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,marginBottom:24}}>
            <div style={{background:'#141414',padding:'20px 24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8,fontWeight:600}}>Standard Shipping</div>
              <div style={{fontSize:20,fontWeight:600,color:'var(--cream)',marginBottom:4}}>Free</div>
              <div style={{fontSize:12,color:'var(--muted)'}}>5–7 business days</div>
            </div>
            <div style={{background:'#141414',padding:'20px 24px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8,fontWeight:600}}>Express Shipping</div>
              <div style={{fontSize:20,fontWeight:600,color:'var(--cream)',marginBottom:4}}>$14.99</div>
              <div style={{fontSize:12,color:'var(--muted)'}}>2–4 business days</div>
            </div>
          </div>
          <p style={{marginBottom:12}}>You&rsquo;ll receive a shipping confirmation with tracking number via email once your order ships. Most orders are produced and shipped within 2–3 business days of purchase.</p>
          <p><strong style={{color:'var(--cream)'}}>Countries we ship to:</strong> United States, Canada, United Kingdom, Australia, Germany, France, Netherlands, Spain, Italy, Japan, New Zealand.</p>
        </section>

        <section>
          <h2 className="serif">Digital Delivery</h2>
          <p>Digital portrait files, the full 32-portrait bundle, and custom pet songs (MP3) are delivered instantly via email after purchase. No shipping required.</p>
        </section>

        <section>
          <h2 className="serif">Print Quality</h2>
          <p style={{marginBottom:12}}>Every portrait is upscaled to print-grade resolution before production. Our canvas prints are gallery-wrapped on 1.5&rdquo; stretcher bars, ready to hang. Fine art prints use archival matte paper with professional-grade inks designed for lasting color.</p>
          <p>All products are professionally printed by our manufacturing partners and undergo quality checks before shipping.</p>
        </section>

        <section>
          <h2 className="serif">Satisfaction Guarantee</h2>
          <p style={{marginBottom:12}}>We want you to love your portrait. If your order arrives damaged, defective, or significantly different from what you selected, contact us within 14 days and we&rsquo;ll make it right — either a reprint or a full refund.</p>
          <p>Because every portrait is custom-made to order, we cannot accept returns for change of mind. However, if you&rsquo;re unhappy with the quality of the AI-generated artwork itself, reach out to us and we&rsquo;ll work with you.</p>
        </section>

        <section>
          <h2 className="serif">Cancellations</h2>
          <p>Orders can be cancelled within 2 hours of purchase if production has not yet begun. After that, your order is already in production and cannot be cancelled. Contact us as soon as possible if you need to cancel.</p>
        </section>

        <section>
          <h2 className="serif">Contact Us</h2>
          <p>For any shipping, returns, or order questions, email us at <a href="mailto:support@petprintsstudio.com" style={{color:'var(--gold)',textDecoration:'none'}}>support@petprintsstudio.com</a>. We respond within 24 hours.</p>
        </section>
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
