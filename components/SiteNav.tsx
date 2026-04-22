'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import Logo from '@/components/Logo'

type NavPage = 'home' | 'styles' | 'shop' | 'about' | 'faq' | 'shipping' | null

export default function SiteNav({ currentPage = null }: { currentPage?: NavPage }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()

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

  const mobileLinkStyle = (active: boolean) => ({
    color: active ? 'var(--gold)' : 'var(--cream)',
    textDecoration: 'none',
    fontSize: 14,
    letterSpacing: '.2em',
    textTransform: 'uppercase' as const,
    padding: '18px 24px',
    display: 'block',
    borderBottom: '1px solid rgba(245,240,232,.06)',
  })

  return (
    <>
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
        height: 74,
      }} className="site-nav">
        <Link href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}} onClick={() => setMenuOpen(false)}>
          <Logo height={32} priority />
        </Link>

        {/* Desktop links */}
        <div className="nav-desktop-links" style={{display:'flex',gap:28,alignItems:'center'}}>
          <Link href="/styles" style={linkStyle(currentPage === 'styles')}>Styles</Link>
          <Link href="/shop" style={linkStyle(currentPage === 'shop')}>Catalog</Link>
          <Link href="/cart" style={{
            color: itemCount > 0 ? 'var(--gold)' : 'var(--muted)',
            textDecoration: 'none',
            fontSize: 11,
            letterSpacing: '.18em',
            textTransform: 'uppercase' as const,
            paddingBottom: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'color .2s',
          }}>
            🛒 Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </Link>
        </div>

        {/* Desktop CTA button */}
        <Link href="/create" className="nav-desktop-cta" style={{
          background: 'var(--gold)',
          color: 'var(--ink)',
          padding: '10px 24px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>Begin Their Story</Link>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Open menu"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--cream)',
            cursor: 'pointer',
            padding: 8,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{display:'flex',flexDirection:'column',gap:5,width:22}}>
            <span style={{height:1.5,background:'var(--cream)',transition:'transform .2s',transformOrigin:'center',transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none'}}/>
            <span style={{height:1.5,background:'var(--cream)',opacity:menuOpen?0:1,transition:'opacity .2s'}}/>
            <span style={{height:1.5,background:'var(--cream)',transition:'transform .2s',transformOrigin:'center',transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
          </div>
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div
          className="nav-mobile-panel"
          style={{
            position: 'fixed',
            top: 74,
            left: 0,
            right: 0,
            zIndex: 99,
            background: 'rgba(10,10,10,.98)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(245,240,232,.08)',
            display: 'none',
          }}
        >
          <Link href="/styles" style={mobileLinkStyle(currentPage === 'styles')} onClick={() => setMenuOpen(false)}>Styles</Link>
          <Link href="/shop" style={mobileLinkStyle(currentPage === 'shop')} onClick={() => setMenuOpen(false)}>Catalog</Link>
          <Link href="/cart" style={{
            ...mobileLinkStyle(false),
            color: itemCount > 0 ? 'var(--gold)' : 'var(--cream)',
          }} onClick={() => setMenuOpen(false)}>🛒 Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Link>
          <Link href="/create" style={{
            background: 'var(--gold)',
            color: 'var(--ink)',
            padding: '20px 24px',
            display: 'block',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            margin: '8px 16px 16px',
          }} onClick={() => setMenuOpen(false)}>Begin Their Story</Link>
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 720px) {
          :global(.site-nav) {
            padding: 16px 20px !important;
          }
          :global(.nav-desktop-links),
          :global(.nav-desktop-cta) {
            display: none !important;
          }
          :global(.nav-mobile-toggle) {
            display: flex !important;
          }
          :global(.nav-mobile-panel) {
            display: ${menuOpen ? 'block' : 'none'} !important;
          }
        }
      `}</style>
    </>
  )
}
