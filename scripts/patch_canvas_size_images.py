#!/usr/bin/env python3
"""Map each canvas size variant to its own RH-aesthetic lifestyle scene."""
import pathlib, sys

f = pathlib.Path("lib/config.ts")
src = f.read_text()
orig = src

old = "  if (productId.startsWith('canvas_')) return '/portrait-on-wall.png'"

new = """  if (productId.startsWith('canvas_')) {
    const sizeMap: Record<string, string> = {
      canvas_8x10:  '/products/lifestyle/canvas/8x10.png',
      canvas_11x14: '/products/lifestyle/canvas/11x14.png',
      canvas_12x16: '/products/lifestyle/canvas/12x16.png',
      canvas_16x20: '/products/lifestyle/canvas/16x20.png',
      canvas_18x24: '/products/lifestyle/canvas/18x24.png',
      canvas_20x30: '/products/lifestyle/canvas/20x30.png',
      canvas_24x36: '/products/lifestyle/canvas/24x36.png',
    }
    return sizeMap[productId] || '/products/lifestyle/canvas/16x20.png'
  }"""

if old not in src:
    print("WARNING: original anchor not found. Showing current canvas line(s):")
    for i, line in enumerate(src.split('\n')):
        if 'canvas_' in line and 'return' in line:
            print(f"  line {i+1}: {line}")
    sys.exit(1)

src = src.replace(old, new)
f.write_text(src)
print(f"Patched {f}, {len(src)-len(orig):+} chars")
