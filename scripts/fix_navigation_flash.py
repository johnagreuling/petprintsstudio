#!/usr/bin/env python3
"""Fix the navigation flash/ghosting on mobile.
1. Add html background color (prevents white-flash during route transitions)
2. Add app/loading.tsx (deliberate loading state instead of stale page)
3. Add app/template.tsx (smooth fade-in on every route change)"""
import pathlib, sys

# 1. globals.css — add html background to prevent flash
gcss = pathlib.Path("app/globals.css")
src = gcss.read_text()
orig = src
old = "body { background: #0A0A0A; color: #F5F0E8; font-family: var(--font-dm-sans), 'DM Sans', sans-serif; overflow-x: hidden; }"
new = "html { background: #0A0A0A; }\nbody { background: #0A0A0A; color: #F5F0E8; font-family: var(--font-dm-sans), 'DM Sans', sans-serif; overflow-x: hidden; }"
assert old in src, "globals.css body anchor drifted"
src = src.replace(old, new)
gcss.write_text(src)
print(f"OK  Patched {gcss}")

# 2. app/loading.tsx — clean loading state during route transitions
loading_path = pathlib.Path("app/loading.tsx")
loading_path.write_text('''export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        opacity: 0.6,
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid rgba(201,168,76,.18)',
          borderTopColor: '#C9A84C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          fontSize: 10,
          letterSpacing: '.3em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          fontFamily: 'var(--font-dm-sans), sans-serif',
        }}>Loading</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
''')
print(f"OK  Created {loading_path}")

# 3. app/template.tsx — smooth fade on every route change
template_path = pathlib.Path("app/template.tsx")
template_path.write_text('''export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'fadeIn .25s ease-out' }}>
      {children}
      <style>{`@keyframes fadeIn { from { opacity: 0.4; } to { opacity: 1; } }`}</style>
    </div>
  )
}
''')
print(f"OK  Created {template_path}")

print("\nDone. Now: npm run build")
