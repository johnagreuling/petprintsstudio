import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const BRIEF_SCHEMA = {
  type: 'object' as const,
  properties: {
    portrait_title: { type: 'string' as const },
    song_title: { type: 'string' as const },
    emotional_theme: { type: 'string' as const },
    image_prompt_core: { type: 'string' as const },
    image_prompt_full: { type: 'string' as const },
    suno_prompt_full: { type: 'string' as const },
    lyric_concept: { type: 'string' as const },
    story_elements: { type: 'array' as const, items: { type: 'string' as const } },
    props: { type: 'array' as const, items: { type: 'string' as const } },
    locations: { type: 'array' as const, items: { type: 'string' as const } },
    color_palette: { type: 'string' as const },
    text_elements: { type: 'array' as const, items: { type: 'string' as const } }
  },
  required: ['portrait_title','song_title','emotional_theme','image_prompt_core','image_prompt_full','suno_prompt_full','lyric_concept','story_elements','props','locations','color_palette','text_elements'] as const,
  additionalProperties: false as const
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { petName, petType, personality, favoritePlace, specialObjects, specialPeople, mood, musicStyle, selectedStyleName, additionalNotes } = body
    if (!petName || !petType) return NextResponse.json({ error: 'petName and petType required' }, { status: 400 })

    const systemPrompt = `You are the creative director for a premium AI pet portrait studio.
Transform a customer's emotional answers about their pet into:
1. A stunning visual portrait concept for an AI image model
2. A deeply personal custom song for Suno AI music generation

Both must come from the SAME story — the same emotional truth about this specific pet.
Rules:
- Be personal and specific. Use the actual pet name, actual places, actual objects mentioned.
- The image prompt should be painterly and evocative, not technical.
- The Suno prompt must include: genre, tempo, vocal style, emotional arc, specific lyrical imagery.
- Never be generic. Every brief should feel unique to THIS pet.
- The portrait title should make the owner emotional when they read it.`

    const userPrompt = `Create a complete creative brief for this pet portrait + custom song:

PET NAME: ${petName}
PET TYPE: ${petType}
PERSONALITY: ${personality || 'Not specified'}
FAVORITE PLACE OR ACTIVITY: ${favoritePlace || 'Not specified'}
SPECIAL OBJECTS OR PROPS: ${specialObjects || 'Not specified'}
SPECIAL PEOPLE IN THEIR LIFE: ${specialPeople || 'Not specified'}
DESIRED MOOD/VIBE: ${mood || 'Warm and nostalgic'}
MUSIC STYLE PREFERENCE: ${musicStyle || 'Emotional pop/folk'}
ART STYLE SELECTED: ${selectedStyleName || 'Oil Painting'}
ADDITIONAL NOTES: ${additionalNotes || 'None'}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'creative_brief', strict: true, schema: BRIEF_SCHEMA }
      },
      temperature: 0.9,
      max_tokens: 2000
    })

    const content = response.choices[0].message.content
    if (!content) return NextResponse.json({ error: 'No response from GPT' }, { status: 500 })
    return NextResponse.json(JSON.parse(content))

  } catch (err: any) {
    console.error('Creative brief error:', err)
    return NextResponse.json({ error: err.message || 'Brief generation failed' }, { status: 500 })
  }
}
