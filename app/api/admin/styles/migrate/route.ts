import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@vercel/postgres'
import { seedFromCode } from '@/lib/portrait-engine'

// ════════════════════════════════════════════════════════════════
//  ONE-CLICK MIGRATE + SEED
//
//  POST /api/admin/styles/migrate
//
//  Creates the styles & style_tests tables (idempotent), then seeds
//  every code-defined style into the table. Skips any style id
//  that already exists in the table — safe to run multiple times.
// ════════════════════════════════════════════════════════════════

export async function POST(_: NextRequest) {
  try {
    // Tables
    await sql`
      CREATE TABLE IF NOT EXISTS styles (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        emoji           TEXT NOT NULL DEFAULT '🎨',
        category        TEXT NOT NULL,
        version         INTEGER NOT NULL DEFAULT 1,
        description     TEXT NOT NULL DEFAULT '',
        technique         TEXT NOT NULL DEFAULT '',
        background        TEXT NOT NULL DEFAULT '',
        lighting          TEXT NOT NULL DEFAULT '',
        color_palette     TEXT NOT NULL DEFAULT '',
        mood              TEXT NOT NULL DEFAULT '',
        paint_surface     TEXT NOT NULL DEFAULT '',
        preferred_framing TEXT NOT NULL DEFAULT 'preserve_source',
        forbidden_traits   JSONB NOT NULL DEFAULT '[]'::jsonb,
        style_constraints  JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_active        BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order       INTEGER NOT NULL DEFAULT 100,
        source           TEXT NOT NULL DEFAULT 'admin',
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_tested_at   TIMESTAMPTZ,
        last_test_url    TEXT
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_styles_active   ON styles(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_styles_category ON styles(category)`
    await sql`CREATE INDEX IF NOT EXISTS idx_styles_sort     ON styles(sort_order, name)`

    await sql`
      CREATE TABLE IF NOT EXISTS style_tests (
        id           SERIAL PRIMARY KEY,
        style_id     TEXT NOT NULL,
        image_url    TEXT,
        cost_cents   INTEGER NOT NULL DEFAULT 4,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        triggered_by TEXT
      )
    `
    await sql`CREATE INDEX IF NOT EXISTS idx_style_tests_created ON style_tests(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_style_tests_style   ON style_tests(style_id)`

    // Seed
    const result = await seedFromCode()
    return NextResponse.json({
      ok: true,
      tablesCreated: true,
      seeded: result.inserted,
      skipped: result.skipped,
      message: `Created tables. Seeded ${result.inserted} new styles, skipped ${result.skipped} existing.`,
    })
  } catch (err) {
    console.error('Migrate/seed error:', err)
    return NextResponse.json(
      { error: 'Migration failed', details: String(err) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to create tables and seed styles from code',
  })
}
