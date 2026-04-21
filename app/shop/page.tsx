'use client'
import Link from 'next/link'
import Image from 'next/image'
import SiteNav from '@/components/SiteNav'
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
      <SiteNav currentPage="shop" />

      <section className="shop-hero" style={{padding:'140px 24px 40px',textAlign:'center',maxWidth:1200,margin:'0 auto'}}>
        <div style={{fontSize:10,letterSpacing:'.4em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>The Catalog</div>
        <h1 className="serif" style={{fontSize:52,fontWeight:400,letterSpacing:'-.02em',lineHeight:1.1,marginBottom:20}}>Everything We Make</h1>
        <p style={{fontSize:20,color:'rgba(245,240,232,.75)',maxWidth:760,margin:'0 auto',lineHeight:1.55,fontWeight:300}}>
          From gallery-wrapped canvases to luxury soft tees, heirloom blankets, and premium keepsakes, every piece in our collection is chosen for its quality, feel, and finish. These are not throwaway novelty items — they are beautifully made products designed to be loved and cherished for years to come.
        </p>
      </section>

      <section className="shop-grid-section" style={{maxWidth:1200,margin:'0 auto',padding:'20px 24px 80px'}}>
        {CATEGORY_ORDER.filter(cat => byCategory[cat]?.length > 0).map(cat => (
          <div key={cat} className="shop-category-block" style={{marginBottom:64}}>
            <div className="shop-category-header" style={{marginBottom:24,paddingBottom:14,borderBottom:'1px solid rgba(245,240,232,.08)'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:6}}>{cat}</div>
              <h2 className="serif" style={{fontSize:28,fontWeight:400,letterSpacing:'-.01em'}}>{CATEGORY_LABELS[cat] || cat}</h2>
            </div>
            <div className="shop-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:18}}>
              {byCategory[cat].map((p: any) => (
                <div key={p.id} className="shop-tile" style={{background:'#141414',border:'1px solid rgba(245,240,232,.06)',padding:24,display:'flex',flexDirection:'column',minHeight:320}}>
                  <div style={{width:'100%',aspectRatio:'1/1',background:'#0a0a0a',marginBottom:16,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    <Image src={productImage(p.id)} alt={p.name} fill sizes="(max-width:640px) 50vw, (max-width:900px) 33vw, 25vw" style={{objectFit:'cover'}} />
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

      <section className="shop-bottom-cta" style={{padding:'80px 24px',textAlign:'center',background:'rgba(201,168,76,.03)',borderTop:'1px solid rgba(245,240,232,.06)'}}>
        <h3 className="serif" style={{fontSize:32,fontWeight:400,marginBottom:14}}>Ready to see your pet?</h3>
        <p style={{color:'var(--muted)',fontSize:14,marginBottom:26,maxWidth:480,margin:'0 auto 26px'}}>
          Upload a photo.
        </p>
        <Link href="/create" className="btn-gold" style={{padding:'14px 28px',fontSize:11,letterSpacing:'.2em'}}>Begin Their Story →</Link>
      </section>

      <style jsx>{`
        @media (max-width: 720px) {
          :global(.shop-hero) {
            padding: 110px 20px 24px !important;
          }
          :global(.shop-hero h1) {
            font-size: 36px !important;
            line-height: 1.05 !important;
          }
          :global(.shop-hero p) {
            font-size: 15px !important;
            line-height: 1.55 !important;
            max-width: 100% !important;
            padding: 0 4px !important;
          }
          :global(.shop-grid-section) {
            padding: 12px 16px 60px !important;
          }
          :global(.shop-category-block) {
            margin-bottom: 44px !important;
          }
          :global(.shop-category-header h2) {
            font-size: 22px !important;
          }
          :global(.shop-grid) {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          :global(.shop-tile) {
            padding: 18px !important;
            min-height: auto !important;
          }
          :global(.shop-bottom-cta) {
            padding: 56px 20px !important;
          }
          :global(.shop-bottom-cta h3) {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  )
}
