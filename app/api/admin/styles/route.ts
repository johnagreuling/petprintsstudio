import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@vercel/postgres'
import {
  readActiveStyles,
  readAllStyles,
  readCategoryCatalog,
  createStyle,
  buildPrompt,
  DEFAULT_COMPOSITION,
  getTestCostStats,
  type SubjectProfile,
  type StyleUpsertInput,
} from '@/lib/portrait-engine'

// ════════════════════════════════════════════════════════════════
//  ADMIN STYLES API
//
//  GET   /api/admin/styles       — list all styles (active + inactive),
//                                   with assembled prompt, sample image,
//                                   categories, and cost stats.
//  POST  /api/admin/styles       — create a new style.
// ════════════════════════════════════════════════════════════════

const SAMPLE_PET: SubjectProfile = {
  subjectType: 'pet',
  summary: 'a tan standard poodle dog with curly fur, dark eyes, and a black nose',
  traits: {
    species: 'dog',
    breed: 'standard poodle',
    coatColor: 'tan',
    coatTexture: 'curly',
  },
  mustPreserve: ['breed', 'coatColor', 'coatTexture'],
  rawAnalysis: '',
}

// ─── GET ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const includeInactive = url.searchParams.get('includeInactive') !== 'false'

    // 1. Style data
    const allStyles = includeInactive ? await readAllStyles() : await readActiveStyles()

    // 2. Sample images from past sessions
    const styleImages: Record<string, string> = {}
    try {
      const { rows } = await sql`
        SELECT images FROM sessions
        WHERE images IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 200
      `
      for (const row of rows) {
        const imgs = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
        for (const img of imgs || []) {
          const sid = img.style_id || img.styleId
          if (!sid || !img.url) continue
          const baseId = sid.replace(/_\d+$/, '')
          if (!styleImages[baseId]) styleImages[baseId] = img.url
        }
      }
    } catch (err) {
      console.warn('[admin/styles] sessions image lookup failed (non-fatal):', err)
    }

    // 3. Override sample with last test image if newer (admin tests are ground truth)
    try {
      const { rows: testRows } = await sql`
        SELECT id, last_test_url FROM styles WHERE last_test_url IS NOT NULL
      `
      for (const row of testRows) {
        if (row.last_test_url) styleImages[row.id] = row.last_test_url
      }
    } catch { /* table may not exist yet — fine */ }

    // 4. Build response per style with assembled prompt
    const styles = allStyles.map(style => {
      const promptPackage = buildPrompt(SAMPLE_PET, style, DEFAULT_COMPOSITION)
      return {
        id: style.id,
        name: style.name,
        emoji: style.emoji,
        category: style.category,
        version: style.version,
        description: style.description,
        technique: style.technique,
        background: style.background,
        lighting: style.lighting,
        colorPalette: style.colorPalette,
        mood: style.mood,
        paintSurface: style.paintSurface,
        preferredFraming: (style as any).preferredFraming || 'preserve_source',
        forbiddenTraits: style.forbiddenTraits,
        styleConstraints: style.styleConstraints,
        isActive: style.isActive !== false,
        gptPrompt: promptPackage.fullPrompt,
        blocks: promptPackage.blocks,
        sampleImageUrl: styleImages[style.id] || null,
      }
    })

    // 5. Categories
    const catalog = await readCategoryCatalog()
    const categories = catalog.map(c => ({
      id: c.category,
      name: c.info.name,
      description: c.info.description,
      emoji: c.info.emoji,
      styleCount: c.styles.length,
    }))

    // 6. Cost stats for the meter
    const costs = await getTestCostStats()

    return NextResponse.json({
      styles,
      categories,
      costs,
      meta: {
        totalStyles: styles.length,
        activeStyles: styles.filter(s => s.isActive).length,
        stylesWithSamples: styles.filter(s => s.sampleImageUrl).length,
        engineVersion: '2.1',
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Styles API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch styles', details: String(error) },
      { status: 500 }
    )
  }
}

// ─── POST ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<StyleUpsertInput>

    // Required fields
    const errors: string[] = []
    if (!body.id || !/^[a-z0-9_]{2,40}$/.test(body.id))
      errors.push('id (lowercase, digits, underscores; 2-40 chars)')
    if (!body.name || body.name.trim().length < 2) errors.push('name')
    if (!body.emoji) errors.push('emoji')
    if (!body.category) errors.push('category')

    if (errors.length) {
      return NextResponse.json(
        { error: 'Missing or invalid fields', fields: errors },
        { status: 400 }
      )
    }

    // Check for collision
    const { rows } = await sql`SELECT id FROM styles WHERE id = ${body.id!} LIMIT 1`
    if (rows.length > 0) {
      return NextResponse.json(
        { error: `Style id "${body.id}" already exists` },
        { status: 409 }
      )
    }

    const created = await createStyle(body as StyleUpsertInput)
    return NextResponse.json({ ok: true, style: created }, { status: 201 })
  } catch (error) {
    console.error('Styles API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create style', details: String(error) },
      { status: 500 }
    )
  }
}
