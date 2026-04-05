import { NextRequest } from 'next/server'
import { S3Client, PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

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
const FLUX_ART_STYLES = [
  { id: 'oil_painting',  name: 'Oil Painting',   prompt: 'rich oil painting portrait of {subject}, impasto brushstrokes, warm golden light, museum quality, old masters style, dramatic chiaroscuro lighting' },
  { id: 'watercolor',    name: 'Watercolor',      prompt: 'watercolor painting of {subject}, loose fluid brushwork, soft edges, luminous pastel colors, white paper texture, impressionistic style' },
  { id: 'pop_art',       name: 'Pop Art',         prompt: 'Andy Warhol pop art portrait of {subject}, bold flat colors, high contrast, halftone dots, vivid neon palette, graphic design aesthetic' },
  { id: 'pencil_sketch', name: 'Pencil Sketch',   prompt: 'detailed pencil sketch of {subject}, fine graphite lines, cross-hatching shading, expressive eyes, artist sketchbook quality' },
]

const MEMORY_SCENE_STYLES = [
  { id: 'mem_adventure',   name: 'Adventure Scene',  emoji: '🚗' },
  { id: 'mem_royal',       name: 'Royal Portrait',   emoji: '👑' },
  { id: 'mem_sunset',      name: 'Golden Hour',      emoji: '🌅' },
  { id: 'mem_holiday',     name: 'Holiday Scene',    emoji: '🎄' },
  { id: 'mem_city',        name: 'City Portrait',    emoji: '🏙️' },
  { id: 'mem_perfect_day', name: 'Perfect Day',      emoji: '✨' },
]

function buildMemoryPrompt(answers: Record<string, string>, sceneId: string): string {
  const name = answers.petName || 'the pet'
  const breed = answers.petBreed || 'dog'
  const location = answers.favOutdoorSpot || answers.favPlace || 'a beautiful outdoor setting'
  const mood = answers.timeAndSeason || 'golden hour lighting'
  const details: string[] = []
  if (answers.favTeam)        details.push(`wearing ${answers.favTeam} gear`)
  if (answers.favCar)         details.push(`near a ${answers.favCar}`)
  if (answers.favToy)         details.push(`holding a ${answers.favToy}`)
  if (answers.favFood)        details.push(`with ${answers.favFood} nearby`)
  if (answers.petPersonality) details.push(`expression: ${answers.petPersonality}`)
  const detailStr = details.length ? ` Personal touches: ${details.join(', ')}.` : ''

  const sceneMap: Record<string, string> = {
    mem_adventure:   answers.favCar ? `${name} riding in a ${answers.favCar} at ${location}` : `${name} adventuring at ${location}`,
    mem_royal:       `regal oil painting portrait of ${name} as royalty with ornate backdrop and gold accents`,
    mem_sunset:      `${name} at ${location} during golden hour, warm light on their fur`,
    mem_holiday:     `${name} in a cozy holiday scene with fireplace, Christmas tree, festive decorations`,
    mem_city:        `${name} in a stylish urban scene at ${location || 'a vibrant city'}, evening lights`,
    mem_perfect_day: answers.perfectDay ? `Scene: ${answers.perfectDay}. ${name} the ${breed}.` : `${name}'s perfect day at ${location}`,
  }

  return `Oil painting portrait style. ${sceneMap[sceneId] || sceneMap.mem_adventure}.${detailStr}

Artistic style: painterly oil painting, rich warm colors, cinematic lighting, gallery quality, deeply personal.
Include the name "${name.toUpperCase()}" subtly on a collar tag or nameplate.
Mood: ${mood}. Make it beautiful and uniquely theirs.`
}

export async function POST(req: NextRequest) {
  const { imageUrl, styles, isMemory, answers, petType, petName } = await req.json()

  // Make the uploaded photo publicly accessible for FLUX by copying it to generated/ prefix
  // The uploads/ path is private (403), but generated/ is publicly readable
  const r2PublicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || ''
  const imageKey = imageUrl.startsWith(r2PublicBase)
    ? imageUrl.slice(r2PublicBase.length + 1)
    : imageUrl.split('/uploads/').pop() ? `uploads/${imageUrl.split('/uploads/').pop()}` : null

  let accessibleImageUrl = imageUrl
  if (imageKey) {
    try {
      // Copy from uploads/ to generated/public/ so it's publicly accessible
      const { GetObjectCommand, CopyObjectCommand } = await import('@aws-sdk/client-s3')
      const publicKey = `generated/src/${uuidv4()}.jpg`
      await r2.send(new CopyObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        CopySource: `${process.env.R2_BUCKET_NAME}/${imageKey}`,
        Key: publicKey,
        ContentType: 'image/jpeg',
      }))
      accessibleImageUrl = `${r2PublicBase}/${publicKey}`
      console.log('Copied upload to public path:', accessibleImageUrl.slice(0, 100))
    } catch (e) {
      console.error('Failed to copy to public path, using presigned URL:', e)
      // Fallback to presigned URL
      try {
        const { GetObjectCommand } = await import('@aws-sdk/client-s3')
        const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
        accessibleImageUrl = await getSignedUrl(
          r2,
          new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: imageKey }),
          { expiresIn: 3600 }
        )
        console.log('Using presigned GET URL fallback')
      } catch (e2) { console.error('Both approaches failed:', e2) }
    }
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        const allImages: Array<{ url: string; styleId: string; styleName: string; model: string }> = []
        const subject = `${petName || answers?.petName || 'the pet'} the ${petType || answers?.petBreed || 'dog'}`

        send({ type: 'progress', value: 5, message: 'Starting generation...' })

        if (!isMemory) {
          // ── TIER 1: STYLE TRANSFER ──────────────────────────────
          // FLUX 1.1 Pro Ultra — 4 styles × 3 = 12 images
          const fluxTasks = FLUX_ART_STYLES.flatMap(style =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                // FLUX Kontext Pro — preserves pet identity while applying art styles
                const stylePrompt = style.prompt.replace('{subject}', subject)
                const falRes = await fetch('https://fal.run/fal-ai/flux-pro/kontext', {
                  method: 'POST',
                  headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    image_url: accessibleImageUrl,
                    prompt: `Transform this exact pet photo into ${stylePrompt}. Preserve the pet's exact identity, face, fur color, markings, breed, and unique features. Keep the same pet, just change the artistic style.`,
                    seed: Math.floor(Math.random() * 999999) + v * 13579,
                    image_size: 'square_hd',
                    output_format: 'jpeg',
                    num_images: 1,
                    guidance_scale: 3.5,
                    safety_tolerance: '2',
                  }),
                })
                if (falRes.ok) {
                  const d = await falRes.json()
                  const imgUrl = d.images?.[0]?.url
                  if (imgUrl) { const img = { url: imgUrl, styleId: style.id, styleName: style.name, model: 'fal' }; allImages.push(img); send({ type: 'image', image: img }) }
                  else console.error('FLUX no url:', JSON.stringify(d).slice(0, 200))
                } else {
                  const t = await falRes.text(); console.error('FLUX error', falRes.status, t.slice(0, 300))
                }
              } catch (e) { console.error('FLUX task error:', e) }
            })
          )

          send({ type: 'progress', value: 10, message: 'Creating FLUX artistic portraits...' })
          for (let i = 0; i < fluxTasks.length; i += 4) {
            await Promise.all(fluxTasks.slice(i, i + 4).map(t => t()))
            send({ type: 'progress', value: 10 + Math.round(((i + 4) / fluxTasks.length) * 40), message: `FLUX: ${allImages.filter(x => x.model === 'fal').length} portraits ready...` })
          }

          // GPT Image 1 — 4 artistic edits of the ACTUAL pet photo
          const gptArtStyles = [
            { id: 'oil', name: 'Oil Painting (GPT)', prompt: `Transform this pet photo into a rich oil painting portrait. Impasto brushstrokes, warm golden light, dramatic chiaroscuro, museum-quality fine art. Keep the pet's exact appearance, breed, and features.` },
            { id: 'impressionist', name: 'Impressionist ✨', prompt: `Transform this pet photo into an impressionist painting in the style of Monet. Dappled sunlight, soft focus, vibrant blended colors, plein air style. Keep the pet's exact appearance and features.` },
            { id: 'artdeco', name: 'Art Deco ✨', prompt: `Transform this pet photo into a vintage art deco poster illustration. Bold graphic design, 1930s aesthetic, limited warm color palette, geometric elements. Keep the pet's exact appearance.` },
            { id: 'childrens', name: "Children's Book ✨", prompt: `Transform this pet photo into a charming children's book illustration. Clean line art, flat colors, warm friendly expression, Pixar-quality warmth and charm. Keep the pet's exact appearance.` },
          ]
          send({ type: 'progress', value: 52, message: 'Creating artistic portraits from your photo with GPT...' })

          // Fetch the image as a buffer to send to GPT edits endpoint
          let petImageBuffer: Buffer | null = null
          try {
            console.log('Fetching pet image from:', accessibleImageUrl.slice(0, 100))
            const imgRes = await fetch(accessibleImageUrl, {
              headers: { 'User-Agent': 'PetPrintsStudio/1.0' },
              signal: AbortSignal.timeout(30000),
            })
            console.log('Pet image fetch status:', imgRes.status, imgRes.headers.get('content-type'))
            if (imgRes.ok) {
              petImageBuffer = Buffer.from(await imgRes.arrayBuffer())
              console.log('Pet image fetched, size:', petImageBuffer.length)
            } else {
              const errText = await imgRes.text()
              console.error('Pet image fetch failed:', imgRes.status, errText.slice(0, 200))
            }
          } catch(e) { console.error('Failed to fetch pet image for GPT:', e) }

          for (let i = 0; i < gptArtStyles.length; i += 2) {
            await Promise.all(gptArtStyles.slice(i, i + 2).map(async (style, idx) => {
              try {
                let b64: string | undefined
                if (petImageBuffer) {
                  // Use /edits to transform the actual pet photo
                  const fd = new FormData()
                  fd.append('model', 'gpt-image-1.5')
                  fd.append('prompt', style.prompt)
                  fd.append('n', '1')
                  fd.append('size', '1024x1024')
                  fd.append('quality', 'high')
                  fd.append('image', new Blob([petImageBuffer as unknown as BlobPart], {type: 'image/jpeg'}), 'pet.jpg')
                  const res = await fetch('https://api.openai.com/v1/images/edits', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
                    body: fd,
                  })
                  if (res.ok) { const d = await res.json(); b64 = d.data?.[0]?.b64_json }
                  else { const t = await res.text(); console.error('GPT edit error', res.status, t.slice(0,300)) }
                } else {
                  // Fallback: text-to-image if we couldn't fetch the photo
                  const res = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'gpt-image-1.5', prompt: style.prompt, n: 1, size: '1024x1024', quality: 'high' }),
                  })
                  if (res.ok) { const d = await res.json(); b64 = d.data?.[0]?.b64_json }
                }
                if (b64) { const imgUrl = await uploadB64ToR2(b64); const img = { url: imgUrl, styleId: `gpt_${style.id}`, styleName: style.name, model: 'gpt' }; allImages.push(img); send({ type: 'image', image: img }) }
              } catch (e) { console.error('GPT art error:', e) }
            }))
            send({ type: 'progress', value: 55 + Math.round(((i + 2) / gptArtStyles.length) * 20), message: `GPT: ${allImages.filter(x => x.model === 'gpt').length} portraits ready...` })
          }

          // Astria LoRA — exact likeness (if configured)
          if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
            send({ type: 'progress', value: 77, message: 'Generating exact likeness with Astria...' })
            for (const aPrompt of [`portrait of sks ${petType || 'dog'}, oil painting style, natural lighting`, `sks ${petType || 'dog'} golden hour, painterly portrait`]) {
              try {
                const aRes = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts`, {
                  method: 'POST', headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: { text: aPrompt, num_images: 3, super_resolution: true, face_correct: true, w: 1024, h: 1024 } }),
                })
                if (aRes.ok) {
                  const aData = await aRes.json(); const promptId = aData.id; let attempts = 0
                  while (attempts < 40) {
                    await new Promise(r => setTimeout(r, 5000))
                    const poll = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts/${promptId}`, { headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}` } })
                    const pd = await poll.json()
                    if (pd.images?.length > 0) { for (const img of pd.images) { const aImg = { url: img.url, styleId: 'astria_exact', styleName: 'Exact Likeness', model: 'astria' }; allImages.push(aImg); send({ type: 'image', image: aImg }) }; break }
                    attempts++
                  }
                }
              } catch (e) { console.error('Astria error:', e) }
            }
          }

        } else {
          // ── TIER 2: MEMORY PORTRAIT ─────────────────────────────
          // GPT Image 1 — 6 scenes × 3 variations = 18 images
          const memTasks = MEMORY_SCENE_STYLES.flatMap(scene =>
            Array.from({ length: 3 }, () => async () => {
              try {
                const prompt = buildMemoryPrompt(answers || {}, scene.id)
                const res = await fetch('https://api.openai.com/v1/images/generations', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ model: 'gpt-image-1.5', prompt, n: 1, size: '1024x1024', quality: 'high' }),
                })
                if (res.ok) {
                  const d = await res.json(); const b64 = d.data?.[0]?.b64_json
                  if (b64) { const imgUrl = await uploadB64ToR2(b64); const img = { url: imgUrl, styleId: scene.id, styleName: scene.name, model: 'gpt' }; allImages.push(img); send({ type: 'image', image: img }) }
                } else { const t = await res.text(); console.error('GPT memory error', res.status, t.slice(0,300)) }
              } catch (e) { console.error('GPT memory scene error:', e) }
            })
          )

          send({ type: 'progress', value: 8, message: `Building ${MEMORY_SCENE_STYLES.length * 3} personal memory scenes...` })
          for (let i = 0; i < memTasks.length; i += 3) {
            await Promise.all(memTasks.slice(i, i + 3).map(t => t()))
            send({ type: 'progress', value: 8 + Math.round(((i + 3) / memTasks.length) * 45), message: `${allImages.filter(x => x.model === 'gpt').length} memory scenes ready...` })
          }

          // FLUX artistic variations
          const fluxMemTasks = FLUX_ART_STYLES.flatMap(style =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                console.log('FLUX image_url:', accessibleImageUrl.slice(0, 120))
                const falRes = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra/redux', {
                  method: 'POST',
                  headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image_url: accessibleImageUrl, prompt: style.prompt.replace('{subject}', subject) + ' Personal memory scene.', strength: 0.75, num_inference_steps: 50, guidance_scale: 7.5, seed: Math.floor(Math.random() * 999999) + v * 31337, image_size: 'square_hd', output_format: 'jpeg', num_images: 1 }),
                })
                if (falRes.ok) {
                  const d = await falRes.json(); const imgUrl = d.images?.[0]?.url
                  if (imgUrl) { const img = { url: imgUrl, styleId: style.id, styleName: `${style.name} (Memory)`, model: 'fal' }; allImages.push(img); send({ type: 'image', image: img }) }
                } else { const t = await falRes.text(); console.error('FLUX memory error', falRes.status, t.slice(0,200)) }
              } catch (e) { console.error('FLUX memory error:', e) }
            })
          )

          send({ type: 'progress', value: 55, message: 'Adding artistic style variations...' })
          for (let i = 0; i < fluxMemTasks.length; i += 4) {
            await Promise.all(fluxMemTasks.slice(i, i + 4).map(t => t()))
            send({ type: 'progress', value: 55 + Math.round(((i + 4) / fluxMemTasks.length) * 22), message: `${allImages.filter(x => x.model === 'fal').length} FLUX variations ready...` })
          }

          // Astria exact likeness in scenes
          if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
            send({ type: 'progress', value: 79, message: 'Adding exact likeness portraits...' })
            for (const aPrompt of [`sks ${petType || 'dog'} in a beautiful personal scene, painterly style`, `sks ${petType || 'dog'} ${answers?.favPlace ? `at ${answers.favPlace}` : 'in their favorite place'}, golden hour`]) {
              try {
                const aRes = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts`, {
                  method: 'POST', headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: { text: aPrompt, num_images: 3, super_resolution: true, face_correct: true, w: 1024, h: 1024 } }),
                })
                if (aRes.ok) {
                  const aData = await aRes.json(); const promptId = aData.id; let attempts = 0
                  while (attempts < 40) {
                    await new Promise(r => setTimeout(r, 5000))
                    const poll = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts/${promptId}`, { headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}` } })
                    const pd = await poll.json()
                    if (pd.images?.length > 0) { for (const img of pd.images) { const aImg = { url: img.url, styleId: 'astria_memory', styleName: 'Exact Likeness — Memory Scene', model: 'astria' }; allImages.push(aImg); send({ type: 'image', image: aImg }) }; break }
                    attempts++
                  }
                }
              } catch (e) { console.error('Astria memory error:', e) }
            }
          }
        }

        send({ type: 'progress', value: 100, message: 'All portraits ready!' })
        send({ type: 'done', images: allImages, counts: { gpt: allImages.filter(x => x.model === 'gpt').length, fal: allImages.filter(x => x.model === 'fal').length, astria: allImages.filter(x => x.model === 'astria').length, total: allImages.length } })
        controller.close()

      } catch (err) {
        console.error('Generation pipeline error:', err)
        send({ type: 'error', message: 'Generation failed. Please try again.' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  })
}
