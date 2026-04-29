// ════════════════════════════════════════════════════════════════
//  STYLE STORE — Single source of truth for style data
//
//  Read order:
//    1. Postgres `styles` table (primary)
//    2. Code-defined ALL_STYLES from styles.ts (fallback)
//
//  This means the site never breaks. If the DB is empty (first-time
//  setup) or unreachable, generation continues from the code styles.
//
//  Write goes only to Postgres. Edits in admin never modify code files.
// ════════════════════════════════════════════════════════════════

import { sql } from '@vercel/postgres'
import { ALL_STYLES, CATEGORY_INFO } from './styles'
import type { StyleTemplate, StyleCategory, FramingMode } from './types'

// Cache for hot path (active styles list) — invalidated on writes.
let cache: { stamp: number; styles: StyleTemplate[] } | null = null
const CACHE_TTL_MS = 30_000

function invalidateCache() { cache = null }

// ─── Row → Template conversion ──────────────────────────────────
// Coerces array | JSON-array string | JSON-string | comma-separated string
function parseList(v: any): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return []
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed
      if (typeof parsed === 'string') return parsed.split(',').map(x => x.trim()).filter(Boolean)
    } catch {
      return s.split(',').map(x => x.trim()).filter(Boolean)
    }
  }
  return []
}

function rowToStyle(row: any): StyleTemplate {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    category: row.category as StyleCategory,
    version: row.version ?? 1,
    description: row.description ?? '',
    technique: row.technique ?? '',
    background: row.background ?? '',
    lighting: row.lighting ?? '',
    colorPalette: row.color_palette ?? '',
    mood: row.mood ?? '',
    paintSurface: row.paint_surface ?? '',
    preferredFraming: (row.preferred_framing ?? 'preserve_source') as FramingMode,
    forbiddenTraits: parseList(row.forbidden_traits),
    styleConstraints: parseList(row.style_constraints),
    isActive: row.is_active !== false,
  }
}

// ─── Read ───────────────────────────────────────────────────────
export async function readAllStyles(): Promise<StyleTemplate[]> {
  const now = Date.now()
  if (cache && now - cache.stamp < CACHE_TTL_MS) return cache.styles

  try {
    const { rows } = await sql`
      SELECT * FROM styles
      ORDER BY sort_order ASC, name ASC
    `
    if (rows.length === 0) {
      // DB exists but empty — fall back to code so site keeps working
      cache = { stamp: now, styles: ALL_STYLES }
      return ALL_STYLES
    }
    const styles = rows
      .map(r => { try { return rowToStyle(r) } catch (e) { console.warn('[style-store] bad row', r.id, e); return null } })
      .filter((s): s is StyleTemplate => s !== null)
    cache = { stamp: now, styles }
    return styles
  } catch (err) {
    // DB unreachable or migration not yet run — code fallback
    console.warn('[style-store] DB read failed, using code fallback:', err)
    return ALL_STYLES
  }
}

export async function readActiveStyles(): Promise<StyleTemplate[]> {
  const all = await readAllStyles()
  return all.filter(s => s.isActive !== false)
}

export async function readStyleById(id: string): Promise<StyleTemplate | null> {
  const all = await readAllStyles()
  return all.find(s => s.id === id) ?? null
}

// ─── Write ──────────────────────────────────────────────────────
export interface StyleUpsertInput {
  id: string
  name: string
  emoji: string
  category: StyleCategory
  version?: number
  description?: string
  technique?: string
  background?: string
  lighting?: string
  colorPalette?: string
  mood?: string
  paintSurface?: string
  preferredFraming?: FramingMode
  forbiddenTraits?: string[]
  styleConstraints?: string[]
  isActive?: boolean
  sortOrder?: number
}

export async function createStyle(input: StyleUpsertInput): Promise<StyleTemplate> {
  await sql`
    INSERT INTO styles (
      id, name, emoji, category, version, description,
      technique, background, lighting, color_palette, mood,
      paint_surface, preferred_framing,
      forbidden_traits, style_constraints,
      is_active, sort_order, source
    ) VALUES (
      ${input.id},
      ${input.name},
      ${input.emoji},
      ${input.category},
      ${input.version ?? 1},
      ${input.description ?? ''},
      ${input.technique ?? ''},
      ${input.background ?? ''},
      ${input.lighting ?? ''},
      ${input.colorPalette ?? ''},
      ${input.mood ?? ''},
      ${input.paintSurface ?? ''},
      ${input.preferredFraming ?? 'preserve_source'},
      ${JSON.stringify(parseList(input.forbiddenTraits as any))}::jsonb,
      ${JSON.stringify(parseList(input.styleConstraints as any))}::jsonb,
      ${input.isActive ?? true},
      ${input.sortOrder ?? 100},
      'admin'
    )
  `
  invalidateCache()
  const created = await readStyleById(input.id)
  if (!created) throw new Error('Style created but not retrievable')
  return created
}

