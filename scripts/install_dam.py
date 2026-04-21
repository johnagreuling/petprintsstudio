#!/usr/bin/env python3
"""
Installer for the DAM (Digital Asset Manager) feature.

Run AFTER the new files are placed. This script does the two surgical edits:
  1. lib/db.ts — inject brand_assets CREATE TABLE + indexes + helper functions
  2. app/admin/page.tsx — add "📁 Assets" link next to the existing admin nav links

Idempotent: safe to run multiple times.
"""
import pathlib
import sys
import re

# ────────────────────────────────────────────────────────────────────
# 1. lib/db.ts patch
# ────────────────────────────────────────────────────────────────────
dbfile = pathlib.Path("lib/db.ts")
if not dbfile.exists():
    print(f"ERROR: {dbfile} not found — are you in the repo root?")
    sys.exit(1)

src = dbfile.read_text()
orig = src

# Step 1a: inject brand_assets CREATE TABLE before the "Create indexes for fast querying" comment
schema_marker = "  // Create indexes for fast querying"
if "CREATE TABLE IF NOT EXISTS brand_assets" not in src:
    schema_block = """  // Brand Assets (DAM — digital asset manager)
  await sql`
    CREATE TABLE IF NOT EXISTS brand_assets (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(500) NOT NULL,
      url VARCHAR(1000) NOT NULL,
      r2_key VARCHAR(1000) NOT NULL,
      category VARCHAR(50) DEFAULT 'uncategorized',
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      file_size_bytes BIGINT DEFAULT 0,
      content_type VARCHAR(100),
      width INT,
      height INT,
      notes TEXT DEFAULT '',
      uploaded_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
"""
    if schema_marker not in src:
        print("ERROR: could not find schema insertion anchor in lib/db.ts.")
        sys.exit(1)
    src = src.replace(schema_marker, schema_block + schema_marker, 1)
    print("  OK  Inserted brand_assets CREATE TABLE")
else:
    print("  SKIP  brand_assets CREATE TABLE already present")

# Step 1b: inject brand_assets indexes at end of the index block (before closing "}")
# The initializeDatabase function ends with a line like:
#   `CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id)`;
# followed by "}".  We splice our index lines just before that closing "}".
idx_anchor = "  await sql`CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id)`;"
if "idx_brand_assets_category" not in src and idx_anchor in src:
    idx_block = idx_anchor + """
  
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_assets_category ON brand_assets(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_assets_uploaded_at ON brand_assets(uploaded_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_assets_tags ON brand_assets USING GIN(tags)`;"""
    src = src.replace(idx_anchor, idx_block, 1)
    print("  OK  Inserted brand_assets indexes")
elif "idx_brand_assets_category" in src:
    print("  SKIP  brand_assets indexes already present")
else:
    print("  WARN  index anchor not found — skipping index insertion")

