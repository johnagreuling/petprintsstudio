'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { PRODUCTS, PRODUCT_CATEGORIES, ART_STYLES, QUESTIONNAIRE, DIGITAL_BUNDLE_PRICE, MEMORY_UPGRADE_PRICE, DEFAULT_STYLES } from '@/lib/config'

type Step = 'upload' | 'product' | 'pay' | 'questionnaire' | 'generating' | 'gallery' | 'upsell'

export default function CreatePage() {
  const [step, setStep] = useState<Step>('upload')
  const [preview, setPreview] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [primaryProduct, setPrimaryProduct] = useState<typeof PRODUCTS[0] | null>(null)
  const [primarySize, setPrimarySize] = useState('')
  const [isMemory, setIsMemory] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedStyles, setSelectedStyles] = useState<string[]>(DEFAULT_STYLES)
  const [generated, setGenerated] = useState<Array<{url:string;styleId:string;styleName:string}>>([])
  const [picked, setPicked] = useState<{url:string;styleId:string;styleName:string} | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('Preparing your portraits...')
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('Canvas')
  const [cartExtras, setCartExtras] = useState<string[]>([])
  const [wantBundle, setWantBundle] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file.size > 15 * 1024 * 1024) { setError('Image must be under 15MB'); return }
    setUploadedFile(file)
    setError('')
    const r = new FileReader()
    r.onload = e => setPreview(e.target?.result as string)
    r.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) handleFile(f)
  }, [])

  const handleGenerate = async () => {
    if (!uploadedFile || !primaryProduct) return
    setStep('generating'); setProgress(5); setProgressMsg('Uploading your photo...')
    try {
      // Upload
      const fd = new FormData(); fd.append('file', uploadedFile)
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!upRes.ok) throw new Error('Upload failed')
      const { url } = await upRes.json()
      setUploadedUrl(url); setProgress(20); setProgressMsg('Starting AI generation...')

      // Generate
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          styles: selectedStyles,
          isMemory,
          answers,
          petName: answers.petName || '',
          petType: answers.petBreed || 'pet',
        }),
      })
      if (!genRes.ok) throw new Error('Generation failed')

      const reader = genRes.body?.getReader()
      const decoder = new TextDecoder()
      const imgs: typeof generated = []

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n').filter(Boolean)
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.type === 'progress') { setProgress(d.value); setProgressMsg(d.message || 'Generating...') }
            if (d.type === 'image') { imgs.push(d.image); setGenerated([...imgs]) }
            if (d.type === 'done') { setGenerated(d.images); setProgress(100); setProgressMsg('Done!') }
            if (d.type === 'error') throw new Error(d.message)
          } catch {}
        }
      }
      setStep('gallery')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStep('product')
    }
  }

  const handleCheckout = async () => {
    if (!picked || !primaryProduct) return
    try {
      const extras = PRODUCTS.filter(p => cartExtras.includes(p.id))
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: picked.url,
          primaryProduct,
          primarySize,
          extras,
          wantBundle,
          styleName: picked.styleName,
          petName: answers.petName || '',
          isMemory,
        }),
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Checkout failed — please try again')
    }
  }

  const stepNum = {upload:1,product:2,pay:3,questionnaire:3,generating:4,gallery:4,upsell:5}[step]

  return (
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--soft:#141414;--mid:#1E1E1E;--border:rgba(245,240,232,.08);--muted:rgba(245,240,232,.45);--rust:#C4622D}
        .serif{font-family:'Cormorant Garamond',serif}
        .btn-gold{background:var(--gold);color:var(--ink);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:12px;padding:18px 40px;border:none;cursor:pointer;transition:all .3s;width:100%}
        .btn-gold:hover{background:var(--cream)}.btn-gold:disabled{opacity:.35;cursor:not-allowed}
        .btn-out{border:1px solid rgba(245,240,232,.15);color:var(--muted);background:none;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:14px 24px;cursor:pointer;transition:all .3s;width:100%}
        .btn-out:hover{border-color:var(--gold);color:var(--gold)}
        .input{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;transition:border-color .3s}
        .input:focus{border-color:var(--gold)}
        .input::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        .select{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;cursor:pointer}
        .textarea{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;height:120px;resize:none;transition:border-color .3s}
        .textarea:focus{border-color:var(--gold)}
        .textarea::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        .drop{border:2px dashed rgba(245,240,232,.12);padding:60px 40px;text-align:center;cursor:pointer;transition:all .3s}
        .drop.over{border-color:var(--gold);background:rgba(201,168,76,.03)}
        .product-card{background:#141414;border:1px solid rgba(245,240,232,.08);padding:20px;cursor:pointer;transition:all .2s;position:relative}
        .product-card:hover,.product-card.on{border-color:var(--gold)}
        .cat-tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);font-size:10px;letter-spacing:.18em;text-transform:uppercase;padding:10px 0;cursor:pointer;transition:all .2s;margin-right:28px;font-family:'DM Sans',sans-serif}
        .cat-tab.on{color:var(--gold);border-color:var(--gold)}
        .style-toggle{border:1px solid rgba(245,240,232,.08);background:transparent;padding:20px 16px;cursor:pointer;transition:all .2s;text-align:left;position:relative}
        .style-toggle.on{border-color:var(--gold);background:rgba(201,168,76,.04)}
        .img-card{aspect-ratio:1;object-fit:cover;width:100%;cursor:pointer;transition:all .3s;border:2px solid transparent;display:block}
        .img-card:hover{transform:scale(1.02)}.img-card.picked{border-color:var(--gold);box-shadow:0 0 0 4px rgba(201,168,76,.15)}
        .progress-bar{height:3px;background:rgba(245,240,232,.06);border-radius:999px;overflow:hidden}
        .progress-fill{height:100%;background:var(--gold);transition:width .6s ease;border-radius:999px}
        .upsell-card{background:#141414;border:1px solid rgba(245,240,232,.08);padding:20px;cursor:pointer;transition:all .2s;position:relative;display:flex;gap:16;align-items:center}
        .upsell-card.on,.upsell-card:hover{border-color:var(--gold)}
        .step-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;display:inline-block}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}.pulse{animation:pulse 1.8s ease infinite}
        @keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite;display:inline-block}
      `}</style>

      {/* NAV */}
      <nav style={{padding:'18px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(245,240,232,.06)',position:'sticky',top:0,background:'#0A0A0A',zIndex:100}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'inherit'}}>
          <span>🐾</span>
          <span className="serif" style={{fontSize:20}}>Pet Prints Studio</span>
        </Link>
        {/* Step indicator */}
        <div style={{display:'flex',alignItems:'center',gap:0}}>
          {['Upload','Choose Size','Generate','Gallery','Checkout'].map((label,i)=>(
            <div key={label} style={{display:'flex',alignItems:'center'}}>
              <div style={{fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:i+1===stepNum?'var(--cream)':i+1<stepNum?'var(--gold)':'var(--muted)',display:'flex',alignItems:'center',gap:6,fontWeight:i+1===stepNum?600:400}}>
                <span className="step-dot" style={{color:i+1===stepNum?'var(--cream)':i+1<stepNum?'var(--gold)':'rgba(245,240,232,.2)'}}/>
                {label}
              </div>
              {i<4&&<div style={{width:24,height:1,background:'rgba(245,240,232,.1)',margin:'0 6px'}}/>}
            </div>
          ))}
        </div>
        <div style={{width:140}}/>
      </nav>

      <div style={{maxWidth:860,margin:'0 auto',padding:'56px 24px 80px'}}>

        {/* ── STEP 1: UPLOAD ── */}
        {step==='upload'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 1 of 5</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:400,marginBottom:12}}>Upload Your Pet&rsquo;s Photo</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8}}>Clear, well-lit photos work best. Front-facing gives the most accurate results.</p>
            </div>

            <div className={`drop${isDragging?' over':''}`} onDrop={handleDrop} onDragOver={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)} onClick={()=>fileRef.current?.click()}>
              {preview?(
                <div>
                  <img src={preview} alt="Pet preview" style={{maxHeight:360,maxWidth:'100%',objectFit:'contain',display:'block',margin:'0 auto'}}/>
                  <div style={{marginTop:16,fontSize:13,color:'var(--gold)'}}>✓ Looking great!</div>
                  <button onClick={e=>{e.stopPropagation();setUploadedFile(null);setPreview('')}} style={{marginTop:8,background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:11,letterSpacing:'.15em',textTransform:'uppercase'}}>Change photo</button>
                </div>
              ):(
                <div>
                  <div style={{fontSize:52,marginBottom:20}}>🐾</div>
                  <div style={{fontSize:18,marginBottom:8,fontWeight:500}}>Drop your photo here</div>
                  <div style={{color:'var(--muted)',fontSize:13,marginBottom:20}}>or click to browse · JPG, PNG, WEBP · Max 15MB</div>
                  <div style={{display:'inline-block',border:'1px solid var(--gold)',color:'var(--gold)',padding:'10px 28px',fontSize:11,letterSpacing:'.15em',textTransform:'uppercase'}}>Browse Files</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:24}}>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Pet&rsquo;s Name <span style={{opacity:.5}}>(optional)</span></label>
                <input className="input" placeholder="Rocky, Luna, Biscuit..." value={answers.petName||''} onChange={e=>setAnswers(a=>({...a,petName:e.target.value}))}/>
              </div>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Type of Pet</label>
                <select className="select" value={answers.petBreed||'dog'} onChange={e=>setAnswers(a=>({...a,petBreed:e.target.value}))}>
                  {['Dog','Cat','Rabbit','Bird','Horse','Hamster','Guinea Pig','Reptile','Fish','Other'].map(t=><option key={t} value={t.toLowerCase()}>{t}</option>)}
                </select>
              </div>
            </div>

            {error&&<div style={{color:'#C4622D',fontSize:13,marginTop:16,padding:'12px 16px',background:'rgba(196,98,45,.08)',border:'1px solid rgba(196,98,45,.15)'}}>{error}</div>}

            <div style={{marginTop:32}}>
              <button className="btn-gold" disabled={!uploadedFile} onClick={()=>setStep('product')}>Choose Your Canvas Size →</button>
            </div>
            <div style={{marginTop:16,display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
              {['✓ No account needed','✓ 12 AI portraits generated','✓ Free to preview','✓ Prints shipped in 5–7 days'].map(t=>(
                <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: PRODUCT SELECTION (Paywall) ── */}
        {step==='product'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 2 of 5</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:400,marginBottom:12}}>Choose Your Product</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8}}>What are we putting this on? Pick your primary product — you can add more after you see your portraits.</p>
            </div>

            {/* Pet photo preview */}
            {preview&&(
              <div style={{display:'flex',gap:20,alignItems:'center',padding:'20px',background:'#141414',marginBottom:32,border:'1px solid rgba(201,168,76,.15)'}}>
                <img src={preview} alt="Your pet" style={{width:72,height:72,objectFit:'cover',borderRadius:2}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>Your pet{answers.petName?` — ${answers.petName}`:''}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:4}}>12 AI portraits will be generated from this photo</div>
                </div>
              </div>
            )}

            {/* Category tabs */}
            <div style={{borderBottom:'1px solid rgba(245,240,232,.06)',marginBottom:28}}>
              {PRODUCT_CATEGORIES.map(c=>(
                <button key={c} className={`cat-tab${activeCategory===c?' on':''}`} onClick={()=>setActiveCategory(c)}>{c}</button>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))',gap:2,marginBottom:32}}>
              {PRODUCTS.filter(p=>p.category===activeCategory).map(p=>(
                <div key={p.id} className={`product-card${primaryProduct?.id===p.id?' on':''}`} onClick={()=>{setPrimaryProduct(p);setPrimarySize('')}}>
                  {p.popular&&<div style={{position:'absolute',top:8,right:8,background:'var(--gold)',color:'var(--ink)',fontSize:7,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',padding:'3px 7px'}}>Popular</div>}
                  {primaryProduct?.id===p.id&&<div style={{position:'absolute',top:8,left:8,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>✓</div>}
                  <div style={{fontSize:24,marginBottom:10}}>{p.emoji}</div>
                  <div className="serif" style={{fontSize:16,marginBottom:4,fontWeight:400}}>{p.name}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>{p.size}</div>
                  <div style={{fontSize:11,color:'var(--muted)',opacity:.6,marginBottom:12}}>{p.description}</div>
                  <div className="serif" style={{fontSize:22,color:'var(--gold)'}}>${p.price}</div>
                </div>
              ))}
            </div>

            {/* Size selector for apparel */}
            {primaryProduct&&'sizes' in primaryProduct&&(primaryProduct as any).sizes&&(
              <div style={{marginBottom:28}}>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:12}}>Select Size</label>
                <div style={{display:'flex',gap:8}}>
                  {((primaryProduct as any).sizes as string[]).map((s:string)=>(
                    <button key={s} onClick={()=>setPrimarySize(s)} style={{padding:'10px 20px',border:`1px solid ${primarySize===s?'var(--gold)':'rgba(245,240,232,.12)'}`,background:primarySize===s?'rgba(201,168,76,.08)':'none',color:primarySize===s?'var(--gold)':'var(--muted)',cursor:'pointer',fontSize:13,transition:'all .2s'}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Memory Portrait upgrade */}
            <div style={{marginBottom:28}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:12}}>Portrait Type</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2}}>
                <div onClick={()=>setIsMemory(false)} style={{background:'#141414',border:`1px solid ${!isMemory?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'20px',cursor:'pointer',transition:'all .2s'}}>
                  <div style={{fontSize:20,marginBottom:8}}>🎨</div>
                  <div className="serif" style={{fontSize:17,marginBottom:4,fontWeight:400}}>Style Transfer</div>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>Your photo reimagined in 8 artistic styles. Ready in ~60 seconds.</div>
                  <div style={{fontSize:12,color:'var(--gold)',marginTop:8,fontWeight:600}}>Included</div>
                </div>
                <div onClick={()=>setIsMemory(true)} style={{background:'#141414',border:`1px solid ${isMemory?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'20px',cursor:'pointer',transition:'all .2s',position:'relative'}}>
                  <div style={{position:'absolute',top:10,right:10,background:'var(--gold)',color:'var(--ink)',fontSize:7,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',padding:'3px 7px'}}>Premium</div>
                  <div style={{fontSize:20,marginBottom:8}}>✨</div>
                  <div className="serif" style={{fontSize:17,marginBottom:4,fontWeight:400}}>Memory Portrait</div>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>Custom scene built from your pet&rsquo;s life — team, car, hometown, toys. Human-reviewed.</div>
                  <div style={{fontSize:12,color:'var(--gold)',marginTop:8,fontWeight:600}}>+${MEMORY_UPGRADE_PRICE.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            {primaryProduct&&(
              <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.15)',padding:'20px 24px',marginBottom:24}}>
                <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Order Summary</div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:14}}>{primaryProduct.name} {primaryProduct.size}{primarySize?` — ${primarySize}`:''}</span>
                  <span style={{fontSize:14,color:'var(--gold)'}}>${primaryProduct.price}</span>
                </div>
                {isMemory&&(
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:14}}>Memory Portrait upgrade</span>
                    <span style={{fontSize:14,color:'var(--gold)'}}>+${MEMORY_UPGRADE_PRICE.toFixed(2)}</span>
                  </div>
                )}
                <div style={{borderTop:'1px solid rgba(245,240,232,.08)',paddingTop:12,marginTop:4,display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:15,fontWeight:600}}>Total</span>
                  <span className="serif" style={{fontSize:20,color:'var(--gold)'}}>${(primaryProduct.price+(isMemory?MEMORY_UPGRADE_PRICE:0)).toFixed(2)}</span>
                </div>
              </div>
            )}

            {error&&<div style={{color:'#C4622D',fontSize:13,marginBottom:16,padding:'12px 16px',background:'rgba(196,98,45,.08)',border:'1px solid rgba(196,98,45,.15)'}}>{error}</div>}

            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:2}}>
              <button className="btn-out" onClick={()=>setStep('upload')}>← Back</button>
              <button className="btn-gold"
                disabled={!primaryProduct||('sizes' in (primaryProduct||{})&&!(primaryProduct as any).sizes?.includes(primarySize)&&(primaryProduct as any).sizes?.length>0)}
                onClick={()=>isMemory?setStep('questionnaire'):handleGenerate()}>
                {isMemory?'Continue to Questionnaire →':`Pay & Generate My Portraits — $${(primaryProduct?.price||0)+(isMemory?MEMORY_UPGRADE_PRICE:0)}`}
              </button>
            </div>
            <div style={{marginTop:16,display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
              {['🔒 Secure Stripe checkout','🚀 Ships in 5–7 days','↩️ Satisfaction guaranteed'].map(t=>(
                <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: QUESTIONNAIRE (Memory only) ── */}
        {step==='questionnaire'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Memory Portrait</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:400,marginBottom:12}}>Tell Us About {answers.petName||'Your Pet'}</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8,maxWidth:540,margin:'0 auto'}}>Every answer becomes a visual easter egg in their portrait. Required fields first, then all the fun details.</p>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:24}}>
              {QUESTIONNAIRE.filter(q=>q.type!=='style-picker').map(q=>(
                <div key={q.id}>
                  <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:q.required?'var(--cream)':'var(--muted)',display:'block',marginBottom:8}}>
                    {q.label} {q.required&&<span style={{color:'var(--gold)'}}>*</span>}
                  </label>
                  {q.type==='text'&&<input className="input" placeholder={q.placeholder} value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}/>}
                  {q.type==='textarea'&&<textarea className="textarea" placeholder={q.placeholder} value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} style={{height:140}}/>}
                  {q.type==='select'&&(
                    <select className="select" value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}>
                      <option value="">Select...</option>
                      {q.options?.map((o:string)=><option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}

              {/* Style picker */}
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--cream)',display:'block',marginBottom:12}}>Preferred Style <span style={{color:'var(--gold)'}}>*</span></label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
                  {ART_STYLES.map(s=>(
                    <button key={s.id} className={`style-toggle${selectedStyles.includes(s.id)?' on':''}`} onClick={()=>setSelectedStyles(prev=>prev.includes(s.id)?prev.filter(x=>x!==s.id):[...prev,s.id])}>
                      <div style={{position:'absolute',top:8,right:8,width:16,height:16,border:`1px solid ${selectedStyles.includes(s.id)?'var(--gold)':'rgba(245,240,232,.2)'}`,borderRadius:'50%',background:selectedStyles.includes(s.id)?'var(--gold)':'none',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'var(--ink)',fontWeight:700}}>
                        {selectedStyles.includes(s.id)&&'✓'}
                      </div>
                      <div style={{fontSize:24,marginBottom:10}}>{s.emoji}</div>
                      <div className="serif" style={{fontSize:15,fontWeight:400}}>{s.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.15)',padding:'20px 24px',marginTop:32,marginBottom:24}}>
              <div style={{fontSize:13,lineHeight:1.8,color:'var(--muted)'}}>
                <strong style={{color:'var(--cream)'}}>What happens next:</strong> After you pay, our team reviews your answers and refines the prompt before anything generates. This usually takes 15–30 minutes. You&rsquo;ll get an email when your portraits are ready.
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:2}}>
              <button className="btn-out" onClick={()=>setStep('product')}>← Back</button>
              <button className="btn-gold"
                disabled={!answers.petName||!answers.petBreed||!answers.petPersonality||!answers.petFeature}
                onClick={handleGenerate}>
                Pay & Submit — ${((primaryProduct?.price||0)+MEMORY_UPGRADE_PRICE).toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: GENERATING ── */}
        {step==='generating'&&(
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:64,marginBottom:28}} className="pulse">🎨</div>
            <h2 className="serif" style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:400,marginBottom:16}}>
              Creating {answers.petName?`${answers.petName}'s`:''} Portraits
            </h2>
            <p style={{color:'var(--muted)',fontSize:15,marginBottom:48,lineHeight:1.8}}>{progressMsg}</p>
            <div style={{maxWidth:440,margin:'0 auto 32px'}}>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:8}}>{progress}% complete</div>
            </div>
            {generated.length>0&&(
              <div>
                <div style={{fontSize:12,color:'var(--gold)',marginBottom:16}}>{generated.length} portrait{generated.length!==1?'s':''} ready...</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,maxWidth:480,margin:'0 auto'}}>
                  {generated.map((img,i)=>(
                    <img key={i} src={img.url} alt={img.styleName} style={{width:'100%',aspectRatio:'1',objectFit:'cover',opacity:.6}}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: GALLERY — pick your favorite ── */}
        {step==='gallery'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 4 of 5</div>
              <h1 className="serif" style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:400,marginBottom:12}}>Pick Your Favorite</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8}}>{generated.length} portraits generated — click to select your favorite</p>
            </div>

            {ART_STYLES.filter(s=>selectedStyles.includes(s.id)).map(style=>{
              const imgs = generated.filter(g=>g.styleId===style.id)
              if(!imgs.length) return null
              return (
                <div key={style.id} style={{marginBottom:48}}>
                  <div style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
                    <span>{style.emoji} {style.name}</span>
                    <span style={{flex:1,height:1,background:'rgba(245,240,232,.06)'}}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
                    {imgs.map((img,i)=>(
                      <div key={i} style={{position:'relative',cursor:'pointer'}} onClick={()=>setPicked(img)}>
                        <img src={img.url} alt={`${style.name} ${i+1}`} className={`img-card${picked?.url===img.url?' picked':''}`}/>
                        {picked?.url===img.url&&<div style={{position:'absolute',top:10,right:10,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>✓</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div style={{position:'sticky',bottom:20,background:'rgba(10,10,10,.96)',padding:'20px',border:'1px solid rgba(245,240,232,.08)',backdropFilter:'blur(12px)'}}>
              {picked&&(
                <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:16}}>
                  <img src={picked.url} alt="Selected" style={{width:56,height:56,objectFit:'cover'}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>Selected: {picked.styleName}</div>
                    <div style={{fontSize:11,color:'var(--gold)'}}>✓ This will be printed on your {primaryProduct?.name}</div>
                  </div>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:8}}>
                <button className="btn-out" style={{padding:'14px'}} onClick={()=>setStep('product')}>← Regenerate</button>
                <button className="btn-gold" disabled={!picked} onClick={()=>setStep('upsell')}>Continue to Checkout →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: UPSELL ── */}
        {step==='upsell'&&picked&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Almost There</div>
              <h1 className="serif" style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:400,marginBottom:12}}>Love It? Put It Everywhere.</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8}}>Your portrait looks amazing on more than just a canvas. Add more products for family, friends, or yourself.</p>
            </div>

            {/* Selected portrait */}
            <div style={{display:'flex',gap:20,alignItems:'center',padding:'20px',background:'#141414',border:'1px solid rgba(201,168,76,.2)',marginBottom:36}}>
              <img src={picked.url} alt="Your portrait" style={{width:88,height:88,objectFit:'cover'}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>Your {picked.styleName} Portrait</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>Printing on: {primaryProduct?.name} {primaryProduct?.size}</div>
              </div>
              <div className="serif" style={{fontSize:20,color:'var(--gold)'}}>${primaryProduct?.price}</div>
            </div>

            {/* Digital bundle */}
            <div onClick={()=>setWantBundle(b=>!b)} style={{background:'#141414',border:`1px solid ${wantBundle?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'24px',marginBottom:32,cursor:'pointer',transition:'all .2s',position:'relative'}}>
              {wantBundle&&<div style={{position:'absolute',top:16,right:16,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>✓</div>}
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                <div style={{fontSize:36}}>💾</div>
                <div style={{flex:1}}>
                  <div className="serif" style={{fontSize:20,fontWeight:400,marginBottom:6}}>Download All 12 Portraits</div>
                  <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>Get all 12 high-resolution digital files from your session. Print anywhere, use as wallpaper, share with family — yours forever.</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="serif" style={{fontSize:24,color:'var(--gold)'}}>${DIGITAL_BUNDLE_PRICE}</div>
                  <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>Instant download</div>
                </div>
              </div>
            </div>

            {/* Additional products */}
            <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--muted)',marginBottom:20}}>Add More Products — Same Portrait</div>
            {PRODUCT_CATEGORIES.map(cat=>{
              const items = PRODUCTS.filter(p=>p.category===cat&&p.id!==primaryProduct?.id)
              if(!items.length) return null
              return (
                <div key={cat} style={{marginBottom:32}}>
                  <div style={{fontSize:9,letterSpacing:'.25em',textTransform:'uppercase',color:'rgba(245,240,232,.3)',marginBottom:12}}>{cat}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:2}}>
                    {items.map(p=>{
                      const isOn = cartExtras.includes(p.id)
                      return (
                        <div key={p.id} className={`product-card${isOn?' on':''}`} onClick={()=>setCartExtras(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])}>
                          {isOn&&<div style={{position:'absolute',top:8,left:8,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700}}>✓</div>}
                          <div style={{fontSize:22,marginBottom:8}}>{p.emoji}</div>
                          <div className="serif" style={{fontSize:14,marginBottom:2,fontWeight:400}}>{p.name}</div>
                          <div style={{fontSize:10,color:'var(--muted)',marginBottom:8}}>{p.size}</div>
                          <div className="serif" style={{fontSize:18,color:'var(--gold)'}}>${p.price}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Final total */}
            <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.2)',padding:'24px',marginBottom:24}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>Order Total</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:14}}>{primaryProduct?.name} {primaryProduct?.size}</span>
                <span style={{fontSize:14}}>${primaryProduct?.price}</span>
              </div>
              {isMemory&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>Memory Portrait upgrade</span><span style={{fontSize:14}}>${MEMORY_UPGRADE_PRICE.toFixed(2)}</span></div>}
              {wantBundle&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>All 12 digital files</span><span style={{fontSize:14}}>${DIGITAL_BUNDLE_PRICE}</span></div>}
              {cartExtras.map(id=>{const p=PRODUCTS.find(x=>x.id===id)!;return <div key={id} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>{p.name} {p.size}</span><span style={{fontSize:14}}>${p.price}</span></div>})}
              <div style={{borderTop:'1px solid rgba(245,240,232,.08)',paddingTop:16,marginTop:8,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:15,fontWeight:600}}>Total</span>
                <span className="serif" style={{fontSize:24,color:'var(--gold)'}}>
                  ${((primaryProduct?.price||0)+(isMemory?MEMORY_UPGRADE_PRICE:0)+(wantBundle?DIGITAL_BUNDLE_PRICE:0)+cartExtras.reduce((sum,id)=>sum+(PRODUCTS.find(p=>p.id===id)?.price||0),0)).toFixed(2)}
                </span>
              </div>
            </div>

            {error&&<div style={{color:'#C4622D',fontSize:13,marginBottom:16,padding:'12px 16px',background:'rgba(196,98,45,.08)'}}>{error}</div>}

            <button className="btn-gold" onClick={handleCheckout}>Proceed to Secure Checkout →</button>
            <div style={{marginTop:16,display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
              {['🔒 Stripe secure checkout','📦 Ships in 5–7 days','✓ Satisfaction guarantee'].map(t=>(
                <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
