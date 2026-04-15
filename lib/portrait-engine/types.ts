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

export interface SubjectProfile {
  subjectType: SubjectType
  summary: string
  traits: Record<string, string>
  mustPreserve: string[]
  rawAnalysis: string
}

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
  | 'preserve_source'
  | 'full_subject'
  | 'three_quarter'
  | 'bust'
  | 'face_closeup'
  | 'environmental'

export type AspectRatio = '2:3' | '3:2' | '1:1' | '3:4' | '4:3' | '16:9'

export interface CompositionProfile {
  aspectRatio: AspectRatio
  framingMode: FramingMode
  subjectPlacement: string
  subjectScale: number
  cropSafety: string[]
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
  description: string
  version: number
  isActive: boolean
  technique: string
  background: string
  lighting: string
  colorPalette: string
  mood: string
  paintSurface: string
  preferredFraming?: FramingMode
  forbiddenTraits: string[]
  styleConstraints: string[]
}

// ── Prompt Assembly ──────────────────────────────────────────────────────

export interface PromptPackage {
  fullPrompt: string
  blocks: {
    identity: string
    composition: string
    style: string
    environment: string
    output: string
    constraints: string
  }
  styleId: string
  styleVersion: number
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
  promptPackage?: PromptPackage
}

export interface SceneConfig {
  id: string
  name: string
  emoji: string
  sceneTemplate: string
  defaultStyleId: string
}
