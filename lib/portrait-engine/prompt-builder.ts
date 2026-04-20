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

/** Emit the 13 labeled trait fields for one pet. Shared by single & multi. */
function emitPetTraitFields(traits: Record<string, string>): string[] {
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
  const lines: string[] = []
  for (const key of PET_TRAIT_KEYS) {
    const value = traits[key]
    if (value && value.length > 2) {
      const label = traitLabels[key] || key
      lines.push(`${label}: ${value}`)
    }
  }
  return lines
}

/** Shared clothing-lock directive block — applied to single and multi. */
function buildClothingLock(primaryTraits: Record<string, string>, subjectCount: number): string[] {
  const lines: string[] = []
  const sourceAccessories = primaryTraits.accessories || ''
  const hasSourceAccessories = sourceAccessories && sourceAccessories !== 'none visible' && sourceAccessories.length > 5
  const plural = subjectCount > 1
  const subjectNoun = plural ? 'animals' : 'animal'
  const wearsVerb = plural ? 'wear' : 'wears'
  const subjectPronoun = plural ? 'them' : 'the animal'
  const collarNoun = plural ? 'collars' : 'collar'
  lines.push('CLOTHING & COSTUME LOCK — ABSOLUTELY CRITICAL:')
  if (hasSourceAccessories) {
    lines.push(`The ${subjectNoun} in the reference photo ${wearsVerb}: ${sourceAccessories}`)
    lines.push('Preserve ONLY these accessories. Do not add any additional clothing, costumes, jewelry, hats, scarves, ties, or accessories.')
  } else {
    lines.push(`The ${subjectNoun} in the reference photo ${wearsVerb} NOTHING — no ${collarNoun}, no clothing, no accessories.`)
    lines.push(`The output ${subjectNoun} must wear NOTHING. No costumes, crowns, jewelry, scarves, bandanas, ties, hats, vests, capes, robes, or any clothing whatsoever.`)
    lines.push('No royal regalia, no holiday outfits, no themed costumes, no decorative items on the body.')
  }
  lines.push(`Decorative elements from the style (velvet, gold, crowns, jewels) belong in the BACKGROUND ONLY — never on ${subjectPronoun}.`)
  return lines
}

/** Single-subject identity block — BYTE-IDENTICAL to pre-multi-subject behavior. */
function buildSingleSubjectIdentity(subject: SubjectProfile): string {
  const lines: string[] = []
  lines.push('SUBJECT IDENTITY — PRESERVE EXACTLY FROM REFERENCE PHOTO:')
  lines.push('')

  for (const line of emitPetTraitFields(subject.traits)) {
    lines.push(line)
  }

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
  lines.push('')

  for (const line of buildClothingLock(subject.traits, 1)) {
    lines.push(line)
  }

  return lines.join('\n')
}

/** Multi-subject identity block — enforces per-pet identity, arrangement,
 *  style parity across enumerated axes, and edit-invariants. */
function buildMultiSubjectIdentity(subject: SubjectProfile): string {
  const allSubjects = [subject.traits, ...(subject.additionalSubjects || [])]
  const n = allSubjects.length
  const petLabel = (idx: number) => `Pet ${String.fromCharCode(65 + idx)}` // A, B, C, D...

  const lines: string[] = []
  lines.push(`SUBJECT IDENTITY — MULTI-SUBJECT PORTRAIT with ${n} co-equal primary subjects from reference photo.`)
  lines.push('PRESERVE EACH SUBJECT EXACTLY. Describe and paint each distinctly.')
  lines.push('')

  // Per-pet labeled trait blocks
  for (let i = 0; i < allSubjects.length; i++) {
    lines.push(`${petLabel(i)} —`)
    for (const line of emitPetTraitFields(allSubjects[i])) {
      lines.push(line)
    }
    lines.push('')
  }

  // Edit-invariants (GPT review recommendation — frames this as a CONSTRAINED edit)
  lines.push('EDIT INVARIANTS — WHAT MUST NOT CHANGE FROM THE SOURCE PHOTO:')
  lines.push(`- Subject count: the output must contain exactly ${n} pets, no more, no less.`)
  lines.push('- Subject identity: each pet retains its own distinct face, coat, markings, and features as described above.')
  lines.push('- Spatial arrangement: preserve left/right positioning, foreground/background relationships, and which pet is nearer to the viewer. Each pet must appear in the same relative position as in the source photo.')
  lines.push('- Relative size: preserve the natural size relationship between pets from the source photo.')
  lines.push('Change ONLY the artistic style, rendering medium, and painterly finish. Do not reinterpret the scene.')
  lines.push('')

  // Critical multi-subject preservation
  lines.push('CRITICAL MULTI-SUBJECT PRESERVATION:')
  lines.push('- Each pet retains its own distinct identity. No feature blending, no averaging, no merging between pets.')
  lines.push('- Every pet must be fully visible with its face readable at first glance.')
  lines.push('- Every pet receives co-equal visual priority — no pet may be rendered as a secondary or background element.')
  lines.push('- No pet may be cropped, shrunken, blurred, or de-emphasized relative to the others.')
  lines.push('')

  // Style parity — enumerate every axis where drift happens
  lines.push('STYLE PARITY DIRECTIVE — APPLY IDENTICAL RENDERING LOGIC TO EVERY SUBJECT:')
  lines.push('Render every pet with the exact same treatment across every axis:')
  lines.push('- Identical detail level (no pet more detailed or sharper than another)')
  lines.push('- Identical edge treatment (same stroke sharpness or softness on all subjects)')
  lines.push('- Identical abstraction level (no pet more realistic or more abstract than the others)')
  lines.push('- Identical lighting response (same highlights, same shadow falloff on every subject)')
  lines.push('- Identical texture intensity (same paint thickness, same surface finish weight)')
  lines.push('- Identical finish quality (same crispness, same polish, same final render pass)')
  lines.push('The final image must read as one unified portrait of all pets together, not a main subject with companions.')
  lines.push('')

  // Per-pet preservation checklist
  lines.push('CRITICAL PRESERVATION LIST — Check every element for EVERY pet:')
  lines.push('✓ Exact face shape and facial proportions (per pet)')
  lines.push('✓ Exact muzzle length, width, shape, and nose color (per pet)')
  lines.push('✓ Exact ear shape, set, fur coverage, and position (per pet)')
  lines.push('✓ Exact eye color, shape, spacing, and expression (per pet)')
  lines.push('✓ Exact coat colors, patterns, gradients, and markings (per pet)')
  lines.push('✓ Exact fur length, texture, curl pattern, and volume (per pet)')
  lines.push('✓ Exact body proportions and size impression (per pet)')
  lines.push('✓ All visible accessories per pet (collar, tag, bandana)')
  lines.push('')
  lines.push('DO NOT: Substitute generic breed examples. DO NOT invent markings on any pet.')
  lines.push('DO NOT blend features between pets. DO NOT average their appearance.')
  lines.push('Each pet must clearly read as the SAME specific animal from the reference photo — individually recognizable.')
  lines.push('')

  // Shared clothing lock
  for (const line of buildClothingLock(subject.traits, n)) {
    lines.push(line)
  }

  return lines.join('\n')
}

