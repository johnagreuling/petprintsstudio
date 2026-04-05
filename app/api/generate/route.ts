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
//  STYLE FAMILIES
//
//  Per OpenAI best practices:
//  - Separate calls per style family (keeps style lane clean)
//  - /images/edits with input_fidelity: "high" to lock identity
//  - Structured prompts: medium → texture → mood → identity rule
//  - Each prompt describes WHAT the style IS visually, not just a name
//  - "Nissa" and "Lea" styles defined by their visual characteristics,
//    not by name (the API doesn't know those labels)
// ════════════════════════════════════════════════════════════════

const STYLE_FAMILIES = [
  {
    id: 'nissa',
    name: 'Fine Art — Painterly',
    emoji: '🎨',
    variations: 4,
    buildPrompt: (desc: string) =>
      `Fine art painterly portrait. Subject: ${desc}. ` +
      `Medium: oil and acrylic on canvas. ` +
      `Texture: visible hand-painted brushwork, imperfect surface, painterly blending of realism and soft abstraction. ` +
      `Atmosphere: soft, ethereal, dreamlike. Muted expressive background with loose botanical or natural elements. ` +
      `Mood: gentle, emotional, quiet dignity. ` +
      `Palette: warm muted tones — ivory, sage, dusty rose, golden ochre. ` +
      `Lighting: soft diffused natural light. ` +
      `Identity rule: preserve exact coat color, markings, eye color, muzzle shape, ear shape, and all accessories. ` +
      `Avoid: glossy digital rendering, vector art, anime, cartoon, photorealism.`,
  },
  {
    id: 'lea',
    name: 'Fine Art — Bold Contemporary',
    emoji: '✨',
    variations: 4,
    buildPrompt: (desc: string) =>
      `Bold contemporary fine art portrait. Subject: ${desc}. ` +
      `Medium: thick oil paint on canvas, heavy impasto. ` +
      `Style: vibrant contemporary surrealism, luxury still-life energy. ` +
      `Texture: heavy textured brushstrokes, hyper-detailed gemstone-like accents. ` +
      `Palette: jewel tones — deep sapphire, emerald, ruby, gold. Sharp contrast. ` +
      `Backdrop: dramatic oversized florals, lush botanicals, or rich dark velvet. ` +
      `Mood: bold, opulent, confident, gallery-wall statement. ` +
      `Lighting: dramatic directional light, rich shadows, gem-like highlights. ` +
      `Identity rule: preserve exact coat color, markings, eye color, muzzle shape, ear shape, and all accessories. ` +
      `Avoid: watercolor, sketch, minimalism, flat design, illustration.`,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    emoji: '💧',
    variations: 2,
    buildPrompt: (desc: string) =>
      `Watercolor painting portrait. Subject: ${desc}. ` +
      `Medium: transparent watercolor on cold-press paper. ` +
      `Texture: loose fluid brushwork, soft bleeding edges, luminous washes, visible paper texture in highlights. ` +
      `Palette: soft pastels — warm ivory, blush, sky blue, pale gold. ` +
      `Mood: delicate, luminous, peaceful. ` +
      `Lighting: soft airy natural light. ` +
      `Identity rule: preserve exact coat color, markings, eye color, muzzle, ear shape. ` +
      `Avoid: digital art, oil paint, harsh outlines, heavy shadows.`,
  },
  {
    id: 'pencil',
    name: 'Pencil Sketch',
    emoji: '✏️',
    variations: 2,
    buildPrompt: (desc: string) =>
      `Fine pencil sketch portrait. Subject: ${desc}. ` +
      `Medium: graphite pencil on white paper. ` +
      `Texture: fine hatching and cross-hatching, varying line weight, individual fur strokes. ` +
      `Background: clean white with minimal loose gestural strokes. ` +
      `Mood: classical, elegant, intimate. ` +
      `Lighting: soft even light with subtle tonal shading. ` +
      `Identity rule: preserve exact coat, markings, eye shape, muzzle, ears, accessories. ` +
      `Avoid: color, ink wash, digital, cartoon.`,
  },
]

// ── MEMORY SCENE STYLES (used for Memory Portrait tier) ──────────
const MEMORY_SCENE_STYLES = [
  { id: 'mem_adventure',   name: 'Adventure Scene',   emoji: '🚗' },
  { id: 'mem_royal',       name: 'Royal Portrait',    emoji: '👑' },
  { id: 'mem_golden_hour', name: 'Golden Hour',       emoji: '🌅' },
  { id: 'mem_holiday',     name: 'Holiday Scene',     emoji: '🎄' },
  { id: 'mem_city',        name: 'City Portrait',     emoji: '🏙️' },
  { id: 'mem_perfect_day', name: 'Perfect Day',       emoji: '✨' },
]

