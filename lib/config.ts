// ─────────────────────────────────────────────────────────────────
//  PET PRINTS STUDIO — Central Configuration
//  All variant IDs verified via Printify API 2026-04-17
// ─────────────────────────────────────────────────────────────────

export const PRODUCTS = [
  // ── CANVAS — Gallery-wrapped on 1.5" stretcher bars, ready to hang ──────
  { id: 'canvas_8x10',   name: 'Canvas Print', size: '8×10"',  category: 'Canvas', price: 79,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93928,  popular: false, emoji: '🖼️', description: 'Thick 1.5" gallery-wrapped canvas with mitered corners. Professional-grade archival inks on heavyweight poly-cotton. Arrives with hardware — ready to hang.' },
  { id: 'canvas_11x14',  name: 'Canvas Print', size: '11×14"', category: 'Canvas', price: 99,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 155629, popular: false, emoji: '🖼️', description: 'Thick 1.5" gallery-wrapped canvas with mitered corners. Professional-grade archival inks on heavyweight poly-cotton. Arrives with hardware — ready to hang.' },
  { id: 'canvas_12x16',  name: 'Canvas Print', size: '12×16"', category: 'Canvas', price: 109, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93931,  popular: false, emoji: '🖼️', description: 'Thick 1.5" gallery-wrapped canvas with mitered corners. Professional-grade archival inks on heavyweight poly-cotton. Arrives with hardware — ready to hang.' },
  { id: 'canvas_16x20',  name: 'Canvas Print', size: '16×20"', category: 'Canvas', price: 129, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93936,  popular: true,  emoji: '🖼️', description: 'Our most popular size. Thick 1.5" gallery-wrapped canvas, archival inks on heavyweight poly-cotton. The size that looks right above a sofa or in a hallway.' },
  { id: 'canvas_18x24',  name: 'Canvas Print', size: '18×24"', category: 'Canvas', price: 149, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93939,  popular: false, emoji: '🖼️', description: 'Thick 1.5" gallery-wrapped canvas with mitered corners. Professional-grade archival inks on heavyweight poly-cotton. Arrives with hardware — ready to hang.' },
  { id: 'canvas_20x30',  name: 'Canvas Print', size: '20×30"', category: 'Canvas', price: 169, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93942,  popular: false, emoji: '🖼️', description: 'Statement piece. Thick 1.5" gallery-wrapped canvas, professional-grade inks. Commands attention in any room.' },
  { id: 'canvas_24x36',  name: 'Canvas Print', size: '24×36"', category: 'Canvas', price: 199, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93946,  popular: false, emoji: '🖼️', description: 'Our largest format. Thick 1.5" gallery-wrapped canvas with the presence of a real art installation. Every brushstroke visible at this scale.' },

  // ── FINE ART PRINTS — Archival matte paper ──────────────────────────────
  { id: 'print_8x10',   name: 'Fine Art Print', size: '8×10"',  category: 'Prints', price: 39,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75288,  popular: false, emoji: '📄', description: 'Heavyweight 200gsm archival matte paper. Vibrant pigment inks designed for color accuracy and longevity. Frame it yourself for a custom look.' },
  { id: 'print_11x14',  name: 'Fine Art Print', size: '11×14"', category: 'Prints', price: 49,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100934, popular: false, emoji: '📄', description: 'Heavyweight 200gsm archival matte paper. Vibrant pigment inks designed for color accuracy and longevity. Frame it yourself for a custom look.' },
  { id: 'print_12x16',  name: 'Fine Art Print', size: '12×16"', category: 'Prints', price: 55,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75290,  popular: false, emoji: '📄', description: 'Heavyweight 200gsm archival matte paper. Vibrant pigment inks designed for color accuracy and longevity. Frame it yourself for a custom look.' },
  { id: 'print_16x20',  name: 'Fine Art Print', size: '16×20"', category: 'Prints', price: 65,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75292,  popular: true,  emoji: '📄', description: 'Our most popular print. Heavyweight 200gsm archival matte — the same paper used by fine art printmakers. Rich, accurate color that lasts.' },
  { id: 'print_18x24',  name: 'Fine Art Print', size: '18×24"', category: 'Prints', price: 79,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100938, popular: false, emoji: '📄', description: 'Heavyweight 200gsm archival matte paper. Vibrant pigment inks designed for color accuracy and longevity. Frame it yourself for a custom look.' },
  { id: 'print_24x36',  name: 'Fine Art Print', size: '24×36"', category: 'Prints', price: 99,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75296,  popular: false, emoji: '📄', description: 'Large format archival matte. At this size, the portrait has real presence — museum-scale detail on paper built to last.' },

  // ── BLANKETS — Premium soft goods ───────────────────────────────────────
  { id: 'blanket_50x60', name: 'Velveteen Plush Blanket', size: '50×60"', category: 'Home', price: 69, printifyBlueprintId: 522, printifyProviderId: 99, printifyVariantId: 68323, popular: true,  emoji: '🛋️', description: 'We chose velveteen plush because nothing else prints this sharp or feels this soft. 300gsm heavyweight fabric with a silky hand-feel. Not a novelty throw — a real blanket you will actually use.' },
  { id: 'blanket_60x80', name: 'Velveteen Plush Blanket', size: '60×80"', category: 'Home', price: 89, printifyBlueprintId: 522, printifyProviderId: 99, printifyVariantId: 68324, popular: false, emoji: '🛋️', description: 'King-size velveteen plush. Same 300gsm heavyweight fabric, same silky feel — just large enough to wrap up in on the couch. The portrait covers the full blanket in vivid detail.' },
  { id: 'baby_blanket',  name: 'Baby Blanket', size: '30×40"', category: 'Home', price: 39, printifyBlueprintId: 585, printifyProviderId: 70, printifyVariantId: 71950, popular: false, emoji: '👶', description: 'Ultra-soft fleece, gentle enough for a newborn. The portrait of the family dog on baby\'s first blanket — a keepsake that connects the whole family from day one.' },
  { id: 'beach_towel',   name: 'Beach Towel',  size: '36×72"', category: 'Home', price: 49, printifyBlueprintId: 352, printifyProviderId: 99, printifyVariantId: 44445, popular: false, emoji: '🏖️', description: 'Oversized 36×72" with edge-to-edge vivid color. Absorbent microfiber that dries fast and travels light. Take their portrait to the beach, the pool, or the park.' },

  // ── HOME — Premium keepsakes ────────────────────────────────────────────
  { id: 'mug_20oz',  name: 'Jumbo Mug',     size: '20oz',    category: 'Home', price: 34, printifyBlueprintId: 1126, printifyProviderId: 59, printifyVariantId: 84117,  popular: true,  emoji: '☕', description: 'Oversized 20oz ceramic — not the flimsy 11oz you see everywhere. Full wrap-around portrait in a glossy, dishwasher-safe finish. Your morning coffee, their face looking back at you.' },
  { id: 'pillow',    name: 'Throw Pillow',   size: '18×18"',  category: 'Home', price: 44, printifyBlueprintId: 1572, printifyProviderId: 10, printifyVariantId: 110270, popular: false, emoji: '🛏️', description: 'Premium polyester cover with the insert already included — not a pillowcase that ships empty. Vivid double-sided printing with a soft, huggable feel. A portrait you can hold.' },

  // ── APPAREL ─────────────────────────────────────────────────────────────
  { id: 'tshirt',  name: 'Premium Tee',     size: 'S–4XL', category: 'Apparel', price: 39, printifyBlueprintId: 12,  printifyProviderId: 99, printifyVariantId: 18101, popular: false, emoji: '👕', description: 'Bella+Canvas 3001 — the shirt premium brands use. 100% Airlume combed ring-spun cotton, modern retail fit, pre-shrunk. Feels like a $50 tee because it is one.', sizes: ['S','M','L','XL','2XL','3XL'], colors: ['Black','White'] },
  { id: 'hoodie',  name: 'Premium Hoodie',  size: 'S–2XL', category: 'Apparel', price: 59, printifyBlueprintId: 458, printifyProviderId: 26, printifyVariantId: 63759, popular: true,  emoji: '🧥', description: 'Heavyweight pullover with double-lined hood and front pouch pocket. Full portrait printed across the chest in vivid color. The kind of hoodie you reach for every time.', sizes: ['S','M','L','XL','2XL'], colors: ['Black','White'] },
  { id: 'kids_tee',    name: 'Kids Tee',     size: 'S–L', category: 'Apparel', price: 29, printifyBlueprintId: 420, printifyProviderId: 3,  printifyVariantId: 61516, popular: false, emoji: '👶', description: 'Bella+Canvas 3001Y — the same premium Airlume cotton as our adult tee, sized for kids. Soft, lightweight, modern fit with tear-away label. Ages 6–14.', sizes: ['S','M','L'], colors: ['Black','White'] },
  { id: 'kids_hoodie', name: 'Kids Hoodie',  size: 'XS–XL', category: 'Apparel', price: 49, printifyBlueprintId: 314, printifyProviderId: 217, printifyVariantId: 43880, popular: false, emoji: '🧒', description: 'Gildan 18500B Youth Heavy Blend — heavyweight fleece with double-lined hood. The same quality as our adult hoodie, built for kids who love their pets. Ages 6–14.', sizes: ['XS','S','M','L','XL'], colors: ['Black','White'] },

  // ── ACCESSORIES ─────────────────────────────────────────────────────────
  { id: 'tote',       name: 'Canvas Tote Bag', size: 'One size',   category: 'Accessories', price: 24, printifyBlueprintId: 553,  printifyProviderId: 34, printifyVariantId: 70603,  popular: false, emoji: '👜', description: 'Heavy-duty 12oz cotton canvas with reinforced stitching. Not a promotional giveaway tote — a real bag you\'ll carry to the farmer\'s market, the gym, the office.' },
  { id: 'phone_case', name: 'Phone Case',      size: 'All models', category: 'Accessories', price: 29, printifyBlueprintId: 269,  printifyProviderId: 1,  printifyVariantId: 103562, popular: false, emoji: '📱', description: 'Impact-resistant dual-layer tough case. Raised bezels protect the screen and camera. Their portrait in your pocket, on the thing you touch 200 times a day.' },
]

