import { NextRequest } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function uploadB64ToR2(b64: string, ext = 'png', sessionFolder = 'generated'): Promise<string> {
  const key = `${sessionFolder}/${uuidv4()}.${ext}`
  const buffer = Buffer.from(b64, 'base64')
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: `image/${ext}`,
    CacheControl: 'public, max-age=86400',
  }))
  return `${process.env.R2_PUBLIC_URL?.replace(/\/$/, '')}/${key}`
}

async function saveSessionMetadata(sessionFolder: string, meta: object) {
  try {
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: `${sessionFolder}/session.json`, Body: JSON.stringify(meta, null, 2), ContentType: 'application/json', CacheControl: 'no-cache' }))
  } catch(e) { console.error('Session meta save failed:', e) }
}

// ════════════════════════════════════════════════════════════════
//  8 SHARED STYLE FAMILIES
//
//  These are the visual styles used across ALL tiers and ALL models.
//  Each style is defined by visual characteristics — not private names.
//
//  Each style produces prompts in 3 formats per model's ideal syntax:
//   1. GPT Image 1.5  — long structured sections, handles 4000+ tokens
//                       format: SUBJECT IDENTITY → STYLE → COMPOSITION
//                                → PAINT SURFACE → BACKGROUND → CONSTRAINTS
//   2. FLUX Kontext   — short imperative, 40-50 words max (512 token limit)
//                       format: "Repaint as [style]. Keep [specific elements] unchanged."
//   3. Astria LoRA    — sks token + style description
//                       format: "portrait of sks [type] in [style]"
// ════════════════════════════════════════════════════════════════

const CONSTRAINTS_GPT = `CONSTRAINTS
- no text
- no watermark
- no extra animals
- no extra limbs
- no distorted anatomy
- not photorealistic photography
- not cartoon styling
- not anime styling
- not flat vector art`

function subjectIdentityBlock(petDesc: string): string {
  return `Create a premium fine-art portrait of the exact animal shown in the input image.

SUBJECT IDENTITY
Preserve the exact animal from the input photo:
- ${petDesc}
- exact breed appearance and body proportions
- exact face shape and facial proportions
- exact muzzle shape
- exact ear shape and ear set
- exact eye color and expression
- exact coat color and all markings
- exact fur length, texture, and volume
- preserve any visible accessories (collar, harness, tags, bandana)
- do not invent new markings or change age, body type, or expression`
}

