import { NextRequest } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import { saveSession, SessionImage, logApiUsage, addImagesToSession } from '@/lib/db'
import { ART_STYLES } from '@/lib/config'
import {
  analyzePetSubject,
  buildPrompt,
  buildMemoryScenePrompt,
  ALL_STYLES,
  getStyleById,
  getActiveStyles,
  DEFAULT_COMPOSITION,
  type SubjectProfile,
  type StyleTemplate,
  type GenerationResult,
} from '@/lib/portrait-engine'

// ── Config ───────────────────────────────────────────────────────────────
export const maxDuration = 600   // 10 minutes
export const dynamic = 'force-dynamic'

// ── R2 Client ────────────────────────────────────────────────────────────
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
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `${sessionFolder}/session.json`,
      Body: JSON.stringify(meta, null, 2),
      ContentType: 'application/json',
      CacheControl: 'no-cache',
    }))
  } catch (e) { console.error('Session meta save failed:', e) }
}

// ── Style ID Mapping ─────────────────────────────────────────────────────
const LEGACY_STYLE_MAP: Record<string, string> = {
  'ethereal': 'ethereal_dream',
  'watercolor': 'watercolor_fine',
  'impasto': 'heavy_impasto',
  'bold_contemporary': 'color_block',
  'classical_oil': 'classical_oil',
  'impressionist': 'impressionist_garden',
  'pastel': 'ethereal_dream',
  'vintage_poster': 'vintage_poster',
  'vintage_pop_art': 'color_block',
  'vintage_poster_v2': 'vintage_poster',
  'neon_glow': 'neon_glow',
  'storybook': 'fairytale_magic',
  'retro_pop': 'retro_pop_grid',
  'fairytale': 'fairytale_magic',
  'comic_animation': 'comic_hero',
  'fine_art_sketch': 'minimal_studio',
  'chateau_pop': 'heavy_impasto',
  'editorial_acrylic': 'color_block',
  // Also map config ART_STYLES ids directly (config uses friendly ids)
  'oil_painting': 'ethereal_dream',
  'pop_art': 'color_block',
  'renaissance': 'classical_oil',
}

function resolveStyleId(id: string): string {
  return LEGACY_STYLE_MAP[id] || id
}

// ── Memory Scene Definitions ─────────────────────────────────────────────
const MEMORY_SCENES = [
  { id: 'mem_adventure', name: '🚗 Adventure', defaultStyleId: 'color_block',
    template: (name: string, place: string) => `${name} on an adventure at ${place}. Cinematic outdoor landscape, sense of freedom and joy.` },
  { id: 'mem_royal', name: '👑 Royal', defaultStyleId: 'baroque_royal',
    template: (name: string, _place: string) => `${name} as royalty. Ornate gold-leaf setting, velvet drapes, jeweled collar, commanding pose.` },
  { id: 'mem_golden_hour', name: '🌅 Golden Hour', defaultStyleId: 'coastal_golden',
    template: (name: string, place: string) => `${name} at ${place} during golden hour. Warm amber light catching the fur.` },
  { id: 'mem_holiday', name: '🎄 Holiday', defaultStyleId: 'cozy_home',
    template: (name: string, _place: string) => `${name} in a cozy holiday scene — fireplace glow, decorated tree, warm candlelight.` },
  { id: 'mem_city', name: '🏙️ City', defaultStyleId: 'neon_glow',
    template: (name: string, place: string) => `${name} in ${place || 'a vibrant city'} at dusk. City lights bokeh, confident and stylish.` },
  { id: 'mem_perfect_day', name: '✨ Perfect Day', defaultStyleId: 'impressionist_garden',
    template: (name: string, place: string) => `${name}'s perfect day at ${place}. Joyful and free.` },
]

