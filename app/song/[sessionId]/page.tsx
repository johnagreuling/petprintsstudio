'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import { useParams } from 'next/navigation'
import posthog from 'posthog-js'

interface SessionData {
  petName: string
  petType: string
  petDescription: string
  images: Array<{url: string; styleName: string; styleId: string}>
  songUrl?: string
  songTitle?: string
  createdAt: string
  styles: string[]
  imageCount: number
}

export default function SongPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeImg, setActiveImg] = useState(0)
  const [error, setError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/session/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setSession(data)
        setLoading(false)
      })
      .catch(() => { setError('Session not found'); setLoading(false) })
  }, [sessionId])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const onEnd = () => setPlaying(false)
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', onEnd)
    }
  }, [session])

  useEffect(() => {
    if (!session?.images?.length) return
    const interval = setInterval(() => setActiveImg(i => (i + 1) % Math.min(session.images.length, 9)), 3000)
    return () => clearInterval(interval)
  }, [session])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !session?.songUrl) return
    if (playing) { audio.pause(); setPlaying(false) }
    else {
      posthog.capture('song_played', { session_id: sessionId, pet_name: session?.petName || '', song_title: session?.songTitle || '' })
      audio.play(); setPlaying(true)
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const petLabel = session?.petName || 'Your Pet'
  const firstImg = session?.images?.[0]?.url || ''

  if (loading) return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:40,height:40,border:'3px solid rgba(201,168,76,.2)',borderTopColor:'#C9A84C',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <><SiteNav /><div style={{background:'#0A0A0A',minHeight:'calc(100vh - 74px)',display:'flex',alignItems:'center',justifyContent:'center',color:'#F5F0E8',fontFamily:"'DM Sans',sans-serif",textAlign:'center',padding:'114px 40px 40px'}}>
      <div>
        <div style={{fontSize:64,marginBottom:24}}>🐾</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,marginBottom:16}}>Session not found</div>
        <p style={{color:'rgba(245,240,232,.4)',marginBottom:32}}>This link may have expired or is invalid.</p>
        <Link href="/create" style={{background:'#C9A84C',color:'#0A0A0A',padding:'14px 32px',textDecoration:'none',fontWeight:700,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase'}}>Create Your Own</Link>
      </div>
    </div></>
  )

  return (
    <><SiteNav /><div style={{background:'#0A0A0A',minHeight:'calc(100vh - 74px)',color:'#F5F0E8',fontFamily:"'DM Sans',sans-serif",paddingTop:74}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .8s ease forwards}
        .portrait-grid img{transition:all .4s ease;cursor:pointer}
        .portrait-grid img:hover{transform:scale(1.03)}
        .product-card:hover{border-color:rgba(201,168,76,.4)!important;transform:translateY(-2px)}
        .product-card{transition:all .2s}
      `}</style>

      <div style={{position:'relative',minHeight:'calc(100vh - 74px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center'}}>
        {firstImg && (
          <div style={{position:'absolute',inset:0,overflow:'hidden',zIndex:0}}>
            <img src={firstImg} style={{width:'100%',height:'100%',objectFit:'cover',filter:'blur(40px)',opacity:.15,transform:'scale(1.1)'}} />
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(10,10,10,.7),rgba(10,10,10,.95))'}}/>
          </div>
        )}
        <div style={{position:'relative',zIndex:1,maxWidth:600,width:'100%'}} className="fade-in">
          <div style={{width:200,height:300,margin:'0 auto 32px',borderRadius:4,overflow:'hidden',border:'2px solid rgba(201,168,76,.3)',boxShadow:'0 20px 60px rgba(0,0,0,.6)'}}>
            {session?.images?.[activeImg] ? (
              <img src={session.images[activeImg].url} style={{width:'100%',height:'100%',objectFit:'cover',transition:'opacity .5s'}} />
            ) : (
              <div style={{width:'100%',height:'100%',background:'#141414',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>🐾</div>
            )}
          </div>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'#C9A84C',marginBottom:8}}>Pet Prints Studio</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,6vw,56px)',fontWeight:400,marginBottom:8,lineHeight:1.1}}>
            {petLabel}{session?.songTitle ? <><br/><em style={{color:'#C9A84C',fontSize:'0.7em'}}>{session.songTitle}</em></> : null}
          </h1>
          <p style={{color:'rgba(245,240,232,.5)',fontSize:14,marginBottom:40}}>{session?.petDescription?.slice(0,100)}</p>
          {session?.songUrl ? (
            <div style={{background:'rgba(20,20,20,.9)',border:'1px solid rgba(201,168,76,.2)',padding:'24px 32px',marginBottom:32,backdropFilter:'blur(10px)'}}>
              <audio ref={audioRef} src={session.songUrl} preload="metadata"/>
              <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:16}}>
                <button onClick={togglePlay} style={{width:56,height:56,borderRadius:'50%',background:'#C9A84C',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {playing ? '⏸' : '▶'}
                </button>
                <div style={{flex:1,textAlign:'left'}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{session.songTitle || `${petLabel}'s Song`}</div>
                  <div style={{fontSize:11,color:'rgba(245,240,232,.4)'}}>Custom AI-generated portrait song</div>
                </div>
                <div style={{fontSize:12,color:'rgba(245,240,232,.4)'}}>{formatTime(currentTime)} / {formatTime(duration||0)}</div>
              </div>
              <div onClick={e => { if (!audioRef.current||!duration) return; const r=e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime=((e.clientX-r.left)/r.width)*duration }} style={{height:4,background:'rgba(245,240,232,.1)',borderRadius:2,cursor:'pointer'}}>
                <div style={{height:'100%',background:'#C9A84C',borderRadius:2,width:`${duration?(currentTime/duration)*100:0}%`,transition:'width .1s'}}/>
              </div>
            </div>
          ) : (
            <div style={{background:'rgba(20,20,20,.6)',border:'1px solid rgba(245,240,232,.06)',padding:'20px 32px',marginBottom:32,color:'rgba(245,240,232,.4)',fontSize:14}}>
              🎵 Song is being composed — check back soon
            </div>
          )}
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/create" style={{background:'#C9A84C',color:'#0A0A0A',padding:'16px 32px',textDecoration:'none',fontWeight:700,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase',display:'inline-block'}}>🐾 Create Yours</Link>
            <button onClick={()=>navigator.share?.({title:`${petLabel}'s Portrait`,url:location.href}).catch(()=>{})||navigator.clipboard?.writeText(location.href)} style={{background:'transparent',color:'#F5F0E8',padding:'16px 32px',border:'1px solid rgba(245,240,232,.2)',cursor:'pointer',fontWeight:500,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase'}}>Share</button>
          </div>
        </div>
      </div>

      {session?.images && session.images.length > 1 && (
        <div style={{padding:'60px 24px',maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'#C9A84C',marginBottom:12}}>Gallery</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,4vw,48px)',fontWeight:400}}>{petLabel}&apos;s Portraits</h2>
          </div>
          <div className="portrait-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
            {session.images.slice(0,9).map((img,i) => (
              <div key={img.url} style={{position:'relative',overflow:'hidden'}}>
                <img src={img.url} style={{width:'100%',aspectRatio:'2/3',objectFit:'cover',display:'block'}} onClick={()=>setActiveImg(i)} />
                <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,.7))',padding:'8px',fontSize:9,color:'rgba(245,240,232,.6)',letterSpacing:'.1em',textTransform:'uppercase'}}>{img.styleName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{background:'#0D0D0D',borderTop:'1px solid rgba(245,240,232,.06)',padding:'60px 24px'}}>
        <div style={{maxWidth:960,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'#C9A84C',marginBottom:12}}>Want one for your pet?</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,4vw,48px)',fontWeight:400,marginBottom:16}}>Your Pet. <em style={{color:'#C9A84C'}}>Gallery Worthy.</em></h2>
          <p style={{color:'rgba(245,240,232,.5)',fontSize:15,lineHeight:1.8,maxWidth:500,margin:'0 auto 40px'}}>Upload a photo. Get 32 stunning AI portraits across 32 custom-built artistic styles. Choose your favorite — we print and ship it to your door.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:40}}>
            {[{icon:'🖼️',title:'Fine Art Canvas',desc:'Gallery-wrapped, ready to hang',price:'From $79'},{icon:'📄',title:'Fine Art Print',desc:'Archival matte, museum quality',price:'From $39'},{icon:'🎵',title:'Custom Pet Song',desc:'AI-composed just for your pet',price:'$19'},{icon:'📱',title:'Digital Bundle',desc:'32 full-res portraits, no watermark',price:'$29'}].map(p=>(
              <div key={p.title} className="product-card" style={{background:'#141414',border:'1px solid rgba(245,240,232,.06)',padding:'24px',textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>{p.icon}</div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:6}}>{p.title}</div>
                <div style={{fontSize:12,color:'rgba(245,240,232,.4)',marginBottom:12,lineHeight:1.6}}>{p.desc}</div>
                <div style={{color:'#C9A84C',fontWeight:700}}>{p.price}</div>
              </div>
            ))}
          </div>
          <Link href="/create" style={{background:'#C9A84C',color:'#0A0A0A',padding:'18px 48px',textDecoration:'none',fontWeight:700,fontSize:12,letterSpacing:'.14em',textTransform:'uppercase',display:'inline-block'}}>🐾 Create Your Portrait</Link>
        </div>
      </div>

      <div style={{textAlign:'center',padding:'24px',color:'rgba(245,240,232,.2)',fontSize:11,letterSpacing:'.1em'}}>© PET PRINTS STUDIO · petprintsstudio.com</div>
    </div></>
  )
}
