#!/usr/bin/env python3
"""
M5: Migrate /order-success, /song, /checkout, /bespoke, /gallery to SiteNav.
Consistent branding + mobile hamburger + cart badge across all customer-facing pages.
"""
import pathlib, sys, re

errors, patched = [], []

def patch(path, edits, label):
    f = pathlib.Path(path)
    src = f.read_text()
    orig = src
    for i, (old, new) in enumerate(edits, 1):
        c = src.count(old)
        if c != 1:
            errors.append(f"  ✗ {label} edit {i}: expected 1 match, got {c}")
            return
        src = src.replace(old, new)
    if src == orig:
        errors.append(f"  ✗ {label}: no changes")
        return
    f.write_text(src)
    patched.append(f"  ✓ {label}")

# 1. /order-success
patch("app/order-success/page.tsx", [
    (
        "import Link from 'next/link'\nimport { Suspense, useEffect } from 'react'",
        "import Link from 'next/link'\nimport { Suspense, useEffect } from 'react'\nimport SiteNav from '@/components/SiteNav'"
    ),
    (
        "    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 24px',fontFamily:\"'DM Sans',sans-serif\"}}>",
        "    <><SiteNav /><div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'calc(100vh - 74px)',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'114px 24px 40px',fontFamily:\"'DM Sans',sans-serif\"}}>"
    ),
    (
        "      </div>\n    </div>\n  )\n}\n\nexport default function OrderSuccess() {",
        "      </div>\n    </div></>\n  )\n}\n\nexport default function OrderSuccess() {"
    ),
], "/order-success")

# 2. /song/[sessionId]
patch("app/song/[sessionId]/page.tsx", [
    (
        "import Link from 'next/link'",
        "import Link from 'next/link'\nimport SiteNav from '@/components/SiteNav'"
    ),
    (
        "  if (error) return (\n    <div style={{background:'#0A0A0A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\",textAlign:'center',padding:40}}>",
        "  if (error) return (\n    <><SiteNav /><div style={{background:'#0A0A0A',minHeight:'calc(100vh - 74px)',display:'flex',alignItems:'center',justifyContent:'center',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\",textAlign:'center',padding:'114px 40px 40px'}}>"
    ),
    (
        "        <Link href=\"/create\" style={{background:'#C9A84C',color:'#0A0A0A',padding:'14px 32px',textDecoration:'none',fontWeight:700,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase'}}>Create Your Own</Link>\n      </div>\n    </div>\n  )",
        "        <Link href=\"/create\" style={{background:'#C9A84C',color:'#0A0A0A',padding:'14px 32px',textDecoration:'none',fontWeight:700,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase'}}>Create Your Own</Link>\n      </div>\n    </div></>\n  )"
    ),
    (
        "  return (\n    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\"}}>",
        "  return (\n    <><SiteNav /><div style={{background:'#0A0A0A',minHeight:'calc(100vh - 74px)',color:'#F5F0E8',fontFamily:\"'DM Sans',sans-serif\",paddingTop:74}}>"
    ),
    (
        "      <div style={{position:'relative',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center'}}>",
        "      <div style={{position:'relative',minHeight:'calc(100vh - 74px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center'}}>"
    ),
    (
        "      <div style={{textAlign:'center',padding:'24px',color:'rgba(245,240,232,.2)',fontSize:11,letterSpacing:'.1em'}}>© PET PRINTS STUDIO · petprintsstudio.com</div>\n    </div>\n  )\n}",
        "      <div style={{textAlign:'center',padding:'24px',color:'rgba(245,240,232,.2)',fontSize:11,letterSpacing:'.1em'}}>© PET PRINTS STUDIO · petprintsstudio.com</div>\n    </div></>\n  )\n}"
    ),
], "/song/[sessionId]")

