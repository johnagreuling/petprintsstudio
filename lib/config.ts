// ─────────────────────────────────────────────────────────────────
//  PET PRINTS STUDIO — Central Configuration
// ─────────────────────────────────────────────────────────────────

// ── PRODUCTS ─────────────────────────────────────────────────────
export const PRODUCTS = [
  // Canvas
  { id: 'canvas_8x10',  name: 'Canvas Print',  size: '8×10"',  category: 'Canvas',  price: 79,  printifyBlueprintId: 1017, printifyVariantId: 67901, popular: false, emoji: '🖼️', description: 'Gallery-wrapped, ready to hang' },
  { id: 'canvas_11x14', name: 'Canvas Print',  size: '11×14"', category: 'Canvas',  price: 99,  printifyBlueprintId: 1017, printifyVariantId: 67902, popular: false, emoji: '🖼️', description: 'Gallery-wrapped, ready to hang' },
  { id: 'canvas_16x20', name: 'Canvas Print',  size: '16×20"', category: 'Canvas',  price: 129, printifyBlueprintId: 1017, printifyVariantId: 67903, popular: true,  emoji: '🖼️', description: 'Gallery-wrapped, ready to hang' },
  { id: 'canvas_18x24', name: 'Canvas Print',  size: '18×24"', category: 'Canvas',  price: 149, printifyBlueprintId: 1017, printifyVariantId: 67904, popular: false, emoji: '🖼️', description: 'Gallery-wrapped, ready to hang' },
  { id: 'canvas_24x36', name: 'Canvas Print',  size: '24×36"', category: 'Canvas',  price: 200, printifyBlueprintId: 1017, printifyVariantId: 67905, popular: false, emoji: '🖼️', description: 'Statement piece — large format' },
  // Fine Art Prints
  { id: 'print_8x10',   name: 'Fine Art Print', size: '8×10"',  category: 'Prints',  price: 39,  printifyBlueprintId: 446,  printifyVariantId: 23451, popular: false, emoji: '📄', description: 'Archival matte paper' },
  { id: 'print_11x14',  name: 'Fine Art Print', size: '11×14"', category: 'Prints',  price: 49,  printifyBlueprintId: 446,  printifyVariantId: 23452, popular: false, emoji: '📄', description: 'Archival matte paper' },
  { id: 'print_16x20',  name: 'Fine Art Print', size: '16×20"', category: 'Prints',  price: 65,  printifyBlueprintId: 446,  printifyVariantId: 23453, popular: false, emoji: '📄', description: 'Archival matte paper' },
  // Home
  { id: 'mug_11oz',     name: 'Ceramic Mug',    size: '11oz',   category: 'Home',    price: 24,  printifyBlueprintId: 19,   printifyVariantId: 1320,  popular: false, emoji: '☕', description: 'Dishwasher safe' },
  { id: 'mug_15oz',     name: 'Ceramic Mug',    size: '15oz',   category: 'Home',    price: 28,  printifyBlueprintId: 19,   printifyVariantId: 1321,  popular: false, emoji: '☕', description: 'Dishwasher safe, large' },
  { id: 'blanket',      name: 'Sherpa Blanket',  size: '50×60"', category: 'Home',    price: 69,  printifyBlueprintId: 469,  printifyVariantId: 34567, popular: true,  emoji: '🛋️', description: 'Ultra-soft fleece & sherpa' },
  { id: 'pillow',       name: 'Throw Pillow',    size: '18×18"', category: 'Home',    price: 44,  printifyBlueprintId: 28,   printifyVariantId: 1893,  popular: false, emoji: '🛏️', description: 'With insert included' },
  // Apparel
  { id: 'tshirt',       name: 'Classic T-Shirt', size: 'S–2XL',  category: 'Apparel', price: 34,  printifyBlueprintId: 12,   printifyVariantId: 17887, popular: false, emoji: '👕', description: 'Premium cotton unisex tee', sizes: ['S','M','L','XL','2XL'] },
  { id: 'hoodie',       name: 'Pullover Hoodie',  size: 'S–2XL',  category: 'Apparel', price: 59,  printifyBlueprintId: 92,   printifyVariantId: 18877, popular: false, emoji: '🧥', description: 'Cozy premium hoodie',     sizes: ['S','M','L','XL','2XL'] },
  // Accessories
  { id: 'tote',         name: 'Canvas Tote',      size: '13×14"', category: 'Accessories', price: 24, printifyBlueprintId: 527, printifyVariantId: 44321, popular: false, emoji: '👜', description: 'Heavy-duty canvas' },
  { id: 'phone_case',   name: 'Phone Case',        size: 'All models', category: 'Accessories', price: 29, printifyBlueprintId: 351, printifyVariantId: 28800, popular: false, emoji: '📱', description: 'Tough case, all iPhone & Samsung' },
  { id: 'hat',          name: 'Dad Hat',           size: 'One size', category: 'Accessories', price: 29, printifyBlueprintId: 513, printifyVariantId: 55210, popular: false, emoji: '🧢', description: 'Classic adjustable cap' },
]

