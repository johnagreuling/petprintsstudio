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

          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:2}}>

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

            {/* STEP 5 — The Magic Happens */}
            <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
              <div style={{background:'var(--ink)',padding:'12px 0',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:42,fontWeight:900,color:'var(--gold)',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>5</div>
              </div>
              <div style={{aspectRatio:'1',overflow:'hidden',background:'#0a1628',position:'relative'}}>
                <img src="/magic-happens.svg" alt="The magic happens" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
              </div>
              <div style={{padding:'20px 20px 28px'}}>
                <h3 className="serif" style={{fontSize:20,marginBottom:8,fontWeight:400}}>The Magic Happens</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}>Our team creates 5 original songs about your pet — their name, their personality, their story told through music. Delivered in 24 hours.</p>
              </div>
            </div>

            {/* STEP 6 — Delivered */}
            <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
              <div style={{background:'var(--ink)',padding:'12px 0',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:42,fontWeight:900,color:'var(--gold)',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>6</div>
              </div>
              <div style={{aspectRatio:'1',overflow:'hidden',background:'#1a1412',position:'relative'}}>
                <img src="https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/db78566f-8c8e-46f5-8c6d-1267f07029b4.png" alt="Delivered to your door" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,10,10,.5) 0%,transparent 40%)'}} />
              </div>
              <div style={{padding:'20px 20px 28px'}}>
                <h3 className="serif" style={{fontSize:20,marginBottom:8,fontWeight:400}}>Delivered to Your Door</h3>
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8}}>Songs &amp; digital downloads in 24 hours. Prints &amp; keepsakes ship in 2–7 business days. The joy they deliver — infinite.</p>
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
            <p style={{marginTop:16,fontSize:12,color:'var(--muted)'}}>Songs &amp; downloads in 24 hours &nbsp;&middot;&nbsp; Prints ship in 2–7 days &nbsp;&middot;&nbsp; Free preview</p>
          </div>
        </div>
      </section>

      {/* MEMORY PORTRAIT FEATURE */}
      <section id="the-experience" style={{padding:'120px 60px',background:'var(--soft)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>Signature Portrait &mdash; Starting at $49</div>
            <h2 className="serif" style={{fontSize:'clamp(36px,4vw,60px)',fontWeight:400,marginBottom:24,lineHeight:1.1}}>Their Story Is<br/><em>Worth Remembering.</em></h2>
            <p style={{fontSize:16,lineHeight:1.9,color:'var(--muted)',marginBottom:32}}>
              A pet is so much more than a picture. It&rsquo;s the morning walks. The rides with the windows down. The spot on the couch that&rsquo;s always theirs. The little moments that somehow become the big ones. We turn all of that into a portrait — and a song — that captures who they really are.
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:40}}>
              {[
                {icon:'🌅', text:'The beach where you spent every summer together'},
                {icon:'🚗', text:'Ears out the window on your favorite drive'},
                {icon:'🛋️', text:'Their spot on the couch, the one that\'s always theirs'},
                {icon:'🎾', text:'That tennis ball they\'ve had since day one'},
                {icon:'🏡', text:'The backyard, the park, the places that feel like home'},
              ].map(({icon,text})=>(
                <div key={text} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                  <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                  <span style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>{text}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize:14,color:'var(--cream)',marginBottom:24,lineHeight:1.8}}>Just tell us their story. We&rsquo;ll do the rest.</p>
            <Link href="/create" className="btn-gold">🐾 Start Their Story</Link>
          </div>

          {/* Portrait examples - full images */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>
              <img src="/portrait-sasha.png" alt="Sasha - Signature Portrait" style={{width:'100%',display:'block'}}/>
              <div style={{background:'var(--mid)',padding:'16px 20px',borderTop:'1px solid var(--border)'}}>
                <div style={{fontSize:13,color:'var(--gold)',fontWeight:500,marginBottom:4}}>Sasha&rsquo;s Signature Portrait</div>
                <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>Her BMW, sunset drive, name on the plate.</div>
              </div>
            </div>
            <div style={{borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>
              <img src="/portrait-maggie-mollie.png" alt="Maggie & Mollie - Signature Portrait" style={{width:'100%',display:'block'}}/>
              <div style={{background:'var(--mid)',padding:'16px 20px',borderTop:'1px solid var(--border)'}}>
                <div style={{fontSize:13,color:'var(--gold)',fontWeight:500,marginBottom:4}}>Maggie &amp; Mollie&rsquo;s Portrait</div>
                <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>Sunset over the Gulf at the family beach house.</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="divider"/>

      {/* THEIR STORY BROUGHT TO LIFE */}
      <section style={{padding:'100px 60px',background:'var(--soft)'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>The Experience</div>
            <h2 className="serif" style={{fontSize:'clamp(36px,5vw,56px)',fontWeight:400,marginBottom:24,lineHeight:1.1}}>Their Story,<br/><em>Brought to Life.</em></h2>
            <div style={{color:'var(--muted)',fontSize:16,maxWidth:700,margin:'0 auto',lineHeight:2}}>
              <p style={{marginBottom:24}}>
                We&rsquo;ve built something different. 16 hand-tuned artistic styles. A limitless AI generation engine. The latest models, obsessively trained and prompted by a team that won&rsquo;t stop until it&rsquo;s gallery-worthy.
              </p>
              <p style={{marginBottom:24}}>
                The result? Pet portraits that actually look like <em>them</em> — not a generic dog in a costume, but YOUR dog, in THEIR world. Their favorite spot. Their tennis ball. The way they tilt their head.
              </p>
              <p style={{color:'var(--cream)',fontWeight:500}}>
                Then we write them a song. Original music, billboard-quality production, lyrics pulled straight from the story you tell us.
              </p>
            </div>
          </div>

          {/* Visual product cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:48}}>
            {[
              {image:'/gallery-quality.png',title:'Gallery Prints',desc:'Canvas & archival prints from 8×10 to 24×36. Built to last generations.'},
              {image:'/portrait-lifestyle.png',title:'The Portrait',desc:'Their personality, their world, their story — made visible.'},
              {image:'/song-lifestyle.png',title:'Original Song',desc:'Custom music written from their story. Their name in the lyrics.'},
              {svg:'qr',title:'QR Code',desc:'Scan from the wall. Hear their song. The portrait comes alive.'},
            ].map(p=>(
              <div key={p.title} className="card" style={{padding:0,overflow:'hidden',textAlign:'center'}}>
                {(p as any).image ? (
                  <div style={{width:'100%',height:140,overflow:'hidden',background:'#111'}}>
                    <img src={(p as any).image} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}}/>
                  </div>
                ) : (p as any).svg === 'qr' ? (
                  <div style={{width:'100%',height:140,background:'linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{width:80,height:80,background:'white',borderRadius:8,display:'grid',gridTemplateColumns:'repeat(7,1fr)',gridTemplateRows:'repeat(7,1fr)',gap:2,padding:6}}>
                      {[1,1,1,0,1,1,1,1,0,1,0,1,0,1,1,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,1,0,1,1,1,1,0,1,0,1,0,1,1,1,1,0,1,1,1].map((fill,i)=>(
                        <div key={i} style={{background:fill?'var(--ink)':'white',borderRadius:1}}/>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div style={{padding:'20px 16px'}}>
                  <div className="serif" style={{fontSize:17,marginBottom:5,fontWeight:400}}>{p.title}</div>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Holiday example */}
          <div className="card" style={{padding:0,display:'flex',alignItems:'stretch',gap:0,marginBottom:24,overflow:'hidden'}}>
            <div style={{width:160,minHeight:120,overflow:'hidden',flexShrink:0}}>
              <img src="/portrait-christmas.png" alt="Holiday pet portrait" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div style={{flex:1,padding:'24px 28px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div className="serif" style={{fontSize:20,marginBottom:6}}>Perfect for Every Occasion</div>
              <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>Holidays, birthdays, memorials — we craft the scene to match the moment. Tell us the occasion, we&rsquo;ll make it unforgettable.</div>
            </div>
          </div>

          {/* Soft blanket callout */}
          <div className="card" style={{padding:0,display:'flex',alignItems:'stretch',gap:0,marginBottom:48,overflow:'hidden'}}>
            <div style={{width:200,minHeight:160,overflow:'hidden',flexShrink:0}}>
              <img src="/blanket-lifestyle.png" alt="Pet blanket lifestyle" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div style={{flex:1,padding:'28px 32px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div className="serif" style={{fontSize:22,marginBottom:8}}>A Soft Blanket With Their Face</div>
              <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7,marginBottom:12}}>Ultra-soft sherpa fleece, 50×60". Wrap yourself in the memory. Because some gifts you don&rsquo;t just see — you feel.</div>
              <div style={{fontSize:14,color:'var(--gold)',fontWeight:600}}>$69</div>
            </div>
          </div>

          {/* Closing statement */}
          <div style={{textAlign:'center',marginBottom:40}}>
            <p style={{fontSize:15,color:'var(--muted)',lineHeight:2,maxWidth:600,margin:'0 auto 24px'}}>
              This is for people who don&rsquo;t just have pets — they love them like family.<br/>
              For people who understand the bond, and want something worthy of it.
            </p>
            <p className="serif" style={{fontSize:28,color:'var(--gold)',marginBottom:32}}>This is love, delivered.</p>
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