const STYLE_FAMILIES: Array<{
  id: string
  name: string
  emoji: string
  gptPrompt: (petDesc: string) => string
  fluxPrompt: (petDesc: string) => string
  astriaPrompt: (petType: string) => string
}> = [
  {
    id: 'retro_pop',
    name: 'Retro Pop',
    emoji: '🟥',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image as a premium retro pop art grid portrait with the pet repeated across four equal square panels in a perfectly aligned 2x2 composition. The layout must be symmetrical, evenly spaced, and clean, with four matching square quadrants arranged in a balanced grid. The pet must be centered clearly within each square, using identical crop, scale, head position, and framing in every panel. Each quadrant must contain the exact same portrait composition, with only the color palette changing between panels.
Use bold, fully saturated, high-contrast pop art color palettes in each quadrant. Colors must be vivid, bright, and striking — not muted, not pastel, not desaturated, and not neutral. Each panel should use a distinctly different, vibrant color combination to create a strong, iconic visual contrast.
Preserve the pet's recognizable likeness, expression, and personality while simplifying the portrait into clean shapes, crisp edges, and smooth color blocking. Backgrounds should remain flat and minimal so the pet remains the focal point in every panel.
Do not use misaligned panels, uneven spacing, varied subject position, different crops, overlapping elements, collage layouts, or off-center framing. Avoid photorealism, muddy tones, washed-out colors, painterly textures, noise, or cheap novelty styling.
Ensure all four panels are perfectly aligned and evenly spaced, with identical centered composition in each quadrant and bold, vivid color variation between panels.

${CONSTRAINTS_GPT}
- four panels, perfectly aligned 2x2 grid
- same pet, same crop, same framing in every panel
- only color palette changes per panel — bold vivid fully saturated colors
- no muted, pastel, desaturated, or neutral tones
- no misaligned panels, uneven spacing, or off-center framing`,

    fluxPrompt: (petDesc) =>
      `Four-panel 2x2 pop art grid of ${petDesc}. Same pet centered in all four quadrants, perfectly symmetrical. Each panel a different bold high-contrast palette: hot pink/yellow, cyan/red, lime/blue, orange/purple. Crisp graphic edges, flat color-blocked backgrounds, clean separation between panels. Premium gallery pop art, Warhol-inspired, collectible.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, four-panel Warhol pop art grid, 2x2 composition, bold flat colors, high contrast, different palette each panel, collectible gallery wall art`,
  },

  {
    id: 'fairytale',
    name: 'Fairytale',
    emoji: '✨',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image in a premium storybook portrait style with soft illustrated brushwork, warm golden light, and a cozy magical atmosphere. The result should feel like a beautifully painted children's book illustration, not a photograph, not a cartoon, and not a polished digital render. Preserve the pet's accurate likeness, especially the face shape, nose, curls, and gentle head tilt, while giving the eyes a slightly larger, more expressive, soulful storybook quality. Use soft edges, subtle painterly texture, warm highlights, gentle glow, floating dust-like sparkles, and an inviting interior scene with simple whimsical background elements such as a softly lit window, curtains, flowers, books, or a cozy home setting. Keep the pet centered and emotionally engaging as the clear focal point. Fur should feel soft and painterly, not overly detailed or hyperreal. Avoid photorealism, hard outlines, comic-book styling, plastic AI textures, oversharpening, cluttered backgrounds, or cheap novelty illustration. The final image should feel heartwarming, nostalgic, magical, and premium, like a treasured storybook portrait worthy of framing.

${CONSTRAINTS_GPT}
- not photorealistic
- no hard outlines
- no comic-book styling
- no cluttered backgrounds`,

    fluxPrompt: (petDesc) =>
      `Premium fairytale storybook portrait of ${petDesc}. Soft illustrated brushwork, warm golden light, cozy magical atmosphere. Slightly larger soulful expressive eyes. Floating sparkles, gentle glow, whimsical interior background — window, curtains, flowers, books. Soft painterly fur. Heartwarming, nostalgic, magical, premium.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, fairytale storybook illustration, soft painterly brushwork, warm golden light, magical cozy atmosphere, soulful expressive eyes, floating sparkles, whimsical interior, premium`,
  },

  {
    id: 'comic_animation',
    name: 'Premium Comic',
    emoji: '💥',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image as a premium animated comic book portrait with bold, clean inked linework, expressive stylization, and polished cel shading. The result should feel like a high-end illustrated panel from a modern comic book, with confident contour lines, simplified forms, and strong visual clarity. Preserve the pet's accurate likeness, including facial structure, fur pattern, and expression, while subtly stylizing the features to feel more animated and character-driven. The eyes should be slightly larger and more expressive, with a lively, emotional quality. Fur should be simplified into clean, stylized curls and directional shapes rather than hyper-detailed texture. Use smooth cel shading with clear light and shadow separation, avoiding overly soft blending. Lighting should be cinematic and directional, with warm highlights and defined shadows that enhance depth and form. Ensure clean, consistent ink outlines with controlled line weight variation for a polished and professional comic look. The background should be softly simplified and illustrated, supporting the subject without clutter, like a well-composed comic panel. Avoid photorealism, painterly brush textures, excessive detail, noisy linework, heavy halftone effects, plastic AI textures, or cheap cartoon aesthetics. The final image should feel vivid, animated, collectible, and premium, like real comic book art worthy of framing.

${CONSTRAINTS_GPT}
- not photorealistic
- no painterly brush textures
- no heavy halftone effects`,

    fluxPrompt: (petDesc) =>
      `Premium comic book portrait of ${petDesc}. Bold clean inked linework, polished cel shading, expressive stylization. Slightly larger emotional eyes. Clean directional fur shapes. Cinematic directional lighting, warm highlights, defined shadows. Consistent ink outlines. Simple illustrated background. Vivid, animated, collectible, premium.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, premium comic book illustration, bold clean linework, cel shading, expressive animated style, cinematic lighting, professional comic art, collectible`,
  },

  {
    id: 'fine_art_sketch',
    name: 'Fine Art Sketch',
    emoji: '🖊️',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image as a premium fine art sketch portrait with the look of a hand-drawn charcoal and graphite artwork on textured paper. The result should feel like a real commissioned drawing created by a skilled portrait artist, not a photograph, not a painting, and not a generic digital filter. Preserve the pet's accurate likeness, facial structure, fur pattern, expression, and emotional presence while translating the portrait into elegant linework, soft shading, and refined tonal depth. Use delicate pencil and charcoal marks, subtle crosshatching, blended graphite shadows, and strong focal detail around the eyes, nose, and expression. The background should remain minimal, soft, and unobtrusive, with only gentle tonal suggestion or paper texture so the pet remains the clear emotional focus. Keep the composition timeless, balanced, and dignified. Avoid glossy digital polish, hard vector lines, cartoon styling, excessive detail everywhere, muddy smudging, fake photo-to-sketch effects, noisy textures, or cheap novelty aesthetics. The final image should feel intimate, sophisticated, timeless, and deeply emotional, like a museum-quality pet portrait sketch worthy of framing.

${CONSTRAINTS_GPT}
- not a photograph
- not a painting
- no hard vector lines
- no fake photo-to-sketch effects`,

    fluxPrompt: (petDesc) =>
      `Premium fine art sketch portrait of ${petDesc}. Hand-drawn charcoal and graphite on textured paper. Elegant linework, soft shading, refined tonal depth. Delicate pencil marks, subtle crosshatching, blended graphite shadows. Strong focal detail on eyes, nose, expression. Minimal soft background, paper texture. Intimate, sophisticated, timeless, museum-quality.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, premium fine art sketch, charcoal and graphite on textured paper, elegant linework, soft crosshatching, blended shadows, museum-quality portrait drawing, timeless and sophisticated`,
  },

  {
    id: 'neon_glow',
    name: 'Neon Glow',
    emoji: '🌟',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Render this portrait in a Neon Glow style with a dark, cinematic background and vivid neon lighting accents. Preserve the subject's likeness and expression while reinterpreting the scene with bold glowing outlines, luminous highlights, and high contrast color. Use saturated neon tones such as electric blue, magenta, purple, teal, and gold against deep shadow. The lighting should feel dynamic and stylized, emphasizing contours and key elements of the scene. The final image should feel sleek, modern, high-energy, and visually striking, like premium cyber-inspired wall art with a nightlife aesthetic.

COMPOSITION
Strong centered portrait. Dark dramatic background. Subject glows with neon rim lighting. Eyes and facial features catch the brightest neon light.

PAINT SURFACE
Sleek modern digital-art quality. High contrast between dark background and luminous neon highlights. Sharp glowing edges.

BACKGROUND
Dark cinematic — near black with subtle depth. Neon color bleed and atmospheric haze.

${CONSTRAINTS_GPT}
- not pastel or muted
- not daytime or natural light
- not cartoon or anime`,

    fluxPrompt: (petDesc) =>
      `Render this portrait in Neon Glow style. Dark cinematic background, vivid neon lighting accents. Preserve the ${petDesc} likeness and expression. Bold glowing outlines, luminous highlights, high contrast. Electric blue, magenta, purple, teal, gold neon tones against deep shadow. Sleek modern high-energy premium cyber-inspired wall art. Keep identity unchanged.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType} in neon glow style, dark cinematic background, electric neon lighting, vibrant colors`,
  },
  {
    id: 'storybook',
    name: 'Storybook Nostalgia',
    emoji: '📖',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Render this portrait in a warm storybook nostalgia style, with soft painterly brushwork, gentle lighting, and a cozy, emotionally rich atmosphere. Preserve the subject's likeness, expression, and personality while placing them naturally within a story-driven environment. The scene should feel lived-in and meaningful, with subtle environmental details that support memory and narrative without overwhelming the subject. Use warm, inviting color tones, soft edges, and natural light. The overall composition should feel intimate, sentimental, and timeless, like a cherished illustrated memory brought to life.

COMPOSITION
Intimate centered portrait. Subject placed naturally in a cozy scene. Warm natural light or golden-hour glow. Environmental details that feel personal and lived-in.

PAINT SURFACE
Soft painterly brushwork. Warm textured canvas feel. Gentle impressionistic edges that soften into the background while keeping the face clear.

BACKGROUND
Cozy memory-filled scene — books, warm fabrics, soft botanicals, golden light through a window. Feels lived-in and meaningful.

${CONSTRAINTS_GPT}
- not dark or moody
- not harsh lighting
- not neon or cyberpunk
- not photorealistic photography`,

    fluxPrompt: (petDesc) =>
      `Warm storybook nostalgia style portrait of ${petDesc}. Soft painterly brushwork, gentle lighting, cozy emotionally rich atmosphere. Preserve subject's likeness and personality. Warm inviting color tones, soft edges, natural light. Intimate sentimental timeless feel like a cherished illustrated memory. Keep identity unchanged.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType} in storybook illustration style, warm cozy atmosphere, soft painterly, golden light`,
  },
  {
    id: 'ethereal',
    name: 'Ethereal Painterly',
    emoji: '🎨',
    // GPT: full structured prompt — handles long form well
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image in an ethereal painterly style with soft, expressive brushwork, atmospheric depth, and an emotionally rich fine-art composition. The result should feel like a real hand-painted artwork created by a skilled contemporary painter, not a photograph, not a digital illustration, and not a polished AI render. Preserve the pet's recognizable likeness, soulful eyes, and emotional presence, while interpreting the scene with softness, memory, and artistic intuition rather than literal realism. Use layered painterly texture, broken edges, subtle asymmetry, soft blending, and visible brushstrokes that allow parts of the subject and background to gently dissolve into one another. The palette should feel harmonious, muted but expressive, with nuanced color shifts and a dreamlike atmosphere. Backgrounds should remain suggestive and atmospheric, supporting the story and mood without becoming overly detailed or visually busy. Avoid photorealism, glossy digital smoothness, hard outlines, cartoon styling, over-rendered fur detail, plastic textures, sharp vector edges, or generic decorative illustration. The finished image should feel intimate, emotional, poetic, and timeless, like a treasured painting built from memory, feeling, and presence.

${CONSTRAINTS_GPT}`,

    // FLUX: short imperative — 512 token limit, no structured sections
    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to a soft ethereal oil painting, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as dreamlike painterly atmosphere, visible hand-applied brushwork, muted botanical background in ivory and sage, soft edges, warm diffused light, premium gallery portrait finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, soft ethereal oil painting, dreamlike atmosphere, visible brushwork, botanical background, warm muted palette, fine art`,
  },

  {
    id: 'bold_contemporary',
    name: 'Contemporary Bold',
    emoji: '✨',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image in a bold modern surreal style with striking color, dramatic contrast, and a polished contemporary fine-art composition. The result should feel like a high-end gallery painting — luxurious, vibrant, and visually arresting — not a cartoon, not a photograph, and not a generic digital illustration. Preserve the pet's recognizable likeness, expressive presence, and key personality traits, while elevating the image through intensified color, surreal visual drama, and refined artistic stylization. Use rich jewel tones, luminous highlights, crisp focal areas, and a sophisticated balance of realism and fantasy. The composition should feel intentional, high-impact, and elegant, with bold visual clarity and premium decorative appeal. Backgrounds may include stylized natural or symbolic elements, but should remain integrated, artful, and compositionally controlled rather than cluttered or literal. Avoid childish pop styling, muddy colors, low-end poster aesthetics, messy collage effects, plastic textures, generic AI smoothness, or cheap novelty energy. The final image should feel powerful, glamorous, modern, and collectible, like luxury statement art created for a beautiful interior.

${CONSTRAINTS_GPT}`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to a bold contemporary fine-art oil painting, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as thick impasto oil paint, jewel-toned palette of sapphire and emerald, surreal oversized floral backdrop, dramatic contrast lighting, gemstone-like highlights, premium gallery-wall finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, bold contemporary fine art oil painting, jewel tones, thick impasto, dark dramatic botanical background, gallery quality`,
  },

  {
    id: 'classical_oil',
    name: 'Oil Painting',
    emoji: '🖼️',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Classical Old Masters oil portrait tradition. Rich warm tones. Dramatic chiaroscuro — deep shadows with luminous highlights. Museum-quality fine art. Rembrandt-style lighting. Dense layered paint. Serious and timeless.

COMPOSITION
Traditional formal portrait composition. Three-quarter view or frontal. Rich dark background framing the subject.

PAINT SURFACE
Smooth glazed surface over impasto underlayer. Visible brushwork only in fur and fabric. Luminous skin-like depth in eyes.

BACKGROUND
Dark rich background — deep brown, burgundy, or forest green. Possibly a suggestion of draped fabric or architectural detail.

${CONSTRAINTS_GPT}
- not impressionist
- not modern`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to a classical Old Masters oil painting, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as Rembrandt chiaroscuro lighting, rich dark background, smooth glazed oil surface with luminous depth, dense layered paint, museum-quality dignified finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, classical Old Masters oil portrait, Rembrandt chiaroscuro, dark rich background, museum quality, glazed oil paint`,
  },

  {
    id: 'watercolor',
    name: 'Watercolor Fine Art',
    emoji: '💧',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Transparent watercolor on cold-press paper. Loose fluid brushwork. Soft bleeding edges. Luminous transparent washes layered for depth. Visible paper texture in highlights. Soft halo around fur edges. Delicate and airy.

COMPOSITION
Centered portrait with airy open composition. Light flows from above. Soft vignette edges.

PAINT SURFACE
Transparent layered washes, not opaque. Wet-on-wet soft blooms in background. More defined brushwork only on eyes and muzzle.

BACKGROUND
Very loose abstract washes. Warm ivory, blush, sky blue. Minimal — lets the dog breathe.

${CONSTRAINTS_GPT}
- not oil paint
- not digital
- not harsh outlines`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to transparent watercolor on cold-press paper, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as loose fluid washes, soft bleeding edges, visible paper texture, wet-on-wet background blooms in ivory and blush, soft natural light, delicate fine-art finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, transparent watercolor painting, loose fluid washes, soft edges, visible paper texture, pastel palette`,
  },

  {
    id: 'charcoal',
    name: 'Charcoal & Graphite',
    emoji: '✏️',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Fine charcoal and graphite drawing on textured paper. Individual drawn marks throughout. Hatching and cross-hatching for shadow. Varying line weight. Classical portrait tradition. Elegant, intimate, and technically masterful.

COMPOSITION
Centered portrait. Strong tonal range from near-white to deep charcoal. Eyes and muzzle sharply rendered.

PAINT SURFACE
Visible individual marks. Smooth tonal blends in shadow areas. Crisp detail on eyes, nose, whiskers.

BACKGROUND
Clean white or very light gestural strokes suggesting space. Focus entirely on the dog.

${CONSTRAINTS_GPT}
- no color
- not ink wash
- not digital
- not cartoon`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to fine charcoal and graphite drawing on textured paper, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color rendered in graphite tones, markings, eyes, ears, and accessories. Render the style as hatching and cross-hatching technique, strong tonal range near-white to deep charcoal, crisp detail in eyes and nose, classical intimate drawing finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, fine charcoal graphite drawing, hatching cross-hatching, strong tonal range, white paper background`,
  },

  {
    id: 'impressionist',
    name: 'Impressionist',
    emoji: '🌸',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Impressionist oil painting in the tradition of Monet and Renoir. Dappled sunlight effect. Loose visible brushstrokes throughout — no smooth passages. Vibrant blended colors. Plein air feeling. Light and movement in every stroke.

COMPOSITION
Three-quarter or frontal portrait. Garden or outdoor light setting. Subject bathed in dappled warm light.

PAINT SURFACE
Short thick dabs of paint throughout. Colors placed side-by-side rather than blended. Vibrant and energetic surface.

BACKGROUND
Garden setting with loose impressionist foliage — blues, greens, purples, and gold. Light broken across leaves.

${CONSTRAINTS_GPT}
- not pointillist
- not photorealistic`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to Impressionist oil painting in the style of Monet, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as loose short visible brushstrokes, dappled garden light, vibrant color dabs side-by-side, blues and greens in the background, warm luminous light, energetic painted surface.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, impressionist oil painting Monet style, loose brushstrokes, dappled garden light, vibrant color`,
  },


  {
    id: 'pastel',
    name: 'Soft Pastel',
    emoji: '🕊️',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Soft, dreamy pastel portrait with a fine-art illustration quality. Think of a beautifully rendered pastel drawing on toned paper — delicate blended color, soft gradients, gentle light, and an intimate, emotional warmth. The texture should feel like real pastel chalk or colored pencil on quality art paper.

Color palette: soft lavenders, powder blues, warm creams, dusty roses, sage greens, warm greys. Never harsh, never neon — always gentle and luminous.

The pet should feel precious and tender in this rendering. Romantic, timeless, gallery-worthy.

${CONSTRAINTS_GPT}
- not photorealistic
- not cartoon
- not oil painting
- not watercolor (pastel texture, not washes)`,

    fluxPrompt: (petDesc) =>
      `Soft pastel portrait of ${petDesc}. Delicate blended pastel chalk on toned paper. Dreamy, warm, gentle light. Soft lavenders, powder blues, warm creams. Fine-art illustration quality. Intimate and emotional. Not photorealistic, not cartoon.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, soft pastel drawing, delicate blended colors, dreamy fine art illustration, toned paper texture, warm and gentle`,
  },
  {
    id: 'vintage_poster',
    name: 'Vintage Poster',
    emoji: '🗺️',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image as a premium vintage poster illustration with bold graphic composition, simplified painterly shapes, strong silhouette, and timeless retro print energy. The result should feel like a beautifully designed mid-century travel or advertising poster, not a cartoon, not a photograph, and not a modern digital illustration. Preserve the pet's recognizable likeness, posture, and personality while stylizing the scene into elegant flattened forms, controlled shading, and nostalgic color harmony. Use a curated retro palette, confident line structure, subtle print texture, and balanced composition with strong visual readability from a distance. Background elements should feel iconic and design-forward rather than overly detailed, helping tell the story in a clear, memorable way. Avoid photorealism, glossy rendering, plastic AI textures, muddy color, childish cartoon styling, messy collage effects, and generic poster templates. The final image should feel collectible, stylish, nostalgic, and premium, like a classic illustrated poster worthy of framing.

${CONSTRAINTS_GPT}
- not photorealistic
- not Warhol multi-panel grid
- not childish or cartoon
- not generic digital AI poster`,

    fluxPrompt: (petDesc) =>
      `Premium vintage poster illustration of ${petDesc}. Mid-century travel or advertising poster style. Bold graphic composition, simplified painterly shapes, strong silhouette. Elegant flattened forms, controlled shading, nostalgic retro color harmony. Curated retro palette, confident line structure, subtle print texture. Collectible, stylish, nostalgic, premium. Not photorealistic, not cartoon, not Warhol grid.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, mid-century vintage travel poster illustration, bold graphic, flat colors, retro print aesthetic, collectible`,
  },

  {
    id: 'vintage_pop_art',
    name: 'Gallery Pop',
    emoji: '⚡',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Render this image as a premium single-image gallery pop portrait with bold graphic styling, striking color contrast, and a polished contemporary art feel. The result should feel like high-end pop-inspired wall art for a modern gallery, not a cartoon, not a meme, and not a cheap novelty print. Preserve the pet's recognizable likeness, expression, and personality while simplifying the subject into strong shapes, crisp edges, smooth color blocking, and clean visual structure. Use a vibrant but curated color palette with bold contrast, confident composition, and stylish modern-art energy. The portrait must be a single centered composition with one subject only. Do not use multiple panels, repeated images, quadrant layouts, grids, split frames, duplicated portraits, or Warhol-style repetition. The background should be simple, clean, and design-forward, supporting the pet without clutter and without creating a poster-grid look. Avoid photorealism, muddy color, childish illustration, collage effects, plastic AI textures, generic digital smoothness, and low-end pop-art novelty aesthetics. The final image should feel iconic, stylish, modern, and premium, like a collectible single-image pop portrait worthy of framing.

${CONSTRAINTS_GPT}
- single centered portrait only
- no multiple panels or grids
- no Warhol quadrant layout
- no repeated images
- not photorealistic`,

    fluxPrompt: (petDesc) =>
      `A four-panel 2x2 pop-art screenprint of the exact dog from the reference image. Same dog in all four panels — same breed, face, markings, expression. 1960s Warhol pop-art style: bold flat color blocking, crisp graphic edges, high contrast. Each panel a different saturated palette: hot pink/yellow, cyan/red, lime green/blue, orange/purple. Iconic, collectible, gallery-worthy.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, four-panel Warhol pop-art screenprint grid, bold flat colors, high contrast, 1960s graphic style, collectible`,
  },
  {
    id: 'vintage_poster_v2',
    name: 'Heritage Poster',
    emoji: '🏛️',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

Create a premium heritage poster portrait of the exact animal shown in the input image.

SUBJECT IDENTITY
Preserve the exact animal from the input photo with perfect likeness — exact breed, coat, markings, expression, and accessories.

STYLE
Premium collectible heritage poster with timeless frame-worthy appeal. Warm, rich, and dignified. Feels like a treasured antique print or classic naturalist illustration elevated to fine art poster status.

Style direction: heritage illustration aesthetic, aged parchment and warm earth tones, subtle distressed texture, ornamental border framing, badge or crest design elements, rich warm palette, hand-crafted premium feel, collectible wall art.

COLOR PALETTE
Warm cream, rich tan, burnt sienna, forest green, deep navy, gold, aged ivory, warm brown, muted terracotta. Rich, dignified, and timelessly elegant.

COMPOSITION
Pet centered as the noble focal point. Background has ornamental heritage design elements — subtle crest shapes, elegant borders, warm textured backdrop. Feels distinguished, classic, and collectible.

${CONSTRAINTS_GPT}`,

    fluxPrompt: (petDesc) =>
      `A premium vintage-style poster portrait of the exact dog from the reference image. Keep the same dog — same breed, coat, markings, expression. Render as a high-end retro print: aged paper texture, faded ink, warm nostalgic palette of cream, tan, muted red, dusty teal, golden ochre. Pet in strong iconic pose as clear focal point. Background has simple vintage graphic shapes, ornamental framing, subtle sunburst elements. Feels like a heritage advertisement or classic collectible travel poster. Elegant, timeless, frame-worthy.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, premium vintage poster style, retro illustrated, aged paper texture, warm nostalgic palette, heritage advertisement aesthetic`,
  },
]

