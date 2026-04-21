#!/usr/bin/env python3
"""DECISIVE fix for homepage 'jumping' — kills the translateY motion in
.fu entrance animations. Content will now appear in its final position
and just fade in. No upward motion, no staggered cascade, no jumps.

Uses regex tolerant to whatever the current file state is (exact-match
str_replace failed repeatedly)."""
import pathlib, re

f = pathlib.Path("app/page.tsx")
src = f.read_text()
orig = src

# Replace the entire fadeUp keyframe — tolerant to any whitespace/translate value
pattern = re.compile(
    r'@keyframes fadeUp\s*\{[^}]*from\s*\{[^}]*\}\s*to\s*\{[^}]*\}\s*\}',
    re.MULTILINE | re.DOTALL
)
replacement = '@keyframes fadeUp{from{opacity:0}to{opacity:1}}'
new_src = pattern.sub(replacement, src)

if new_src == src:
    # Try the compact on-one-line version
    pattern2 = re.compile(r'@keyframes fadeUp\{from\{opacity:0;transform:translateY\([^)]+\)\}to\{opacity:1;transform:translateY\(0\)\}\}')
    new_src = pattern2.sub(replacement, src)

if new_src == src:
    print("WARNING: fadeUp keyframe not found in expected form.")
    print("Scanning file for any fadeUp mentions:")
    for i, line in enumerate(src.split('\n'), 1):
        if 'fadeUp' in line or 'translateY' in line:
            print(f"  line {i}: {line.strip()[:120]}")
    raise SystemExit(1)

src = new_src

# Also tone down any stagger delays — make them tighter or remove entirely
# Look for the .fu class line with staggered delays
pattern_stagger = re.compile(
    r'\.fu\{animation:fadeUp[^}]+\}\s*\.fu1\{animation-delay:[^}]+\}\.fu2\{animation-delay:[^}]+\}\.fu3\{animation-delay:[^}]+\}\.fu4\{animation-delay:[^}]+\}'
)
replacement_stagger = '.fu{animation:fadeUp .3s ease-out forwards}.fu1,.fu2,.fu3,.fu4{animation-delay:0s}'
src = pattern_stagger.sub(replacement_stagger, src)

f.write_text(src)
print(f"Patched app/page.tsx ({len(src)-len(orig):+} chars)")
print("  • fadeUp keyframe: kept opacity fade, removed translateY motion")
print("  • .fu classes: removed staggered delays (no more cascading)")
print("  • Animation duration: .3s (fast, subtle)")
