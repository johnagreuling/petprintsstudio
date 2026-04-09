import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { petName, petType, personality, favoritePlace, specialObjects, specialPeople, mood, musicStyle, selectedStyleName, additionalNotes, customStyleRequest, generateStylePromptOnly } = body

    // Mode: generate a custom style prompt from free-form description
    if (generateStylePromptOnly && customStyleRequest) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an expert AI image prompt engineer for pet portrait art. Convert a customer style description into a precise, vivid image generation prompt in 2-3 sentences. Include: artistic technique, color palette, lighting, mood. End with "museum quality, highly detailed."' },
            { role: 'user', content: `Convert this into an image generation prompt for a pet portrait: "${customStyleRequest}"` }
          ],
          max_tokens: 250,
          temperature: 0.7,
        })
      })
      const d = await r.json()
      const custom_style_prompt = d.choices?.[0]?.message?.content?.trim() || ''
      return NextResponse.json({ custom_style_prompt })
    }
    if (!petName || !petType) return NextResponse.json({ error: 'petName and petType required' }, { status: 400 })

    const systemPrompt = `You are the creative director for a premium AI pet portrait studio.
Transform a customer's emotional answers about their pet into:
1. A stunning visual portrait concept for an AI image model
2. A deeply personal custom song concept for Suno AI music generation
Both must come from the SAME story — the same emotional truth about this specific pet.
Rules:
- Be personal and specific. Use the actual pet name, actual places, actual objects mentioned.
- The image prompt should be painterly and evocative, not technical.
- The Suno prompt must include: genre, tempo, vocal style, emotional arc, specific lyrical imagery.
- Never be generic. Every brief should feel unique to THIS pet.
- The portrait title should make the owner emotional when they read it.
You MUST respond with valid JSON only matching this exact schema:
{
  "portrait_title": "string",
  "song_title": "string",
  "emotional_theme": "string",
  "image_prompt_core": "string",
  "image_prompt_full": "string",
  "suno_prompt_full": "string",
  "lyric_concept": "string",
  "story_elements": ["string"],
  "props": ["string"],
  "locations": ["string"],
  "color_palette": "string",
  "text_elements": ["string"]
}`

    const userPrompt = `Create a complete creative brief:
PET NAME: ${petName}
PET TYPE: ${petType}
PERSONALITY: ${personality || 'Not specified'}
FAVORITE PLACE: ${favoritePlace || 'Not specified'}
SPECIAL OBJECTS: ${specialObjects || 'Not specified'}
SPECIAL PEOPLE: ${specialPeople || 'Not specified'}
MOOD/VIBE: ${mood || 'Warm and nostalgic'}
MUSIC STYLE: ${musicStyle || 'Emotional pop/folk'}
ART STYLE: ${selectedStyleName || 'Oil Painting'}
NOTES: ${additionalNotes || 'None'}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 2000
      })
    })
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`)
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'No response from GPT' }, { status: 500 })
    return NextResponse.json(JSON.parse(content))

  } catch (err: any) {
    console.error('Creative brief error:', err)
    return NextResponse.json({ error: err.message || 'Brief generation failed' }, { status: 500 })
  }
}
