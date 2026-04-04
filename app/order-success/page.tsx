'use client'
import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function Success() {
  const params = useSearchParams()
  return (
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 24px',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');.serif{font-family:'Cormorant Garamond',serif}@keyframes pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}.pop{animation:pop .7s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
      <div style={{maxWidth:600}}>
        <div className="pop" style={{fontSize:80,marginBottom:32}}>🎉</div>
        <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'#C9A84C',marginBottom:16}}>Order Confirmed</div>
        <h1 className="serif" style={{fontSize:'clamp(36px,5vw,64px)',fontWeight:400,marginBottom:20,lineHeight:1.05}}>
          Your Portrait is<br/><em style={{color:'#C9A84C'}}>On Its Way!</em>
        </h1>
        <p style={{fontSize:16,lineHeight:1.9,color:'rgba(245,240,232,.55)',marginBottom:48,maxWidth:440,margin:'0 auto 48px'}}>
          We&rsquo;ve received your order and it&rsquo;s already being sent to print. You&rsquo;ll receive a shipping confirmation with tracking within 1–2 business days.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,marginBottom:48}}>
          {[{icon:'🎨',title:'Printing Now',desc:'Your portrait enters production within 24 hours'},{icon:'📦',title:'Ships in 5–7 Days',desc:'Professional packing and tracked shipping'},{icon:'🚪',title:'Delivered',desc:'Tracking email sent the day it ships'}].map(s=>(
            <div key={s.title} style={{background:'#141414',border:'1px solid rgba(245,240,232,.06)',padding:'24px 16px'}}>
              <div style={{fontSize:28,marginBottom:10}}>{s.icon}</div>
              <div className="serif" style={{fontSize:17,marginBottom:6,fontWeight:400}}>{s.title}</div>
              <div style={{fontSize:12,color:'rgba(245,240,232,.4)',lineHeight:1.7}}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/create" style={{background:'#C9A84C',color:'#0A0A0A',padding:'18px 36px',fontSize:11,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block'}}>🐾 Create Another Portrait</Link>
          <Link href="/" style={{border:'1px solid rgba(245,240,232,.15)',color:'rgba(245,240,232,.5)',padding:'18px 36px',fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',textDecoration:'none',display:'inline-block'}}>Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccess() {
  return <Suspense fallback={<div style={{background:'#0A0A0A',minHeight:'100vh'}}/>}><Success/></Suspense>
}
