'use client'
import { useEffect, useState } from 'react'

export interface StyleEditorValue {
  id: string
  name: string
  emoji: string
  category: string
  description: string
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
}

const FRAMING_OPTIONS = [
  { value: 'preserve_source', label: 'Preserve source framing (default)' },
  { value: 'centered_portrait', label: 'Centered portrait' },
  { value: 'three_quarter', label: 'Three-quarter view' },
  { value: 'full_body', label: 'Full body' },
  { value: 'close_up', label: 'Close-up' },
]

const EMPTY: StyleEditorValue = {
  id: '',
  name: '',
  emoji: '🎨',
  category: '',
  description: '',
  technique: '',
  background: '',
  lighting: '',
  colorPalette: '',
  mood: '',
  paintSurface: '',
  preferredFraming: 'preserve_source',
  forbiddenTraits: [],
  styleConstraints: [],
  isActive: true,
}

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  initial?: Partial<StyleEditorValue> | null
  existingCategories: { id: string; name: string; emoji: string }[]
  onClose: () => void
  onSave: (value: StyleEditorValue) => Promise<void>
}

export default function StyleEditor({ open, mode, initial, existingCategories, onClose, onSave }: Props) {
  const [v, setV] = useState<StyleEditorValue>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPromptPreview, setShowPromptPreview] = useState(true)

  useEffect(() => {
    if (!open) return
    setV({ ...EMPTY, ...(initial || {}) } as StyleEditorValue)
    setError(null)
  }, [open, initial])

  if (!open) return null

  const set = <K extends keyof StyleEditorValue>(k: K, val: StyleEditorValue[K]) =>
    setV(prev => ({ ...prev, [k]: val }))

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40)

  // Auto-generate id from name in create mode if user hasn't typed one
  const onNameChange = (name: string) => {
    setV(prev => ({
      ...prev,
      name,
      id: mode === 'create' && (!prev.id || prev.id === slugify(prev.name)) ? slugify(name) : prev.id,
    }))
  }

  const handleSave = async () => {
    setError(null)
    if (!v.id || !/^[a-z0-9_]{2,40}$/.test(v.id)) {
      setError('id must be lowercase letters, digits, underscores (2-40 chars)')
      return
    }
    if (!v.name.trim()) { setError('name is required'); return }
    if (!v.emoji.trim()) { setError('emoji is required'); return }
    if (!v.category.trim()) { setError('category is required'); return }
    setSaving(true)
    try {
      await onSave(v)
      onClose()
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setSaving(false)
    }
  }

  // Build a preview of the assembled prompt blocks (client-side approximation
  // — real assembly happens in buildPrompt on the server, but this gives
  // an instant feel for what the model will see)
  const previewPrompt = buildLocalPreview(v)

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{v.emoji || '🎨'}</span>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
              {mode === 'create' ? 'Add New Style' : `Edit: ${v.name || v.id}`}
            </h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={bodyStyle}>
          {/* LEFT: form fields */}
          <div style={formColStyle}>
            <Row>
              <Field label="Name" required>
                <input
                  type="text"
                  value={v.name}
                  onChange={e => onNameChange(e.target.value)}
                  placeholder="e.g. Just As They Are"
                  style={inputStyle}
                />
              </Field>
              <Field label="Emoji" required>
                <input
                  type="text"
                  value={v.emoji}
                  onChange={e => set('emoji', e.target.value)}
                  maxLength={4}
                  style={{ ...inputStyle, width: 80, textAlign: 'center', fontSize: 22 }}
                />
              </Field>
            </Row>

            <Row>
              <Field label="ID (URL-safe slug)" required hint="lowercase + underscores, can't change after create">
                <input
                  type="text"
                  value={v.id}
                  disabled={mode === 'edit'}
                  onChange={e => set('id', slugify(e.target.value))}
                  placeholder="just_as_they_are"
                  style={{ ...inputStyle, opacity: mode === 'edit' ? 0.6 : 1 }}
                />
              </Field>
              <Field label="Category" required>
                <CategoryPicker
                  value={v.category}
                  onChange={c => set('category', c)}
                  options={existingCategories}
                />
              </Field>
            </Row>

            <Field label="Description" hint="One-liner shown on cards & in checkout">
              <input
                type="text"
                value={v.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Your photo — gently enhanced, beautifully cropped, and print-ready."
                style={inputStyle}
              />
            </Field>

            <Field label="Technique" hint="HOW it's rendered (medium, brushwork, finish)">
              <textarea
                value={v.technique}
                onChange={e => set('technique', e.target.value)}
                rows={3}
                style={textareaStyle}
              />
            </Field>

            <Field label="Background" hint="The setting / environment behind subject">
              <textarea
                value={v.background}
                onChange={e => set('background', e.target.value)}
                rows={3}
                style={textareaStyle}
              />
            </Field>

            <Field label="Lighting">
              <textarea
                value={v.lighting}
                onChange={e => set('lighting', e.target.value)}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            <Field label="Color Palette">
              <textarea
                value={v.colorPalette}
                onChange={e => set('colorPalette', e.target.value)}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            <Field label="Mood">
              <textarea
                value={v.mood}
                onChange={e => set('mood', e.target.value)}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            <Field label="Paint Surface / Finish">
              <textarea
                value={v.paintSurface}
                onChange={e => set('paintSurface', e.target.value)}
                rows={2}
                style={textareaStyle}
              />
            </Field>

            <Field label="Preferred Framing">
              <select
                value={v.preferredFraming}
                onChange={e => set('preferredFraming', e.target.value)}
                style={inputStyle}
              >
                {FRAMING_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Forbidden Traits" hint="One per line — tells the model what NOT to do">
              <textarea
                value={v.forbiddenTraits.join('\n')}
                onChange={e => set('forbiddenTraits', e.target.value.split('\n').filter(Boolean))}
                rows={5}
                placeholder="no painterly effect of any kind&#10;no brushstrokes, canvas texture, or impasto&#10;no illustration, cartoon, or stylization"
                style={textareaStyle}
              />
            </Field>

            <Field label="Style Constraints" hint="One per line — must-haves for the output">
              <textarea
                value={v.styleConstraints.join('\n')}
                onChange={e => set('styleConstraints', e.target.value.split('\n').filter(Boolean))}
                rows={4}
                placeholder="output must read as a real photograph, never as art&#10;pet must be photographically identical to the source"
                style={textareaStyle}
              />
            </Field>

            <Field label="">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={v.isActive}
                  onChange={e => set('isActive', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#c9a84c' }}
                />
                Active — visible to customers and included in generation runs
              </label>
            </Field>
          </div>

          {/* RIGHT: prompt preview */}
          {showPromptPreview && (
            <div style={previewColStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ fontSize: 13, letterSpacing: 0.5, color: '#c9a84c', textTransform: 'uppercase' }}>
                  Live Prompt Preview
                </strong>
                <button onClick={() => setShowPromptPreview(false)} style={miniBtnStyle}>Hide</button>
              </div>
              <pre style={previewPreStyle}>{previewPrompt}</pre>
              <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                Approximation. The real prompt is assembled server-side using your subject's actual traits.
              </div>
            </div>
          )}
        </div>

        {error && <div style={errorStyle}>⚠ {error}</div>}

        <div style={footerStyle}>
          {!showPromptPreview && (
            <button onClick={() => setShowPromptPreview(true)} style={btnStyle}>
              Show Prompt Preview
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving} style={btnStyle}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={btnGoldStyle}>
            {saving ? 'Saving…' : (mode === 'create' ? 'Create Style' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponents ─────────────────────────────────────────────
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>{children}</div>
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 14, flex: 1, minWidth: 0 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          {hint && <span style={{ fontWeight: 400, color: '#666', textTransform: 'none', letterSpacing: 0, marginLeft: 8 }}>{hint}</span>}
        </label>
      )}
      {children}
    </div>
  )
}

function CategoryPicker({ value, onChange, options }: {
  value: string; onChange: (v: string) => void
  options: { id: string; name: string; emoji: string }[]
}) {
  const [adding, setAdding] = useState(false)
  const [newCat, setNewCat] = useState('')
  if (adding) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          autoFocus
          type="text"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          placeholder="new_category_id"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={() => {
            const slug = newCat.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
            if (slug) onChange(slug)
            setAdding(false)
          }}
          style={miniBtnStyle}
        >Set</button>
        <button onClick={() => setAdding(false)} style={miniBtnStyle}>Cancel</button>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
        <option value="">— pick a category —</option>
        {options.map(c => (
          <option key={c.id} value={c.id}>{c.emoji} {c.name} ({c.id})</option>
        ))}
        {value && !options.find(c => c.id === value) && (
          <option value={value}>{value} (new)</option>
        )}
      </select>
      <button onClick={() => setAdding(true)} style={miniBtnStyle} title="Add new category">+ New</button>
    </div>
  )
}

// ─── Local preview helper ──────────────────────────────────────
function buildLocalPreview(v: StyleEditorValue): string {
  const sections: string[] = []
  sections.push('SUBJECT IDENTITY')
  sections.push('  [filled at runtime from the customer\'s pet photo + traits]')
  sections.push('')
  if (v.technique) {
    sections.push('STYLE')
    sections.push('  ' + v.technique)
    sections.push('')
  }
  sections.push('COMPOSITION')
  sections.push(`  Framing: ${v.preferredFraming || 'preserve_source'}`)
  sections.push('')
  if (v.paintSurface) {
    sections.push('PAINT SURFACE')
    sections.push('  ' + v.paintSurface)
    sections.push('')
  }
  if (v.background || v.lighting || v.colorPalette || v.mood) {
    sections.push('BACKGROUND / ENVIRONMENT')
    if (v.background)    sections.push('  Setting:  ' + v.background)
    if (v.lighting)      sections.push('  Lighting: ' + v.lighting)
    if (v.colorPalette)  sections.push('  Palette:  ' + v.colorPalette)
    if (v.mood)          sections.push('  Mood:     ' + v.mood)
    sections.push('')
  }
  sections.push('CONSTRAINTS')
  sections.push('  - no text, watermarks, or signatures')
  sections.push('  - no extra animals or anatomical errors')
  for (const t of v.forbiddenTraits) sections.push('  - ' + t)
  if (v.styleConstraints.length) {
    sections.push('')
    sections.push('STYLE REQUIREMENTS')
    for (const c of v.styleConstraints) sections.push('  + ' + c)
  }
  return sections.join('\n')
}

// ─── Styles (matches existing admin aesthetic) ────────────────
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20,
}
const modalStyle: React.CSSProperties = {
  background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 12,
  width: '100%', maxWidth: 1200, maxHeight: '92vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  fontFamily: "'DM Sans', system-ui, sans-serif", color: '#f5f0e8',
}
const headerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 24px', borderBottom: '1px solid #2a2a2a', flexShrink: 0,
}
const closeBtnStyle: React.CSSProperties = {
  background: 'transparent', border: 'none', color: '#888',
  fontSize: 22, cursor: 'pointer', padding: 4, width: 32, height: 32,
}
const bodyStyle: React.CSSProperties = {
  display: 'flex', gap: 20, padding: 24, overflow: 'auto', flex: 1,
}
const formColStyle: React.CSSProperties = { flex: '1 1 600px', minWidth: 0 }
const previewColStyle: React.CSSProperties = {
  flex: '1 1 380px', minWidth: 0, position: 'sticky', top: 0,
  background: '#080808', border: '1px solid #2a2a2a', borderRadius: 8, padding: 14,
  alignSelf: 'flex-start', maxHeight: 'calc(92vh - 180px)', overflow: 'auto',
}
const previewPreStyle: React.CSSProperties = {
  margin: 0, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
  fontSize: 12, lineHeight: 1.55, color: '#d4d0c8', whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#141414', border: '1px solid #2a2a2a',
  borderRadius: 6, color: '#f5f0e8', padding: '9px 12px', fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5,
}
const btnStyle: React.CSSProperties = {
  background: '#222', border: '1px solid #333', color: '#f5f0e8',
  padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
  fontFamily: 'inherit',
}
const btnGoldStyle: React.CSSProperties = {
  ...btnStyle, background: '#c9a84c', borderColor: '#c9a84c',
  color: '#0a0a0a', fontWeight: 600,
}
const miniBtnStyle: React.CSSProperties = {
  ...btnStyle, padding: '5px 10px', fontSize: 11,
}
const errorStyle: React.CSSProperties = {
  margin: '0 24px 12px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6,
  color: '#fca5a5', fontSize: 13,
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: 10, padding: '14px 24px',
  borderTop: '1px solid #2a2a2a', flexShrink: 0,
}
