'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'

interface SessionImage {
  url: string
  styleId: string
  styleName: string
  model: string
}

interface Session {
  sessionId: string
  petName: string
  petType: string
  petDescription: string
  isMemory: boolean
  imageCount: number
  createdAt: string
  styles: string[]
  images: SessionImage[]
  folder: string
}

export default function GalleryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Session | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)

  const GALLERY_PASS = process.env.NEXT_PUBLIC_GALLERY_PASS || 'mason2024'

  function checkAuth() {
    if (password === GALLERY_PASS) setAuthed(true)
  }

  useEffect(() => {
    if (!authed) return
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => { setSessions(data.sessions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authed])

  function downloadImage(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function downloadAll(session: Session) {
    for (let i = 0; i < session.images.length; i++) {
      const img = session.images[i]
      const filename = `${session.petName}_${img.styleName.replace(/[^a-z0-9]/gi, '_')}_${i+1}.png`
      setTimeout(() => downloadImage(img.url, filename), i * 600)
    }
  }

  const filtered = sessions.filter(s =>
    !search || s.petName.toLowerCase().includes(search.toLowerCase()) ||
    s.petType?.toLowerCase().includes(search.toLowerCase())
  )

  if (!authed) return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:'#141414',border:'1px solid rgba(245,240,232,.08)',padding:'48px',width:360}}>
        <div style={{fontSize:24,color:'#F5F0E8',marginBottom:8,fontFamily:"'Cormorant Garamond',serif"}}>🐾 Studio Gallery</div>
        <div style={{color:'rgba(245,240,232,.45)',fontSize:13,marginBottom:32}}>Admin access required</div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkAuth()}
          style={{width:'100%',background:'#1E1E1E',border:'1px solid rgba(245,240,232,.15)',color:'#F5F0E8',padding:'12px 16px',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:12}}
        />
        <button onClick={checkAuth} style={{width:'100%',background:'#C9A84C',color:'#0A0A0A',padding:'14px',fontWeight:700,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase',border:'none',cursor:'pointer'}}>
          ENTER
        </button>
      </div>
    </div>
  )

  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F5F0E8',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 6px } ::-webkit-scrollbar-track { background: #141414 } ::-webkit-scrollbar-thumb { background: #333 }
        .img-card:hover { border-color: rgba(201,168,76,.5) !important; transform: scale(1.02); }
        .img-card { transition: all .2s; cursor: pointer; }
        .sess-card:hover { border-color: rgba(201,168,76,.3) !important; }
        .sess-card { transition: border-color .2s; cursor: pointer; }
        .dl-btn:hover { background: #C9A84C !important; color: #0A0A0A !important; }
      `}</style>

      <SiteNav />

      {/* Gallery utility bar — search + session count, sits below SiteNav */}
      <div style={{position:'sticky',top:74,zIndex:99,background:'rgba(10,10,10,.97)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(245,240,232,.06)',padding:'14px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:74}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18}}>Studio Gallery</div>
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

      <div style={{display:'flex',height:'calc(100vh - 74px - 52px)'}}>

        {/* SESSION LIST */}
        <div style={{width:320,flexShrink:0,borderRight:'1px solid rgba(245,240,232,.06)',overflowY:'auto',padding:'16px'}}>
          {loading && <div style={{color:'rgba(245,240,232,.4)',padding:20,textAlign:'center'}}>Loading sessions...</div>}
          {!loading && filtered.length === 0 && <div style={{color:'rgba(245,240,232,.4)',padding:20,textAlign:'center'}}>No sessions yet</div>}
          {filtered.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(s => (
            <div
              key={s.sessionId}
              className="sess-card"
              onClick={() => setSelected(s)}
              style={{background: selected?.sessionId === s.sessionId ? '#1E1E1E' : '#141414', border:`1px solid ${selected?.sessionId === s.sessionId ? 'rgba(201,168,76,.4)' : 'rgba(245,240,232,.06)'}`, padding:'16px',marginBottom:8}}
            >
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <div style={{fontWeight:600,fontSize:15}}>{s.petName || 'Unknown'}</div>
                <div style={{background:s.isMemory ? '#C9A84C22' : '#1E1E1E',border:`1px solid ${s.isMemory ? '#C9A84C' : 'rgba(245,240,232,.1)'}`,color:s.isMemory ? '#C9A84C' : 'rgba(245,240,232,.4)',fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',padding:'2px 8px'}}>
                  {s.isMemory ? 'Memory' : 'Style'}
                </div>
              </div>
              <div style={{fontSize:12,color:'rgba(245,240,232,.4)',marginBottom:6}}>{s.petType} · {s.imageCount} portraits</div>
              <div style={{fontSize:11,color:'rgba(245,240,232,.3)'}}>
                {new Date(s.createdAt).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
              </div>
              {s.images?.[0] && (
                <img src={s.images[0].url} style={{width:'100%',aspectRatio:'1',objectFit:'cover',marginTop:10,opacity:.7}} />
              )}
            </div>
          ))}
        </div>

        {/* IMAGE GRID */}
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
          {!selected && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'rgba(245,240,232,.3)'}}>
              <div style={{fontSize:48,marginBottom:16}}>🎨</div>
              <div style={{fontSize:16}}>Select a session to view portraits</div>
            </div>
          )}

          {selected && (
            <>
              {/* Session header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,paddingBottom:24,borderBottom:'1px solid rgba(245,240,232,.06)'}}>
                <div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:400}}>{selected.petName}</div>
                  <div style={{color:'rgba(245,240,232,.5)',fontSize:13,marginTop:4}}>{selected.petDescription}</div>
                  <div style={{color:'rgba(245,240,232,.3)',fontSize:11,marginTop:6}}>{selected.sessionId}</div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button
                    onClick={() => downloadAll(selected)}
                    className="dl-btn"
                    style={{background:'transparent',border:'1px solid #C9A84C',color:'#C9A84C',padding:'10px 20px',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s'}}
                  >
                    ↓ Download All {selected.imageCount}
                  </button>
                </div>
              </div>

              {/* Group by style */}
              {[...new Set(selected.images.map(i => i.styleName))].map(style => {
                const styleImgs = selected.images.filter(i => i.styleName === style)
                return (
                  <div key={style} style={{marginBottom:32}}>
                    <div style={{fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'#C9A84C',marginBottom:12}}>{style}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
                      {styleImgs.map((img, i) => (
                        <div key={img.url} style={{position:'relative',cursor:'pointer'}} onClick={() => setLightbox(img.url)}>
                          <img
                            src={img.url}
                            className="img-card"
                            style={{width:'100%',aspectRatio:'1',objectFit:'cover',display:'block',border:'1px solid rgba(245,240,232,.06)'}}
                          />
                          <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,.7))',padding:'8px',display:'flex',justifyContent:'space-between',alignItems:'center',pointerEvents:'none'}}>
                            <span style={{fontSize:9,color:'rgba(245,240,232,.6)',letterSpacing:'.1em',textTransform:'uppercase'}}>{img.model}</span>
                            <button
                              onClick={e => { e.stopPropagation(); downloadImage(img.url, `${selected.petName}_${style.replace(/[^a-z0-9]/gi,'_')}_${i+1}.png`) }}
                              style={{background:'rgba(201,168,76,.9)',color:'#0A0A0A',border:'none',padding:'3px 8px',fontSize:10,cursor:'pointer',fontWeight:600,pointerEvents:'auto'}}
                            >↓</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
        >
          <img src={lightbox} style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain'}} />
          <div style={{position:'absolute',top:20,right:20,color:'rgba(245,240,232,.6)',fontSize:24}}>✕</div>
          <button
            onClick={e => { e.stopPropagation(); downloadImage(lightbox, 'portrait.png') }}
            style={{position:'absolute',bottom:30,background:'#C9A84C',color:'#0A0A0A',border:'none',padding:'12px 28px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer'}}
          >
            ↓ Download Full Res
          </button>
        </div>
      )}
    </div>
  )
}
