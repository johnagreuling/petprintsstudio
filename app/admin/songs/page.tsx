'use client'
import { useState, useEffect } from 'react'

interface SongSession {
  folder: string
  petName: string
  songTitle: string
  sunoPrompt: string
  songUrl?: string
  songReady: boolean
  createdAt: string
}

export default function SongAdminPage() {
  const [sessions, setSessions] = useState<SongSession[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [songUrls, setSongUrls] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)

  function auth() { if (password === 'mason2024') setAuthed(true) }

  useEffect(() => {
    if (!authed) return
    fetch('/api/gallery').then(r => r.json()).then(data => {
      setSessions((data.sessions || []).filter((s: any) => s.sunoPrompt))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [authed])

  async function updateSong(folder: string, title: string) {
    const url = songUrls[folder]
    if (!url) return alert('Paste the song URL first')
    setUpdating(folder)
    try {
      const res = await fetch('/api/admin/session-song', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': 'pps-admin-2024' },
        body: JSON.stringify({ sessionFolder: folder, songUrl: url, songTitle: title })
      })
      const data = await res.json()
      if (data.ok) {
        setSessions(s => s.map(sess => sess.folder === folder ? { ...sess, songUrl: url, songReady: true } : sess))
      } else { alert('Error: ' + data.error) }
    } finally { setUpdating(null) }
  }

  function copyPrompt(folder: string, prompt: string) {
    navigator.clipboard.writeText(prompt)
    setCopied(folder)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!authed) return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:'#141414',border:'1px solid rgba(245,240,232,.08)',padding:40,minWidth:320}}>
        <div style={{color:'#C9A84C',fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',marginBottom:16}}>Song Admin</div>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&auth()}
          style={{width:'100%',background:'#0A0A0A',border:'1px solid rgba(245,240,232,.1)',color:'#F5F0E8',padding:'12px 16px',fontSize:14,marginBottom:12,boxSizing:'border-box' as const}} />
        <button onClick={auth} style={{width:'100%',background:'#C9A84C',color:'#0A0A0A',border:'none',padding:'12px',fontWeight:700,cursor:'pointer',fontSize:12}}>ENTER</button>
      </div>
    </div>
  )

  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F5F0E8',fontFamily:"'DM Sans',sans-serif",padding:'40px 24px'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <div style={{marginBottom:40}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'#C9A84C',marginBottom:8}}>Pet Prints Studio</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:400,margin:0}}>Song Queue</h1>
          <p style={{color:'rgba(245,240,232,.4)',fontSize:14,marginTop:8}}>{sessions.filter(s=>!s.songReady).length} pending · {sessions.filter(s=>s.songReady).length} complete</p>
        </div>
        {loading && <div style={{color:'rgba(245,240,232,.4)'}}>Loading...</div>}
        {!loading && sessions.length === 0 && <div style={{background:'#141414',border:'1px solid rgba(245,240,232,.06)',padding:40,textAlign:'center' as const,color:'rgba(245,240,232,.4)'}}>No sessions with song prompts yet.</div>}
        <div style={{display:'flex',flexDirection:'column' as const,gap:16}}>
          {sessions.map(s => (
            <div key={s.folder} style={{background:'#141414',border:`1px solid ${s.songReady?'rgba(201,168,76,.3)':'rgba(245,240,232,.06)'}`,padding:28}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start' as const,marginBottom:16}}>
                <div>
                  <div style={{fontWeight:600,fontSize:17,marginBottom:4}}>{s.petName || 'Unknown'}</div>
                  <div style={{fontSize:13,color:'rgba(245,240,232,.5)',marginBottom:4}}>🎵 {s.songTitle || 'Song pending'}</div>
                  <div style={{fontSize:11,color:'rgba(245,240,232,.3)',fontFamily:'monospace'}}>{s.folder}</div>
                </div>
                <div style={{background:s.songReady?'rgba(201,168,76,.15)':'rgba(245,240,232,.06)',color:s.songReady?'#C9A84C':'rgba(245,240,232,.4)',padding:'4px 12px',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase' as const}}>
                  {s.songReady ? '✓ Done' : 'Pending'}
                </div>
              </div>
              {s.sunoPrompt && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,color:'rgba(245,240,232,.4)',marginBottom:8,letterSpacing:'.1em',textTransform:'uppercase' as const}}>Suno Prompt — Copy & paste into suno.com/create</div>
                  <div style={{background:'#0A0A0A',border:'1px solid rgba(245,240,232,.06)',padding:16,fontSize:13,lineHeight:1.7,color:'rgba(245,240,232,.7)',maxHeight:140,overflow:'auto'}}>{s.sunoPrompt}</div>
                  <button onClick={()=>copyPrompt(s.folder,s.sunoPrompt)} style={{marginTop:8,background:'transparent',border:'1px solid rgba(201,168,76,.3)',color:'#C9A84C',padding:'8px 16px',cursor:'pointer',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase' as const}}>
                    {copied===s.folder?'✓ Copied!':'📋 Copy Prompt'}
                  </button>
                </div>
              )}
              <div style={{display:'flex',gap:12,alignItems:'center' as const}}>
                <input placeholder="Paste Suno MP3 URL after generating..." value={songUrls[s.folder]||s.songUrl||''} onChange={e=>setSongUrls(p=>({...p,[s.folder]:e.target.value}))}
                  style={{flex:1,background:'#0A0A0A',border:'1px solid rgba(245,240,232,.1)',color:'#F5F0E8',padding:'10px 14px',fontSize:13}} />
                <button onClick={()=>updateSong(s.folder,s.songTitle)} disabled={updating===s.folder}
                  style={{background:'#C9A84C',color:'#0A0A0A',border:'none',padding:'10px 20px',fontWeight:700,cursor:'pointer',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase' as const,opacity:updating===s.folder?0.6:1}}>
                  {updating===s.folder?'Saving...':'Save Song'}
                </button>
              </div>
              {s.songReady&&s.songUrl&&<audio controls src={s.songUrl} style={{width:'100%',marginTop:12}} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