function buildIdentityBlock(subject: SubjectProfile): string {
  if (subject.subjectType !== 'pet') {
    // Fallback for non-pet subjects (future use)
    const lines: string[] = []
    lines.push('SUBJECT IDENTITY — PRESERVE EXACTLY:')
    lines.push(subject.summary)
    for (const [key, value] of Object.entries(subject.traits)) {
      if (value) lines.push(`${key}: ${value}`)
    }
    return lines.join('\n')
  }

  const hasAdditional = Array.isArray(subject.additionalSubjects) && subject.additionalSubjects.length > 0
  return hasAdditional
    ? buildMultiSubjectIdentity(subject)
    : buildSingleSubjectIdentity(subject)
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
  const totalSubjects = 1 + (subject.additionalSubjects?.length || 0)

  // Universal constraints that apply to ALL generations.
  // "no extra animals" is gated on subject count — for multi-pet it would
  // actively fight the desired output, so we replace it with an exact-N directive.
  const universal = [
    'No text, letters, words, or writing of any kind',
    'No watermarks, signatures, or logos',
    totalSubjects === 1
      ? 'No extra animals, people, or creatures'
      : `The output must contain exactly ${totalSubjects} pets matching the reference photo — no additional animals, people, or creatures beyond those in the source`,
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
    'NO clothing on the animal — no costumes, crowns, hats, scarves, bandanas, ties, vests, capes, robes',
    'NO jewelry on the animal — no necklaces, earrings, decorative collars not in source photo',
    'Style decorative elements (velvet, gold, jewels) must stay in BACKGROUND only',
  ] : []

  // Multi-subject-specific constraints — echo the identity-block invariants
  // into the hard-constraints section for redundant enforcement
  const multiSubjectConstraints = totalSubjects > 1 ? [
    'No feature blending or averaging between pets — each retains its own distinct identity',
    'No pet rendered at a different detail, abstraction, or finish level than the others',
    'No pet positioned differently from its location in the source photo — preserve left/right, foreground/background, and relative scale',
    'No pet rendered as a background or secondary element — every pet is a co-equal primary subject',
  ] : []

  // Style-specific forbidden traits
  const styleForbidden = style.forbiddenTraits.map(t => `No ${t}`)

  const all = [...universal, ...petConstraints, ...multiSubjectConstraints, ...styleForbidden]

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

  // Dynamic composition: for multi-subject, adjust scale + placement so all
  // pets fit together without crowding. Single-pet leaves composition unchanged.
  const totalSubjects = 1 + (subject.additionalSubjects?.length || 0)
  const effectiveComposition: CompositionProfile = totalSubjects === 1
    ? composition
    : {
        ...composition,
        subjectScale: totalSubjects === 2 ? 45 : 35, // % per subject
        subjectPlacement: 'centered unified group, all subjects equally visible, preserving relative arrangement from source',
      }

  const identityBlock = buildIdentityBlock(subject)
  const compositionBlock = buildCompositionBlock(effectiveComposition, style.preferredFraming)
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
  const totalSubjects = 1 + (subject.additionalSubjects?.length || 0)
  const effectiveComposition: CompositionProfile = totalSubjects === 1
    ? composition
    : {
        ...composition,
        subjectScale: totalSubjects === 2 ? 45 : 35,
        subjectPlacement: 'centered unified group, all subjects equally visible, preserving relative arrangement from source',
      }

  const identityBlock = buildIdentityBlock(subject)
  const compositionBlock = buildCompositionBlock(effectiveComposition, style.preferredFraming)
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