export const PRODUCT_CATEGORIES = ['Canvas', 'Prints', 'Home', 'Apparel', 'Accessories']

// ── ART STYLES ────────────────────────────────────────────────────
export const ART_STYLES = [
  {
    id: 'oil_painting',
    name: 'Oil Painting',
    emoji: '🎨',
    description: 'Rich textured brushstrokes, timeless gallery quality',
    prompt: 'oil painting portrait of {subject}, rich impasto brushstrokes, warm golden light, museum quality fine art, highly detailed fur texture, dramatic chiaroscuro lighting, old masters painterly style',
    negPrompt: 'photograph, digital art, cartoon, anime, watermark, text, blurry, low quality',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    emoji: '💧',
    description: 'Soft dreamy washes, delicate and luminous',
    prompt: 'watercolor painting of {subject}, loose fluid brushwork, soft edges, luminous pastel colors, white paper texture, impressionistic style, transparent washes',
    negPrompt: 'photograph, oil paint, harsh lines, dark colors, watermark, text, blurry',
  },
  {
    id: 'pencil_sketch',
    name: 'Pencil Sketch',
    emoji: '✏️',
    description: 'Classic graphite, elegant line work',
    prompt: 'detailed pencil sketch of {subject}, fine graphite lines, cross-hatching shading, white background, realistic proportions, expressive eyes, artist sketchbook quality',
    negPrompt: 'color, photograph, digital art, watermark, text, blurry, low quality',
  },
  {
    id: 'pop_art',
    name: 'Pop Art',
    emoji: '⚡',
    description: 'Bold Warhol-style, vivid and iconic',
    prompt: 'Andy Warhol pop art style portrait of {subject}, bold flat colors, high contrast, halftone dots, graphic design aesthetic, vivid neon palette, comic book style',
    negPrompt: 'realistic, photograph, subtle colors, watermark, text, blurry',
  },
  {
    id: 'renaissance',
    name: 'Royal Portrait',
    emoji: '👑',
    description: 'Your pet as 16th century royalty',
    prompt: 'renaissance oil portrait of {subject} as royalty, ornate velvet and jewels, gilded background, dramatic chiaroscuro, Old Masters technique, museum quality, regal pose',
    negPrompt: 'modern, photograph, cartoon, watermark, text, blurry, low quality',
  },
  {
    id: 'impressionist',
    name: 'Impressionist',
    emoji: '🌸',
    description: 'Monet-style dappled light and color',
    prompt: 'impressionist painting of {subject}, Claude Monet style, dappled sunlight, loose visible brushstrokes, soft focus, vibrant blended colors, plein air garden setting',
    negPrompt: 'photograph, sharp lines, digital, watermark, text, low quality',
  },
  {
    id: 'cartoon',
    name: 'Illustration',
    emoji: '✨',
    description: 'Cute Pixar-style illustrated portrait',
    prompt: 'cute animated illustration of {subject}, clean line art, flat colors, friendly warm expression, Pixar animation quality, white background, children\'s book style',
    negPrompt: 'realistic, photograph, dark, scary, watermark, text, blurry',
  },
  {
    id: 'vintage_poster',
    name: 'Vintage Poster',
    emoji: '🗺️',
    description: 'Retro art deco travel poster charm',
    prompt: 'vintage retro travel poster illustration of {subject}, art deco style, limited color palette, bold graphic design, 1930s aesthetic, letterpress texture, geometric shapes',
    negPrompt: 'modern, photograph, realistic, watermark, text, blurry, low quality',
  },
]

