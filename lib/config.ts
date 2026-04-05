// ─────────────────────────────────────────────────────────────────
//  PET PRINTS STUDIO — Central Configuration
//  Real Printify blueprint, provider & variant IDs verified 2026-04-04
// ─────────────────────────────────────────────────────────────────

export const PRODUCTS = [
  // ── CANVAS PRINTS ─────────────────────────────────────────────
  // Blueprint 1238 "Classic Stretched Canvas" / Provider 48 Colorway / 1.5" gallery wrap
  { id: 'canvas_8x10',   name: 'Canvas Print', size: '8×10"',  category: 'Canvas', price: 79,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93928,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_11x14',  name: 'Canvas Print', size: '11×14"', category: 'Canvas', price: 99,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 155629, popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_12x16',  name: 'Canvas Print', size: '12×16"', category: 'Canvas', price: 109, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93931,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_16x20',  name: 'Canvas Print', size: '16×20"', category: 'Canvas', price: 129, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93936,  popular: true,  emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_18x24',  name: 'Canvas Print', size: '18×24"', category: 'Canvas', price: 149, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93939,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_20x30',  name: 'Canvas Print', size: '20×30"', category: 'Canvas', price: 169, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93942,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", statement piece' },
  { id: 'canvas_24x36',  name: 'Canvas Print', size: '24×36"', category: 'Canvas', price: 199, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93946,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", large format' },

  // ── FINE ART PRINTS ────────────────────────────────────────────
  // Blueprint 804 "Fine Art Posters" / Provider 72 Print Clever / Archival Matte
  { id: 'print_8x10',   name: 'Fine Art Print', size: '8×10"',  category: 'Prints', price: 39,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75288,  popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_11x14',  name: 'Fine Art Print', size: '11×14"', category: 'Prints', price: 49,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100934, popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_12x16',  name: 'Fine Art Print', size: '12×16"', category: 'Prints', price: 55,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75290,  popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_16x20',  name: 'Fine Art Print', size: '16×20"', category: 'Prints', price: 65,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75292,  popular: true,  emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_18x24',  name: 'Fine Art Print', size: '18×24"', category: 'Prints', price: 79,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100938, popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_24x36',  name: 'Fine Art Print', size: '24×36"', category: 'Prints', price: 99,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75296,  popular: false, emoji: '📄', description: 'Archival matte, large format' },

  // ── HOME & GIFTS ───────────────────────────────────────────────
  // Mug 11oz: Blueprint 68 / Provider 1 SPOKE / Variant 33719
  { id: 'mug_11oz',  name: 'Ceramic Mug',   size: '11oz',   category: 'Home', price: 24, printifyBlueprintId: 68,   printifyProviderId: 1,  printifyVariantId: 33719, popular: false, emoji: '☕', description: 'Dishwasher safe' },
  // Mug 15oz: Blueprint 425 / Provider 1 SPOKE / Variant 62014
  { id: 'mug_15oz',  name: 'Ceramic Mug',   size: '15oz',   category: 'Home', price: 28, printifyBlueprintId: 425,  printifyProviderId: 1,  printifyVariantId: 62014, popular: false, emoji: '☕', description: 'Dishwasher safe, large' },
  // Sherpa Blanket: Blueprint 1120 / Provider 92 Pic the Gift / White 50x60
  { id: 'blanket',   name: 'Sherpa Blanket', size: '50×60"', category: 'Home', price: 69, printifyBlueprintId: 1120, printifyProviderId: 92, printifyVariantId: 148535, popular: true,  emoji: '🛋️', description: 'Ultra-soft sherpa fleece, White' },
  // Throw Pillow: Blueprint 1572 / Provider 10 MWW / 25x18
  { id: 'pillow',    name: 'Throw Pillow',   size: '18×18"', category: 'Home', price: 44, printifyBlueprintId: 1572, printifyProviderId: 10, printifyVariantId: 110270, popular: false, emoji: '🛏️', description: 'With insert included' },

  // ── APPAREL ────────────────────────────────────────────────────
  // T-Shirt: Blueprint 145 / Provider 3 Marco Fine Arts / White/Black
  { id: 'tshirt', name: 'Classic T-Shirt', size: 'S–2XL', category: 'Apparel', price: 34, printifyBlueprintId: 145, printifyProviderId: 3, printifyVariantId: 38163, popular: false, emoji: '👕', description: 'Premium cotton unisex tee', sizes: ['S','M','L','XL','2XL'] },
  // Hoodie: Blueprint 458 / Provider 26 Textildruck Europa / Black
  { id: 'hoodie', name: 'Pullover Hoodie', size: 'S–2XL', category: 'Apparel', price: 59, printifyBlueprintId: 458, printifyProviderId: 26, printifyVariantId: 63759, popular: false, emoji: '🧥', description: 'Cozy premium hoodie', sizes: ['S','M','L','XL','2XL'] },

  // ── ACCESSORIES ────────────────────────────────────────────────
  // Tote: Blueprint 553 / Provider 34 The Print Bar / Black
  { id: 'tote',       name: 'Canvas Tote',  size: 'One size',   category: 'Accessories', price: 24, printifyBlueprintId: 553,  printifyProviderId: 34, printifyVariantId: 70603,  popular: false, emoji: '👜', description: 'Heavy-duty cotton canvas' },
  // Phone Case: Blueprint 269 / Provider 1 SPOKE / iPhone 15 Pro (default)
  { id: 'phone_case', name: 'Phone Case',   size: 'All models', category: 'Accessories', price: 29, printifyBlueprintId: 269,  printifyProviderId: 1,  printifyVariantId: 103562, popular: false, emoji: '📱', description: 'Tough case, iPhone & Samsung' },
  // Dad Hat: Blueprint 5383 / Provider 41 Duplium / Black
  { id: 'hat',        name: 'Dad Hat',      size: 'One size',   category: 'Accessories', price: 29, printifyBlueprintId: 5383, printifyProviderId: 41, printifyVariantId: 244947, popular: false, emoji: '🧢', description: 'Classic adjustable cap' },
]

// Phone case variant map — used at checkout to pick correct variant per model
export const PHONE_CASE_VARIANTS: Record<string, number> = {
  'iPhone 11': 62582, 'iPhone 11 Pro': 62583, 'iPhone 11 Pro Max': 62584,
  'iPhone 12': 70871, 'iPhone 12 Mini': 70872, 'iPhone 12 Pro': 70873, 'iPhone 12 Pro Max': 70874,
  'iPhone 13': 76611, 'iPhone 13 Mini': 76612, 'iPhone 13 Pro': 76613, 'iPhone 13 Pro Max': 76614,
  'iPhone 14': 93905, 'iPhone 14 Pro': 93906, 'iPhone 14 Pro Max': 93907, 'iPhone 14 Plus': 93908,
  'iPhone 15': 103561, 'iPhone 15 Pro': 103562, 'iPhone 15 Plus': 103563, 'iPhone 15 Pro Max': 103564,
  'iPhone 16': 112814, 'iPhone 16 Pro': 112812, 'iPhone 16 Pro Max': 112813, 'iPhone 16 Plus': 112815,
  'iPhone 17': 130115, 'iPhone 17 Pro': 130116, 'iPhone 17 Pro Max': 130117, 'iPhone 17 Air': 130118,
  'Samsung Galaxy S21': 105530, 'Samsung Galaxy S22': 105529, 'Samsung Galaxy S23': 105528,
  'Samsung Galaxy S24': 105527, 'Samsung Galaxy S25': 125531,
}

// T-shirt variant map — White and Black per size
export const TSHIRT_VARIANTS: Record<string, Record<string, number>> = {
  'White': { S: 38163, M: 38177, L: 38191, XL: 38205, '2XL': 38219 },
  'Black': { S: 38164, M: 38178, L: 38192, XL: 38206, '2XL': 38220 },
}

// Hoodie variant map — Black per size (most popular)
export const HOODIE_VARIANTS: Record<string, number> = {
  XS: 63754, S: 63759, M: 63764, L: 63769, XL: 63774, '2XL': 63779, '3XL': 63784, '4XL': 63789,
}

// Sherpa blanket variants
export const BLANKET_VARIANTS: Record<string, number> = {
  '30×40" White': 148534, '50×60" White': 148535, '60×80" White': 148536,
  '30×40" Grey':  82967,  '50×60" Grey':  82969,  '60×80" Grey':  82971,
}

export const PRODUCT_CATEGORIES = ['Canvas', 'Prints', 'Home', 'Apparel', 'Accessories']

// ── ART STYLES ────────────────────────────────────────────────────
export const ART_STYLES = [
  { id: 'oil_painting',  name: 'Oil Painting',    emoji: '🎨', description: 'Rich textured brushstrokes, timeless gallery quality',   prompt: 'oil painting portrait of {subject}, rich impasto brushstrokes, warm golden light, museum quality fine art, highly detailed fur texture, dramatic chiaroscuro lighting, old masters painterly style',           negPrompt: 'photograph, digital art, cartoon, anime, watermark, text, blurry, low quality' },
  { id: 'watercolor',    name: 'Watercolor',       emoji: '💧', description: 'Soft dreamy washes, delicate and luminous',               prompt: 'watercolor painting of {subject}, loose fluid brushwork, soft edges, luminous pastel colors, white paper texture, impressionistic style, transparent washes',                                                     negPrompt: 'photograph, oil paint, harsh lines, dark colors, watermark, text, blurry' },
  { id: 'pencil_sketch', name: 'Pencil Sketch',    emoji: '✏️', description: 'Classic graphite, elegant line work',                    prompt: 'detailed pencil sketch of {subject}, fine graphite lines, cross-hatching shading, white background, realistic proportions, expressive eyes, artist sketchbook quality',                                        negPrompt: 'color, photograph, digital art, watermark, text, blurry, low quality' },
  { id: 'pop_art',       name: 'Pop Art',           emoji: '⚡', description: 'Bold Warhol-style, vivid and iconic',                    prompt: 'Andy Warhol pop art style portrait of {subject}, bold flat colors, high contrast, halftone dots, graphic design aesthetic, vivid neon palette, comic book style',                                                 negPrompt: 'realistic, photograph, subtle colors, watermark, text, blurry' },
  { id: 'renaissance',   name: 'Royal Portrait',   emoji: '👑', description: 'Your pet as 16th century royalty',                       prompt: 'renaissance oil portrait of {subject} as royalty, ornate velvet and jewels, gilded background, dramatic chiaroscuro, Old Masters technique, museum quality, regal pose',                                          negPrompt: 'modern, photograph, cartoon, watermark, text, blurry, low quality' },
  { id: 'impressionist', name: 'Impressionist',    emoji: '🌸', description: 'Monet-style dappled light and color',                   prompt: 'impressionist painting of {subject}, Claude Monet style, dappled sunlight, loose visible brushstrokes, soft focus, vibrant blended colors, plein air garden setting',                                              negPrompt: 'photograph, sharp lines, digital, watermark, text, low quality' },
  { id: 'cartoon',       name: 'Illustration',     emoji: '✨', description: 'Cute Pixar-style illustrated portrait',                  prompt: 'cute animated illustration of {subject}, clean line art, flat colors, friendly warm expression, Pixar animation quality, white background, children\'s book style',                                               negPrompt: 'realistic, photograph, dark, scary, watermark, text, blurry' },
  { id: 'vintage_poster',name: 'Vintage Poster',   emoji: '🗺️', description: 'Retro art deco travel poster charm',                    prompt: 'vintage retro travel poster illustration of {subject}, art deco style, limited color palette, bold graphic design, 1930s aesthetic, letterpress texture, geometric shapes',                                        negPrompt: 'modern, photograph, realistic, watermark, text, blurry, low quality' },
]

// ── MEMORY PORTRAIT QUESTIONNAIRE ────────────────────────────────
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
  { id: 'artStyle',       label: 'Preferred art style',                          type: 'style-picker', required: true },
  { id: 'mood',           label: 'Mood and color palette',                       type: 'select',       required: false, options: ['Warm & golden', 'Dramatic & bold', 'Soft & dreamy', 'Vivid & bright', 'Dark & moody', 'Classic & timeless'] },
]

// ── PRICING ───────────────────────────────────────────────────────
export const DIGITAL_BUNDLE_PRICE = 19.99
export const MEMORY_UPGRADE_PRICE = 20.00
export const ALL_IMAGES_PRICE     = 29.99
export const PET_SONG_PRICE       = 19.00

// ── GENERATION ───────────────────────────────────────────────────
export const VARIATIONS_PER_STYLE = 3
export const DEFAULT_STYLES = ['oil_painting', 'watercolor', 'pop_art', 'pencil_sketch']

// ── ASTRIA ────────────────────────────────────────────────────────
export const ASTRIA_API = 'https://api.astria.ai'
export const ASTRIA_BASE_MODEL_ID = 690204

export function buildMemoryPrompt(answers: Record<string, string>, style: typeof ART_STYLES[0]): string {
  const parts: string[] = []
  const name = answers.petName || 'the pet'
  const breed = answers.petBreed || 'animal'
  parts.push(`a ${breed} named ${name}`)
  if (answers.petFeature) parts.push(`with ${answers.petFeature}`)
  parts.push(style.prompt.replace('{subject}', `${breed} named ${name}`))
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
