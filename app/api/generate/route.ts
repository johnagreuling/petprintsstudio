import { NextRequest } from 'next/server'
import { ART_STYLES, buildMemoryPrompt } from '@/lib/config'

// ═══════════════════════════════════════════════════════════════
//  PET PRINTS STUDIO — Generation Pipeline
//
//  36 portraits per order across 3 best-in-class AI models:
//
//  MODEL 1 — GPT Image 1.5 (OpenAI) — 18 images — THE HERO
//    Best at: scene portraits, specific cars/brands, accessories,
//    text rendering (name on plate/chain), multi-pet scenes,
//    location accuracy, gold chains, sunglasses, etc.
//    Used for: all Memory Portrait scene generation
//
//  MODEL 2 — fal.ai FLUX 1.1 Pro — 12 images — THE ARTIST
//    Best at: artistic style transfers, painterly rendering,
//    oil painting, watercolor, pop art, pencil sketch quality
//    Used for: style transfer artistic variations
//
//  MODEL 3 — Astria LoRA — 6 images — THE PERFECTIONIST
//    Best at: exact pet likeness via fine-tuning
//    Used for: hyper-accurate face portraits (Memory tier only)
// ═══════════════════════════════════════════════════════════════

const GPT_SCENE_STYLES = [
  { id: 'gpt_adventure',   name: 'Adventure Scene',    emoji: '🚗', description: 'Your pet in their favorite car at their favorite place' },
  { id: 'gpt_royal',       name: 'Royal Oil Portrait', emoji: '👑', description: 'Regal oil painting with accessories and backdrop' },
  { id: 'gpt_sunset',      name: 'Sunset Beach',       emoji: '🌅', description: 'Golden hour coastal scene, painterly style' },
  { id: 'gpt_holiday',     name: 'Holiday Portrait',   emoji: '🎄', description: 'Festive scene by fireplace with decorations' },
  { id: 'gpt_city',        name: 'City Portrait',      emoji: '🏙️', description: 'Urban backdrop with styled accessories' },
  { id: 'gpt_mountain',    name: 'Mountain Scene',     emoji: '⛰️', description: 'Rocky Mountain backdrop, Colorado landscape' },
]

const FAL_ART_STYLES = [
  { id: 'oil_painting',   name: 'Oil Painting',     prompt: 'rich oil painting portrait of {subject}, impasto brushstrokes, warm golden light, museum quality, old masters style, dramatic lighting' },
  { id: 'watercolor',     name: 'Watercolor',        prompt: 'watercolor painting of {subject}, loose fluid brushwork, soft edges, luminous pastel colors, white paper texture, impressionistic' },
  { id: 'pop_art',        name: 'Pop Art',           prompt: 'Andy Warhol pop art portrait of {subject}, bold flat colors, high contrast, halftone dots, vivid neon palette, graphic design' },
  { id: 'pencil_sketch',  name: 'Pencil Sketch',     prompt: 'detailed pencil sketch of {subject}, fine graphite lines, cross-hatching, white background, expressive eyes, artist sketchbook quality' },
]

