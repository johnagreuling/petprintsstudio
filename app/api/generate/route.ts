import { NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════
//  PET PRINTS STUDIO — Generation Pipeline
//
//  TWO TIERS:
//
//  TIER 1 — Style Transfer (Standard)
//    "A beautiful artistic painting of your photo"
//    • Astria LoRA — exact likeness portraits (fine-tuned on pet face)
//    • FLUX 1.1 Pro Ultra — painterly art style variations
//    • GPT Image 1.5 — additional artistic interpretations
//
//  TIER 2 — Memory Portrait (THE HERO PRODUCT)
//    "A custom scene featuring your pet with YOUR memories"
//    • GPT Image 1.5 — custom scenes with cars, teams, locations,
//      accessories, food, toys — everything from the questionnaire
//    • FLUX 1.1 Pro Ultra — artistic style variations of those scenes
//    • Astria LoRA — hyper-accurate face within the custom scenes
// ═══════════════════════════════════════════════════════════════

// ── MEMORY PORTRAIT SCENE STYLES ────────────────────────────────
// Used by GPT Image 1.5 for custom scene generation
const MEMORY_SCENE_STYLES = [
  { id: 'mem_adventure',  name: 'Adventure Scene',    emoji: '🚗', description: 'Your pet in their favorite car at their favorite place' },
  { id: 'mem_royal',      name: 'Royal Portrait',     emoji: '👑', description: 'Regal oil painting with personal accessories and backdrop' },
  { id: 'mem_sunset',     name: 'Golden Hour',        emoji: '🌅', description: 'Golden hour at their favorite outdoor spot' },
  { id: 'mem_holiday',    name: 'Holiday Scene',      emoji: '🎄', description: 'Festive scene with personal touches' },
  { id: 'mem_city',       name: 'City Portrait',      emoji: '🏙️', description: 'Urban backdrop with their favorite gear' },
  { id: 'mem_perfect_day',name: 'Perfect Day',        emoji: '✨', description: 'Their ideal day brought to life' },
]

// ── ART STYLES FOR FLUX ─────────────────────────────────────────
// Used for both tiers — pure artistic transformation
const FLUX_ART_STYLES = [
  { id: 'oil_painting',  name: 'Oil Painting',   prompt: 'rich oil painting portrait of {subject}, impasto brushstrokes, warm golden light, museum quality, old masters style, dramatic chiaroscuro lighting' },
  { id: 'watercolor',    name: 'Watercolor',     prompt: 'watercolor painting of {subject}, loose fluid brushwork, soft edges, luminous pastel colors, white paper texture, impressionistic style' },
  { id: 'pop_art',       name: 'Pop Art',        prompt: 'Andy Warhol pop art portrait of {subject}, bold flat colors, high contrast, halftone dots, vivid neon palette, graphic design aesthetic' },
  { id: 'pencil_sketch', name: 'Pencil Sketch',  prompt: 'detailed pencil sketch of {subject}, fine graphite lines, cross-hatching shading, white background, expressive eyes, sketchbook quality' },
]

// ── BUILD GPT MEMORY SCENE PROMPT ──────────────────────────────
function buildMemoryPrompt(answers: Record<string, string>, scene: typeof MEMORY_SCENE_STYLES[0]): string {
  const name = answers.petName || 'the pet'
  const breed = answers.petBreed || 'dog'
  const feature = answers.petFeature || ''

  let subject = `a ${breed} named ${name}`
  if (feature) subject += ` with ${feature}`

  const details: string[] = []
  if (answers.favTeam)        details.push(`wearing a ${answers.favTeam} collar or bandana`)
  if (answers.favCar)         details.push(`posed with or inside a ${answers.favCar}`)
  if (answers.favToy)         details.push(`holding their favorite ${answers.favToy}`)
  if (answers.favFood)        details.push(`with ${answers.favFood} visible in the scene`)
  if (answers.favRestaurant)  details.push(`near a ${answers.favRestaurant} sign`)
  if (answers.petPersonality) details.push(`expression conveying: ${answers.petPersonality}`)

  const location = answers.favOutdoorSpot || answers.favPlace || 'a beautiful outdoor setting'
  const mood = answers.timeAndSeason || 'golden hour lighting'

  let sceneAddition = ''
  switch (scene.id) {
    case 'mem_adventure':
      sceneAddition = answers.favCar
        ? `${name} riding in a ${answers.favCar} at ${location}, wind in their fur`
        : `${name} adventuring at ${location}, exploring joyfully`
      break
    case 'mem_royal':
      sceneAddition = `regal oil painting portrait, ${name} dressed as royalty with ornate backdrop and gold accents`
      break
    case 'mem_sunset':
      sceneAddition = `${name} at ${location} during golden hour, warm light catching their fur, peaceful and beautiful`
      break
    case 'mem_holiday':
      sceneAddition = `cozy holiday scene, ${name} by a fireplace with Christmas tree and festive decorations, warm amber light`
      break
    case 'mem_city':
      sceneAddition = `${name} in an urban setting at ${location || 'a vibrant city'}, stylish and confident`
      break
    case 'mem_perfect_day':
      sceneAddition = answers.perfectDay
        ? `Scene: ${answers.perfectDay}`
        : `${name}'s perfect day — playing at ${location} in ${mood}`
      break
  }

  const detailStr = details.length > 0 ? `\n\nPersonal touches to include: ${details.join(', ')}.` : ''

  return `Oil painting portrait style. ${subject}. ${sceneAddition}.${detailStr}

Artistic direction: painterly oil painting with visible brushstrokes, rich warm colors, cinematic lighting, gallery quality. The scene should feel deeply personal and emotional — like a cherished memory.

Include the pet's name "${name.toUpperCase()}" subtly somewhere in the scene (collar tag, license plate, or nameplate).

Mood: ${mood}. Make it beautiful, emotional, and uniquely theirs.`
}

export async function POST(req: NextRequest) {
  const { imageUrl, styles, isMemory, answers, petType, petName } = await req.json()

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
          // ════════════════════════════════════════════════════
          //  TIER 1: STYLE TRANSFER
          //  Pure artistic reimagining of the uploaded photo
          //
          //  • FLUX 1.1 Pro Ultra — 12 artistic style portraits
          //  • GPT Image 1.5 — 4 additional artistic renders
          //  • Astria LoRA — exact likeness (if tune exists)
          // ════════════════════════════════════════════════════

          // ── FLUX 1.1 Pro Ultra — 4 styles × 3 variations = 12 ──
          const fluxStyles = FLUX_ART_STYLES
          const fluxTasks = fluxStyles.flatMap(style =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                const prompt = style.prompt.replace('{subject}', subject)
                const falResponse = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra/image-to-image', {
                  method: 'POST',
                  headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    image_url: imageUrl,
                    prompt,
                    negative_prompt: 'blurry, low quality, distorted, watermark, text, ugly, deformed',
                    strength: 0.80,
                    num_inference_steps: 50,
                    guidance_scale: 7.5,
                    seed: Math.floor(Math.random() * 999999) + v * 13579,
                    image_size: 'square_hd',
                    output_format: 'jpeg',
                    num_images: 1,
                    enable_safety_checker: true,
                  }),
                })
                if (falResponse.ok) {
                  const falData = await falResponse.json()
                  const imgUrl = falData.images?.[0]?.url
                  if (imgUrl) {
                    const img = { url: imgUrl, styleId: style.id, styleName: style.name, model: 'fal' }
                    allImages.push(img)
                    send({ type: 'image', image: img })
                  }
                }
              } catch (err) { console.error('FLUX style error:', err) }
            })
          )

          send({ type: 'progress', value: 10, message: 'Creating artistic style portraits with FLUX...' })
          for (let i = 0; i < fluxTasks.length; i += 4) {
            await Promise.all(fluxTasks.slice(i, i + 4).map(t => t()))
            send({ type: 'progress', value: 10 + Math.round(((i + 4) / fluxTasks.length) * 40), message: `FLUX: ${allImages.filter(x => x.model === 'fal').length} art portraits ready...` })
          }

          // ── GPT Image 1.5 — 4 additional artistic renders ──
          const gptArtPrompts = [
            `Beautiful oil painting portrait of ${subject}. Rich brushstrokes, warm golden light, gallery quality, museum-worthy fine art.`,
            `Impressionist painting of ${subject} in the style of Monet. Dappled sunlight, soft focus, vibrant blended colors, plein air style.`,
            `Vintage art deco poster illustration of ${subject}. Bold graphic design, 1930s aesthetic, limited color palette, letterpress texture.`,
            `Charming children's book illustration of ${subject}. Clean line art, flat colors, friendly expression, Pixar-quality warmth.`,
          ]

          send({ type: 'progress', value: 52, message: 'Adding GPT artistic variations...' })
          const gptArtTasks = gptArtPrompts.map(prompt => async () => {
            try {
              const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'high' }),
              })
              if (response.ok) {
                const data = await response.json()
                const b64 = data.data?.[0]?.b64_json
                if (b64) {
                  const img = { url: `data:image/png;base64,${b64}`, styleId: 'gpt_art', styleName: 'GPT Portrait', model: 'gpt' }
                  allImages.push(img)
                  send({ type: 'image', image: img })
                }
              }
            } catch (err) { console.error('GPT art error:', err) }
          })

          for (let i = 0; i < gptArtTasks.length; i += 2) {
            await Promise.all(gptArtTasks.slice(i, i + 2).map(t => t()))
            send({ type: 'progress', value: 55 + Math.round(((i + 2) / gptArtTasks.length) * 20), message: `GPT: ${allImages.filter(x => x.model === 'gpt').length} artistic portraits ready...` })
          }

          // ── Astria LoRA — exact likeness (if tune available) ──
          if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
            send({ type: 'progress', value: 77, message: 'Generating exact likeness portraits with Astria...' })
            const astriaPrompts = [
              `a portrait of sks ${petType || 'dog'} in beautiful natural lighting, oil painting style, expressive eyes`,
              `sks ${petType || 'dog'} in a painterly style, golden hour light, artistic portrait`,
            ]
            for (const aPrompt of astriaPrompts) {
              try {
                const aRes = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: { text: aPrompt, num_images: 3, super_resolution: true, face_correct: true, w: 1024, h: 1024 } }),
                })
                if (aRes.ok) {
                  const aData = await aRes.json()
                  const promptId = aData.id
                  let attempts = 0
                  while (attempts < 40) {
                    await new Promise(r => setTimeout(r, 5000))
                    const poll = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts/${promptId}`, {
                      headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}` },
                    })
                    const pollData = await poll.json()
                    if (pollData.images?.length > 0) {
                      for (const img of pollData.images) {
                        const aImg = { url: img.url, styleId: 'astria_exact', styleName: 'Exact Likeness', model: 'astria' }
                        allImages.push(aImg)
                        send({ type: 'image', image: aImg })
                      }
                      break
                    }
                    attempts++
                  }
                }
              } catch (err) { console.error('Astria error:', err) }
            }
          }

        } else {
          // ════════════════════════════════════════════════════
          //  TIER 2: MEMORY PORTRAIT — THE HERO PRODUCT
          //  Custom scenes built from questionnaire answers
          //
          //  • GPT Image 1.5 — 18 custom personal scenes
          //    (cars, teams, locations, food, toys, accessories)
          //  • FLUX 1.1 Pro Ultra — 12 artistic style variations
          //    of the memory scenes
          //  • Astria LoRA — 6 exact likeness within scenes
          // ════════════════════════════════════════════════════

          // ── GPT Image 1.5 — 6 scenes × 3 variations = 18 ──
          const memoryScenes = MEMORY_SCENE_STYLES
          const gptMemoryTasks = memoryScenes.flatMap(scene =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                const prompt = buildMemoryPrompt(answers || {}, scene)
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'high' }),
                })
                if (response.ok) {
                  const data = await response.json()
                  const b64 = data.data?.[0]?.b64_json
                  if (b64) {
                    const img = { url: `data:image/png;base64,${b64}`, styleId: scene.id, styleName: scene.name, model: 'gpt' }
                    allImages.push(img)
                    send({ type: 'image', image: img })
                  }
                }
              } catch (err) { console.error('GPT memory scene error:', err) }
            })
          )

          send({ type: 'progress', value: 8, message: `Generating ${gptMemoryTasks.length} custom memory scenes with GPT...` })
          for (let i = 0; i < gptMemoryTasks.length; i += 3) {
            await Promise.all(gptMemoryTasks.slice(i, i + 3).map(t => t()))
            const pct = 8 + Math.round(((i + 3) / gptMemoryTasks.length) * 45)
            send({ type: 'progress', value: Math.min(pct, 53), message: `GPT: ${allImages.filter(x => x.model === 'gpt').length} memory scenes ready...` })
          }

          // ── FLUX 1.1 Pro Ultra — artistic style variations of scenes ──
          // Take the first GPT image URL if available, otherwise use original
          const fluxSourceUrl = allImages.find(x => x.model === 'gpt' && !x.url.startsWith('data:'))?.url || imageUrl
          const memFluxTasks = FLUX_ART_STYLES.flatMap(style =>
            Array.from({ length: 3 }, (_, v) => async () => {
              try {
                const prompt = style.prompt.replace('{subject}', subject) + `. Scene inspired by the pet's personal memories and favorite things.`
                const falResponse = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra/image-to-image', {
                  method: 'POST',
                  headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    image_url: imageUrl,
                    prompt,
                    negative_prompt: 'blurry, low quality, distorted, watermark, text, ugly, deformed',
                    strength: 0.75,
                    num_inference_steps: 50,
                    guidance_scale: 7.5,
                    seed: Math.floor(Math.random() * 999999) + v * 31337,
                    image_size: 'square_hd',
                    output_format: 'jpeg',
                    num_images: 1,
                  }),
                })
                if (falResponse.ok) {
                  const falData = await falResponse.json()
                  const imgUrl = falData.images?.[0]?.url
                  if (imgUrl) {
                    const img = { url: imgUrl, styleId: style.id, styleName: `${style.name} (Memory)`, model: 'fal' }
                    allImages.push(img)
                    send({ type: 'image', image: img })
                  }
                }
              } catch (err) { console.error('FLUX memory error:', err) }
            })
          )

          send({ type: 'progress', value: 55, message: 'Creating artistic style variations of your memory scenes...' })
          for (let i = 0; i < memFluxTasks.length; i += 4) {
            await Promise.all(memFluxTasks.slice(i, i + 4).map(t => t()))
            send({ type: 'progress', value: 55 + Math.round(((i + 4) / memFluxTasks.length) * 22), message: `FLUX: ${allImages.filter(x => x.model === 'fal').length} artistic variations ready...` })
          }

          // ── Astria LoRA — exact likeness within scenes ──
          if (process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
            send({ type: 'progress', value: 79, message: 'Adding exact likeness portraits to your memory scenes...' })
            const astriaMemPrompts = [
              `a portrait of sks ${petType || 'dog'} in a beautiful personal scene with their favorite things, painterly style`,
              `sks ${petType || 'dog'} ${answers?.favPlace ? `at ${answers.favPlace}` : 'in their favorite place'}, golden hour, oil painting`,
            ]
            for (const aPrompt of astriaMemPrompts) {
              try {
                const aRes = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ prompt: { text: aPrompt, num_images: 3, super_resolution: true, face_correct: true, w: 1024, h: 1024 } }),
                })
                if (aRes.ok) {
                  const aData = await aRes.json()
                  const promptId = aData.id
                  let attempts = 0
                  while (attempts < 40) {
                    await new Promise(r => setTimeout(r, 5000))
                    const poll = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts/${promptId}`, {
                      headers: { 'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}` },
                    })
                    const pollData = await poll.json()
                    if (pollData.images?.length > 0) {
                      for (const img of pollData.images) {
                        const aImg = { url: img.url, styleId: 'astria_memory', styleName: 'Exact Likeness — Memory Scene', model: 'astria' }
                        allImages.push(aImg)
                        send({ type: 'image', image: aImg })
                      }
                      break
                    }
                    attempts++
                  }
                }
              } catch (err) { console.error('Astria memory error:', err) }
            }
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
