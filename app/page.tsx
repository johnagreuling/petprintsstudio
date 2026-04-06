'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ART_STYLES, PRODUCTS } from '@/lib/config'

export default function Home() {
  const [activeStyle, setActiveStyle] = useState(0)

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
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .8s ease forwards;opacity:0}
        .fu1{animation-delay:.05s}.fu2{animation-delay:.15s}.fu3{animation-delay:.25s}.fu4{animation-delay:.4s}
        @keyframes shimmer{0%,100%{opacity:.3}50%{opacity:.7}}
        .shimmer{animation:shimmer 3s ease infinite}
        .tag{display:inline-block;border:1px solid rgba(201,168,76,.3);color:var(--gold);font-size:10px;letter-spacing:.25em;text-transform:uppercase;padding:6px 14px;margin:4px}
        .popular-badge{position:absolute;top:10px;right:10px;background:var(--gold);color:var(--ink);font-size:8px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:3px 8px}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'20px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(10,10,10,.95)',backdropFilter:'blur(16px)',borderBottom:'1px solid var(--border)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <span style={{fontSize:22}}>🐾</span>
          <span className="serif" style={{fontSize:22,letterSpacing:'.06em',color:'var(--cream)'}}>Pet Prints Studio</span>
        </Link>
        <div style={{display:'flex',gap:36,alignItems:'center'}}>
          <a href="#how-it-works">How It Works</a>
          <a href="#styles">Styles</a>
          <a href="#products">Products</a>
          <Link href="/create" className="btn-gold" style={{padding:'12px 24px'}}>Create Yours</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'140px 24px 80px',position:'relative',overflow:'hidden'}}>
        {/* Ambient glow */}
        <div style={{position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',width:800,height:800,background:'radial-gradient(circle,rgba(201,168,76,.06) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:'70%',left:'20%',width:400,height:400,background:'radial-gradient(circle,rgba(196,98,45,.04) 0%,transparent 70%)',pointerEvents:'none'}} />

        <div className="fu fu1" style={{marginBottom:20,fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'var(--gold)',fontWeight:500}}>
          Fine Art Pet Portraits · Printed & Shipped
        </div>

        <h1 className="serif fu fu2" style={{fontSize:'clamp(52px,7vw,104px)',lineHeight:1,marginBottom:24,fontWeight:400,maxWidth:1000}}>
          Your Pet.<br/><em style={{color:'var(--gold)'}}>Gallery Worthy.</em>
        </h1>

        <p className="fu fu3" style={{fontSize:18,lineHeight:1.9,color:'var(--muted)',maxWidth:560,marginBottom:52,fontWeight:300}}>
          Upload a photo. Choose your canvas size. Our custom-tuned AI generates 24 stunning portrait options across 8 artistic styles — pick your favorites and we print and ship directly to your door.
        </p>

        <div className="fu fu4" style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',marginBottom:72}}>
          <Link href="/create" className="btn-gold">🐾 Start Your Portrait</Link>
          <a href="#how-it-works" className="btn-out">See How It Works</a>
        </div>

        {/* Style tags */}
        <div className="fu fu4" style={{marginBottom:64,display:'flex',flexWrap:'wrap',justifyContent:'center',gap:8}}>
          {ART_STYLES.map(s => (
            s.styleImage ? (
              <div key={s.id} style={{display:'flex',alignItems:'center',gap:8,border:'1px solid rgba(201,168,76,.3)',padding:'6px 12px 6px 6px'}}>
                <img src={s.styleImage} alt={s.name} style={{width:28,height:28,objectFit:'cover'}} />
                <span style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)'}}>{s.name}</span>
              </div>
            ) : (
              <span key={s.id} className="tag">{s.emoji} {s.name}</span>
            )
          ))}
        </div>

        {/* Stats */}
        <div className="fu fu4" style={{display:'flex',gap:60,flexWrap:'wrap',justifyContent:'center'}}>
          {[['24','Portraits Generated','Per Order'],['8','Artistic','Styles Available'],['15+','Print','Products'],['4.9★','Average','Customer Rating']].map(([n,l1,l2])=>(
            <div key={l1} style={{textAlign:'center'}}>
              <div className="serif" style={{fontSize:40,color:'var(--gold)',lineHeight:1}}>{n}</div>
              <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--muted)',marginTop:6,lineHeight:1.6}}>{l1}<br/>{l2}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"/>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{padding:'120px 60px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:80}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Simple Process</div>
            <h2 className="serif" style={{fontSize:'clamp(40px,5vw,72px)',fontWeight:400}}>From Photo to <em>Fine Art</em></h2>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
            {[
              {n:'01',icon:'📸',title:'Upload Your Photo',desc:'Any clear photo of your pet works best. Front-facing, good lighting — we handle the rest.'},
              {n:'02',icon:'🖼️',title:'Choose Your Canvas',desc:'Select the size and product you want. Canvas, fine art print, mug, blanket — you pick first, then we generate.'},
              {n:'03',icon:'⚡',title:'Get 24 Portraits',desc:'Our custom-tuned AI generates 24 stunning variations across 8 artistic styles. Browse them all and pick your favorite — no commitment until you choose.'},
              {n:'04',icon:'📦',title:'We Print & Ship',desc:'We print your chosen portrait on premium materials and ship directly to your door in 5–7 days.'},
            ].map((s,i)=>(
              <div key={s.n} className="card" style={{padding:'40px 28px',position:'relative'}}>
                <div className="serif" style={{fontSize:64,color:'var(--gold)',opacity:.1,lineHeight:1,position:'absolute',top:20,right:20}}>{s.n}</div>
                <div style={{fontSize:36,marginBottom:20}}>{s.icon}</div>
                <h3 className="serif" style={{fontSize:22,marginBottom:12,fontWeight:400}}>{s.title}</h3>
                <p style={{fontSize:13,lineHeight:1.9,color:'var(--muted)'}}>{s.desc}</p>
                {i<3&&<div style={{position:'absolute',right:-12,top:'50%',transform:'translateY(-50%)',color:'var(--gold)',fontSize:20,zIndex:1,opacity:.4}}>›</div>}
              </div>
            ))}
          </div>

          {/* Two paths */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2,marginTop:2}}>
            <div className="card" style={{padding:'44px 40px',borderTop:'2px solid rgba(201,168,76,.2)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <span style={{fontSize:28}}>🎨</span>
                <div>
                  <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:4}}>Path One</div>
                  <h3 className="serif" style={{fontSize:26,fontWeight:400}}>Style Transfer</h3>
                </div>
              </div>
              <p style={{fontSize:14,lineHeight:1.9,color:'var(--muted)',marginBottom:20}}>
                Upload your pet’s photo and our custom-tuned AI reimagines it across 8 stunning artistic styles — oil painting, watercolor, pop art, pencil sketch and more. 24 portraits ready in under 2 minutes.
              </p>
              <div style={{fontSize:11,color:'var(--gold)'}}>✓ 24 portraits generated  ·  ✓ 8 artistic styles  ·  ✓ Ready in under 2 minnbsp; ✓ 8 art styles</div>
            </div>
            <div className="card" style={{padding:'44px 40px',borderTop:'2px solid var(--gold)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <span style={{fontSize:28}}>✨</span>
                <div>
                  <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:4}}>Path Two — +$20</div>
                  <h3 className="serif" style={{fontSize:26,fontWeight:400}}>Memory Portrait</h3>
                </div>
              </div>
              <p style={{fontSize:14,lineHeight:1.9,color:'var(--muted)',marginBottom:20}}>
                We build a fully custom scene packed with personal easter eggs from your pet&rsquo;s life — favorite team collar, hometown backdrop, their car, their toy — a portrait that tells their whole story.
              </p>
              <div style={{fontSize:11,color:'var(--gold)'}}>✓ Human-reviewed prompt &nbsp;·&nbsp; ✓ Personal easter eggs &nbsp;·&nbsp; ✓ Truly one-of-a-kind</div>
            </div>
          </div>

          <div style={{textAlign:'center',marginTop:56}}>
            <Link href="/create" className="btn-gold">Start Creating Now</Link>
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* STYLES */}
      <section id="styles" style={{padding:'120px 60px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>8 Artistic Styles</div>
            <h2 className="serif" style={{fontSize:'clamp(40px,5vw,72px)',fontWeight:400}}>Every Style. <em>One Pet.</em></h2>
            <p style={{color:'var(--muted)',fontSize:16,marginTop:14,maxWidth:480,margin:'14px auto 0',lineHeight:1.8}}>
              From classical oil to modern pop art — our custom-tuned AI generates 3 variations per style, giving you 24 portraits to choose from. Gallery-worthy results, every time.
            </p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
            {ART_STYLES.map((s,i)=>(
              <button key={s.id} className={`style-btn${activeStyle===i?' active':''}`} onClick={()=>setActiveStyle(i)}>
                {s.styleImage ? (
                  <img src={s.styleImage} alt={s.name} />
                ) : (
                  <div style={{fontSize:32,padding:'28px 20px 8px'}}>{s.emoji}</div>
                )}
                <div className="style-btn-info">
                  <div className="serif" style={{fontSize:18,marginBottom:4,fontWeight:400}}>{s.name}</div>
                  <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.6}}>{s.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{background:'var(--soft)',border:'1px solid var(--border)',padding:'32px 40px',marginTop:2,display:'flex',alignItems:'center',gap:40,flexWrap:'wrap'}}>
            {ART_STYLES[activeStyle].styleImage && (
              <div style={{width:100,height:100,overflow:'hidden',flexShrink:0,border:'1px solid var(--border)'}}>
                <img src={ART_STYLES[activeStyle].styleImage} alt={ART_STYLES[activeStyle].name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
            )}
            <div style={{flex:1,minWidth:280}}>
              <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>Currently Selected</div>
              <div className="serif" style={{fontSize:28,fontWeight:400}}>{ART_STYLES[activeStyle].name}</div>
              <div style={{fontSize:13,color:'var(--muted)',marginTop:8,lineHeight:1.7}}>{ART_STYLES[activeStyle].description}</div>
            </div>
            <div>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>Powered by</div>
              <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                {['fal.ai FLUX 1.1 Pro','Stable Diffusion XL','Astria LoRA Fine-Tuning'].map(m=>(
                  <span key={m} style={{border:'1px solid var(--border)',padding:'6px 14px',fontSize:11,color:'var(--muted)',letterSpacing:'.08em'}}>{m}</span>
                ))}
              </div>
            </div>
            <Link href="/create" className="btn-gold" style={{flexShrink:0}}>Generate In This Style</Link>
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* PRODUCTS */}
      <section id="products" style={{padding:'120px 60px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>15+ Products</div>
            <h2 className="serif" style={{fontSize:'clamp(40px,5vw,72px)',fontWeight:400}}>Put Your Pet <em>Everywhere</em></h2>
            <p style={{color:'var(--muted)',fontSize:16,marginTop:14,maxWidth:520,margin:'14px auto 0',lineHeight:1.8}}>
              Your portrait, on anything. Every product is printed on demand and shipped directly to your door.
            </p>
          </div>

          {['Canvas','Prints','Home','Apparel','Accessories'].map(cat=>{
            const items = PRODUCTS.filter(p=>p.category===cat)
            return (
              <div key={cat} style={{marginBottom:48}}>
                <div style={{fontSize:9,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16,display:'flex',alignItems:'center',gap:16}}>
                  <span>{cat}</span><span style={{flex:1,height:1,background:'var(--border)'}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:2}}>
                  {items.map(p=>(
                    <div key={p.id} className="card" style={{padding:'24px 20px',position:'relative'}}>
                      {p.popular&&<div className="popular-badge">Most Popular</div>}
                      <div style={{fontSize:26,marginBottom:12}}>{p.emoji}</div>
                      <div className="serif" style={{fontSize:17,marginBottom:4,fontWeight:400}}>{p.name}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>{p.size}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginBottom:14,opacity:.6}}>{p.description}</div>
                      <div className="serif" style={{fontSize:22,color:'var(--gold)'}}>${p.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="divider"/>

      {/* MEMORY PORTRAIT FEATURE */}
      <section style={{padding:'120px 60px',background:'var(--soft)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>The Premium Experience</div>
            <h2 className="serif" style={{fontSize:'clamp(36px,4vw,60px)',fontWeight:400,marginBottom:24,lineHeight:1.1}}>Memory Portraits.<br/><em>Packed with Easter Eggs.</em></h2>
            <p style={{fontSize:16,lineHeight:1.9,color:'var(--muted)',marginBottom:32}}>
              We ask you 15 targeted questions about your pet&rsquo;s life — their favorite sports team, the car they love riding in, their hometown, their go-to toy — and build it all into the scene. The result is a portrait that makes you say &ldquo;oh my god, that&rsquo;s exactly them.&rdquo;
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:40}}>
              {[
                {icon:'🏈', text:'Favorite team collar or jersey in the scene'},
                {icon:'🚗', text:"Their beloved car — they're in the passenger seat, ears out the window"},
                {icon:'📍', text:'Hometown backdrop with recognizable landmarks'},
                {icon:'🎾', text:'Favorite toy placed right in their paw'},
                {icon:'🍕', text:'Their favorite food somewhere in the scene'},
                {icon:'✨', text:'Every answer becomes a visual easter egg'},
              ].map(({icon,text})=>(
                <div key={text} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                  <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                  <span style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>{text}</span>
                </div>
              ))}
            </div>
            <Link href="/create" className="btn-gold">Try Memory Portrait — +$20</Link>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            <div style={{background:'var(--mid)',border:'1px solid var(--border)',padding:'28px 28px 24px',position:'relative'}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Example Prompt Built From Answers</div>
              <p style={{fontSize:13,lineHeight:1.9,color:'var(--muted)',fontFamily:'monospace',background:'rgba(201,168,76,.03)',padding:'16px',border:'1px solid var(--border)',borderRadius:2}}>
                &ldquo;A golden retriever named Rocky with one floppy ear, wearing a Denver Broncos bandana, leaning out the window of a red 1967 Ford Mustang convertible, driving through downtown Boulder Colorado on a golden fall afternoon, a tennis ball in his paw, In-N-Out sign visible in background, warm dramatic oil painting style&rdquo;
              </p>
            </div>
            <div style={{background:'var(--mid)',border:'1px solid var(--border)',padding:'24px 28px'}}>
              <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.8}}>
                <div style={{color:'var(--cream)',fontWeight:500,marginBottom:8}}>Human-reviewed before generation</div>
                Our team reviews every Memory Portrait prompt before the AI runs — ensuring the scene makes sense, catches any conflicts, and is set up for the best possible result. That&rsquo;s the +$20 difference.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* TESTIMONIALS */}
      <section style={{padding:'100px 60px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Happy Pet Parents</div>
            <h2 className="serif" style={{fontSize:'clamp(36px,5vw,64px)',fontWeight:400}}>They <em>Loved</em> It</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2}}>
            {[
              {q:'My golden Rocky looks like actual royalty. I cried when I opened the box. Already ordered three more for the family.',name:'Sarah M.',role:'Golden Retriever owner, Denver CO'},
              {q:'The Memory Portrait of my two cats is the most personal gift I have ever given anyone. My mom called it a masterpiece.',name:'James T.',role:'Cat parent, Austin TX'},
              {q:'I told them Rocky loves the Broncos, rides in my Mustang, and his tennis ball. The portrait had all of it. I was speechless.',name:'Mike R.',role:'Lab mix owner, Boulder CO'},
            ].map((t,i)=>(
              <div key={i} className="card" style={{padding:'36px 32px'}}>
                <div className="serif" style={{fontSize:52,color:'var(--gold)',opacity:.2,lineHeight:.7,marginBottom:20}}>&ldquo;</div>
                <p style={{fontSize:15,lineHeight:1.9,fontStyle:'italic',color:'var(--cream)',marginBottom:28}}>{t.q}</p>
                <div style={{borderTop:'1px solid var(--border)',paddingTop:20}}>
                  <div style={{fontWeight:600,fontSize:13}}>{t.name}</div>
                  <div style={{fontSize:11,color:'var(--gold)',marginTop:4}}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{background:'var(--gold)',padding:'80px 60px',textAlign:'center'}}>
        <h2 className="serif" style={{fontSize:'clamp(32px,5vw,64px)',color:'var(--ink)',fontWeight:400,marginBottom:16}}>
          Ready to Make Your Pet Famous?
        </h2>
        <p style={{fontSize:17,color:'rgba(10,10,10,.6)',marginBottom:40,maxWidth:460,margin:'0 auto 40px',lineHeight:1.8}}>
          Start with a canvas. Our AI does the rest. Ships in 5–7 days.
        </p>
        <Link href="/create" style={{background:'var(--ink)',color:'var(--gold)',padding:'20px 52px',fontSize:12,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block',transition:'all .3s'}}>
          🐾 Create Your Portrait Now
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{background:'var(--soft)',padding:'44px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--border)',flexWrap:'wrap',gap:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span>🐾</span>
          <span className="serif" style={{fontSize:18}}>Pet Prints Studio</span>
        </div>
        <div style={{fontSize:11,color:'var(--muted)'}}>© 2025 Pet Prints Studio · AI-Generated Pet Portraits</div>
        <div style={{display:'flex',gap:24}}>
          {['Privacy','Terms','Contact'].map(l=>(
            <a key={l} href="#" style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none'}}>{l}</a>
          ))}
        </div>
      </footer>
    </main>
  )
}
