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
  { id: 'oil_painting', generateStyleId: 'ethereal',  name: 'Ethereal Painterly',    emoji: '🎨', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/aa12850a-89ac-4cb8-9264-fea64662b728_pet/9132c766-03b5-4067-b2c1-9894e72f7eb2.png', description: 'Rich textured brushstrokes, timeless gallery quality',   prompt: 'oil painting portrait of {subject}, rich impasto brushstrokes, warm golden light, museum quality fine art, highly detailed fur texture, dramatic chiaroscuro lighting, old masters painterly style',           negPrompt: 'photograph, digital art, cartoon, anime, watermark, text, blurry, low quality' },
  { id: 'watercolor',    name: 'Watercolor',       emoji: '💧', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/d160705c-329a-43f4-ba9a-1fba6b417aea.png', description: 'Soft dreamy washes, delicate and luminous',               prompt: 'watercolor painting of {subject}, loose fluid brushwork, soft edges, luminous pastel colors, white paper texture, impressionistic style, transparent washes',                                                     negPrompt: 'photograph, oil paint, harsh lines, dark colors, watermark, text, blurry' },
  { id: 'pencil_sketch', generateStyleId: 'charcoal', name: 'Pencil Sketch',    emoji: '✏️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/daef40a3-2107-4c9c-a1d2-e9b3d3f9b630.png', description: 'Classic graphite, elegant line work',                    prompt: 'detailed pencil sketch of {subject}, fine graphite lines, cross-hatching shading, white background, realistic proportions, expressive eyes, artist sketchbook quality',                                        negPrompt: 'color, photograph, digital art, watermark, text, blurry, low quality' },
  { id: 'pop_art', generateStyleId: 'bold_contemporary',       name: 'Contemporary Bold',           emoji: '⚡', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/aa12850a-89ac-4cb8-9264-fea64662b728_pet/67f25027-6ced-443f-b890-9072bf83ba9d.png', description: 'Bold Warhol-style, vivid and iconic',                    prompt: 'Andy Warhol pop art style portrait of {subject}, bold flat colors, high contrast, halftone dots, graphic design aesthetic, vivid neon palette, comic book style',                                                 negPrompt: 'realistic, photograph, subtle colors, watermark, text, blurry' },
  { id: 'renaissance', generateStyleId: 'classical_oil',   name: 'Oil Painting',   emoji: '👑', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/1c88ad49-a928-400a-bd57-10d11fedb462.png', description: 'Your pet as 16th century royalty',                       prompt: 'renaissance oil portrait of {subject} as royalty, ornate velvet and jewels, gilded background, dramatic chiaroscuro, Old Masters technique, museum quality, regal pose',                                          negPrompt: 'modern, photograph, cartoon, watermark, text, blurry, low quality' },
  { id: 'impressionist', name: 'Impressionist',    emoji: '🌸', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/234ffdba-7a24-4353-8636-dbe0b1593204.png', description: 'Monet-style dappled light and color',                   prompt: 'impressionist painting of {subject}, Claude Monet style, dappled sunlight, loose visible brushstrokes, soft focus, vibrant blended colors, plein air garden setting',                                              negPrompt: 'photograph, sharp lines, digital, watermark, text, low quality' },
  { id: 'cartoon', generateStyleId: 'editorial_acrylic',       name: 'Illustration',     emoji: '✨', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/32fb6ae4-e7ad-4311-890a-4bf33d664fe4.png', description: 'Cute Pixar-style illustrated portrait',                  prompt: 'cute animated illustration of {subject}, clean line art, flat colors, friendly warm expression, Pixar animation quality, white background, children\'s book style',                                               negPrompt: 'realistic, photograph, dark, scary, watermark, text, blurry' },

  { id: 'vintage_pop_art',  name: 'Vintage Poster',    emoji: '🗺️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/ae5c7a8d-ebc5-4dc1-b996-43a3629c119c.png', description: 'Four-panel Warhol screenprint — iconic and collectible', prompt: 'Create a premium four-panel pop-art portrait grid of {subject}. Render the same pet portrait in a classic 1960s-inspired pop-art screenprint style with a luxury gallery-poster feel. Use a 2x2 grid with the same portrait repeated in all four panels each panel using a different bold saturated color palette: hot pink and yellow, cyan and red, lime green and blue, orange and purple. Use strong color blocking crisp graphic edges simplified tonal shapes high contrast and flat graphic background. Keep the pet highly recognizable in every panel. Eyes nose facial markings and silhouette must stay accurate and expressive. Final result should feel iconic stylish collectible bright and premium like a high-end pop-art screenprint suitable for framing.', negPrompt: 'photograph, realistic, blurry, watermark, text, low quality, extra animals' },
  { id: 'vintage_poster_v2', name: 'Heritage Poster',  emoji: '🏛️', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/62ae7471-a130-46cf-871e-423859f48e29.png', description: 'Premium vintage travel poster — timeless and frame-worthy', prompt: 'Create a premium vintage-style poster portrait of {subject}. Render the pet as a beautifully designed vintage poster with a timeless collectible frame-worthy feel. The artwork should look like a high-end retro print or classic advertisement poster with elegant composition strong focal hierarchy and nostalgic visual charm. Style: vintage poster design, retro illustrated portrait, aged print aesthetic, tasteful distressed paper texture, subtle faded ink character, no text included, warm nostalgic palette, collectible wall-art feel. Use a refined retro color palette: cream tan faded red muted navy forest green dusty teal golden ochre warm brown and soft black. The pet should be the clear focal point in a strong iconic pose. Background: simple vintage graphic shapes soft ornamental framing subtle sunburst or badge-like design elements lightly textured retro backdrop. Should feel like a premium vintage travel poster heritage advertisement or classic collectible print.', negPrompt: 'photorealistic, glossy, modern neon, messy background, extra animals, watermark, text, low quality' },

  { id: 'neon_glow',  name: 'Neon Glow',          emoji: '🌟', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/866fc158-2a2b-495b-a5cf-2b2962b21958.png', styleBg: 'linear-gradient(135deg,#050510 0%,#150530 50%,#0a1540 100%)', styleAccent: '#a855f7', description: 'Bold, electric, and unforgettable. A high-contrast style with glowing color and a modern, nightlife-inspired edge.', prompt: 'Render this portrait in a Neon Glow style with a dark, cinematic background and vivid neon lighting accents. Preserve the {subject} likeness and expression while reinterpreting the scene with bold glowing outlines, luminous highlights, and high contrast color. Use saturated neon tones such as electric blue, magenta, purple, teal, and gold against deep shadow. The lighting should feel dynamic and stylized, emphasizing contours and key elements of the scene. The final image should feel sleek, modern, high-energy, and visually striking, like premium cyber-inspired wall art with a nightlife aesthetic.', negPrompt: 'white background, daylight, watercolor, sketch, vintage, muted colors, watermark, text, blurry' },

  { id: 'storybook',  name: 'Storybook Nostalgia', emoji: '📖', styleImage: 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev/sessions/98370965-f2b3-4893-bf53-aab867e832a1_pet/c7f16c96-8cba-42ad-8440-1c50b5568ce0.png', styleBg: 'linear-gradient(135deg,#1a0f05 0%,#3a1f08 50%,#4a2d10 100%)', styleAccent: '#d4a855', description: 'Warm, emotional, and full of life. This style turns your pet\'s story into a cozy, memory-filled scene you\'ll never forget.', prompt: 'Render this portrait in a warm storybook nostalgia style, with soft painterly brushwork, gentle lighting, and a cozy, emotionally rich atmosphere. Preserve the {subject} likeness, expression, and personality while placing them naturally within the story-driven environment described. The scene should feel lived-in and meaningful, with subtle environmental details that support memory and narrative without overwhelming the subject. Use warm, inviting color tones, soft edges, and natural light. The overall composition should feel intimate, sentimental, and timeless, like a cherished illustrated memory brought to life.', negPrompt: 'harsh lighting, dark background, neon, cold colors, photorealistic, watermark, text, blurry' }
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
