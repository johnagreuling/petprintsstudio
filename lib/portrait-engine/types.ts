// ════════════════════════════════════════════════════════════════════════════
//  PORTRAIT ENGINE — Core Types
//
//  Subject-agnostic type system. The engine doesn't care if it's painting
//  a goldendoodle, a '67 Mustang, or a bride — it cares about:
//    1. What is the subject? (SubjectProfile)
//    2. How should it be framed? (CompositionProfile)
//    3. What artistic style? (StyleTemplate)
//    4. What must never appear? (constraints)
//
//  These types are the contract between the analysis step, the prompt
//  builder, and the generation API.
// ════════════════════════════════════════════════════════════════════════════

// ── Subject Identity ─────────────────────────────────────────────────────

export type SubjectType = 'pet' | 'person' | 'vehicle' | 'object'

/**
 * Structured identity profile extracted from the source image by a vision model.
 * Every field that matters for preserving the subject's identity across styles.
 *
 * For pets, this is breed/coat/markings/eyes/etc.
 * For people, this would be hair/skin/build/clothing/etc.
 * For vehicles, this would be make/model/color/condition/etc.
 *
 * The `traits` record is intentionally open-ended — the analysis prompt
 * determines which keys get populated based on subject type.
 */
export interface SubjectProfile {
  subjectType: SubjectType
  /** One-line summary for fallback/logging: "Golden Retriever with cream coat" */
  summary: string
  /** Structured identity traits — keys vary by subject type */
  traits: Record<string, string>
  /** Traits that MUST be preserved across all generations (subset of traits keys) */
  mustPreserve: string[]
  /** Raw analysis JSON from the vision model, for audit/debugging */
  rawAnalysis: string
}

/**
 * Pet-specific trait keys. The analysis prompt populates these.
 * Other subject types will have their own key sets.
 */
export const PET_TRAIT_KEYS = [
  'species',
  'breed',
  'coatColors',
  'coatTexture',
  'markings',
  'eyeColor',
  'earType',
  'muzzleShape',
  'noseColor',
  'bodySize',
  'accessories',
  'expression',
  'distinctiveFeatures',
] as const

export type PetTraitKey = typeof PET_TRAIT_KEYS[number]

// ── Composition ──────────────────────────────────────────────────────────

export type FramingMode =
  | 'preserve_source'    // Follow whatever the source image shows
  | 'full_subject'       // Whole animal/person/car visible
  | 'three_quarter'      // Head + torso + partial lower body
  | 'bust'               // Head + shoulders/upper chest
  | 'face_closeup'       // Face fills frame
  | 'environmental'      // Subject in wider scene context

export type AspectRatio = '2:3' | '3:2' | '1:1' | '3:4' | '4:3' | '16:9'

export interface CompositionProfile {
  aspectRatio: AspectRatio
  framingMode: FramingMode
  /** e.g. "center", "rule_of_thirds_left", "low_centered" */
  subjectPlacement: string
  /** Approximate % of frame height the subject should occupy */
  subjectScale: number
  /** Specific crop safety rules */
  cropSafety: string[]
  /** Any negative space requirements */
  negativeSpaceNotes: string
}

// ── Style Templates ──────────────────────────────────────────────────────

export type StyleCategory =
  | 'classic_portraits'
  | 'painterly_fine_art'
  | 'golden_hour_nature'
  | 'lifestyle_story'
  | 'pop_modern'

export interface StyleTemplate {
  id: string
  name: string
  emoji: string
  category: StyleCategory
  /** 1-2 sentence description for customers */
  description: string
  /** Version number — increment when prompt changes materially */
  version: number
  /** Whether this style is currently offered to customers */
  isActive: boolean

  // ── Prompt building blocks ──
  /** The artistic medium and technique description */
  technique: string
  /** Background and environment description */
  background: string
  /** Lighting description */
  lighting: string
  /** Color palette guidance */
  colorPalette: string
  /** Mood and emotional quality */
  mood: string
  /** Paint surface / texture notes */
  paintSurface: string

  // ── Behavioral controls ──
  /** Override default framing for this style */
  preferredFraming?: FramingMode
  /** Style-specific forbidden traits (merged with global) */
  forbiddenTraits: string[]
  /** Style-specific positive constraints */
  styleConstraints: string[]
  /** OpenAI quality tier — 'high' for styles where crispness/fidelity is the product
   *  (photorealistic, classic portraits), 'medium' for painterly/textural styles
   *  where style noise buries any medium-quality artifacts. Cost impact: $0.25 vs
   *  $0.063 per image. Defaults to 'medium' in the generate route if omitted. */
  qualityTier?: 'medium' | 'high'
}

// ── Prompt Assembly ──────────────────────────────────────────────────────

export interface PromptPackage {
  /** The final assembled prompt string sent to the image API */
  fullPrompt: string
  /** Individual blocks for audit/logging */
  blocks: {
    identity: string
    composition: string
    style: string
    environment: string
    output: string
    constraints: string
  }
  /** Style template ID and version used */
  styleId: string
  styleVersion: number
  /** Timestamp of assembly */
  assembledAt: string
}

// ── Generation Job ───────────────────────────────────────────────────────

export type JobState =
  | 'upload_received'
  | 'subject_profile_created'
  | 'generating'
  | 'generation_complete'
  | 'failed'

export interface GenerationResult {
  url: string
  styleId: string
  styleName: string
  model: string
  /** The prompt package used (for audit) */
  promptPackage?: PromptPackage
}

// ── Memory / Scene Portraits ─────────────────────────────────────────────

export interface SceneConfig {
  id: string
  name: string
  emoji: string
  /** Scene description template — {name}, {place}, {mood} get interpolated */
  sceneTemplate: string
  /** Which style family to pair with */
  defaultStyleId: string
}
