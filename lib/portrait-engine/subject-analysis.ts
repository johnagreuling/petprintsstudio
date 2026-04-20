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

/**
 * The analysis prompt for pet subjects.
 * Returns structured JSON with 13 identity fields.
 *
 * Designed to be:
 * - Exhaustive: captures every visual trait that matters for identity
 * - Specific: "golden apricot with cream chest blaze" not "light colored"
 * - Painter-oriented: describes what an artist needs to know to paint this exact animal
 */
const PET_ANALYSIS_SYSTEM_PROMPT = `You are a master portrait painter's assistant. Your job is to describe the exact animal(s) in this photo with the precision needed for an artist to paint a perfect likeness without ever seeing the original.

FIRST, count the distinct pet subjects in the image. A "pet subject" is a dog or cat whose face and body are visible enough to render as a portrait subject. Do not count pets that are heavily obscured, only partially visible as a tail/paw, or clearly background elements.

Then describe EACH pet individually in its own object. Describe ONLY that pet's features per object — do not blend descriptions across pets. If multiple pets share a trait (both are brown), still describe each separately.

Respond with ONLY a valid JSON object in this exact shape (no markdown, no backticks, no preamble):

{
  "subjectCount": <integer>,
  "subjects": [
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
    }
  ]
}

The subjects array should contain one object per pet detected, in left-to-right or foreground-first order.

If only one pet is present, return an array of length 1. Every field in every object must be a descriptive string, not a single word.`

/**
 * Extract a structured SubjectProfile from an uploaded pet photo.
 *
 * @param imageUrl - Accessible URL of the pet photo (presigned R2 URL)
 * @param apiKey - OpenAI API key
 * @param petType - Optional hint: "dog" or "cat"
 * @param petName - Optional name for fallback description
 * @returns SubjectProfile with structured identity traits
 */
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
        max_tokens: 2000,
        temperature: 0.2, // Low temperature for consistent, precise descriptions
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' }, // 'high' detail for identity extraction
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

    // Parse the JSON — handle potential markdown wrapping and stray comments
    let parsed: any
    try {
      let cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
      // Strip JSON5-style line comments that GPT-4o sometimes emits
      // (defensive: JSON.parse rejects `// ...` and `/* ... */`)
      cleaned = cleaned
        .replace(/^\s*\/\/.*$/gm, '')        // strip // line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')    // strip /* ... */ block comments
        .replace(/,(\s*[}\]])/g, '$1')       // strip trailing commas before } or ]
      parsed = JSON.parse(cleaned)
    } catch (parseErr: any) {
      console.error('🚨 Vision JSON parse FAILED:', parseErr.message)
      console.error('  Raw content (first 500 chars):', content.slice(0, 500))
      console.error('  Raw content (last 200 chars):', content.slice(-200))
      // Fallback: use the raw text as a summary
      return {
        subjectType: 'pet',
        summary: content.slice(0, 500),
        traits: { description: content },
        mustPreserve: ['description'],
        rawAnalysis: content,
      }
    }

    // Normalize to always-array form. New contract: { subjectCount, subjects: [...] }.
    // Legacy fallback: if the model returned the flat 13-field object (no subjects array),
    // wrap it as a single-subject array.
    let subjects: Record<string, string>[]
    if (Array.isArray(parsed?.subjects) && parsed.subjects.length > 0) {
      // Filter out null/non-object entries defensively
      subjects = parsed.subjects.filter((s: any) => s && typeof s === 'object')
      if (subjects.length === 0) {
        console.error('🚨 Vision subjects array was present but all entries were invalid')
        return buildFallbackProfile(fallbackSummary, petType)
      }
    } else if (parsed && typeof parsed === 'object' && (parsed.species || parsed.breed)) {
      // Legacy single-pet response shape
      subjects = [parsed as Record<string, string>]
    } else {
      console.error('🚨 Vision response missing subjects. Parsed shape:', JSON.stringify(parsed).slice(0, 400))
      return buildFallbackProfile(fallbackSummary, petType)
    }

    // Kill switch: force single-subject mode if env flag disabled.
    if (process.env.MULTI_SUBJECT_ENABLED === 'false' && subjects.length > 1) {
      console.log(`🔒 MULTI_SUBJECT_ENABLED=false — collapsing ${subjects.length} detected pets to 1`)
      subjects = [subjects[0]]
    }

    console.log(`✓ Vision detected ${subjects.length} pet subject${subjects.length > 1 ? 's' : ''}`)

    const primary = subjects[0]
    const additional = subjects.length > 1 ? subjects.slice(1) : undefined

    // Build a rich one-line summary from the primary subject
    const summary = [
      primary.breed || primary.species || petType || 'pet',
      primary.coatColors ? `with ${primary.coatColors} coat` : '',
      primary.distinctiveFeatures ? `— ${primary.distinctiveFeatures}` : '',
      additional && additional.length > 0 ? `(+ ${additional.length} more pet${additional.length > 1 ? 's' : ''})` : '',
    ].filter(Boolean).join(' ')

    // Determine which traits are critical for identity preservation (primary only)
    const mustPreserve = PET_TRAIT_KEYS.filter(key =>
      primary[key] && primary[key] !== 'none visible' && primary[key].length > 3
    )

    return {
      subjectType: 'pet',
      summary,
      traits: primary,
      additionalSubjects: additional,
      mustPreserve: mustPreserve as string[],
      rawAnalysis: content,
    }
  } catch (err) {
    console.error('Subject analysis failed:', err)
    return buildFallbackProfile(fallbackSummary, petType)
  }
}

/** Build a minimal fallback profile when vision analysis fails */
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
