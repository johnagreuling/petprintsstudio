-- ════════════════════════════════════════════════════════════════
--  STYLES TABLE — Stores editable style definitions
--
--  Mirrors the StyleTemplate type in lib/portrait-engine/types.ts.
--  Code-defined styles in styles.ts remain as a fallback if the
--  table is empty, ensuring the site never breaks during transition.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS styles (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  emoji           TEXT NOT NULL DEFAULT '🎨',
  category        TEXT NOT NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  description     TEXT NOT NULL DEFAULT '',

  -- Descriptive prompt fields (assembled by buildPrompt at runtime)
  technique         TEXT NOT NULL DEFAULT '',
  background        TEXT NOT NULL DEFAULT '',
  lighting          TEXT NOT NULL DEFAULT '',
  color_palette     TEXT NOT NULL DEFAULT '',
  mood              TEXT NOT NULL DEFAULT '',
  paint_surface     TEXT NOT NULL DEFAULT '',
  preferred_framing TEXT NOT NULL DEFAULT 'preserve_source',

  -- JSON arrays of strings
  forbidden_traits   JSONB NOT NULL DEFAULT '[]'::jsonb,
  style_constraints  JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Lifecycle
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order       INTEGER NOT NULL DEFAULT 100,

  -- Audit
  source           TEXT NOT NULL DEFAULT 'admin', -- 'seed' | 'admin'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_tested_at   TIMESTAMPTZ,
  last_test_url    TEXT
);

CREATE INDEX IF NOT EXISTS idx_styles_active   ON styles(is_active);
CREATE INDEX IF NOT EXISTS idx_styles_category ON styles(category);
CREATE INDEX IF NOT EXISTS idx_styles_sort     ON styles(sort_order, name);

-- Track admin test generation costs for the cost meter
CREATE TABLE IF NOT EXISTS style_tests (
  id           SERIAL PRIMARY KEY,
  style_id     TEXT NOT NULL,
  image_url    TEXT,
  cost_cents   INTEGER NOT NULL DEFAULT 4,  -- ~$0.04 at quality:medium
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_style_tests_created ON style_tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_style_tests_style   ON style_tests(style_id);
