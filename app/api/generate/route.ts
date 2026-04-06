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
//  SUBJECT IDENTITY BLOCK — injected into every prompt
//  GPT Vision generates the petDesc from the actual photo.
//  This is what prevents random dogs.
// ════════════════════════════════════════════════════════════════
function identityBlock(petDesc: string): string {
  return `Create a premium fine-art painted portrait of the exact animal shown in the input images.

SUBJECT IDENTITY
Preserve the exact identity of the animal from the input photo:
- ${petDesc}
- exact breed appearance
- exact face shape and facial proportions
- exact muzzle shape
- exact ear shape and ear set
- exact eye color and expression
- exact nose shape
- exact coat color
- exact markings and marking placement
- exact fur length and texture
- exact body proportions
- preserve the recognizable expression and personality
Do not change the animal into a different breed, do not invent new markings, and do not alter age, body type, or expression.`
}

const CONSTRAINTS = `
CONSTRAINTS
- no text
- no watermark
- no extra animals
- no extra limbs
- no distorted anatomy
- not photorealistic photography
- not cartoon styling
- not anime styling
- not flat vector art`

// ════════════════════════════════════════════════════════════════
//  8 STYLE FAMILIES
//  Each is a separate batch of /images/edits calls.
//  Styles are defined by visual characteristics — not private names.
//  "Ethereal Painterly" = Nissa. "Bold Contemporary" = Lea.
//  The API doesn't know these labels so we describe them fully.
// ════════════════════════════════════════════════════════════════

