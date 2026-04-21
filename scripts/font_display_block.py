#!/usr/bin/env python3
"""Switch fonts to display:'block' — text invisible until font loads,
then appears in final position. Eliminates font-swap reflow entirely.
Tradeoff: brief blank moment instead of visible swap."""
import pathlib

f = pathlib.Path("app/layout.tsx")
src = f.read_text()
orig = src

# Both fonts: optional → block
src = src.replace("  display: 'optional',", "  display: 'block',")

f.write_text(src)
print(f"Patched {f}, {len(src)-len(orig):+} chars")
