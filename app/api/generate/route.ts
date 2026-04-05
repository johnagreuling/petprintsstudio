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
//  PROMPT BUILDER — OpenAI recommended structure:
//  subject identity → style definition → composition →
//  paint handling → background → constraints
//
//  Key rules from OpenAI best practices:
//  - Do NOT use private style names like "Nissa" or "Lea"
//    The API doesn't know these labels. Define them visually.
//  - Every prompt gets the GPT Vision description of the
//    actual pet injected under SUBJECT IDENTITY
//  - Separate calls per style family (never mix Nissa + Lea)
//  - input_fidelity: "high" on every edit call
// ════════════════════════════════════════════════════════════════

function buildNissaPrompt(petDesc: string): string {
  return `Create a fine-art painted portrait of this exact dog.

SUBJECT IDENTITY
Preserve the exact dog from the input photo:
- ${petDesc}
- exact coat color and markings
- exact eye color and shape
- exact muzzle shape and proportions
- exact ear shape and placement
- exact facial proportions and breed appearance
- preserve any visible accessories (collar, harness, tags)
- do not invent different markings or change age or body type

STYLE
Render as a soft, ethereal fine-art oil painting:
- painterly texture blending realism with abstraction
- muted but expressive atmosphere
- visible hand-applied brushwork throughout
- emotionally warm and poetic feeling
- organic natural symbolism
- handmade oil-paint surface quality
- not glossy, not digital illustration, not cartoon, not photorealistic

COMPOSITION
- centered portrait, dog is clear focal point
- elegant gallery composition
- refined museum-quality framing
- natural relaxed posture
- subtle atmospheric depth

PAINT SURFACE
- rich layered brush texture with slight real-paint imperfections
- soft edges in background, more definition in eyes and muzzle
- premium fine-art portrait finish

BACKGROUND
- atmospheric, understated, poetic environment
- softly abstracted florals and natural organic shapes
- muted tones that support and frame the dog without competing

CONSTRAINTS
- no text, no watermark, no extra animals, no duplicate limbs
- no distorted anatomy, not photorealistic, not graphic design, not anime`
}

function buildLeaPrompt(petDesc: string): string {
  return `Create a bold fine-art painted portrait of this exact dog.

SUBJECT IDENTITY
Preserve the exact dog from the input photo:
- ${petDesc}
- exact coat color and markings
- exact eye color and shape
- exact muzzle shape and proportions
- exact ear shape and placement
- exact facial proportions and breed appearance
- preserve any visible accessories (collar, harness, tags)
- do not invent different markings or change age or body type

STYLE
Render as bold contemporary fine-art oil painting:
- thick impasto oil paint, heavy textured brushstrokes
- vibrant contemporary surrealism with luxury still-life energy
- jewel-toned palette: deep sapphire, emerald, ruby, rich gold
- sharp contrast between subject and environment
- hyper-detailed gemstone-like accents on accessories
- premium gallery-wall statement piece
- visible painted texture, not vector art, not illustration

COMPOSITION
- centered portrait, dog is commanding focal point
- bold dramatic composition
- dog exudes confidence and presence
- surreal scale welcome — dog larger than environment

PAINT SURFACE
- thick impasto texture, visible directional strokes
- rich highlights that catch light like gemstones
- deep dramatic shadows with luminous midtones
- premium fine-art canvas finish

BACKGROUND
- dramatic oversized florals, lush botanicals, or rich dark velvet
- surreal props or symbolic objects that create narrative
- jewel tones throughout — nothing muted or pastel

CONSTRAINTS
- no text, no watermark, no extra animals, no duplicate limbs
- no distorted anatomy, not watercolor, not sketch, not minimalist, not anime`
}

function buildWatercolorPrompt(petDesc: string): string {
  return `Create a watercolor painting portrait of this exact dog.

SUBJECT IDENTITY
Preserve the exact dog from the input photo:
- ${petDesc}
- exact coat color and markings
- exact eye color and shape
- exact muzzle and ear shape
- preserve all visible accessories

STYLE
Transparent watercolor on cold-press paper:
- loose fluid brushwork with soft bleeding edges
- luminous transparent washes layered for depth
- visible paper texture in the lightest areas
- soft halo effect around fur edges
- delicate and luminous overall feeling

COMPOSITION
- centered portrait with airy open composition
- dog is focal point with soft vignette edges
- light flows from above or one side

PAINT SURFACE
- transparent layered washes, not opaque
- wet-on-wet soft blooms in background
- more defined brushwork only on eyes and muzzle

BACKGROUND
- very loose abstract washes, soft pastel suggestion of environment
- warm ivory, blush, sky blue palette
- minimal — lets the dog breathe

CONSTRAINTS
- no text, no watermark, no extra animals
- not digital art, not oil paint texture, not harsh outlines`
}

