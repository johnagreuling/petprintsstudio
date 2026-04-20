#!/usr/bin/env python3
"""
Strip live "X of 24" + "(2/6)" counters from /create gallery.
Show clear "Maximum Images Generated" notice only when the cap is hit.
"""
import pathlib, sys, re

f = pathlib.Path("app/create/page.tsx")
src = f.read_text()
orig = src

# 1. Remove global counter line
old1 = """              <div style={{marginTop:12,fontSize:11,color:atMaxTotal?'var(--rust)':'var(--muted)',letterSpacing:'.12em',textTransform:'uppercase'}}>
                {totalGenerated} of {GEN_LIMITS.MAX_TOTAL} portraits generated
              </div>
"""
assert src.count(old1) == 1, "anchor 1 drifted (global counter)"
src = src.replace(old1, "")

# 2. Remove per-style count parenthetical
old2 = """                      <span style={{fontSize:9,opacity:.6}}>({countForStyle}/{GEN_LIMITS.MAX_PER_STYLE})</span>
"""
assert src.count(old2) == 1, "anchor 2 drifted (per-style counter)"
src = src.replace(old2, "")

# 3. Replace CTA block with atMaxTotal-aware version
old3 = """            {/* Add new style button */}
            {!atMaxTotal && availableNewStyles.length > 0 && (
              <div style={{textAlign:'center',marginTop:32,marginBottom:40,padding:'24px',border:'1px dashed rgba(201,168,76,.25)'}}>
                <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>Want another look?</div>
                <button onClick={()=>setShowStylePicker(true)} disabled={!!expandingStyle}
                  style={{background:'transparent',border:'1px solid var(--gold)',color:'var(--gold)',padding:'12px 28px',fontSize:11,letterSpacing:'.15em',textTransform:'uppercase',cursor:expandingStyle?'not-allowed':'pointer',opacity:expandingStyle?.5:1,fontWeight:600}}>
                  + Try a New Style
                </button>
                <div style={{fontSize:10,color:'var(--muted)',marginTop:10}}>
                  {GEN_LIMITS.MAX_TOTAL - totalGenerated} portraits left in this session
                </div>
              </div>
            )}"""
new3 = """            {/* Add new style button — or max-reached notice */}
            {atMaxTotal ? (
              <div style={{textAlign:'center',marginTop:32,marginBottom:40,padding:'28px 24px',border:'1px solid rgba(196,98,45,.4)',background:'rgba(196,98,45,.04)'}}>
                <div style={{fontSize:11,letterSpacing:'.28em',textTransform:'uppercase',color:'var(--rust)',fontWeight:600}}>
                  Maximum Images Generated
                </div>
                <div style={{fontSize:12,color:'var(--muted)',marginTop:10,lineHeight:1.6,maxWidth:440,margin:'10px auto 0'}}>
                  You&rsquo;ve reached this session&rsquo;s limit. Pick your favorite and continue — or start a new session any time.
                </div>
              </div>
            ) : availableNewStyles.length > 0 && (
              <div style={{textAlign:'center',marginTop:32,marginBottom:40,padding:'24px',border:'1px dashed rgba(201,168,76,.25)'}}>
                <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>Want another look?</div>
                <button onClick={()=>setShowStylePicker(true)} disabled={!!expandingStyle}
                  style={{background:'transparent',border:'1px solid var(--gold)',color:'var(--gold)',padding:'12px 28px',fontSize:11,letterSpacing:'.15em',textTransform:'uppercase',cursor:expandingStyle?'not-allowed':'pointer',opacity:expandingStyle?.5:1,fontWeight:600}}>
                  + Try a New Style
                </button>
              </div>
            )}"""
assert src.count(old3) == 1, "anchor 3 drifted (CTA block)"
src = src.replace(old3, new3)

if src == orig:
    print("No changes applied"); sys.exit(1)
f.write_text(src)

def balance(s):
    return {
        'div': len(re.findall(r'<div\b', s)) - len(re.findall(r'</div>', s)),
        'button': len(re.findall(r'<button\b', s)) - len(re.findall(r'</button>', s)),
        'span': len(re.findall(r'<span\b', s)) - len(re.findall(r'</span>', s)),
    }
print(f"Patched {f}")
print(f"Delta: {len(src)-len(orig):+} chars")
print(f"JSX balance (expect 7/1/1): {balance(src)}")