# Step 1c: append helper functions at the end of db.ts (idempotent via marker check)
helpers_marker = "// BRAND ASSETS (DAM — digital asset manager)"
if helpers_marker not in src:
    helpers = '''

// ============================================================================
// BRAND ASSETS (DAM — digital asset manager)
// ============================================================================

export interface BrandAssetRecord {
  id: number;
  filename: string;
  url: string;
  r2_key: string;
  category: string;
  tags: string[];
  file_size_bytes: number;
  content_type: string | null;
  width: number | null;
  height: number | null;
  notes: string;
  uploaded_at: string;
}

export const BRAND_ASSET_CATEGORIES = [
  'hero',
  'lifestyle-canvas',
  'lifestyle-print',
  'lifestyle-apparel',
  'lifestyle-home',
  'ugc',
  'logo',
  'stock',
  'campaign',
  'uncategorized',
] as const;

export async function insertBrandAsset(data: {
  filename: string;
  url: string;
  r2_key: string;
  category?: string;
  tags?: string[];
  file_size_bytes?: number;
  content_type?: string | null;
  width?: number | null;
  height?: number | null;
  notes?: string;
}) {
  const category = data.category || 'uncategorized';
  const tags = data.tags || [];
  const result = await sql`
    INSERT INTO brand_assets
      (filename, url, r2_key, category, tags, file_size_bytes, content_type, width, height, notes)
    VALUES
      (${data.filename}, ${data.url}, ${data.r2_key}, ${category}, ${tags as any},
       ${data.file_size_bytes || 0}, ${data.content_type || null}, ${data.width || null},
       ${data.height || null}, ${data.notes || ''})
    RETURNING *
  `;
  return result.rows[0] as BrandAssetRecord;
}

export async function getBrandAssets(opts: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const limit = opts.limit ?? 200;
  const offset = opts.offset ?? 0;

  if (opts.category && opts.search) {
    const s = `%${opts.search}%`;
    const r = await sql`
      SELECT * FROM brand_assets
      WHERE category = ${opts.category}
        AND (filename ILIKE ${s} OR notes ILIKE ${s} OR ${opts.search} = ANY(tags))
      ORDER BY uploaded_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return r.rows as BrandAssetRecord[];
  }
  if (opts.category) {
    const r = await sql`
      SELECT * FROM brand_assets
      WHERE category = ${opts.category}
      ORDER BY uploaded_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return r.rows as BrandAssetRecord[];
  }
  if (opts.search) {
    const s = `%${opts.search}%`;
    const r = await sql`
      SELECT * FROM brand_assets
      WHERE filename ILIKE ${s} OR notes ILIKE ${s} OR ${opts.search} = ANY(tags)
      ORDER BY uploaded_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return r.rows as BrandAssetRecord[];
  }
  const r = await sql`
    SELECT * FROM brand_assets
    ORDER BY uploaded_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return r.rows as BrandAssetRecord[];
}

export async function getBrandAssetCountsByCategory() {
  const r = await sql`
    SELECT category, COUNT(*)::int as count
    FROM brand_assets
    GROUP BY category
  `;
  return r.rows as { category: string; count: number }[];
}

export async function updateBrandAsset(id: number, updates: {
  category?: string;
  tags?: string[];
  notes?: string;
}) {
  if (updates.category !== undefined && updates.tags !== undefined && updates.notes !== undefined) {
    const r = await sql`
      UPDATE brand_assets
      SET category = ${updates.category}, tags = ${updates.tags as any}, notes = ${updates.notes}
      WHERE id = ${id}
      RETURNING *
    `;
    return r.rows[0] as BrandAssetRecord;
  }
  if (updates.category !== undefined) {
    const r = await sql`UPDATE brand_assets SET category = ${updates.category} WHERE id = ${id} RETURNING *`;
    return r.rows[0] as BrandAssetRecord;
  }
  if (updates.tags !== undefined) {
    const r = await sql`UPDATE brand_assets SET tags = ${updates.tags as any} WHERE id = ${id} RETURNING *`;
    return r.rows[0] as BrandAssetRecord;
  }
  if (updates.notes !== undefined) {
    const r = await sql`UPDATE brand_assets SET notes = ${updates.notes} WHERE id = ${id} RETURNING *`;
    return r.rows[0] as BrandAssetRecord;
  }
  return null;
}

export async function getBrandAssetById(id: number) {
  const r = await sql`SELECT * FROM brand_assets WHERE id = ${id}`;
  return r.rows[0] as BrandAssetRecord | undefined;
}

export async function deleteBrandAsset(id: number) {
  const r = await sql`DELETE FROM brand_assets WHERE id = ${id} RETURNING *`;
  return r.rows[0] as BrandAssetRecord | undefined;
}
'''
    src = src + helpers
    print("  OK  Appended brand_assets helpers")
else:
    print("  SKIP  brand_assets helpers already appended")

if src != orig:
    dbfile.write_text(src)
    print(f"Patched {dbfile}")

# ────────────────────────────────────────────────────────────────────
# 2. app/admin/page.tsx — add "📁 Assets" nav link
# ────────────────────────────────────────────────────────────────────
navfile = pathlib.Path("app/admin/page.tsx")
if not navfile.exists():
    print(f"ERROR: {navfile} not found")
    sys.exit(1)

src = navfile.read_text()
orig = src

if 'href="/admin/assets"' not in src:
    styles_anchor = '<Link href="/admin/styles" style={styles.navLink}>🎨 Styles</Link>'
    if styles_anchor in src:
        new_link = '<Link href="/admin/assets" style={styles.navLink}>📁 Assets</Link>\n          ' + styles_anchor
        src = src.replace(styles_anchor, new_link, 1)
        print("  OK  Inserted Assets nav link")
    else:
        print("  WARN  admin nav anchor not found — add link manually")
else:
    print("  SKIP  Assets nav link already present")

if src != orig:
    navfile.write_text(src)
    print(f"Patched {navfile}")

print("\nDone. Now: npm run build")
