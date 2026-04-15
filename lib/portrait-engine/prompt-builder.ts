// ════════════════════════════════════════════════════════════════════════════
//  PORTRAIT ENGINE — Prompt Builder
//
//  Assembles modular prompt blocks in this mandatory order:
//    1. Identity (what the subject IS)
//    2. Composition (how it's framed)
//    3. Style (artistic technique)
//    4. Lighting / Environment
//    5. Output / Print quality
//    6. Negative constraints
//
//  This ordering keeps subject preservation prioritized above aesthetics.
//  Per the PRD: "Identity first, composition second, style third."
//
//  The builder is subject-agnostic. It takes a SubjectProfile (which could
//  describe a dog, a person, or a car) and a StyleTemplate, and assembles
//  a complete prompt.
// ════════════════════════════════════════════════════════════════════════════

import {
  SubjectProfile,
  StyleTemplate,
  CompositionProfile,
  PromptPackage,
  FramingMode,
  PET_TRAIT_KEYS,
} from './types'

// ── Block 1: Subject Identity ────────────────────────────────────────────

function buildIdentityBlock(subject: SubjectProfile): string {
  const lines: string[] = []

  if (subject.subjectType === 'pet') {
    lines.push('SUBJECT IDENTITY — PRESERVE EXACTLY FROM REFERENCE PHOTO:')
    lines.push('')

    // Emit every populated trait as a named field
    const traitLabels: Record<string, string> = {
      species: 'Species',
      breed: 'Breed',
      coatColors: 'Coat Colors',
      coatTexture: 'Coat Texture',
      markings: 'Markings',
      eyeColor: 'Eye Color',
      earType: 'Ears',
      muzzleShape: 'Muzzle',
      noseColor: 'Nose',
      bodySize: 'Body',
      accessories: 'Accessories',
      expression: 'Expression',
      distinctiveFeatures: 'Distinctive Features',
    }

    for (const key of PET_TRAIT_KEYS) {
      const value = subject.traits[key]
      if (value && value.length > 2) {
        const label = traitLabels[key] || key
        lines.push(`${label}: ${value}`)
      }
    }

    // The preserve list — repeated per OpenAI cookbook to reduce drift
    lines.push('')
    lines.push('CRITICAL PRESERVATION LIST — Check every element:')
    lines.push('✓ Exact face shape and all facial proportions')
    lines.push('✓ Exact muzzle length, width, shape, and nose color')
    lines.push('✓ Exact ear shape, set, fur coverage, and position')
    lines.push('✓ Exact eye color, shape, spacing, and expression')
    lines.push('✓ Exact coat colors, patterns, gradients, and markings')
    lines.push('✓ Exact fur length, texture, curl pattern, and volume')
    lines.push('✓ Exact body proportions and size impression')
    lines.push('✓ All visible accessories (collar, tag, bandana)')
    lines.push('')
    lines.push('DO NOT: Substitute a generic breed example. DO NOT invent markings.')
    lines.push('DO NOT change colors, age, body type, or expression.')
    lines.push('This must clearly read as the SAME specific animal from the reference photo.')
  } else {
    // Fallback for non-pet subjects (future use)
    lines.push('SUBJECT IDENTITY — PRESERVE EXACTLY:')
    lines.push(subject.summary)
    for (const [key, value] of Object.entries(subject.traits)) {
      if (value) lines.push(`${key}: ${value}`)
    }
  }

  return lines.join('\n')
}

// ── Block 2: Composition ─────────────────────────────────────────────────

