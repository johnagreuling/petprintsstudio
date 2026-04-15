// ════════════════════════════════════════════════════════════════════════════
//  PORTRAIT ENGINE — Subject Analysis
//
//  Uses GPT-4o vision to extract a structured SubjectProfile from the
//  uploaded photo. This is THE identity source for all downstream prompts.
//
//  The old system used GPT-4o-mini with a 1-sentence output (~30-50 words).
//  This uses GPT-4o (full) with a 13-field structured JSON extraction,
//  producing ~300-500 words of precise identity description.
//
//  Why GPT-4o instead of 4o-mini? Identity extraction is the single most
//  important step in the pipeline. A $0.005 vision call that prevents a
//  $0.50+ failed generation is the best ROI in the system.
// ════════════════════════════════════════════════════════════════════════════

import { SubjectProfile, PET_TRAIT_KEYS } from './types'

const PET_ANALYSIS_SYSTEM_PROMPT = `You are a master portrait painter's assistant. Your job is to describe the exact animal in this photo with the precision needed for an artist to paint a perfect likeness without ever seeing the original.

Respond with ONLY a valid JSON object (no markdown, no backticks, no preamble). Every field must be a descriptive string, not a single word.

Required JSON fields:
{
  "species": "dog or cat",
  "breed": "specific breed or mix description, including coat type qualifier (e.g., 'Goldendoodle with loose curly coat', 'domestic shorthair tabby')",
  "coatColors": "all colors present, with primary and secondary noted (e.g., 'golden apricot primary with cream highlights on chest and muzzle')",
  "coatTexture": "length, curl pattern, density, sheen (e.g., 'medium-length loose wavy curls, soft and fluffy, matte finish')",
  "markings": "any distinct patterns, patches, gradients, or color transitions (e.g., 'darker apricot on ears fading to cream on muzzle, white chest blaze')",
  "eyeColor": "precise color and quality (e.g., 'dark brown, almost black, with warm amber reflection in light')",
  "earType": "shape, set, position (e.g., 'medium floppy drop ears set level with eye line, covered in wavy fur')",
  "muzzleShape": "length, width, shape (e.g., 'medium-length rounded muzzle with prominent black nose, slight beard')",
  "noseColor": "exact nose color (e.g., 'solid black, slightly textured')",
  "bodySize": "build and proportions (e.g., 'medium build, 40-50lbs, athletic but fluffy, legs proportional')",
  "accessories": "any collars, harnesses, tags, bandanas, bows visible (e.g., 'red leather collar with round gold tag') or 'none visible'",
  "expression": "emotional quality and mouth position (e.g., 'happy open-mouth smile, tongue slightly out, bright engaged eyes')",
  "distinctiveFeatures": "1-3 most identifying traits a painter must get right (e.g., 'signature teddy bear face with round dark eyes, prominent fluffy golden curls framing face')"
}`

export async function analyzePetSubject(
  imageUrl: string,
  apiKey: string,
  petType?: string,
  petName?: string,
): Promise<SubjectProfile> {
  const fallbackSummary = `${petType || 'dog'} named ${petName || 'the pet'}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 800,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
            {
              type: 'text',
              text: PET_ANALYSIS_SYSTEM_PROMPT,
            },
          ],
        }],
      }),
    })

    if (!response.ok) {
      console.error('Vision API error:', response.status, await response.text())
      return buildFallbackProfile(fallbackSummary, petType)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      console.error('Vision API returned empty content')
      return buildFallbackProfile(fallbackSummary, petType)
    }

    let traits: Record<string, string>
    try {
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
      traits = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('Failed to parse vision response as JSON:', content.slice(0, 200))
      return {
        subjectType: 'pet',
        summary: content.slice(0, 500),
        traits: { description: content },
        mustPreserve: ['description'],
        rawAnalysis: content,
      }
    }

    const summary = [
      traits.breed || traits.species || petType || 'pet',
      traits.coatColors ? `with ${traits.coatColors} coat` : '',
      traits.distinctiveFeatures ? `— ${traits.distinctiveFeatures}` : '',
    ].filter(Boolean).join(' ')

    const mustPreserve = PET_TRAIT_KEYS.filter(key =>
      traits[key] && traits[key] !== 'none visible' && traits[key].length > 3
    )

    return {
      subjectType: 'pet',
      summary,
      traits,
      mustPreserve: mustPreserve as string[],
      rawAnalysis: content,
    }
  } catch (err) {
    console.error('Subject analysis failed:', err)
    return buildFallbackProfile(fallbackSummary, petType)
  }
}

function buildFallbackProfile(summary: string, petType?: string): SubjectProfile {
  return {
    subjectType: 'pet',
    summary,
    traits: {
      species: petType || 'dog',
      description: summary,
    },
    mustPreserve: ['species', 'description'],
    rawAnalysis: '',
  }
}
