import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  getActiveStyles,
  getStyleCatalog,
  buildPrompt,
  DEFAULT_COMPOSITION,
  type SubjectProfile,
} from '@/lib/portrait-engine';

// ════════════════════════════════════════════════════════════════
//  ADMIN STYLES API
//
//  Reads from the portrait engine's style library (single source of truth).
//  Builds a sample prompt for each style using a demo pet description.
//  Pulls sample images from recent generation sessions in the database.
// ════════════════════════════════════════════════════════════════

// Sample pet profile for generating example prompts in the admin view
const SAMPLE_PET: SubjectProfile = {
  subjectType: 'pet',
  summary: 'Goldendoodle with golden apricot coat — signature teddy bear face with round dark eyes',
  traits: {
    species: 'dog',
    breed: 'Goldendoodle with loose curly coat',
    coatColors: 'golden apricot primary with cream highlights on chest and muzzle',
    coatTexture: 'medium-length loose wavy curls, soft and fluffy, matte finish',
    markings: 'darker apricot on ears fading to cream on muzzle, lighter chest',
    eyeColor: 'dark brown, warm and expressive',
    earType: 'medium floppy drop ears, covered in wavy fur',
    muzzleShape: 'medium-length rounded muzzle with prominent black nose',
    noseColor: 'solid black',
    bodySize: 'medium build, athletic but fluffy',
    accessories: 'none visible',
    expression: 'happy, relaxed, friendly with soft eyes',
    distinctiveFeatures: 'signature teddy bear face with round dark eyes, prominent fluffy golden curls framing face',
  },
  mustPreserve: ['breed', 'coatColors', 'coatTexture', 'markings', 'eyeColor', 'earType', 'muzzleShape', 'distinctiveFeatures'],
  rawAnalysis: '',
}

export async function GET() {
  try {
    // Get sample images from recent sessions for each style
    const styleImages: Record<string, string> = {};
    
    try {
      const result = await sql`
        SELECT images FROM sessions 
        WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
        ORDER BY created_at DESC 
        LIMIT 30
      `;
      
      for (const row of result.rows) {
        const images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
        for (const img of images || []) {
          const styleId = img.style_id || img.styleId;
          if (styleId && !styleImages[styleId] && img.url) {
            // Strip variant suffix (e.g., "museum_black_0" → "museum_black")
            const baseId = styleId.replace(/_\d+$/, '');
            if (!styleImages[baseId]) {
              styleImages[baseId] = img.url;
            }
          }
        }
      }
    } catch (dbErr) {
      console.error('DB query for style images failed (non-fatal):', dbErr);
    }

    // Build the style catalog from the portrait engine
    const catalog = getStyleCatalog();
    const allStyles = getActiveStyles();

    // Build response: for each style, generate the sample prompt and attach sample image
    const stylesWithPrompts = allStyles.map(style => {
      const promptPackage = buildPrompt(SAMPLE_PET, style, DEFAULT_COMPOSITION);
      
      return {
        id: style.id,
        name: style.name,
        emoji: style.emoji,
        category: style.category,
        description: style.description,
        version: style.version,
        // The full assembled prompt (what the API actually sends to OpenAI)
        gptPrompt: promptPackage.fullPrompt,
        // Individual blocks for inspection
        blocks: promptPackage.blocks,
        // Style-specific fields for reference
        technique: style.technique,
        background: style.background,
        lighting: style.lighting,
        colorPalette: style.colorPalette,
        mood: style.mood,
        paintSurface: style.paintSurface,
        preferredFraming: style.preferredFraming || 'preserve_source',
        forbiddenTraits: style.forbiddenTraits,
        styleConstraints: style.styleConstraints,
        qualityTier: style.qualityTier || 'medium',
        // Sample image from past generations
        sampleImageUrl: styleImages[style.id] || null,
      };
    });

    return NextResponse.json({
      styles: stylesWithPrompts,
      categories: catalog.map(c => ({
        id: c.category,
        name: c.info.name,
        description: c.info.description,
        emoji: c.info.emoji,
        styleCount: c.styles.length,
      })),
      meta: {
        totalStyles: allStyles.length,
        stylesWithSamples: Object.keys(styleImages).length,
        engineVersion: '2.0',
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Styles API error:', error);
    return NextResponse.json({ error: 'Failed to fetch styles', details: String(error) }, { status: 500 });
  }
}