function buildCompositionBlock(
  composition: CompositionProfile,
  styleOverrideFraming?: FramingMode
): string {
  const framing = styleOverrideFraming || composition.framingMode
  const lines: string[] = []

  lines.push('COMPOSITION:')

  // Framing instructions
  const framingInstructions: Record<FramingMode, string> = {
    preserve_source: `Follow the source image framing exactly.
If the uploaded image shows the full animal, the output must show the full animal.
If the uploaded image shows head and shoulders, maintain that framing.
Do not crop more tightly than the source image.
Do not reinterpret the image as a headshot or tight crop.
Do not zoom in beyond what the source shows.`,

    full_subject: `Show the entire subject comfortably contained in frame.
Include: full head, both ears, full torso, all legs, all paws, tail if visible.
Do not crop ears, muzzle, torso, legs, paws, tail, or outer silhouette.
Leave generous breathing room on all sides.
The full subject should occupy approximately 60-75% of the frame height.`,

    three_quarter: `Show head, full torso, and upper legs.
The subject should fill approximately 70-80% of the frame height.
Ensure both ears and full face are completely visible.
Leave comfortable breathing room above the head.`,

    bust: `Head-and-shoulders composition.
Full head with both ears completely visible.
Include upper chest/shoulders for context.
The head should occupy approximately 40-55% of the frame height.
Leave breathing room above and on both sides.`,

    face_closeup: `Face fills the frame as the dominant element.
Full head with both ears and chin completely visible.
The head should occupy approximately 55-70% of the frame height.
Leave some breathing room — do not let features touch edges.`,

    environmental: `Subject placed naturally within a wider scene.
Subject should occupy approximately 40-60% of the frame height.
Environment provides context and atmosphere.
Subject remains the clear focal point despite scene detail.`,
  }

  lines.push(framingInstructions[framing])

  // Aspect ratio and print requirements
  lines.push('')
  lines.push(`Aspect ratio: vertical ${composition.aspectRatio} portrait orientation (1024×1536).`)
  lines.push(`Subject placement: ${composition.subjectPlacement}.`)

  // Crop safety
  if (composition.cropSafety.length > 0) {
    lines.push('')
    lines.push('Crop safety rules:')
    for (const rule of composition.cropSafety) {
      lines.push(`- ${rule}`)
    }
  }

  return lines.join('\n')
}

// ── Block 3: Style ───────────────────────────────────────────────────────

function buildStyleBlock(style: StyleTemplate): string {
  const lines: string[] = []

  lines.push(`STYLE — ${style.name}:`)
  lines.push('')
  lines.push(`Technique: ${style.technique}`)
  lines.push('')
  lines.push(`Paint Surface: ${style.paintSurface}`)
  lines.push('')
  lines.push(`Color Palette: ${style.colorPalette}`)
  lines.push('')
  lines.push(`Mood: ${style.mood}`)

  if (style.styleConstraints.length > 0) {
    lines.push('')
    lines.push('Style requirements:')
    for (const c of style.styleConstraints) {
      lines.push(`- ${c}`)
    }
  }

  return lines.join('\n')
}

// ── Block 4: Environment / Lighting ──────────────────────────────────────

function buildEnvironmentBlock(style: StyleTemplate): string {
  const lines: string[] = []

  lines.push('ENVIRONMENT & LIGHTING:')
  lines.push('')
  lines.push(`Background: ${style.background}`)
  lines.push('')
  lines.push(`Lighting: ${style.lighting}`)

  return lines.join('\n')
}

// ── Block 5: Output / Print Quality ──────────────────────────────────────

function buildOutputBlock(): string {
  return `OUTPUT REQUIREMENTS:
- Vertical 2:3 portrait orientation (1024×1536)
- Print-ready with safe margins on all sides
- Gallery quality suitable for enlargement to 24×36 inch prints
- Readable eyes and clear focal face
- Stable midtones, no muddy shadows
- No harsh digital halos or artifacts
- Clean enough to enlarge without obvious AI artifacts`
}

// ── Block 6: Negative Constraints ────────────────────────────────────────

function buildConstraintsBlock(
  style: StyleTemplate,
  subject: SubjectProfile
): string {
  // Universal constraints that apply to ALL generations
  const universal = [
    'No text, letters, words, or writing of any kind',
    'No watermarks, signatures, or logos',
    'No extra animals, people, or creatures',
    'No extra limbs, tails, or anatomical errors',
    'No malformed paws, muzzle, or ears',
    'No duplicated features',
    'No random accessories not in the source photo',
    'No generic breed substitution',
    'No bad crop — all key features must be within frame',
  ]

  // Subject-type constraints
  const petConstraints = subject.subjectType === 'pet' ? [
    'Do not alter markings, coat color, or pattern',
    'Do not change eye color or expression',
    'Do not add clothing unless specified',
  ] : []

  // Style-specific forbidden traits
  const styleForbidden = style.forbiddenTraits.map(t => `No ${t}`)

  const all = [...universal, ...petConstraints, ...styleForbidden]

  const lines: string[] = ['HARD CONSTRAINTS:']
  for (const c of all) {
    lines.push(`- ${c}`)
  }

  return lines.join('\n')
}