// ── Memory Portrait scene builder — same style families as base ──
function buildMemoryPrompt(answers: Record<string, string>, petDesc: string, sceneId: string, styleFamily: typeof STYLE_FAMILIES[0]): string {
  const name  = answers.petName || 'the pet'
  const place = answers.favPlace || answers.favOutdoorSpot || 'a beautiful setting'
  const mood  = answers.timeAndSeason || 'golden hour'
  const extras = [
    answers.favCar  ? `posed with or in a ${answers.favCar}` : '',
    answers.favTeam ? `wearing a ${answers.favTeam} collar or bandana` : '',
    answers.favToy  ? `holding a ${answers.favToy}` : '',
    answers.favFood ? `with ${answers.favFood} visible` : '',
  ].filter(Boolean).join(', ')

  const sceneDesc = (() => {
    switch (sceneId) {
      case 'mem_adventure':   return `${name} on an adventure at ${place}. Cinematic outdoor landscape, sense of freedom and joy.`
      case 'mem_royal':       return `${name} as royalty. Ornate gold-leaf setting, velvet drapes, jeweled collar, commanding pose.`
      case 'mem_golden_hour': return `${name} at ${place} during golden hour. Warm amber light catching the fur.`
      case 'mem_holiday':     return `${name} in a cozy holiday scene — fireplace glow, decorated tree, warm candlelight.`
      case 'mem_city':        return `${name} in ${place || 'a vibrant city'} at dusk. City lights bokeh, confident and stylish.`
      case 'mem_perfect_day': return answers.perfectDay || `${name}'s perfect day at ${place}. Joyful and free.`
      default: return `${name} in a beautiful painterly scene at ${place}.`
    }
  })()

  return `${subjectIdentityBlock(petDesc)}
${extras ? `\nPersonal details to include: ${extras}` : ''}

SCENE
${sceneDesc}
Mood: ${mood}.

STYLE
${styleFamily.gptPrompt(petDesc).split('STYLE\n')[1]?.split('\n\nCOMPOSITION')[0] || 'Fine art painting, gallery quality, painterly brushwork.'}

COMPOSITION
Painterly fine art portrait. Gallery quality. The scene is personal and emotionally resonant.

${CONSTRAINTS_GPT}`
}

