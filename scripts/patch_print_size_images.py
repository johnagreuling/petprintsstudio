#!/usr/bin/env python3
"""Map each print size variant to its own framed-and-matted lifestyle scene.
Also updates description to clarify frame is shown for inspiration only."""
import pathlib, sys

f = pathlib.Path("lib/config.ts")
src = f.read_text()
orig = src

# Patch 1: productImage routing for prints
old_img = "  if (productId.startsWith('print_'))  return '/portrait-lifestyle.png'"
new_img = """  if (productId.startsWith('print_')) {
    const sizeMap: Record<string, string> = {
      print_8x10:  '/products/lifestyle/framed-print/8x10.png',
      print_11x14: '/products/lifestyle/framed-print/11x14.png',
      print_12x16: '/products/lifestyle/framed-print/12x16.png',
      print_16x20: '/products/lifestyle/framed-print/16x20.png',
      print_18x24: '/products/lifestyle/framed-print/18x24.png',
      print_24x36: '/products/lifestyle/framed-print/24x36.png',
    }
    return sizeMap[productId] || '/products/lifestyle/framed-print/16x20.png'
  }"""

if old_img not in src:
    print("WARNING: print routing anchor not found")
    sys.exit(1)
src = src.replace(old_img, new_img)

# Patch 2: update standard print description with frame caveat
old_desc = "Heavyweight 200gsm archival matte paper. Vibrant pigment inks designed for color accuracy and longevity. Frame it yourself for a custom look."
new_desc = "Heavyweight 200gsm archival matte paper. Vibrant pigment inks designed for color accuracy and longevity. Shown framed for inspiration — print ships unframed so you can frame it your way."
src = src.replace(old_desc, new_desc)

# Patch 3: update popular 16x20 description
old_pop = "Our most popular print. Heavyweight 200gsm archival matte — the same paper used by fine art printmakers. Rich, accurate color that lasts."
new_pop = "Our most popular print. Heavyweight 200gsm archival matte — the same paper used by fine art printmakers. Rich, accurate color that lasts. Shown framed for inspiration; ships unframed."
src = src.replace(old_pop, new_pop)

# Patch 4: update 24x36 description
old_large = "Large format archival matte. At this size, the portrait has real presence — museum-scale detail on paper built to last."
new_large = "Large format archival matte. At this size, the portrait has real presence — museum-scale detail on paper built to last. Shown framed for inspiration; ships unframed."
src = src.replace(old_large, new_large)

f.write_text(src)
print(f"Patched {f}, {len(src)-len(orig):+} chars")
