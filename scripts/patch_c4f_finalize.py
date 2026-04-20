#!/usr/bin/env python3
"""
C4f finalization: /create is already cart-only (routing confirmed at line 1400+).
This removes dead state vars and stale comments left from the old single-flow checkout.
"""
import pathlib, sys, re

f = pathlib.Path("app/create/page.tsx")
src = f.read_text()
orig = src

# 1. Dead `skipPrimary` state
old1 = "  const [skipPrimary, setSkipPrimary] = useState(false)\n"
assert src.count(old1) == 1, "anchor 1 drifted (skipPrimary)"
src = src.replace(old1, "")

# 2. Dead `checkoutLoading` state
old2 = "  const [checkoutLoading, setCheckoutLoading] = useState(false)\n"
assert src.count(old2) == 1, "anchor 2 drifted (checkoutLoading)"
src = src.replace(old2, "")

# 3. Stale handleCheckout reference in upload-flow comment
old3 = """      // NOTE: Song brief is now generated at CHECKOUT time (when we have song answers + genre)
      // not at generation time. See handleCheckout + /api/checkout."""
new3 = """      // NOTE: Song brief is generated at CHECKOUT time (when we have song answers + genre)
      // not at generation time. The cart forwards orderMeta → /api/checkout."""
assert src.count(old3) == 1, "anchor 3 drifted (handleCheckout comment)"
src = src.replace(old3, new3)

# 4. Stale Skip-primary toggle breadcrumb
old4 = """              {/* Skip-primary toggle — lets users checkout with just keepsakes */}

              {/* Medium toggle */}"""
new4 = "              {/* Medium toggle */}"
assert src.count(old4) == 1, "anchor 4 drifted (skip-primary comment)"
src = src.replace(old4, new4)

if src == orig:
    print("No changes applied"); sys.exit(1)
f.write_text(src)

def balance(s):
    return {
        'div':    len(re.findall(r'<div\b',    s)) - len(re.findall(r'</div>',    s)),
        'button': len(re.findall(r'<button\b', s)) - len(re.findall(r'</button>', s)),
        'span':   len(re.findall(r'<span\b',   s)) - len(re.findall(r'</span>',   s)),
    }
print(f"Patched {f}")
print(f"Delta: {len(src)-len(orig):+} chars")
print(f"JSX balance (expect 7/1/1): {balance(src)}")