export async function updateStyle(
  id: string,
  patch: Partial<StyleUpsertInput>
): Promise<StyleTemplate> {
  // Read current row, merge patch, single UPDATE.
  const current = await readStyleById(id)
  if (!current) throw new Error(`Style not found: ${id}`)

  const merged = { ...current, ...patch }
  await sql`
    UPDATE styles SET
      name              = ${merged.name},
      emoji             = ${merged.emoji},
      category          = ${merged.category},
      version           = ${merged.version ?? 1},
      description       = ${merged.description ?? ''},
      technique         = ${merged.technique ?? ''},
      background        = ${merged.background ?? ''},
      lighting          = ${merged.lighting ?? ''},
      color_palette     = ${merged.colorPalette ?? ''},
      mood              = ${merged.mood ?? ''},
      paint_surface     = ${merged.paintSurface ?? ''},
      preferred_framing = ${merged.preferredFraming ?? 'preserve_source'},
      forbidden_traits  = ${JSON.stringify(parseList(merged.forbiddenTraits as any))}::jsonb,
      style_constraints = ${JSON.stringify(parseList(merged.styleConstraints as any))}::jsonb,
      is_active         = ${merged.isActive !== false},
      updated_at        = NOW()
    WHERE id = ${id}
  `
  invalidateCache()
  const after = await readStyleById(id)
  if (!after) throw new Error('Style updated but not retrievable')
  return after
}

export async function deleteStyle(id: string, hard = false): Promise<void> {
  if (hard) {
    await sql`DELETE FROM styles WHERE id = ${id}`
  } else {
    await sql`UPDATE styles SET is_active = FALSE, updated_at = NOW() WHERE id = ${id}`
  }
  invalidateCache()
}

export async function setActive(id: string, isActive: boolean): Promise<void> {
  await sql`UPDATE styles SET is_active = ${isActive}, updated_at = NOW() WHERE id = ${id}`
  invalidateCache()
}

// ─── Seed from code ─────────────────────────────────────────────
//  One-click migration: copies all ALL_STYLES into the DB. Idempotent —
//  safe to run multiple times, won't overwrite existing edits.
export async function seedFromCode(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < ALL_STYLES.length; i++) {
    const s = ALL_STYLES[i]
    const existing = await sql`SELECT id FROM styles WHERE id = ${s.id} LIMIT 1`
    if (existing.rows.length > 0) {
      skipped++
      continue
    }
    await sql`
      INSERT INTO styles (
        id, name, emoji, category, version, description,
        technique, background, lighting, color_palette, mood,
        paint_surface, preferred_framing,
        forbidden_traits, style_constraints,
        is_active, sort_order, source
      ) VALUES (
        ${s.id},
        ${s.name},
        ${s.emoji},
        ${s.category},
        ${s.version ?? 1},
        ${s.description ?? ''},
        ${s.technique ?? ''},
        ${s.background ?? ''},
        ${s.lighting ?? ''},
        ${s.colorPalette ?? ''},
        ${s.mood ?? ''},
        ${s.paintSurface ?? ''},
        ${(s as any).preferredFraming ?? 'preserve_source'},
        ${JSON.stringify(s.forbiddenTraits ?? [])}::jsonb,
        ${JSON.stringify(s.styleConstraints ?? [])}::jsonb,
        ${s.isActive !== false},
        ${i * 10},
        'seed'
      )
    `
    inserted++
  }
  invalidateCache()
  return { inserted, skipped }
}

// ─── Test cost tracking ─────────────────────────────────────────
export async function recordTest(opts: {
  styleId: string
  imageUrl?: string
  costCents?: number
  triggeredBy?: string
}): Promise<void> {
  await sql`
    INSERT INTO style_tests (style_id, image_url, cost_cents, triggered_by)
    VALUES (${opts.styleId}, ${opts.imageUrl ?? null}, ${opts.costCents ?? 4}, ${opts.triggeredBy ?? 'admin'})
  `
  await sql`
    UPDATE styles
    SET last_tested_at = NOW(),
        last_test_url  = ${opts.imageUrl ?? null}
    WHERE id = ${opts.styleId}
  `
}

export async function getTestCostStats(): Promise<{
  thisMonthCents: number
  thisMonthCount: number
  allTimeCents: number
  allTimeCount: number
}> {
  try {
    const { rows: month } = await sql`
      SELECT COALESCE(SUM(cost_cents),0)::int AS cents, COUNT(*)::int AS n
      FROM style_tests
      WHERE created_at >= date_trunc('month', NOW())
    `
    const { rows: all } = await sql`
      SELECT COALESCE(SUM(cost_cents),0)::int AS cents, COUNT(*)::int AS n
      FROM style_tests
    `
    return {
      thisMonthCents: month[0].cents,
      thisMonthCount: month[0].n,
      allTimeCents: all[0].cents,
      allTimeCount: all[0].n,
    }
  } catch {
    return { thisMonthCents: 0, thisMonthCount: 0, allTimeCents: 0, allTimeCount: 0 }
  }
}

// ─── Categories ─────────────────────────────────────────────────
export async function readCategoryCatalog() {
  const styles = await readAllStyles()
  const byCategory = new Map<StyleCategory, StyleTemplate[]>()
  for (const s of styles) {
    const list = byCategory.get(s.category) ?? []
    list.push(s)
    byCategory.set(s.category, list)
  }
  return Array.from(byCategory.entries()).map(([cat, list]) => ({
    category: cat,
    info: CATEGORY_INFO[cat] ?? { name: cat, emoji: '🎨', description: '' },
    styles: list,
  }))
}
