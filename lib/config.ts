// ─────────────────────────────────────────────────────────────────
//  PET PRINTS STUDIO — Central Configuration
//  All variant IDs verified via Printify API 2026-04-17
// ─────────────────────────────────────────────────────────────────

export const PRODUCTS = [
  // ── CANVAS — Gallery-wrapped on 1.5" stretcher bars, ready to hang ──────
  { id: 'canvas_8x10',   name: 'Canvas Print', size: '8×10"',  category: 'Canvas', price: 79,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93928,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped on 1.5" stretcher bars, ready to hang' },
  { id: 'canvas_11x14',  name: 'Canvas Print', size: '11×14"', category: 'Canvas', price: 99,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 155629, popular: false, emoji: '🖼️', description: 'Gallery-wrapped on 1.5" stretcher bars, ready to hang' },
  { id: 'canvas_12x16',  name: 'Canvas Print', size: '12×16"', category: 'Canvas', price: 109, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93931,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped on 1.5" stretcher bars, ready to hang' },
  { id: 'canvas_16x20',  name: 'Canvas Print', size: '16×20"', category: 'Canvas', price: 129, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93936,  popular: true,  emoji: '🖼️', description: 'Our most popular size — gallery-wrapped, ready to hang' },
  { id: 'canvas_18x24',  name: 'Canvas Print', size: '18×24"', category: 'Canvas', price: 149, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93939,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped on 1.5" stretcher bars, ready to hang' },
  { id: 'canvas_20x30',  name: 'Canvas Print', size: '20×30"', category: 'Canvas', price: 169, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93942,  popular: false, emoji: '🖼️', description: 'Statement piece — gallery-wrapped, ready to hang' },
  { id: 'canvas_24x36',  name: 'Canvas Print', size: '24×36"', category: 'Canvas', price: 199, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93946,  popular: false, emoji: '🖼️', description: 'Large format showpiece — gallery-wrapped, ready to hang' },

  // ── FINE ART PRINTS — Archival matte paper ──────────────────────────────
  { id: 'print_8x10',   name: 'Fine Art Print', size: '8×10"',  category: 'Prints', price: 39,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75288,  popular: false, emoji: '📄', description: 'Archival matte paper, professional grade' },
  { id: 'print_11x14',  name: 'Fine Art Print', size: '11×14"', category: 'Prints', price: 49,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100934, popular: false, emoji: '📄', description: 'Archival matte paper, professional grade' },
  { id: 'print_12x16',  name: 'Fine Art Print', size: '12×16"', category: 'Prints', price: 55,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75290,  popular: false, emoji: '📄', description: 'Archival matte paper, professional grade' },
  { id: 'print_16x20',  name: 'Fine Art Print', size: '16×20"', category: 'Prints', price: 65,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75292,  popular: true,  emoji: '📄', description: 'Our most popular print — archival matte, frame-ready' },
  { id: 'print_18x24',  name: 'Fine Art Print', size: '18×24"', category: 'Prints', price: 79,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100938, popular: false, emoji: '📄', description: 'Archival matte paper, professional grade' },
  { id: 'print_24x36',  name: 'Fine Art Print', size: '24×36"', category: 'Prints', price: 99,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75296,  popular: false, emoji: '📄', description: 'Large format archival print' },

  // ── BLANKETS — Premium soft goods ───────────────────────────────────────
  { id: 'blanket_50x60', name: 'Velveteen Plush Blanket', size: '50×60"', category: 'Home', price: 69, printifyBlueprintId: 522, printifyProviderId: 99, printifyVariantId: 68323, popular: true,  emoji: '🛋️', description: 'Ultra-soft velveteen plush — crispest print, silky to the touch' },
  { id: 'blanket_60x80', name: 'Velveteen Plush Blanket', size: '60×80"', category: 'Home', price: 89, printifyBlueprintId: 522, printifyProviderId: 99, printifyVariantId: 68324, popular: false, emoji: '🛋️', description: 'King-size velveteen plush — their portrait as your coziest blanket' },
  { id: 'baby_blanket',  name: 'Baby Blanket', size: '30×40"', category: 'Home', price: 39, printifyBlueprintId: 585, printifyProviderId: 70, printifyVariantId: 71950, popular: false, emoji: '👶', description: 'Ultra-soft fleece baby blanket — the perfect gift for new families with pets' },
  { id: 'beach_towel',   name: 'Beach Towel',  size: '36×72"', category: 'Home', price: 49, printifyBlueprintId: 352, printifyProviderId: 99, printifyVariantId: 44445, popular: false, emoji: '🏖️', description: 'Oversized beach towel — take their portrait to the beach' },

  // ── HOME — Premium keepsakes ────────────────────────────────────────────
  { id: 'mug_20oz',  name: 'Jumbo Mug',     size: '20oz',    category: 'Home', price: 34, printifyBlueprintId: 1126, printifyProviderId: 59, printifyVariantId: 84117,  popular: true,  emoji: '☕', description: 'Jumbo 20oz ceramic, glossy finish, wrap-around portrait print' },
  { id: 'pillow',    name: 'Throw Pillow',   size: '18×18"',  category: 'Home', price: 44, printifyBlueprintId: 1572, printifyProviderId: 10, printifyVariantId: 110270, popular: false, emoji: '🛏️', description: 'Premium insert included — their portrait on your couch' },

  // ── APPAREL ─────────────────────────────────────────────────────────────
  { id: 'tshirt',  name: 'Premium Tee',     size: 'S–4XL', category: 'Apparel', price: 39, printifyBlueprintId: 12,  printifyProviderId: 99, printifyVariantId: 18101, popular: false, emoji: '👕', description: 'Bella+Canvas 3001 — ultra-soft combed ring-spun cotton, modern fit', sizes: ['S','M','L','XL','2XL','3XL'] },
  { id: 'hoodie',  name: 'Premium Hoodie',  size: 'S–2XL', category: 'Apparel', price: 59, printifyBlueprintId: 458, printifyProviderId: 26, printifyVariantId: 63759, popular: true,  emoji: '🧥', description: 'Heavyweight pullover hoodie — their portrait printed on the front', sizes: ['S','M','L','XL','2XL'] },

  // ── ACCESSORIES ─────────────────────────────────────────────────────────
  { id: 'tote',       name: 'Canvas Tote Bag', size: 'One size',   category: 'Accessories', price: 24, printifyBlueprintId: 553,  printifyProviderId: 34, printifyVariantId: 70603,  popular: false, emoji: '👜', description: 'Heavy-duty cotton canvas — carry their portrait everywhere' },
  { id: 'phone_case', name: 'Phone Case',      size: 'All models', category: 'Accessories', price: 29, printifyBlueprintId: 269,  printifyProviderId: 1,  printifyVariantId: 103562, popular: false, emoji: '📱', description: 'Tough impact-resistant case — iPhone & Samsung, all models' },

  // ── PET ─────────────────────────────────────────────────────────────────
  { id: 'pet_bandana', name: 'Pet Bandana', size: 'S/L',   category: 'Pets', price: 29, printifyBlueprintId: 562,  printifyProviderId: 70, printifyVariantId: 101404, popular: true,  emoji: '🐶', description: 'Custom printed bandana — their portrait around their neck' },
  { id: 'pet_collar',  name: 'Pet Collar',  size: 'S–2XL', category: 'Pets', price: 29, printifyBlueprintId: 1097, printifyProviderId: 83, printifyVariantId: 84657,  popular: false, emoji: '🦺', description: 'Custom printed collar — their portrait on their collar' },
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
}

export const HOODIE_VARIANTS: Record<string, number> = {
  'Black / S': 63759, 'Black / M': 63764, 'Black / L': 63769, 'Black / XL': 63774, 'Black / 2XL': 63779,
}

export const PET_BANDANA_VARIANTS: Record<string, number> = {
  'Small (20×10")': 101403, 'Large (27×13")': 101404,
}

export const PET_COLLAR_VARIANTS: Record<string, number> = {
  'XS': 84655, 'S': 84656, 'M': 84657, 'L': 84658, 'XL': 84659,
}

export const PRODUCT_CATEGORIES = ['Canvas', 'Prints', 'Home', 'Apparel', 'Accessories', 'Pets']

export const DIGITAL_BUNDLE_PRICE = 19.99
export const MEMORY_UPGRADE_PRICE = 20.00
export const ALL_IMAGES_PRICE     = 29.99
export const PET_SONG_PRICE       = 0  // included free with every order

export const VARIATIONS_PER_STYLE = 3
export const DEFAULT_STYLES = ['oil_painting', 'watercolor', 'impasto', 'pop_art', 'renaissance', 'impressionist', 'cartoon', 'vintage_poster', 'vintage_pop_art', 'vintage_poster_v2', 'neon_glow', 'storybook']

export const ASTRIA_API = 'https://api.astria.ai'
export const ASTRIA_BASE_MODEL_ID = 690204


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
  { id: 'fine_art_sketch',  generateStyleId: 'fine_art_sketch',  name: 'Fine Art Sketch',     emoji: '🖊️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/9ed0f1d3-d107-411f-b9de-d42a3f149e10_pet/6a8d45a3-3b8b-4cb9-a4a1-e7a9ae442e25.png', styleBg: 'linear-gradient(135deg,#1a1a14 0%,#2a2a1e 40%,#1e1e18 70%,#141410 100%)', styleAccent: '#c8b89a', description: 'Museum-quality charcoal and graphite portrait on textured paper. Elegant linework, soft crosshatching, and deeply emotional presence.' },
  { id: 'chateau_pop',     generateStyleId: 'chateau_pop',       name: 'Chateau Pop',         emoji: '🪩', styleImage: '/styles/chateau-pop.png', styleBg: 'linear-gradient(135deg,#2a1a2e 0%,#1a2a2a 50%,#2a1a1a 100%)', styleAccent: '#e088a0', description: 'Surreal French interior with disco ball, wingback chair, and painterly birds. Bold impasto texture meets editorial elegance.' },
]

export const QUESTIONNAIRE = [
  { id: 'petName',        label: "What is your pet's name?",                    type: 'text',         required: true,  placeholder: 'e.g. Rocky, Luna, Biscuit...' },
  { id: 'petBreed',       label: 'Breed or type',                               type: 'text',         required: true,  placeholder: 'e.g. Golden Retriever, tabby cat...' },
  { id: 'petPersonality', label: 'Describe their personality in 3 words',       type: 'text',         required: true,  placeholder: 'e.g. goofy, loyal, dramatic...' },
  { id: 'petFeature',     label: "Their most distinctive physical feature",      type: 'text',         required: true,  placeholder: 'e.g. one floppy ear, white chest patch, giant paws...' },
  { id: 'favPlace',       label: 'Favorite city or place with the most memories',type: 'text',         required: false, placeholder: 'e.g. Boulder CO, the Jersey Shore, our backyard...' },
  { id: 'favOutdoorSpot', label: 'Favorite outdoor spot',                        type: 'text',         required: false, placeholder: 'e.g. Piedmont Park, the beach, mountain trail...' },
  { id: 'timeAndSeason',  label: 'Time of day and season',                       type: 'select',       required: false, options: ['Golden hour, summer', 'Golden hour, fall', 'Sunny afternoon, spring', 'Snowy winter morning', 'Overcast moody day', 'Sunset on the beach', 'Night, city lights'] },
  { id: 'favTeam',        label: 'Favorite sports team',                         type: 'text',         required: false, placeholder: 'e.g. Denver Broncos, Cubs, Lakers...' },
  { id: 'favCar',         label: 'Favorite car to ride in (make, model, color)', type: 'text',         required: false, placeholder: 'e.g. red 1967 Ford Mustang convertible...' },
  { id: 'favFood',        label: 'Favorite human food they beg for',             type: 'text',         required: false, placeholder: 'e.g. pizza, hot dogs, bacon...' },
  { id: 'favToy',         label: 'Favorite toy or object',                       type: 'text',         required: false, placeholder: 'e.g. yellow tennis ball, stuffed duck, old sock...' },
  { id: 'favRestaurant',  label: 'Favorite restaurant or local spot',            type: 'text',         required: false, placeholder: 'e.g. In-N-Out, our local dog park café...' },
  { id: 'perfectDay',     label: 'If your pet could live one perfect day, describe it in 1–2 sentences', type: 'textarea', required: false, placeholder: 'This is the soul of the portrait — the more detail the better...' },
  { id: 'musicStyle',     label: '🎵 What music style fits their vibe?',          type: 'select',       required: false, options: ['Country / Americana', 'Emotional pop', 'Indie folk / acoustic', 'Hip hop', 'Jazz / blues', 'Rock / alternative', 'R&B / soul', 'Classical / orchestral'] },
  { id: 'specialPeople',  label: '👥 People who matter most to them',              type: 'text',         required: false, placeholder: 'e.g. John (dad), Sarah (best friend)...' },
    { id: 'artStyle',       label: 'Preferred art style',                          type: 'style-picker', required: true },
  { id: 'mood',           label: 'Mood and color palette',                       type: 'select',       required: false, options: ['Warm & golden', 'Dramatic & bold', 'Soft & dreamy', 'Vivid & bright', 'Dark & moody', 'Classic & timeless'] },
  { id: 'vintage_pop_art_v2', name: 'Vintage Pop Art', emoji: '⚡',
    styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/ae5c7a8d-ebc5-4dc1-b996-43a3629c119c.png',
    description: 'Bold, graphic, and instantly iconic. High contrast color blocking and vibrant retro palette that turns your pet into gallery-worthy pop-inspired wall art.' },

]




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

