'use client'
import Link from 'next/link'
import { PRODUCTS, productImage } from '@/lib/config'

const CATEGORY_ORDER = ['Canvas', 'Prints', 'Home', 'Apparel', 'Accessories']
const CATEGORY_LABELS: Record<string, string> = {
  Canvas: 'Canvas Prints',
  Prints: 'Fine Art Prints',
  Home: 'For the Home',
  Apparel: 'Apparel',
  Accessories: 'Accessories',
}

export default function ShopCatalog() {
  const byCategory: Record<string, any[]> = {}
  for (const p of PRODUCTS) {
    if (!byCategory[p.category]) byCategory[p.category] = []
    byCategory[p.category].push(p)
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--ink)',color:'var(--cream)'}}>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:50,padding:'20px 40px',background:'rgba(10,10,10,.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(245,240,232,.06)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <span style={{fontSize:24}}>🐾</span>
          <span className="serif" style={{fontSize:18,letterSpacing:'.06em',color:'var(--cream)'}}>Pet Prints Studio</span>
        </Link>
        <div style={{display:'flex',gap:28,alignItems:'center'}}>
          <Link href="/styles" style={{color:'var(--muted)',textDecoration:'none',fontSize:11,letterSpacing:'.18em',textTransform:'uppercase'}}>Styles</Link>
          <Link href="/shop" style={{color:'var(--gold)',textDecoration:'none',fontSize:11,letterSpacing:'.18em',textTransform:'uppercase',borderBottom:'1px solid var(--gold)',paddingBottom:2}}>Catalog</Link>
        </div>
        <Link href="/create" className="btn-gold" style={{padding:'10px 20px',fontSize:10}}>Begin Their Story</Link>
      </nav>

      <section style={{padding:'140px 24px 40px',textAlign:'center',maxWidth:1200,margin:'0 auto'}}>
        <div style={{fontSize:10,letterSpacing:'.4em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>The Catalog</div>
        <h1 className="serif" style={{fontSize:52,fontWeight:400,letterSpacing:'-.02em',lineHeight:1.1,marginBottom:20}}>Everything we make</h1>
        <p style={{fontSize:16,color:'var(--muted)',maxWidth:620,margin:'0 auto',lineHeight:1.6}}>
          Gallery-wrapped canvases. Heavyweight tees. Jumbo mugs. Every product is hand-selected for the one thing we care about: how it feels when their portrait is on it.
        </p>
      </section>

      <section style={{maxWidth:1200,margin:'0 auto',padding:'20px 24px 80px'}}>
        {CATEGORY_ORDER.filter(cat => byCategory[cat]?.length > 0).map(cat => (
          <div key={cat} style={{marginBottom:64}}>
            <div style={{marginBottom:24,paddingBottom:14,borderBottom:'1px solid rgba(245,240,232,.08)'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:6}}>{cat}</div>
              <h2 className="serif" style={{fontSize:28,fontWeight:400,letterSpacing:'-.01em'}}>{CATEGORY_LABELS[cat] || cat}</h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:18}}>
              {byCategory[cat].map((p: any) => (
                <div key={p.id} style={{background:'#141414',border:'1px solid rgba(245,240,232,.06)',padding:24,display:'flex',flexDirection:'column',minHeight:320}}>
                  <div style={{width:'100%',aspectRatio:'1/1',background:'#0a0a0a',marginBottom:16,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    <img src={productImage(p.id)} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
                    <div style={{position:'absolute',fontSize:64,opacity:.22}}>{p.emoji}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
                      <div className="serif" style={{fontSize:17,fontWeight:400}}>{p.name}</div>
                      <div className="serif" style={{fontSize:18,color:'var(--gold)'}}>${p.price}</div>
                    </div>
                    <div style={{fontSize:11,color:'var(--gold)',marginBottom:10,letterSpacing:'.05em'}}>{p.size}</div>
                    <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,marginBottom:18}}>{p.description}</p>
                  </div>
                  <Link href={`/create?product=${p.id}`} style={{display:'block',textAlign:'center',padding:'10px 14px',background:'rgba(201,168,76,.1)',border:'1px solid var(--gold)',color:'var(--gold)',textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase'}}>
                    Add My Pet →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section style={{padding:'80px 24px',textAlign:'center',background:'rgba(201,168,76,.03)',borderTop:'1px solid rgba(245,240,232,.06)'}}>
        <h3 className="serif" style={{fontSize:32,fontWeight:400,marginBottom:14}}>Ready to see your pet?</h3>
        <p style={{color:'var(--muted)',fontSize:14,marginBottom:26,maxWidth:480,margin:'0 auto 26px'}}>
          Upload one photo. Pick an art style. Get 24 portraits in under 60 seconds.
        </p>
        <Link href="/create" className="btn-gold" style={{padding:'14px 28px',fontSize:11,letterSpacing:'.2em'}}>Begin Their Story →</Link>
      </section>
    </div>
  )
}
