'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Style = {
  id: string
  name: string
  emoji: string
  category: string
  description: string
  showcaseUrl: string | null
  showcasePet: string | null
}

type Category = {
  id: string
  name: string
  emoji: string
  styleCount: number
}

const PET_LABELS: Record<string, string> = {
  mason: 'Mason · Poodle',
  sylas: 'Sylas · Yorkie Poo',
  sasha: 'Sasha · Belgian Malinois',
  biggie: 'Biggie · English Bulldog',
}

const CATEGORY_COLORS: Record<string, string> = {
  classic_portraits: '#c9a84c',
  painterly_fine_art: '#a855f7',
  golden_hour_nature: '#f59e0b',
  lifestyle_story: '#3b82f6',
  pop_modern: '#ef4444',
}

export default function StylesGallery() {
  const [styles, setStyles] = useState<Style[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{style: Style; idx: number} | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const [stylesRes, picksRes] = await Promise.all([
          fetch('/api/admin/styles'),
          fetch('/api/admin/curate-picks'),
        ])
        const stylesData = await stylesRes.json()
        const picksData = await picksRes.json()
        const picks: Record<string, any> = picksData.picks || {}

        // Load sessions (fallback: for old string-format picks, look up URL
        // from the most recent session for that pet)
        const sessionsRes = await fetch('/api/admin/sessions?limit=30')
        const sessionsData = await sessionsRes.json()
        const sessions: Record<string, any> = {}
        for (const s of sessionsData.sessions || []) {
          const pet = (s.pet_name || '').toLowerCase()
          if (pet.includes('mason')) sessions.mason = s
          else if (pet.includes('sylas')) sessions.sylas = s
          else if (pet.includes('sasha')) sessions.sasha = s
        }

        const styleList: Style[] = (stylesData.styles || []).map((s: any) => {
          const pickVal = picks[s.id]
          let showcaseUrl: string | null = null
          let pickedPet: string | null = null

          // New format: { pet, url } — use URL directly
          if (pickVal && typeof pickVal === 'object' && pickVal.url) {
            showcaseUrl = pickVal.url
            pickedPet = pickVal.pet || null
          }
          // Old format: just the pet name — look up URL from session
          else if (typeof pickVal === 'string') {
            pickedPet = pickVal
            if (sessions[pickVal]) {
              const match = sessions[pickVal].images?.find(
                (img: any) => img.style_id.replace(/_\d+$/, '') === s.id
              )
              showcaseUrl = match?.url || null
            }
          }

          if (!showcaseUrl) showcaseUrl = s.sampleImageUrl
          return {
            id: s.id,
            name: s.name,
            emoji: s.emoji,
            category: s.category,
            description: s.description,
            showcaseUrl,
            showcasePet: pickedPet,
          }
        })
        setStyles(styleList)
        setCategories(stylesData.categories || [])
      } catch (e) {
        console.error('Failed to load styles:', e)
      }
      setLoading(false)
    })()
  }, [])

  function prev() {
    if (!lightbox) return
    const visible = activeCategory ? styles.filter(s => s.category === activeCategory) : styles
    const i = (lightbox.idx - 1 + visible.length) % visible.length
    setLightbox({ style: visible[i], idx: i })
  }
  function next() {
    if (!lightbox) return
    const visible = activeCategory ? styles.filter(s => s.category === activeCategory) : styles
    const i = (lightbox.idx + 1) % visible.length
    setLightbox({ style: visible[i], idx: i })
  }

  // Interleave styles so no two portraits from the same pet are adjacent
  // Only applies to "All" view (when no category filter is active)
  function interleaveByPet(arr: Style[]): Style[] {
    if (arr.length < 3) return arr
    const result: Style[] = []
    const remaining = [...arr]
    let lastPet = ''
    while (remaining.length > 0) {
      // Find the first item whose pet differs from the last placed
      const idx = remaining.findIndex(s => s.showcasePet !== lastPet)
      if (idx >= 0) {
        const [item] = remaining.splice(idx, 1)
        result.push(item)
        lastPet = item.showcasePet || ''
      } else {
        // No different pet available — just take the next one
        result.push(remaining.shift()!)
        lastPet = result[result.length - 1].showcasePet || ''
      }
    }
    return result
  }

  const filteredStyles = activeCategory ? styles.filter(s => s.category === activeCategory) : styles
  const visibleStyles = activeCategory ? filteredStyles : interleaveByPet(filteredStyles)

  return (
    <main style={{ background: '#0A0A0A', color: '#F5F0E8', minHeight: '100vh', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .serif { font-family: 'Cormorant Garamond', serif; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --gold: #C9A84C; --cream: #F5F0E8; --ink: #0A0A0A; --muted: rgba(245,240,232,.5); --border: rgba(245,240,232,.08); }
        .style-card { cursor: pointer; transition: transform .2s, box-shadow .2s; position: relative; overflow: hidden; border-radius: 8px; border: 1px solid rgba(245,240,232,.06); }
        .style-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.6); }
        .style-card:hover .card-overlay { opacity: 1; }
        .card-overlay { opacity: 0; transition: opacity .2s; }
        .cat-pill { padding: 10px 18px; border-radius: 24px; font-size: 12px; cursor: pointer; border: 1px solid #333; background: transparent; color: #888; transition: all .15s; letter-spacing: .08em; text-transform: uppercase; }
        .cat-pill:hover { border-color: #555; color: var(--cream); }
        .cat-pill.on { color: var(--cream); }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Mobile polish */
        @media (max-width: 640px) {
          nav { padding: 14px 16px !important; gap: 8px !important; }
          nav > div:nth-child(2) > a:not([href="/styles"]):not([href="/create"]) { display: none !important; }
          nav > div:nth-child(2) { gap: 12px !important; }

          section { padding-left: 16px !important; padding-right: 16px !important; }
          section[style*="paddingTop: 140"], section[style*="padding: '140px"] { padding-top: 96px !important; }

          h1 { font-size: clamp(32px, 9vw, 48px) !important; line-height: 1.1 !important; }
          h2 { font-size: clamp(24px, 7vw, 36px) !important; }

          /* Gallery: 2-up on phone, proper aspect ratio */
          .styles-grid {
            grid-template-columns: 1fr 1fr !important; gap: 8px !important;
          }

          /* Category filter pills — horizontal scroll on phone */
          .cat-pill { padding: 8px 14px !important; font-size: 10px !important; }

          /* Card labels smaller */
          .style-card { aspect-ratio: 3/4 !important; }

          /* Lightbox arrows on phone: don't go off-screen */
          [style*="left: -64"] { left: 4px !important; background: rgba(10,10,10,.8) !important; z-index: 5; }
          [style*="right: -64"] { right: 4px !important; background: rgba(10,10,10,.8) !important; z-index: 5; }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,10,.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>🐾</span>
          <span className="serif" style={{ fontSize: 22, letterSpacing: '.06em', color: 'var(--cream)' }}>Pet Prints Studio</span>
        </Link>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link href="/#how-it-works" style={{ color: 'rgba(245,240,232,.5)', textDecoration: 'none', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>How It Works</Link>
          <Link href="/styles" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', borderBottom: '1px solid var(--gold)', paddingBottom: 2 }}>Styles</Link>
          <Link href="/#the-experience" style={{ color: 'rgba(245,240,232,.5)', textDecoration: 'none', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>The Experience</Link>
          <Link href="/create" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '10px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none' }}>🐾 Start Their Story</Link>
        </div>
      </nav>

      <section style={{ paddingTop: 140, paddingBottom: 40, textAlign: 'center', padding: '140px 48px 40px' }}>
        <div style={{ fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>32 Custom-Tuned Styles &bull; Every One Included</div>
        <h1 className="serif" style={{ fontSize: 'clamp(40px,6vw,80px)', fontWeight: 400, marginBottom: 16, lineHeight: 1.05 }}>
          Every Portrait.<br /><em>A Different Story.</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.9 }}>
          Upload one photo. We generate a portrait in all 32 styles — you just pick the one that feels most like them.
        </p>
        <Link href="/create" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '16px 44px', fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>🐾 Start Their Story — $49</Link>
      </section>

      {!loading && categories.length > 0 && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 48px 24px', display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className={`cat-pill ${!activeCategory ? 'on' : ''}`}
            onClick={() => setActiveCategory(null)}
            style={!activeCategory ? { borderColor: 'var(--gold)' } : {}}
          >
            All ({styles.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`cat-pill ${activeCategory === cat.id ? 'on' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              style={activeCategory === cat.id ? { borderColor: CATEGORY_COLORS[cat.id] || 'var(--gold)' } : {}}
            >
              {cat.emoji} {cat.name} ({cat.styleCount})
            </button>
          ))}
        </section>
      )}

      <section style={{ padding: '20px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
        {loading ? (
          <div className="styles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '3/4', borderRadius: 8, background: 'linear-gradient(110deg, #141414 30%, #1a1a1a 50%, #141414 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite', border: '1px solid rgba(245,240,232,.04)' }} />
            ))}
          </div>
        ) : (
          <div className="styles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {visibleStyles.map((style, idx) => (
              <div
                key={style.id}
                className="style-card"
                style={{ aspectRatio: '3/4', background: '#111' }}
                onClick={() => setLightbox({ style, idx })}
              >
                {style.showcaseUrl ? (
                  <img src={style.showcaseUrl} alt={style.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ fontSize: 64 }}>{style.emoji}</div>
                    <div style={{ fontSize: 11, color: '#444', letterSpacing: '.1em', textTransform: 'uppercase' }}>Preview soon</div>
                  </div>
                )}
                <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,.95) 0%, rgba(10,10,10,.3) 50%, transparent 100%)' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px' }}>
                    <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>{style.emoji} {style.name}</div>
                    <p style={{ fontSize: 13, color: 'rgba(245,240,232,.85)', lineHeight: 1.6 }}>{style.description}</p>
                    {style.showcasePet && (
                      <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(245,240,232,.5)', fontStyle: 'italic' }}>
                        Shown: {PET_LABELS[style.showcasePet]}
                      </div>
                    )}
                    <div style={{ marginTop: 14, fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', borderBottom: '1px solid var(--gold)', paddingBottom: 2, display: 'inline-block' }}>View Full Size →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setLightbox(null)}>
          <div style={{ position: 'relative', maxWidth: 680, width: '100%' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -48, right: 0, background: 'none', border: 'none', color: 'var(--cream)', fontSize: 28, cursor: 'pointer', padding: 8, opacity: .7 }}>✕</button>
            <button onClick={prev} style={{ position: 'absolute', left: -64, top: '40%', transform: 'translateY(-50%)', background: 'rgba(245,240,232,.08)', border: '1px solid rgba(245,240,232,.15)', color: 'var(--cream)', fontSize: 24, cursor: 'pointer', padding: '14px 18px' }}>‹</button>
            <button onClick={next} style={{ position: 'absolute', right: -64, top: '40%', transform: 'translateY(-50%)', background: 'rgba(245,240,232,.08)', border: '1px solid rgba(245,240,232,.15)', color: 'var(--cream)', fontSize: 24, cursor: 'pointer', padding: '14px 18px' }}>›</button>
            <div style={{ aspectRatio: '3/4', overflow: 'hidden', marginBottom: 20 }}>
              {lightbox.style.showcaseUrl ? (
                <img src={lightbox.style.showcaseUrl} alt={lightbox.style.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>{lightbox.style.emoji}</div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{lightbox.style.emoji} Style {lightbox.idx + 1} of {visibleStyles.length}</div>
              <h2 className="serif" style={{ fontSize: 36, fontWeight: 400, marginBottom: 8 }}>{lightbox.style.name}</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 24px' }}>{lightbox.style.description}</p>
              {lightbox.style.showcasePet && (
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,.4)', fontStyle: 'italic', marginBottom: 20 }}>
                  Shown: {PET_LABELS[lightbox.style.showcasePet]}
                </div>
              )}
              <Link href="/create" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '14px 36px', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }} onClick={() => setLightbox(null)}>🐾 Generate This Style — $49</Link>
            </div>
          </div>
        </div>
      )}

      <section style={{ background: 'var(--gold)', padding: '80px 48px', textAlign: 'center' }}>
        <h2 className="serif" style={{ fontSize: 'clamp(32px,5vw,64px)', color: 'var(--ink)', fontWeight: 400, marginBottom: 16 }}>32 Custom Styles.<br />All Included.</h2>
        <p style={{ fontSize: 17, color: 'rgba(10,10,10,.6)', marginBottom: 40, maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.8 }}>Upload your pet&rsquo;s photo and get a portrait in every style — all 32. Pick your favorite.</p>
        <Link href="/create" style={{ background: 'var(--ink)', color: 'var(--gold)', padding: '18px 52px', fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>🐾 Start Their Story — $49</Link>
      </section>
    </main>
  )
}
