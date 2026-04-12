'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ART_STYLES } from '@/lib/config'

export default function StylesGallery() {
  const [lightbox, setLightbox] = useState<null | {style: typeof ART_STYLES[0], idx: number}>(null)

  function prev() {
    if (!lightbox) return
    const i = (lightbox.idx - 1 + ART_STYLES.length) % ART_STYLES.length
    setLightbox({style: ART_STYLES[i], idx: i})
  }
  function next() {
    if (!lightbox) return
    const i = (lightbox.idx + 1) % ART_STYLES.length
    setLightbox({style: ART_STYLES[i], idx: i})
  }

  return (
    <main style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .serif { font-family: 'Cormorant Garamond', serif; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --gold: #C9A84C; --cream: #F5F0E8; --ink: #0A0A0A; --muted: rgba(245,240,232,.5); --border: rgba(245,240,232,.08); }
        .style-card { cursor: pointer; transition: transform .2s, box-shadow .2s; }
        .style-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.6); }
        .style-card:hover .card-overlay { opacity: 1; }
        .card-overlay { opacity: 0; transition: opacity .2s; }
      `}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'20px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(10,10,10,.9)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--border)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <span style={{fontSize:22}}>🐾</span>
          <span className="serif" style={{fontSize:22,letterSpacing:'.06em',color:'var(--cream)'}}>Pet Prints Studio</span>
        </Link>
        <div style={{display:'flex',gap:32,alignItems:'center'}}>
          <Link href="/#how-it-works" style={{color:'rgba(245,240,232,.5)',textDecoration:'none',fontSize:11,letterSpacing:'.18em',textTransform:'uppercase'}}>How It Works</Link>
          <Link href="/styles" style={{color:'var(--gold)',textDecoration:'none',fontSize:11,letterSpacing:'.18em',textTransform:'uppercase',borderBottom:'1px solid var(--gold)',paddingBottom:2}}>Styles</Link>
          <Link href="/#the-experience" style={{color:'rgba(245,240,232,.5)',textDecoration:'none',fontSize:11,letterSpacing:'.18em',textTransform:'uppercase'}}>The Experience</Link>
          <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'10px 24px',fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none'}}>🐾 Start Their Story</Link>
        </div>
      </nav>

      <section style={{paddingTop:140,paddingBottom:60,textAlign:'center',padding:'140px 48px 60px'}}>
        <div style={{fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>Infinite Styles &bull; 16 Custom-Tuned Presets</div>
        <h1 className="serif" style={{fontSize:'clamp(40px,6vw,80px)',fontWeight:400,marginBottom:16,lineHeight:1.05}}>
          Every Portrait.<br/><em>A Different Story.</em>
        </h1>
        <p style={{color:'var(--muted)',fontSize:17,maxWidth:520,margin:'0 auto 40px',lineHeight:1.9}}>
          Upload one photo. We generate a portrait in every style — you just pick the one that feels most like them.
        </p>
        <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'16px 44px',fontSize:12,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block'}}>🐾 Start Their Story — $49</Link>
      </section>

      <section style={{padding:'0 48px 80px',maxWidth:1400,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:3}}>
          {ART_STYLES.map((style, idx) => (
            <div key={style.id} className="style-card" style={{position:'relative',aspectRatio:'3/4',overflow:'hidden',background:'#111'}} onClick={() => setLightbox({style, idx})}>
              {style.styleImage
                ? <img src={style.styleImage} alt={style.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                : <div style={{width:'100%',height:'100%',background:(style as any).styleBg||'#1a1a1a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
                    <div style={{fontSize:48}}>{style.emoji}</div>
                    <div style={{fontSize:13,color:(style as any).styleAccent||'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase'}}>{style.name}</div>
                  </div>
              }
              <div className="card-overlay" style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(10,10,10,.95) 0%, rgba(10,10,10,.3) 50%, transparent 100%)'}}>
                <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'24px 20px'}}>
                  <div style={{fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:6}}>{style.emoji} {style.name}</div>
                  <p style={{fontSize:13,color:'rgba(245,240,232,.8)',lineHeight:1.6}}>{style.description}</p>
                  <div style={{marginTop:14,fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',borderBottom:'1px solid var(--gold)',paddingBottom:2,display:'inline-block'}}>View Full Size →</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightbox && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.96)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}} onClick={() => setLightbox(null)}>
          <div style={{position:'relative',maxWidth:680,width:'100%'}} onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} style={{position:'absolute',top:-48,right:0,background:'none',border:'none',color:'var(--cream)',fontSize:28,cursor:'pointer',padding:8,opacity:.7}}>✕</button>
            <button onClick={prev} style={{position:'absolute',left:-64,top:'40%',transform:'translateY(-50%)',background:'rgba(245,240,232,.08)',border:'1px solid rgba(245,240,232,.15)',color:'var(--cream)',fontSize:24,cursor:'pointer',padding:'14px 18px'}}>‹</button>
            <button onClick={next} style={{position:'absolute',right:-64,top:'40%',transform:'translateY(-50%)',background:'rgba(245,240,232,.08)',border:'1px solid rgba(245,240,232,.15)',color:'var(--cream)',fontSize:24,cursor:'pointer',padding:'14px 18px'}}>›</button>
            <div style={{aspectRatio:'3/4',overflow:'hidden',marginBottom:20}}>
              {lightbox.style.styleImage
                ? <img src={lightbox.style.styleImage} alt={lightbox.style.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                : <div style={{width:'100%',height:'100%',background:(lightbox.style as any).styleBg||'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:80}}>{lightbox.style.emoji}</div>
              }
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>{lightbox.style.emoji} Style {lightbox.idx + 1} of {ART_STYLES.length}</div>
              <h2 className="serif" style={{fontSize:36,fontWeight:400,marginBottom:8}}>{lightbox.style.name}</h2>
              <p style={{color:'var(--muted)',fontSize:14,lineHeight:1.8,maxWidth:440,margin:'0 auto 24px'}}>{lightbox.style.description}</p>
              <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'14px 36px',fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block'}} onClick={() => setLightbox(null)}>🐾 Generate This Style — $49</Link>
            </div>
            <div style={{display:'flex',gap:6,justifyContent:'center',marginTop:24}}>
              {ART_STYLES.map((_, i) => (
                <button key={i} onClick={() => setLightbox({style:ART_STYLES[i],idx:i})} style={{width:6,height:6,borderRadius:'50%',border:'none',cursor:'pointer',background:i===lightbox.idx?'var(--gold)':'rgba(245,240,232,.2)',padding:0}} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Signature Portraits Row */}
      <section style={{padding:'80px 48px',maxWidth:1400,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Signature Portraits</div>
          <h2 className="serif" style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:400,marginBottom:12}}>Impasto Expressionism</h2>
          <p style={{color:'var(--muted)',fontSize:15,maxWidth:600,margin:'0 auto',lineHeight:1.8}}>
            Heavy palette-knife texture, bold broken brush strokes, and a surreal French editorial atmosphere. Museum-quality fine art that tells their story.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          <div>
            <div style={{borderRadius:8,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.4)',aspectRatio:'2/3'}}>
              <img src="/styles/signature-jack.png" alt="Signature Portrait - Jack" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            </div>
            <p style={{textAlign:'center',marginTop:12,fontSize:12,color:'var(--muted)',fontStyle:'italic'}}>&ldquo;Jack&rdquo;</p>
          </div>
          <div>
            <div style={{borderRadius:8,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.4)',aspectRatio:'2/3'}}>
              <img src="/styles/signature-sylas.png" alt="Signature Portrait - Sylas" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            </div>
            <p style={{textAlign:'center',marginTop:12,fontSize:12,color:'var(--muted)',fontStyle:'italic'}}>&ldquo;Sylas&rdquo;</p>
          </div>
          <div>
            <div style={{borderRadius:8,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.4)',aspectRatio:'2/3'}}>
              <img src="/styles/signature-mason.png" alt="Signature Portrait - Mason" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            </div>
            <p style={{textAlign:'center',marginTop:12,fontSize:12,color:'var(--muted)',fontStyle:'italic'}}>&ldquo;Mason&rdquo;</p>
          </div>
        </div>
      </section>

      <section style={{background:'var(--gold)',padding:'80px 48px',textAlign:'center'}}>
        <h2 className="serif" style={{fontSize:'clamp(32px,5vw,64px)',color:'var(--ink)',fontWeight:400,marginBottom:16}}>Infinite Styles.<br/>16 Custom-Tuned Presets.</h2>
        <p style={{fontSize:17,color:'rgba(10,10,10,.6)',marginBottom:40,maxWidth:460,margin:'0 auto 40px',lineHeight:1.8}}>Upload your pet&rsquo;s photo and get a portrait in every style. Pick your favorite.</p>
        <Link href="/create" style={{background:'var(--ink)',color:'var(--gold)',padding:'18px 52px',fontSize:12,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block'}}>🐾 Start Their Story — $49</Link>
      </section>
    </main>
  )
}
