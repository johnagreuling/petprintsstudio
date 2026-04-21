'use client'
import Link from 'next/link'
import Image from 'next/image'
import SiteNav from '@/components/SiteNav'
import { useState, useEffect, useRef } from 'react'
import { ART_STYLES, PRODUCTS } from '@/lib/config'

type HeroShowcase = { url: string; style: string; pet: string }

export default function Home() {
  const [activeStyle, setActiveStyle] = useState(0)
  const [heroShowcase, setHeroShowcase] = useState<HeroShowcase[]>([])
  const sliderRef = useRef<HTMLDivElement>(null)

  // Load ALL curated portraits for the hero slider
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

        /* M4a — home mobile polish */
        @media (max-width: 720px) {
          .home-hero {
            padding: 110px 20px 60px !important;
            min-height: auto !important;
          }
          .home-hero h1 {
            font-size: 44px !important;
            line-height: 1.02 !important;
            margin-bottom: 20px !important;
          }
          .home-stats {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }

      `}</style>

      {/* NAV */}
      <SiteNav currentPage="home" />

      {/* HERO */}
      <section className="hero-section home-hero" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'110px 24px 48px',position:'relative',overflow:'hidden'}}>
        {/* Ambient glow */}
        <div style={{position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',width:800,height:800,background:'radial-gradient(circle,rgba(201,168,76,.06) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:'70%',left:'20%',width:400,height:400,background:'radial-gradient(circle,rgba(196,98,45,.04) 0%,transparent 70%)',pointerEvents:'none'}} />

        <h1 className="serif fu fu2" style={{fontSize:'clamp(44px,6.5vw,92px)',lineHeight:.96,marginBottom:22,fontWeight:400,maxWidth:1040,letterSpacing:'-.02em'}}>
          <em style={{color:'var(--gold)'}}>See</em> Them. <em style={{color:'var(--gold)'}}>Hear</em> Them.<br/><em style={{color:'var(--gold)'}}>Feel</em> Them.
        </h1>

        <div className="fu fu3" style={{marginBottom:24,display:'flex',flexDirection:'column',gap:10,alignItems:'center',maxWidth:820,margin:'0 auto 24px'}}>
          {[
            {label:'See', text:'Your beautiful custom portrait.', accent:'var(--gold)'},
            {label:'Hear', text:'A song you help write, just for your pet.', accent:'#A78BFA'},
            {label:'Feel', text:'Their love — every time you touch our luxury goods customized with their likeness.', accent:'#C4622D'},
          ].map(({label,text,accent})=>(
            <div key={label} style={{fontSize:'clamp(16px,1.6vw,20px)',color:'var(--cream)',lineHeight:1.4,fontWeight:300,textAlign:'center',letterSpacing:'.005em'}}>
              <span style={{color:accent,fontWeight:700,letterSpacing:'.28em',textTransform:'uppercase',fontSize:'clamp(12px,1.2vw,14px)',marginRight:14,verticalAlign:'middle'}}>{label}</span>
              <span style={{verticalAlign:'middle'}}>{text}</span>
            </div>
          ))}
          <div style={{marginTop:14,fontSize:11,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--gold)',fontWeight:600}}>From $49</div>
        </div>
        
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
            Horizontal scroll slider with curated portraits.
            Left/right arrows on desktop, native momentum thumb-flick on iOS.
            scroll-snap centers each card as it comes into view. ── */}
        {heroShowcase.length > 0 && (
          <div className="fu fu4" style={{position:'relative',width:'100%',maxWidth:1200,margin:'0 auto 8px'}}>
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
                  <Image src={item.url} alt={`${item.pet} — ${item.style}`} fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />
                  <div style={{
                    position:'absolute',
                    bottom:0,
                    left:0,
                    right:0,
                    padding:'40px 16px 14px',
                    background:'linear-gradient(to top, rgba(10,10,10,.92) 0%, transparent 100%)',
                  }}>
                    <div style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--gold)',fontWeight:600}}>{item.style}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Helper hint below slider */}
            <div style={{textAlign:'center',marginTop:14,fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'rgba(245,240,232,.3)'}}>
              Swipe · our curated library
            </div>
          </div>
        )}

      </section>

      {/* ── SONG PLAYER — right at the top so visitors can play while browsing ── */}
      <section style={{padding:'24px 60px',background:'#0A0A0A'}} className="section-padding">
        <div style={{maxWidth:800,margin:'0 auto',textAlign:'center',padding:'28px 32px',background:'linear-gradient(135deg,rgba(167,139,250,.05),rgba(10,10,10,.4))',border:'1px solid rgba(167,139,250,.15)',borderRadius:10}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'#A78BFA',marginBottom:14}}>Every Pet Gets a Song</div>
          <h3 className="serif" style={{fontSize:'clamp(24px,4vw,36px)',marginBottom:12,fontWeight:400,color:'var(--cream)',lineHeight:1.15}}>Press Play. Hear the Magic.</h3>
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
                <Image src="/process-upload.jpg" alt="Upload your pet's photo" fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />
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
                <Image src="/step2-wyatt.jpg" alt="Wyatt's personalized portrait" fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />
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
                      <Image src={s.url} alt={s.style} fill sizes="80px" style={{objectFit:'cover'}} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{padding:'20px 18px 24px'}}>
                <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:8,fontWeight:700}}>Step 3</div>
                <h3 className="serif" style={{fontSize:20,marginBottom:6,fontWeight:400}}>Make Your Selections</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.75}}>Pick your favorite custom portraits, choose your canvas size, and add beautiful individualized gifts from our curated collection.</p>
              </div>
            </div>

            {/* Step 4 — We Handle the Rest */}
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{aspectRatio:'3/4',overflow:'hidden',background:'#1a1412',position:'relative'}}>
                <Image src="/step4-delivered.png" alt="Canvas portrait being unboxed" fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />
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
        <Image src="/portrait-on-wall.png" alt="Pet portrait hanging in a beautiful home" fill sizes="100vw" priority style={{objectFit:'cover',objectPosition:'center 35%'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(10,10,10,.4) 0%, transparent 30%, transparent 70%, rgba(10,10,10,.8) 100%)'}} />
        <div style={{position:'absolute',bottom:28,left:0,right:0,textAlign:'center'}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:600}}>Gallery-Quality · Shipped to Your Door · Starting at $49</div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
           THE EXPERIENCE — one clean section, no redundancy
           ════════════════════════════════════════════════════════════ */}
      <section id="the-experience" style={{padding:'80px 60px',background:'#0A0A0A'}} className="section-padding">
        <div style={{maxWidth:1100,margin:'0 auto'}}>

          {/* Testimonials */}
          <div style={{marginBottom:48}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Real Stories</div>
            </div>
            <div className="responsive-grid-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
              {[
                {q:'The portrait we got of our puppy Hercules is the most amazing piece of art in our home. We ordered the 24x36 impasto and it looks like it belongs in a gallery — my wife cannot stop talking about it. The custom song somehow captured exactly how much we love him. My wife is an interior designer and she’s already used several of these pieces in client homes. Also, we love the king-size blanket!',pet:'/testimonial-hercules.jpg',petName:'Hercules',name:'Ryan S.',role:'Boulder, Colorado'},
                {q:'I was completely blown away when I opened ours. The portrait captured Bear’s personality perfectly — it feels like fine art and I love every time I see him. The song is amazing. My husband and I played it as soon as we got the package and we can’t stop listening to ‘Bear’s Mountain.’ We also ordered two beach towels and they are such a hit — awesome prints. Everything felt special and beautifully made.',pet:'/testimonial-bear.jpg',petName:'Bear',name:'Emily R.',role:'Cashiers, North Carolina'},
                {q:'Our daughter gave us one of the best gifts we’ve ever received — a beautiful portrait of my old friend Ranger. We hung the print in the living room and it still stops me every time I walk by. The sweatshirts are incredible too. But the custom song was the real surprise — it brought a tear to my eye and our whole family can’t stop playing it. Truly touching. Best gift I’ve ever gotten.',pet:'/testimonial-ranger.jpg',petName:'Ranger',name:'Mark T.',role:'Austin, Texas'},
              ].map((t,i)=>(
                <div key={i} className="card" style={{padding:0,overflow:'hidden',display:'flex',flexDirection:'column'}}>
              {/* Hero image — the art in a real home */}
              {t.pet && (
                <div style={{position:'relative',aspectRatio:'4/5',overflow:'hidden',background:'#0d0d0d'}}>
                  <Image
                    src={t.pet}
                    alt={`${t.petName}'s portrait in ${t.name}'s home`}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 33vw"
                    style={{objectFit:'cover'}}
                  />
                  {/* Pet name badge */}
                  <div style={{position:'absolute',bottom:12,left:12,background:'rgba(10,10,10,.82)',backdropFilter:'blur(6px)',padding:'6px 12px',fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',fontWeight:600,border:'1px solid rgba(201,168,76,.2)'}}>{t.petName}</div>
                </div>
              )}

              {/* Quote + signature */}
              <div style={{padding:'26px 26px 24px',display:'flex',flexDirection:'column',flex:1}}>
                <div style={{display:'flex',gap:3,marginBottom:14,color:'var(--gold)',fontSize:12,letterSpacing:'.15em'}}>★ ★ ★ ★ ★</div>
                <p style={{fontSize:14,lineHeight:1.8,fontStyle:'italic',color:'rgba(245,240,232,.88)',marginBottom:20,flex:1}}>{t.q}</p>
                <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
                  <div style={{fontWeight:600,fontSize:13}}>{t.name}</div>
                  <div style={{fontSize:10,color:'var(--gold)',marginTop:3,letterSpacing:'.1em',textTransform:'uppercase'}}>{t.role}</div>
                </div>
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

      {/* STATS + STYLES LINK (moved from hero) */}
      <section style={{padding:'80px 60px',background:'#0A0A0A',borderTop:'1px solid var(--border)'}} className="section-padding">
        <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
          <p style={{fontSize:12,color:'rgba(201,168,76,.6)',letterSpacing:'.08em',marginBottom:48}}>
            Curated artistic styles &nbsp;&middot;&nbsp; Every one included &nbsp;&middot;&nbsp; <Link href="/styles" style={{color:'var(--gold)',textDecoration:'none',borderBottom:'1px solid rgba(201,168,76,.4)'}}>Explore styles →</Link>
          </p>
          <div className="stats-bar home-stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:40,justifyContent:'center'}}>
            {[['✓','Curated Styles'],['1,000+','Pet Stories Told'],['♪','Beautiful Original Music'],['4.9★','Customer Average']].map(([n,l1])=>(
              <div key={l1} style={{textAlign:'center'}}>
                <div className="serif" style={{fontSize:36,color:'var(--gold)',lineHeight:1,marginBottom:4}}>{n}</div>
                <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--muted)',marginTop:6,lineHeight:1.6}}>{l1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{background:'var(--gold)',padding:'80px 60px',textAlign:'center'}}>
        <div style={{fontSize:9,letterSpacing:'.28em',textTransform:'uppercase',color:'rgba(10,10,10,.5)',marginBottom:10}}>See Them &nbsp;·&nbsp; Hear Them &nbsp;·&nbsp; Feel Them</div>
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
            {l:'Contact',h:'mailto:support@petprintsstudio.com'},
          ].map(({l,h})=>(
            <Link key={l} href={h} style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none'}}>{l}</Link>
          ))}
        </div>
      </footer>
    </main>
  )
}
