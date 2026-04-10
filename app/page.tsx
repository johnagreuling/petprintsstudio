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
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .8s ease forwards}
        .fu1{animation-delay:.05s}.fu2{animation-delay:.1s}.fu3{animation-delay:.18s}.fu4{animation-delay:.28s}
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
          <Link href="/styles" style={{color:'var(--muted)',textDecoration:'none',fontSize:12,letterSpacing:'.12em',textTransform:'uppercase'}}>Styles</Link>
          <a href="#the-experience">The Experience</a>
          <Link href="/create" className="btn-gold" style={{padding:'12px 24px'}}>Begin Their Story</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'140px 24px 80px',position:'relative',overflow:'hidden'}}>
        {/* Ambient glow */}
        <div style={{position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',width:800,height:800,background:'radial-gradient(circle,rgba(201,168,76,.06) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:'70%',left:'20%',width:400,height:400,background:'radial-gradient(circle,rgba(196,98,45,.04) 0%,transparent 70%)',pointerEvents:'none'}} />

        <div className="fu fu1" style={{marginBottom:20,fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'var(--gold)',fontWeight:500}}>
          The most meaningful gift for a pet lover
        </div>

        <h1 className="serif fu fu2" style={{fontSize:'clamp(52px,7vw,104px)',lineHeight:1,marginBottom:24,fontWeight:400,maxWidth:1000}}>
          Turn Their Story Into<br/><em style={{color:'var(--gold)'}}>Something Unforgettable.</em>
        </h1>

        <p className="fu fu3" style={{fontSize:18,lineHeight:1.9,color:'var(--muted)',maxWidth:560,marginBottom:52,fontWeight:300}}>
          A custom portrait that captures who they are. An original song written just for them. A QR code that plays it every time you look at the wall.
        </p>

        <p className="fu fu3" style={{fontSize:13,color:'rgba(201,168,76,.8)',letterSpacing:'.04em',lineHeight:2,marginBottom:16}}>Portrait + Song + QR Code &nbsp;&middot;&nbsp; Delivered in 24 hours &nbsp;&middot;&nbsp; Starting at $49</p>
        <div className="fu fu4" style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',marginBottom:72}}>
          <Link href="/create" className="btn-gold">🐾 Start Their Story</Link>
          <a href="#how-it-works" className="btn-out">See How It Works</a>
        </div>

        {/* Style hint */}
        <div className="fu fu4" style={{marginBottom:64,textAlign:'center'}}>
          <p style={{fontSize:12,color:'rgba(201,168,76,.6)',letterSpacing:'.08em'}}>
            Infinite styles &amp; customization &nbsp;&middot;&nbsp; 16 custom-tuned presets for stunning results &nbsp;&middot;&nbsp; <Link href="/styles" style={{color:'var(--gold)',textDecoration:'none',borderBottom:'1px solid rgba(201,168,76,.4)'}}>Explore styles →</Link>
          </p>
        </div>

        {/* Stats */}
        <div className="fu fu4" style={{display:'flex',gap:60,flexWrap:'wrap',justifyContent:'center'}}>
          {[['36','Portraits Per Story'],['1,000+','Pet Stories Told'],['♪','Beautiful Original Music'],['4.9★','Customer Average']].map(([n,l1])=>(
            <div key={l1} style={{textAlign:'center'}}>
              <div className="serif" style={{fontSize:36,color:'var(--gold)',lineHeight:1,marginBottom:4}}>{n}</div>
              <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--muted)',marginTop:6,lineHeight:1.6}}>{l1}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"/>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{padding:'120px 60px',background:'#0d0d0d'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:80}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>The Process</div>
            <h2 className="serif" style={{fontSize:'clamp(40px,5vw,72px)',fontWeight:400}}>Tell Us Who They Are.<br/><em>We&rsquo;ll Bring Them to Life.</em></h2>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:2}}>

            {/* STEP 1 — Upload photo */}
            <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
              <div style={{background:'var(--ink)',padding:'12px 0',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:42,fontWeight:900,color:'var(--gold)',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>1</div>
              </div>
              <div style={{aspectRatio:'1',overflow:'hidden',background:'#1a1412',position:'relative'}}>
                <img src="/process-upload.jpg" alt="Upload your pet photo" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,.6) 0%,transparent 50%)'}} />
              </div>
              <div style={{padding:'20px 20px 28px'}}>
                <h3 className="serif" style={{fontSize:20,marginBottom:8,fontWeight:400}}>Upload Their Photo</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}>A clear, well-lit photo is all we need. Front-facing works best.</p>
              </div>
            </div>

            {/* STEP 2 — Questionnaire */}
            <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
              <div style={{background:'var(--ink)',padding:'12px 0',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:42,fontWeight:900,color:'var(--gold)',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>2</div>
              </div>
              <div style={{aspectRatio:'1',overflow:'hidden',background:'#111',position:'relative',display:'flex',flexDirection:'column',justifyContent:'center',padding:'20px 18px',gap:8}}>
                {[
                  {q:'What makes them unique?',a:'She carries her squeaky toy everywhere...'},
                  {q:'Favorite place?',a:'The back seat with the window down'},
                  {q:'How do they greet you?',a:'Spins in circles, never stops'},
                  {q:'What would their song say?',a:'Something about being loved completely'},
                ].map((item,i)=>(
                  <div key={i} style={{background:'rgba(245,240,232,.05)',border:'1px solid rgba(245,240,232,.08)',padding:'8px 10px',borderRadius:2}}>
                    <div style={{fontSize:8,color:'var(--gold)',letterSpacing:'.15em',textTransform:'uppercase',marginBottom:3}}>{item.q}</div>
                    <div style={{fontSize:10,color:'rgba(245,240,232,.7)',lineHeight:1.4,fontStyle:'italic'}}>&ldquo;{item.a}&rdquo;</div>
                  </div>
                ))}
              </div>
              <div style={{padding:'20px 20px 28px'}}>
                <h3 className="serif" style={{fontSize:20,marginBottom:8,fontWeight:400}}>Tell Us Their Story</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}>Share their name, personality, quirks, favorite places. The more you tell us, the more personal every portrait becomes.</p>
              </div>
            </div>

            {/* STEP 3 — Choose style */}
            <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
              <div style={{background:'var(--ink)',padding:'12px 0',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:42,fontWeight:900,color:'var(--gold)',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>3</div>
              </div>
              <div style={{aspectRatio:'1',overflow:'hidden',background:'#111',position:'relative'}}>
                <div style={{width:'100%',height:'100%',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1.5,padding:1.5}}>
                  {ART_STYLES.slice(0,16).map(s=>(
                    <div key={s.id} style={{overflow:'hidden',position:'relative'}}>
                      {s.styleImage
                        ? <img src={s.styleImage} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                        : <div style={{width:'100%',height:'100%',background:(s as any).styleBg||'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>{s.emoji}</div>
                      }
                    </div>
                  ))}
                </div>
              </div>
              <div style={{padding:'20px 20px 28px'}}>
                <h3 className="serif" style={{fontSize:20,marginBottom:8,fontWeight:400}}>Choose Your Style</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}>16 custom-tuned styles from Oil Painting to Neon Glow — or describe any style you can imagine.</p>
              </div>
            </div>

            {/* STEP 4 — Portrait generated */}
            <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
              <div style={{background:'var(--ink)',padding:'12px 0',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:42,fontWeight:900,color:'var(--gold)',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>4</div>
              </div>
              <div style={{aspectRatio:'1',overflow:'hidden',background:'#1a1412',position:'relative'}}>
                <img src="https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/a5fcc975-46e3-477a-8de2-60ece3f6b0db.png" alt="Your portrait" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,.5) 0%,transparent 40%)'}} />
              </div>
              <div style={{padding:'20px 20px 28px'}}>
                <h3 className="serif" style={{fontSize:20,marginBottom:8,fontWeight:400}}>Pick Your Portrait</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}>We generate your portrait across all 16 styles. Pick the one that feels most like them.</p>
              </div>
            </div>

            {/* STEP 5 — Printed & shipped */}
            <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
              <div style={{background:'var(--ink)',padding:'12px 0',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:42,fontWeight:900,color:'var(--gold)',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>5</div>
              </div>
              <div style={{aspectRatio:'1',overflow:'hidden',background:'#1a1412',position:'relative'}}>
                <img src="https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/69508879-38da-4363-8550-bfa2b0de317a.png" alt="Printed and shipped" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,.5) 0%,transparent 40%)'}} />
              </div>
              <div style={{padding:'20px 20px 28px'}}>
                <h3 className="serif" style={{fontSize:20,marginBottom:8,fontWeight:400}}>Printed &amp; Shipped</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}>Premium canvas or fine art print delivered to your door. Scan the QR code to hear their song.</p>
              </div>
            </div>

          </div>

          {/* The Best Part — Testimonial section */}
          <div className="card" style={{padding:0,overflow:'hidden',position:'relative',display:'grid',gridTemplateColumns:'1fr 1fr',marginTop:2}}>
            <div style={{position:'relative',overflow:'hidden',minHeight:360}}>
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&fit=crop&crop=faces"
                alt="Overwhelmed with joy"
                style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',display:'block'}}
                onError={(e)=>{(e.target as HTMLImageElement).style.opacity='0'}}
              />
              <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg, rgba(10,10,10,.05) 0%, rgba(10,10,10,.4) 100%)'}} />
            </div>
            <div style={{padding:'48px 52px',display:'flex',flexDirection:'column',justifyContent:'center',background:'#111'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>The Best Part</div>
              <h3 className="serif" style={{fontSize:'clamp(26px,3.5vw,46px)',fontWeight:400,marginBottom:20,lineHeight:1.1}}>
                They Open It.<br/><em>They&rsquo;re Overwhelmed.</em>
              </h3>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.9,marginBottom:24}}>
                There is no better gift. A custom portrait of the one they love most — in an art style picked just for them — with a song written just for their pet. This is the one they cry over. In a good way.
              </p>
              <p style={{fontSize:13,color:'rgba(201,168,76,.55)',fontStyle:'italic',lineHeight:1.7,borderLeft:'2px solid rgba(201,168,76,.25)',paddingLeft:16}}>
                &ldquo;I gave this to my mom for her birthday. She hasn&rsquo;t stopped talking about it. She shows everyone who walks in the door.&rdquo;
              </p>
            </div>
          </div>

          <div style={{textAlign:'center',marginTop:64}}>
            <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'22px 64px',fontSize:15,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none',display:'inline-block',boxShadow:'0 8px 40px rgba(201,168,76,.35)'}}>
              🐾 &nbsp;Start Their Story Now
            </Link>
            <p style={{marginTop:16,fontSize:12,color:'var(--muted)'}}>Free to preview &nbsp;&middot;&nbsp; No account needed &nbsp;&middot;&nbsp; Prints shipped in 5&ndash;7 days</p>
          </div>
        </div>
      </section>

      {/* MEMORY PORTRAIT FEATURE */}
      <section id="the-experience" style={{padding:'120px 60px',background:'var(--soft)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>Signature Custom Portrait &mdash; Starting at $49</div>
            <h2 className="serif" style={{fontSize:'clamp(36px,4vw,60px)',fontWeight:400,marginBottom:24,lineHeight:1.1}}>The Portrait That<br/><em>Actually Looks Like Them.</em></h2>
            <p style={{fontSize:16,lineHeight:1.9,color:'var(--muted)',marginBottom:32}}>
              We build a scene around everything that makes them who they are — their favorite toy, their couch spot, the places they love. A portrait that makes you say &ldquo;that&rsquo;s exactly them.&rdquo; We write an original song just for them. Then we give it all a QR code so you can hear it anytime.
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
            <Link href="/create" className="btn-gold">🐾 Start Their Story &mdash; $49</Link>
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

      {/* EXPLORE */}
      <section style={{padding:'80px 60px',background:'var(--soft)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:10}}>What You Get</div>
            <h2 className="serif" style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:400,marginBottom:12}}>More Than a Portrait</h2>
            <p style={{color:'var(--muted)',fontSize:15,maxWidth:500,margin:'0 auto',lineHeight:1.8}}>
              Your Signature Portrait comes with everything — 16 style options, premium print, original song, and a QR code that plays it from the wall.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:2,marginBottom:40}}>
            {[
              {emoji:'🎨',title:'16 Artistic Styles',desc:'From Oil Painting to Neon Glow — we generate your portrait across 16 styles with infinite theme customization. You pick the one that feels most like them.',link:'/styles',linkText:'See all styles →'},
              {emoji:'🖼️',title:'Premium Prints',desc:'Gallery-quality canvas and archival prints from 8×10 to 24×36. Ready to hang, built to last.'},
              {emoji:'♪',title:'Original Song',desc:'A custom song written just for your pet — their name, their personality, their story. Yours forever.'},
              {emoji:'📱',title:'QR Code',desc:'Scan from the wall to hear their song anytime. Every visitor, every time — the portrait comes alive.'},
            ].map(p=>(
              <div key={p.title} className="card" style={{padding:'28px 24px',textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>{p.emoji}</div>
                <div className="serif" style={{fontSize:18,marginBottom:6,fontWeight:400}}>{p.title}</div>
                <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>{p.desc}</div>
                {(p as any).link && <div style={{marginTop:10}}><Link href={(p as any).link} style={{fontSize:10,color:'var(--gold)',letterSpacing:'.15em',textTransform:'uppercase',textDecoration:'none',borderBottom:'1px solid rgba(201,168,76,.3)'}}>{(p as any).linkText}</Link></div>}
              </div>
            ))}
          </div>
          <div style={{textAlign:'center'}}>
            <Link href="/create" className="btn-gold">🐾 Start Their Story</Link>
          </div>
        </div>
      </section>
      <div className="divider"/>

      {/* TESTIMONIALS */}
      <section style={{padding:'100px 60px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>From People Who Felt It</div>
            <h2 className="serif" style={{fontSize:'clamp(36px,5vw,64px)',fontWeight:400}}>The Moment It<br/><em>Becomes Real.</em></h2>
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
        <div style={{fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'rgba(10,10,10,.5)',marginBottom:16}}>The most meaningful gift for a pet lover</div>
        <h2 className="serif" style={{fontSize:'clamp(32px,5vw,68px)',color:'var(--ink)',fontWeight:400,marginBottom:16}}>
          Give a Gift<br/>They&rsquo;ll Never Forget.
        </h2>
        <p style={{fontSize:17,color:'rgba(10,10,10,.6)',marginBottom:40,maxWidth:460,margin:'0 auto 40px',lineHeight:1.8}}>
          A portrait. A song. A QR code. Everything you need to celebrate who they are — now and forever.
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
        <div style={{fontSize:11,color:'var(--muted)'}}>© 2025 Pet Prints Studio · A Living Memory, Printed & Shipped</div>
        <div style={{display:'flex',gap:24}}>
          {['Privacy','Terms','Contact'].map(l=>(
            <a key={l} href="#" style={{fontSize:10,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none'}}>{l}</a>
          ))}
        </div>
      </footer>
    </main>
  )
}
