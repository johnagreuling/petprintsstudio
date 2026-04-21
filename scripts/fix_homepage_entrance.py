#!/usr/bin/env python3
"""Fix homepage entrance jumping (3 issues, 1 patch):
1. Remove app/template.tsx — it competed with .fu animations
2. Tone down .fu animations — 24px→8px, .8s→.4s, less stagger
3. Reserve slider space upfront so it doesn't pop in and shift content"""
import pathlib, sys

# ─── 1. Remove template.tsx (regression I introduced) ───
tpl = pathlib.Path("app/template.tsx")
if tpl.exists():
    tpl.unlink()
    print(f"OK  Removed {tpl}")

# ─── 2. Tone down the .fu entrance animations ───
page = pathlib.Path("app/page.tsx")
src = page.read_text()
orig = src

old_anim = """        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .8s ease forwards}
        .fu1{animation-delay:.05s}.fu2{animation-delay:.1s}.fu3{animation-delay:.18s}.fu4{animation-delay:.28s}"""

new_anim = """        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .4s ease-out forwards;will-change:opacity,transform}
        .fu1{animation-delay:.04s}.fu2{animation-delay:.08s}.fu3{animation-delay:.12s}.fu4{animation-delay:.16s}"""

assert old_anim in src, "fu animation anchor drifted"
src = src.replace(old_anim, new_anim)

# ─── 3. Reserve slider space — render placeholder before data loads ───
old_slider = "        {heroShowcase.length > 0 && (\n          <div className=\"fu fu4\" style={{position:'relative',width:'100%',maxWidth:1200,margin:'0 auto 8px'}}>"
new_slider = "        <div className=\"fu fu4\" style={{position:'relative',width:'100%',maxWidth:1200,margin:'0 auto 8px',minHeight:340}}>\n        {heroShowcase.length > 0 && (\n          <div style={{position:'relative',width:'100%'}}>"

assert old_slider in src, "slider opening anchor drifted"
src = src.replace(old_slider, new_slider)

# Find the matching closing of the slider conditional and add the placeholder div close
# The slider conditional originally closed with: )}\n      </section>
# We need to add a closing </div> before that final )} since we wrapped in a new div above
old_close = "          </div>\n        )}\n\n        <div className=\"fu fu4\" style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',marginBottom:0}}>"
new_close = "          </div>\n        )}\n        </div>\n\n        <div className=\"fu fu4\" style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',marginBottom:0}}>"

assert old_close in src, "slider close anchor drifted"
src = src.replace(old_close, new_close)

if src != orig:
    page.write_text(src)
    print(f"OK  Patched {page} ({len(src)-len(orig):+} chars)")

print("\nDone. Now: npm run build")