function buildMemoryScenePrompt(answers: Record<string, string>, desc: string, sceneId: string): string {
  const name  = answers.petName || 'the pet'
  const place = answers.favPlace || answers.favOutdoorSpot || 'a beautiful outdoor setting'
  const mood  = answers.timeAndSeason || 'golden hour'
  const extras = [
    answers.favCar   ? `posed with or in a ${answers.favCar}` : '',
    answers.favTeam  ? `wearing a ${answers.favTeam} collar or bandana` : '',
    answers.favToy   ? `holding a ${answers.favToy}` : '',
    answers.favFood  ? `with ${answers.favFood} visible in the scene` : '',
  ].filter(Boolean).join(', ')

  const base =
    `Fine art portrait painting. Subject: ${desc} named ${name}. ` +
    `Identity rule: preserve exact coat color, markings, eye color, muzzle, ears, accessories. ` +
    (extras ? `Personal details: ${extras}. ` : '') +
    `Mood: ${mood}. `

  switch (sceneId) {
    case 'mem_adventure':
      return base + `Scene: ${name} adventuring at ${place}. Cinematic landscape. Painterly oil style, warm light, gallery quality.`
    case 'mem_royal':
      return base + `Scene: ${name} as royalty — ornate gold frame, velvet drapes, regal pose. Old Masters oil technique, museum quality.`
    case 'mem_golden_hour':
      return base + `Scene: ${name} at ${place}, golden hour. Warm amber light, impressionist painterly style.`
    case 'mem_holiday':
      return base + `Scene: ${name} in a cozy holiday scene — fireplace, Christmas tree, warm candlelight. Fine art oil style.`
    case 'mem_city':
      return base + `Scene: ${name} in ${place || 'a vibrant city'} at dusk, city lights bokeh. Contemporary fine art.`
    case 'mem_perfect_day':
      return answers.perfectDay
        ? base + `Scene: ${answers.perfectDay}. Painterly fine art, emotionally resonant.`
        : base + `Scene: ${name}'s perfect day at ${place}. Painterly, joyful, gallery quality.`
    default:
      return base + `Painterly fine art portrait, gallery quality.`
  }
}

