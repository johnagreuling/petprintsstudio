#!/usr/bin/env python3
"""Homepage hero: smaller headline, tighter See/Hear/Feel spacing, less hero padding
so the upload box lands above the fold on a typical laptop viewport."""
import pathlib, sys

f = pathlib.Path("app/page.tsx")
src = f.read_text()
orig = src

# 1. Smaller headline — drop ~16px on desktop (108 -> 92)
old1 = "<h1 className=\"serif fu fu2\" style={{fontSize:'clamp(52px,8vw,108px)',lineHeight:.96,marginBottom:28,fontWeight:400,maxWidth:1040,letterSpacing:'-.02em'}}>"
new1 = "<h1 className=\"serif fu fu2\" style={{fontSize:'clamp(44px,6.5vw,92px)',lineHeight:.96,marginBottom:22,fontWeight:400,maxWidth:1040,letterSpacing:'-.02em'}}>"
assert src.count(old1) == 1, "anchor 1 drifted (h1)"
src = src.replace(old1, new1)

# 2. Hero section: less top padding + less bottom padding -> pulls upload above fold
old2 = "padding:'140px 24px 80px'"
new2 = "padding:'110px 24px 48px'"
assert src.count(old2) == 1, "anchor 2 drifted (section padding)"
src = src.replace(old2, new2)

# 3. Sub-list wrapper: tighter gap between rows + tighter marginBottom
old3 = "<div className=\"fu fu3\" style={{marginBottom:36,display:'flex',flexDirection:'column',gap:20,alignItems:'center',maxWidth:820,margin:'0 auto 36px'}}>"
new3 = "<div className=\"fu fu3\" style={{marginBottom:24,display:'flex',flexDirection:'column',gap:10,alignItems:'center',maxWidth:820,margin:'0 auto 24px'}}>"
assert src.count(old3) == 1, "anchor 3 drifted (sub-list wrapper)"
src = src.replace(old3, new3)

# 4. Each sub-list row: drop font size + tighten line-height
old4 = "<div key={label} style={{fontSize:'clamp(18px,2vw,24px)',color:'var(--cream)',lineHeight:1.5,fontWeight:300,textAlign:'center',letterSpacing:'.005em'}}>"
new4 = "<div key={label} style={{fontSize:'clamp(16px,1.6vw,20px)',color:'var(--cream)',lineHeight:1.4,fontWeight:300,textAlign:'center',letterSpacing:'.005em'}}>"
assert src.count(old4) == 1, "anchor 4 drifted (sub-list row)"
src = src.replace(old4, new4)

if src == orig:
    print("No changes"); sys.exit(1)
f.write_text(src)
print(f"Patched {f}, {len(src)-len(orig):+} chars")