// ════════════════════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const {
    imageUrl,
    isMemory,
    answers,
    petType,
    petName,
    sessionId,
    brief,
    imagePromptCore,
    targetStyleId,
    styleIds,           // ← NEW: array of style IDs for multi-style generation
    variantCount,
  } = await req.json()

  // ── Resolve accessible image URL ────────────────────────────────────
  const r2PublicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || ''
  // Guard: imageUrl is required. If missing, return clear error instead of crashing.
  if (!imageUrl || typeof imageUrl !== 'string') {
    console.error('🚨 /api/generate called with missing/invalid imageUrl:', imageUrl)
    return new Response(JSON.stringify({ error: 'imageUrl is required. Please re-upload your photo and try again.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    })
  }

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

  // ── SSE Stream Setup ────────────────────────────────────────────────
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        const allImages: GenerationResult[] = []
        send({ type: 'progress', value: 3, message: 'Analyzing your pet...' })

        // ══════════════════════════════════════════════════════════════
        //  STEP 1: Fetch source image
        // ══════════════════════════════════════════════════════════════
        let petImageBuffer: Buffer | null = null
        try {
          const imgRes = await fetch(accessibleImageUrl, {
            headers: { 'User-Agent': 'PetPrintsStudio/2.0' },
            signal: AbortSignal.timeout(30000),
          })
          if (imgRes.ok) petImageBuffer = Buffer.from(await imgRes.arrayBuffer())
        } catch (e) { console.error('Fetch error:', e) }

        // ══════════════════════════════════════════════════════════════
        //  STEP 2: Subject Identity Extraction
        // ══════════════════════════════════════════════════════════════
        send({ type: 'progress', value: 5, message: 'Building identity profile...' })

        const subjectProfile = await analyzePetSubject(
          accessibleImageUrl,
          process.env.OPENAI_API_KEY!,
          petType,
          petName,
        )

        send({ type: 'progress', value: 10, message: 'Identity locked — starting portraits...' })

        const petSlug = (petName || petType || 'pet').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)
        const sessionFolder = `sessions/${sessionId || uuidv4()}_${petSlug}`
        const sessionStart = new Date().toISOString()

        // Save session early for survival
        try {
          await saveSession({
            sessionId: sessionFolder,
            customerEmail: answers?.email || '',
            customerLastName: answers?.lastName || answers?.ownerName?.split(' ').pop() || '',
            petName: petName || answers?.petName || '',
            petType: petType || 'dog',
            images: [],
            questionnaire: answers || {},
          })
        } catch (e) { console.error('Pre-save session failed (non-fatal):', e) }

        async function saveImageToSession(img: GenerationResult, idx: number) {
          try {
            const dbImg: SessionImage = {
              style_id: img.styleId || 'unknown',
              style_name: img.styleName || 'Unknown',
              url: img.url,
              variant_index: idx,
            }
            await addImagesToSession(sessionFolder, [dbImg])
          } catch (e) { console.error('Incremental session save failed:', e) }
        }

        if (!isMemory) {
          // ══════════════════════════════════════════════════════════
          //  STYLE TRANSFER GENERATION
          //  New flow order:
          //    1. styleIds[] provided → run those specific styles (multi-style picker)
          //    2. targetStyleId provided → run that one style (+1 more button)
          //    3. neither → fallback to all active styles (legacy)
          // ══════════════════════════════════════════════════════════

          let stylesToRun: StyleTemplate[]
          // Track which engine style came from which config id (so we can return
          // the user-facing config name + id in the result, matching the picker UI)
          const engineIdToConfigId = new Map<string, string>()

          if (Array.isArray(styleIds) && styleIds.length > 0) {
            stylesToRun = []
            for (const id of styleIds) {
              const engineStyle = getStyleById(resolveStyleId(id))
              if (engineStyle) {
                stylesToRun.push(engineStyle)
                engineIdToConfigId.set(engineStyle.id, id)
              }
            }
            if (stylesToRun.length === 0) {
              console.warn('No valid styles resolved from styleIds, falling back to first active style')
              stylesToRun = getActiveStyles().slice(0, 1)
            }
          } else if (targetStyleId && targetStyleId !== 'all') {
            const resolvedId = resolveStyleId(targetStyleId)
            const style = getStyleById(resolvedId)
            stylesToRun = style ? [style] : getActiveStyles().slice(0, 1)
            // Also preserve targetStyleId → engineStyle mapping for consistency
            if (style) engineIdToConfigId.set(style.id, targetStyleId)
          } else {
            stylesToRun = getActiveStyles()
          }

          const variantsPerStyle = variantCount || 1
          const totalImages = stylesToRun.length * variantsPerStyle
          let completedImages = 0

          console.log(`\n========== GENERATION PLAN ==========`)
          console.log(`Styles: ${stylesToRun.length} (${stylesToRun.map(s => s.id).join(', ')})`)
          console.log(`Variants per style: ${variantsPerStyle}`)
          console.log(`Total images: ${totalImages}`)
          console.log(`======================================\n`)

          const allTasks = stylesToRun.flatMap(style =>
            Array.from({ length: variantsPerStyle }, (_, variantIdx) => async () => {
              try {
                if (!petImageBuffer) { completedImages++; return }
                const promptPackage = buildPrompt(subjectProfile, style, DEFAULT_COMPOSITION)
                const quality = style.qualityTier === 'high' ? 'high' : 'medium'
                const fd = new FormData()
                fd.append('model', 'gpt-image-2')
                fd.append('prompt', promptPackage.fullPrompt)
                fd.append('n', '1')
                fd.append('size', '1024x1536')
                fd.append('quality', quality)
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
                    const url = await uploadB64ToR2(b64, 'png', sessionFolder)
                    // If this engine style was mapped from a config style, use the
                    // config display name + id so the gallery groups consistently
                    // with what the user picked in the UI
                    const configId = engineIdToConfigId.get(style.id)
                    const configStyle = configId ? ART_STYLES.find(s => s.id === configId) : null
                    const returnStyleId = configId || style.id
                    const returnStyleName = configStyle
                      ? `${configStyle.emoji} ${configStyle.name}`
                      : `${style.emoji} ${style.name}`
                    const img: GenerationResult = {
                      url,
                      styleId: `${returnStyleId}_${variantIdx}`,
                      styleName: returnStyleName,
                      model: 'gpt',
                    }
                    allImages.push(img)
                    send({ type: 'image', image: img })
                    await saveImageToSession(img, allImages.length - 1)
                  }
                } else {
                  const errText = await res.text()
                  console.error(`GPT error [${style.name} v${variantIdx}]:`, res.status, errText.slice(0, 300))
                }
              } catch (e) {
                console.error(`GPT task error [${style.name} v${variantIdx}]:`, e)
              }
              completedImages++
              send({
                type: 'progress',
                value: Math.min(10 + Math.round((completedImages / totalImages) * 80), 90),
                message: `${allImages.length} of ${totalImages} portraits ready...`,
              })
            })
          )

          const BATCH_SIZE = 4
          const BATCH_DELAY_MS = 10000
          for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
            if (i > 0) await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
            const batch = allTasks.slice(i, i + BATCH_SIZE)
            await Promise.all(batch.map(t => t()))
          }

        } else {
          // ══════════════════════════════════════════════════════════
          //  MEMORY PORTRAIT GENERATION (unchanged)
          // ══════════════════════════════════════════════════════════
          const name = answers?.petName || petName || 'the pet'
          const place = answers?.favPlace || answers?.favOutdoorSpot || 'a beautiful setting'
          const extras = [
            answers?.favCar ? `posed with or in a ${answers.favCar}` : '',
            answers?.favTeam ? `wearing a ${answers.favTeam} collar or bandana` : '',
            answers?.favToy ? `holding a ${answers.favToy}` : '',
            answers?.favFood ? `with ${answers.favFood} visible` : '',
          ].filter(Boolean).join(', ')

          const memTasks = MEMORY_SCENES.map(scene => async () => {
            try {
              if (!petImageBuffer) return
              const style = getStyleById(scene.defaultStyleId) || ALL_STYLES[0]
              const sceneDesc = scene.id === 'mem_perfect_day' && answers?.perfectDay
                ? answers.perfectDay
                : scene.template(name, place)
              const promptPackage = buildMemoryScenePrompt(subjectProfile, style, sceneDesc, extras, DEFAULT_COMPOSITION)
              const quality = style.qualityTier === 'high' ? 'high' : 'medium'
              const fd = new FormData()
              fd.append('model', 'gpt-image-2')
              fd.append('prompt', promptPackage.fullPrompt)
              fd.append('n', '1')
              fd.append('size', '1024x1536')
              fd.append('quality', quality)
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
                  const url = await uploadB64ToR2(b64, 'png', sessionFolder)
                  const img: GenerationResult = {
                    url,
                    styleId: `${scene.id}_gpt`,
                    styleName: scene.name,
                    model: 'gpt',
                  }
                  allImages.push(img)
                  send({ type: 'image', image: img })
                  await saveImageToSession(img, allImages.length - 1)
                }
              }
            } catch (e) { console.error('Memory scene error:', e) }
          })

          send({ type: 'progress', value: 15, message: 'Generating memory scenes...' })
          for (let i = 0; i < memTasks.length; i += 3) {
            if (i > 0) await new Promise(r => setTimeout(r, 20000))
            await Promise.all(memTasks.slice(i, i + 3).map(t => t()))
            send({
              type: 'progress',
              value: 15 + Math.round(((i + 3) / memTasks.length) * 75),
              message: `${allImages.length} memory portraits ready...`,
            })
          }
        }

        // ══════════════════════════════════════════════════════════════
        //  POST-GENERATION: Save metadata
        // ══════════════════════════════════════════════════════════════
        await saveSessionMetadata(sessionFolder, {
          sessionId: sessionId || sessionFolder,
          petName: petName || petType || 'Unknown',
          petType: petType || 'dog',
          petDescription: subjectProfile.summary,
          subjectProfile: subjectProfile.traits,
          isMemory,
          imageCount: allImages.length,
          createdAt: sessionStart,
          engineVersion: '2.0',
          generationParams: {
            model: 'gpt-image-2',
            size: '1024x1536',
            quality: 'tiered',
            inputFidelity: 'high',
          },
          styles: [...new Set(allImages.map(i => i.styleName))],
          images: allImages,
          brief: brief || null,
          songTitle: brief?.song_title || null,
          sunoPrompt: brief?.suno_prompt_full || null,
        })

        try {
          const gptCount = allImages.filter(x => x.model === 'gpt').length
          if (gptCount > 0) {
            await logApiUsage({
              sessionId: sessionFolder,
              provider: 'openai',
              model: 'gpt-image-2',
              operation: 'image_edit',
              imagesGenerated: gptCount,
            })
          }
          await logApiUsage({
            sessionId: sessionFolder,
            provider: 'openai',
            model: 'gpt-4o',
            operation: 'vision_analysis',
            tokensInput: 2000,
            tokensOutput: 500,
          })
        } catch (dbErr) { console.error('Database save failed (non-fatal):', dbErr) }

        if (brief?.suno_prompt_full && process.env.RESEND_API_KEY) {
          sendSongNotificationEmail({
            petName: petName || petType || 'Unknown',
            songTitle: brief.song_title || 'Custom Song',
            sunoPrompt: brief.suno_prompt_full,
            portraitTitle: brief.portrait_title || '',
            sessionFolder,
            firstImageUrl: allImages[0]?.url || '',
          }).catch((e: unknown) => console.error('Song notification email failed:', e))
        }

        send({ type: 'progress', value: 100, message: 'All portraits ready!' })
        send({
          type: 'done',
          images: allImages,
          sessionFolder,
          counts: {
            gpt: allImages.filter(x => x.model === 'gpt').length,
            total: allImages.length,
          },
        })
        controller.close()

      } catch (err) {
        console.error('Pipeline error:', err)
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

// ── Song Notification Email ──────────────────────────────────────────────
async function sendSongNotificationEmail({ petName, songTitle, sunoPrompt, portraitTitle, sessionFolder, firstImageUrl }: {
  petName: string; songTitle: string; sunoPrompt: string; portraitTitle: string; sessionFolder: string; firstImageUrl: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'support@petprintsstudio.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.petprintsstudio.com'
  const html = `<!DOCTYPE html><html><body style="background:#0A0A0A;color:#F5F0E8;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:40px 24px"><div style="background:#141414;border:1px solid rgba(201,168,76,.3);padding:32px;margin-bottom:20px"><div style="font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">New Song Request — Action Required</div><h1 style="font-size:28px;font-weight:400;color:#F5F0E8;margin:0 0 8px">🎵 ${petName}</h1><p style="color:rgba(245,240,232,.5);font-size:14px;margin:0 0 24px">${portraitTitle}</p><div style="background:#0A0A0A;border:1px solid rgba(245,240,232,.08);padding:16px;margin-bottom:16px"><div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Song Title</div><div style="font-size:16px;font-weight:600">${songTitle}</div></div><div style="background:#0A0A0A;border:2px solid rgba(201,168,76,.4);padding:16px;margin-bottom:24px"><div style="font-size:10px;letter-spacing:.2em;color:#C9A84C;margin-bottom:8px;text-transform:uppercase">Suno Prompt — Copy this into suno.com/create</div><div style="font-size:14px;line-height:1.8;color:rgba(245,240,232,.9);white-space:pre-wrap">${sunoPrompt}</div></div><a href="${appUrl}/admin/songs" style="display:inline-block;background:#C9A84C;color:#0A0A0A;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none">→ Open Song Admin to paste MP3 URL</a></div><div style="font-size:11px;color:rgba(245,240,232,.2);text-align:center">Session: ${sessionFolder}</div></div></body></html>`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Pet Prints Studio <orders@petprintsstudio.com>', to: adminEmail, subject: `🎵 New Song Request — ${petName}: "${songTitle}"`, html })
  })
}