export async function POST(req: NextRequest) {
  const { imageUrl, isMemory, answers, petType, petName } = await req.json()

  // Generate presigned GET URL so the Vercel server can fetch the image
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

        // ── Step 1: Fetch pet image as buffer ───────────────────
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

        // ── Step 2: GPT-4o-mini Vision — describe the actual pet ─
        // The API doesn't know what Mason looks like unless we tell it.
        // This description gets injected into every single prompt.
        let petDescription = `${petType || 'dog'} named ${petName || 'the pet'}`
        try {
          const visionRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              max_tokens: 150,
              messages: [{
                role: 'user',
                content: [
                  { type: 'image_url', image_url: { url: accessibleImageUrl, detail: 'low' } },
                  { type: 'text', text: 'Describe this pet for a fine art painter. One precise sentence. Include: breed/mix, coat color and texture, distinctive markings, face shape, ear type, eye color, any visible accessories (collar, harness, tags). Be visual and specific. Start with the breed.' }
                ]
              }]
            })
          })
          if (visionRes.ok) {
            const vd = await visionRes.json()
            const desc = vd.choices?.[0]?.message?.content?.trim()
            if (desc && desc.length > 10) {
              petDescription = desc
              console.log('Vision description:', petDescription)
            }
          }
        } catch(e) { console.error('Vision failed:', e) }

        send({ type: 'progress', value: 12, message: 'Creating your portraits...' })

        if (!isMemory) {
          // ════════════════════════════════════════════════════
          //  TIER 1: STYLE TRANSFER
          //
          //  Uses /images/edits with input_fidelity: "high"
          //  Separate call per style family (keeps style lane clean)
          //  Each variation gets its own independent call
          // ════════════════════════════════════════════════════
          const totalVariations = STYLE_FAMILIES.reduce((s, f) => s + f.variations, 0)
          let completedCount = 0

          for (const family of STYLE_FAMILIES) {
            const prompt = family.buildPrompt(petDescription)
            console.log(`[${family.name}] prompt preview:`, prompt.slice(0, 150))

            const familyTasks = Array.from({ length: family.variations }, (_, v) => async () => {
              try {
                let b64: string | undefined

                if (petImageBuffer) {
                  const fd = new FormData()
                  fd.append('model', 'gpt-image-1.5')
                  fd.append('prompt', prompt)
                  fd.append('n', '1')
                  fd.append('size', '1024x1024')
                  fd.append('quality', 'high')
                  fd.append('input_fidelity', 'high')
                  fd.append('image[]', new Blob([petImageBuffer as unknown as BlobPart], { type: 'image/jpeg' }), 'pet.jpg')

                  const res = await fetch('https://api.openai.com/v1/images/edits', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
                    body: fd,
                  })
                  if (res.ok) {
                    const d = await res.json()
                    b64 = d.data?.[0]?.b64_json
                  } else {
                    const t = await res.text()
                    console.error(`Edit error [${family.name} v${v}]:`, res.status, t.slice(0, 300))
                  }
                }

                if (b64) {
                  const imgUrl = await uploadB64ToR2(b64)
                  const img = { url: imgUrl, styleId: `${family.id}_${v}`, styleName: `${family.emoji} ${family.name}`, model: 'gpt' }
                  allImages.push(img)
                  send({ type: 'image', image: img })
                }

                completedCount++
                const pct = 12 + Math.round((completedCount / totalVariations) * 78)
                send({ type: 'progress', value: Math.min(pct, 90), message: `${allImages.length} of ${totalVariations} portraits ready...` })

              } catch(e) { console.error(`Task error [${family.name} v${v}]:`, e) }
            })

            // All variations for this family run in parallel
            await Promise.all(familyTasks.map(t => t()))
          }

        } else {
          // ════════════════════════════════════════════════════
          //  TIER 2: MEMORY PORTRAIT
          //  Custom scenes from questionnaire answers
          //  Still uses /images/edits + pet image for identity
          // ════════════════════════════════════════════════════
          const sceneTasks = MEMORY_SCENE_STYLES.flatMap(scene =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                const prompt = buildMemoryScenePrompt(answers || {}, petDescription, scene.id)
                const fd = new FormData()
                fd.append('model', 'gpt-image-1.5')
                fd.append('prompt', prompt)
                fd.append('n', '1')
                fd.append('size', '1024x1024')
                fd.append('quality', 'high')
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
                    const img = { url: imgUrl, styleId: `${scene.id}_${v}`, styleName: `${scene.emoji} ${scene.name}`, model: 'gpt' }
                    allImages.push(img)
                    send({ type: 'image', image: img })
                  }
                } else {
                  const t = await res.text()
                  console.error(`Memory error [${scene.name}]:`, res.status, t.slice(0, 200))
                }
              } catch(e) { console.error('Memory task error:', e) }
            })
          )

          send({ type: 'progress', value: 15, message: 'Generating memory scenes...' })
          for (let i = 0; i < sceneTasks.length; i += 3) {
            await Promise.all(sceneTasks.slice(i, i + 3).map(t => t()))
            send({ type: 'progress', value: 15 + Math.round(((i + 3) / sceneTasks.length) * 80), message: `${allImages.length} memory portraits ready...` })
          }
        }

        // ── Astria LoRA (when configured) ─────────────────────
        if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
          send({ type: 'progress', value: 92, message: 'Generating exact likeness portraits...' })
          for (const aPrompt of [
            `portrait of sks ${petType || 'dog'}, fine art oil painting, ${petDescription}`,
            `sks ${petType || 'dog'} golden hour, painterly portrait, ${petDescription}`,
          ]) {
            try {
              const aRes = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: { text: aPrompt, num_images: 3, super_resolution: true, face_correct: true, w: 1024, h: 1024 } }),
              })
              if (aRes.ok) {
                const aData = await aRes.json(); const promptId = aData.id; let attempts = 0
                while (attempts < 40) {
                  await new Promise(r => setTimeout(r, 5000))
                  const poll = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts/${promptId}`, {
                    headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}` }
                  })
                  const pd = await poll.json()
                  if (pd.images?.length > 0) {
                    for (const img of pd.images) {
                      allImages.push({ url: img.url, styleId: 'astria_exact', styleName: '🎯 Exact Likeness', model: 'astria' })
                      send({ type: 'image', image: allImages[allImages.length - 1] })
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
