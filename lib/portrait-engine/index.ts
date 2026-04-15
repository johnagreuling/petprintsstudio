// ════════════════════════════════════════════════════════════════════════════
//  PORTRAIT ENGINE — Public API
//
//  Import everything from here:
//    import { analyzePetSubject, buildPrompt, ALL_STYLES, ... } from '@/lib/portrait-engine'
// ════════════════════════════════════════════════════════════════════════════

// Types
export type {
  SubjectProfile,
  SubjectType,
  StyleTemplate,
  StyleCategory,
  CompositionProfile,
  FramingMode,
  AspectRatio,
  PromptPackage,
  GenerationResult,
  JobState,
  SceneConfig,
} from './types'

export { PET_TRAIT_KEYS } from './types'

// Subject analysis
export { analyzePetSubject } from './subject-analysis'

// Prompt building
export {
  buildPrompt,
  buildMemoryScenePrompt,
  DEFAULT_COMPOSITION,
} from './prompt-builder'

// Style library
export {
  ALL_STYLES,
  CATEGORY_INFO,
  getStyleById,
  getStylesByCategory,
  getActiveStyles,
  getStyleCatalog,
} from './styles'
