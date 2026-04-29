'use client'
import { useState, useEffect, useCallback } from 'react'
import StyleEditor, { type StyleEditorValue } from '@/components/StyleEditor'

interface StyleData {
  id: string
  name: string
  emoji: string
  category: string
  description: string
  version: number
  gptPrompt: string
  technique: string
  background: string
  lighting: string
  colorPalette: string
  mood: string
  paintSurface: string
  preferredFraming: string
  forbiddenTraits: string[]
  styleConstraints: string[]
  isActive: boolean
  blocks: {
    identity: string
    composition: string
    style: string
    environment: string
    output: string
    constraints: string
  }
  sampleImageUrl: string | null
}

interface CategoryData {
  id: string
  name: string
  description: string
  emoji: string
  styleCount: number
}

interface CostStats {
  thisMonthCents: number
  thisMonthCount: number
  allTimeCents: number
  allTimeCount: number
}

const CATEGORY_COLORS: Record<string, string> = {
  classic_portraits: '#c9a84c',
  painterly_fine_art: '#a855f7',
  golden_hour_nature: '#f59e0b',
  lifestyle_story: '#3b82f6',
  pop_modern: '#ef4444',
  photographic: '#22c55e',
}

export default function AdminStyles() {
  const [styles, setStyles] = useState<StyleData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [costs, setCosts] = useState<CostStats>({ thisMonthCents: 0, thisMonthCount: 0, allTimeCents: 0, allTimeCount: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedStyle, setSelectedStyle] = useState<StyleData | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeBlock, setActiveBlock] = useState<string>('full')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create')
  const [editorInitial, setEditorInitial] = useState<Partial<StyleEditorValue> | null>(null)

  // Test state
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { url: string; cost: number; ms: number }>>({})

  // Migration state
  const [migrating, setMigrating] = useState(false)
  const [migrationMsg, setMigrationMsg] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/styles')
    const data = await res.json()
    setStyles(data.styles || [])
    setCategories(data.categories || [])
    setCosts(data.costs || { thisMonthCents: 0, thisMonthCount: 0, allTimeCents: 0, allTimeCount: 0 })
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const filteredStyles = styles.filter(s => {
    const term = searchFilter.toLowerCase()
    const matchesSearch = !term ||
      s.name.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      (s.description || '').toLowerCase().includes(term)
    const matchesCategory = !activeCategory || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ─── Editor handlers ───────────────────────────────────────
  const openCreate = () => {
    setEditorMode('create')
    setEditorInitial(null)
    setEditorOpen(true)
  }

  const openEdit = (s: StyleData) => {
    setEditorMode('edit')
    setEditorInitial({
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      category: s.category,
      description: s.description,
      technique: s.technique,
      background: s.background,
      lighting: s.lighting,
      colorPalette: s.colorPalette,
      mood: s.mood,
      paintSurface: s.paintSurface,
      preferredFraming: s.preferredFraming,
      forbiddenTraits: s.forbiddenTraits,
      styleConstraints: s.styleConstraints,
      isActive: s.isActive,
    })
    setEditorOpen(true)
  }

  const handleSave = async (value: StyleEditorValue) => {
    if (editorMode === 'create') {
      const res = await fetch('/api/admin/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Create failed')
      }
    } else {
      const res = await fetch(`/api/admin/styles/${value.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Update failed')
      }
    }
    await refresh()
  }

  // ─── Test handler ──────────────────────────────────────────
  const handleTest = async (s: StyleData) => {
    if (testingId) return
    setTestingId(s.id)
    try {
      const res = await fetch(`/api/admin/styles/${s.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: 'medium' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Test failed')
      setTestResults(prev => ({
        ...prev,
        [s.id]: { url: data.imageUrl, cost: data.costCents, ms: data.elapsedMs },
      }))
      await refresh() // updates cost meter + sample
    } catch (err: any) {
      alert(`Test failed: ${err.message}`)
    } finally {
      setTestingId(null)
    }
  }

  // ─── Toggle active ─────────────────────────────────────────
  const handleToggleActive = async (s: StyleData) => {
    await fetch(`/api/admin/styles/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !s.isActive }),
    })
    await refresh()
  }

  // ─── Delete ────────────────────────────────────────────────
  const handleDelete = async (s: StyleData) => {
    const confirmed = confirm(
      `Soft-delete "${s.name}"?\n\n` +
      `It will be hidden from customers and generation runs but kept in the database. ` +
      `You can restore it later by toggling it active again.`
    )
    if (!confirmed) return
    await fetch(`/api/admin/styles/${s.id}`, { method: 'DELETE' })
    await refresh()
  }

  // ─── Migrate ───────────────────────────────────────────────
  const handleMigrate = async () => {
    setMigrating(true)
    setMigrationMsg(null)
    try {
      const res = await fetch('/api/admin/styles/migrate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Migration failed')
      setMigrationMsg(data.message || 'Done.')
      await refresh()
    } catch (err: any) {
      setMigrationMsg(`Error: ${err.message}`)
    } finally {
      setMigrating(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#f5f0e8',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #666; }
        .style-card { background:#141414; border:1px solid #2a2a2a; border-radius:12px; overflow:hidden; transition:all .2s; }
        .style-card:hover { border-color:#c9a84c; transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,.4); }
        .style-card.inactive { opacity:.5; }
        .btn { background:#222; border:1px solid #333; color:#f5f0e8; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:12px; transition:all .15s; display:inline-flex; align-items:center; gap:5px; font-family:inherit; }
        .btn:hover { background:#333; border-color:#444; }
        .btn:disabled { opacity:.5; cursor:not-allowed; }
        .btn-gold { background:#c9a84c; color:#0a0a0a; border-color:#c9a84c; font-weight:600; }
        .btn-gold:hover { background:#d4b85c; }
        .btn-ghost { background:transparent; border-color:#333; }
        .btn-danger { background:transparent; color:#fca5a5; border-color:#5a2a2a; }
        .btn-danger:hover { background:rgba(239,68,68,.15); border-color:#ef4444; }
        .search-input { background:#141414; border:1px solid #2a2a2a; color:#f5f0e8; padding:11px 16px; border-radius:8px; font-size:14px; outline:none; font-family:inherit; }
        .search-input:focus { border-color:#c9a84c; }
        .pill { padding:6px 12px; border-radius:999px; font-size:12px; cursor:pointer; transition:all .15s; border:1px solid #333; background:#141414; color:#aaa; }
        .pill:hover { border-color:#555; color:#f5f0e8; }
        .pill.active { background:#c9a84c; color:#0a0a0a; border-color:#c9a84c; font-weight:600; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #2a2a2a', padding: '24px 32px', background: '#0d0d0d' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>🎨 Style Library</h1>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>
              {styles.length} total · {styles.filter(s => s.isActive).length} active · {categories.length} categories
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <CostMeter costs={costs} />
            <button className="btn btn-ghost" onClick={handleMigrate} disabled={migrating} title="Create DB tables and seed from code (idempotent)">
              {migrating ? 'Syncing…' : '⟳ Sync from Code'}
            </button>
            <button className="btn btn-gold" onClick={openCreate}>+ Add Style</button>
          </div>
        </div>
        {migrationMsg && (
          <div style={{ maxWidth: 1400, margin: '12px auto 0', padding: '8px 14px', background: '#1a2a1a', border: '1px solid #2a4a2a', borderRadius: 6, fontSize: 13, color: '#9be39b' }}>
            {migrationMsg}
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 32px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search styles by name, id, or description..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          style={{ width: '100%', marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button className={`pill ${activeCategory === null ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>
            All ({styles.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`pill ${activeCategory === c.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.id)}
              style={activeCategory === c.id ? { background: CATEGORY_COLORS[c.id] || '#c9a84c', borderColor: CATEGORY_COLORS[c.id] || '#c9a84c' } : {}}
            >
              {c.emoji} {c.name} ({c.styleCount})
            </button>
          ))}
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Loading styles…</div>
        ) : filteredStyles.length === 0 ? (
          <EmptyState onCreate={openCreate} onMigrate={handleMigrate} migrating={migrating} hasAny={styles.length > 0} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
            {filteredStyles.map(s => (
              <StyleCard
                key={s.id}
                style={s}
                onView={() => setSelectedStyle(s)}
                onEdit={() => openEdit(s)}
                onTest={() => handleTest(s)}
                onToggle={() => handleToggleActive(s)}
                onDelete={() => handleDelete(s)}
                onCopy={() => copyToClipboard(s.gptPrompt, s.id)}
                copied={copiedId === s.id}
                testing={testingId === s.id}
                testResult={testResults[s.id]}
                categoryColor={CATEGORY_COLORS[s.category] || '#c9a84c'}
              />
            ))}
          </div>
        )}
      </div>

      {/* PROMPT-VIEWER MODAL (existing behavior) */}
      {selectedStyle && (
        <PromptModal
          style={selectedStyle}
          activeBlock={activeBlock}
          setActiveBlock={setActiveBlock}
          onClose={() => setSelectedStyle(null)}
          onCopy={(t, id) => copyToClipboard(t, id)}
          copiedId={copiedId}
          onEdit={() => { openEdit(selectedStyle); setSelectedStyle(null) }}
        />
      )}

      {/* EDITOR MODAL */}
      <StyleEditor
        open={editorOpen}
        mode={editorMode}
        initial={editorInitial}
        existingCategories={categories.map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  SUBCOMPONENTS
// ════════════════════════════════════════════════════════════

function CostMeter({ costs }: { costs: CostStats }) {
  const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`
  return (
    <div style={{
      background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8,
      padding: '8px 14px', display: 'flex', gap: 14, alignItems: 'center', fontSize: 12,
    }}>
      <div>
        <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tests this month</div>
        <div style={{ color: '#c9a84c', fontWeight: 600 }}>
          {costs.thisMonthCount} <span style={{ color: '#888', fontWeight: 400 }}>({dollars(costs.thisMonthCents)})</span>
        </div>
      </div>
      <div style={{ width: 1, height: 24, background: '#333' }} />
      <div>
        <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>All time</div>
        <div style={{ color: '#aaa' }}>
          {costs.allTimeCount} <span style={{ color: '#888' }}>({dollars(costs.allTimeCents)})</span>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreate, onMigrate, migrating, hasAny }: {
  onCreate: () => void; onMigrate: () => void; migrating: boolean; hasAny: boolean
}) {
  return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
      <h3 style={{ margin: '0 0 8px' }}>{hasAny ? 'No styles match your filter' : 'No styles yet'}</h3>
      <p style={{ color: '#888', marginBottom: 24 }}>
        {hasAny ? 'Try clearing the search or category filter.' : 'Sync your existing code-defined styles into the database, or add a brand new style.'}
      </p>
      {!hasAny && (
        <div style={{ display: 'inline-flex', gap: 10 }}>
          <button className="btn" onClick={onMigrate} disabled={migrating}>
            {migrating ? 'Syncing…' : '⟳ Sync from Code'}
          </button>
          <button className="btn btn-gold" onClick={onCreate}>+ Add First Style</button>
        </div>
      )}
    </div>
  )
}

function StyleCard({
  style: s, onView, onEdit, onTest, onToggle, onDelete, onCopy,
  copied, testing, testResult, categoryColor,
}: {
  style: StyleData
  onView: () => void; onEdit: () => void; onTest: () => void
  onToggle: () => void; onDelete: () => void; onCopy: () => void
  copied: boolean; testing: boolean
  testResult?: { url: string; cost: number; ms: number }
  categoryColor: string
}) {
  const sampleUrl = testResult?.url || s.sampleImageUrl
  return (
    <div className={`style-card ${s.isActive ? '' : 'inactive'}`}>
      {/* SAMPLE IMAGE */}
      <div
        onClick={onView}
        style={{
          aspectRatio: '2/3', background: '#1a1a1a', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          cursor: 'pointer', position: 'relative',
        }}
      >
        {sampleUrl ? (
          <img src={sampleUrl} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: 60, opacity: 0.4 }}>{s.emoji}</div>
        )}
        {testResult && (
          <div style={{
            position: 'absolute', top: 8, right: 8, background: 'rgba(34,197,94,0.9)',
            color: '#000', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
          }}>
            ✓ TEST {testResult.cost / 100}¢ · {(testResult.ms / 1000).toFixed(1)}s
          </div>
        )}
        {!s.isActive && (
          <div style={{
            position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)',
            color: '#fca5a5', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
          }}>
            INACTIVE
          </div>
        )}
      </div>

      {/* META */}
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <span style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.name}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: categoryColor, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {s.category}
        </div>
        <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, height: 36, overflow: 'hidden', marginBottom: 12 }}>
          {s.description || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>(no description)</span>}
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn" onClick={onTest} disabled={testing} title="Generate one test image (~$0.04)">
            {testing ? '⏳' : '🧪'} {testing ? 'Testing…' : 'Test'}
          </button>
          <button className="btn" onClick={onEdit} title="Edit prompt and fields">✏️ Edit</button>
          <button className="btn" onClick={onView} title="View full assembled prompt">👁 Prompt</button>
          <button className="btn" onClick={onCopy} title="Copy full prompt">{copied ? '✓' : '📋'}</button>
          <button className="btn btn-ghost" onClick={onToggle} title={s.isActive ? 'Hide from customers' : 'Show to customers'}>
            {s.isActive ? '⏸' : '▶'}
          </button>
          <button className="btn btn-danger" onClick={onDelete} title="Soft delete">🗑</button>
        </div>
      </div>
    </div>
  )
}

function PromptModal({ style: s, activeBlock, setActiveBlock, onClose, onCopy, copiedId, onEdit }: {
  style: StyleData
  activeBlock: string
  setActiveBlock: (b: string) => void
  onClose: () => void
  onCopy: (t: string, id: string) => void
  copiedId: string | null
  onEdit: () => void
}) {
  const blockKeys = ['full', 'identity', 'style', 'composition', 'environment', 'output', 'constraints']
  const blockText = activeBlock === 'full' ? s.gptPrompt : (s.blocks?.[activeBlock as keyof typeof s.blocks] || '(empty)')
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 12,
        width: '100%', maxWidth: 1100, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{s.emoji}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>{s.name}</h2>
              <div style={{ fontSize: 12, color: '#888' }}>{s.id}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-gold" onClick={onEdit}>✏️ Edit</button>
            <button className="btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 24px', borderBottom: '1px solid #2a2a2a', overflowX: 'auto' }}>
          {blockKeys.map(k => (
            <button
              key={k}
              className={`pill ${activeBlock === k ? 'active' : ''}`}
              onClick={() => setActiveBlock(k)}
            >{k}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <pre style={{
            margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: 13,
            lineHeight: 1.6, color: '#d4d0c8', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{blockText}</pre>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 24px', borderTop: '1px solid #2a2a2a' }}>
          <button className="btn" onClick={() => onCopy(blockText, `modal-${s.id}-${activeBlock}`)}>
            {copiedId === `modal-${s.id}-${activeBlock}` ? '✓ Copied' : '📋 Copy'}
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ alignSelf: 'center', fontSize: 12, color: '#666' }}>
            {blockText.length.toLocaleString()} chars · ~{Math.round(blockText.length / 4).toLocaleString()} tokens
          </span>
        </div>
      </div>
    </div>
  )
}