const STYLE_FAMILIES = [
  {
    id: 'ethereal',
    name: '🎨 Ethereal Painterly',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render in a soft, ethereal, dreamlike painterly style. The painting should feel emotional, graceful, atmospheric, and handmade. Use muted but expressive colors, painterly texture, and a refined balance of realism and abstraction. Include visible brushwork, layered paint texture, soft transitions, and slight imperfections that make it feel like a true hand-painted artwork.

COMPOSITION
The animal should be the clear focal point. Use a gentle, elegant composition with a softly abstracted background. Background may include symbolic natural elements such as flowers, petals, birds, deer-like silhouettes, branches, or subtle organic forms, but they must remain secondary to the subject.

PAINT SURFACE
Rich painterly brush texture. Slight imperfections from real paint. Soft edges in background, more definition in eyes and muzzle. Layered strokes. Premium fine-art portrait finish.

BACKGROUND
Atmospheric, understated, poetic environment. Softly abstracted florals and natural shapes. Muted tones supporting the dog without competing.

EMOTIONAL TONE
Tender, soulful, poetic, and timeless. The final piece should look like a premium gallery portrait with painterly texture and depth, not glossy digital illustration.
${CONSTRAINTS}
- not smooth airbrushed digital rendering
- not harsh graphic design elements`,
  },
  {
    id: 'bold_contemporary',
    name: '✨ Bold Contemporary',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render as a bold, vibrant, contemporary surrealist painting with a luxurious gallery-worthy feel. Use dramatic contrast, rich jewel tones, visible brushwork, and lush painted texture. The image should feel visually striking, premium, imaginative, and emotionally powerful.

CONTEMPORARY ELEMENTS
Incorporate some combination of:
- jewel-toned color relationships (deep sapphire, emerald, ruby, rich gold)
- dramatic abstract clouds or atmospheric elements
- oversized florals or petals
- crystalline or gem-like accents
- tropical fruit motifs
- surreal still-life energy
- bold contemporary composition
- luminous highlights against darker, richer fields

COMPOSITION
The animal must remain the clear focal point and highly recognizable. Keep strong detail in the eyes, muzzle, and major markings while letting the background and surrounding elements become more expressive and painterly.

PAINT SURFACE
Heavy impasto texture. Visible directional brushstrokes. Rich highlights that catch light. Deep dramatic shadows with luminous midtones.

EMOTIONAL TONE
Luxurious, elevated, modern, and collectible. Like a statement piece in a contemporary gallery. Must look hand-painted.
${CONSTRAINTS}
- not low-detail fur
- not generic digital painting
- not stock-art look`,
  },
  {
    id: 'classical_oil',
    name: '🖼️ Classical Oil Portrait',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render in the style of a traditional hand-painted classical oil portrait with timeless elegance. Use rich oil-paint texture, subtle glazing, layered brushwork, and realistic but painterly detail. The composition should feel formal, elevated, and heirloom-quality.

COMPOSITION
Dignified portrait composition with the animal as the dominant focal point. Natural posture, refined museum-quality framing. Subtle depth and atmospheric perspective.

PAINT SURFACE
Rich oil-paint materiality. Subtle glazing layers visible. Warm golden undertones. Smooth transitions with visible brushwork in the fur. Premium painted finish.

BACKGROUND
Understated and elegant — a dark painterly studio background, softly blended neutral backdrop, or refined atmospheric setting that supports the subject without distraction.

EMOTIONAL TONE
Warm, sophisticated, and museum-worthy. Prioritize lifelike eyes, believable fur structure, and premium painted materiality. Should look like a commissioned portrait meant for framing and display.
${CONSTRAINTS}
- not loose abstract distortion
- not modern graphic elements`,
  },
  {
    id: 'watercolor',
    name: '💧 Watercolor Fine Art',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render as a hand-painted watercolor artwork with elegant pigment flow, transparent washes, soft layering, and natural paper texture. The portrait should feel light, graceful, emotional, and refined.

TECHNIQUE
Delicate edges in background areas, more defined brush detail around the eyes, nose, and key facial features. Allow the background to have soft watercolor blooms, controlled color diffusion. Transparent layered washes, not opaque gouache.

COMPOSITION
The animal should remain highly recognizable and central. Light flows from above or one side. Clean fine-art presentation with airy open space.

PAINT SURFACE
Visible paper texture in the lightest areas. Wet-on-wet soft blooms in background. Transparent layers for depth. More defined brushwork only on eyes and muzzle.

BACKGROUND
Soft and airy with subtle watercolor blooms. Tasteful color harmony — warm ivory, blush, sky blue. Minimal to let the dog breathe.

EMOTIONAL TONE
Light, graceful, emotional, and refined. Premium and frame-worthy, not childish or decorative.
${CONSTRAINTS}
- not heavy digital effects
- not overly saturated poster colors
- not hard vector edges`,
  },
  {
    id: 'charcoal',
    name: '✏️ Charcoal & Graphite',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render as a hand-drawn fine-art sketch using charcoal and graphite on high-quality textured paper. The piece should feel elegant, realistic, expressive, and handcrafted. Use strong control of line, shading, tonal depth, and subtle texture. The eyes should be especially compelling and detailed.

TECHNIQUE
Fine hatching and cross-hatching for fur and shadow. Varying line weight — heavy for outline, fine for individual fur strands. Smooth tonal gradients in shadow areas. Crisp detail on eyes, nose, whiskers. Soft blended fur texture in lighter areas.

COMPOSITION
Classic commissioned-art feel. Clean centered portrait. Minimal background — soft paper texture, faint tonal atmosphere, or very light sketch indications. Focus remains entirely on the animal.

TONAL RANGE
Rich dark graphite to near-white highlights. Strong contrast. Believable fur rendering. Authentic drawn quality throughout.

EMOTIONAL TONE
Elegant, realistic, expressive, and handcrafted. Professional gallery sketch quality, not a rough doodle.
${CONSTRAINTS}
- not color painting effects
- not digital vector look
- not exaggerated line art
- not comic-book style`,
  },
  {
    id: 'impressionist',
    name: '🌸 Impressionist Painterly',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render as a richly painterly impressionist artwork with visible brushstrokes, lively color variation, broken color texture, and atmospheric light. The image should feel vibrant, artistic, and emotionally warm while still preserving the animal's clear likeness.

TECHNIQUE
Expressive and painterly brushwork. More definition in the animal's face and softer interpretation in the rest of the piece. Broken color — adjacent strokes of different hues that blend optically. Dappled light effects.

COMPOSITION
Strong focal center on the animal. Natural posture. Elegant but energetic composition.

PAINT SURFACE
Visible impasto brushstrokes. Lively color variation in fur and background. Atmospheric light suggesting time of day. Premium painted quality.

BACKGROUND
Natural or softly abstract environment with impressionist color movement and elegant light. Garden, landscape, or atmospheric setting.

EMOTIONAL TONE
Vibrant, artistic, and emotionally warm. Sophisticated and collectible. High-end painted portrait inspired by impressionist technique, not a loose generic filter effect.
${CONSTRAINTS}
- not flat or simplified shapes
- not heavy digital smoothness`,
  },
  {
    id: 'pastel',
    name: '🕊️ Soft Pastel Portrait',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render as a hand-made fine-art pastel portrait on textured paper. Use soft blending, velvety color transitions, subtle layering, and a luminous surface quality. The portrait should feel elegant, warm, emotional, and refined.

TECHNIQUE
Soft blended pastel strokes. Velvety smooth transitions in the fur. The eyes, nose, and key facial contours more resolved and defined. Fur and background soften naturally into pastel texture. Luminous surface where light hits the coat.

COMPOSITION
The animal is the clear focal point. Gentle background treatment. Soft atmospheric color. Tasteful simplicity.

PAINT SURFACE
Velvety pastel texture throughout. Visible texture of the paper. Luminous quality in the lightest fur highlights. Soft edges everywhere except the focal facial features.

BACKGROUND
Gentle — soft atmospheric color washes, minimal detail. Supports the dog without competing.

EMOTIONAL TONE
Elegant, warm, emotional, and refined. True fine-art pastel commission suitable for luxury printing and framing.
${CONSTRAINTS}
- not flat graphic shapes
- not overly digital airbrushing`,
  },
  {
    id: 'editorial_acrylic',
    name: '🎭 Modern Editorial Acrylic',
    variations: 2,
    buildPrompt: (petDesc: string) => `${identityBlock(petDesc)}

STYLE
Render as a bold modern acrylic painting with a contemporary editorial sensibility. The image should feel sophisticated, current, visually arresting, and gallery-ready. Think high-end art publication cover — confident, graphic, beautiful, and painted.

TECHNIQUE
Confident acrylic strokes with graphic clarity. Strong compositional geometry. Bold color decisions. Painterly texture that shows the medium without being rough. More graphic structure than traditional fine art.

COMPOSITION
Strong, intentional composition. The animal commands the frame. Bold negative space or strong color field background. The pose and framing feel considered and editorial.

PAINT SURFACE
Smooth-to-textured acrylic depending on area. Precise in the subject, more expressive in the background. Flat color fields combined with textured brushwork. Premium painted finish.

BACKGROUND
Bold, intentional color — a strong single color field, graphic gradient, or minimal abstract mark-making that supports the editorial feel. Not atmospheric, not busy.

EMOTIONAL TONE
Confident, modern, striking, and collectible. This is the portrait you put on the wall because it makes a statement. Premium gallery quality with a contemporary edge.
${CONSTRAINTS}
- not watercolor softness
- not overly traditional feel
- not generic digital painting`,
  },
]

// ── Memory Portrait scenes (Tier 2) ──────────────────────────
const MEMORY_SCENES = [
  { id: 'mem_adventure',   name: '🚗 Adventure Scene'  },
  { id: 'mem_royal',       name: '👑 Royal Portrait'    },
  { id: 'mem_golden_hour', name: '🌅 Golden Hour'       },
  { id: 'mem_holiday',     name: '🎄 Holiday Scene'     },
  { id: 'mem_city',        name: '🏙️ City Portrait'    },
  { id: 'mem_perfect_day', name: '✨ Perfect Day'        },
]

function buildMemoryPrompt(answers: Record<string, string>, petDesc: string, sceneId: string): string {
  const name  = answers.petName || 'the pet'
  const place = answers.favPlace || answers.favOutdoorSpot || 'a beautiful setting'
  const mood  = answers.timeAndSeason || 'golden hour'
  const extras = [
    answers.favCar   && `posed with or in a ${answers.favCar}`,
    answers.favTeam  && `wearing a ${answers.favTeam} collar or bandana`,
    answers.favToy   && `holding a ${answers.favToy}`,
    answers.favFood  && `with ${answers.favFood} visible in the scene`,
  ].filter(Boolean).join(', ')

  const base = `${identityBlock(petDesc)}
${extras ? `\nPERSONAL DETAILS TO INCLUDE\n${extras}\n` : ''}
STYLE
Fine art oil painting, gallery quality. Mood: ${mood}. Painterly texture and premium painted finish.
`
  switch (sceneId) {
    case 'mem_adventure':
      return base + `\nSCENE\n${name} adventuring at ${place}. Cinematic outdoor landscape. Warm light. Sense of freedom and joy.${CONSTRAINTS}`
    case 'mem_royal':
      return base + `\nSCENE\n${name} as royalty — ornate gold frame implied, velvet drapes, jeweled collar, regal and commanding pose. Old Masters oil technique.${CONSTRAINTS}`
    case 'mem_golden_hour':
      return base + `\nSCENE\n${name} at ${place} during golden hour. Warm amber and gold light catching the fur. Impressionist atmosphere.${CONSTRAINTS}`
    case 'mem_holiday':
      return base + `\nSCENE\n${name} in a cozy holiday setting — fireplace glow, decorated Christmas tree, warm candlelight. Intimate and warm.${CONSTRAINTS}`
    case 'mem_city':
      return base + `\nSCENE\n${name} in ${place || 'a vibrant city'} at dusk. City lights bokeh background. Contemporary fine art energy.${CONSTRAINTS}`
    case 'mem_perfect_day':
      return answers.perfectDay
        ? base + `\nSCENE\n${answers.perfectDay}\nPainterly fine art style, emotionally resonant.${CONSTRAINTS}`
        : base + `\nSCENE\n${name}'s perfect day at ${place}. Joyful, painterly, warm light.${CONSTRAINTS}`
    default:
      return base + `\nSCENE\nFine art portrait of ${name}, gallery quality, warm light.${CONSTRAINTS}`
  }
}