export const PHONE_CASE_VARIANTS: Record<string, number> = {
  'iPhone 11': 62582, 'iPhone 11 Pro': 62583, 'iPhone 11 Pro Max': 62584,
  'iPhone 12': 70871, 'iPhone 12 Mini': 70872, 'iPhone 12 Pro': 70873, 'iPhone 12 Pro Max': 70874,
  'iPhone 13': 76611, 'iPhone 13 Mini': 76612, 'iPhone 13 Pro': 76613, 'iPhone 13 Pro Max': 76614,
  'iPhone 14': 93905, 'iPhone 14 Pro': 93906, 'iPhone 14 Pro Max': 93907, 'iPhone 14 Plus': 93908,
  'iPhone 15': 103561, 'iPhone 15 Pro': 103562, 'iPhone 15 Plus': 103563, 'iPhone 15 Pro Max': 103564,
  'Samsung Galaxy S24': 105527,
}

export const TEE_VARIANTS: Record<string, number> = {
  'Black / S': 18100, 'Black / M': 18101, 'Black / L': 18102, 'Black / XL': 18103, 'Black / 2XL': 18104, 'Black / 3XL': 18105,
  'White / S': 18540, 'White / M': 18541, 'White / L': 18542, 'White / XL': 18543, 'White / 2XL': 18544, 'White / 3XL': 18545,
}

