#!/usr/bin/env python3
"""
PetPrintsStudio update:
  1. GEN_LIMITS: 6 styles × 1 portrait initial, up to 24 total, 6 per style cap
  2. Scrub all hardcoded "32" style counts from user-facing copy
  3. Rewrite positioning: artist-curated, multi-model in-house pipeline (not ChatGPT)
"""
import pathlib, sys

ROOT = pathlib.Path(".")
changes = []

def patch(path, old, new, label):
    f = ROOT / path
    src = f.read_text()
    count = src.count(old)
    if count != 1:
        print(f"  ✗ {label}: expected 1 match, got {count} in {path}")
        sys.exit(1)
    f.write_text(src.replace(old, new))
    changes.append(f"  ✓ {label} ({path})")

# 1. GEN_LIMITS
patch(
    "lib/config.ts",
    """export const GEN_LIMITS = {
  MAX_STYLES_INITIAL: 4,   // max styles user can pick on initial round
  INITIAL_PER_STYLE: 2,    // images generated per style on initial round
  MAX_PER_STYLE: 3,        // total max per style across the whole session
  MAX_TOTAL: 16,           // hard session cap across all styles
} as const""",
    """export const GEN_LIMITS = {
  MAX_STYLES_INITIAL: 6,   // max styles user can pick on initial round
  INITIAL_PER_STYLE: 1,    // images generated per style on initial round
  MAX_PER_STYLE: 6,        // total max per style across the whole session
  MAX_TOTAL: 24,           // hard session cap across all styles
} as const""",
    "GEN_LIMITS updated to 6/1/6/24"
)

# 2. /about engine paragraph
patch(
    "app/about/page.tsx",
    "Our portrait engine uses the latest AI generation models, hand-tuned across 32 artistic styles — from classical oil painting to neon pop art. But technology is only half the story. The other half is the questionnaire: we ask about your pet&rsquo;s name, personality, favorite things, and the details that matter to you. That information shapes every portrait, making each one genuinely unique.",
    "Our portrait engine is a multi-model imaging chain developed in-house and tuned by hand — not a one-shot ChatGPT prompt. Every style is artist-curated, with layered passes that lock your pet&rsquo;s identity first and then apply the chosen aesthetic. The questionnaire feeds into every stage: pet name, personality, favorite places, the little things that matter. That&rsquo;s what shapes every portrait into something genuinely unique.",
    "/about engine paragraph rewritten"
)

# 3. /about stat block
patch(
    "app/about/page.tsx",
    "{n:'32',l:'Custom Art Styles'},",
    "{n:'✓',l:'Artist-Curated Styles'},",
    "/about stat block scrubbed"
)

# 4. /styles header
patch(
    "app/styles/page.tsx",
    "32 Custom-Tuned Styles &bull; Every One Included",
    "Artist-Curated Styles &bull; Every One Included",
    "/styles header scrubbed"
)

# 5. /styles subhead
patch(
    "app/styles/page.tsx",
    "Upload your pet&rsquo;s photo and get a portrait in every style — all 32. Pick your favorite.",
    "Upload your pet&rsquo;s photo and see it rendered in every style we offer. Pick your favorite.",
    "/styles subhead scrubbed"
)

# 6. /faq question
patch(
    "app/faq/page.tsx",
    "q: 'What are the 32 styles?',",
    "q: 'What styles do you offer?',",
    "/faq question scrubbed"
)

# 7. /create picker lead-in
patch(
    "app/create/page.tsx",
    "Choose up to <strong style={{color:'var(--cream)'}}>{GEN_LIMITS.MAX_STYLES_INITIAL}</strong> styles to start. We'll generate <strong style={{color:'var(--cream)'}}>{GEN_LIMITS.INITIAL_PER_STYLE} portraits</strong> of each, then you can explore more from the gallery.",
    "Pick your favorite styles to start — we'll render your pet in each one using our in-house imaging chain. From the gallery you can explore more variations of any style you love.",
    "/create picker lead-in rewritten"
)

# 8. /create +1 more modal description
patch(
    "app/create/page.tsx",
    "We'll generate 1 portrait in this style. {GEN_LIMITS.MAX_TOTAL - totalGenerated} left in your session.",
    "We'll add another portrait in this style.",
    "/create +1 more modal scrubbed"
)

# 9. /page.tsx comment cleanup
patch(
    "app/page.tsx",
    "// Load ALL curated portraits for the hero slider (32 if all picked)",
    "// Load ALL curated portraits for the hero slider",
    "hero slider comment cleaned"
)

print("Applied patches:")
for c in changes:
    print(c)
print(f"\n{len(changes)} edits across 6 files. Run `npm run build` to verify.")
