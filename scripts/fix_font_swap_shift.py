#!/usr/bin/env python3
"""Eliminate font-swap layout shift on the homepage.
Switches Google Fonts from 'swap' (causes FOUT shift) to 'optional'
and adds explicit fallback fonts so Next.js generates metric-adjusted
fallbacks that don't shift content when the real font arrives."""
import pathlib, sys

f = pathlib.Path("app/layout.tsx")
src = f.read_text()
orig = src

old_cormorant = """const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})"""

new_cormorant = """const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'optional',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
})"""

assert old_cormorant in src, "cormorant config anchor drifted"
src = src.replace(old_cormorant, new_cormorant)

old_dm = """const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})"""

new_dm = """const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'optional',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})"""

assert old_dm in src, "dmsans config anchor drifted"
src = src.replace(old_dm, new_dm)

f.write_text(src)
print(f"Patched {f}, {len(src)-len(orig):+} chars")
