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
    id: 'ethereal',
    name: 'Ethereal Painterly',
    emoji: '🎨',
    // GPT: full structured prompt — handles long form well
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Soft, ethereal, dreamlike oil and acrylic painting. Painterly texture blending realism with abstraction. Visible hand-applied brushwork. Emotionally warm and poetic. Organic natural symbolism. Handmade oil-paint feel. Not glossy, not digital illustration, not cartoon.

COMPOSITION
Centered portrait. Soft elegant gallery composition. Dog is clear focal point with subtle atmospheric depth.

PAINT SURFACE
Rich layered brush texture. Slight real-paint imperfections. Soft edges in background, more definition on eyes and muzzle. Premium fine-art finish.

BACKGROUND
Atmospheric, understated. Softly abstracted florals and organic natural shapes. Muted tones — ivory, sage, dusty rose, golden ochre.

${CONSTRAINTS_GPT}
- not smooth airbrushed rendering
- not harsh graphic design`,

    // FLUX: short imperative — 512 token limit, no structured sections
    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to a soft ethereal oil painting, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as dreamlike painterly atmosphere, visible hand-applied brushwork, muted botanical background in ivory and sage, soft edges, warm diffused light, premium gallery portrait finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, soft ethereal oil painting, dreamlike atmosphere, visible brushwork, botanical background, warm muted palette, fine art`,
  },

  {
    id: 'bold_contemporary',
    name: 'Bold Contemporary',
    emoji: '✨',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Bold contemporary fine-art oil painting. Thick impasto brushstrokes. Vibrant contemporary surrealism with luxury still-life energy. Jewel-toned palette — deep sapphire, emerald, ruby, rich gold. Sharp contrast. Hyper-detailed gemstone-like accents on accessories. Premium gallery-wall statement. Visible painted texture. Not vector art, not illustration.

COMPOSITION
Commanding centered portrait. Dog exudes confidence. Bold dramatic framing.

PAINT SURFACE
Thick impasto texture. Visible directional strokes. Rich highlights catching light like gemstones. Deep dramatic shadows.

BACKGROUND
Dramatic oversized florals, lush botanicals, or rich dark velvet. Jewel tones throughout.

${CONSTRAINTS_GPT}
- not watercolor
- not sketch
- not minimalist`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to a bold contemporary fine-art oil painting, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as thick impasto oil paint, jewel-toned palette of sapphire and emerald, surreal oversized floral backdrop, dramatic contrast lighting, gemstone-like highlights, premium gallery-wall finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, bold contemporary fine art oil painting, jewel tones, thick impasto, dark dramatic botanical background, gallery quality`,
  },

  {
    id: 'classical_oil',
    name: 'Classical Oil Portrait',
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
    name: 'Soft Pastel Portrait',
    emoji: '🕊️',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Soft chalk pastel portrait on toned paper. Velvety matte surface. Soft blended transitions. Chalky texture on fur. Gentle and romantic feeling. Warm and creamy color palette.

COMPOSITION
Soft centered portrait. Intimate and gentle framing.

PAINT SURFACE
Chalky pastel texture throughout. Soft blended strokes. Paper texture visible in lighter areas. Matte non-glossy finish.

BACKGROUND
Soft toned paper — warm beige or grey showing through. Loose pastel suggestion of environment.

${CONSTRAINTS_GPT}
- not oil paint
- not digital
- not cartoon`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to soft chalk pastel on warm toned paper, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as velvety matte chalky texture, soft blended transitions, warm toned paper showing through, creamy warm palette, paper grain visible, gentle intimate fine-art finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, soft chalk pastel portrait, velvety matte surface, chalky texture, warm creamy palette, toned paper`,
  },

  {
    id: 'editorial_acrylic',
    name: 'Modern Editorial Acrylic',
    emoji: '🎭',
    gptPrompt: (petDesc) => `${subjectIdentityBlock(petDesc)}

STYLE
Bold modern acrylic painting with editorial energy. High contrast. Confident loose brushwork. Contemporary art-magazine aesthetic. Expressive marks. Strong graphic composition. Neither fully abstract nor photorealistic — confidently painterly.

COMPOSITION
Bold centered portrait with strong graphic composition. Dog commands the frame.

PAINT SURFACE
Confident loose acrylic strokes. Some palette-knife marks. Areas of thick paint alongside thinner washes. Dynamic and energetic surface.

BACKGROUND
Bold graphic background — flat color field, geometric suggestion, or loose expressive marks in contrasting color.

${CONSTRAINTS_GPT}
- not illustrative
- not watercolor
- not pastel`,

    fluxPrompt: (petDesc) =>
      `A fine-art portrait of the dog from the reference image. Change the artistic style of this dog portrait to bold modern acrylic painting with editorial energy, while maintaining the same dog, pose, and composition. The dog stays exactly as photographed — same breed, coat color, markings, eyes, ears, and accessories. Render the style as confident loose acrylic strokes with palette-knife marks, high contrast, bold graphic background, thick and thin paint areas, contemporary art-magazine aesthetic, visually striking premium finish.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, bold modern acrylic painting, high contrast, confident loose brushwork, editorial graphic energy`,
  },


  {
    id: 'vintage_pop_art',
    name: 'Vintage Pop Art',
    emoji: '🎭',
    gptPrompt: (petDesc) => `Create a premium four-panel pop-art portrait grid of the exact animal shown in the input image.

SUBJECT IDENTITY
Preserve the exact animal from the input photo:
- ${petDesc}
- exact breed appearance and body proportions
- exact face shape and facial proportions
- exact muzzle shape, ear shape and ear set
- exact eye color and expression
- exact coat color, all markings, fur length and texture
- preserve any visible accessories

STYLE
Classic 1960s-inspired pop-art screenprint with luxury gallery-poster feel. A 2×2 grid, same portrait in all four panels, each with a different bold saturated palette: Panel 1 hot pink and yellow, Panel 2 cyan and red, Panel 3 lime green and blue, Panel 4 orange and purple. Strong color blocking, crisp graphic edges, simplified tonal shapes, high contrast, flat graphic background.

The pet must be highly recognizable in every panel. Eyes, nose, facial markings, and silhouette stay accurate and expressive. Final result should feel iconic, stylish, collectible, bright, and premium — like a high-end pop-art screenprint suitable for framing.

CONSTRAINTS
- no text or typography
- no watermark
- no extra animals
- not photorealistic
- not painterly or impressionistic`,

    fluxPrompt: (petDesc) =>
      `A four-panel 2x2 pop-art screenprint grid of the exact dog from the reference image. Keep the same dog in all four panels — same breed, face, markings, expression. Render in 1960s Warhol pop-art style: bold flat color blocking, crisp graphic edges, high contrast. Each panel a different saturated palette: hot pink/yellow, cyan/red, lime green/blue, orange/purple. Iconic, collectible, gallery-worthy.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, four-panel Warhol pop-art screenprint grid, bold flat colors, high contrast, 1960s graphic style, collectible`,
  },

  {
    id: 'vintage_poster_v2',
    name: 'Heritage Poster',
    emoji: '🏛️',
    gptPrompt: (petDesc) => `Create a premium vintage-style poster portrait of the exact animal shown in the input image.

SUBJECT IDENTITY
Preserve the exact animal from the input photo:
- ${petDesc}
- exact breed appearance and body proportions
- exact face shape, muzzle, ear shape and ear set
- exact eye color and expression
- exact coat color, all markings, fur pattern and length
- exact recognizable expression and personality
- preserve any visible accessories

STYLE
Premium vintage-style poster with a timeless, collectible, frame-worthy feel. Looks like a high-end retro print or classic advertisement poster — elegant composition, strong focal hierarchy, nostalgic visual charm.

Style direction: vintage poster design, retro illustrated portrait, aged print aesthetic, tasteful distressed paper texture, subtle faded ink character, no text included, balanced graphic composition, warm nostalgic palette, collectible wall-art feel.

COLOR PALETTE
Cream, tan, faded red, muted navy, forest green, dusty teal, golden ochre, warm brown, soft black. Stylish, timeless, slightly weathered but still clean and premium.

COMPOSITION
Pet is the clear focal point in a strong iconic pose. Background supports the poster look with simple vintage graphic shapes, soft ornamental framing, subtle sunburst or badge-like design elements, lightly textured retro backdrop. Elegant and uncluttered. Feels like a premium vintage travel poster, heritage advertisement, or classic collectible print.

CONSTRAINTS
- no text or typography
- no watermark
- no extra animals
- not photorealistic or glossy
- no modern neon colors`,

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
  const { imageUrl, isMemory, answers, petType, petName, sessionId, brief, imagePromptCore } = await req.json()

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
          const VARIANTS_PER_STYLE = 3
          const total = STYLE_FAMILIES.length * VARIANTS_PER_STYLE // 24
          let done = 0

          const allTasks = STYLE_FAMILIES.flatMap(family =>
            Array.from({ length: VARIANTS_PER_STYLE }, (_, v) => async () => {
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