# 3. /checkout/[sessionId]
patch("app/checkout/[sessionId]/page.tsx", [
    (
        "'use client'\nimport",
        "'use client'\nimport SiteNav from '@/components/SiteNav'\nimport"
    ),
    (
        "  if (!imageUrl) {\n    return (\n      <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px 24px',fontFamily:\"'DM Sans',sans-serif\"}}>",
        "  if (!imageUrl) {\n    return (\n      <><SiteNav /><div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'calc(100vh - 74px)',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'114px 24px 40px',fontFamily:\"'DM Sans',sans-serif\"}}>"
    ),
    (
        "            Create Your Portrait →\n          </Link>\n        </div>\n      </div>\n    )\n  }",
        "            Create Your Portrait →\n          </Link>\n        </div>\n      </div></>\n    )\n  }"
    ),
    (
        """      {/* Header */}
      <header style={{padding:'20px 32px',borderBottom:'1px solid rgba(245,240,232,.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Link href="/" style={{textDecoration:'none',color:'#F5F0E8',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:24}}>🐾</span>
          <span style={{fontSize:18,fontWeight:500}}>Pet Prints Studio</span>
        </Link>
        <div style={{fontSize:11,color:'var(--gold)',letterSpacing:'.15em',textTransform:'uppercase'}}>
          Checkout
        </div>
      </header>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'48px 24px 120px'}}>""",
        """      <SiteNav />

      <div style={{maxWidth:1100,margin:'0 auto',padding:'122px 24px 120px'}}>"""
    ),
], "/checkout/[sessionId]")

# 4. /bespoke
patch("app/bespoke/page.tsx", [
    (
        "'use client'\nimport { useState } from 'react'\nimport Link from 'next/link'",
        "'use client'\nimport { useState } from 'react'\nimport Link from 'next/link'\nimport SiteNav from '@/components/SiteNav'"
    ),
    (
        """      <nav style={{padding:'18px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(245,240,232,.06)',position:'sticky',top:0,background:'#0A0A0A',zIndex:100}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'inherit'}}>
          <span>🐾</span>
          <span className="serif" style={{fontSize:20}}>Pet Prints Studio</span>
        </Link>
        <Link href="/create" style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none'}}>← Back to Create</Link>
      </nav>

      <main style={{maxWidth:720,margin:'0 auto',padding:'72px 24px 100px'}}>""",
        """      <SiteNav />

      <main style={{maxWidth:720,margin:'0 auto',padding:'146px 24px 100px'}}>"""
    ),
], "/bespoke")

# 5. /gallery
patch("app/gallery/page.tsx", [
    (
        "import Link from 'next/link'",
        "import Link from 'next/link'\nimport SiteNav from '@/components/SiteNav'"
    ),
    (
        """      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(10,10,10,.97)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(245,240,232,.06)',padding:'16px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <Link href="/" style={{color:'rgba(245,240,232,.4)',textDecoration:'none',fontSize:11,letterSpacing:'.15em',textTransform:'uppercase'}}>← Site</Link>
          <span style={{color:'rgba(245,240,232,.15)'}}>|</span>
          <span style={{fontFamily:\"'Cormorant Garamond',serif\",fontSize:20}}>🐾 Studio Gallery</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <input
            placeholder="Search by pet name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{background:'#1E1E1E',border:'1px solid rgba(245,240,232,.1)',color:'#F5F0E8',padding:'8px 14px',fontSize:13,outline:'none',width:220}}
          />
          <span style={{color:'rgba(245,240,232,.4)',fontSize:13}}>{filtered.length} sessions</span>
        </div>
      </nav>

      <div style={{display:'flex',height:'calc(100vh - 57px)'}}>""",
        """      <SiteNav />

      {/* Gallery utility bar — search + session count, sits below SiteNav */}
      <div style={{position:'sticky',top:74,zIndex:99,background:'rgba(10,10,10,.97)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(245,240,232,.06)',padding:'14px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:74}}>
        <div style={{fontFamily:\"'Cormorant Garamond',serif\",fontSize:18}}>Studio Gallery</div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <input
            placeholder="Search by pet name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{background:'#1E1E1E',border:'1px solid rgba(245,240,232,.1)',color:'#F5F0E8',padding:'8px 14px',fontSize:13,outline:'none',width:220}}
          />
          <span style={{color:'rgba(245,240,232,.4)',fontSize:13}}>{filtered.length} sessions</span>
        </div>
      </div>

      <div style={{display:'flex',height:'calc(100vh - 74px - 52px)'}}>"""
    ),
], "/gallery")

print("Applied:")
for p in patched: print(p)
if errors:
    print("\nErrors:")
    for e in errors: print(e)
    sys.exit(1)

files = [
    "app/order-success/page.tsx",
    "app/song/[sessionId]/page.tsx",
    "app/checkout/[sessionId]/page.tsx",
    "app/bespoke/page.tsx",
    "app/gallery/page.tsx",
]
print("\nSiteNav wired into each file:")
for fp in files:
    s = pathlib.Path(fp).read_text()
    refs = s.count("SiteNav")
    print(f"  {fp}: {refs} refs")