export async function POST(req: NextRequest) {
  const { imageUrl, isMemory, answers, petType, petName, sessionId, brief, imagePromptCore, targetStyleId, variantCount } = await req.json()

  const r2PublicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || ''
  const imageKey = imageUrl.startsWith(r2PublicBase)
    ? imageUrl.slice(r2PublicBase.length + 1)
    : imageUrl.split('/uploads/').pop() ? `uploads/${imageUrl.split('/uploads/').pop()}` : null

  let accessibleImageUrl = imageUrl
  if (imageKey) {
    try {
      accessibleImageUrl = await getSignedUrl(r2, new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!, Key: imageKey
      }), { expiresIn: 3600 })
    } catch (e) { console.error('Presign failed:', e) }
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        const allImages: Array<{ url: string; styleId: string; styleName: string; model: string }> = []
        send({ type: 'progress', value: 5, message: 'Analyzing your pet...' })

        // ── Step 1: Fetch pet image ─────────────────────────────
        let petImageBuffer: Buffer | null = null
        try {
          const imgRes = await fetch(accessibleImageUrl, {
            headers: { 'User-Agent': 'PetPrintsStudio/1.0' },
            signal: AbortSignal.timeout(30000),
          })
          if (imgRes.ok) {
            petImageBuffer = Buffer.from(await imgRes.arrayBuffer())
            console.log('Pet image fetched, size:', petImageBuffer.length)
          } else {
            console.error('Pet image fetch failed:', imgRes.status)
          }
        } catch(e) { console.error('Fetch error:', e) }

        // ── Step 2: GPT-4o-mini Vision — get precise pet description ──
        // Injected into ALL prompts for ALL models.
        // This is the foundation — the API doesn't know what the dog
        // looks like from a name alone.
        let petDesc = `${petType || 'dog'} named ${petName || 'the pet'}`
        try {
          const vRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              max_tokens: 150,
              messages: [{
                role: 'user',
                content: [
                  { type: 'image_url', image_url: { url: accessibleImageUrl, detail: 'low' } },
                  { type: 'text', text: 'Describe this dog precisely for a fine art painter. One sentence. Include: exact breed or mix, coat color and texture (e.g. loose curly golden fur), any distinctive markings, face shape, ear type, eye color, visible accessories. Be specific. Start with the breed.' }
                ]
              }]
            })
          })
          if (vRes.ok) {
            const vd = await vRes.json()
            const d = vd.choices?.[0]?.message?.content?.trim()
            if (d && d.length > 10) { petDesc = d; console.log('Pet description:', petDesc) }
          }
        } catch(e) { console.error('Vision failed:', e) }

        const petSlug = (petName || petType || 'pet').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)
        const sessionFolder = `sessions/${sessionId || uuidv4()}_${petSlug}`
        const sessionStart = new Date().toISOString()
        send({ type: 'progress', value: 12, message: 'Starting portrait generation...' })

        if (!isMemory) {
          // ════════════════════════════════════════════════════
          //  TIER 1: STYLE TRANSFER
          //
          //  All 8 style families, each run separately.
          //  Per style: 1 GPT call + 1 FLUX call = 2 variants
          //  Total: 16 images (8 GPT + 8 FLUX)
          //
          //  GPT Image 1.5:
          //    - /images/edits + pet photo + input_fidelity:high
          //    - Long structured prompt (its ideal format)
          //    - quality: medium (selection pass)
          //
          //  FLUX Kontext:
          //    - Short imperative prompt (40-50 words max per BFL docs)
          //    - guidance_scale: 3.0 (BFL recommends 2.5-3.5)
          //    - Pet photo as image_url
          // ════════════════════════════════════════════════════

          // ── GPT Image 1.5 only — 8 styles × 3 variants = 24 portraits ──
          // All use /images/edits + input_fidelity:high + pet photo
          // Rate limit: 5 images/min — run 4 at a time with 13s gap between batches
          const VARIANTS_PER_STYLE = 1
          const activeFamilies = targetStyleId
            ? STYLE_FAMILIES.filter(f => f.id === targetStyleId)
            : STYLE_FAMILIES
          const variantsToRun = variantCount || VARIANTS_PER_STYLE
          const total = activeFamilies.length * variantsToRun
          let done = 0
          const allTasks = activeFamilies.flatMap(family =>
            Array.from({ length: variantsToRun }, (_, v) => async () => {
              try {
                if (!petImageBuffer) { console.error('No buffer for GPT'); done++; return }
                const fd = new FormData()
                fd.append('model', 'gpt-image-1')
                fd.append('prompt', family.gptPrompt(petDesc))
                fd.append('n', '1')
                fd.append('size', '1024x1024')
                fd.append('quality', 'medium')
                fd.append('image[]', new Blob([petImageBuffer as unknown as BlobPart], { type: 'image/jpeg' }), 'pet.jpg')

                const res = await fetch('https://api.openai.com/v1/images/edits', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
                  body: fd,
                })
                if (res.ok) {
                  const d = await res.json()
                  const b64 = d.data?.[0]?.b64_json
                  if (b64) {
                    const url = await uploadB64ToR2(b64, 'png', sessionFolder)
                    const img = { url, styleId: `${family.id}_${v}`, styleName: `${family.emoji} ${family.name}`, model: 'gpt' }
                    allImages.push(img); send({ type: 'image', image: img })
                  }
                } else {
                  const t = await res.text()
                  console.error(`GPT error [${family.name} v${v}]:`, res.status, t.slice(0, 300))
                }
              } catch(e) { console.error(`GPT task error [${family.name} v${v}]:`, e) }
              done++
              send({ type: 'progress', value: Math.min(12 + Math.round((done / total) * 78), 90), message: `${allImages.length} of ${total} portraits ready...` })
            })
          )

          // Run in batches of 4 — stays under OpenAI 5 images/min rate limit
          for (let i = 0; i < allTasks.length; i += 4) {
            if (i > 0) await new Promise(r => setTimeout(r, 13000))
            await Promise.all(allTasks.slice(i, i + 4).map(t => t()))
          }

        } else {
          // ════════════════════════════════════════════════════
          //  TIER 2: MEMORY PORTRAIT
          //  6 scenes × 2 models = 12 images
          //  Uses all 8 style families as visual foundation.
          //  Picks style based on scene mood.
          // ════════════════════════════════════════════════════
          const sceneStyleMap: Record<string, string> = {
            mem_adventure: 'editorial_acrylic', mem_royal: 'classical_oil',
            mem_golden_hour: 'impressionist', mem_holiday: 'ethereal',
            mem_city: 'bold_contemporary', mem_perfect_day: 'pastel',
          }
          const scenes = ['mem_adventure','mem_royal','mem_golden_hour','mem_holiday','mem_city','mem_perfect_day']
          const sceneNames: Record<string,string> = {
            mem_adventure:'🚗 Adventure', mem_royal:'👑 Royal',
            mem_golden_hour:'🌅 Golden Hour', mem_holiday:'🎄 Holiday',
            mem_city:'🏙️ City', mem_perfect_day:'✨ Perfect Day',
          }

          const memTasks = scenes.flatMap(sceneId => {
            const family = STYLE_FAMILIES.find(f => f.id === sceneStyleMap[sceneId]) || STYLE_FAMILIES[0]
            return [
              // GPT version
              async () => {
                try {
                  const prompt = buildMemoryPrompt(answers || {}, petDesc, sceneId, family)
                  const fd = new FormData()
                  fd.append('model', 'gpt-image-1')
                  fd.append('prompt', prompt)
                  fd.append('n', '1')
                  fd.append('size', '1024x1024')
                  fd.append('quality', 'medium')
                  fd.append('input_fidelity', 'high')
                  if (petImageBuffer) fd.append('image[]', new Blob([petImageBuffer as unknown as BlobPart], { type: 'image/jpeg' }), 'pet.jpg')
                  const res = await fetch('https://api.openai.com/v1/images/edits', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
                    body: fd,
                  })
                  if (res.ok) {
                    const d = await res.json()
                    const b64 = d.data?.[0]?.b64_json
                    if (b64) {
                      const url = await uploadB64ToR2(b64, 'png', sessionFolder)
                      allImages.push({ url, styleId: `${sceneId}_gpt`, styleName: sceneNames[sceneId] || sceneId, model: 'gpt' })
                      send({ type: 'image', image: allImages[allImages.length-1] })
                    }
                  } else console.error(`Memory GPT error [${sceneId}]:`, res.status, (await res.text()).slice(0,200))
                } catch(e) { console.error('Memory GPT task error:', e) }
              },

            ]
          })

          send({ type: 'progress', value: 15, message: 'Generating memory scenes...' })
          for (let i = 0; i < memTasks.length; i += 4) {
            await Promise.all(memTasks.slice(i, i + 4).map(t => t()))
            send({ type: 'progress', value: 15 + Math.round(((i+4)/memTasks.length)*80), message: `${allImages.length} memory portraits ready...` })
          }
        }

        // ── Astria LoRA (when configured) ──────────────────────
        if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
          send({ type: 'progress', value: 92, message: 'Generating exact likeness portraits...' })
          // Run 2 Astria prompts using different styles
          for (const family of [STYLE_FAMILIES[0], STYLE_FAMILIES[1]]) {
            try {
              const aPrompt = family.astriaPrompt(petType || 'dog') + `, ${petDesc}`
              const aRes = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: { text: aPrompt, num_images: 3, super_resolution: true, face_correct: true, w: 1024, h: 1024 } }),
              })
              if (aRes.ok) {
                const aData = await aRes.json(); const pid = aData.id; let attempts = 0
                while (attempts < 40) {
                  await new Promise(r => setTimeout(r, 5000))
                  const poll = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts/${pid}`, { headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}` } })
                  const pd = await poll.json()
                  if (pd.images?.length > 0) {
                    for (const img of pd.images) {
                      const aImg = { url: img.url, styleId: 'astria', styleName: `🎯 ${family.name} (Exact)`, model: 'astria' }
                      allImages.push(aImg); send({ type: 'image', image: aImg })
                    }
                    break
                  }
                  attempts++
                }
              }
            } catch(e) { console.error('Astria error:', e) }
          }
        }

        await saveSessionMetadata(sessionFolder, { sessionId: sessionId || sessionFolder, petName: petName || petType || 'Unknown', petType: petType || 'dog', petDescription: petDesc, isMemory, imageCount: allImages.length, createdAt: sessionStart, styles: [...new Set(allImages.map((i: any) => i.styleName))], images: allImages, brief: brief || null, songTitle: brief?.song_title || null, sunoPrompt: brief?.suno_prompt_full || null })
        // Send song notification email to admin if brief has suno prompt
        if (brief?.suno_prompt_full && process.env.RESEND_API_KEY) {
          sendSongNotificationEmail({
            petName: petName || petType || 'Unknown',
            songTitle: brief.song_title || 'Custom Song',
            sunoPrompt: brief.suno_prompt_full,
            portraitTitle: brief.portrait_title || '',
            sessionFolder,
            firstImageUrl: allImages[0]?.url || '',
          }).catch((e: any) => console.error('Song notification email failed:', e))
        }

        send({ type: 'progress', value: 100, message: 'All portraits ready!' })
        send({ type: 'done', images: allImages, sessionFolder, counts: {
          gpt: allImages.filter(x => x.model === 'gpt').length,
          astria: allImages.filter(x => x.model === 'astria').length,
          total: allImages.length,
        }})
        controller.close()

      } catch (err) {
        console.error('Pipeline error:', err)
        send({ type: 'error', message: 'Generation failed. Please try again.' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  })
}


