#!/usr/bin/env python3
"""Migrate raw <img> tags to Next.js <Image> on customer-facing pages."""
import pathlib, sys

# ─── app/shop/page.tsx ───
shop = pathlib.Path("app/shop/page.tsx")
src = shop.read_text()
orig = src
if "from 'next/image'" not in src:
    src = src.replace(
        "import Link from 'next/link'\nimport SiteNav from '@/components/SiteNav'",
        "import Link from 'next/link'\nimport Image from 'next/image'\nimport SiteNav from '@/components/SiteNav'",
    )
old = """                    <img src={productImage(p.id)} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />"""
new = """                    <Image src={productImage(p.id)} alt={p.name} fill sizes="(max-width:640px) 50vw, (max-width:900px) 33vw, 25vw" style={{objectFit:'cover'}} />"""
assert old in src, "shop img anchor drifted"
src = src.replace(old, new)
if src != orig:
    shop.write_text(src)
    print(f"OK  Patched {shop}")

# ─── app/styles/page.tsx ───
styles = pathlib.Path("app/styles/page.tsx")
src = styles.read_text()
orig = src
if "from 'next/image'" not in src:
    src = src.replace(
        "import SiteNav from '@/components/SiteNav'\nimport Link from 'next/link'",
        "import SiteNav from '@/components/SiteNav'\nimport Image from 'next/image'\nimport Link from 'next/link'",
    )
old = """                  <img src={style.showcaseUrl} alt={style.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />"""
new = """                  <Image src={style.showcaseUrl} alt={style.name} fill sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 33vw" style={{ objectFit: 'cover' }} />"""
assert old in src, "styles gallery img anchor drifted"
src = src.replace(old, new)
old_lb = """                <img src={lightbox.style.showcaseUrl} alt={lightbox.style.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />"""
new_lb = """                <Image src={lightbox.style.showcaseUrl} alt={lightbox.style.name} fill sizes="680px" style={{ objectFit: 'cover' }} />"""
assert old_lb in src, "styles lightbox img anchor drifted"
src = src.replace(old_lb, new_lb)
if src != orig:
    styles.write_text(src)
    print(f"OK  Patched {styles}")

# ─── app/page.tsx (homepage) ───
page = pathlib.Path("app/page.tsx")
src = page.read_text()
orig = src
if "from 'next/image'" not in src:
    src = src.replace(
        "import Link from 'next/link'\nimport SiteNav from '@/components/SiteNav'",
        "import Link from 'next/link'\nimport Image from 'next/image'\nimport SiteNav from '@/components/SiteNav'",
    )

old = """                  <img src={item.url} alt={`${item.pet} — ${item.style}`} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} loading=\"lazy\" />"""
new = """                  <Image src={item.url} alt={`${item.pet} — ${item.style}`} fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />"""
assert old in src, "page hero showcase img anchor drifted"
src = src.replace(old, new)

old = """                <img src=\"/process-upload.jpg\" alt=\"Upload your pet's photo\" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />"""
new = """                <Image src=\"/process-upload.jpg\" alt=\"Upload your pet's photo\" fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />"""
assert old in src, "page step1 img anchor drifted"
src = src.replace(old, new)

old = """                <img src=\"/step2-wyatt.jpg\" alt=\"Wyatt's personalized portrait\" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />"""
new = """                <Image src=\"/step2-wyatt.jpg\" alt=\"Wyatt's personalized portrait\" fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />"""
assert old in src, "page step2 img anchor drifted"
src = src.replace(old, new)

old = """                      <img src={s.url} alt={s.style} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} loading=\"lazy\"/>"""
new = """                      <Image src={s.url} alt={s.style} fill sizes="80px" style={{objectFit:'cover'}} />"""
assert old in src, "page step3 mini grid img anchor drifted"
src = src.replace(old, new)

old = """                <img src=\"/step4-delivered.png\" alt=\"Canvas portrait being unboxed\" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>"""
new = """                <Image src=\"/step4-delivered.png\" alt=\"Canvas portrait being unboxed\" fill sizes="(max-width:640px) 50vw, 25vw" style={{objectFit:'cover'}} />"""
assert old in src, "page step4 img anchor drifted"
src = src.replace(old, new)

old = """        <img src=\"/portrait-on-wall.png\" alt=\"Pet portrait hanging in a beautiful home\" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 35%',display:'block'}} />"""
new = """        <Image src=\"/portrait-on-wall.png\" alt=\"Pet portrait hanging in a beautiful home\" fill sizes="100vw" priority style={{objectFit:'cover',objectPosition:'center 35%'}} />"""
assert old in src, "page cinematic hero img anchor drifted"
src = src.replace(old, new)

old = """                  <img
                    src={t.pet}
                    alt={`${t.petName}'s portrait in ${t.name}'s home`}
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}
                  />"""
new = """                  <Image
                    src={t.pet}
                    alt={`${t.petName}'s portrait in ${t.name}'s home`}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 33vw"
                    style={{objectFit:'cover'}}
                  />"""
assert old in src, "page testimonial img anchor drifted"
src = src.replace(old, new)

if src != orig:
    page.write_text(src)
    print(f"OK  Patched {page}")

print("\nDone. Now: npm run build")
