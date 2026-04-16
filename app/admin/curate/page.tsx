'use client'
import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// SHOWCASE CURATION TOOL
//
// Loads all sessions for Mason, Sylas, and Sasha, then unions their
// available images per style (latest session wins for each style).
// Row list comes from the portrait engine's 30 canonical styles.
//
// Picks are stored in R2 at showcase/picks.json and read by the
// public /styles page.
// ═══════════════════════════════════════════════════════════════════════════

const PET_LABELS: Record<string, string> = {
  mason: 'Mason · Standard Poodle',
  sylas: 'Sylas · Yorkie Poo',
  sasha: 'Sasha · Belgian Malinois',
}

type StyleImg = { style_id: string; style_name: string; url: string; variant_index: number }
type SessionData = { session_id: string; pet_name: string; images: StyleImg[]; created_at: string }
type EngineStyle = { id: string; name: string; emoji: string; category: string; description: string }

export default function CuratePage() {
  const [loading, setLoading] = useState(true)
  const [engineStyles, setEngineStyles] = useState<EngineStyle[]>([])
  const [unionByPet, setUnionByPet] = useState<Record<string, Record<string, { url: string; styleName: string; session: string }>>>({})
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [lightbox, setLightbox] = useState<{url: string; pet: string; style: string} | null>(null)

  useEffect(() => {
    (async () => {
      // Fetch the portrait engine's canonical style list
      const stylesRes = await fetch('/api/admin/styles')
      const stylesData = await stylesRes.json()
      const engine: EngineStyle[] = stylesData.styles || []
      const engineIds = new Set(engine.map(s => s.id))
      setEngineStyles(engine)

      // Fetch ALL recent sessions
      const sessRes = await fetch('/api/admin/sessions?limit=50')
      const sessData = await sessRes.json()
      const allSessions: SessionData[] = sessData.sessions || []

      // Group sessions by pet, then build a union per pet: for each style,
      // use the URL from the most-recent session that has it.
      const sessionsByPet: Record<string, SessionData[]> = { mason: [], sylas: [], sasha: [] }
      for (const s of allSessions) {
        const pet = (s.pet_name || '').toLowerCase()
        if (pet.includes('mason')) sessionsByPet.mason.push(s)
        else if (pet.includes('sylas')) sessionsByPet.sylas.push(s)
        else if (pet.includes('sasha')) sessionsByPet.sasha.push(s)
      }

      // Sort each pet's sessions by created_at DESC (most recent first)
      // so the most recent image wins for each style.
      const union: Record<string, Record<string, { url: string; styleName: string; session: string }>> = {
        mason: {}, sylas: {}, sasha: {},
      }
      for (const pet of ['mason', 'sylas', 'sasha']) {
        const sorted = sessionsByPet[pet].sort((a, b) => {
          const ta = new Date(a.created_at || 0).getTime()
          const tb = new Date(b.created_at || 0).getTime()
          return tb - ta // descending
        })
        for (const s of sorted) {
          for (const img of s.images || []) {
            const sid = img.style_id.replace(/_\d+$/, '')
            // Only include engine styles, and only fill each style once (most recent wins)
            if (engineIds.has(sid) && !union[pet][sid]) {
              union[pet][sid] = { url: img.url, styleName: img.style_name, session: s.session_id }
            }
          }
        }
      }
      setUnionByPet(union)

      // Load any existing picks from R2 (handle both old and new formats)
      try {
        const picksRes = await fetch('/api/admin/curate-picks')
        if (picksRes.ok) {
          const data = await picksRes.json()
          if (data.picks) {
            const normalized: Record<string, string> = {}
            for (const [styleId, val] of Object.entries(data.picks as Record<string, any>)) {
              if (typeof val === 'string') normalized[styleId] = val
              else if (val?.pet) normalized[styleId] = val.pet
            }
            setPicks(normalized)
          }
        }
      } catch (e) { /* no existing picks, ok */ }

      setLoading(false)
    })()
  }, [])

  // Build the ordered row list: one row per engine style, in engine order
  const rows = engineStyles.map(style => ({
    id: style.id,
    name: style.name,
    emoji: style.emoji,
    category: style.category,
    urls: {
      mason: unionByPet.mason?.[style.id]?.url,
      sylas: unionByPet.sylas?.[style.id]?.url,
      sasha: unionByPet.sasha?.[style.id]?.url,
    },
  }))

  const savePicks = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      // Upgrade: save picks with URL included so /styles page can resolve
      // the image regardless of which session it's in.
      const picksWithUrls: Record<string, { pet: string; url: string }> = {}
      for (const [styleId, pet] of Object.entries(picks)) {
        const url = unionByPet[pet]?.[styleId]?.url
        if (url) picksWithUrls[styleId] = { pet, url }
      }
      const res = await fetch('/api/admin/curate-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks: picksWithUrls }),
      })
      if (res.ok) {
        setSaveMsg(`✓ Saved ${Object.keys(picksWithUrls).length} picks`)
      } else {
        setSaveMsg('✗ Save failed')
      }
    } catch (e) {
      setSaveMsg('✗ ' + String(e))
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const pickImage = (styleId: string, pet: string) => {
    setPicks(prev => ({ ...prev, [styleId]: pet }))
  }

  if (loading) return (
    <div style={{ background: '#0a0a0a', color: '#888', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif" }}>
      Loading sessions...
    </div>
  )

  return (
    <div style={{ background: '#0a0a0a', color: '#f5f0e8', minHeight: '100vh', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#111', borderBottom: '1px solid #222', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 28 }}>🎨</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Showcase Curator</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {rows.length} styles · Picks: {Object.keys(picks).length} / {rows.length}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            {saveMsg && <span style={{ fontSize: 13, color: saveMsg.startsWith('✓') ? '#22c55e' : '#ef4444' }}>{saveMsg}</span>}
            <button
              onClick={savePicks}
              disabled={saving || Object.keys(picks).length === 0}
              style={{
                background: saving ? '#333' : '#c9a84c',
                color: saving ? '#888' : '#0a0a0a',
                border: 'none',
                padding: '10px 20px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : `Save ${Object.keys(picks).length} Picks`}
            </button>
            <a href="/admin/styles" style={{ color: '#888', fontSize: 12, textDecoration: 'none' }}>← Styles</a>
          </div>
        </div>
      </header>

      {/* Column labels */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 24px 0', display: 'grid', gridTemplateColumns: '200px 1fr 1fr 1fr', gap: 16, alignItems: 'center', position: 'sticky', top: 73, background: '#0a0a0a', zIndex: 50, borderBottom: '1px solid #222', paddingBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: '#666' }}>Style</div>
        {['mason', 'sylas', 'sasha'].map(pet => (
          <div key={pet} style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: '#c9a84c', textAlign: 'center' }}>
            {PET_LABELS[pet]}
          </div>
        ))}
      </div>

      {/* Style rows */}
      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '24px' }}>
        {rows.map(row => {
          const styleId = row.id
          const pickedPet = picks[styleId]
          return (
            <div
              key={styleId}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr 1fr 1fr',
                gap: 16,
                alignItems: 'start',
                marginBottom: 24,
                padding: 16,
                background: pickedPet ? '#141414' : 'transparent',
                border: pickedPet ? '1px solid #c9a84c' : '1px solid #1a1a1a',
                borderRadius: 8,
                transition: 'all .2s',
              }}
            >
              {/* Style label */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{row.emoji} {row.name}</div>
                <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>{styleId}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>{row.category.replace(/_/g, ' ')}</div>
                {pickedPet && (
                  <div style={{ marginTop: 10, fontSize: 11, color: '#c9a84c', fontWeight: 600 }}>
                    ✓ {PET_LABELS[pickedPet].split(' · ')[0]}
                  </div>
                )}
              </div>

              {/* Three images */}
              {(['mason', 'sylas', 'sasha'] as const).map(pet => {
                const url = row.urls[pet]
                const isPicked = pickedPet === pet
                return (
                  <div
                    key={pet}
                    style={{
                      position: 'relative',
                      aspectRatio: '2/3',
                      background: '#111',
                      borderRadius: 6,
                      overflow: 'hidden',
                      cursor: url ? 'pointer' : 'default',
                      border: isPicked ? '3px solid #c9a84c' : '1px solid #222',
                      boxShadow: isPicked ? '0 0 20px rgba(201,168,76,.3)' : 'none',
                      transition: 'all .15s',
                    }}
                    onClick={() => url && pickImage(styleId, pet)}
                  >
                    {url ? (
                      <>
                        <img
                          src={url}
                          alt={`${pet} ${row.name}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          loading="lazy"
                        />
                        {isPicked && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#c9a84c',
                            color: '#0a0a0a',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                          }}>✓</div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setLightbox({ url, pet, style: row.name })
                          }}
                          style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(0,0,0,.7)',
                            border: 'none',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 14,
                          }}
                          title="Preview full size"
                        >🔍</button>
                      </>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 12 }}>
                        (not generated)
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 40,
          }}
        >
          <div style={{ position: 'absolute', top: 20, left: 20, color: '#c9a84c', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase' }}>
            {lightbox.style} · {PET_LABELS[lightbox.pet]}
          </div>
          <img
            src={lightbox.url}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ position: 'absolute', top: 20, right: 20, color: '#fff', fontSize: 24, cursor: 'pointer' }}>✕</div>
        </div>
      )}
    </div>
  )
}
