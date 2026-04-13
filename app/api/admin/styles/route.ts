import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// ════════════════════════════════════════════════════════════════
// STYLE DEFINITIONS - Exported for admin viewing
// These mirror the STYLE_FAMILIES in /api/generate/route.ts
// ════════════════════════════════════════════════════════════════

const CONSTRAINTS_GPT = `CONSTRAINTS
- no text
- no watermark
- no extra animals
- no extra limbs
- no distorted anatomy
- not photorealistic photography
- not cartoon styling
- not anime styling
- not flat vector art`;

// Three framing modes - styles opt into what they need
type FramingMode = 'natural' | 'portrait' | 'full_body';

const FRAMING = {
  natural: `COMPOSITION
Preserve the original framing and composition from the source image.
Do not crop, zoom, or reframe the subject.
Keep the same pose, angle, and spatial relationship as the input photo.
The subject should occupy approximately the same portion of the frame as in the original.`,

  portrait: `PORTRAIT FRAMING
Compose as a head-and-shoulders portrait with the full head comfortably inside the frame.
Include: full head, both ears, chin, and upper chest/shoulders.
Leave generous breathing room above the head and on both sides.
Do not crop into the top of the head, ears, or chin.
Center the subject with the face clearly visible and unobstructed.
The head should occupy approximately 50-65% of the frame height.`,

  full_body: `FULL-BODY FRAMING
Show the entire animal fully visible within the frame.
Include: full head, both ears, full torso, all legs, all paws, tail if visible.
Leave generous negative space around the subject on all sides.
Do not crop, clip, or trim any part of the animal.
The full animal should occupy approximately 60-75% of the frame height.
Do not let ears, paws, tail, or fur silhouette touch the edges.`,
};

function subjectIdentityBlock(petDesc: string, framing: FramingMode = 'natural'): string {
  return `Transform the exact animal shown in the input image into a stylized artwork.

SUBJECT IDENTITY
Preserve the exact animal from the input photo:
- ${petDesc}
- exact breed appearance and body proportions
- exact face shape and facial proportions
- exact muzzle shape
- exact ear shape and ear set
- exact eye color and expression
- exact coat color and all markings
- exact fur length, texture, and volume
- preserve any visible accessories (collar, harness, tags, bandana)
- do not invent new markings or change age, body type, or expression

${FRAMING[framing]}`;
}

// Sample pet description for generating example prompts
const SAMPLE_PET_DESC = 'a cream-colored Goldendoodle with wavy fur, warm brown eyes, a black nose, and floppy ears';
const SAMPLE_PET_TYPE = 'dog';