export async function POST(req: NextRequest) {
  const { imageUrl, isMemory, answers, petType, petName } = await req.json()

  // Presigned GET URL so Vercel can fetch the R2 image
  const r2PublicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || ''
  const imageKey = imageUrl.startsWith(r2PublicBase)
    ? imageUrl.slice(r2PublicBase.length + 1)
    : imageUrl.split('/uploads/').pop() ? `uploads/${imageUrl.split('/uploads/').pop()}` : null

  let accessibleUrl = imageUrl
  if (imageKey) {
    try {
      accessibleUrl = await getSignedUrl(r2, new GetObjectCommand({
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

        // ── Step 1: Fetch pet image buffer ──────────────────────
        let petBuf: Buffer | null = null
        try {
          const r = await fetch(accessibleUrl, {
            headers: { 'User-Agent': 'PetPrintsStudio/1.0' },
            signal: AbortSignal.timeout(30000),
          })
          if (r.ok) {
            petBuf = Buffer.from(await r.arrayBuffer())
            console.log('Pet image fetched, size:', petBuf.length)
          } else {
            console.error('Pet image fetch failed:', r.status)
          }
        } catch(e) { console.error('Fetch error:', e) }

        // ── Step 2: GPT-4o-mini Vision — describe the exact pet ─
        // The API does not know what Mason looks like from the name alone.
        // This description is injected into SUBJECT IDENTITY in every prompt.
        // It is the single most important thing for identity preservation.
        let petDesc = `a ${petType || 'dog'} named ${petName || 'the pet'}`
        try {
          const vr = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              max_tokens: 150,
              messages: [{
                role: 'user',
                content: [
                  { type: 'image_url', image_url: { url: accessibleUrl, detail: 'low' } },
                  { type: 'text', text: 'Describe this dog precisely for a fine art painter. One sentence. Include: exact breed or mix, coat color and texture, any distinctive markings, face shape, ear type, eye color, visible accessories (collar, harness, tags). Be specific and visual. Start with the breed.' }
                ]
              }]
            })
          })
          if (vr.ok) {
            const vd = await vr.json()
            const d = vd.choices?.[0]?.message?.content?.trim()
            if (d && d.length > 10) { petDesc = d; console.log('Vision desc:', petDesc) }
          }
        } catch(e) { console.error('Vision failed:', e) }

        send({ type: 'progress', value: 12, message: 'Creating your portraits...' })

        if (!isMemory) {
          // ════════════════════════════════════════════════════
          //  TIER 1: STYLE TRANSFER — 8 style families
          //
          //  Per OpenAI best practices:
          //  - Separate batches per style family (never mix styles)
          //  - /images/edits + input_fidelity: "high"
          //  - quality: "medium" for this selection pass
          //  - structured prompts: identity → style → composition
          //    → surface → background → constraints
          //  - 2 variations per style = 16 total portraits
          // ════════════════════════════════════════════════════

          const total = STYLE_FAMILIES.reduce((s, f) => s + f.variations, 0)
          let done = 0

          for (const family of STYLE_FAMILIES) {
            const prompt = family.buildPrompt(petDesc)
            console.log(`[${family.name}] prompt length: ${prompt.length} chars`)

            const tasks = Array.from({ length: family.variations }, (_, v) => async () => {
              try {
                if (!petBuf) { console.error(`No image buffer for ${family.name}`); done++; return }

                const fd = new FormData()
                fd.append('model', 'gpt-image-1.5')
                fd.append('prompt', prompt)
                fd.append('n', '1')
                fd.append('size', '1024x1024')
                fd.append('quality', 'medium')       // Selection pass — fast + cheap
                fd.append('input_fidelity', 'high')  // Lock subject identity
                fd.append('image[]', new Blob([petBuf as unknown as BlobPart], { type: 'image/jpeg' }), 'pet.jpg')

                const res = await fetch('https://api.openai.com/v1/images/edits', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
                  body: fd,
                })

                if (res.ok) {
                  const d = await res.json()
                  const b64 = d.data?.[0]?.b64_json
                  if (b64) {
                    const imgUrl = await uploadB64ToR2(b64)
                    const img = { url: imgUrl, styleId: `${family.id}_${v}`, styleName: family.name, model: 'gpt' }
                    allImages.push(img)
                    send({ type: 'image', image: img })
                  }
                } else {
                  const t = await res.text()
                  console.error(`Edit error [${family.name} v${v}]:`, res.status, t.slice(0, 400))
                }

                done++
                const pct = 12 + Math.round((done / total) * 80)
                send({ type: 'progress', value: Math.min(pct, 92), message: `${allImages.length} of ${total} portraits ready...` })

              } catch(e) { console.error(`Task error [${family.name} v${v}]:`, e); done++ }
            })

            // All variations of one family run in parallel.
            // Families run sequentially to keep style lanes clean.
            await Promise.all(tasks.map(t => t()))
          }

        } else {
          // ════════════════════════════════════════════════════
          //  TIER 2: MEMORY PORTRAIT
          //  Custom scenes from questionnaire answers
          //  Still uses /images/edits + input_fidelity: high
          // ════════════════════════════════════════════════════
          const memTasks = MEMORY_SCENES.flatMap(scene =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                const prompt = buildMemoryPrompt(answers || {}, petDesc, scene.id)
                const fd = new FormData()
                fd.append('model', 'gpt-image-1.5')
                fd.append('prompt', prompt)
                fd.append('n', '1')
                fd.append('size', '1024x1024')
                fd.append('quality', 'medium')
                fd.append('input_fidelity', 'high')
                if (petBuf) fd.append('image[]', new Blob([petBuf as unknown as BlobPart], { type: 'image/jpeg' }), 'pet.jpg')

                const res = await fetch('https://api.openai.com/v1/images/edits', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
                  body: fd,
                })
                if (res.ok) {
                  const d = await res.json()
                  const b64 = d.data?.[0]?.b64_json
                  if (b64) {
                    const img = { url: await uploadB64ToR2(b64), styleId: `${scene.id}_${v}`, styleName: scene.name, model: 'gpt' }
                    allImages.push(img); send({ type: 'image', image: img })
                  }
                } else {
                  const t = await res.text()
                  console.error(`Memory error [${scene.name} v${v}]:`, res.status, t.slice(0, 200))
                }
              } catch(e) { console.error('Memory task error:', e) }
            })
          )

          send({ type: 'progress', value: 15, message: 'Creating your memory scenes...' })
          for (let i = 0; i < memTasks.length; i += 3) {
            await Promise.all(memTasks.slice(i, i + 3).map(t => t()))
            send({ type: 'progress', value: 15 + Math.round(((i + 3) / memTasks.length) * 78), message: `${allImages.length} memory portraits ready...` })
          }
        }

        // ── Astria LoRA (when configured) ─────────────────────
        if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
          send({ type: 'progress', value: 93, message: 'Generating exact likeness portraits...' })
          for (const aPrompt of [
            `portrait of sks ${petType||'dog'}, fine art oil painting, ${petDesc}`,
            `sks ${petType||'dog'} golden hour, painterly, ${petDesc}`,
          ]) {
            try {
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
                      const ai = { url: img.url, styleId: 'astria', styleName: '🎯 Exact Likeness', model: 'astria' }
                      allImages.push(ai); send({ type: 'image', image: ai })
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
          fal: 0,
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
