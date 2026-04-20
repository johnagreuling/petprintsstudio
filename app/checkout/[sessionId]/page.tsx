'use client'
import SiteNav from '@/components/SiteNav'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { PRODUCTS, MEMORY_UPGRADE_PRICE, DIGITAL_BUNDLE_PRICE, ALL_IMAGES_PRICE, PET_SONG_PRICE } from '@/lib/config'

function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const sessionId = params.sessionId as string
  const imageUrl = searchParams.get('image') || ''
  const styleName = searchParams.get('style') || 'Portrait'
  const petName = searchParams.get('pet') || ''
  const isMemory = searchParams.get('memory') === 'true'
  
  const [primaryProduct, setPrimaryProduct] = useState<typeof PRODUCTS[0] | null>(null)
  const [primarySize, setPrimarySize] = useState('')
  const [cartExtras, setCartExtras] = useState<string[]>([])
  const [wantBundle, setWantBundle] = useState(false)
  const [wantAllImages, setWantAllImages] = useState(false)
  const [wantSong, setWantSong] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState<'Canvas'|'Prints'>('Canvas')

  // Default to 16x20 canvas
  useEffect(() => {
    const defaultProduct = PRODUCTS.find(p => p.id === 'canvas_16x20')
    if (defaultProduct) setPrimaryProduct(defaultProduct)
  }, [])

  const handleCheckout = async () => {
    if (!imageUrl || !primaryProduct) return
    setCheckoutLoading(true)
    setError('')
    
    try {
      const extras = PRODUCTS.filter(p => cartExtras.includes(p.id))
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          primaryProduct,
          primarySize,
          extras,
          wantBundle,
          wantAllImages,
          wantSong,
          styleName,
          petName,
          isMemory,
          sessionFolder: sessionId,
        }),
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Checkout failed — please try again')
      setCheckoutLoading(false)
    }
  }

  const toggleExtra = (id: string) => {
    setCartExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const subtotal = (primaryProduct?.price || 0) 
    + (isMemory ? MEMORY_UPGRADE_PRICE : 0)
    + (wantBundle ? DIGITAL_BUNDLE_PRICE : 0)
    + (wantAllImages ? ALL_IMAGES_PRICE : 0)
    + (wantSong ? PET_SONG_PRICE : 0)
    + cartExtras.reduce((sum, id) => sum + (PRODUCTS.find(p => p.id === id)?.price || 0), 0)

  if (!imageUrl) {
    return (
      <><SiteNav /><div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'calc(100vh - 74px)',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'114px 24px 40px',fontFamily:"'DM Sans',sans-serif"}}>
        <div>
          <div style={{fontSize:48,marginBottom:24}}>🐾</div>
          <h1 style={{fontSize:28,marginBottom:16}}>No Image Found</h1>
          <p style={{color:'rgba(245,240,232,.5)',marginBottom:32}}>This checkout link is missing the image parameter.</p>
          <Link href="/create" style={{background:'#C9A84C',color:'#0A0A0A',padding:'16px 32px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
            Create Your Portrait →
          </Link>
        </div>
      </div></>
    )
  }

  return (
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .serif{font-family:'Cormorant Garamond',serif}
        .card{background:#141414;border:1px solid rgba(245,240,232,.06);transition:all .2s}
        .card:hover{border-color:rgba(201,168,76,.25)}
        .card.selected{border-color:var(--gold);background:rgba(201,168,76,.04)}
        .btn-gold{background:#C9A84C;color:#0A0A0A;border:none;padding:18px 36px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s}
        .btn-gold:hover{background:#d4b65c}
        .btn-gold:disabled{opacity:.5;cursor:not-allowed}
        .btn-out{background:transparent;border:1px solid rgba(245,240,232,.15);color:rgba(245,240,232,.6);padding:16px 28px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s}
        .btn-out:hover{border-color:rgba(245,240,232,.3);color:#F5F0E8}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--muted:rgba(245,240,232,.45)}
      `}</style>

      <SiteNav />

      <div style={{maxWidth:1100,margin:'0 auto',padding:'122px 24px 120px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Your Portrait is Ready</div>
          <h1 className="serif" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:400,marginBottom:12}}>
            {petName ? `${petName}'s ${styleName}` : styleName} Portrait
          </h1>
          <p style={{color:'var(--muted)',fontSize:15}}>Choose your print size and any add-ons below</p>
        </div>

        {/* Portrait Preview */}
        <div style={{display:'flex',gap:24,marginBottom:48,flexWrap:'wrap',justifyContent:'center'}}>
          <div style={{flex:'0 0 320px'}}>
            <div style={{position:'relative',background:'#141414',border:'1px solid rgba(201,168,76,.2)',overflow:'hidden'}}>
              <img src={imageUrl} alt={styleName} style={{width:'100%',display:'block'}} />
            </div>
            <div style={{textAlign:'center',marginTop:12}}>
              <div className="serif" style={{fontSize:20,color:'var(--cream)'}}>{styleName}</div>
              {petName && <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{petName}'s Portrait</div>}
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div style={{marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>
            🖼️ Choose Your Print
          </div>
          
          {/* Category tabs */}
          <div style={{display:'flex',gap:2,marginBottom:20}}>
            {(['Canvas','Prints'] as const).map(cat=>(
              <button key={cat} onClick={()=>setActiveCategory(cat)} style={{
                padding:'12px 28px',
                background:activeCategory===cat?'rgba(201,168,76,.1)':'transparent',
                border:`1px solid ${activeCategory===cat?'var(--gold)':'rgba(245,240,232,.1)'}`,
                color:activeCategory===cat?'var(--gold)':'var(--muted)',
                fontSize:11,
                letterSpacing:'.12em',
                textTransform:'uppercase',
                cursor:'pointer',
                transition:'all .2s'
              }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
            {PRODUCTS.filter(p => p.category === activeCategory).map(p => (
              <div 
                key={p.id} 
                className={`card${primaryProduct?.id === p.id ? ' selected' : ''}`}
                onClick={() => setPrimaryProduct(p)}
                style={{padding:'20px',cursor:'pointer',position:'relative'}}
              >
                {p.popular && (
                  <div style={{position:'absolute',top:8,right:8,background:'var(--gold)',color:'var(--ink)',fontSize:7,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',padding:'3px 7px'}}>
                    Popular
                  </div>
                )}
                {primaryProduct?.id === p.id && (
                  <div style={{position:'absolute',top:8,left:8,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>✓</div>
                )}
                <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{p.name}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:8}}>{p.size}</div>
                <div className="serif" style={{fontSize:22,color:'var(--gold)'}}>${p.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Add-ons */}
        <div style={{marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>
            ⚡ Digital Add-Ons
          </div>
          
          <div style={{display:'grid',gap:8}}>
            <div 
              className={`card${wantBundle ? ' selected' : ''}`}
              onClick={() => setWantBundle(!wantBundle)}
              style={{padding:'20px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}
            >
              <div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>📁 Digital Download — This Portrait</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>High-resolution file, instant delivery</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <div className="serif" style={{fontSize:20,color:'var(--gold)'}}>${DIGITAL_BUNDLE_PRICE}</div>
                <div style={{width:24,height:24,border:`2px solid ${wantBundle?'var(--gold)':'rgba(245,240,232,.2)'}`,borderRadius:4,background:wantBundle?'var(--gold)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink)',fontWeight:700,fontSize:12}}>
                  {wantBundle && '✓'}
                </div>
              </div>
            </div>

            <div 
              className={`card${wantSong ? ' selected' : ''}`}
              onClick={() => setWantSong(!wantSong)}
              style={{padding:'20px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}
            >
              <div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>🎵 Custom Pet Song</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Original song written about {petName || 'your pet'}, delivered as MP3</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <div className="serif" style={{fontSize:20,color:'var(--gold)'}}>${PET_SONG_PRICE}</div>
                <div style={{width:24,height:24,border:`2px solid ${wantSong?'var(--gold)':'rgba(245,240,232,.2)'}`,borderRadius:4,background:wantSong?'var(--gold)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink)',fontWeight:700,fontSize:12}}>
                  {wantSong && '✓'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extra Products */}
        <div style={{marginBottom:48}}>
          <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>
            🎁 Add More Products — Same Portrait
          </div>
          
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
            {PRODUCTS.filter(p => ['Home','Apparel','Accessories'].includes(p.category)).slice(0,8).map(p => (
              <div 
                key={p.id} 
                className={`card${cartExtras.includes(p.id) ? ' selected' : ''}`}
                onClick={() => toggleExtra(p.id)}
                style={{padding:'16px',cursor:'pointer',position:'relative'}}
              >
                {cartExtras.includes(p.id) && (
                  <div style={{position:'absolute',top:8,right:8,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>✓</div>
                )}
                <div style={{fontSize:24,marginBottom:8}}>{p.emoji}</div>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:6}}>{p.size}</div>
                <div className="serif" style={{fontSize:18,color:'var(--gold)'}}>${p.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.2)',padding:'24px 28px',marginBottom:24}}>
          <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>
            Order Summary
          </div>
          
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {primaryProduct && (
              <div style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
                <span>{primaryProduct.name} {primaryProduct.size}</span>
                <span style={{color:'var(--gold)'}}>${primaryProduct.price}</span>
              </div>
            )}
            {isMemory && (
              <div style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
                <span>Memory Portrait</span>
                <span style={{color:'var(--gold)'}}>${MEMORY_UPGRADE_PRICE}</span>
              </div>
            )}
            {wantBundle && (
              <div style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
                <span>Digital Download</span>
                <span style={{color:'var(--gold)'}}>${DIGITAL_BUNDLE_PRICE}</span>
              </div>
            )}
            {wantSong && (
              <div style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
                <span>Custom Pet Song</span>
                <span style={{color:'var(--gold)'}}>${PET_SONG_PRICE}</span>
              </div>
            )}
            {cartExtras.map(id => {
              const p = PRODUCTS.find(x => x.id === id)
              return p ? (
                <div key={id} style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
                  <span>{p.name} {p.size}</span>
                  <span style={{color:'var(--gold)'}}>${p.price}</span>
                </div>
              ) : null
            })}
          </div>
          
          <div style={{borderTop:'1px solid rgba(245,240,232,.08)',paddingTop:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:16,fontWeight:600}}>Total</span>
            <span className="serif" style={{fontSize:28,color:'var(--gold)'}}>${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div style={{color:'#C4622D',fontSize:13,marginBottom:16,padding:'12px 16px',background:'rgba(196,98,45,.08)',border:'1px solid rgba(196,98,45,.15)'}}>
            {error}
          </div>
        )}

        <button 
          className="btn-gold" 
          onClick={handleCheckout} 
          disabled={checkoutLoading || !primaryProduct}
          style={{width:'100%',fontSize:14,padding:'20px'}}
        >
          {checkoutLoading ? '⏳ Redirecting to Stripe...' : `Proceed to Secure Checkout — $${subtotal.toFixed(2)}`}
        </button>
        
        <div style={{display:'flex',justifyContent:'center',gap:24,marginTop:16}}>
          {['🔒 Stripe secure checkout','📦 Ships in 5–7 days','✓ Satisfaction guarantee'].map(t=>(
            <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DirectCheckout() {
  return (
    <Suspense fallback={<div style={{background:'#0A0A0A',minHeight:'100vh'}}/>}>
      <CheckoutPage />
    </Suspense>
  )
}