const STYLE_DEFINITIONS = [
  {
    id: 'retro_pop',
    name: 'Retro Pop',
    emoji: '🟥',
    description: 'Classic Warhol-style 4-panel grid. Full animal shown in four bold, vibrant color palettes.',
    gptPrompt: `Create a premium retro pop-art portrait of the exact animal shown in the input image.

SUBJECT IDENTITY
Preserve the exact animal from the input photo:
- ${SAMPLE_PET_DESC}
- exact breed appearance and body proportions
- exact face shape and facial proportions
- exact muzzle shape
- exact ear shape and ear set
- exact eye color and expression
- exact coat color and all markings
- exact fur length, texture, and volume
- preserve any visible accessories (collar, harness, tags, bandana)
- do not invent new markings or change age, body type, or expression

FULL-SUBJECT COMPOSITION — CRITICAL
Reconstruct the pet as a fully visible, zoomed-out subject within each square panel.
The entire animal must be shown completely inside the frame, including:
- full head
- both ears
- full torso
- all legs
- all paws
- tail if visible in the source image
- full outer fur silhouette
Do not crop, clip, or trim any part of the animal.
Leave generous negative space around the subject on all sides.
The composition must feel intentionally zoomed out and safely framed, never tight.
Scale rule:
- the full animal should occupy approximately 60–75% of the height of each square panel
- the full animal should occupy approximately 50–70% of the width of each square panel, depending on breed and pose
The pet must be fully visible, comfortably contained in frame, and clearly readable as a complete animal.
Do not create a face-only portrait.
Do not create a head-and-shoulders crop.
Do not create a close-up.
Do not crop into the body for stylistic effect.
Do not let ears, paws, tail, or fur silhouette touch the edges.

GRID LAYOUT
Create a strict 2x2 grid layout consisting of four equal square panels. This grid structure is mandatory and must be clearly visible.
Each panel must contain the same fully visible, zoomed-out depiction of the pet, repeated identically with matching:
- crop
- scale
- pose
- placement
- framing
Only the color palette may change from panel to panel.

STYLE
Render the image as premium retro pop art with bold, fully saturated, high-contrast color palettes.
Each of the four panels must use a distinctly different vivid color combination.
Colors must be bright, striking, and intense — not muted, not pastel, not desaturated.
Use crisp edges, strong graphic simplification, and smooth color blocking.
Backgrounds should be flat and minimal to maintain clarity in each panel.

LAYOUT PRIORITY
Do not preserve the original image composition if it interferes with the grid layout.
Ignore background clutter and rebuild the composition to fit the centered or balanced full-subject format required for the grid.
Do not create a single image, do not create partial layouts, and do not omit the grid.
The final output must be a clear, evenly spaced four-panel pop-art grid with identical subject placement in each quadrant.
Avoid photorealism, muddy colors, painterly effects, uneven spacing, off-center subjects, collage layouts, distorted repetition, or inconsistent framing.
Ensure all four panels are perfectly aligned, evenly spaced, and visually balanced.

CONSTRAINTS
- no text
- no watermark
- no extra animals
- no extra limbs
- no distorted anatomy
- not photorealistic photography
- not cartoon styling
- not anime styling
- not flat vector art
- four panels, perfectly aligned 2x2 grid
- same pet, same crop, same framing in every panel
- only color palette changes per panel
- bold vivid fully saturated colors only
- no muted, pastel, desaturated, or neutral tones
- no misaligned panels, uneven spacing, or off-center framing
- no tight crop
- no face-only crop
- no cropped ears
- no cropped paws
- no clipped fur silhouette

FINAL COMPOSITION CHECK:
Before rendering, ensure the entire animal is fully visible inside each square panel with comfortable margin on all sides.`,
  },
  {
    id: 'fairytale',
    name: 'Fairytale',
    emoji: '✨',
    description: 'Soft magical storybook portrait with warm golden light, soulful eyes, floating sparkles, and a cozy whimsical scene.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Render this image in a premium storybook portrait style with soft illustrated brushwork, warm golden light, and a cozy magical atmosphere. The result should feel like a beautifully painted children's book illustration, not a photograph, not a cartoon, and not a polished digital render. Preserve the pet's accurate likeness, especially the face shape, nose, curls, and gentle head tilt, while giving the eyes a slightly larger, more expressive, soulful storybook quality. Use soft edges, subtle painterly texture, warm highlights, gentle glow, floating dust-like sparkles, and an inviting interior scene with simple whimsical background elements such as a softly lit window, curtains, flowers, books, or a cozy home setting. Keep the pet centered and emotionally engaging as the clear focal point. Fur should feel soft and painterly, not overly detailed or hyperreal. Avoid photorealism, hard outlines, comic-book styling, plastic AI textures, oversharpening, cluttered backgrounds, or cheap novelty illustration. The final image should feel heartwarming, nostalgic, magical, and premium, like a treasured storybook portrait worthy of framing.

${CONSTRAINTS_GPT}
- not photorealistic
- no hard outlines
- no comic-book styling
- no cluttered backgrounds`,
  },
  {
    id: 'comic_animation',
    name: 'Premium Comic',
    emoji: '💥',
    description: 'Bold comic book portrait with clean inked linework, cel shading, cinematic lighting, and vivid animated character energy.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Render this image as a premium animated comic book portrait with bold, clean inked linework, expressive stylization, and polished cel shading. The result should feel like a high-end illustrated panel from a modern comic book, with confident contour lines, simplified forms, and strong visual clarity. Preserve the pet's accurate likeness, including facial structure, fur pattern, and expression, while subtly stylizing the features to feel more animated and character-driven. The eyes should be slightly larger and more expressive, with a lively, emotional quality. Fur should be simplified into clean, stylized curls and directional shapes rather than hyper-detailed texture. Use smooth cel shading with clear light and shadow separation, avoiding overly soft blending. Lighting should be cinematic and directional, with warm highlights and defined shadows that enhance depth and form. Ensure clean, consistent ink outlines with controlled line weight variation for a polished and professional comic look. The background should be softly simplified and illustrated, supporting the subject without clutter, like a well-composed comic panel. Avoid photorealism, painterly brush textures, excessive detail, noisy linework, heavy halftone effects, plastic AI textures, or cheap cartoon aesthetics. The final image should feel vivid, animated, collectible, and premium, like real comic book art worthy of framing.

${CONSTRAINTS_GPT}
- not photorealistic
- no painterly brush textures
- no heavy halftone effects`,
  },
  {
    id: 'fine_art_sketch',
    name: 'Fine Art Sketch',
    emoji: '🖊️',
    description: 'Museum-quality charcoal and graphite portrait on textured paper. Elegant linework, soft crosshatching, and deeply emotional presence.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Render this image as a premium fine art sketch portrait with the look of a hand-drawn charcoal and graphite artwork on textured paper. The result should feel like a real commissioned drawing created by a skilled portrait artist, not a photograph, not a painting, and not a generic digital filter. Preserve the pet's accurate likeness, facial structure, fur pattern, expression, and emotional presence while translating the portrait into elegant linework, soft shading, and refined tonal depth. Use delicate pencil and charcoal marks, subtle crosshatching, blended graphite shadows, and strong focal detail around the eyes, nose, and expression. The background should remain minimal, soft, and unobtrusive, with only gentle tonal suggestion or paper texture so the pet remains the clear emotional focus. Keep the composition timeless, balanced, and dignified. Avoid glossy digital polish, hard vector lines, cartoon styling, excessive detail everywhere, muddy smudging, fake photo-to-sketch effects, noisy textures, or cheap novelty aesthetics. The final image should feel intimate, sophisticated, timeless, and deeply emotional, like a museum-quality pet portrait sketch worthy of framing.

${CONSTRAINTS_GPT}
- not a photograph
- not a painting
- no hard vector lines
- no fake photo-to-sketch effects`,
  },
  {
    id: 'neon_glow',
    name: 'Neon Glow',
    emoji: '🌟',
    description: 'Electric, cinematic, high-contrast. Glowing neon outlines on a deep dark background.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Render this portrait in a Neon Glow style with a dark, cinematic background and vivid neon lighting accents. Preserve the subject's likeness and expression while reinterpreting the scene with bold glowing outlines, luminous highlights, and high contrast color. Use saturated neon tones such as electric blue, magenta, purple, teal, and gold against deep shadow. The lighting should feel dynamic and stylized, emphasizing contours and key elements of the scene. The final image should feel sleek, modern, high-energy, and visually striking, like premium cyber-inspired wall art with a nightlife aesthetic.

COMPOSITION
Strong centered portrait. Dark dramatic background. Subject glows with neon rim lighting. Eyes and facial features catch the brightest neon light.

PAINT SURFACE
Sleek modern digital-art quality. High contrast between dark background and luminous neon highlights. Sharp glowing edges.

BACKGROUND
Dark cinematic — near black with subtle depth. Neon color bleed and atmospheric haze.

${CONSTRAINTS_GPT}
- not pastel or muted
- not daytime or natural light
- not cartoon or anime`,
  },
  {
    id: 'storybook',
    name: 'Storybook Nostalgia',
    emoji: '📖',
    description: 'Warm, cozy, memory-filled. A painterly scene that feels like a cherished illustrated storybook.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Render this portrait in a warm storybook nostalgia style, with soft painterly brushwork, gentle lighting, and a cozy, emotionally rich atmosphere. Preserve the subject's likeness, expression, and personality while placing them naturally within a story-driven environment. The scene should feel lived-in and meaningful, with subtle environmental details that support memory and narrative without overwhelming the subject. Use warm, inviting color tones, soft edges, and natural light. The overall composition should feel intimate, sentimental, and timeless, like a cherished illustrated memory brought to life.

COMPOSITION
Intimate centered portrait. Subject placed naturally in a cozy scene. Warm natural light or golden-hour glow. Environmental details that feel personal and lived-in.

PAINT SURFACE
Soft painterly brushwork. Warm textured canvas feel. Gentle impressionistic edges that soften into the background while keeping the face clear.

BACKGROUND
Cozy memory-filled scene — books, warm fabrics, soft botanicals, golden light through a window. Feels lived-in and meaningful.

${CONSTRAINTS_GPT}
- not dark or moody
- not harsh lighting
- not neon or cyberpunk
- not photorealistic photography`,
  },
  {
    id: 'ethereal',
    name: 'Ethereal Painterly',
    emoji: '🎨',
    description: 'Soft, dreamlike brushwork with luminous depth. Your pet rendered in a timeless painterly style worthy of any gallery wall.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Render this image in an ethereal painterly style with soft, expressive brushwork, atmospheric depth, and an emotionally rich fine-art composition. The result should feel like a real hand-painted artwork created by a skilled contemporary painter, not a photograph, not a digital illustration, and not a polished AI render. Preserve the pet's recognizable likeness, soulful eyes, and emotional presence, while interpreting the scene with softness, memory, and artistic intuition rather than literal realism. Use layered painterly texture, broken edges, subtle asymmetry, soft blending, and visible brushstrokes that allow parts of the subject and background to gently dissolve into one another. The palette should feel harmonious, muted but expressive, with nuanced color shifts and a dreamlike atmosphere. Backgrounds should remain suggestive and atmospheric, supporting the story and mood without becoming overly detailed or visually busy. Avoid photorealism, glossy digital smoothness, hard outlines, cartoon styling, over-rendered fur detail, plastic textures, sharp vector edges, or generic decorative illustration. The finished image should feel intimate, emotional, poetic, and timeless, like a treasured painting built from memory, feeling, and presence.

${CONSTRAINTS_GPT}`,
  },
  {
    id: 'bold_contemporary',
    name: 'Contemporary Bold',
    emoji: '✨',
    description: 'Bold, jewel-toned, and vividly alive. Contemporary graphic energy with a gallery-quality finish.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Render this image in a bold modern surreal style with striking color, dramatic contrast, and a polished contemporary fine-art composition. The result should feel like a high-end gallery painting — luxurious, vibrant, and visually arresting — not a cartoon, not a photograph, and not a generic digital illustration. Preserve the pet's recognizable likeness, expressive presence, and key personality traits, while elevating the image through intensified color, surreal visual drama, and refined artistic stylization. Use rich jewel tones, luminous highlights, crisp focal areas, and a sophisticated balance of realism and fantasy. The composition should feel intentional, high-impact, and elegant, with bold visual clarity and premium decorative appeal. Backgrounds may include stylized natural or symbolic elements, but should remain integrated, artful, and compositionally controlled rather than cluttered or literal. Avoid childish pop styling, muddy colors, low-end poster aesthetics, messy collage effects, plastic textures, generic AI smoothness, or cheap novelty energy. The final image should feel powerful, glamorous, modern, and collectible, like luxury statement art created for a beautiful interior.

${CONSTRAINTS_GPT}`,
  },
  {
    id: 'classical_oil',
    name: 'Oil Painting',
    emoji: '🖼️',
    description: 'Rich classical oil portrait. Dramatic light, deep color, and Old Masters gravitas.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Classical Old Masters oil portrait tradition. Rich warm tones. Dramatic chiaroscuro — deep shadows with luminous highlights. Museum-quality fine art. Rembrandt-style lighting. Dense layered paint. Serious and timeless.

COMPOSITION
Traditional formal portrait composition. Three-quarter view or frontal. Rich dark background framing the subject.

PAINT SURFACE
Smooth glazed surface over impasto underlayer. Visible brushwork only in fur and fabric. Luminous skin-like depth in eyes.

BACKGROUND
Dark rich background — deep brown, burgundy, or forest green. Possibly a suggestion of draped fabric or architectural detail.

${CONSTRAINTS_GPT}
- not impressionist
- not modern`,
  },
  {
    id: 'watercolor',
    name: 'Watercolor Fine Art',
    emoji: '💧',
    description: 'Delicate washes and soft edges. A luminous, flowing watercolor portrait with the feel of fine art on paper.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Transparent watercolor on cold-press paper. Loose fluid brushwork. Soft bleeding edges. Luminous transparent washes layered for depth. Visible paper texture in highlights. Soft halo around fur edges. Delicate and airy.

COMPOSITION
Centered portrait with airy open composition. Light flows from above. Soft vignette edges.

PAINT SURFACE
Transparent layered washes, not opaque. Wet-on-wet soft blooms in background. More defined brushwork only on eyes and muzzle.

BACKGROUND
Very loose abstract washes. Warm ivory, blush, sky blue. Minimal — lets the dog breathe.

${CONSTRAINTS_GPT}
- not oil paint
- not digital
- not harsh outlines`,
  },
  {
    id: 'impasto',
    name: 'Impasto Expressionism',
    emoji: '🖌️',
    description: 'Thick palette-knife texture, heavy layered paint, bold broken brush strokes. Modern fine art with a luxury gallery aesthetic.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Contemporary expressionist impasto oil painting. Thick palette-knife texture, heavy layered paint, bold broken brush strokes, rough painterly edges, visible impasto, and chunky abstracted fur strokes instead of realistic fur strands. Keep the dog clearly recognizable, preserving key identifying facial features, eyes, muzzle, ear shape, and coat pattern.

COMPOSITION
Preserve the exact dog's identity, pose, facial expression, proportions, and composition from the original image. Maintain the original composition and framing. Reinterpret the photo as a painting, not as a new generated dog.

BACKGROUND
Subtly suggested French interior with minimal ornate wall molding and simplified paneling. Muted, sophisticated palette of soft sage green, dusty blue, warm beige, muted ochre, and desaturated rose. Elegant, low-saturation, and softly color-blocked. Loose painterly birds in the background as a secondary surreal design element.

PAINT SURFACE
Controlled expressive distortion while keeping the subject recognizable. Rich texture, visible brushwork, slightly grainy finish.

${CONSTRAINTS_GPT}
- no photorealism
- no smooth gradients
- no hyper-detailed fur strands
- no glossy 3D
- no vector art
- no anime
- no sharp outlines
- no clean digital rendering
- no plastic texture
- no cartoon look`,
  },
  {
    id: 'chateau_pop',
    name: 'Chateau Pop',
    emoji: '🪩',
    description: 'Surreal French interior with disco ball, wingback chair, and painterly birds. Bold impasto texture meets editorial elegance.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Contemporary expressionist interior painting. The dog replaces a human subject as the central figure. Thick impasto oil painting with heavy palette-knife texture, layered paint, bold broken brush strokes. Expressive distortion while keeping the dog clearly recognizable.

COMPOSITION
Dog positioned as a dignified, human-like subject, seated upright in a classic wingback chair, centered composition, facing forward with calm, slightly haunting presence. Dog's face = primary focal point. Chair = structural anchor. Background = flat and graphic.

SETTING
Refined French interior, simplified and partially abstracted, with hints of ornate molding and paneling. Loose painterly birds moving across the scene, adding surreal motion and contrast. A painterly disco ball suspended in the scene, rendered in impasto style with broken mirrored facets suggested through thick brush strokes, reflecting surrounding colors.

COLOR PALETTE
Bold, flat, saturated color blocking in background (hot pink, muted teal, or warm ochre). Strong graphic separation from subject. Exaggerated tonal shifts in shadows and highlights (cool blues, purples, greens mixed into fur).

PAINT SURFACE
Fur translated into chunky painterly strokes, not realistic strands. Rough painterly edges, not clean. Highlights as thick directional strokes, not smooth gradients. Slightly grainy finish.

${CONSTRAINTS_GPT}
- no photorealism
- no smooth gradients
- no fine detail fur strands
- no glossy 3D
- no vector art
- no anime
- no sharp outlines
- no clean digital rendering`,
  },
  {
    id: 'impressionist',
    name: 'Impressionist',
    emoji: '🌸',
    description: 'Monet-style dappled light and visible brushwork. Color and emotion over precision.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Impressionist oil painting in the tradition of Monet and Renoir. Dappled sunlight effect. Loose visible brushstrokes throughout — no smooth passages. Vibrant blended colors. Plein air feeling. Light and movement in every stroke.

COMPOSITION
Three-quarter or frontal portrait. Garden or outdoor light setting. Subject bathed in dappled warm light.

PAINT SURFACE
Short thick dabs of paint throughout. Colors placed side-by-side rather than blended. Vibrant and energetic surface.

BACKGROUND
Garden setting with loose impressionist foliage — blues, greens, purples, and gold. Light broken across leaves.

${CONSTRAINTS_GPT}
- not pointillist
- not photorealistic`,
  },
  {
    id: 'pastel',
    name: 'Soft Pastel',
    emoji: '🕊️',
    description: 'Dreamy pastel chalk on toned paper. Delicate, warm, and deeply tender.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

STYLE
Soft, dreamy pastel portrait with a fine-art illustration quality. Think of a beautifully rendered pastel drawing on toned paper — delicate blended color, soft gradients, gentle light, and an intimate, emotional warmth. The texture should feel like real pastel chalk or colored pencil on quality art paper.

Color palette: soft lavenders, powder blues, warm creams, dusty roses, sage greens, warm greys. Never harsh, never neon — always gentle and luminous.

The pet should feel precious and tender in this rendering. Romantic, timeless, gallery-worthy.

${CONSTRAINTS_GPT}
- not photorealistic
- not cartoon
- not oil painting
- not watercolor (pastel texture, not washes)`,
  },
  {
    id: 'vintage_poster',
    name: 'Vintage Poster',
    emoji: '🗺️',
    description: 'Mid-century travel poster energy. Bold graphic composition, flat shapes, nostalgic retro palette.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Render this image as a premium vintage poster illustration with bold graphic composition, simplified painterly shapes, strong silhouette, and timeless retro print energy. The result should feel like a beautifully designed mid-century travel or advertising poster, not a cartoon, not a photograph, and not a modern digital illustration. Preserve the pet's recognizable likeness, posture, and personality while stylizing the scene into elegant flattened forms, controlled shading, and nostalgic color harmony. Use a curated retro palette, confident line structure, subtle print texture, and balanced composition with strong visual readability from a distance. Background elements should feel iconic and design-forward rather than overly detailed, helping tell the story in a clear, memorable way. Avoid photorealism, glossy rendering, plastic AI textures, muddy color, childish cartoon styling, messy collage effects, and generic poster templates. The final image should feel collectible, stylish, nostalgic, and premium, like a classic illustrated poster worthy of framing.

${CONSTRAINTS_GPT}
- not photorealistic
- not Warhol multi-panel grid
- not childish or cartoon
- not generic digital AI poster`,
  },
  {
    id: 'vintage_pop_art',
    name: 'Gallery Pop',
    emoji: '⚡',
    description: 'Bold single-portrait gallery pop art. Clean graphic shapes, vibrant color blocking, modern gallery energy.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Render this image as a premium single-image gallery pop portrait with bold graphic styling, striking color contrast, and a polished contemporary art feel. The result should feel like high-end pop-inspired wall art for a modern gallery, not a cartoon, not a meme, and not a cheap novelty print. Preserve the pet's recognizable likeness, expression, and personality while simplifying the subject into strong shapes, crisp edges, smooth color blocking, and clean visual structure. Use a vibrant but curated color palette with bold contrast, confident composition, and stylish modern-art energy. The portrait must be a single centered composition with one subject only. Do not use multiple panels, repeated images, quadrant layouts, grids, split frames, duplicated portraits, or Warhol-style repetition. The background should be simple, clean, and design-forward, supporting the pet without clutter and without creating a poster-grid look. Avoid photorealism, muddy color, childish illustration, collage effects, plastic AI textures, generic digital smoothness, and low-end pop-art novelty aesthetics. The final image should feel iconic, stylish, modern, and premium, like a collectible single-image pop portrait worthy of framing.

${CONSTRAINTS_GPT}
- single centered portrait only
- no multiple panels or grids
- no Warhol quadrant layout
- no repeated images
- not photorealistic`,
  },
  {
    id: 'vintage_poster_v2',
    name: 'Heritage Poster',
    emoji: '🏛️',
    description: 'Premium retro collectible with badge and sunburst elements. Frame-worthy vintage wall art.',
    gptPrompt: `${subjectIdentityBlock(SAMPLE_PET_DESC)}

Create a premium heritage poster portrait of the exact animal shown in the input image.

SUBJECT IDENTITY
Preserve the exact animal from the input photo with perfect likeness — exact breed, coat, markings, expression, and accessories.

STYLE
Premium collectible heritage poster with timeless frame-worthy appeal. Warm, rich, and dignified. Feels like a treasured antique print or classic naturalist illustration elevated to fine art poster status.

Style direction: heritage illustration aesthetic, aged parchment and warm earth tones, subtle distressed texture, ornamental border framing, badge or crest design elements, rich warm palette, hand-crafted premium feel, collectible wall art.

COLOR PALETTE
Warm cream, rich tan, burnt sienna, forest green, deep navy, gold, aged ivory, warm brown, muted terracotta. Rich, dignified, and timelessly elegant.

COMPOSITION
Pet centered as the noble focal point. Background has ornamental heritage design elements — subtle crest shapes, elegant borders, warm textured backdrop. Feels distinguished, classic, and collectible.

${CONSTRAINTS_GPT}`,
  },
];

export async function GET() {
  try {
    // Get sample images from recent sessions for each style
    const styleImages: Record<string, string> = {};
    
    try {
      // Query recent sessions to find example images for each style
      const result = await sql`
        SELECT images FROM sessions 
        WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      
      // Extract first image URL for each style we find
      for (const row of result.rows) {
        const images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
        for (const img of images || []) {
          const styleId = img.style_id || img.styleId;
          if (styleId && !styleImages[styleId] && img.url) {
            styleImages[styleId] = img.url;
          }
        }
      }
    } catch (dbErr) {
      console.error('DB query for style images failed (non-fatal):', dbErr);
    }
    
    // Build response with styles and their sample images
    const stylesWithImages = STYLE_DEFINITIONS.map(style => ({
      ...style,
      sampleImageUrl: styleImages[style.id] || null,
    }));
    
    return NextResponse.json({
      styles: stylesWithImages,
      meta: {
        totalStyles: STYLE_DEFINITIONS.length,
        stylesWithSamples: Object.keys(styleImages).length,
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Styles API error:', error);
    return NextResponse.json({ error: 'Failed to fetch styles', details: String(error) }, { status: 500 });
  }
}