export const HOODIE_VARIANTS: Record<string, number> = {
  'Black / S': 63759, 'Black / M': 63764, 'Black / L': 63769, 'Black / XL': 63774, 'Black / 2XL': 63779,
  'White / S': 63762, 'White / M': 63767, 'White / L': 63772, 'White / XL': 63777, 'White / 2XL': 63782,
}

export const KIDS_TEE_VARIANTS: Record<string, number> = {
  'Black / S': 61515, 'Black / M': 61517,
  'White / S': 61516, 'White / M': 61518, 'White / L': 61520,
}

export const KIDS_HOODIE_VARIANTS: Record<string, number> = {
  'Black / XS': 64304, 'Black / S': 43880, 'Black / M': 43899, 'Black / L': 43918, 'Black / XL': 43937,
  'White / XS': 64302, 'White / S': 43879, 'White / M': 43898, 'White / L': 43917, 'White / XL': 43936,
}

export const PRODUCT_CATEGORIES = ['Canvas', 'Prints', 'Home', 'Apparel', 'Accessories']

// ─────────────────────────────────────────────────────────────────
//  GENERATION LIMITS — new flow (4/17 refactor)
// ─────────────────────────────────────────────────────────────────
export const GEN_LIMITS = {
  MAX_STYLES_INITIAL: 6,   // max styles user can pick on initial round
  INITIAL_PER_STYLE: 1,    // images generated per style on initial round
  MAX_PER_STYLE: 6,        // total max per style across the whole session
  MAX_TOTAL: 24,           // hard session cap across all styles
} as const