// ── BUILD GPT SCENE PROMPT FROM QUESTIONNAIRE ANSWERS ──────────
function buildGPTScenePrompt(answers: Record<string, string>, sceneStyle: typeof GPT_SCENE_STYLES[0]): string {
  const name = answers.petName || 'the pet'
  const breed = answers.petBreed || 'dog'
  const feature = answers.petFeature || ''
  
  // Core subject with physical description
  let subject = `a ${breed} named ${name}`
  if (feature) subject += ` with ${feature}`

  // Build easter egg details from questionnaire answers
  const details: string[] = []
  
  if (answers.favTeam)       details.push(`wearing a ${answers.favTeam} collar or bandana`)
  if (answers.favCar)        details.push(`posed with or driving a ${answers.favCar}`)
  if (answers.favToy)        details.push(`holding a ${answers.favToy}`)
  if (answers.favFood)       details.push(`with ${answers.favFood} visible in the scene`)
  if (answers.favRestaurant) details.push(`near a ${answers.favRestaurant} sign in background`)
  if (answers.petPersonality)details.push(`expression conveying personality: ${answers.petPersonality}`)

  // Location / backdrop
  const location = answers.favOutdoorSpot || answers.favCity || 'a beautiful outdoor setting'
  const mood = answers.timeAndSeason || 'golden hour lighting'

  // Accessories prompt — GPT excels at these
  const accessories = [
    answers.favTeam ? `${answers.favTeam} themed accessories` : 'stylish gold chain necklace',
    'designer sunglasses',
    answers.favCar ? `license plate reading "${name.toUpperCase()}"` : '',
  ].filter(Boolean).join(', ')

  // Scene-specific additions
  let sceneAddition = ''
  switch (sceneStyle.id) {
    case 'gpt_adventure':
      sceneAddition = answers.favCar
        ? `${name} posed on or in a ${answers.favCar}, backdrop of ${location}`
        : `${name} in an adventurous outdoor setting at ${location}`
      break
    case 'gpt_royal':
      sceneAddition = `regal oil painting portrait style, ornate background, ${name} as royalty`
      break
    case 'gpt_sunset':
      sceneAddition = `beautiful beach sunset backdrop, golden reflections on water, warm light on fur`
      break
    case 'gpt_holiday':
      sceneAddition = `cozy holiday scene with Christmas tree, fireplace, festive decorations, warm amber light`
      break
    case 'gpt_city':
      sceneAddition = `urban city backdrop at ${location || 'a vibrant city'}, evening lights`
      break
    case 'gpt_mountain':
      sceneAddition = `dramatic Rocky Mountain backdrop at ${location || 'Colorado mountains'}, clear sky, pine trees`
      break
  }

  // Perfect day override — the most personal prompt element
  const perfectDay = answers.perfectDay
    ? `\n\nScene inspired by: ${answers.perfectDay}`
    : ''

  const detailStr = details.length > 0 ? `\n\nPersonal details to include: ${details.join(', ')}.` : ''

  return `Oil painting portrait style. ${subject}. ${sceneAddition}. ${accessories}.${detailStr}

Artistic style: painterly oil painting with visible brushstrokes, rich warm colors, dramatic lighting, gallery quality. The scene should feel cinematic and personal.

Technical: high detail, accurate pet anatomy, expressive eyes, ${mood}.${perfectDay}

Important: include the pet's name "${name.toUpperCase()}" subtly in the scene (on collar, license plate, or nameplate).`
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

        send({ type: 'progress', value: 5, message: 'Starting generation across 3 AI models...' })

        // ══════════════════════════════════════════════════════
        //  MODEL 1: GPT Image 1.5 — 18 Scene Portraits
        //  THE HERO: cars, accessories, text, location accuracy
        // ══════════════════════════════════════════════════════
        const gptScenes = isMemory ? GPT_SCENE_STYLES : GPT_SCENE_STYLES.slice(0, 3)
        const gptVariationsPerScene = isMemory ? 3 : 2
        const gptTasks = gptScenes.flatMap(scene =>
          Array.from({ length: gptVariationsPerScene }, (_, v) => async () => {
            try {
              const prompt = isMemory
                ? buildGPTScenePrompt(answers || {}, scene)
                : `Oil painting portrait of ${subject}. ${scene.description}. Painterly style, dramatic lighting, gallery quality, expressive and charming.`

              const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-image-1.5',
                  prompt,
                  n: 1,
                  size: '1024x1024',
                  quality: 'high',
                }),
              })

              if (response.ok) {
                const data = await response.json()
                // GPT returns base64 by default
                const b64 = data.data?.[0]?.b64_json
                if (b64) {
                  const imgUrl = `data:image/png;base64,${b64}`
                  const img = { url: imgUrl, styleId: scene.id, styleName: scene.name, model: 'gpt' }
                  allImages.push(img)
                  send({ type: 'image', image: img })
                }
              } else {
                const err = await response.json()
                console.error('GPT generation error:', err)
              }
            } catch (err) {
              console.error('GPT task error:', err)
            }
          })
        )

        send({ type: 'progress', value: 10, message: `Generating ${gptTasks.length} GPT scene portraits...` })

        // Run GPT in batches of 3 (respect rate limits)
        for (let i = 0; i < gptTasks.length; i += 3) {
          await Promise.all(gptTasks.slice(i, i + 3).map(t => t()))
          const pct = 10 + Math.round(((i + 3) / gptTasks.length) * 40)
          send({ type: 'progress', value: Math.min(pct, 50), message: `GPT: ${allImages.filter(x => x.model === 'gpt').length} scene portraits ready...` })
        }

        // ══════════════════════════════════════════════════════
        //  MODEL 2: fal.ai FLUX 1.1 Pro — 12 Art Style Portraits
        //  THE ARTIST: beautiful painterly renderings
        // ══════════════════════════════════════════════════════
        const selectedFalStyles = styles?.length > 0
          ? FAL_ART_STYLES.filter(s => styles.includes(s.id))
          : FAL_ART_STYLES

        const falTasks = selectedFalStyles.flatMap(style =>
          Array.from({ length: 3 }, (_, v) => async () => {
            try {
              const prompt = style.prompt.replace('{subject}', subject)
              const negPrompt = 'blurry, low quality, distorted, watermark, text, ugly, deformed'

              const falResponse = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra/image-to-image', {
                method: 'POST',
                headers: {
                  'Authorization': `Key ${process.env.FAL_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  image_url: imageUrl,
                  prompt,
                  negative_prompt: negPrompt,
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
            } catch (err) {
              console.error('fal.ai task error:', err)
            }
          })
        )

        send({ type: 'progress', value: 55, message: `Generating ${falTasks.length} artistic style portraits...` })

        for (let i = 0; i < falTasks.length; i += 4) {
          await Promise.all(falTasks.slice(i, i + 4).map(t => t()))
          const pct = 55 + Math.round(((i + 4) / falTasks.length) * 25)
          send({ type: 'progress', value: Math.min(pct, 80), message: `FLUX: ${allImages.filter(x => x.model === 'fal').length} art style portraits ready...` })
        }

        // ══════════════════════════════════════════════════════
        //  MODEL 3: Astria LoRA — 6 Exact Likeness Portraits
        //  THE PERFECTIONIST: fine-tuned on the actual pet face
        //  Memory Portrait tier only
        // ══════════════════════════════════════════════════════
        if (isMemory && process.env.ASTRIA_API_KEY && process.env.ASTRIA_TUNE_ID) {
          send({ type: 'progress', value: 82, message: 'Generating exact likeness portraits with Astria...' })

          const astriaScenes = [
            `a portrait of sks ${petType || 'dog'} in a beautiful outdoor setting, painterly oil style`,
            `sks ${petType || 'dog'} in their favorite place, golden hour light, oil painting`,
          ]

          for (const astriaPrompt of astriaScenes) {
            try {
              const aRes = await fetch(`https://api.astria.ai/tunes/${process.env.ASTRIA_TUNE_ID}/prompts`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.ASTRIA_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  prompt: {
                    text: astriaPrompt,
                    num_images: 3,
                    super_resolution: true,
                    face_correct: true,
                    w: 1024, h: 1024,
                  },
                }),
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
                      const aImg = { url: img.url, styleId: 'astria_likeness', styleName: 'Exact Likeness', model: 'astria' }
                      allImages.push(aImg)
                      send({ type: 'image', image: aImg })
                    }
                    break
                  }
                  attempts++
                }
              }
            } catch (err) {
              console.error('Astria error:', err)
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
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
