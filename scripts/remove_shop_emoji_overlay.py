#!/usr/bin/env python3
"""Remove the translucent emoji overlay from /shop product tiles.
It was scaffolding from when products lacked images; now it bleeds
through during Next.js Image loading on mobile."""
import pathlib, sys

f = pathlib.Path("app/shop/page.tsx")
src = f.read_text()
orig = src

old = """                    <Image src={productImage(p.id)} alt={p.name} fill sizes="(max-width:640px) 50vw, (max-width:900px) 33vw, 25vw" style={{objectFit:'cover'}} />
                    <div style={{position:'absolute',fontSize:64,opacity:.22}}>{p.emoji}</div>"""

new = """                    <Image src={productImage(p.id)} alt={p.name} fill sizes="(max-width:640px) 50vw, (max-width:900px) 33vw, 25vw" style={{objectFit:'cover'}} />"""

if old not in src:
    print("WARNING: anchor drifted; skipping")
    sys.exit(1)

src = src.replace(old, new)
f.write_text(src)
print(f"Patched {f}, removed emoji overlay ({len(orig)-len(src)} chars)")
