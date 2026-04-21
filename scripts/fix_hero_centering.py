#!/usr/bin/env python3
"""Fix the homepage hero jump.
Root cause: minHeight:'100vh' + justifyContent:'center' on the hero section.
When viewport recalculates after first paint (browser chrome settling, scrollbar
appearing, hydration finishing), the centered content shifts to the new center.

Fix: anchor content to the top with padding instead of flex-centering it
against a viewport-height container."""
import pathlib

f = pathlib.Path("app/page.tsx")
src = f.read_text()
orig = src

old = """      <section className=\"hero-section home-hero\" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'110px 24px 48px',position:'relative',overflow:'hidden'}}>"""

new = """      <section className=\"hero-section home-hero\" style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',padding:'140px 24px 48px',position:'relative',overflow:'hidden'}}>"""

assert old in src, "hero section anchor drifted"
src = src.replace(old, new)

# Also remove the main wrapper's 100vh — same issue at outer level
old_main = """    <main style={{background:'#0A0A0A',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\",minHeight:'100vh'}}>"""
new_main = """    <main style={{background:'#0A0A0A',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\"}}>"""

assert old_main in src, "main anchor drifted"
src = src.replace(old_main, new_main)

f.write_text(src)
print(f"Patched {f}, {len(src)-len(orig):+} chars")
