#!/usr/bin/env python3
"""Real fix for the homepage layout shift, based on actual browser diagnostic
data measured live on petprintsstudio.com:

  hero.minHeight: '801px' (100vh)
  hero.actualHeight: 1364px
  hero.justifyContent: 'center'
  document.fonts.status: 'loading' at first paint

The combination of minHeight:100vh + justifyContent:center means: when ANYTHING
changes the viewport height after first paint (browser chrome settling, font
swap changing content metrics, scrollbar appearing), the hero re-evaluates 100vh,
content re-centers, and the entire block visibly jumps.

Fix: remove the 100vh anchor and the centering. Anchor content to the top with
padding instead. Now even if viewport changes, content stays where it is."""
import pathlib

f = pathlib.Path("app/page.tsx")
src = f.read_text()
orig = src

# Fix 1: main wrapper — drop 100vh
old_main = "    <main style={{background:'#0A0A0A',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\",minHeight:'100vh'}}>"
new_main = "    <main style={{background:'#0A0A0A',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\"}}>"
assert old_main in src, "main wrapper anchor drifted"
src = src.replace(old_main, new_main)

# Fix 2: hero section — drop minHeight:100vh AND justifyContent:center, beef up top padding to compensate
old_hero = "      <section className=\"hero-section home-hero\" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'110px 24px 48px',position:'relative',overflow:'hidden'}}>"
new_hero = "      <section className=\"hero-section home-hero\" style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',padding:'140px 24px 60px',position:'relative',overflow:'hidden'}}>"
assert old_hero in src, "hero section anchor drifted"
src = src.replace(old_hero, new_hero)

f.write_text(src)
print(f"Patched app/page.tsx, {len(src)-len(orig):+} chars")
print("Removed: minHeight:100vh + justifyContent:center (the cause of the visible jump)")
print("Added: 30px more top padding to compensate for lost vertical centering")
