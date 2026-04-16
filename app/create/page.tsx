'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import WatermarkedImage from '@/components/WatermarkedImage'
import SizeCropPreview from '@/components/SizeCropPreview'
import { PRODUCTS, PRODUCT_CATEGORIES, ART_STYLES, QUESTIONNAIRE, DIGITAL_BUNDLE_PRICE, MEMORY_UPGRADE_PRICE, DEFAULT_STYLES } from '@/lib/config'

type Step = 'upload' | 'product' | 'pay' | 'questionnaire' | 'generating' | 'gallery' | 'upsell'

export default function CreatePage() {
  const [step, setStep] = useState<Step>('upload')
  const [preview, setPreview] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showCrop, setShowCrop] = useState(false)
  const [cropOffset, setCropOffset] = useState({x:0, y:0})
  const [cropZoom, setCropZoom] = useState(1)
  const [primaryProduct, setPrimaryProduct] = useState<typeof PRODUCTS[0] | null>(null)
  const [primarySize, setPrimarySize] = useState('')
  const [isMemory, setIsMemory] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedStyles, setSelectedStyles] = useState<string[]>(DEFAULT_STYLES)
  const [showCustomStyle, setShowCustomStyle] = useState(false)
  const [customStyleDesc, setCustomStyleDesc] = useState('')
  const [customStylePrompt, setCustomStylePrompt] = useState('')
  const [customStyleActive, setCustomStyleActive] = useState(false)
  const [generatingCustomStyle, setGeneratingCustomStyle] = useState(false)
  const [generated, setGenerated] = useState<Array<{url:string;styleId:string;styleName:string;model:string}>>([])
  const [picked, setPicked] = useState<{url:string;styleId:string;styleName:string;model:string} | null>(null)
  const [lightboxImg, setLightboxImg] = useState<{url:string;styleName:string}|null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('Preparing your portraits...')
  const [error, setError] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Canvas')
  const [cartExtras, setCartExtras] = useState<string[]>([])
  const [wantBundle, setWantBundle] = useState(false)
  const [wantAllImages, setWantAllImages] = useState(false)
  const [wantSong, setWantSong] = useState(false)
  const [sessionFolder, setSessionFolder] = useState('')
  const [expandingStyle, setExpandingStyle] = useState<string|null>(null)
  const [expandProgress, setExpandProgress] = useState(0)
  const [savedSession, setSavedSession] = useState<{sessionFolder:string;images:any[];petName:string;createdAt:string}|null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pps_last_session')
      if (saved) {
        const data = JSON.parse(saved)
        const age = Date.now() - new Date(data.createdAt).getTime()
        if (age < 24 * 60 * 60 * 1000 && data.images?.length > 0) {
          setSavedSession(data)
          if (data.uploadedUrl) setUploadedUrl(data.uploadedUrl)
          if (data.sessionFolder) setSessionFolder(data.sessionFolder)
        }
      }
    } catch(e) {}
  }, [])
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cropRef = useRef<HTMLDivElement>(null)
  const [isDraggingCrop, setIsDraggingCrop] = useState(false)
  const [dragStart, setDragStart] = useState({x:0, y:0})

  const handleFile = (file: File) => {
    setError('')
    setImageLoaded(false)

    // Size check — clearer message with actual size
    const sizeMB = file.size / (1024 * 1024)
    if (file.size > 50 * 1024 * 1024) {
      setError(`Your photo is ${sizeMB.toFixed(1)}MB. Max is 50MB. Try saving a smaller version.`)
      setUploadedFile(null); setPreview('')
      return
    }

    // HEIC / HEIF detection — Safari can render but Chrome/Firefox cannot.
    // Rather than produce a silent broken preview, give clear guidance.
    const fileName = (file.name || '').toLowerCase()
    const isHeic = /\.(heic|heif)$/.test(fileName) || /heic|heif/.test(file.type)
    if (isHeic) {
      setError('HEIC/HEIF photos from iPhones aren\'t supported by all browsers. Fix: on iPhone, go to Settings → Camera → Formats → Most Compatible (uploads JPG instead). Or open the photo on your computer and save/export as JPG.')
      setUploadedFile(null); setPreview('')
      return
    }

    // General format check — only accept common web-renderable formats
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const validExt = /\.(jpe?g|png|webp|gif)$/i
    if (!validTypes.includes(file.type) && !validExt.test(fileName)) {
      setError(`File type "${file.type || 'unknown'}" isn't supported. Please use JPG, PNG, or WEBP.`)
      setUploadedFile(null); setPreview('')
      return
    }

    setUploadedFile(file)
    setCropOffset({x:0, y:0})
    setCropZoom(1)
    setShowCrop(false)
    const r = new FileReader()
    r.onload = e => setPreview(e.target?.result as string)
    r.onerror = () => {
      setError('Could not read the file. It may be corrupted or in an unsupported format.')
      setUploadedFile(null); setPreview('')
    }
    r.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (!f) return
    if (f.type && !f.type.startsWith('image/')) {
      setError(`You dropped a "${f.type}" file. Please drop an image (JPG, PNG, or WEBP).`)
      return
    }
    handleFile(f)
  }, [])

  const handleGenerateCustomStyle = async () => {
    if (!customStyleDesc.trim()) return
    setGeneratingCustomStyle(true)
    try {
      const res = await fetch('/api/creative-brief', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ petName: answers.petName||'pet', petType: answers.petBreed||'pet', customStyleRequest: customStyleDesc, generateStylePromptOnly: true })
      })
      if (res.ok) { const data = await res.json(); setCustomStylePrompt(data.custom_style_prompt||'') }
    } catch(e) { console.error('Custom style error:', e) }
    finally { setGeneratingCustomStyle(false) }
  }

  const handleGenerate = async () => {
    if (!uploadedFile || !primaryProduct) return
    setStep('generating'); setProgress(5); setProgressMsg('Uploading your photo...')
    try {
      // Step 1: Get presigned URL (tiny request — no file data sent to Vercel)
      const presignRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: uploadedFile.name, contentType: uploadedFile.type }),
      })
      if (!presignRes.ok) throw new Error('Upload failed')
      const { signedUrl, publicUrl: url } = await presignRes.json()

      // Step 2: Upload DIRECTLY to R2 — bypasses Vercel entirely, no size limit
      setProgressMsg('Uploading your photo...')
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: uploadedFile,
        headers: { 'Content-Type': uploadedFile.type },
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      setUploadedUrl(url); setProgress(20); setProgressMsg('Crafting your pet\'s story...')

      // Generate creative brief first — drives image prompt + song
      let brief: any = null
      try {
        const briefRes = await fetch('/api/creative-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petName: answers.petName || '',
            petType: answers.petBreed || 'pet',
            personality: answers.petPersonality || '',
            favoritePlace: [answers.favPlace, answers.favOutdoorSpot].filter(Boolean).join(', '),
            specialObjects: [answers.favToy, answers.favCar, answers.favFood].filter(Boolean).join(', '),
            specialPeople: answers.specialPeople || '',
            mood: answers.mood || '',
            musicStyle: answers.musicStyle || '',
            selectedStyleName: answers.artStyle || '',
            additionalNotes: answers.perfectDay || ''
          })
        })
        if (briefRes.ok) { brief = await briefRes.json(); setProgressMsg('Story ready — generating portraits...') }
      } catch(e) { console.warn('Brief generation skipped:', e) }
      setProgress(28)

      // Generate portraits
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          styles: selectedStyles,
          isMemory,
          answers,
          petName: answers.petName || '',
          petType: answers.petBreed || 'pet',
          brief: brief || null,
          imagePromptCore: brief?.image_prompt_core || null,
          customStyle: customStyleActive && customStylePrompt ? {id:'custom',name:'Custom Style',prompt:customStylePrompt,description:customStyleDesc} : null,
        }),
      })
      if (!genRes.ok) throw new Error('Generation failed')

      const reader = genRes.body?.getReader()
      const decoder = new TextDecoder()
      const imgs: Array<{url:string;styleId:string;styleName:string;model:string}> = []
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // Split on double-newline (SSE event boundary) to handle large base64 payloads
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.type === 'progress') { setProgress(d.value); setProgressMsg(d.message || 'Generating...') }
            if (d.type === 'image') { imgs.push(d.image); setGenerated([...imgs]) }
            if (d.type === 'done') {
              setGenerated(d.images); setProgress(100); setProgressMsg('Done!');
              if (d.sessionFolder) {
                setSessionFolder(d.sessionFolder)
                try {
                  const sessionData = {sessionFolder: d.sessionFolder, images: d.images, petName: answers.petName||'', createdAt: new Date().toISOString(), uploadedUrl}
                  localStorage.setItem('pps_last_session', JSON.stringify(sessionData))
                } catch(e) {}
              }
            }
            if (d.type === 'error') throw new Error(d.message)
          } catch {}
        }
      }
      // Flush remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const d = JSON.parse(buffer.trim().slice(6))
          if (d.type === 'done') { setGenerated(d.images); setProgress(100) }
        } catch {}
      }
      setStep('gallery')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStep('product')
    }
  }

  const handleCheckout = async () => {
    if (!picked || !primaryProduct) return
    setCheckoutLoading(true)
    try {
      const extras = PRODUCTS.filter(p => cartExtras.includes(p.id))
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: picked.url,
          primaryProduct,
          primarySize,
          extras,
          wantBundle,
          styleName: picked.styleName,
          petName: answers.petName || '',
          isMemory,
          sessionFolder,
        }),
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Checkout failed — please try again')
      setCheckoutLoading(false)
    }
  }

  // ── PRODUCT MOCKUP RENDERER ─────────────────────────────────
  const ProductMockup = ({ productId, category, size, previewUrl, isSelected }: {
    productId: string; category: string; size: string; previewUrl: string; isSelected: boolean
  }) => {
    const img = previewUrl
    const sel = isSelected
    if (category === 'Canvas') return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 20px 8px'}}>
          <div style={{position:'relative',width:'88%',height:'88%',filter:`drop-shadow(0 6px 20px rgba(0,0,0,.7))${sel?' drop-shadow(0 0 6px rgba(201,168,76,.35))':''}`}}>
            <div style={{position:'absolute',left:-12,top:7,width:12,height:'100%',background:img?`url(${img})`:'#1a0f00',backgroundSize:'cover',backgroundPosition:'left center',transform:'skewY(-45deg)',transformOrigin:'top right',filter:'brightness(0.35)',overflow:'hidden'}}/>
            <div style={{position:'absolute',bottom:-12,left:7,width:'100%',height:12,background:img?`url(${img})`:'#1a0f00',backgroundSize:'cover',backgroundPosition:'center bottom',transform:'skewX(-45deg)',transformOrigin:'top left',filter:'brightness(0.25)',overflow:'hidden'}}/>
            <div style={{width:'100%',height:'100%',backgroundImage:img?`url(${img})`:'none',backgroundColor:img?'transparent':'#2a1a0a',backgroundSize:'cover',backgroundPosition:'center',boxShadow:'inset 0 0 0 1px rgba(255,255,255,.06)'}}/>
            <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px),repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px)',pointerEvents:'none'}}/>
          </div>
        </div>
      </div>
    )
    if (category === 'Prints') return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'12px 16px 8px'}}>
          <div style={{position:'relative',width:'88%',height:'88%',background:'#f0ece4',boxShadow:`0 4px 24px rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)${sel?',0 0 0 2px rgba(201,168,76,.5)':''}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{position:'absolute',inset:10,border:'1px solid rgba(0,0,0,.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{position:'absolute',inset:4,backgroundImage:img?`url(${img})`:'none',backgroundColor:img?'transparent':'#8b6914',backgroundSize:'cover',backgroundPosition:'center'}}/>
            </div>
            <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,.01) 2px,rgba(0,0,0,.01) 4px)',pointerEvents:'none'}}/>
          </div>
        </div>
      </div>
    )
    if (productId.includes('mug')) return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'relative',width:80,height:70,filter:'drop-shadow(0 4px 12px rgba(0,0,0,.5))'}}>
            <div style={{width:74,height:64,background:'#fff',borderRadius:'3px 3px 7px 7px',overflow:'hidden',position:'relative',boxShadow:'inset 0 0 0 1px rgba(0,0,0,.08)'}}>
              <div style={{position:'absolute',inset:'10px 8px',backgroundImage:img?`url(${img})`:'none',backgroundSize:'cover',backgroundPosition:'center',borderRadius:2}}/>
            </div>
            <div style={{position:'absolute',right:-13,top:10,width:14,height:28,border:'3px solid #ccc',borderLeft:'none',borderRadius:'0 8px 8px 0'}}/>
          </div>
        </div>
      </div>
    )
    if (productId.includes('blanket')) return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'14px'}}>
          <div style={{width:'100%',height:'100%',position:'relative',borderRadius:4,overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,.5)',background:'#e8e0d4'}}>
            <div style={{position:'absolute',inset:'12px',backgroundImage:img?`url(${img})`:'none',backgroundSize:'cover',backgroundPosition:'center',borderRadius:3}}/>
            <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(255,255,255,.04) 8px,rgba(255,255,255,.04) 9px)',pointerEvents:'none'}}/>
          </div>
        </div>
      </div>
    )
    if (productId.includes('pillow')) return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'10px'}}>
          <div style={{width:'85%',height:'85%',position:'relative',borderRadius:'6px',boxShadow:'0 6px 20px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.06)',background:'#e0d8cc',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:'10px',backgroundImage:img?`url(${img})`:'none',backgroundSize:'cover',backgroundPosition:'center',borderRadius:4}}/>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.15) 100%)',pointerEvents:'none'}}/>
          </div>
        </div>
      </div>
    )
    if (productId.includes('tshirt') || productId.includes('hoodie')) return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'relative',width:'78%',height:'82%'}}>
            <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%',filter:'drop-shadow(0 4px 12px rgba(0,0,0,.5))'}}>
              <defs><clipPath id={`sc-${productId}`}><path d={productId.includes('hoodie')?"M28,8 L18,15 L10,28 L22,30 L22,90 L78,90 L78,30 L90,28 L82,15 L72,8 C68,12 55,15 50,15 C45,15 32,12 28,8 Z":"M30,5 L18,12 L10,28 L24,30 L24,92 L76,92 L76,30 L90,28 L82,12 L70,5 C66,10 55,13 50,13 C45,13 34,10 30,5 Z"}/></clipPath></defs>
              <path d={productId.includes('hoodie')?"M28,8 L18,15 L10,28 L22,30 L22,90 L78,90 L78,30 L90,28 L82,15 L72,8 C68,12 55,15 50,15 C45,15 32,12 28,8 Z":"M30,5 L18,12 L10,28 L24,30 L24,92 L76,92 L76,30 L90,28 L82,12 L70,5 C66,10 55,13 50,13 C45,13 34,10 30,5 Z"} fill="#1a1a1a" stroke="rgba(255,255,255,.08)" strokeWidth="0.5"/>
              {img&&<image href={img} x="30" y="30" width="40" height="38" clipPath={`url(#sc-${productId})`} preserveAspectRatio="xMidYMid slice"/>}
            </svg>
          </div>
        </div>
      </div>
    )
    if (productId.includes('tote')) return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'relative',width:'70%',height:'82%',filter:'drop-shadow(0 4px 14px rgba(0,0,0,.5))'}}>
            <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
              <defs><clipPath id={`tc-${productId}`}><rect x="10" y="22" width="80" height="80" rx="2"/></clipPath></defs>
              <path d="M32,22 Q28,4 38,4 Q48,4 50,10 Q52,4 62,4 Q72,4 68,22" fill="none" stroke="#c8b99a" strokeWidth="5" strokeLinecap="round"/>
              <rect x="10" y="22" width="80" height="80" rx="2" fill="#c8b99a"/>
              {img&&<image href={img} x="22" y="32" width="56" height="56" clipPath={`url(#tc-${productId})`} preserveAspectRatio="xMidYMid slice"/>}
            </svg>
          </div>
        </div>
      </div>
    )
    if (productId.includes('phone')) return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'relative',width:'45%',height:'88%',filter:'drop-shadow(0 4px 14px rgba(0,0,0,.5))'}}>
            <div style={{width:'100%',height:'100%',background:'#1a1a1a',borderRadius:16,border:'2px solid rgba(255,255,255,.08)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
              <div style={{width:'88%',height:'78%',backgroundImage:img?`url(${img})`:'none',backgroundSize:'cover',backgroundPosition:'center',borderRadius:8}}/>
              <div style={{position:'absolute',top:8,left:'50%',transform:'translateX(-50%)',width:18,height:5,background:'#0a0a0a',borderRadius:3}}/>
            </div>
          </div>
        </div>
      </div>
    )
    if (productId.includes('hat')) return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'relative',width:'80%',height:'70%',filter:'drop-shadow(0 4px 14px rgba(0,0,0,.5))'}}>
            <svg viewBox="0 0 120 80" style={{width:'100%',height:'100%'}}>
              <defs><clipPath id={`hc-${productId}`}><ellipse cx="60" cy="38" rx="46" ry="30"/></clipPath></defs>
              <ellipse cx="60" cy="62" rx="58" ry="10" fill="#1a1a1a"/>
              <ellipse cx="60" cy="38" rx="46" ry="30" fill="#1a1a1a" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
              {img&&<image href={img} x="42" y="24" width="36" height="28" clipPath={`url(#hc-${productId})`} preserveAspectRatio="xMidYMid slice" opacity="0.85"/>}
              <path d="M14,40 Q60,10 106,40" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="0.8"/>
            </svg>
          </div>
        </div>
      </div>
    )
    return <div style={{fontSize:32,textAlign:'center',padding:'20px 0 12px'}}>{category==='Home'?'🏠':category==='Apparel'?'👕':'✨'}</div>
  }

  const stepNum = {upload:1,product:2,pay:3,questionnaire:3,generating:4,gallery:4,upsell:5}[step]


  const handleExpandStyle = async (styleId: string, styleName: string) => {
    console.log('handleExpandStyle called:', { styleId, styleName, uploadedUrl, expandingStyle, sessionFolder })
    if (!uploadedUrl || expandingStyle) {
      console.log('Early return - uploadedUrl:', uploadedUrl, 'expandingStyle:', expandingStyle)
      return
    }
    setExpandingStyle(styleId)
    setExpandProgress(0)
    // Strip variant suffix (e.g., "ethereal_0" -> "ethereal") for API call
    const baseStyleId = styleId.replace(/_\d+$/, '')
    console.log('Calling API with baseStyleId:', baseStyleId)
    // Animate progress bar while waiting
    const ticker = setInterval(() => {
      setExpandProgress(p => p < 85 ? p + Math.random() * 8 : p)
    }, 800)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          targetStyleId: baseStyleId,
          variantCount: 2,
          petName: answers.petName || '',
          petType: answers.petBreed || 'pet',
          sessionId: sessionFolder,
          isMemory: false,
        })
      })
      console.log('API response status:', res.status)
      if (!res.ok) throw new Error('Failed')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const {done, value} = await reader.read()
        if (done) break
        buffer += decoder.decode(value, {stream:true})
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          try {
            const d = JSON.parse(line.slice(5))
            console.log('Received SSE data:', d.type, d)
            if (d.type === 'image') {
              // Ensure the new image has the correct styleId so it groups properly
              setGenerated(prev => [...prev, {...d.image, styleId, styleName}])
              setExpandProgress(p => Math.min(p + 30, 95))
            }
          } catch(e) { console.error('Parse error:', e) }
        }
      }
      setExpandProgress(100)
    } catch(e) { console.error('Expand style error:', e) }
    finally {
      clearInterval(ticker)
      setTimeout(() => { setExpandingStyle(null); setExpandProgress(0) }, 600)
    }
  }

  return (
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--soft:#141414;--mid:#1E1E1E;--border:rgba(245,240,232,.08);--muted:rgba(245,240,232,.45);--rust:#C4622D}
        .serif{font-family:'Cormorant Garamond',serif}
        .btn-gold{background:var(--gold);color:var(--ink);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:12px;padding:18px 40px;border:none;cursor:pointer;transition:all .3s;width:100%}
        .btn-gold:hover{background:var(--cream)}.btn-gold:disabled{opacity:.35;cursor:not-allowed}
        .btn-out{border:1px solid rgba(245,240,232,.15);color:var(--muted);background:none;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:14px 24px;cursor:pointer;transition:all .3s;width:100%}
        .btn-out:hover{border-color:var(--gold);color:var(--gold)}
        .input{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;transition:border-color .3s}
        .input:focus{border-color:var(--gold)}
        .input::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        .select{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;cursor:pointer}
        .textarea{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;height:120px;resize:none;transition:border-color .3s}
        .textarea:focus{border-color:var(--gold)}
        .textarea::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        .drop{border:2px dashed rgba(245,240,232,.12);padding:60px 40px;text-align:center;cursor:pointer;transition:all .3s}
        .drop.over{border-color:var(--gold);background:rgba(201,168,76,.03)}
        .product-card{background:#141414;border:1px solid rgba(245,240,232,.08);padding:20px;cursor:pointer;transition:all .2s;position:relative}
        .product-card:hover,.product-card.on{border-color:var(--gold)}
        .cat-tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);font-size:10px;letter-spacing:.18em;text-transform:uppercase;padding:10px 0;cursor:pointer;transition:all .2s;margin-right:28px;font-family:'DM Sans',sans-serif}
        .cat-tab.on{color:var(--gold);border-color:var(--gold)}
        .style-toggle{border:1px solid rgba(245,240,232,.08);background:transparent;padding:0;cursor:pointer;transition:all .2s;text-align:left;position:relative;overflow:hidden}
        .style-toggle.on{border-color:var(--gold);background:rgba(201,168,76,.04)}
        .img-card{aspect-ratio:1;object-fit:cover;width:100%;cursor:pointer;transition:all .3s;border:2px solid transparent;display:block}
        .img-card:hover{transform:scale(1.02)}.img-card.picked{border-color:var(--gold);box-shadow:0 0 0 4px rgba(201,168,76,.15)}
        .progress-bar{height:3px;background:rgba(245,240,232,.06);border-radius:999px;overflow:hidden}
        .progress-fill{height:100%;background:var(--gold);transition:width .6s ease;border-radius:999px}
        .upsell-card{background:#141414;border:1px solid rgba(245,240,232,.08);padding:20px;cursor:pointer;transition:all .2s;position:relative;display:flex;gap:16;align-items:center}
        .upsell-card.on,.upsell-card:hover{border-color:var(--gold)}
        .step-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;display:inline-block}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}.pulse{animation:pulse 1.8s ease infinite}
        @keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite;display:inline-block}
        @keyframes fadeInScale{0%{opacity:0;transform:scale(.92) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes ping{0%{opacity:.6;transform:scale(1)}75%,100%{opacity:0;transform:scale(1.5)}}
        @keyframes fadeInUp{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}

        /* Mobile polish — iPhone-first */
        @media(max-width:640px){
          nav{padding:14px 16px !important;gap:8px !important}
          nav > div:first-child > span{font-size:16px !important}
          nav > div:nth-child(2){display:none !important}  /* hide stepper on phone */
          nav > div:last-child{font-size:10px !important}

          main{padding:24px 16px 60px !important}
          h1{font-size:clamp(26px,7vw,36px) !important;line-height:1.15 !important}

          /* Upload drop zone on phone — bigger touch target, less padding */
          .drop{padding:40px 20px !important;min-height:260px !important}
          .drop > div > div:first-child{font-size:40px !important}  /* paw emoji */

          /* Buttons full width, larger touch */
          .btn-gold{padding:16px 24px !important;font-size:12px !important;width:100% !important}
          .btn-out{padding:14px 20px !important;font-size:10px !important}

          /* Product / style grids: 2-up on phone */
          [style*="gridTemplateColumns:'repeat(4"],
          [style*="gridTemplateColumns: 'repeat(4"]{grid-template-columns:1fr 1fr !important;gap:10px !important}
          [style*="gridTemplateColumns:'repeat(3"],
          [style*="gridTemplateColumns: 'repeat(3"]{grid-template-columns:1fr 1fr !important;gap:10px !important}

          /* Portrait gallery on the reveal page — 2 per row on phone */
          .img-card{aspect-ratio:3/4 !important}

          /* Inputs larger touch target */
          .input,.select{font-size:16px !important;padding:14px 16px !important}  /* 16px prevents iOS zoom */

          /* Pet name + breed side-by-side → stacked on phone */
          [style*="gridTemplateColumns:'1fr 1fr'"][style*="gap:16"]{grid-template-columns:1fr !important;gap:12px !important}

          /* Category tabs — scroll horizontally rather than wrap */
          .cat-tab{margin-right:16px !important;font-size:10px !important}

          /* Modal / overlays use full screen on phone */
          [style*="position:'fixed'"][style*="inset:0"] > div{max-width:95vw !important;max-height:95vh !important}

          /* Reduce hero section padding */
          section[style*="padding:'140px 24px 80px'"]{padding:100px 16px 60px !important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{padding:'18px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(245,240,232,.06)',position:'sticky',top:0,background:'#0A0A0A',zIndex:100}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'inherit'}}>
          <span>🐾</span>
          <span className="serif" style={{fontSize:20}}>Pet Prints Studio</span>
        </Link>
        {/* Step indicator */}
        <div style={{display:'flex',alignItems:'center',gap:0}}>
          {['Upload','Choose Size','Generate','Gallery','Checkout'].map((label,i)=>(
            <div key={label} style={{display:'flex',alignItems:'center'}}>
              <div style={{fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:i+1===stepNum?'var(--cream)':i+1<stepNum?'var(--gold)':'var(--muted)',display:'flex',alignItems:'center',gap:6,fontWeight:i+1===stepNum?600:400}}>
                <span className="step-dot" style={{color:i+1===stepNum?'var(--cream)':i+1<stepNum?'var(--gold)':'rgba(245,240,232,.2)'}}/>
                {label}
              </div>
              {i<4&&<div style={{width:24,height:1,background:'rgba(245,240,232,.1)',margin:'0 6px'}}/>}
            </div>
          ))}
        </div>
        <div style={{width:140}}/>
      </nav>

      <div style={{maxWidth:860,margin:'0 auto',padding:'56px 24px 80px'}}>

        {/* ── RESUME SESSION BANNER ── */}
        {step==='upload' && savedSession && (
          <div style={{background:'linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.03))',border:'1px solid rgba(201,168,76,.5)',padding:'20px 28px',marginBottom:4,display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{fontSize:36}}>🎨</div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontSize:9,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:4}}>Previous Session Found</div>
              <div className="serif" style={{fontSize:17,color:'var(--cream)',marginBottom:4}}>
                {savedSession.petName ? `${savedSession.petName}’s portraits` : 'Your portraits'} &mdash; {savedSession.images.length} images ready
              </div>
              <div style={{fontSize:11,color:'var(--muted)'}}>Generated {new Date(savedSession.createdAt).toLocaleDateString()} at {new Date(savedSession.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-gold" style={{fontSize:11,padding:'11px 20px'}}
                onClick={()=>{ setGenerated(savedSession.images); setSessionFolder(savedSession.sessionFolder); setStep('gallery') }}>
                ← View My Portraits
              </button>
              <button className="btn-out" style={{fontSize:11,padding:'11px 20px'}}
                onClick={()=>{ try{localStorage.removeItem('pps_last_session')}catch(e){} setSavedSession(null) }}>
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: UPLOAD ── */}
        {step==='upload'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 1 of 5</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:400,marginBottom:12}}>Upload Your Pet&rsquo;s Photo</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8}}>Clear, well-lit photos work best. Front-facing gives the most accurate results.</p>
            </div>

            {/* Crop Modal */}
            {showCrop && preview && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.95)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
                <div style={{marginBottom:20,textAlign:'center'}}>
                  <h3 className="serif" style={{fontSize:24,marginBottom:8}}>Adjust Your Photo</h3>
                  <p style={{color:'var(--muted)',fontSize:13}}>Drag to reposition · Zoom to adjust</p>
                </div>
                <div 
                  ref={cropRef}
                  style={{width:320,height:320,overflow:'hidden',borderRadius:8,border:'2px solid var(--gold)',position:'relative',cursor:'grab',background:'#000'}}
                  onMouseDown={e=>{e.preventDefault();setIsDraggingCrop(true);setDragStart({x:e.clientX-cropOffset.x, y:e.clientY-cropOffset.y})}}
                  onMouseMove={e=>{if(isDraggingCrop){setCropOffset({x:e.clientX-dragStart.x, y:e.clientY-dragStart.y})}}}
                  onMouseUp={()=>setIsDraggingCrop(false)}
                  onMouseLeave={()=>setIsDraggingCrop(false)}
                  onTouchStart={e=>{const t=e.touches[0];setIsDraggingCrop(true);setDragStart({x:t.clientX-cropOffset.x, y:t.clientY-cropOffset.y})}}
                  onTouchMove={e=>{if(isDraggingCrop){const t=e.touches[0];setCropOffset({x:t.clientX-dragStart.x, y:t.clientY-dragStart.y})}}}
                  onTouchEnd={()=>setIsDraggingCrop(false)}
                >
                  <img 
                    src={preview} 
                    alt="Crop preview" 
                    draggable={false}
                    style={{
                      position:'absolute',
                      left:'50%',
                      top:'50%',
                      transform:`translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropZoom})`,
                      minWidth:'100%',
                      minHeight:'100%',
                      objectFit:'cover',
                      pointerEvents:'none',
                      userSelect:'none'
                    }}
                  />
                </div>
                <div style={{marginTop:20,display:'flex',alignItems:'center',gap:16}}>
                  <span style={{fontSize:12,color:'var(--muted)'}}>Zoom</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1" 
                    value={cropZoom} 
                    onChange={e=>setCropZoom(parseFloat(e.target.value))}
                    style={{width:150,accentColor:'var(--gold)'}}
                  />
                </div>
                <div style={{marginTop:24,display:'flex',gap:16}}>
                  <button onClick={()=>{setCropOffset({x:0,y:0});setCropZoom(1)}} className="btn-out">Reset</button>
                  <button onClick={()=>setShowCrop(false)} className="btn-gold">Done</button>
                </div>
              </div>
            )}

            <div className={`drop${isDragging?' over':''}`} onDrop={handleDrop} onDragOver={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)} onClick={()=>!preview&&fileRef.current?.click()}>
              {preview?(
                <div onClick={e=>e.stopPropagation()}>
                  <div style={{position:'relative',display:'inline-block'}}>
                    <img
                      src={preview}
                      alt="Pet preview"
                      style={{maxHeight:360,maxWidth:'100%',objectFit:'contain',display:'block',margin:'0 auto'}}
                      onLoad={() => { setImageLoaded(true); setError('') }}
                      onError={() => {
                        setImageLoaded(false)
                        setError('Your browser couldn\'t render this photo. This usually means the file is HEIC/HEIF (iPhone format), corrupted, or an unsupported format. Try JPG or PNG.')
                        setPreview('')
                        setUploadedFile(null)
                      }}
                    />
                  </div>
                  {imageLoaded ? (
                    <div style={{marginTop:16,fontSize:13,color:'var(--gold)'}}>✓ Looking great!</div>
                  ) : (
                    <div style={{marginTop:16,fontSize:13,color:'var(--muted)'}}>Loading preview…</div>
                  )}
                  <div style={{marginTop:12,display:'flex',gap:12,justifyContent:'center'}}>
                    <button onClick={()=>setShowCrop(true)} disabled={!imageLoaded} style={{background:'none',border:'1px solid var(--gold)',color:'var(--gold)',cursor:imageLoaded?'pointer':'not-allowed',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',padding:'8px 16px',borderRadius:4,opacity:imageLoaded?1:.4}}>✂️ Crop / Adjust</button>
                    <button onClick={()=>{setUploadedFile(null);setPreview('');setCropOffset({x:0,y:0});setCropZoom(1);setImageLoaded(false);setError('')}} style={{background:'none',border:'1px solid var(--border)',color:'var(--muted)',cursor:'pointer',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',padding:'8px 16px',borderRadius:4}}>Change Photo</button>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{fontSize:52,marginBottom:20}}>🐾</div>
                  <div style={{fontSize:18,marginBottom:8,fontWeight:500}}>Drop your photo here</div>
                  <div style={{color:'var(--muted)',fontSize:13,marginBottom:20}}>or click to browse · JPG, PNG, WEBP · Max 50MB</div>
                  <div style={{color:'var(--muted)',fontSize:11,marginBottom:20,opacity:.7}}>iPhone users: set Camera → Formats → Most Compatible for best results</div>
                  <div style={{display:'inline-block',border:'1px solid var(--gold)',color:'var(--gold)',padding:'10px 28px',fontSize:11,letterSpacing:'.15em',textTransform:'uppercase'}}>Browse Files</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:24}}>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Pet&rsquo;s Name <span style={{opacity:.5}}>(optional)</span></label>
                <input className="input" placeholder="Rocky, Luna, Biscuit..." value={answers.petName||''} onChange={e=>setAnswers(a=>({...a,petName:e.target.value}))}/>
              </div>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Type of Pet</label>
                <select className="select" value={answers.petBreed||'dog'} onChange={e=>setAnswers(a=>({...a,petBreed:e.target.value}))}>
                  {['Dog','Cat','Rabbit','Bird','Horse','Hamster','Guinea Pig','Reptile','Fish','Other'].map(t=><option key={t} value={t.toLowerCase()}>{t}</option>)}
                </select>
              </div>
            </div>

            {error&&(
              <div style={{color:'#ff9160',fontSize:14,marginTop:20,padding:'16px 20px',background:'rgba(196,98,45,.12)',border:'1px solid rgba(196,98,45,.4)',borderLeft:'4px solid #C4622D',borderRadius:4,lineHeight:1.6,display:'flex',alignItems:'flex-start',gap:12}}>
                <span style={{fontSize:18,lineHeight:1}}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div style={{marginTop:32}}>
              <button className="btn-gold" disabled={!uploadedFile || !imageLoaded} onClick={()=>setStep('product')}>Choose Your Canvas Size →</button>
            </div>
            <div style={{marginTop:16,display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
              {['✓ No account needed','✓ 32 AI portraits generated','✓ Free to preview','✓ Prints shipped in 5–7 days'].map(t=>(
                <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: PRODUCT SELECTION (Paywall) ── */}
        {step==='product'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 2 of 5</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:400,marginBottom:12}}>Choose Your Product</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8}}>What are we putting this on? Pick your primary product — you can add more after you see your portraits.</p>
            </div>

            {/* Pet photo preview */}
            {preview&&(
              <div style={{display:'flex',gap:20,alignItems:'center',padding:'20px',background:'#141414',marginBottom:32,border:'1px solid rgba(201,168,76,.15)'}}>
                <img src={preview} alt="Your pet" style={{width:72,height:72,objectFit:'cover',borderRadius:2}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>Your pet{answers.petName?` — ${answers.petName}`:''}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:4}}>32 AI portraits will be generated from this photo</div>
                </div>
              </div>
            )}

            {/* Category tabs — prints only */}
            <div style={{borderBottom:'1px solid rgba(245,240,232,.06)',marginBottom:28}}>
              {['Canvas','Prints'].map(c=>(
                <button key={c} className={`cat-tab${activeCategory===c?' on':''}`} onClick={()=>setActiveCategory(c)}>{c}</button>
              ))}
            </div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:16,opacity:.7}}>🎁 Mugs, blankets, apparel &amp; more available after you see your portraits</div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))',gap:2,marginBottom:32}}>
              {PRODUCTS.filter(p=>['Canvas','Prints'].includes(p.category)&&p.category===activeCategory).map(p=>(
                <div key={p.id} className={`product-card${primaryProduct?.id===p.id?' on':''}`} onClick={()=>{setPrimaryProduct(p);setPrimarySize('')}} style={{padding:0,overflow:'hidden'}}>
                  {p.popular&&<div style={{position:'absolute',top:8,right:8,background:'var(--gold)',color:'var(--ink)',fontSize:7,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',padding:'3px 7px',zIndex:2}}>Popular</div>}
                  {primaryProduct?.id===p.id&&<div style={{position:'absolute',top:8,left:8,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,zIndex:2}}>✓</div>}
                  {/* Product mockup */}
                  <ProductMockup productId={p.id} category={p.category} size={p.size} previewUrl={preview} isSelected={primaryProduct?.id===p.id} />
                  <div style={{padding:'0 14px 16px'}}>
                    <div className="serif" style={{fontSize:15,marginBottom:3,fontWeight:400}}>{p.name}</div>
                    <div style={{fontSize:11,color:'var(--muted)',marginBottom:2}}>{p.size}</div>
                    <div style={{fontSize:10,color:'var(--muted)',opacity:.6,marginBottom:10}}>{p.description}</div>
                    <div className="serif" style={{fontSize:20,color:'var(--gold)'}}>${p.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Size selector for apparel */}
            {primaryProduct&&'sizes' in primaryProduct&&(primaryProduct as any).sizes&&(
              <div style={{marginBottom:28}}>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:12}}>Select Size</label>
                <div style={{display:'flex',gap:8}}>
                  {((primaryProduct as any).sizes as string[]).map((s:string)=>(
                    <button key={s} onClick={()=>setPrimarySize(s)} style={{padding:'10px 20px',border:`1px solid ${primarySize===s?'var(--gold)':'rgba(245,240,232,.12)'}`,background:primarySize===s?'rgba(201,168,76,.08)':'none',color:primarySize===s?'var(--gold)':'var(--muted)',cursor:'pointer',fontSize:13,transition:'all .2s'}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Memory Portrait upgrade */}
            <div style={{marginBottom:28}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:12}}>Portrait Type</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2}}>
                <div onClick={()=>setIsMemory(false)} style={{background:'#141414',border:`1px solid ${!isMemory?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'20px',cursor:'pointer',transition:'all .2s'}}>
                  <div style={{fontSize:20,marginBottom:8}}>🎨</div>
                  <div className="serif" style={{fontSize:17,marginBottom:4,fontWeight:400}}>Style Transfer</div>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>Your photo reimagined in all 32 custom-built artistic styles. Ready in ~7 minutes.</div>
                  <div style={{fontSize:12,color:'var(--gold)',marginTop:8,fontWeight:600}}>Included</div>
                </div>
                <div onClick={()=>setIsMemory(true)} style={{background:'#141414',border:`1px solid ${isMemory?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'20px',cursor:'pointer',transition:'all .2s',position:'relative'}}>
                  <div style={{position:'absolute',top:10,right:10,background:'var(--gold)',color:'var(--ink)',fontSize:7,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',padding:'3px 7px'}}>Premium</div>
                  <div style={{fontSize:20,marginBottom:8}}>✨</div>
                  <div className="serif" style={{fontSize:17,marginBottom:4,fontWeight:400}}>Memory Portrait</div>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>Custom scene built from your pet&rsquo;s life — team, car, hometown, toys. Human-reviewed.</div>
                  <div style={{fontSize:12,color:'var(--gold)',marginTop:8,fontWeight:600}}>+${MEMORY_UPGRADE_PRICE.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            {primaryProduct&&(
              <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.15)',padding:'20px 24px',marginBottom:24}}>
                <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Order Summary</div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:14}}>{primaryProduct.name} {primaryProduct.size}{primarySize?` — ${primarySize}`:''}</span>
                  <span style={{fontSize:14,color:'var(--gold)'}}>${primaryProduct.price}</span>
                </div>
                {isMemory&&(
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:14}}>Memory Portrait upgrade</span>
                    <span style={{fontSize:14,color:'var(--gold)'}}>+${MEMORY_UPGRADE_PRICE.toFixed(2)}</span>
                  </div>
                )}
                <div style={{borderTop:'1px solid rgba(245,240,232,.08)',paddingTop:12,marginTop:4,display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:15,fontWeight:600}}>Total</span>
                  <span className="serif" style={{fontSize:20,color:'var(--gold)'}}>${(primaryProduct.price+(isMemory?MEMORY_UPGRADE_PRICE:0)).toFixed(2)}</span>
                </div>
              </div>
            )}

            {error&&<div style={{color:'#C4622D',fontSize:13,marginBottom:16,padding:'12px 16px',background:'rgba(196,98,45,.08)',border:'1px solid rgba(196,98,45,.15)'}}>{error}</div>}

            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:2}}>
              <button className="btn-out" onClick={()=>setStep('upload')}>← Back</button>
              <button className="btn-gold"
                disabled={!primaryProduct||('sizes' in (primaryProduct||{})&&!(primaryProduct as any).sizes?.includes(primarySize)&&(primaryProduct as any).sizes?.length>0)}
                onClick={()=>isMemory?setStep('questionnaire'):handleGenerate()}>
                {isMemory?'Continue to Questionnaire →':`Pay & Generate My Portraits — $${(primaryProduct?.price||0)+(isMemory?MEMORY_UPGRADE_PRICE:0)}`}
              </button>
            </div>
            <div style={{marginTop:16,display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
              {['🔒 Secure Stripe checkout','🚀 Ships in 5–7 days','↩️ Satisfaction guaranteed'].map(t=>(
                <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: QUESTIONNAIRE (Memory only) ── */}
        {step==='questionnaire'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Memory Portrait</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:400,marginBottom:12}}>Tell Us About {answers.petName||'Your Pet'}</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8,maxWidth:540,margin:'0 auto'}}>Every answer becomes a visual easter egg in their portrait. Required fields first, then all the fun details.</p>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:24}}>
              {QUESTIONNAIRE.filter(q=>q.type!=='style-picker').map(q=>(
                <div key={q.id}>
                  <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:q.required?'var(--cream)':'var(--muted)',display:'block',marginBottom:8}}>
                    {q.label} {q.required&&<span style={{color:'var(--gold)'}}>*</span>}
                  </label>
                  {q.type==='text'&&<input className="input" placeholder={q.placeholder} value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}/>}
                  {q.type==='textarea'&&<textarea className="textarea" placeholder={q.placeholder} value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} style={{height:140}}/>}
                  {q.type==='select'&&(
                    <select className="select" value={answers[q.id]||''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}>
                      <option value="">Select...</option>
                      {q.options?.map((o:string)=><option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}

              {/* Style picker */}
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--cream)',display:'block',marginBottom:12}}>Preferred Style <span style={{color:'var(--gold)'}}>*</span></label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
                  {ART_STYLES.map(s=>(
                    <button key={s.id} className={`style-toggle${selectedStyles.includes(s.id)?' on':''}`} onClick={()=>setSelectedStyles(prev=>prev.includes(s.id)?prev.filter(x=>x!==s.id):[...prev,s.id])}>
                      <div style={{position:'absolute',top:8,right:8,width:16,height:16,border:`1px solid ${selectedStyles.includes(s.id)?'var(--gold)':'rgba(245,240,232,.2)'}`,borderRadius:'50%',background:selectedStyles.includes(s.id)?'var(--gold)':'none',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'var(--ink)',fontWeight:700}}>
                        {selectedStyles.includes(s.id)&&'✓'}
                      </div>
                      <div style={{width:'100%',aspectRatio:'2/3',overflow:'hidden',borderRadius:3,marginBottom:8}}>{s.styleImage?<img src={s.styleImage} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>:<div style={{width:'100%',height:'100%',background:(s as any).styleBg||'#1a1a1a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}><div style={{fontSize:28}}>{s.emoji}</div><div style={{fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:(s as any).styleAccent||'rgba(255,255,255,.4)',textAlign:'center',padding:'0 8px'}}>{s.name}</div></div>}</div>
                      <div className="serif" style={{fontSize:12,fontWeight:400,padding:'6px 8px 8px',textAlign:'center'}}>{s.name}</div>
                    </button>
                  ))}
                </div>

                {/* 13TH CARD — CUSTOM STYLE — full width centered */}
                <div style={{marginTop:4,background:'linear-gradient(135deg,rgba(201,168,76,.09),rgba(201,168,76,.02))',border:'2px solid rgba(201,168,76,.4)',padding:'28px 36px',display:'flex',gap:28,alignItems:'center',flexWrap:'wrap'}}>
                  <div style={{fontSize:48,lineHeight:1,flexShrink:0}}>✨</div>
                  <div style={{flex:1,minWidth:220}}>
                    <div style={{fontSize:9,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:6}}>Infinite Customization · The 13th Option</div>
                    <div className="serif" style={{fontSize:20,fontWeight:400,marginBottom:6,color:'var(--cream)'}}>Create Your Own Style</div>
                    <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>Describe any style you can imagine — Japanese woodblock, dark gothic, Renaissance gold leaf — and we'll generate 3 portraits just for them.</div>
                  </div>
                  <button className="btn-gold" style={{flexShrink:0,fontSize:10,padding:'11px 22px',whiteSpace:'nowrap'}} onClick={()=>setShowCustomStyle(s=>!s)}>
                    {showCustomStyle?'▲ Close':'✨ Design Your Style'}
                  </button>
                </div>
                {showCustomStyle&&(
                  <div style={{background:'#0D0D0D',border:'1px solid rgba(201,168,76,.25)',borderTop:'none',padding:'20px 28px'}}>
                    <textarea className="textarea" rows={3} placeholder="e.g. 'Japanese ukiyo-e woodblock with bold outlines' or 'Dark gothic fantasy with candlelight'" value={customStyleDesc} onChange={e=>setCustomStyleDesc(e.target.value)} style={{marginBottom:10,width:'100%'}}/>
                    {customStylePrompt&&(<div style={{background:'#0A0A0A',border:'1px solid rgba(201,168,76,.2)',padding:'10px 14px',marginBottom:10,fontSize:11,color:'rgba(245,240,232,.55)',lineHeight:1.8}}><div style={{fontSize:9,color:'var(--gold)',letterSpacing:'.15em',textTransform:'uppercase',marginBottom:4}}>Generated Style Prompt</div>{customStylePrompt}</div>)}
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      <button className="btn-out" style={{fontSize:11,padding:'9px 18px'}} disabled={!customStyleDesc.trim()||generatingCustomStyle} onClick={handleGenerateCustomStyle}>{generatingCustomStyle?'✨ Generating...':'✨ Generate Style Prompt'}</button>
                      {customStylePrompt&&(<button style={{fontSize:11,padding:'9px 18px',background:customStyleActive?'var(--gold)':'transparent',color:customStyleActive?'var(--ink)':'var(--gold)',border:'1px solid rgba(201,168,76,.5)',cursor:'pointer'}} onClick={()=>setCustomStyleActive(s=>!s)}>{customStyleActive?'✓ Added — Click to Remove':'+ Add to My Order (3 extra portraits)'}</button>)}
                    </div>
                    {customStyleActive&&<div style={{fontSize:11,color:'var(--gold)',marginTop:8}}>✓ 3 additional portraits will be generated in your custom style</div>}
                  </div>
                )}
              </div>
            </div>

            <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.15)',padding:'20px 24px',marginTop:32,marginBottom:24}}>
              <div style={{fontSize:13,lineHeight:1.8,color:'var(--muted)'}}>
                <strong style={{color:'var(--cream)'}}>What happens next:</strong> After you pay, our team reviews your answers and refines the prompt before anything generates. This usually takes 15–30 minutes. You&rsquo;ll get an email when your portraits are ready.
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:2}}>
              <button className="btn-out" onClick={()=>setStep('product')}>← Back</button>
              <button className="btn-gold"
                disabled={!answers.petName||!answers.petBreed||!answers.petPersonality||!answers.petFeature}
                onClick={handleGenerate}>
                Pay & Submit — ${((primaryProduct?.price||0)+MEMORY_UPGRADE_PRICE).toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: GENERATING ── */}
        {step==='generating'&&(
          <div style={{textAlign:'center',padding:'60px 0',position:'relative'}}>
            {/* Concentric pulsing rings — more premium than a single emoji */}
            <div style={{position:'relative',width:140,height:140,margin:'0 auto 28px'}}>
              <div style={{position:'absolute',inset:-30,borderRadius:'50%',border:'1px solid rgba(201,168,76,.12)',animation:'ping 2.4s ease-out infinite'}}/>
              <div style={{position:'absolute',inset:-14,borderRadius:'50%',border:'1px solid rgba(201,168,76,.22)',animation:'ping 2.4s ease-out .3s infinite'}}/>
              <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,.18),transparent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:56}} className="pulse">🎨</div>
            </div>
            <h2 className="serif" style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:400,marginBottom:16}}>
              Creating {answers.petName?`${answers.petName}'s`:''} Portraits
            </h2>
            <p style={{color:'var(--gold)',fontSize:14,marginBottom:8,letterSpacing:'.04em',fontStyle:'italic',minHeight:22,transition:'opacity .4s'}} key={progressMsg}>
              {progressMsg}
            </p>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:48,lineHeight:1.8}}>
              Takes about 4–5 minutes · keep this tab open
            </p>
            <div style={{maxWidth:440,margin:'0 auto 40px'}}>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                <span style={{fontSize:11,color:'var(--muted)'}}>{progress}% complete</span>
                <span style={{fontSize:11,color:'var(--gold)'}}>{generated.length} of 32 ready</span>
              </div>
            </div>
            {generated.length>0&&(
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,maxWidth:480,margin:'0 auto'}}>
                  {generated.map((img,i)=>(
                    <div key={img.url} style={{animation:`fadeInScale .6s ease-out ${Math.min(i,12)*40}ms both`}}>
                      <WatermarkedImage src={img.url} alt={img.styleName} width={200} height={300} displayRatio="2/3" style={{opacity:.95}}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: GALLERY — pick your favorite ── */}
        {step==='gallery'&&(
          <div style={{paddingBottom:140}}>
            <div style={{textAlign:'center',marginBottom:56,animation:'fadeInUp .6s ease-out both'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 4 of 5</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:400,marginBottom:14,letterSpacing:'-.01em'}}>
                {picked ? <>This is the <em style={{color:'var(--gold)'}}>one</em>.</> : <>Find the <em style={{color:'var(--gold)'}}>one</em>.</>}
              </h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8,maxWidth:520,margin:'0 auto'}}>
                {picked
                  ? `You chose ${picked.styleName}. Ready when you are.`
                  : `${generated.length} portraits ready — tap the one that feels most like them.`
                }
              </p>
            </div>

            {(()=>{
              // Group images by styleName, showing all images regardless of model
              const groups: Record<string, typeof generated> = {}
              generated.forEach(img => {
                const key = img.styleName || img.styleId
                if (!groups[key]) groups[key] = []
                groups[key].push(img)
              })
              let globalIdx = 0
              return Object.entries(groups).map(([name, imgs], groupIdx) => {
                const style = ART_STYLES.find(s => s.id === imgs[0]?.styleId)
                const emoji = style?.emoji || '🎨'
                return (
                  <div key={name} style={{marginBottom:56,animation:`fadeInUp .6s ease-out ${Math.min(groupIdx,10)*60}ms both`}}>
                    <div style={{fontSize:10,letterSpacing:'.24em',textTransform:'uppercase',color:'var(--gold)',marginBottom:18,display:'flex',alignItems:'center',gap:14}}>
                      <span style={{fontSize:16,filter:'grayscale(.2)'}}>{emoji}</span>
                      <span style={{fontWeight:600}}>{name}</span>
                      <span style={{flex:1,height:1,background:'linear-gradient(to right,rgba(201,168,76,.25),rgba(245,240,232,.04))'}}/>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                      {imgs.map((img,i)=>{
                        const isPicked = picked?.url===img.url
                        const delay = Math.min(globalIdx++, 14) * 40
                        return (
                          <div
                            key={i}
                            style={{
                              position:'relative',
                              cursor:'pointer',
                              animation:`fadeInScale .55s cubic-bezier(.2,.8,.2,1) ${delay}ms both`,
                              transform: isPicked ? 'scale(1.01)' : undefined,
                              transition:'transform .3s',
                              zIndex: isPicked ? 2 : 1,
                            }}
                            onClick={()=>setLightboxImg({url:img.url,styleName:img.styleName})}
                          >
                            <WatermarkedImage src={img.url} alt={`${name} ${i+1}`} width={400} height={600} displayRatio="2/3" className={`img-card${isPicked?' picked':''}`}/>
                            {isPicked && (
                              <>
                                <div style={{position:'absolute',top:10,right:10,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,pointerEvents:'none',boxShadow:'0 4px 16px rgba(201,168,76,.4)'}}>✓</div>
                                <div style={{position:'absolute',top:12,left:12,background:'rgba(10,10,10,.85)',color:'var(--gold)',padding:'6px 10px',fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',fontWeight:700,pointerEvents:'none',backdropFilter:'blur(4px)'}}>The One</div>
                              </>
                            )}
                            {/* Quick-select button (doesn't open lightbox) */}
                            <button
                              onClick={(e)=>{e.stopPropagation();setPicked(img)}}
                              style={{position:'absolute',bottom:10,right:10,background:isPicked?'var(--gold)':'rgba(0,0,0,.7)',border:'none',color:isPicked?'var(--ink)':'#fff',padding:'7px 14px',borderRadius:3,cursor:'pointer',fontSize:10,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',opacity:0.92,transition:'all .2s',backdropFilter:'blur(4px)'}}
                              title="Select this portrait"
                            >{isPicked?'✓ Selected':'Select'}</button>
                          </div>
                        )
                      })}
                    </div>
                    {/* Get more variations button + progress */}
                    {expandingStyle === imgs[0]?.styleId ? (
                      <div style={{marginTop:12}}>
                        <div style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>
                          ⟳ Generating 2 more variations...
                        </div>
                        <div style={{height:3,background:'rgba(245,240,232,.08)',borderRadius:2,overflow:'hidden'}}>
                          <div style={{
                            height:'100%',
                            width:`${expandProgress}%`,
                            background:'var(--gold)',
                            borderRadius:2,
                            transition:'width 0.4s ease'
                          }}/>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={()=>handleExpandStyle(imgs[0]?.styleId, name)}
                        disabled={!!expandingStyle}
                        style={{marginTop:14,background:'transparent',border:'1px solid rgba(201,168,76,.3)',color:'var(--gold)',padding:'9px 22px',fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',cursor:expandingStyle?'default':'pointer',opacity:expandingStyle?0.4:1,display:'flex',alignItems:'center',gap:8,transition:'all .2s'}}
                      >
                        + Get 2 More Variations
                      </button>
                    )}
                  </div>        )
              })
            })()}

            <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:picked?'linear-gradient(to top,rgba(201,168,76,.08),rgba(10,10,10,.96))':'rgba(10,10,10,.96)',padding:'18px 24px',borderTop:picked?'1px solid rgba(201,168,76,.35)':'1px solid rgba(245,240,232,.08)',backdropFilter:'blur(16px)',transition:'all .4s ease'}}>
              {picked&&(
                <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:14,animation:'fadeInUp .4s ease-out both'}}>
                  {picked && primaryProduct ? <SizeCropPreview imageUrl={picked.url} sizeKey={primaryProduct.size?.replace(/['"]/g,'').replace(/ /,'')||'8x10'} displayWidth={56} /> : picked ? <img src={picked.url} alt="Selected" style={{width:56,height:56,objectFit:'cover',boxShadow:'0 2px 12px rgba(0,0,0,.5)'}}/> : null}
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:3,fontWeight:600}}>You picked</div>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{picked.styleName}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>Printing on {primaryProduct?.name} {primaryProduct?.size}</div>
                  </div>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:8}}>
                <button className="btn-out" style={{padding:'14px'}} onClick={()=>{ setGenerated([]); setPicked(null); setStep('product') }}>← Regenerate</button>
                <button className="btn-gold" disabled={!picked} onClick={()=>setStep('upsell')}>{picked ? 'Make It Real →' : 'Pick Your Favorite'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: UPSELL ── */}
        {step==='upsell'&&picked&&(
          <div>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 5 of 5</div>
              <h1 className="serif" style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:400,marginBottom:12}}>Make It A Complete Package</h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8,maxWidth:520,margin:'0 auto'}}>Your portrait is gallery-ready. Add digital files, a custom song, and more products — all with the same portrait.</p>
            </div>

            {/* Selected portrait + print confirmation */}
            <div style={{display:'flex',gap:20,alignItems:'center',padding:'20px',background:'#141414',border:'1px solid rgba(201,168,76,.2)',marginBottom:8}}>
              <img src={picked.url} alt="Your portrait" style={{width:88,height:88,objectFit:'cover'}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:'var(--gold)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Your Portrait</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:2}}>{picked.styleName}</div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Printing on: {primaryProduct?.name} {primaryProduct?.size}</div>
              </div>
              <div className="serif" style={{fontSize:22,color:'var(--gold)'}}>${primaryProduct?.price}</div>
            </div>
            {isMemory&&(
              <div style={{padding:'10px 20px',background:'rgba(201,168,76,.06)',border:'1px solid rgba(201,168,76,.15)',borderTop:'none',marginBottom:36,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:12,color:'var(--muted)'}}>✨ Memory Portrait upgrade</span>
                <span style={{fontSize:12,color:'var(--gold)'}}>+${MEMORY_UPGRADE_PRICE.toFixed(2)}</span>
              </div>
            )}
            {!isMemory&&<div style={{marginBottom:36}}/>}

            {/* ── DIGITAL ADD-ONS SECTION ── */}
            <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>⚡ Digital Add-Ons — Instant Delivery, Zero Shipping</div>

            {/* All 32 portraits */}
            <div onClick={()=>setWantAllImages(b=>!b)} style={{background:'#141414',border:`1px solid ${wantAllImages?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'24px',marginBottom:3,cursor:'pointer',transition:'all .2s',position:'relative'}}>
              {wantAllImages&&<div style={{position:'absolute',top:16,right:16,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>✓</div>}
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                <div style={{fontSize:36}}>🖼️</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <div className="serif" style={{fontSize:20,fontWeight:400}}>All 32 Portrait Files</div>
                    <div style={{background:'rgba(201,168,76,.15)',color:'var(--gold)',fontSize:9,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',padding:'3px 8px'}}>Best Value</div>
                  </div>
                  <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>Every portrait in full resolution — all styles, all variants. Print anywhere, share with family, use as wallpaper. Yours forever.</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div className="serif" style={{fontSize:24,color:'var(--gold)'}}>$29.99</div>
                  <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>36 hi-res files</div>
                </div>
              </div>
            </div>

            {/* Pet Song */}
            <div onClick={()=>setWantSong(b=>!b)} style={{background:'#141414',border:`1px solid ${wantSong?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'24px',marginBottom:3,cursor:'pointer',transition:'all .2s',position:'relative'}}>
              {wantSong&&<div style={{position:'absolute',top:16,right:16,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>✓</div>}
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                <div style={{fontSize:36}}>🎵</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                    <div className="serif" style={{fontSize:20,fontWeight:400}}>Custom Pet Song</div>
                    <div style={{background:'rgba(139,92,246,.2)',color:'#A78BFA',fontSize:9,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',padding:'3px 8px'}}>New</div>
                  </div>
                  <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>A one-of-a-kind song written and composed for your pet — using the same memory details from your portrait. Delivered as an MP3. The ultimate keepsake.</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div className="serif" style={{fontSize:24,color:'var(--gold)'}}>$19</div>
                  <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>Custom MP3</div>
                </div>
              </div>
            </div>

            {/* Digital Bundle (select prints) */}
            <div onClick={()=>setWantBundle(b=>!b)} style={{background:'#141414',border:`1px solid ${wantBundle?'var(--gold)':'rgba(245,240,232,.08)'}`,padding:'24px',marginBottom:36,cursor:'pointer',transition:'all .2s',position:'relative'}}>
              {wantBundle&&<div style={{position:'absolute',top:16,right:16,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>✓</div>}
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                <div style={{fontSize:36}}>💾</div>
                <div style={{flex:1}}>
                  <div className="serif" style={{fontSize:20,fontWeight:400,marginBottom:6}}>Your Favorite Portrait — Digital File</div>
                  <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>High-resolution file of your selected portrait. Perfect for digital frames, phone wallpaper, or printing yourself.</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div className="serif" style={{fontSize:24,color:'var(--gold)'}}>${DIGITAL_BUNDLE_PRICE}</div>
                  <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>Instant download</div>
                </div>
              </div>
            </div>

            {/* ── PHYSICAL PRODUCTS SECTION ── */}
            <div style={{fontSize:10,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>📦 More Products — Same Portrait, Shipped to You</div>
            {['Home','Apparel','Accessories'].map(cat=>{
              const items = PRODUCTS.filter(p=>p.category===cat&&p.id!==primaryProduct?.id)
              if(!items.length) return null
              return (
                <div key={cat} style={{marginBottom:28}}>
                  <div style={{fontSize:9,letterSpacing:'.25em',textTransform:'uppercase',color:'rgba(245,240,232,.35)',marginBottom:12}}>{cat}</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:2}}>
                    {items.map(p=>{
                      const isOn = cartExtras.includes(p.id)
                      return (
                        <div key={p.id} className={`product-card${isOn?' on':''}`} onClick={()=>setCartExtras(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])} style={{padding:0,overflow:'hidden'}}>
                          {isOn&&<div style={{position:'absolute',top:8,left:8,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,zIndex:2}}>✓</div>}
                          <ProductMockup productId={p.id} category={p.category} size={p.size} previewUrl={preview} isSelected={isOn} />
                          <div style={{padding:'0 12px 14px'}}>
                            <div className="serif" style={{fontSize:14,marginBottom:2,fontWeight:400}}>{p.name}</div>
                            <div style={{fontSize:10,color:'var(--muted)',marginBottom:8}}>{p.size}</div>
                            <div className="serif" style={{fontSize:18,color:'var(--gold)'}}>${p.price}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Final total */}
            <div style={{background:'#141414',border:'1px solid rgba(201,168,76,.2)',padding:'24px',marginBottom:24,marginTop:16}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16}}>Order Total</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:14}}>{primaryProduct?.name} {primaryProduct?.size}</span>
                <span style={{fontSize:14}}>${primaryProduct?.price}</span>
              </div>
              {isMemory&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>✨ Memory Portrait upgrade</span><span style={{fontSize:14}}>${MEMORY_UPGRADE_PRICE.toFixed(2)}</span></div>}
              {wantAllImages&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>🖼️ All 32 Portrait Files</span><span style={{fontSize:14}}>$29.99</span></div>}
              {wantSong&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>🎵 Custom Pet Song</span><span style={{fontSize:14}}>$19.00</span></div>}
              {wantBundle&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>💾 Portrait Digital File</span><span style={{fontSize:14}}>${DIGITAL_BUNDLE_PRICE}</span></div>}
              {cartExtras.map(id=>{const p=PRODUCTS.find(x=>x.id===id)!;return <div key={id} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:14}}>{p.emoji} {p.name} {p.size}</span><span style={{fontSize:14}}>${p.price}</span></div>})}
              <div style={{borderTop:'1px solid rgba(245,240,232,.08)',paddingTop:16,marginTop:8,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:15,fontWeight:600}}>Total</span>
                <span className="serif" style={{fontSize:24,color:'var(--gold)'}}>
                  ${((primaryProduct?.price||0)+(isMemory?MEMORY_UPGRADE_PRICE:0)+(wantBundle?DIGITAL_BUNDLE_PRICE:0)+(wantAllImages?29.99:0)+(wantSong?19:0)+cartExtras.reduce((sum,id)=>sum+(PRODUCTS.find(p=>p.id===id)?.price||0),0)).toFixed(2)}
                </span>
              </div>
            </div>

            {error&&<div style={{color:'#C4622D',fontSize:13,marginBottom:16,padding:'12px 16px',background:'rgba(196,98,45,.08)'}}>{error}</div>}

            <button className="btn-gold" onClick={handleCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? '⏳ Redirecting to Stripe...' : 'Proceed to Secure Checkout →'}
            </button>
            <div style={{marginTop:16,display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
              {['🔒 Stripe secure checkout','📦 Ships in 5–7 days','✓ Satisfaction guarantee'].map(t=>(
                <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── FULLSCREEN LIGHTBOX ── */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 20
          }}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,.1)',
              border: 'none',
              color: '#fff',
              width: 44,
              height: 44,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >✕</button>
          
          {/* Style name */}
          <div style={{
            position: 'absolute',
            top: 24,
            left: 24,
            color: 'var(--gold)',
            fontSize: 12,
            letterSpacing: '.2em',
            textTransform: 'uppercase'
          }}>{lightboxImg.styleName}</div>
          
          {/* Full resolution image with small corner watermark */}
          <img 
            src={lightboxImg.url} 
            alt={lightboxImg.styleName}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              cursor: 'default',
              boxShadow: '0 20px 60px rgba(0,0,0,.5)'
            }}
          />
          
          {/* Watermark overlay */}
          <div style={{
            position: 'absolute',
            bottom: 'calc(7.5vh + 20px)',
            right: 'calc(5vw + 16px)',
            background: 'rgba(0,0,0,.6)',
            color: 'var(--gold)',
            fontSize: 11,
            padding: '6px 12px',
            borderRadius: 4,
            pointerEvents: 'none'
          }}>© petprintsstudio.com</div>
          
          {/* Select button */}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              const img = generated.find(g => g.url === lightboxImg.url)
              if (img) setPicked(img)
              setLightboxImg(null)
            }}
            style={{
              marginTop: 20,
              background: 'var(--gold)',
              color: 'var(--ink)',
              border: 'none',
              padding: '14px 36px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >Select This Portrait</button>
          
          <div style={{marginTop:12,fontSize:11,color:'rgba(255,255,255,.4)'}}>Click anywhere to close</div>
        </div>
      )}
    </div>
  )
}