// ─────────────────────────────────────────────────────────────────
//  LEGACY PRICING (kept for backward-compat; not used in new flow)
// ─────────────────────────────────────────────────────────────────
export const DIGITAL_BUNDLE_PRICE = 19.99
export const MEMORY_UPGRADE_PRICE = 20.00
export const ALL_IMAGES_PRICE     = 29.99
export const PET_SONG_PRICE       = 0
export const VARIATIONS_PER_STYLE = 3
export const DEFAULT_STYLES = ['oil_painting', 'watercolor', 'impasto', 'pop_art', 'renaissance', 'impressionist', 'cartoon', 'vintage_poster', 'vintage_pop_art', 'vintage_poster_v2', 'neon_glow', 'storybook']

export const ASTRIA_API = 'https://api.astria.ai'
export const ASTRIA_BASE_MODEL_ID = 690204


// ─────────────────────────────────────────────────────────────────
//  ART STYLES — the 18 styles users can pick from in the style picker
//  (fixed: moved 'vintage_pop_art_v2' out of the old QUESTIONNAIRE array)
// ─────────────────────────────────────────────────────────────────
export const ART_STYLES = [
  { id: 'oil_painting',    generateStyleId: 'ethereal',          name: 'Ethereal Painterly',  emoji: '🎨', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/69508879-38da-4363-8550-bfa2b0de317a.png', description: 'Soft, dreamlike brushwork with luminous depth. Your pet rendered in a timeless painterly style worthy of any gallery wall.' },
  { id: 'watercolor',      generateStyleId: 'watercolor',        name: 'Watercolor',          emoji: '💧', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/1fec89ea-4a9d-4d4d-9cf9-fbdb3b41ea2f_pet/05ae39e1-c440-4d7a-a376-b91e038af83f.png',     description: 'Delicate washes and soft edges. A luminous, flowing watercolor portrait with the feel of fine art on paper.' },
  { id: 'impasto',         generateStyleId: 'impasto',           name: 'Impasto Expressionism', emoji: '🖌️', styleImage: '/styles/impasto.png',     description: 'Thick palette-knife texture, heavy layered paint, bold broken brush strokes. Modern fine art with a luxury gallery aesthetic.' },
  { id: 'pop_art',         generateStyleId: 'bold_contemporary', name: 'Contemporary Bold',   emoji: '⚡', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/1fec89ea-4a9d-4d4d-9cf9-fbdb3b41ea2f_pet/91946181-1e9e-4814-815d-7a5995474b0a.png', description: 'Bold, jewel-toned, and vividly alive. Contemporary graphic energy with a gallery-quality finish.' },
  { id: 'renaissance',     generateStyleId: 'classical_oil',     name: 'Oil Painting',        emoji: '👑', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/36d3f3aa-89ba-4fca-b8a2-21807fb4842d.png',     description: 'Rich classical oil portrait. Dramatic light, deep color, and Old Masters gravitas.' },
  { id: 'impressionist',   generateStyleId: 'impressionist',     name: 'Impressionist',       emoji: '🌸', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/1fec89ea-4a9d-4d4d-9cf9-fbdb3b41ea2f_pet/50a2157a-c23d-426c-a93b-a7bc9a5fe237.png',     description: 'Monet-style dappled light and visible brushwork. Color and emotion over precision.' },
  { id: 'pastel',          generateStyleId: 'pastel',            name: 'Soft Pastel',         emoji: '🕊️', styleImage: '/styles/pastel.png',     description: 'Dreamy pastel chalk on toned paper. Delicate, warm, and deeply tender.' },
  { id: 'vintage_poster',  generateStyleId: 'vintage_poster',    name: 'Vintage Poster',      emoji: '🗺️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/7e147ede-e23a-4116-8bbf-470d5cb3686f.png',     description: 'Mid-century travel poster energy. Bold graphic composition, flat shapes, nostalgic retro palette.' },
  { id: 'vintage_pop_art', generateStyleId: 'vintage_pop_art',   name: 'Gallery Pop',     emoji: '🎭', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/9ed0f1d3-d107-411f-b9de-d42a3f149e10_pet/14433dd2-76fb-4476-9793-d54d491ba793.png',     description: 'Bold single-portrait gallery pop art. Clean graphic shapes, vibrant color blocking, modern gallery energy. Iconic and frame-worthy.' },
  { id: 'vintage_poster_v2', generateStyleId: 'vintage_poster_v2', name: 'Heritage Poster',  emoji: '🏛️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/d5290324-2755-4600-b056-5c80ef76eb7b.png',     description: 'Premium retro collectible with badge and sunburst elements. Frame-worthy vintage wall art.' },
  { id: 'neon_glow',       generateStyleId: 'neon_glow',         name: 'Neon Glow',           emoji: '🌟', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/703cc385-770a-4066-80cf-29b07359c245.png',     styleBg: 'linear-gradient(135deg,#050510 0%,#150530 50%,#0a1540 100%)', styleAccent: '#a855f7', description: 'Electric, cinematic, high-contrast. Glowing neon outlines on a deep dark background.' },
  { id: 'storybook',       generateStyleId: 'storybook',         name: 'Storybook Nostalgia', emoji: '📖', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/db78566f-8c8e-46f5-8c6d-1267f07029b4.png',     styleBg: 'linear-gradient(135deg,#1a0f05 0%,#3a1f08 50%,#4a2d10 100%)', styleAccent: '#d4a855', description: 'Warm, cozy, memory-filled. A painterly scene that feels like a cherished illustrated storybook.' },
  { id: 'retro_pop',       generateStyleId: 'retro_pop',         name: 'Retro Pop',           emoji: '🟥', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/bb0b4cd0-815f-4f41-b45a-78b8c845edc4_pet/f247f626-fef9-4632-bdd2-31aba2eb6261.png',     description: 'Classic Warhol-style 4-panel grid. Same portrait repeated in four bold, vibrant color palettes. Retro, iconic, collectible.' },
  { id: 'fairytale',       generateStyleId: 'fairytale',         name: 'Fairytale',           emoji: '✨', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/9ed0f1d3-d107-411f-b9de-d42a3f149e10_pet/4cbae4ca-1c8c-4e67-83fc-e3b5ccaaadda.png', styleBg: 'linear-gradient(135deg,#1a0a2e 0%,#2d1b4e 40%,#1a2a1a 70%,#0d1a0d 100%)', styleAccent: '#f0c060', description: 'Soft magical storybook portrait with warm golden light, soulful eyes, floating sparkles, and a cozy whimsical scene.' },
  { id: 'comic_animation', generateStyleId: 'comic_animation',   name: 'Premium Comic',       emoji: '💥', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/1fec89ea-4a9d-4d4d-9cf9-fbdb3b41ea2f_pet/3f911b27-983e-4679-af55-702a6cf2aa7d.png', styleBg: 'linear-gradient(135deg,#1a0505 0%,#2d0a0a 40%,#1a1a2e 70%,#0a0a1a 100%)', styleAccent: '#ff4444', description: 'Bold comic book portrait with clean inked linework, cel shading, cinematic lighting, and vivid animated character energy.' },
  { id: 'fine_art_sketch', generateStyleId: 'fine_art_sketch',   name: 'Fine Art Sketch',     emoji: '🖊️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/9ed0f1d3-d107-411f-b9de-d42a3f149e10_pet/6a8d45a3-3b8b-4cb9-a4a1-e7a9ae442e25.png', styleBg: 'linear-gradient(135deg,#1a1a14 0%,#2a2a1e 40%,#1e1e18 70%,#141410 100%)', styleAccent: '#c8b89a', description: 'Museum-quality charcoal and graphite portrait on textured paper. Elegant linework, soft crosshatching, and deeply emotional presence.' },
  { id: 'chateau_pop',     generateStyleId: 'chateau_pop',       name: 'Chateau Pop',         emoji: '🪩', styleImage: '/styles/chateau-pop.png', styleBg: 'linear-gradient(135deg,#2a1a2e 0%,#1a2a2a 50%,#2a1a1a 100%)', styleAccent: '#e088a0', description: 'Surreal French interior with disco ball, wingback chair, and painterly birds. Bold impasto texture meets editorial elegance.' },
  { id: 'vintage_pop_art_v2', generateStyleId: 'vintage_pop_art', name: 'Vintage Pop Art', emoji: '⚡', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/ae5c7a8d-ebc5-4dc1-b996-43a3629c119c.png', description: 'Bold, graphic, and instantly iconic. High contrast color blocking and vibrant retro palette that turns your pet into gallery-worthy pop-inspired wall art.' },
]

// ─────────────────────────────────────────────────────────────────
//  SONG QUESTIONS — shown on the checkout screen (Hear Them section)
//  All optional except genre. Fed into Suno prompt via creative-brief.
// ─────────────────────────────────────────────────────────────────
export const SONG_QUESTIONS: Array<{
  id: string
  label: string
  type: 'text' | 'textarea'
  placeholder: string
}> = [
  { id: 'favToy',               label: 'Favorite toy',                        type: 'text',     placeholder: 'Squeaky duck, tennis ball, rope knot...' },
  { id: 'favGame',              label: 'Favorite game to play',               type: 'text',     placeholder: 'Fetch, tug-of-war, hide and seek...' },
  { id: 'favOutdoor',           label: 'Favorite place to play or walk',      type: 'text',     placeholder: 'The beach, Piedmont Park, our backyard...' },
  { id: 'favSpot',              label: 'Favorite spot to sit or sleep',       type: 'text',     placeholder: 'The couch, sunny window, foot of the bed...' },
  { id: 'town',                 label: 'Town they live in',                   type: 'text',     placeholder: 'Wilmington, NC...' },
  { id: 'whatMakesThemSpecial', label: 'What makes them special?',            type: 'textarea', placeholder: 'Their quirks, habits, how they make you feel — the little things that make them uniquely them.' },
  { id: 'anythingElse',         label: 'Anything else for their song?',       type: 'textarea', placeholder: 'A memory, a phrase, a feeling — anything you want woven into their song.' },
]

// ─────────────────────────────────────────────────────────────────
//  SONG GENRES — 20 options for the genre picker
// ─────────────────────────────────────────────────────────────────
export const SONG_GENRES = [
  'Pop', 'Country', 'Rock', 'R&B', 'Hip Hop',
  'Jazz', 'Classical', 'Folk', 'Indie', 'Electronic',
  'Reggae', 'Blues', 'Soul', 'Funk', 'Latin',
  'Acoustic', 'Lullaby', 'Punk', 'Americana', 'Gospel',
] as const

export type SongGenre = typeof SONG_GENRES[number]

// ─────────────────────────────────────────────────────────────────
//  HELPER — look up a product by category (Canvas/Prints) + size
// ─────────────────────────────────────────────────────────────────
export function findPrimaryProduct(category: 'Canvas' | 'Prints', size: string) {
  return PRODUCTS.find(p => p.category === category && p.size === size)
}

// ─────────────────────────────────────────────────────────────────
//  LEGACY — kept for backward-compat with any code still importing
// ─────────────────────────────────────────────────────────────────
export const QUESTIONNAIRE: any[] = []

export function buildMemoryPrompt(answers: Record<string, string>, style: typeof ART_STYLES[0]): string {
  const parts: string[] = []
  const name = answers.petName || 'the pet'
  const breed = answers.petBreed || 'animal'
  parts.push(`a ${breed} named ${name}`)
  if (answers.petFeature) parts.push(`with ${answers.petFeature}`)
  parts.push((style as any).prompt?.replace('{subject}', `${breed} named ${name}`) || `a portrait of ${breed} named ${name}`)
  const eggs: string[] = []
  if (answers.favTeam)       eggs.push(`wearing a ${answers.favTeam} collar`)
  if (answers.favCar)        eggs.push(`leaning out the window of a ${answers.favCar}`)
  if (answers.favToy)        eggs.push(`holding a ${answers.favToy}`)
  if (answers.favFood)       eggs.push(`with ${answers.favFood} nearby`)
  if (answers.favRestaurant) eggs.push(`near a ${answers.favRestaurant} sign`)
  if (answers.favOutdoorSpot || answers.favPlace) eggs.push(`set in ${answers.favOutdoorSpot || answers.favPlace}`)
  if (answers.timeAndSeason) eggs.push(answers.timeAndSeason)
  if (answers.mood)          eggs.push(`${answers.mood} color palette`)
  if (eggs.length > 0) parts.push(eggs.join(', '))
  if (answers.perfectDay) parts.push(`Scene: ${answers.perfectDay}`)
  return parts.join(', ')
}


// ─────────────────────────────────────────────────────────────────
//  CART SYSTEM — variant-aware, quantity-aware line items
//  Added 2026-04-18 as foundation for the new catalog + cart refactor.
//  Each CartItem represents a single product variant in the cart.
//  Two of the same variant = quantity: 2 (not two line items).
//  Different variants (e.g. Tee M + Tee L) = two separate line items.
// ─────────────────────────────────────────────────────────────────

export interface CartItem {
  lineId: string              // unique per line (e.g. "tshirt-Black-L-<ts>")
  productId: string           // maps to PRODUCTS[].id
  productName: string         // "Premium Tee", "Canvas Print", etc.
  variantKey: string          // "Black / L" / "16\u00d720" / "iPhone 15 Pro" / "" if N/A
  variantId: number           // Printify variant ID
  blueprintId: number         // Printify blueprint ID
  quantity: number            // 1 or more
  unitPrice: number           // price per unit in dollars
  portraitUrl: string         // which generated portrait to print
  styleName: string           // which art style (e.g. "Bold Impasto")
  category: string            // "Canvas" | "Prints" | "Home" | "Apparel" | "Accessories"
  addedAt: number             // Date.now() when added
}

// Look up a product by its id. Returns undefined if not found.
export function findProductById(id: string) {
  return PRODUCTS.find(p => p.id === id)
}

// Build a stable lineId from its semantic parts. Two identical CartItem variants
// with the same portrait+style produce the same lineId so the cart can merge quantity.
export function buildLineId(productId: string, variantKey: string, portraitUrl: string, styleName: string): string {
  const variantTag = variantKey ? variantKey.replace(/[^a-zA-Z0-9]/g, "_") : "default"
  const portraitTag = (portraitUrl || "").split("/").pop()?.replace(/\.[^.]+$/, "").slice(0, 40) || "np"
  const styleTag = (styleName || "nostyle").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 24)
  return `${productId}__${variantTag}__${styleTag}__${portraitTag}`
}

// Pure utility: compute cart subtotal in dollars.
export function cartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

// Pure utility: total item count across all line items (for nav badge, etc).
export function cartItemCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}


// ─────────────────────────────────────────────────────────────────
//  PRODUCT IMAGE RESOLVER
//  Maps product id to the custom product image in /public.
//  Used by /shop catalog and anywhere else a product thumbnail is needed.
// ─────────────────────────────────────────────────────────────────
export function productImage(productId: string): string {
  if (productId.startsWith('canvas_')) return '/portrait-on-wall.png'
  if (productId.startsWith('print_'))  return '/portrait-lifestyle.png'
  if (productId.startsWith('blanket_')) return '/products/blanket.png'
  const map: Record<string, string> = {
    baby_blanket: '/products/baby-blanket.png',
    beach_towel:  '/products/beach-towel.png',
    mug_20oz:     '/products/mug.png',
    pillow:       '/products/pillow.png',
    tshirt:       '/products/tee.png',
    kids_tee:     '/products/tee.png',
    hoodie:       '/products/hoodie.png',
    kids_hoodie:  '/products/hoodie.png',
    tote:         '/products/tote.png',
    phone_case:   '/products/phone.png',
  }
  return map[productId] || '/products/mug.png'
}