// ── Main Assembly Function ───────────────────────────────────────────────

/**
 * Default composition profile for portrait prints.
 * Used when no custom composition is provided.
 */
export const DEFAULT_COMPOSITION: CompositionProfile = {
  aspectRatio: '2:3',
  framingMode: 'preserve_source',
  subjectPlacement: 'centered or slightly low-centered',
  subjectScale: 65,
  cropSafety: [
    'Both ears fully visible — do not crop',
    'Full muzzle visible — do not crop',
    'If paws are in source, keep them in frame',
    'No part of the subject should touch the frame edge',
  ],
  negativeSpaceNotes: 'Clean background with enough space for wall-art framing',
}

/**
 * Assemble a complete prompt from modular blocks.
 *
 * Block order (per PRD): identity → composition → style → environment → output → constraints
 * This keeps subject preservation prioritized above aesthetics.
 */
export function buildPrompt(
  subject: SubjectProfile,
  style: StyleTemplate,
  composition: CompositionProfile = DEFAULT_COMPOSITION,
): PromptPackage {
  const preamble = `Create a ${style.technique.split('.')[0].toLowerCase()} of the pet from the reference image.`

  const identityBlock = buildIdentityBlock(subject)
  const compositionBlock = buildCompositionBlock(composition, style.preferredFraming)
  const styleBlock = buildStyleBlock(style)
  const environmentBlock = buildEnvironmentBlock(style)
  const outputBlock = buildOutputBlock()
  const constraintsBlock = buildConstraintsBlock(style, subject)

  // Assemble in mandatory order
  const fullPrompt = [
    preamble,
    '',
    identityBlock,
    '',
    compositionBlock,
    '',
    styleBlock,
    '',
    environmentBlock,
    '',
    outputBlock,
    '',
    constraintsBlock,
  ].join('\n')

  return {
    fullPrompt,
    blocks: {
      identity: identityBlock,
      composition: compositionBlock,
      style: styleBlock,
      environment: environmentBlock,
      output: outputBlock,
      constraints: constraintsBlock,
    },
    styleId: style.id,
    styleVersion: style.version,
    assembledAt: new Date().toISOString(),
  }
}

// ── Memory Scene Prompt Builder ──────────────────────────────────────────

/**
 * Build a scene-based prompt for memory/lifestyle portraits.
 * Uses the same modular architecture but adds scene context.
 */
export function buildMemoryScenePrompt(
  subject: SubjectProfile,
  style: StyleTemplate,
  sceneDescription: string,
  personalDetails: string,
  composition: CompositionProfile = DEFAULT_COMPOSITION,
): PromptPackage {
  const identityBlock = buildIdentityBlock(subject)
  const compositionBlock = buildCompositionBlock(composition, style.preferredFraming)
  const styleBlock = buildStyleBlock(style)
  const outputBlock = buildOutputBlock()
  const constraintsBlock = buildConstraintsBlock(style, subject)

  const sceneBlock = `SCENE:
${sceneDescription}
${personalDetails ? `\nPersonal details to include: ${personalDetails}` : ''}`

  const fullPrompt = [
    `Create a ${style.technique.split('.')[0].toLowerCase()} scene portrait of the pet from the reference image.`,
    '',
    identityBlock,
    '',
    compositionBlock,
    '',
    sceneBlock,
    '',
    styleBlock,
    '',
    `ENVIRONMENT & LIGHTING:
Background: The scene setting described above — rendered in the ${style.name} style.
Lighting: ${style.lighting}`,
    '',
    outputBlock,
    '',
    constraintsBlock,
  ].join('\n')

  return {
    fullPrompt,
    blocks: {
      identity: identityBlock,
      composition: compositionBlock,
      style: styleBlock,
      environment: sceneBlock,
      output: outputBlock,
      constraints: constraintsBlock,
    },
    styleId: style.id,
    styleVersion: style.version,
    assembledAt: new Date().toISOString(),
  }
}