async function sendSongNotificationEmail({ petName, songTitle, sunoPrompt, portraitTitle, sessionFolder, firstImageUrl }: {
  petName: string; songTitle: string; sunoPrompt: string; portraitTitle: string; sessionFolder: string; firstImageUrl: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'johnagreuling@icloud.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.petprintsstudio.com'
  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:40px 24px"><div style="background:#141414;border:1px solid rgba(201,168,76,.3);padding:32px;margin-bottom:20px"><div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">New Song Request — Action Required</div><h1 style="font-size:28px;font-weight:400;color:#F5F0E8;margin:0 0 8px">🎵 ${petName}</h1><p style="color:rgba(245,240,232,.5);font-size:14px;margin:0 0 24px">${portraitTitle}</p><div style="background:#0A0A0A;border:1px solid rgba(245,240,232,.08);padding:16px;margin-bottom:16px"><div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Song Title</div><div style="font-size:16px;font-weight:600">${songTitle}</div></div><div style="background:#0A0A0A;border:2px solid rgba(201,168,76,.4);padding:16px;margin-bottom:24px"><div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Suno Prompt — Copy this into suno.com/create</div><div style="font-size:14px;line-height:1.8;color:rgba(245,240,232,.9);white-space:pre-wrap">${sunoPrompt}</div></div><a href="${appUrl}/admin/songs" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none">→ Open Song Admin to paste MP3 URL</a></div><div style="font-size:11px;color:rgba(245,240,232,.2);text-align:center">Session: ${sessionFolder}</div></div></body></html>`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Pet Prints Studio <orders@petprintsstudio.com>', to: adminEmail, subject: `🎵 New Song Request — ${petName}: "${songTitle}"`, html })
  })
}