function buildPencilPrompt(petDesc: string): string {
  return `Create a detailed fine pencil sketch portrait of this exact dog.

SUBJECT IDENTITY
Preserve the exact dog from the input photo:
- ${petDesc}
- exact coat color rendered in graphite tones
- exact eye shape and expression
- exact muzzle and ear shape
- exact fur texture and volume
- preserve all visible accessories

STYLE
Graphite pencil on white paper:
- fine hatching and cross-hatching for fur and shadow
- varying line weight — heavy for outline, fine for fur texture
- individual pencil strokes suggesting fur direction
- classical portrait tradition, elegant and intimate

COMPOSITION
- centered three-quarter or front-facing portrait
- clean white background with minimal gestural strokes suggesting space
- strong tonal range from near-white to deep graphite

PENCIL SURFACE
- visible individual pencil marks throughout
- smooth tonal gradients in shadows
- crisp detail on eyes, nose, whiskers
- soft blended fur texture in lighter areas

BACKGROUND
- minimal — clean white with only very light gestural marks
- focus stays entirely on the dog

CONSTRAINTS
- no color, no ink wash, no digital art, no cartoon
- not photographic, not illustration`
}

// ── Memory Portrait scenes ────────────────────────────────────
function buildMemoryPrompt(answers: Record<string, string>, petDesc: string, sceneId: string): string {
  const name  = answers.petName || 'the pet'
  const place = answers.favPlace || answers.favOutdoorSpot || 'a beautiful setting'
  const mood  = answers.timeAndSeason || 'golden hour'
  const extras = [
    answers.favCar   ? `posed with or in a ${answers.favCar}` : '',
    answers.favTeam  ? `wearing a ${answers.favTeam} collar or bandana` : '',
    answers.favToy   ? `holding a ${answers.favToy}` : '',
    answers.favFood  ? `with ${answers.favFood} visible` : '',
  ].filter(Boolean).join(', ')

  const identity = `Create a fine-art painted portrait of this exact dog.

SUBJECT IDENTITY
Preserve the exact dog from the input photo:
- ${petDesc}
- exact coat color and markings, exact eye color, exact muzzle and ear shape
- preserve all visible accessories
- do not change the dog's appearance${extras ? `\n- Personal details to include: ${extras}` : ''}

STYLE
Fine art oil painting, gallery quality, painterly brushwork, emotionally resonant.
Mood: ${mood}.

`

  switch (sceneId) {
    case 'mem_adventure':
      return identity + `SCENE\nAdventure portrait: ${name} at ${place}. Cinematic outdoor landscape, natural light, sense of freedom and joy. Warm painterly atmosphere.`
    case 'mem_royal':
      return identity + `SCENE\nRegal oil portrait: ${name} as royalty. Ornate gold-leaf frame implied, velvet drapes, jeweled collar, commanding pose. Old Masters oil technique.`
    case 'mem_golden_hour':
      return identity + `SCENE\nGolden hour portrait: ${name} at ${place}. Warm amber and gold light catching the fur, impressionist atmosphere, emotionally beautiful.`
    case 'mem_holiday':
      return identity + `SCENE\nHoliday scene: ${name} in a cozy festive setting — fireplace glow, decorated tree, warm candlelight. Fine art oil, intimate and warm.`
    case 'mem_city':
      return identity + `SCENE\nUrban portrait: ${name} in ${place || 'a vibrant city'} at dusk. City lights bokeh background, contemporary fine art energy, confident and stylish.`
    case 'mem_perfect_day':
      return answers.perfectDay
        ? identity + `SCENE\n${answers.perfectDay}. Fine art painterly style, emotionally resonant, gallery quality.`
        : identity + `SCENE\n${name}'s perfect day at ${place}. Joyful, painterly, warm light, gallery quality.`
    default:
      return identity + `SCENE\nFine art painterly portrait of ${name}, gallery quality, warm light.`
  }
}