// ── MEMORY PORTRAIT QUESTIONNAIRE ────────────────────────────────
export const QUESTIONNAIRE = [
  // Required — core identity
  { id: 'petName',        label: "What is your pet's name?",                    type: 'text',     required: true,  placeholder: 'e.g. Rocky, Luna, Biscuit...',  promptKey: 'name the pet {value}' },
  { id: 'petBreed',       label: 'Breed or type',                               type: 'text',     required: true,  placeholder: 'e.g. Golden Retriever, tabby cat...', promptKey: 'a {value}' },
  { id: 'petPersonality', label: 'Describe their personality in 3 words',       type: 'text',     required: true,  placeholder: 'e.g. goofy, loyal, dramatic...',  promptKey: 'personality: {value}' },
  { id: 'petFeature',     label: "Their most distinctive physical feature",      type: 'text',     required: true,  placeholder: 'e.g. one floppy ear, white chest patch, giant paws...', promptKey: 'distinctive feature: {value}' },

  // Scene & setting
  { id: 'favPlace',       label: 'Favorite city or place with the most memories', type: 'text',   required: false, placeholder: 'e.g. Boulder CO, the Jersey Shore, our backyard...', promptKey: 'set in {value}' },
  { id: 'favOutdoorSpot', label: 'Favorite outdoor spot',                        type: 'text',    required: false, placeholder: 'e.g. Piedmont Park, the beach, mountain trail...', promptKey: 'location: {value}' },
  { id: 'timeAndSeason',  label: 'Time of day and season',                       type: 'select',  required: false, options: ['Golden hour, summer', 'Golden hour, fall', 'Sunny afternoon, spring', 'Snowy winter morning', 'Overcast moody day', 'Sunset on the beach', 'Night, city lights'], promptKey: 'lighting and atmosphere: {value}' },

  // Easter eggs — personal details
  { id: 'favTeam',        label: 'Favorite sports team',                         type: 'text',    required: false, placeholder: 'e.g. Denver Broncos, Cubs, Lakers...', promptKey: 'wearing a {value} collar/bandana' },
  { id: 'favCar',         label: 'Favorite car to ride in (make, model, color)', type: 'text',    required: false, placeholder: 'e.g. red 1967 Ford Mustang convertible...', promptKey: 'leaning out the window of a {value}' },
  { id: 'favFood',        label: 'Favorite human food they beg for',             type: 'text',    required: false, placeholder: 'e.g. pizza, hot dogs, bacon...', promptKey: 'with {value} nearby' },
  { id: 'favToy',         label: 'Favorite toy or object',                       type: 'text',    required: false, placeholder: 'e.g. yellow tennis ball, stuffed duck, old sock...', promptKey: 'holding or near their favorite {value}' },
  { id: 'favRestaurant',  label: 'Favorite restaurant or local spot',            type: 'text',    required: false, placeholder: 'e.g. In-N-Out, our local dog park café...', promptKey: 'with {value} signage visible' },

  // The magic question
  { id: 'perfectDay',     label: 'If your pet could live one perfect day, describe it in 1–2 sentences', type: 'textarea', required: false, placeholder: 'This is the soul of the portrait — the more detail the better...', promptKey: 'scene inspired by: {value}' },

  // Style
  { id: 'artStyle',       label: 'Preferred art style',                          type: 'style-picker', required: true },
  { id: 'mood',           label: 'Mood and color palette',                       type: 'select',  required: false, options: ['Warm & golden', 'Dramatic & bold', 'Soft & dreamy', 'Vivid & bright', 'Dark & moody', 'Classic & timeless'], promptKey: 'color mood: {value}' },
]

// ── PRICING ───────────────────────────────────────────────────────
export const DIGITAL_BUNDLE_PRICE = 19.99
export const MEMORY_UPGRADE_PRICE = 20.00

// ── GENERATION ───────────────────────────────────────────────────
export const VARIATIONS_PER_STYLE = 3 // 3 variations × 4 styles selected = 12 images
export const DEFAULT_STYLES = ['oil_painting', 'watercolor', 'pop_art', 'pencil_sketch']

// ── REPLICATE MODEL ──────────────────────────────────────────────
// SDXL img2img for Style Transfer
export const REPLICATE_MODEL = 'stability-ai/sdxl:39ed52f2550b2d489783de013f8c4ce95ff7c0d4f6c4b64e2e50a3cc1ede15b1'

// ── ASTRIA (Memory Portraits) ────────────────────────────────────
export const ASTRIA_API = 'https://api.astria.ai'
export const ASTRIA_BASE_MODEL_ID = 690204 // SDXL base model on Astria

// Build the final prompt from questionnaire answers
export function buildMemoryPrompt(answers: Record<string, string>, style: typeof ART_STYLES[0]): string {
  const parts: string[] = []

  // Core subject
  const name = answers.petName || 'the pet'
  const breed = answers.petBreed || 'animal'
  parts.push(`a ${breed} named ${name}`)

  // Physical
  if (answers.petFeature) parts.push(`with ${answers.petFeature}`)

  // Style
  parts.push(style.prompt.replace('{subject}', `${breed} named ${name}`))

  // Easter eggs — each answer adds a detail
  const easterEggs: string[] = []
  if (answers.favTeam)       easterEggs.push(`wearing a ${answers.favTeam} collar`)
  if (answers.favCar)        easterEggs.push(`leaning out the window of a ${answers.favCar}`)
  if (answers.favToy)        easterEggs.push(`holding a ${answers.favToy}`)
  if (answers.favFood)       easterEggs.push(`with ${answers.favFood} nearby`)
  if (answers.favRestaurant) easterEggs.push(`near a ${answers.favRestaurant} sign`)
  if (answers.favOutdoorSpot || answers.favPlace) {
    easterEggs.push(`set in ${answers.favOutdoorSpot || answers.favPlace}`)
  }
  if (answers.timeAndSeason) easterEggs.push(answers.timeAndSeason)
  if (answers.mood)          easterEggs.push(`${answers.mood} color palette`)

  if (easterEggs.length > 0) parts.push(easterEggs.join(', '))

  // The magic question — master override
  if (answers.perfectDay) parts.push(`Scene: ${answers.perfectDay}`)

  return parts.join(', ')
}
