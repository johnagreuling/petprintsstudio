'use client'
import Link from 'next/link'
import Logo from '@/components/Logo'
import SiteNav from '@/components/SiteNav'

export default function Memorial() {
  return (
    <main style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');
        .serif{font-family:'Cormorant Garamond',serif}
        *{box-sizing:border-box;margin:0;padding:0}
        :root{
          --gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;
          --soft:#141414;--mid:#1E1E1E;--border:rgba(245,240,232,.08);
          --muted:rgba(245,240,232,.5)
        }
        .btn-gold{display:inline-block;background:var(--gold);color:var(--ink);font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-size:12px;padding:18px 44px;border:none;cursor:pointer;transition:all .3s;text-decoration:none}
        .btn-gold:hover{background:var(--cream);transform:translateY(-2px);box-shadow:0 12px 40px rgba(201,168,76,.2)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .6s ease-out forwards}
        .fu2{animation-delay:.1s;opacity:0}
        .fu3{animation-delay:.25s;opacity:0}
        .fu4{animation-delay:.4s;opacity:0}
        @media (max-width:720px){
          .hero-pad{padding:100px 20px 60px !important}
          .three-grid{grid-template-columns:1fr !important;gap:32px !important}
          .product-grid{grid-template-columns:1fr !important}
          .trust-grid{grid-template-columns:1fr !important;gap:24px !important}
          .footer-nav{padding:32px 20px !important;flex-direction:column !important;gap:24px !important;text-align:center !important}
        }
      `}</style>

      <SiteNav />

      {/* HERO */}
      <section className="hero-pad" style={{padding:'140px 24px 80px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'40%',left:'50%',transform:'translate(-50%,-50%)',width:900,height:900,background:'radial-gradient(circle,rgba(201,168,76,.04) 0%,transparent 70%)',pointerEvents:'none'}} />

        <div className="fu" style={{fontSize:11,letterSpacing:'.32em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:24}}>
          In Loving Memory
        </div>

        <h1 className="serif fu fu2" style={{fontSize:'clamp(44px,6vw,84px)',lineHeight:1.02,marginBottom:28,fontWeight:400,maxWidth:1000,margin:'0 auto 28px',letterSpacing:'-.015em'}}>
          <em style={{color:'var(--gold)'}}>Some loves</em> never leave.
        </h1>

        <p className="serif fu fu3" style={{fontSize:'clamp(18px,1.8vw,24px)',color:'var(--cream)',lineHeight:1.5,maxWidth:720,margin:'0 auto 44px',fontWeight:400}}>
          They delighted every sense. Honor them the same way — with <em style={{color:'var(--gold)'}}>a portrait to see</em>, <em style={{color:'var(--gold)'}}>a song to hear</em>, and <em style={{color:'var(--gold)'}}>a keepsake to hold</em> forever.
        </p>

        <div className="fu fu4">
          <Link href="/create" className="btn-gold">Begin Their Tribute →</Link>
          <div style={{fontSize:12,color:'var(--muted)',marginTop:20,letterSpacing:'.05em'}}>
            Made with care by our studio · Shipped gift-ready
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT'S INCLUDED */}
      <section style={{padding:'100px 24px',background:'var(--soft)',borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:16}}>What's Included</div>
            <h2 className="serif" style={{fontSize:'clamp(32px,4vw,52px)',fontWeight:400,lineHeight:1.1,letterSpacing:'-.01em'}}>
              A tribute worthy of <em style={{color:'var(--gold)'}}>a life well-loved</em>.
            </h2>
          </div>

          <div className="three-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:48}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:16}}>See</div>
              <h3 className="serif" style={{fontSize:26,fontWeight:400,marginBottom:16,letterSpacing:'-.005em'}}>A custom portrait</h3>
              <p style={{fontSize:15,color:'var(--muted)',lineHeight:1.7}}>
                Rendered as fine art in the style of your choosing. A reminder of who they were, for the wall where you'll see them every day.
              </p>
            </div>

            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:16}}>Hear</div>
              <h3 className="serif" style={{fontSize:26,fontWeight:400,marginBottom:16,letterSpacing:'-.005em'}}>An original song</h3>
              <p style={{fontSize:15,color:'var(--muted)',lineHeight:1.7}}>
                Written just for them, with their name in the lyrics. A song that's theirs alone — one no one else in the world has, and no one ever will.
              </p>
            </div>

            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:16}}>Hold</div>
              <h3 className="serif" style={{fontSize:26,fontWeight:400,marginBottom:16,letterSpacing:'-.005em'}}>An heirloom keepsake</h3>
              <p style={{fontSize:15,color:'var(--muted)',lineHeight:1.7}}>
                Gallery-wrapped canvas, archival fine art print, or a soft blanket to keep with you. A piece of them you can hold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE SONG */}
      <section style={{padding:'100px 24px',textAlign:'center'}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:16}}>The Song</div>
          <h2 className="serif" style={{fontSize:'clamp(36px,5vw,64px)',fontWeight:400,lineHeight:1.05,marginBottom:28,letterSpacing:'-.015em'}}>
            <em style={{color:'var(--gold)'}}>Hear them</em> again.
          </h2>
          <p style={{fontSize:17,color:'var(--cream)',lineHeight:1.8,marginBottom:16,fontWeight:300}}>
            Every portrait we create comes with an original song — written for your pet, with their name, their personality, their story.
          </p>
          <p style={{fontSize:17,color:'var(--cream)',lineHeight:1.8,marginBottom:16,fontWeight:300}}>
            A QR code on the back of your portrait plays the song anytime you need it.
          </p>
          <p style={{fontSize:17,color:'var(--muted)',lineHeight:1.8,fontWeight:300,fontStyle:'italic'}}>
            For families who've lost a pet, our customers tell us the song is the part that catches them. It's the thing they didn't know they needed until they heard it.
          </p>
        </div>
      </section>

      {/* SECTION 4 — GENTLE PROCESS */}
      <section style={{padding:'100px 24px',background:'var(--soft)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:16}}>The Process</div>
            <h2 className="serif" style={{fontSize:'clamp(32px,4vw,48px)',fontWeight:400,lineHeight:1.1,letterSpacing:'-.01em'}}>
              A gentle process. <em style={{color:'var(--gold)'}}>We'll handle it from here.</em>
            </h2>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:32}}>
            {[
              {n:'01',t:'Upload a favorite photo',d:'A clear, well-lit one is ideal. We\u2019ll work from there.'},
              {n:'02',t:'Tell us about them',d:'Their name, their personality, a few favorite things. The details become the song.'},
              {n:'03',t:'We create',d:'Your portrait is rendered in eight fine art styles. Their song is composed. Takes five to seven minutes.'},
              {n:'04',t:'You choose',d:'Pick the portrait that captures them, the keepsake that suits your home. We handle the rest.'},
            ].map(({n,t,d})=>(
              <div key={n} style={{display:'flex',gap:28,alignItems:'flex-start',paddingBottom:24,borderBottom:'1px solid var(--border)'}}>
                <div className="serif" style={{fontSize:36,color:'var(--gold)',fontWeight:400,flexShrink:0,minWidth:60,fontStyle:'italic'}}>{n}</div>
                <div>
                  <h3 className="serif" style={{fontSize:22,fontWeight:400,marginBottom:8,letterSpacing:'-.005em'}}>{t}</h3>
                  <p style={{fontSize:15,color:'var(--muted)',lineHeight:1.7}}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — PRODUCTS */}
      <section style={{padding:'100px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700,marginBottom:16}}>Keepsakes</div>
            <h2 className="serif" style={{fontSize:'clamp(32px,4vw,52px)',fontWeight:400,lineHeight:1.1,letterSpacing:'-.01em'}}>
              Pieces to <em style={{color:'var(--gold)'}}>keep them close</em>.
            </h2>
          </div>

          <div className="product-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32}}>
            <div style={{background:'var(--soft)',border:'1px solid var(--border)',padding:36,textAlign:'center'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12,fontWeight:700}}>Hero</div>
              <h3 className="serif" style={{fontSize:24,fontWeight:400,marginBottom:12}}>Gallery Canvas 16×20</h3>
              <div className="serif" style={{fontSize:28,color:'var(--gold)',marginBottom:16}}>$129</div>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.6}}>A statement piece for the wall. Gallery-wrapped, ready to hang.</p>
            </div>

            <div style={{background:'var(--soft)',border:'1px solid var(--border)',padding:36,textAlign:'center'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12,fontWeight:700}}>Classic</div>
              <h3 className="serif" style={{fontSize:24,fontWeight:400,marginBottom:12}}>Fine Art Print 16×20</h3>
              <div className="serif" style={{fontSize:28,color:'var(--gold)',marginBottom:16}}>from $49</div>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.6}}>Museum-quality paper. Frame it yourself, or we ship it ready to mount.</p>
            </div>

            <div style={{background:'var(--soft)',border:'1px solid var(--border)',padding:36,textAlign:'center'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12,fontWeight:700}}>Comfort</div>
              <h3 className="serif" style={{fontSize:24,fontWeight:400,marginBottom:12}}>Memorial Blanket</h3>
              <div className="serif" style={{fontSize:28,color:'var(--gold)',marginBottom:16}}>$89</div>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.6}}>A soft, heavy throw with their portrait. For the chair where they used to sit.</p>
            </div>
          </div>

          <div style={{textAlign:'center',marginTop:40,fontSize:13,color:'var(--muted)',fontStyle:'italic'}}>
            Full keepsake collection available after you create your portrait.
          </div>
        </div>
      </section>

      {/* SECTION 6 — TRUST */}
      <section style={{padding:'80px 24px',background:'var(--soft)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="trust-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:48}}>
            <div style={{textAlign:'center'}}>
              <h3 className="serif" style={{fontSize:22,fontWeight:400,marginBottom:12,color:'var(--gold)'}}>Made with care</h3>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>Every portrait is reviewed by our studio before it ships. If it doesn't feel right, we'll make it right.</p>
            </div>
            <div style={{textAlign:'center'}}>
              <h3 className="serif" style={{fontSize:22,fontWeight:400,marginBottom:12,color:'var(--gold)'}}>100% Satisfaction Guarantee</h3>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>If your keepsake arrives with any issue, we'll replace it — no return needed, no questions.</p>
            </div>
            <div style={{textAlign:'center'}}>
              <h3 className="serif" style={{fontSize:22,fontWeight:400,marginBottom:12,color:'var(--gold)'}}>Families trust us with this moment</h3>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>Many families have trusted us to honor the pets they've lost. We take that seriously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — FINAL CTA */}
      <section style={{padding:'120px 24px',textAlign:'center'}}>
        <h2 className="serif" style={{fontSize:'clamp(32px,4.5vw,56px)',fontWeight:400,lineHeight:1.1,marginBottom:36,letterSpacing:'-.01em'}}>
          <em style={{color:'var(--gold)'}}>When you're ready.</em>
        </h2>
        <Link href="/create" className="btn-gold">Begin Their Tribute →</Link>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:24,letterSpacing:'.05em'}}>
          Portraits ready in 5–7 minutes · Ships gift-ready in 5–7 business days
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-nav" style={{background:'#080808',padding:'44px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--border)',flexWrap:'wrap',gap:20}}>
        <Logo height={24} />
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