export async function POST(req: NextRequest) {
  const { imageUrl, isMemory, answers, petType, petName } = await req.json()

  // Presigned GET URL so Vercel server can fetch the R2 image
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

        // ── Step 1: Fetch pet image buffer ──────────────────────
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

        // ── Step 2: GPT-4o-mini Vision — get exact pet description ─
        // The API doesn't know what the dog looks like from a name.
        // This description is injected into EVERY prompt under
        // SUBJECT IDENTITY — the single most important fix.
        let petDesc = `a ${petType || 'dog'} named ${petName || 'the pet'}`
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
                  { type: 'text', text: 'Describe this dog precisely for a fine art painter. One sentence. Cover: exact breed or mix, coat color and texture (e.g. curly golden fur), any distinctive markings, face shape, ear type, eye color, visible accessories. Be specific. Start with the breed.' }
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
          // ══════════════════════════════════════════════════════
          //  TIER 1: STYLE TRANSFER
          //
          //  4 style families, each run as a separate batch:
          //    • Nissa (4 variants, medium quality)
          //    • Lea   (4 variants, medium quality)
          //    • Watercolor (2 variants, medium quality)
          //    • Pencil Sketch (2 variants, medium quality)
          //
          //  All use /images/edits with:
          //    • pet photo as image[]
          //    • input_fidelity: "high"
          //    • quality: "medium" (fast, cheap — good for selection)
          //
          //  Per OpenAI best practice:
          //    • Separate calls per style family (never mix Nissa + Lea)
          //    • subject identity → style → composition → surface →
          //      background → constraints
          // ══════════════════════════════════════════════════════

          const styleFamilies = [
            { id: 'nissa',     name: '🎨 Fine Art — Painterly',        prompt: buildNissaPrompt(petDesc),     count: 4 },
            { id: 'lea',       name: '✨ Fine Art — Bold Contemporary', prompt: buildLeaPrompt(petDesc),       count: 4 },
            { id: 'watercolor',name: '💧 Watercolor',                   prompt: buildWatercolorPrompt(petDesc),count: 2 },
            { id: 'pencil',    name: '✏️ Pencil Sketch',               prompt: buildPencilPrompt(petDesc),    count: 2 },
          ]

          const total = styleFamilies.reduce((s, f) => s + f.count, 0)
          let done = 0

          for (const family of styleFamilies) {
            console.log(`[${family.name}] running ${family.count} variants`)

            const tasks = Array.from({ length: family.count }, (_, v) => async () => {
              try {
                if (!petImageBuffer) {
                  console.error(`No pet image buffer for ${family.name}`)
                  return
                }

                const fd = new FormData()
                fd.append('model', 'gpt-image-1.5')
                fd.append('prompt', family.prompt)
                fd.append('n', '1')
                fd.append('size', '1024x1024')
                fd.append('quality', 'medium')       // Medium for selection pass
                fd.append('input_fidelity', 'high')  // Lock identity
                // Primary subject image — always first
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
                const pct = 12 + Math.round((done / total) * 78)
                send({ type: 'progress', value: Math.min(pct, 90), message: `${allImages.length} of ${total} portraits ready...` })

              } catch(e) { console.error(`Task error [${family.name} v${v}]:`, e) }
            })

            // Run all variants of this family in parallel
            // (separate family batches keep style lanes clean)
            await Promise.all(tasks.map(t => t()))
          }

        } else {
          // ══════════════════════════════════════════════════════
          //  TIER 2: MEMORY PORTRAIT
          //  Custom scenes from questionnaire answers
          //  Still uses /images/edits + input_fidelity: high
          // ══════════════════════════════════════════════════════
          const scenes = ['mem_adventure','mem_royal','mem_golden_hour','mem_holiday','mem_city','mem_perfect_day']
          const sceneNames: Record<string, string> = {
            mem_adventure:'🚗 Adventure Scene', mem_royal:'👑 Royal Portrait',
            mem_golden_hour:'🌅 Golden Hour', mem_holiday:'🎄 Holiday Scene',
            mem_city:'🏙️ City Portrait', mem_perfect_day:'✨ Perfect Day',
          }

          const memTasks = scenes.flatMap(sceneId =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                const prompt = buildMemoryPrompt(answers || {}, petDesc, sceneId)
                const fd = new FormData()
                fd.append('model', 'gpt-image-1.5')
                fd.append('prompt', prompt)
                fd.append('n', '1')
                fd.append('size', '1024x1024')
                fd.append('quality', 'medium')
                fd.append('input_fidelity', 'high')
                if (petImageBuffer) {
                  fd.append('image[]', new Blob([petImageBuffer as unknown as BlobPart], { type: 'image/jpeg' }), 'pet.jpg')
                }
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
                    const img = { url: imgUrl, styleId: `${sceneId}_${v}`, styleName: sceneNames[sceneId] || sceneId, model: 'gpt' }
                    allImages.push(img); send({ type: 'image', image: img })
                  }
                } else {
                  const t = await res.text()
                  console.error(`Memory error [${sceneId}]:`, res.status, t.slice(0, 200))
                }
              } catch(e) { console.error('Memory task error:', e) }
            })
          )

          send({ type: 'progress', value: 15, message: 'Creating memory scenes...' })
          for (let i = 0; i < memTasks.length; i += 3) {
            await Promise.all(memTasks.slice(i, i + 3).map(t => t()))
            send({ type: 'progress', value: 15 + Math.round(((i + 3) / memTasks.length) * 80), message: `${allImages.length} memory portraits ready...` })
          }
        }

        // ── Astria LoRA (when ASTRIA_TUNE_ID is configured) ────
        if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
          send({ type: 'progress', value: 92, message: 'Generating exact likeness portraits...' })
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
                    for (const img of pd.images) { allImages.push({ url: img.url, styleId: 'astria', styleName: '🎯 Exact Likeness', model: 'astria' }); send({ type: 'image', image: allImages[allImages.length-1] }) }
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
