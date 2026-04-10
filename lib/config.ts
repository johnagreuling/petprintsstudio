// ─────────────────────────────────────────────────────────────────
//  PET PRINTS STUDIO — Central Configuration
//  Real Printify blueprint, provider & variant IDs verified 2026-04-04
// ─────────────────────────────────────────────────────────────────

export const PRODUCTS = [
  { id: 'canvas_8x10',   name: 'Canvas Print', size: '8×10"',  category: 'Canvas', price: 79,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93928,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_11x14',  name: 'Canvas Print', size: '11×14"', category: 'Canvas', price: 99,  printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 155629, popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_12x16',  name: 'Canvas Print', size: '12×16"', category: 'Canvas', price: 109, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93931,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_16x20',  name: 'Canvas Print', size: '16×20"', category: 'Canvas', price: 129, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93936,  popular: true,  emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_18x24',  name: 'Canvas Print', size: '18×24"', category: 'Canvas', price: 149, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93939,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", ready to hang' },
  { id: 'canvas_20x30',  name: 'Canvas Print', size: '20×30"', category: 'Canvas', price: 169, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93942,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", statement piece' },
  { id: 'canvas_24x36',  name: 'Canvas Print', size: '24×36"', category: 'Canvas', price: 199, printifyBlueprintId: 1238, printifyProviderId: 48, printifyVariantId: 93946,  popular: false, emoji: '🖼️', description: 'Gallery-wrapped 1.5", large format' },
  { id: 'print_8x10',   name: 'Fine Art Print', size: '8×10"',  category: 'Prints', price: 39,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75288,  popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_11x14',  name: 'Fine Art Print', size: '11×14"', category: 'Prints', price: 49,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100934, popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_12x16',  name: 'Fine Art Print', size: '12×16"', category: 'Prints', price: 55,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75290,  popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_16x20',  name: 'Fine Art Print', size: '16×20"', category: 'Prints', price: 65,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75292,  popular: true,  emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_18x24',  name: 'Fine Art Print', size: '18×24"', category: 'Prints', price: 79,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 100938, popular: false, emoji: '📄', description: 'Archival matte, museum quality' },
  { id: 'print_24x36',  name: 'Fine Art Print', size: '24×36"', category: 'Prints', price: 99,  printifyBlueprintId: 804, printifyProviderId: 72, printifyVariantId: 75296,  popular: false, emoji: '📄', description: 'Archival matte, large format' },
  { id: 'mug_11oz',  name: 'Ceramic Mug',   size: '11oz',   category: 'Home', price: 24, printifyBlueprintId: 68,   printifyProviderId: 1,  printifyVariantId: 33719, popular: false, emoji: '☕', description: 'Dishwasher safe' },
  { id: 'mug_15oz',  name: 'Ceramic Mug',   size: '15oz',   category: 'Home', price: 28, printifyBlueprintId: 425,  printifyProviderId: 1,  printifyVariantId: 62014, popular: false, emoji: '☕', description: 'Dishwasher safe, large' },
  { id: 'blanket',   name: 'Sherpa Blanket', size: '50×60"', category: 'Home', price: 69, printifyBlueprintId: 1120, printifyProviderId: 92, printifyVariantId: 148535, popular: true,  emoji: '🛋️', description: 'Ultra-soft sherpa fleece, White' },
  { id: 'pillow',    name: 'Throw Pillow',   size: '18×18"', category: 'Home', price: 44, printifyBlueprintId: 1572, printifyProviderId: 10, printifyVariantId: 110270, popular: false, emoji: '🛏️', description: 'With insert included' },
  { id: 'tshirt', name: 'Classic T-Shirt', size: 'S–2XL', category: 'Apparel', price: 34, printifyBlueprintId: 145, printifyProviderId: 3, printifyVariantId: 38163, popular: false, emoji: '👕', description: 'Premium cotton unisex tee', sizes: ['S','M','L','XL','2XL'] },
  { id: 'hoodie', name: 'Pullover Hoodie', size: 'S–2XL', category: 'Apparel', price: 59, printifyBlueprintId: 458, printifyProviderId: 26, printifyVariantId: 63759, popular: false, emoji: '🧥', description: 'Cozy premium hoodie', sizes: ['S','M','L','XL','2XL'] },
  { id: 'tote',       name: 'Canvas Tote',  size: 'One size',   category: 'Accessories', price: 24, printifyBlueprintId: 553,  printifyProviderId: 34, printifyVariantId: 70603,  popular: false, emoji: '👜', description: 'Heavy-duty cotton canvas' },
  { id: 'phone_case', name: 'Phone Case',   size: 'All models', category: 'Accessories', price: 29, printifyBlueprintId: 269,  printifyProviderId: 1,  printifyVariantId: 103562, popular: false, emoji: '📱', description: 'Tough case, iPhone & Samsung' },
  { id: 'hat',        name: 'Dad Hat',      size: 'One size',   category: 'Accessories', price: 29, printifyBlueprintId: 5383, printifyProviderId: 41, printifyVariantId: 244947, popular: false, emoji: '🧢', description: 'Classic adjustable cap' },

  // ── PET WEARABLES ─────────────────────────────────────────────────────────
  { id: 'pet_bandana',      name: 'Pet Bandana',        size: 'S/M/L',      category: 'Pets',     price: 29, printifyBlueprintId: 562,  printifyProviderId: 99, printifyVariantId: 0, popular: true,  emoji: '🐶', description: 'Their portrait around their neck' },
  { id: 'pet_bandana_col',  name: 'Pet Bandana Collar', size: 'S/M/L/XL',   category: 'Pets',     price: 34, printifyBlueprintId: 563,  printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '🐕', description: 'Portrait bandana with adjustable collar' },
  { id: 'pet_tank',         name: 'Pet Tank Top',       size: 'M/L/XL',     category: 'Pets',     price: 39, printifyBlueprintId: 399,  printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '👕', description: 'Wearable portrait for your dog' },

  // ── PET HOME ──────────────────────────────────────────────────────────────
  { id: 'pet_bed_sm',       name: 'Pet Bed',            size: 'Small',      category: 'Pets',     price: 59, printifyBlueprintId: 1104, printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '🛏️', description: 'Their portrait, their space' },
  { id: 'pet_bed_lg',       name: 'Pet Bed',            size: 'Large',      category: 'Pets',     price: 79, printifyBlueprintId: 1104, printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '🛏️', description: 'Their portrait, their space' },
  { id: 'pet_bowl',         name: 'Pet Bowl',           size: '12oz',       category: 'Pets',     price: 34, printifyBlueprintId: 1149, printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '🥣', description: 'Their portrait at every meal' },
  { id: 'pet_tag',          name: 'Pet ID Tag',         size: 'One size',   category: 'Pets',     price: 19, printifyBlueprintId: 561,  printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '🏷', description: 'Their portrait on their collar' },
  { id: 'pet_collar',       name: 'Dog Collar',         size: 'S/M/L/XL',   category: 'Pets',     price: 29, printifyBlueprintId: 1097, printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '🦺', description: 'Custom printed collar' },
  { id: 'pet_mat',          name: 'Pet Feeding Mat',    size: '12"x18"',    category: 'Pets',     price: 24, printifyBlueprintId: 1091, printifyProviderId: 99, printifyVariantId: 0, popular: false, emoji: '🍽', description: 'Portrait at the dinner table' },

  // ── MATCHING FAMILY ───────────────────────────────────────────────────────
  { id: 'match_hoodie',     name: 'Matching Hoodie',    size: 'XS-3XL',     category: 'Matching', price: 55, printifyBlueprintId: 421,  printifyProviderId: 29, printifyVariantId: 0, popular: true,  emoji: '🫲', description: 'Same portrait. You and your pet.' },
  { id: 'match_tee',        name: 'Matching Tee',       size: 'XS-3XL',     category: 'Matching', price: 35, printifyBlueprintId: 12,   printifyProviderId: 29, printifyVariantId: 0, popular: false, emoji: '👪', description: 'The whole family. Same portrait.' },
  { id: 'match_sweatshirt', name: 'Matching Crewneck',  size: 'XS-3XL',     category: 'Matching', price: 45, printifyBlueprintId: 429,  printifyProviderId: 29, printifyVariantId: 0, popular: false, emoji: '🧥', description: 'Cozy portrait crewneck for you' },
  { id: 'match_tote',       name: 'Portrait Tote Bag',  size: '15"x15"',    category: 'Matching', price: 25, printifyBlueprintId: 208,  printifyProviderId: 26, printifyVariantId: 0, popular: false, emoji: '👜', description: 'Carry them everywhere you go' },
  { id: 'match_pillow',     name: 'Portrait Pillow',    size: '18"x18"',    category: 'Matching', price: 35, printifyBlueprintId: 2,    printifyProviderId: 26, printifyVariantId: 0, popular: false, emoji: '🛋', description: 'Their face on your couch' },
]

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

export const TSHIRT_VARIANTS: Record<string, Record<string, number>> = {
  'White': { S: 38163, M: 38177, L: 38191, XL: 38205, '2XL': 38219 },
  'Black': { S: 38164, M: 38178, L: 38192, XL: 38206, '2XL': 38220 },
}

export const HOODIE_VARIANTS: Record<string, number> = {
  XS: 63754, S: 63759, M: 63764, L: 63769, XL: 63774, '2XL': 63779, '3XL': 63784, '4XL': 63789,
}

export const BLANKET_VARIANTS: Record<string, number> = {
  '30×40" White': 148534, '50×60" White': 148535, '60×80" White': 148536,
  '30×40" Grey':  82967,  '50×60" Grey':  82969,  '60×80" Grey':  82971,
}

export const PRODUCT_CATEGORIES = ['Canvas', 'Prints', 'Home', 'Apparel', 'Accessories']

const R2 = 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/generated'

export const ART_STYLES = [
  { id: 'oil_painting',    generateStyleId: 'ethereal',          name: 'Ethereal Painterly',  emoji: '🎨', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/69508879-38da-4363-8550-bfa2b0de317a.png', description: 'Soft, dreamlike brushwork with luminous depth. Your pet rendered in a timeless painterly style worthy of any gallery wall.' },
  { id: 'watercolor',      generateStyleId: 'watercolor',        name: 'Watercolor',          emoji: '💧', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/747e86a6-8d1e-45d8-8dca-d1641acb5ebf.png',     description: 'Delicate washes and soft edges. A luminous, flowing watercolor portrait with the feel of fine art on paper.' },
  { id: 'pencil_sketch',   generateStyleId: 'charcoal',          name: 'Pencil Sketch',       emoji: '✏️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/aea7fffe-7789-47e6-a0f1-518730db8bcf.png',     description: 'Elegant graphite with expressive line work. Classic, refined, and timeless.' },
  { id: 'pop_art',         generateStyleId: 'bold_contemporary', name: 'Contemporary Bold',   emoji: '⚡', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/6055c157-7d4a-4db0-972c-2f84ca7f11b7.png', description: 'Bold, jewel-toned, and vividly alive. Contemporary graphic energy with a gallery-quality finish.' },
  { id: 'renaissance',     generateStyleId: 'classical_oil',     name: 'Oil Painting',        emoji: '👑', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/36d3f3aa-89ba-4fca-b8a2-21807fb4842d.png',     description: 'Rich classical oil portrait. Dramatic light, deep color, and Old Masters gravitas.' },
  { id: 'impressionist',   generateStyleId: 'impressionist',     name: 'Impressionist',       emoji: '🌸', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/65e20ba9-6f9b-4cb8-aedd-56755ac1edec.png',     description: 'Monet-style dappled light and visible brushwork. Color and emotion over precision.' },
  { id: 'pastel',          generateStyleId: 'pastel',            name: 'Soft Pastel',         emoji: '🕊️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/654a22cd-66bf-4733-87ec-bf07e43acc2f.png',     description: 'Dreamy pastel chalk on toned paper. Delicate, warm, and deeply tender.' },
  { id: 'vintage_poster',  generateStyleId: 'vintage_poster',    name: 'Vintage Poster',      emoji: '🗺️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/7e147ede-e23a-4116-8bbf-470d5cb3686f.png',     description: 'Mid-century travel poster energy. Bold graphic composition, flat shapes, nostalgic retro palette.' },
  { id: 'vintage_pop_art', generateStyleId: 'vintage_pop_art',   name: 'Gallery Pop',     emoji: '🎭', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/a5fcc975-46e3-477a-8de2-60ece3f6b0db.png',     description: 'Warhol 4-panel screenprint. Same portrait, four bold saturated palettes. Iconic and collectible.' },
  { id: 'vintage_poster_v2', generateStyleId: 'vintage_poster_v2', name: 'Heritage Poster',  emoji: '🏛️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/d5290324-2755-4600-b056-5c80ef76eb7b.png',     description: 'Premium retro collectible with badge and sunburst elements. Frame-worthy vintage wall art.' },
  { id: 'neon_glow',       generateStyleId: 'neon_glow',         name: 'Neon Glow',           emoji: '🌟', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/703cc385-770a-4066-80cf-29b07359c245.png',     styleBg: 'linear-gradient(135deg,#050510 0%,#150530 50%,#0a1540 100%)', styleAccent: '#a855f7', description: 'Electric, cinematic, high-contrast. Glowing neon outlines on a deep dark background.' },
  { id: 'storybook',       generateStyleId: 'storybook',         name: 'Storybook Nostalgia', emoji: '📖', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/14213989-5ed0-4d83-95ad-665855f994d4_pet/db78566f-8c8e-46f5-8c6d-1267f07029b4.png',     styleBg: 'linear-gradient(135deg,#1a0f05 0%,#3a1f08 50%,#4a2d10 100%)', styleAccent: '#d4a855', description: 'Warm, cozy, memory-filled. A painterly scene that feels like a cherished illustrated storybook.' },
  { id: 'retro_pop',       generateStyleId: 'retro_pop',         name: 'Retro Pop',           emoji: '🟥', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/bb0b4cd0-815f-4f41-b45a-78b8c845edc4_pet/f247f626-fef9-4632-bdd2-31aba2eb6261.png',     description: 'Bold four-panel Warhol-style pop art grid. Same portrait, four striking palettes. Iconic, collectible, gallery-worthy.' },
  { id: 'fairytale',       generateStyleId: 'fairytale',         name: 'Fairytale',           emoji: '✨', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/bb0b4cd0-815f-4f41-b45a-78b8c845edc4_pet/855e3b0d-5d65-4348-81cc-f273a18d3c82.png', styleBg: 'linear-gradient(135deg,#1a0a2e 0%,#2d1b4e 40%,#1a2a1a 70%,#0d1a0d 100%)', styleAccent: '#f0c060', description: 'Soft magical storybook portrait with warm golden light, soulful eyes, floating sparkles, and a cozy whimsical scene.' },
  { id: 'comic_animation', generateStyleId: 'comic_animation',   name: 'Premium Comic',       emoji: '💥', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/bb0b4cd0-815f-4f41-b45a-78b8c845edc4_pet/329c33ec-798d-4935-9d89-4520fb0fb571.png', styleBg: 'linear-gradient(135deg,#1a0505 0%,#2d0a0a 40%,#1a1a2e 70%,#0a0a1a 100%)', styleAccent: '#ff4444', description: 'Bold comic book portrait with clean inked linework, cel shading, cinematic lighting, and vivid animated character energy.' },
  { id: 'fine_art_sketch',  generateStyleId: 'fine_art_sketch',  name: 'Fine Art Sketch',     emoji: '🖊️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/bb0b4cd0-815f-4f41-b45a-78b8c845edc4_pet/c6ba976c-9eeb-409a-b7cc-b9f1b8cbbed2.png', styleBg: 'linear-gradient(135deg,#1a1a14 0%,#2a2a1e 40%,#1e1e18 70%,#141410 100%)', styleAccent: '#c8b89a', description: 'Museum-quality charcoal and graphite portrait on textured paper. Elegant linework, soft crosshatching, and deeply emotional presence.' },
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

export const DIGITAL_BUNDLE_PRICE = 19.99
export const MEMORY_UPGRADE_PRICE = 20.00
export const ALL_IMAGES_PRICE     = 29.99
export const PET_SONG_PRICE       = 19.00

export const VARIATIONS_PER_STYLE = 3
export const DEFAULT_STYLES = ['oil_painting', 'watercolor', 'pencil_sketch', 'pop_art', 'renaissance', 'impressionist', 'cartoon', 'vintage_poster', 'vintage_pop_art', 'vintage_poster_v2', 'neon_glow', 'storybook']

export const ASTRIA_API = 'https://api.astria.ai'
export const ASTRIA_BASE_MODEL_ID = 690204

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
