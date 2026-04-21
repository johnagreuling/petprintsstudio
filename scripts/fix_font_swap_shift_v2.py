#!/usr/bin/env python3
"""Fix the bad adjustFontFallback values from v1.
Next.js wants `adjustFontFallback: true | false`, not a string.
The metric adjustment is automatic when fallback is provided + flag is true."""
import pathlib

f = pathlib.Path("app/layout.tsx")
src = f.read_text()
orig = src

src = src.replace(
    "  adjustFontFallback: 'Times New Roman',",
    "  adjustFontFallback: true,",
)
src = src.replace(
    "  adjustFontFallback: 'Arial',",
    "  adjustFontFallback: true,",
)

f.write_text(src)
print(f"Patched {f}, {len(src)-len(orig):+} chars")
