'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import SiteNav from '@/components/SiteNav'
import { useState } from 'react'
import posthog from 'posthog-js'

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, itemCount, hydrated, clearCart, orderMeta, clearOrderMeta } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const handleCheckout = async () => {
    if (items.length === 0) return
    if (!orderMeta.songGenre) {
      setCheckoutError('Finish your song setup on the Create page before checking out.')
      return
    }
    posthog.capture('checkout_started', { item_count: items.length, subtotal: subtotal, song_genre: orderMeta.songGenre || '' })
    setCheckingOut(true)
    setCheckoutError('')
    try {
      const first = items[0]
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: items,
          songGenre: orderMeta.songGenre || '',
          petName: orderMeta.petName || '',
          petType: orderMeta.petType || '',
          songAnswers: orderMeta.songAnswers || {},
          sessionFolder: orderMeta.sessionFolder || '',
          imageUrl: first?.portraitUrl || '',
          styleName: first?.styleName || '',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError(data.error || 'Checkout failed. Please try again.')
        setCheckingOut(false)
      }
    } catch (e: any) {
      setCheckoutError(e?.message || 'Checkout failed.')
      setCheckingOut(false)
    }
  }

  if (!hydrated) {
    return (
      <div style={{minHeight:'100vh',background:'var(--ink)',color:'var(--cream)'}}>
        <SiteNav currentPage={null} />
        <div style={{maxWidth:900,margin:'0 auto',padding:'140px 24px 80px',textAlign:'center'}}>
          <div style={{color:'var(--muted)',fontSize:14}}>Loading your cart…</div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{minHeight:'100vh',background:'var(--ink)',color:'var(--cream)'}}>
        <SiteNav currentPage={null} />
        <div className="cart-empty" style={{maxWidth:720,margin:'0 auto',padding:'140px 24px 80px',textAlign:'center'}}>
          <div style={{fontSize:10,letterSpacing:'.4em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>Your Cart</div>
          <h1 className="serif" style={{fontSize:48,fontWeight:400,letterSpacing:'-.01em',marginBottom:18}}>It's empty</h1>
          <p style={{fontSize:16,color:'var(--muted)',lineHeight:1.6,marginBottom:36,maxWidth:480,margin:'0 auto 36px'}}>
            Start by uploading a photo of your pet and we'll turn them into a gallery-worthy portrait.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/create" style={{background:'var(--gold)',color:'var(--ink)',padding:'14px 28px',fontSize:11,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',textDecoration:'none'}}>Begin Their Story</Link>
            <Link href="/shop" style={{background:'transparent',color:'var(--cream)',padding:'14px 28px',fontSize:11,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',textDecoration:'none',border:'1px solid rgba(245,240,232,.2)'}}>Browse Catalog</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--ink)',color:'var(--cream)'}}>
      <SiteNav currentPage={null} />
      <div className="cart-wrap" style={{maxWidth:900,margin:'0 auto',padding:'120px 24px 80px'}}>
        <div style={{marginBottom:36,textAlign:'center'}}>
          <div style={{fontSize:10,letterSpacing:'.4em',textTransform:'uppercase',color:'var(--gold)',marginBottom:14}}>Your Cart</div>
          <h1 className="serif" style={{fontSize:44,fontWeight:400,letterSpacing:'-.01em'}}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </h1>
        </div>

        <div className="cart-lines" style={{marginBottom:36}}>
          {items.map(item => (
            <div key={item.lineId} className="cart-line" style={{display:'grid',gridTemplateColumns:'92px 1fr auto',gap:18,padding:'20px 0',borderBottom:'1px solid rgba(245,240,232,.08)',alignItems:'center'}}>
              <div style={{width:92,height:92,background:'#141414',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {item.portraitUrl ? (
                  <img src={item.portraitUrl} alt={item.productName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                ) : (
                  <span style={{fontSize:36}}>🎨</span>
                )}
              </div>
              <div style={{minWidth:0}}>
                <div className="serif" style={{fontSize:17,marginBottom:4}}>{item.productName}</div>
                {item.variantKey && (
                  <div style={{fontSize:12,color:'var(--gold)',marginBottom:4,letterSpacing:'.04em'}}>{item.variantKey}</div>
                )}
                {item.styleName && (
                  <div style={{fontSize:11,color:'var(--muted)',marginBottom:10}}>{item.styleName}</div>
                )}
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <button
                    onClick={() => updateQty(item.lineId, item.quantity - 1)}
                    style={{width:26,height:26,fontSize:14,background:'#1a1a1a',border:'1px solid rgba(245,240,232,.15)',color:'var(--cream)',cursor:'pointer'}}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span style={{fontSize:13,minWidth:20,textAlign:'center',fontVariantNumeric:'tabular-nums'}}>{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.lineId, item.quantity + 1)}
                    style={{width:26,height:26,fontSize:14,background:'#1a1a1a',border:'1px solid rgba(245,240,232,.15)',color:'var(--cream)',cursor:'pointer'}}
                    aria-label="Increase quantity"
                  >+</button>
                  <button
                    onClick={() => removeItem(item.lineId)}
                    style={{marginLeft:8,fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--muted)',background:'none',border:'none',cursor:'pointer',padding:'6px 8px'}}
                    aria-label="Remove"
                  >Remove</button>
                </div>
              </div>
              <div style={{textAlign:'right',whiteSpace:'nowrap'}}>
                <div className="serif" style={{fontSize:18,color:'var(--gold)'}}>${(item.unitPrice * item.quantity).toFixed(2)}</div>
                {item.quantity > 1 && (
                  <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>${item.unitPrice.toFixed(2)} ea</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{background:'#141414',border:'1px solid rgba(245,240,232,.06)',padding:24,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
            <span style={{fontSize:12,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase'}}>Subtotal</span>
            <span className="serif" style={{fontSize:28,color:'var(--cream)'}}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{fontSize:11,color:'var(--muted)',textAlign:'right'}}>Shipping & taxes calculated at checkout</div>
        </div>

        {items.length > 0 && !orderMeta.songGenre && (
          <div style={{background:'rgba(201,168,76,.08)',border:'1px solid rgba(201,168,76,.3)',padding:'14px 18px',marginBottom:16,color:'var(--cream)',fontSize:13}}>
            <strong style={{color:'var(--gold)'}}>One step left:</strong> <Link href="/create?step=checkout" style={{color:'var(--gold)',textDecoration:'underline'}}>Make your song & checkout →</Link>
          </div>
        )}

        {checkoutError && (
          <div style={{background:'rgba(220,38,38,.1)',border:'1px solid rgba(220,38,38,.3)',padding:'12px 16px',marginBottom:16,color:'#ff9b9b',fontSize:13}}>
            {checkoutError}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={checkingOut || !orderMeta.songGenre}
          style={{width:'100%',background:'var(--gold)',color:'var(--ink)',padding:'18px 24px',fontSize:12,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',border:'none',cursor:(checkingOut||!orderMeta.songGenre)?'default':'pointer',opacity:(checkingOut||!orderMeta.songGenre)?.6:1,marginBottom:12}}
        >
          {checkingOut ? 'Redirecting to checkout…' : !orderMeta.songGenre ? 'Make your song & checkout →' : `Proceed to Checkout · $${subtotal.toFixed(2)}`}
        </button>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11,color:'var(--muted)'}}>
          <Link href="/shop" style={{color:'var(--muted)',textDecoration:'none',letterSpacing:'.12em',textTransform:'uppercase'}}>← Keep Shopping</Link>
          <button onClick={()=>{ clearCart(); clearOrderMeta() }} style={{background:'none',border:'none',color:'var(--muted)',fontSize:11,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer'}}>Clear Cart</button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          :global(.cart-wrap) { padding: 100px 16px 60px !important; }
          :global(.cart-line) { grid-template-columns: 68px 1fr auto !important; gap: 12px !important; }
          :global(.cart-line > div:first-child) { width: 68px !important; height: 68px !important; }
        }
      `}</style>
    </div>
  )
}
