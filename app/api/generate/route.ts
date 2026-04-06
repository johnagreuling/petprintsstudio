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

async function uploadB64ToR2(b64: string, ext = 'png'): Promise<string> {
  const key = `generated/${uuidv4()}.${ext}`
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
      `Repaint as a soft ethereal oil painting. Dreamlike atmosphere, visible brushwork, muted botanical background, warm muted palette. Keep the dog's exact face, fur color, markings, eyes, ears, and accessories completely unchanged. Fine art portrait.`,

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
      `Repaint as a bold contemporary fine art oil painting. Jewel-toned palette, thick impasto, dramatic dark botanical background, luxury gallery feel. Keep the dog's exact face, fur color, markings, eyes, ears, and accessories completely unchanged.`,

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
      `Repaint as a classical Old Masters oil portrait. Rembrandt chiaroscuro lighting, rich dark background, luminous highlights, museum-quality glazed oil. Keep the dog's exact face, fur color, markings, eyes, ears, and accessories completely unchanged.`,

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
      `Repaint as a transparent watercolor painting. Loose fluid washes, soft bleeding edges, visible paper texture, warm pastel palette. Keep the dog's exact face, fur color, markings, eyes, ears, and accessories completely unchanged.`,

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
      `Redraw as a fine charcoal and graphite portrait. Hatching, cross-hatching, strong tonal contrast, white paper background. Keep the dog's exact face, fur texture, markings, eyes, ears, and accessories completely unchanged.`,

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
      `Repaint as an impressionist oil painting. Monet style, loose short brushstrokes, dappled garden light, vibrant color dabs side-by-side. Keep the dog's exact face, fur color, markings, eyes, ears, and accessories completely unchanged.`,

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
      `Repaint as a soft chalk pastel portrait. Velvety matte surface, chalky fur texture, warm creamy palette, toned paper background. Keep the dog's exact face, fur color, markings, eyes, ears, and accessories completely unchanged.`,

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
      `Repaint as a bold modern acrylic painting. High contrast, confident loose brushwork, editorial energy, strong graphic background. Keep the dog's exact face, fur color, markings, eyes, ears, and accessories completely unchanged.`,

    astriaPrompt: (petType) =>
      `portrait of sks ${petType}, bold modern acrylic painting, high contrast, confident loose brushwork, editorial graphic energy`,
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
  const { imageUrl, isMemory, answers, petType, petName } = await req.json()

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

          const total = STYLE_FAMILIES.length * 2 // 1 GPT + 1 FLUX per style
          let done = 0

          const allTasks = STYLE_FAMILIES.flatMap(family => [
            // GPT Image 1.5 — structured long prompt
            async () => {
              try {
                if (!petImageBuffer) { console.error('No buffer for GPT'); done++; return }
                const fd = new FormData()
                fd.append('model', 'gpt-image-1.5')
                fd.append('prompt', family.gptPrompt(petDesc))
                fd.append('n', '1')
                fd.append('size', '1024x1024')
                fd.append('quality', 'medium')
                fd.append('input_fidelity', 'high')
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
                    const url = await uploadB64ToR2(b64)
                    const img = { url, styleId: `${family.id}_gpt`, styleName: `${family.emoji} ${family.name}`, model: 'gpt' }
                    allImages.push(img); send({ type: 'image', image: img })
                  }
                } else {
                  const t = await res.text()
                  console.error(`GPT error [${family.name}]:`, res.status, t.slice(0, 300))
                }
              } catch(e) { console.error(`GPT task error [${family.name}]:`, e) }
              done++
              send({ type: 'progress', value: Math.min(12 + Math.round((done/total)*78), 90), message: `${allImages.length} of ${total} portraits ready...` })
            },

            // FLUX Kontext — short imperative prompt per BFL best practices
            async () => {
              try {
                const falRes = await fetch('https://fal.run/fal-ai/flux-pro/kontext', {
                  method: 'POST',
                  headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    image_url: accessibleImageUrl,
                    prompt: family.fluxPrompt(petDesc),
                    guidance_scale: 3.0,   // BFL recommends 2.5-3.5
                    num_inference_steps: 28,
                    image_size: 'square_hd',
                    output_format: 'jpeg',
                    num_images: 1,
                  }),
                })
                if (falRes.ok) {
                  const d = await falRes.json()
                  const url = d.images?.[0]?.url
                  if (url) {
                    const img = { url, styleId: `${family.id}_fal`, styleName: `${family.emoji} ${family.name}`, model: 'fal' }
                    allImages.push(img); send({ type: 'image', image: img })
                  } else console.error(`FLUX no url [${family.name}]:`, JSON.stringify(d).slice(0,200))
                } else {
                  const t = await falRes.text()
                  console.error(`FLUX error [${family.name}]:`, falRes.status, t.slice(0, 200))
                }
              } catch(e) { console.error(`FLUX task error [${family.name}]:`, e) }
              done++
              send({ type: 'progress', value: Math.min(12 + Math.round((done/total)*78), 90), message: `${allImages.length} of ${total} portraits ready...` })
            },
          ])

          // Run all tasks in parallel — styles are independent
          await Promise.all(allTasks.map(t => t()))

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
                  fd.append('model', 'gpt-image-1.5')
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
                      const url = await uploadB64ToR2(b64)
                      allImages.push({ url, styleId: `${sceneId}_gpt`, styleName: sceneNames[sceneId] || sceneId, model: 'gpt' })
                      send({ type: 'image', image: allImages[allImages.length-1] })
                    }
                  } else console.error(`Memory GPT error [${sceneId}]:`, res.status, (await res.text()).slice(0,200))
                } catch(e) { console.error('Memory GPT task error:', e) }
              },
              // FLUX version
              async () => {
                try {
                  const sceneDesc = answers.favPlace || answers.favOutdoorSpot || 'a beautiful scene'
                  const fluxPrompt = `${family.fluxPrompt(petDesc)} Place the dog in a ${sceneNames[sceneId]?.replace(/[🚗👑🌅🎄🏙️✨]\s/,'')} setting at ${sceneDesc}.`
                  const falRes = await fetch('https://fal.run/fal-ai/flux-pro/kontext', {
                    method: 'POST',
                    headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_url: accessibleImageUrl, prompt: fluxPrompt, guidance_scale: 3.0, num_inference_steps: 28, image_size: 'square_hd', output_format: 'jpeg', num_images: 1 }),
                  })
                  if (falRes.ok) {
                    const d = await falRes.json()
                    const url = d.images?.[0]?.url
                    if (url) {
                      allImages.push({ url, styleId: `${sceneId}_fal`, styleName: sceneNames[sceneId] || sceneId, model: 'fal' })
                      send({ type: 'image', image: allImages[allImages.length-1] })
                    }
                  } else console.error(`Memory FLUX error [${sceneId}]:`, falRes.status, (await falRes.text()).slice(0,200))
                } catch(e) { console.error('Memory FLUX task error:', e) }
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

        send({ type: 'progress', value: 100, message: 'All portraits ready!' })
        send({ type: 'done', images: allImages, counts: {
          gpt: allImages.filter(x => x.model === 'gpt').length,
          fal: allImages.filter(x => x.model === 'fal').length,
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
