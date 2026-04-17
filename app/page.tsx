'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ART_STYLES, PRODUCTS } from '@/lib/config'

type HeroShowcase = { url: string; style: string; pet: string }

export default function Home() {
  const [activeStyle, setActiveStyle] = useState(0)
  const [heroShowcase, setHeroShowcase] = useState<HeroShowcase[]>([])
  const sliderRef = useRef<HTMLDivElement>(null)

  // Load ALL curated portraits for the hero slider (32 if all picked)
  useEffect(() => {
    (async () => {
      try {
        const [picksRes, stylesRes] = await Promise.all([
          fetch('/api/admin/curate-picks'),
          fetch('/api/admin/styles'),
        ])
        const { picks = {} } = await picksRes.json()
        const { styles = [] } = await stylesRes.json()
        const styleNameById: Record<string, string> = Object.fromEntries(styles.map((s: any) => [s.id, s.name]))
        const styleOrder: string[] = styles.map((s: any) => s.id)
        const full: HeroShowcase[] = []
        for (const id of styleOrder) {
          const pick = picks[id]
          if (pick?.url) full.push({ url: pick.url, style: styleNameById[id] || id, pet: pick.pet || '' })
        }
        // Interleave so no two portraits from the same pet are adjacent
        const interleaved: HeroShowcase[] = []
        const remaining = [...full]
        let lastPet = ''
        while (remaining.length > 0) {
          const idx = remaining.findIndex(s => s.pet !== lastPet)
          if (idx >= 0) {
            const [item] = remaining.splice(idx, 1)
            interleaved.push(item)
            lastPet = item.pet
          } else {
            interleaved.push(remaining.shift()!)
            lastPet = interleaved[interleaved.length - 1].pet
          }
        }
        setHeroShowcase(interleaved)
      } catch (e) { /* silent degrade */ }
    })()
  }, [])

  // Arrow scroll helpers — scroll by ~one card width with smooth animation
  const scrollBy = (dir: 1 | -1) => {
    const el = sliderRef.current
    if (!el) return
    const cardWidth = el.firstElementChild instanceof HTMLElement
      ? el.firstElementChild.offsetWidth + 16  // card + gap
      : 280
    el.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' })
  }

  // Triple the showcase for infinite scroll illusion
  const infiniteShowcase = heroShowcase.length > 0
    ? [...heroShowcase, ...heroShowcase, ...heroShowcase]
    : []

  // Random start + infinite loop: scroll to middle set on mount, reset on edge
  useEffect(() => {
    const el = sliderRef.current
    if (!el || heroShowcase.length === 0) return
    // Wait for images to render
    const timer = setTimeout(() => {
      const cardWidth = el.firstElementChild instanceof HTMLElement
        ? el.firstElementChild.offsetWidth + 16
        : 296
      const setWidth = heroShowcase.length * cardWidth
      // Start at a random position within the middle set
      const randomOffset = Math.floor(Math.random() * heroShowcase.length) * cardWidth
      el.scrollLeft = setWidth + randomOffset
    }, 100)
    return () => clearTimeout(timer)
  }, [heroShowcase.length])

  // Infinite scroll: when user scrolls near an edge, silently jump to the equivalent position in the middle set
  useEffect(() => {
    const el = sliderRef.current
    if (!el || heroShowcase.length === 0) return
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const cardWidth = el.firstElementChild instanceof HTMLElement
          ? el.firstElementChild.offsetWidth + 16
          : 296
        const setWidth = heroShowcase.length * cardWidth
        // If scrolled into the first (clone) set, jump forward by one set
        if (el.scrollLeft < setWidth * 0.25) {
          el.style.scrollBehavior = 'auto'
          el.scrollLeft += setWidth
          el.style.scrollBehavior = 'smooth'
        }
        // If scrolled into the last (clone) set, jump back by one set
        if (el.scrollLeft > setWidth * 2.25) {
          el.style.scrollBehavior = 'auto'
          el.scrollLeft -= setWidth
          el.style.scrollBehavior = 'smooth'
        }
        ticking = false
      })
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [heroShowcase.length])

  return (
    <main style={{background:'#0A0A0A',color:'#F5F0E8',fontFamily:"'DM Sans',sans-serif",minHeight:'100vh'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        :root{
          --gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;
          --soft:#141414;--mid:#1E1E1E;--border:rgba(245,240,232,.08);
          --muted:rgba(245,240,232,.45);--rust:#C4622D
        }
        .serif{font-family:'Cormorant Garamond',serif}
        .gold{color:var(--gold)}
        .muted{color:var(--muted)}
        .btn-gold{display:inline-block;background:var(--gold);color:var(--ink);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:12px;padding:18px 44px;border:none;cursor:pointer;transition:all .3s;text-decoration:none}
        .btn-gold:hover{background:var(--cream);transform:translateY(-2px);box-shadow:0 12px 40px rgba(201,168,76,.25)}
        .btn-out{display:inline-block;border:1px solid rgba(245,240,232,.2);color:var(--muted);background:none;font-weight:500;letter-spacing:.1em;text-transform:uppercase;font-size:11px;padding:16px 36px;cursor:pointer;transition:all .3s;text-decoration:none}
        .btn-out:hover{border-color:var(--gold);color:var(--gold)}
        .divider{height:1px;background:linear-gradient(to right,transparent,var(--gold),transparent);margin:0 60px}
        .card{background:var(--soft);border:1px solid var(--border);transition:border-color .3s}
        .card:hover{border-color:rgba(201,168,76,.3)}
        .style-btn{background:var(--soft);border:1px solid var(--border);padding:0;cursor:pointer;transition:all .3s;text-align:left;position:relative;overflow:hidden}
        .style-btn.active,.style-btn:hover{border-color:var(--gold)}
        .style-btn.active::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);z-index:2}
        .style-btn img{width:100%;aspect-ratio:1;object-fit:cover;display:block;transition:transform .4s ease}
        .style-btn:hover img,.style-btn.active img{transform:scale(1.05)}
        .style-btn-info{padding:16px 18px}
        nav a{text-decoration:none;color:var(--muted);font-size:11px;letter-spacing:.18em;text-transform:uppercase;transition:color .3s}
        nav a:hover{color:var(--cream)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .8s ease forwards}
        .fu1{animation-delay:.05s}.fu2{animation-delay:.1s}.fu3{animation-delay:.18s}.fu4{animation-delay:.28s}
        @keyframes shimmer{0%,100%{opacity:.3}50%{opacity:.7}}
        .shimmer{animation:shimmer 3s ease infinite}
        .tag{display:inline-block;border:1px solid rgba(201,168,76,.3);color:var(--gold);font-size:10px;letter-spacing:.25em;text-transform:uppercase;padding:6px 14px;margin:4px}
        .popular-badge{position:absolute;top:10px;right:10px;background:var(--gold);color:var(--ink);font-size:8px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:3px 8px}
        
        /* Hide scrollbar on the hero slider for a cleaner look */
        .hero-slider::-webkit-scrollbar{display:none}
        .hero-slider{scrollbar-width:none}
        .hero-slide:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(201,168,76,.2)}
        .slider-arrow:hover{background:rgba(201,168,76,.2)!important;border-color:var(--gold)!important}

        /* Upload portal — shimmer and hover */
        @keyframes shimmerSweep{0%{left:-100%}50%,100%{left:100%}}
        .hero-upload-portal:hover{border-color:var(--gold)!important;background:linear-gradient(135deg,rgba(201,168,76,.1) 0%,rgba(196,98,45,.06) 100%)!important;transform:translateY(-2px);box-shadow:0 12px 48px rgba(201,168,76,.15)}

        /* Mobile Responsive */
        @media(max-width:768px){
          .divider{margin:0 20px}
          .btn-gold{padding:14px 28px;font-size:11px}
          .btn-out{padding:12px 24px;font-size:10px}
          .mobile-hide{display:none!important}
          .mobile-stack{flex-direction:column!important}
          .mobile-full{width:100%!important}
          .mobile-center{text-align:center!important}
          .section-padding{padding:60px 20px!important}
          .responsive-grid-2col{display:flex!important;flex-direction:column!important}
          .responsive-grid-3col{display:grid!important;grid-template-columns:1fr!important}
          .responsive-grid-4col{display:grid!important;grid-template-columns:1fr 1fr!important}
          .bookend-grid{display:flex!important;flex-direction:column!important;gap:20px!important}
          .bookend-grid>*{width:100%!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .product-grid{display:grid!important;grid-template-columns:1fr 1fr!important}
          /* Slider: smaller cards on phone, peek of next card, arrows recede */
          .hero-slider{padding:8px 20px!important;gap:10px!important}
          .hero-slide{width:220px!important;height:300px!important}
          .slider-arrow{width:36px!important;height:36px!important;font-size:16px!important}
          .slider-arrow-left{left:6px!important}
          .slider-arrow-right{right:6px!important}
          .slider-fade-left,.slider-fade-right{width:40px!important}
        }
        .section-padding{padding:120px 60px;background:var(--soft)}
        .responsive-grid-2col{display:grid;grid-template-columns:1.5fr 1fr}
        .responsive-grid-3col{display:grid;grid-template-columns:1fr 2fr 1fr}
        .responsive-grid-4col{display:grid;grid-template-columns:repeat(4,1fr)}
        .bookend-grid{display:grid;grid-template-columns:1fr 2fr 1fr}
        .steps-grid{grid-template-columns:repeat(6,1fr)}
        .product-grid{display:grid;grid-template-columns:repeat(4,1fr)}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(10,10,10,.95)',backdropFilter:'blur(16px)',borderBottom:'1px solid var(--border)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <span style={{fontSize:20}}>🐾</span>
          <span className="serif" style={{fontSize:18,letterSpacing:'.06em',color:'var(--cream)'}}>Pet Prints Studio</span>
        </Link>
        <div className="mobile-hide" style={{display:'flex',gap:36,alignItems:'center'}}>
          <a href="#how-it-works">How It Works</a>
          <Link href="/styles" style={{color:'var(--muted)',textDecoration:'none',fontSize:12,letterSpacing:'.12em',textTransform:'uppercase'}}>Styles</Link>
        </div>
        <Link href="/create" className="btn-gold" style={{padding:'10px 20px',fontSize:10}}>Begin Their Story</Link>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'140px 24px 80px',position:'relative',overflow:'hidden'}}>
        {/* Ambient glow */}
        <div style={{position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',width:800,height:800,background:'radial-gradient(circle,rgba(201,168,76,.06) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:'70%',left:'20%',width:400,height:400,background:'radial-gradient(circle,rgba(196,98,45,.04) 0%,transparent 70%)',pointerEvents:'none'}} />

        <div className="fu fu1" style={{marginBottom:20,fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'var(--gold)',fontWeight:500}}>
          See Them &nbsp;·&nbsp; Hear Them &nbsp;·&nbsp; Feel Them
        </div>

        <h1 className="serif fu fu2" style={{fontSize:'clamp(44px,6.2vw,88px)',lineHeight:.98,marginBottom:28,fontWeight:400,maxWidth:960,letterSpacing:'-.02em'}}>
          A One-of-a-Kind Pet Experience<br/><em style={{color:'var(--gold)'}}>Made Just for You.</em>
        </h1>

        <p className="fu fu3" style={{fontSize:17,lineHeight:1.7,color:'var(--muted)',maxWidth:560,marginBottom:36,fontWeight:300,letterSpacing:'.005em'}}>
          Custom portraits that capture the magic of who they truly are. Original songs that bring their spirit to life. Beautifully made keepsakes — a hoodie, a soft blanket, a morning coffee mug — so your love for them is something you can see, hear, and hold.
        </p>

        <p className="fu fu3" style={{fontSize:11,color:'rgba(201,168,76,.7)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:36,fontWeight:600}}>Portrait &nbsp;·&nbsp; Song &nbsp;·&nbsp; Canvas &nbsp;·&nbsp; From $49</p>
        
        {/* Upload Dropbox - Right on homepage */}
        <div className="fu fu4" style={{marginBottom:32,maxWidth:480,margin:'0 auto 32px',width:'100%'}}>
          <Link href="/create" className="hero-upload-portal" style={{
            display:'block',
            position:'relative',
            padding:'36px 28px',
            textAlign:'center',
            textDecoration:'none',
            background:'linear-gradient(135deg, rgba(201,168,76,.06) 0%, rgba(196,98,45,.03) 100%)',
            border:'1px solid rgba(201,168,76,.25)',
            overflow:'hidden',
            transition:'all .3s cubic-bezier(.2,.8,.2,1)',
          }}>
            {/* Subtle shimmer sweep */}
            <div style={{position:'absolute',top:0,left:'-100%',width:'100%',height:'100%',background:'linear-gradient(90deg,transparent,rgba(201,168,76,.08),transparent)',animation:'shimmerSweep 3.5s ease-in-out infinite'}}/>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14,fontWeight:600}}>Begin</div>
              <div style={{fontSize:20,color:'var(--cream)',fontWeight:400,fontFamily:"'Cormorant Garamond',serif",marginBottom:8,letterSpacing:'-.01em'}}>Upload your pet&rsquo;s photo</div>
              <div style={{fontSize:12,color:'var(--muted)',marginBottom:22,letterSpacing:'.02em'}}>JPG, PNG, or WEBP · Max 50MB</div>
              <div style={{display:'inline-block',background:'var(--gold)',color:'var(--ink)',padding:'13px 32px',fontSize:11,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase'}}>Start Their Story →</div>
            </div>
          </Link>
        </div>

        {/* ── Hero Portrait Slider ─────────────────────────────────
            Horizontal scroll slider with all 32 curated portraits.
            Left/right arrows on desktop, native momentum thumb-flick on iOS.
            scroll-snap centers each card as it comes into view. ── */}
        {heroShowcase.length > 0 && (
          <div className="fu fu4" style={{position:'relative',width:'100%',maxWidth:1200,margin:'0 auto 48px'}}>
            {/* Edge fade masks */}
            <div aria-hidden className="slider-fade-left" style={{position:'absolute',left:0,top:0,bottom:0,width:80,background:'linear-gradient(to right,#0A0A0A 0%,rgba(10,10,10,.6) 50%,transparent 100%)',pointerEvents:'none',zIndex:2}}/>
            <div aria-hidden className="slider-fade-right" style={{position:'absolute',right:0,top:0,bottom:0,width:80,background:'linear-gradient(to left,#0A0A0A 0%,rgba(10,10,10,.6) 50%,transparent 100%)',pointerEvents:'none',zIndex:2}}/>

            {/* Arrows */}
            <button
              aria-label="Previous styles"
              onClick={()=>scrollBy(-1)}
              className="slider-arrow slider-arrow-left"
              style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',zIndex:3,width:44,height:44,borderRadius:'50%',background:'rgba(10,10,10,.8)',border:'1px solid rgba(201,168,76,.4)',color:'var(--gold)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',transition:'all .2s'}}
            >‹</button>
            <button
              aria-label="Next styles"
              onClick={()=>scrollBy(1)}
              className="slider-arrow slider-arrow-right"
              style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',zIndex:3,width:44,height:44,borderRadius:'50%',background:'rgba(10,10,10,.8)',border:'1px solid rgba(201,168,76,.4)',color:'var(--gold)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',transition:'all .2s'}}
            >›</button>

            {/* Scroll container */}
            <div
              ref={sliderRef}
              className="hero-slider"
              style={{
                display:'flex',
                gap:16,
                overflowX:'auto',
                WebkitOverflowScrolling:'touch',
                scrollBehavior:'smooth',
                padding:'8px 60px',
                scrollbarWidth:'none',
                msOverflowStyle:'none',
              }}
            >
              {infiniteShowcase.map((item, i) => (
                <Link
                  key={item.url + i}
                  href="/styles"
                  className="hero-slide"
                  style={{
                    flexShrink:0,
                    width:280,
                    height:380,
                    borderRadius:10,
                    overflow:'hidden',
                    position:'relative',
                    border:'1px solid rgba(245,240,232,.08)',
                    boxShadow:'0 8px 32px rgba(0,0,0,.5)',
                    transition:'transform .3s, box-shadow .3s',
                    textDecoration:'none',
                    display:'block',
                  }}
                >
                  <img src={item.url} alt={`${item.pet} — ${item.style}`} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} loading="lazy" />
                  <div style={{
                    position:'absolute',
                    bottom:0,
                    left:0,
                    right:0,
                    padding:'40px 16px 14px',
                    background:'linear-gradient(to top, rgba(10,10,10,.92) 0%, transparent 100%)',
                  }}>
                    <div style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--gold)',fontWeight:600,marginBottom:3}}>{item.style}</div>
                    <div style={{fontSize:11,color:'rgba(245,240,232,.6)',textTransform:'capitalize'}}>{item.pet}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Helper hint below slider */}
            <div style={{textAlign:'center',marginTop:14,fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'rgba(245,240,232,.3)'}}>
              Swipe · {heroShowcase.length} curated styles
            </div>
          </div>
        )}

        <div className="fu fu4" style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',marginBottom:72}}>
          <a href="#how-it-works" className="btn-out">See How It Works</a>
        </div>

        {/* Style hint */}
        <div className="fu fu4" style={{marginBottom:64,textAlign:'center'}}>
          <p style={{fontSize:12,color:'rgba(201,168,76,.6)',letterSpacing:'.08em'}}>
            32 custom-tuned styles &nbsp;&middot;&nbsp; Every one included &nbsp;&middot;&nbsp; <Link href="/styles" style={{color:'var(--gold)',textDecoration:'none',borderBottom:'1px solid rgba(201,168,76,.4)'}}>Explore styles →</Link>
          </p>
        </div>

        {/* Stats */}
        <div className="fu fu4 stats-bar" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:40,justifyContent:'center'}}>
          {[['32','Portraits Per Story'],['1,000+','Pet Stories Told'],['♪','Beautiful Original Music'],['4.9★','Customer Average']].map(([n,l1])=>(
            <div key={l1} style={{textAlign:'center'}}>
              <div className="serif" style={{fontSize:36,color:'var(--gold)',lineHeight:1,marginBottom:4}}>{n}</div>
              <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--muted)',marginTop:6,lineHeight:1.6}}>{l1}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SONG PLAYER — right at the top so visitors can play while browsing ── */}
      <section style={{padding:'56px 60px',background:'#0A0A0A'}} className="section-padding">
        <div style={{maxWidth:800,margin:'0 auto',textAlign:'center',padding:'48px 32px',background:'linear-gradient(135deg,rgba(167,139,250,.05),rgba(10,10,10,.4))',border:'1px solid rgba(167,139,250,.15)',borderRadius:10}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'#A78BFA',marginBottom:14}}>Every Pet Gets a Song</div>
          <h3 className="serif" style={{fontSize:'clamp(24px,4vw,36px)',marginBottom:12,fontWeight:400,color:'var(--cream)',lineHeight:1.15}}>Press Play. Hear the Difference.</h3>
          <p style={{fontSize:14,color:'var(--muted)',marginBottom:28,maxWidth:440,margin:'0 auto 28px',lineHeight:1.8}}>
            Real songs we composed for real pets. Their names in the lyrics. Their stories in every verse.
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
            {[
              {name:'Sasha',song:'/songs/sasha-on-the-sandbar.mp3',desc:'On the Sandbar'},
              {name:'Haze',song:'/songs/haze-on-the-harbor.mp3',desc:'On the Harbor'},
              {name:'Jack',song:'/songs/jack-the-labradoodle.mp3',desc:'The Labradoodle'},
            ].map(({name,song,desc})=>(
              <button key={name} onClick={()=>{const a=document.getElementById('song-player') as HTMLAudioElement;if(a){a.src=song;a.play()}}} style={{background:'rgba(167,139,250,.12)',color:'#A78BFA',padding:'12px 24px',fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',border:'1px solid rgba(167,139,250,.3)',borderRadius:4,cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all .2s'}}>
                <span style={{fontSize:14}}>▶</span> {name} — {desc}
              </button>
            ))}
          </div>
          <audio id="song-player" style={{display:'none'}}/>
          <p style={{fontSize:10,color:'var(--muted)',marginTop:16,letterSpacing:'.1em'}}>🎧 Turn up your volume</p>
        </div>
      </section>

      {/* HOW IT WORKS — 4 steps */}
      <section id="how-it-works" style={{padding:'80px 60px',background:'#0d0d0d'}} className="section-padding">
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>How It Works</div>
            <h2 className="serif" style={{fontSize:'clamp(32px,5vw,60px)',fontWeight:400,lineHeight:1.05}}>Upload. Tell. Pick. <em style={{color:'var(--gold)'}}>Done.</em></h2>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}} className="responsive-grid-4col">
            {/* Step 1 — Upload */}
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{aspectRatio:'3/4',overflow:'hidden',background:'#1a1412',position:'relative'}}>
                <img src="/process-upload.jpg" alt="Upload your pet's photo" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,.5) 0%,transparent 40%)'}} />
              </div>
              <div style={{padding:'20px 18px 24px'}}>
                <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:8,fontWeight:700}}>Step 1</div>
                <h3 className="serif" style={{fontSize:20,marginBottom:6,fontWeight:400}}>Upload a Photo</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.75}}>One clear, well-lit photo. Front-facing works best.</p>
              </div>
            </div>

            {/* Step 2 — Tell Their Story */}
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{aspectRatio:'3/4',overflow:'hidden',background:'#111',position:'relative'}}>
                <img src="/step2-wyatt.jpg" alt="Wyatt's personalized portrait" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,.5) 0%,transparent 40%)'}} />
              </div>
              <div style={{padding:'20px 18px 24px'}}>
                <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:8,fontWeight:700}}>Step 2</div>
                <h3 className="serif" style={{fontSize:20,marginBottom:6,fontWeight:400}}>Tell Us Their Story</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.75}}>Name, personality, favorite things. This is what makes it <em>theirs</em>.</p>
              </div>
            </div>

            {/* Step 3 — Pick Your Favorite */}
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{aspectRatio:'3/4',overflow:'hidden',background:'#0d0d0d',position:'relative'}}>
                <div style={{width:'100%',height:'100%',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gridTemplateRows:'repeat(3,1fr)',gap:4,padding:6}}>
                  {heroShowcase.slice(0, 9).map((s, i)=>(
                    <div key={i} style={{overflow:'hidden',borderRadius:3}}>
                      <img src={s.url} alt={s.style} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} loading="lazy"/>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{padding:'20px 18px 24px'}}>
                <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:8,fontWeight:700}}>Step 3</div>
                <h3 className="serif" style={{fontSize:20,marginBottom:6,fontWeight:400}}>Pick Your Favorite</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.75}}>We generate 32 custom portraits. You pick the one that feels right.</p>
              </div>
            </div>

            {/* Step 4 — We Handle the Rest */}
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{aspectRatio:'3/4',overflow:'hidden',background:'#1a1412',position:'relative'}}>
                <img src="/step4-delivered.png" alt="Canvas portrait being unboxed" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,.5) 0%,transparent 40%)'}} />
              </div>
              <div style={{padding:'20px 18px 24px'}}>
                <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:8,fontWeight:700}}>Step 4</div>
                <h3 className="serif" style={{fontSize:20,marginBottom:6,fontWeight:400}}>We Handle the Rest</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.75}}>Portrait printed on gallery canvas. Song composed. Shipped to your door.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic product shot — the portrait in a real home */}
      <div style={{position:'relative',width:'100%',height:'clamp(300px,50vw,560px)',overflow:'hidden'}}>
        <img src="/portrait-on-wall.png" alt="Pet portrait hanging in a beautiful home" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%',display:'block'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(10,10,10,.4) 0%, transparent 30%, transparent 70%, rgba(10,10,10,.8) 100%)'}} />
        <div style={{position:'absolute',bottom:28,left:0,right:0,textAlign:'center'}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:600}}>Gallery-Quality · Shipped to Your Door · From $49</div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
           THE EXPERIENCE — one clean section, no redundancy
           ════════════════════════════════════════════════════════════ */}
      <section id="the-experience" style={{padding:'80px 60px',background:'#0A0A0A'}} className="section-padding">
        <div style={{maxWidth:1100,margin:'0 auto'}}>

          {/* The philosophy — multi-sensory */}
          <div style={{textAlign:'center',marginBottom:80}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:20}}>The Philosophy</div>
            <h2 className="serif" style={{fontSize:'clamp(30px,4.5vw,56px)',fontWeight:400,marginBottom:32,lineHeight:1.1,maxWidth:800,margin:'0 auto 32px'}}>
              Our pets delight every sense.<br/><em style={{color:'var(--gold)'}}>So should how we celebrate them.</em>
            </h2>
            <p style={{fontSize:15,lineHeight:1.9,color:'var(--muted)',maxWidth:540,margin:'0 auto'}}>
              Not a generic portrait of a dog. A portrait of <em>your</em> dog — the one who tilts her head when you say &ldquo;walk,&rdquo; who stole the couch cushion three years ago and never gave it back.
            </p>
          </div>

          {/* Three sensory pillars — SEE / HEAR / FEEL */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:80}} className="responsive-grid-3col">
            {[
              {
                sense: 'See',
                headline: 'A Portrait That Looks Like Them',
                body: '32 hand-tuned artistic styles, from classical oil to neon pop. Every detail preserved — their eyes, their markings, the way they carry themselves. Not a filter. Fine art.',
                accent: 'var(--gold)',
              },
              {
                sense: 'Hear',
                headline: 'A Song Written Just for Them',
                body: 'Original music with their name in the lyrics and their story in every verse. Billboard-quality production. Scan the QR code on the portrait — it plays instantly.',
                accent: '#A78BFA',
              },
              {
                sense: 'Feel',
                headline: 'Products You Can Actually Hold',
                body: 'A soft sherpa blanket with their face. A warm hoodie that keeps them close. A coffee mug for every morning. Gallery-wrapped canvas for the wall. Real things, shipped to your door.',
                accent: '#C4622D',
              },
            ].map(p=>(
              <div key={p.sense} className="card" style={{padding:'48px 32px',textAlign:'center',borderTop:`3px solid ${p.accent}`}}>
                <div style={{fontSize:14,letterSpacing:'.4em',textTransform:'uppercase',color:p.accent,marginBottom:18,fontWeight:800}}>{p.sense}</div>
                <h3 className="serif" style={{fontSize:24,fontWeight:400,color:'var(--cream)',marginBottom:16,lineHeight:1.25}}>{p.headline}</h3>
                <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.85}}>{p.body}</p>
              </div>
            ))}
          </div>

          {/* Portrait examples — the SEE pillar brought to life */}
          <div style={{marginBottom:80}}>
            <div style={{textAlign:'center',marginBottom:28}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:10}}>Real Portraits, Real Pets</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,maxWidth:800,margin:'0 auto'}}>
              {[
                {img:'/portrait-sasha.png', name:'Sasha', desc:'Sunset cruise, name on the plate'},
                {img:'/portrait-maggie-mollie.png', name:'Sammy & Gracie', desc:'Golden hour at the family beach house'},
                {img:'/portrait-jack.png', name:'Jack', desc:'Top down in the Porsche, cruising Colorado'},
                {img:'/portrait-wyatt.png', name:'Wyatt', desc:'USA hockey fan on his favorite beach'},
              ].map(p=>(
                <div key={p.name} style={{borderRadius:6,overflow:'hidden',border:'1px solid var(--border)',transition:'transform .3s'}}>
                  <img src={p.img} alt={`${p.name} portrait`} style={{width:'100%',display:'block',aspectRatio:'3/4',objectFit:'cover'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <div style={{background:'#141414',padding:'12px 14px',borderTop:'1px solid var(--border)'}}>
                    <div style={{fontSize:12,color:'var(--gold)',fontWeight:600,marginBottom:2}}>{p.name}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div style={{marginBottom:48}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Real Stories</div>
            </div>
            <div className="responsive-grid-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
              {[
                {q:'My golden Rocky looks like actual royalty. I cried when I opened the box. Already ordered three more for the family.',name:'Sarah M.',role:'Golden Retriever mom, Denver'},
                {q:'The Memory Portrait of my two cats is the most personal gift I have ever given anyone. My mom called it a masterpiece.',name:'James T.',role:'Cat parent, Austin'},
                {q:'I told them Rocky loves the Broncos, rides in my Mustang, and his tennis ball. The portrait had all of it. I was speechless.',name:'Mike R.',role:'Lab mix owner, Boulder'},
              ].map((t,i)=>(
                <div key={i} className="card" style={{padding:'32px 28px'}}>
                  <div className="serif" style={{fontSize:48,color:'var(--gold)',opacity:.15,lineHeight:.7,marginBottom:18}}>&ldquo;</div>
                  <p style={{fontSize:14,lineHeight:1.85,fontStyle:'italic',color:'rgba(245,240,232,.85)',marginBottom:24}}>{t.q}</p>
                  <div style={{borderTop:'1px solid var(--border)',paddingTop:16}}>
                    <div style={{fontWeight:600,fontSize:12}}>{t.name}</div>
                    <div style={{fontSize:10,color:'var(--gold)',marginTop:3}}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Closing */}
          <div style={{textAlign:'center'}}>
            <p className="serif" style={{fontSize:'clamp(20px,3vw,28px)',color:'var(--gold)',marginBottom:28,fontStyle:'italic'}}>Every sense. Every detail. Every bit of who they are.</p>
            <Link href="/create" className="btn-gold">🐾 Start Their Story</Link>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{background:'var(--gold)',padding:'80px 60px',textAlign:'center'}}>
        <div style={{fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'rgba(10,10,10,.5)',marginBottom:16}}>See Them &nbsp;·&nbsp; Hear Them &nbsp;·&nbsp; Feel Them</div>
        <h2 className="serif" style={{fontSize:'clamp(32px,5vw,68px)',color:'var(--ink)',fontWeight:400,marginBottom:16}}>
          Give a Gift<br/>They&rsquo;ll Never Forget.
        </h2>
        <p style={{fontSize:17,color:'rgba(10,10,10,.6)',marginBottom:40,maxWidth:480,margin:'0 auto 40px',lineHeight:1.8}}>
          A portrait they&rsquo;ll stare at. A song they&rsquo;ll cry to. A blanket they&rsquo;ll never let go of.
        </p>
        <Link href="/create" style={{background:'var(--ink)',color:'var(--gold)',padding:'20px 52px',fontSize:12,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block'}}>
          🐾 Begin Their Story
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{background:'var(--soft)',padding:'44px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--border)',flexWrap:'wrap',gap:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span>🐾</span>
          <span className="serif" style={{fontSize:18}}>Pet Prints Studio</span>
        </div>
        <div style={{fontSize:11,color:'var(--muted)'}}>© 2025 Pet Prints Studio · Wilmington, NC</div>
        <div style={{display:'flex',gap:24}}>
          {[
            {l:'FAQ',h:'/faq'},
            {l:'Shipping & Returns',h:'/shipping'},
            {l:'About',h:'/about'},
            {l:'Styles',h:'/styles'},
            {l:'Contact',h:'mailto:johnagreuling@icloud.com'},
          ].map(({l,h})=>(
            <Link key={l} href={h} style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none'}}>{l}</Link>
          ))}
        </div>
      </footer>
    </main>
  )
}
