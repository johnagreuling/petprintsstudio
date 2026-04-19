'use client'
import Link from 'next/link'

type NavPage = 'home' | 'styles' | 'shop' | 'about' | 'faq' | 'shipping' | null

export default function SiteNav({ currentPage = null }: { currentPage?: NavPage }) {
  const linkStyle = (active: boolean) => ({
    color: active ? 'var(--gold)' : 'var(--muted)',
    textDecoration: 'none',
    fontSize: 11,
    letterSpacing: '.18em',
    textTransform: 'uppercase' as const,
    borderBottom: active ? '1px solid var(--gold)' : '1px solid transparent',
    paddingBottom: 2,
    transition: 'color .2s',
  })

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '20px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10,10,10,.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(245,240,232,.06)',
    }}>
      <Link href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
        <span style={{fontSize:24}}>🐾</span>
        <span className="serif" style={{fontSize:18,letterSpacing:'.06em',color:'var(--cream)'}}>Pet Prints Studio</span>
      </Link>
      <div style={{display:'flex',gap:28,alignItems:'center'}}>
        <Link href="/styles" style={linkStyle(currentPage === 'styles')}>Styles</Link>
        <Link href="/shop" style={linkStyle(currentPage === 'shop')}>Catalog</Link>
      </div>
      <Link href="/create" style={{
        background: 'var(--gold)',
        color: 'var(--ink)',
        padding: '10px 24px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        textDecoration: 'none',
      }}>Begin Their Story</Link>
    </nav>
  )
}
