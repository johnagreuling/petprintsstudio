'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import WatermarkedImage from '@/components/WatermarkedImage'
import SizeCropPreview from '@/components/SizeCropPreview'
import SiteNav from '@/components/SiteNav'
import CreateSteps from '@/components/CreateSteps'
import {
  PRODUCTS, ART_STYLES, SONG_QUESTIONS, SONG_GENRES, GEN_LIMITS,
  findPrimaryProduct, buildLineId, cartSubtotal, cartItemCount,
} from '@/lib/config'
import type { CartItem } from '@/lib/config'
import { useCart } from '@/lib/cart-context'

type Step = 'upload' | 'styles' | 'generating' | 'gallery' | 'checkout'

// Normalized style shape used by the picker — loaded from /api/admin/styles
// with fallback to hardcoded ART_STYLES from config if the API fails
type PickerStyle = {
  id: string
  name: string
  emoji: string
  description?: string
  styleImage?: string
  category?: string
  styleBg?: string
  styleAccent?: string
}

// Display labels for the 5 category filters (keys match category slugs from the API)
const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  classic_portraits:   { label: 'Classic Portraits',   emoji: '🏛️' },
  painterly_fine_art:  { label: 'Painterly Fine Art',  emoji: '🎨' },
  golden_hour_nature:  { label: 'Golden Hour & Nature', emoji: '🌅' },
  lifestyle_story:     { label: 'Lifestyle & Story',   emoji: '📖' },
  pop_modern:          { label: 'Pop & Modern',        emoji: '⚡' },
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>('upload')

  // ── Upload state ──
  const [preview, setPreview] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showCrop, setShowCrop] = useState(false)
  const [cropOffset, setCropOffset] = useState({x:0, y:0})
  const [cropZoom, setCropZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isDraggingCrop, setIsDraggingCrop] = useState(false)
  const [dragStart, setDragStart] = useState({x:0, y:0})

  // ── Pet info (captured on upload step) ──
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // ── Style selection (NEW) ──
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [dynamicStyles, setDynamicStyles] = useState<PickerStyle[]>([])
  const [stylesLoading, setStylesLoading] = useState(true)
  const [activeStyleCategory, setActiveStyleCategory] = useState<string>('all')

  // ── Generation state ──
  const [generated, setGenerated] = useState<Array<{url:string;styleId:string;styleName:string;model:string}>>([])
  const [picked, setPicked] = useState<{url:string;styleId:string;styleName:string;model:string} | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('Preparing your portraits...')
  const [error, setError] = useState('')
  const [sessionFolder, setSessionFolder] = useState('')
  const [expandingStyle, setExpandingStyle] = useState<string|null>(null)
  const [expandProgress, setExpandProgress] = useState(0)
  const [showStylePicker, setShowStylePicker] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<{url:string;styleName:string}|null>(null)

  // ── Checkout state (NEW) ──
  const [selectedMedium, setSelectedMedium] = useState<'Canvas' | 'Prints'>('Canvas')
  const [skipPrimary, setSkipPrimary] = useState(false)
  const [selectedSize, setSelectedSize] = useState('16×20"')
  const [songAnswers, setSongAnswers] = useState<Record<string, string>>({})
  const [songGenre, setSongGenre] = useState<string>('')

  // ── Feel items ──
  const [cartExtras, setCartExtras] = useState<string[]>([])
  const [cartExtraSizes, setCartExtraSizes] = useState<Record<string, string>>({})
  const [cartExtraColors, setCartExtraColors] = useState<Record<string, string>>({})
  const [cartExtraQty, setCartExtraQty] = useState<Record<string, number>>({})
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { items: cart, addItem, clearCart: clearGlobalCart, setOrderMeta, clearOrderMeta } = useCart()
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [productDetail, setProductDetail] = useState<typeof PRODUCTS[0] | null>(null)
  const [savedSession, setSavedSession] = useState<{sessionFolder:string;images:any[];petName:string;createdAt:string}|null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const cropRef = useRef<HTMLDivElement>(null)

  // [C4f] Mirror creation-step state into cart orderMeta so /cart can forward
  // songGenre, petName, petType, sessionFolder, songAnswers to /api/checkout.
  useEffect(() => {
    setOrderMeta({
      songGenre,
      petName: answers.petName || '',
      petType: answers.petBreed || '',
      sessionFolder,
      songAnswers,
    })
  }, [songGenre, answers.petName, answers.petBreed, sessionFolder, songAnswers, setOrderMeta])

  // ── Resume previous session ──
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

  // ── Load the live style catalog ──
  // Uses the EXACT SAME resolution logic as /styles page so curated images
  // appear in both places: (1) /api/admin/styles for base list,
  // (2) /api/admin/curate-picks for your hand-picked best,
  // (3) /api/admin/sessions for pet-matched fallback,
  // (4) sampleImageUrl as last resort, (5) ART_STYLES config as final fallback.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [stylesRes, picksRes] = await Promise.all([
          fetch('/api/admin/styles'),
          fetch('/api/admin/curate-picks'),
        ])
        if (!stylesRes.ok) throw new Error(`styles api ${stylesRes.status}`)
        const stylesData = await stylesRes.json()
        const picksData = picksRes.ok ? await picksRes.json() : { picks: {} }
        const picks: Record<string, any> = picksData.picks || {}

        // Load sessions for old-format picks (pet name → find matching session image)
        let sessions: Record<string, any> = {}
        try {
          const sessionsRes = await fetch('/api/admin/sessions?limit=30')
          if (sessionsRes.ok) {
            const sessionsData = await sessionsRes.json()
            for (const s of sessionsData.sessions || []) {
              const pet = (s.pet_name || '').toLowerCase()
              if (pet.includes('mason')) sessions.mason = s
              else if (pet.includes('sylas')) sessions.sylas = s
              else if (pet.includes('sasha')) sessions.sasha = s
            }
          }
        } catch {}

        if (cancelled) return

        const normalized: PickerStyle[] = (stylesData.styles || []).map((s: any) => {
          const pickVal = picks[s.id]
          let showcaseUrl: string | null = null
          // New format: { pet, url }
          if (pickVal && typeof pickVal === 'object' && pickVal.url) {
            showcaseUrl = pickVal.url
          }
          // Old format: just pet name — look up URL from their session
          else if (typeof pickVal === 'string') {
            if (sessions[pickVal]) {
              const match = sessions[pickVal].images?.find(
                (img: any) => img.style_id.replace(/_\d+$/, '') === s.id
              )
              showcaseUrl = match?.url || null
            }
          }
          // Last resort: the canonical sampleImageUrl
          if (!showcaseUrl) showcaseUrl = s.sampleImageUrl

          return {
            id: s.id,
            name: s.name,
            emoji: s.emoji || '🎨',
            description: s.description,
            styleImage: showcaseUrl || undefined,
            category: s.category,
          }
        })

        if (normalized.length > 0) {
          setDynamicStyles(normalized)
        } else {
          setDynamicStyles(ART_STYLES.map(s => ({
            id: s.id, name: s.name, emoji: s.emoji,
            description: s.description, styleImage: s.styleImage,
            styleBg: (s as any).styleBg, styleAccent: (s as any).styleAccent,
          })))
        }
      } catch (e) {
        console.warn('Failed to load dynamic styles, using config fallback:', e)
        if (cancelled) return
        setDynamicStyles(ART_STYLES.map(s => ({
          id: s.id, name: s.name, emoji: s.emoji,
          description: s.description, styleImage: s.styleImage,
          styleBg: (s as any).styleBg, styleAccent: (s as any).styleAccent,
        })))
      } finally {
        if (!cancelled) setStylesLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Derived state: counts per style + total ──
  const imageCountByStyle = useMemo(() => {
    const counts: Record<string, number> = {}
    generated.forEach(img => {
      const key = img.styleName || img.styleId
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [generated])

  const totalGenerated = generated.length
  const atMaxTotal = totalGenerated >= GEN_LIMITS.MAX_TOTAL

  const canAddMoreToStyle = (styleName: string) => {
    const count = imageCountByStyle[styleName] || 0
    return count < GEN_LIMITS.MAX_PER_STYLE && !atMaxTotal
  }

  // ── Primary product (derived from medium + size) ──
  const primaryProduct = findPrimaryProduct(selectedMedium, selectedSize)

  // ── Sizes available for selected medium ──
  const availableSizes = PRODUCTS.filter(p => p.category === selectedMedium).map(p => ({ size: p.size, price: p.price, popular: p.popular }))

  // [C4e] Legacy auto-sync cart effect removed. All cart adds are now explicit via addItem().
  // The old effect pushed primary canvas/print into local cart whenever picked changed.

  // ── File handlers ──
  const handleFile = (file: File) => {
    setError('')
    setImageLoaded(false)
    const sizeMB = file.size / (1024 * 1024)
    if (file.size > 50 * 1024 * 1024) {
      setError(`Your photo is ${sizeMB.toFixed(1)}MB. Max is 50MB. Try saving a smaller version.`)
      setUploadedFile(null); setPreview('')
      return
    }
    const fileName = (file.name || '').toLowerCase()
    const isHeic = /\.(heic|heif)$/.test(fileName) || /heic|heif/.test(file.type)
    if (isHeic) {
      setError('HEIC/HEIF photos from iPhones aren\'t supported by all browsers. Fix: on iPhone, go to Settings → Camera → Formats → Most Compatible (uploads JPG instead). Or open the photo on your computer and save/export as JPG.')
      setUploadedFile(null); setPreview('')
      return
    }
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


  // Commit the current crop to a new File + preview, so the backend receives the cropped image.
  // Renders what's visible inside the 320x320 crop frame to a canvas, then replaces uploadedFile.
  const commitCrop = async () => {
    if (!preview || !uploadedFile) { setShowCrop(false); return }
    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('img load failed'))
        img.src = preview
      })
      // The preview <img> in the modal uses maxWidth:100% maxHeight:100% inside a 320x320 container,
      // meaning it's displayed at a "fit" size. Compute that fit size.
      const FRAME = 320
      const fitScale = Math.min(FRAME / img.naturalWidth, FRAME / img.naturalHeight)
      const fitW = img.naturalWidth * fitScale
      const fitH = img.naturalHeight * fitScale
      // The transform is: translate(-50% + offsetX, -50% + offsetY) scale(zoom), origin center.
      // So in frame coordinates, the image's visible region is centered at (FRAME/2 + offsetX, FRAME/2 + offsetY)
      // and has size (fitW * zoom) x (fitH * zoom).
      // We want the part of the natural image that maps to the FRAME window [0..FRAME, 0..FRAME].
      // Scale from frame back to natural pixels: natPerFramePx = 1 / (fitScale * cropZoom)
      const natPerFramePx = 1 / (fitScale * cropZoom)
      // In frame coords, the image's top-left is at:
      //   centerX - (fitW*zoom)/2 = FRAME/2 + offsetX - (fitW*zoom)/2
      //   centerY - (fitH*zoom)/2 = FRAME/2 + offsetY - (fitH*zoom)/2
      const imgLeftInFrame = FRAME/2 + cropOffset.x - (fitW * cropZoom)/2
      const imgTopInFrame  = FRAME/2 + cropOffset.y - (fitH * cropZoom)/2
      // Source rect in natural pixels = ( (0 - imgLeftInFrame) to (FRAME - imgLeftInFrame) ) in frame coords,
      // converted to natural pixels by dividing by (fitScale * cropZoom)
      const sx = Math.max(0, (0 - imgLeftInFrame) / (fitScale * cropZoom))
      const sy = Math.max(0, (0 - imgTopInFrame)  / (fitScale * cropZoom))
      const sw = Math.min(img.naturalWidth  - sx, FRAME / (fitScale * cropZoom))
      const sh = Math.min(img.naturalHeight - sy, FRAME / (fitScale * cropZoom))
      // Output size: keep at least 1024px on the shorter side for quality
      const OUT = 1024
      const canvas = document.createElement('canvas')
      canvas.width = OUT
      canvas.height = OUT
      const ctx = canvas.getContext('2d')
      if (!ctx) { setShowCrop(false); return }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, OUT, OUT)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT, OUT)
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.92)
      })
      const croppedFile = new File([blob], uploadedFile.name.replace(/\.[^.]+$/, '') + '_cropped.jpg', { type: 'image/jpeg' })
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      setUploadedFile(croppedFile)
      setPreview(dataUrl)
      setCropOffset({ x: 0, y: 0 })
      setCropZoom(1)
      setShowCrop(false)
    } catch (e) {
      console.error('crop commit failed', e)
      setShowCrop(false)
    }
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

  // ── Toggle style selection (max 4 on initial pick) ──
  const toggleStyle = (id: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= GEN_LIMITS.MAX_STYLES_INITIAL) return prev  // cap at 4
      return [...prev, id]
    })
  }

  // ── Generate initial portraits ──
  const handleGenerate = async () => {
    if (!uploadedFile || selectedStyles.length === 0) return
    setStep('generating'); setProgress(5); setProgressMsg('Uploading your photo...')
    try {
      // Presigned URL → direct R2 upload (bypasses Vercel 4.5MB limit)
      const presignRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: uploadedFile.name, contentType: uploadedFile.type }),
      })
      if (!presignRes.ok) throw new Error('Upload failed')
      const { signedUrl, publicUrl: url } = await presignRes.json()

      setProgressMsg('Uploading your photo...')
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: uploadedFile,
        headers: { 'Content-Type': uploadedFile.type },
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      setUploadedUrl(url); setProgress(20); setProgressMsg('Analyzing your pet...')

      // NOTE: Song brief is now generated at CHECKOUT time (when we have song answers + genre)
      // not at generation time. See handleCheckout + /api/checkout.

      setProgress(28); setProgressMsg('Generating your portraits...')

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          styleIds: selectedStyles,                // NEW: array of style IDs
          variantCount: GEN_LIMITS.INITIAL_PER_STYLE,
          petName: answers.petName || '',
          petType: answers.petBreed || 'pet',
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
              setGenerated(d.images); setProgress(100); setProgressMsg('Done!')
              if (d.sessionFolder) {
                setSessionFolder(d.sessionFolder)
                try {
                  const sessionData = {sessionFolder: d.sessionFolder, images: d.images, petName: answers.petName||'', createdAt: new Date().toISOString(), uploadedUrl: url}
                  localStorage.setItem('pps_last_session', JSON.stringify(sessionData))
                } catch(e) {}
              }
            }
            if (d.type === 'error') throw new Error(d.message)
          } catch {}
        }
      }
      if (buffer.trim().startsWith('data: ')) {
        try {
          const d = JSON.parse(buffer.trim().slice(6))
          if (d.type === 'done') { setGenerated(d.images); setProgress(100) }
        } catch {}
      }
      setStep('gallery')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStep('styles')
    }
  }

  // ── Add 1 more to an existing style (or a brand-new style) ──
  const handleExpandStyle = async (styleId: string, styleName: string) => {
    if (!uploadedUrl || expandingStyle) return
    if (!canAddMoreToStyle(styleName) && imageCountByStyle[styleName]) return
    if (atMaxTotal) return

    setExpandingStyle(styleName)
    setExpandProgress(0)
    const baseStyleId = styleId.replace(/_\d+$/, '')
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
          variantCount: 1,                          // NEW: just 1 at a time
          petName: answers.petName || '',
          petType: answers.petBreed || 'pet',
          sessionId: sessionFolder,
        })
      })
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
            if (d.type === 'image') {
              setGenerated(prev => [...prev, {...d.image, styleId, styleName}])
              setExpandProgress(p => Math.min(p + 60, 95))
            }
          } catch(e) {}
        }
      }
      setExpandProgress(100)
    } catch(e) { console.error('Expand style error:', e) }
    finally {
      clearInterval(ticker)
      setTimeout(() => { setExpandingStyle(null); setExpandProgress(0) }, 600)
    }
  }
  // ── PRODUCT MOCKUP IMAGES ──
  const PRODUCT_IMAGES: Record<string, string> = {
    mug_20oz: '/products/mug.png',
    blanket_50x60: '/products/blanket.png',
    blanket_60x80: '/products/blanket.png',
    baby_blanket: '/products/baby-blanket.png',
    beach_towel: '/products/beach-towel.png',
    pillow: '/products/pillow.png',
    tshirt: '/products/tee.png',
    hoodie: '/products/hoodie.png',
    kids_tee: '/products/tee.png',           // reuse for launch
    kids_hoodie: '/products/hoodie.png',      // reuse for launch
    tote: '/products/tote.png',
    phone_case: '/products/phone.png',
  }

  const ProductMockup = ({ productId, category, previewUrl, isSelected }: {
    productId: string; category: string; previewUrl: string; isSelected: boolean
  }) => {
    const img = previewUrl
    const sel = isSelected
    const productPhoto = PRODUCT_IMAGES[productId]
    if (productPhoto && category !== 'Canvas' && category !== 'Prints') {
      return (
        <div style={{position:'relative',width:'100%',paddingBottom:'100%',background:'#0d0d0d',overflow:'hidden'}}>
          <img src={productPhoto} alt={productId} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'}} />
          {sel && <div style={{position:'absolute',inset:0,border:'2px solid var(--gold)',pointerEvents:'none'}} />}
        </div>
      )
    }
    if (category === 'Canvas') return (
      <div style={{position:'relative',width:'100%',paddingBottom:'85%',background:'#0d0d0d'}}>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 20px 8px'}}>
          <div style={{position:'relative',width:'88%',height:'88%',filter:`drop-shadow(0 6px 20px rgba(0,0,0,.7))${sel?' drop-shadow(0 0 6px rgba(201,168,76,.35))':''}`}}>
            <div style={{position:'absolute',left:-12,top:7,width:12,height:'100%',background:img?`url(${img})`:'#1a0f00',backgroundSize:'cover',backgroundPosition:'left center',transform:'skewY(-45deg)',transformOrigin:'top right',filter:'brightness(0.35)',overflow:'hidden'}}/>
            <div style={{position:'absolute',bottom:-12,left:7,width:'100%',height:12,background:img?`url(${img})`:'#1a0f00',backgroundSize:'cover',backgroundPosition:'center bottom',transform:'skewX(-45deg)',transformOrigin:'top left',filter:'brightness(0.25)',overflow:'hidden'}}/>
            <div style={{width:'100%',height:'100%',backgroundImage:img?`url(${img})`:'none',backgroundColor:img?'transparent':'#2a1a0a',backgroundSize:'cover',backgroundPosition:'center',boxShadow:'inset 0 0 0 1px rgba(255,255,255,.06)'}}/>
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
          </div>
        </div>
      </div>
    )
    return <div style={{fontSize:32,textAlign:'center',padding:'20px 0 12px'}}>{category==='Home'?'🏠':category==='Apparel'?'👕':'✨'}</div>
  }

  const stepNum = {upload:1,styles:2,generating:2,gallery:3,checkout:4}[step]
  const totalSteps = 4

  // ── Expected total images during generation ──
  const expectedInitialTotal = selectedStyles.length * GEN_LIMITS.INITIAL_PER_STYLE

  // ── Available styles for "Try a new style" modal (not already used) ──
  const usedStyleNames = new Set(generated.map(img => img.styleName || ''))
  const availableNewStyles = dynamicStyles.filter(s => {
    const key = `${s.emoji} ${s.name}`
    return !usedStyleNames.has(key) && !usedStyleNames.has(s.name)
  })

  // ── Category filter for the style picker grid ──
  // Category keys present in the loaded dynamicStyles (dedupe + preserve order)
  const availableCategories = useMemo(() => {
    const seen: string[] = []
    for (const s of dynamicStyles) {
      if (s.category && !seen.includes(s.category)) seen.push(s.category)
    }
    return seen
  }, [dynamicStyles])

  const filteredStyles = useMemo(() => {
    if (activeStyleCategory === 'all') return dynamicStyles
    return dynamicStyles.filter(s => s.category === activeStyleCategory)
  }, [dynamicStyles, activeStyleCategory])

  return (
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}
        :root{--gold:#C9A84C;--cream:#F5F0E8;--ink:#0A0A0A;--soft:#141414;--mid:#1E1E1E;--border:rgba(245,240,232,.08);--muted:rgba(245,240,232,.45);--rust:#C4622D;--purple:#A78BFA}
        .serif{font-family:'Cormorant Garamond',serif}
        .btn-gold{background:var(--gold);color:var(--ink);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:12px;padding:18px 40px;border:none;cursor:pointer;transition:all .3s;width:100%}
        .btn-gold:hover{background:var(--cream)}.btn-gold:disabled{opacity:.35;cursor:not-allowed}
        .btn-out{border:1px solid rgba(245,240,232,.15);color:var(--muted);background:none;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:14px 24px;cursor:pointer;transition:all .3s;width:100%}
        .btn-out:hover{border-color:var(--gold);color:var(--gold)}
        .input{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;transition:border-color .3s}
        .input:focus{border-color:var(--gold)}
        .input::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        .select{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;cursor:pointer}
        .textarea{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:14px 16px;font-size:15px;font-family:'DM Sans',sans-serif;width:100%;outline:none;height:90px;resize:none;transition:border-color .3s}
        .textarea:focus{border-color:var(--gold)}
        .textarea::placeholder{color:rgba(245,240,232,.25);font-style:italic}
        .drop{border:2px dashed rgba(245,240,232,.12);padding:60px 40px;text-align:center;cursor:pointer;transition:all .3s}
        .drop.over{border-color:var(--gold);background:rgba(201,168,76,.03)}
        .product-card{background:#141414;border:1px solid rgba(245,240,232,.08);padding:20px;cursor:pointer;transition:all .2s;position:relative}
        .product-card:hover,.product-card.on{border-color:var(--gold)}
        .style-toggle{border:1px solid rgba(245,240,232,.08);background:transparent;padding:0;cursor:pointer;transition:all .2s;text-align:left;position:relative;overflow:hidden;display:block}
        .style-toggle:hover{border-color:rgba(201,168,76,.5)}
        .style-toggle.on{border-color:var(--gold);background:rgba(201,168,76,.04)}
        .style-toggle.disabled{opacity:.35;cursor:not-allowed}
        .style-toggle.disabled:hover{border-color:rgba(245,240,232,.08)}
        .style-toggle .style-img-wrap img{transition:transform .5s ease}
        .style-toggle:hover .style-img-wrap img{transform:scale(1.04)}

        /* Caption overlay — name + description ALWAYS visible at bottom of image,
           mirrors the /styles page look. Description truncates to 2 lines by default,
           expands fully on hover or when selected. */
        .style-caption{position:absolute;left:0;right:0;bottom:0;padding:64px 14px 14px;background:linear-gradient(to top,rgba(10,10,10,.98) 0%,rgba(10,10,10,.88) 45%,rgba(10,10,10,.4) 78%,transparent 100%);color:var(--cream);text-align:center;pointer-events:none;z-index:1;transition:padding-bottom .3s ease}
        .style-caption-name{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:400;line-height:1.2;letter-spacing:.005em;margin-bottom:6px}
        .style-caption-desc{font-size:11px;color:rgba(245,240,232,.78);line-height:1.5;letter-spacing:.01em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:-webkit-line-clamp .3s ease}
        .style-toggle:hover .style-caption-desc,.style-toggle.on .style-caption-desc{-webkit-line-clamp:4;color:rgba(245,240,232,.92)}
        .style-toggle.on .style-caption{background:linear-gradient(to top,rgba(201,168,76,.2) 0%,rgba(10,10,10,.95) 35%,rgba(10,10,10,.5) 75%,transparent 100%)}
        .img-card{aspect-ratio:1;object-fit:cover;width:100%;cursor:pointer;transition:all .3s;border:2px solid transparent;display:block}
        .img-card:hover{transform:scale(1.02)}.img-card.picked{border-color:var(--gold);box-shadow:0 0 0 4px rgba(201,168,76,.15)}
        .progress-bar{height:3px;background:rgba(245,240,232,.06);border-radius:999px;overflow:hidden}
        .progress-fill{height:100%;background:var(--gold);transition:width .6s ease;border-radius:999px}
        .step-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;display:inline-block}
        .genre-pill{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--muted);padding:9px 16px;font-size:12px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .genre-pill:hover{border-color:var(--gold);color:var(--gold)}
        .genre-pill.on{background:var(--purple);border-color:var(--purple);color:#fff;font-weight:600}
        .size-pill{background:#141414;border:1px solid rgba(245,240,232,.1);color:var(--cream);padding:12px 18px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;position:relative}
        .size-pill:hover{border-color:var(--gold)}
        .size-pill.on{background:rgba(201,168,76,.08);border-color:var(--gold);color:var(--gold);font-weight:700}
        .size-pill .price{display:block;font-size:10px;opacity:.7;margin-top:2px}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}.pulse{animation:pulse 1.8s ease infinite}
        @keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite;display:inline-block}
        @keyframes fadeInScale{0%{opacity:0;transform:scale(.92) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes ping{0%{opacity:.6;transform:scale(1)}75%,100%{opacity:0;transform:scale(1.5)}}
        @keyframes fadeInUp{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}

        /* Walking paws loader — 4 paws stamp up the screen in zigzag tracks, loops */
        @keyframes pawStep{
          0%, 8%   { opacity:0; transform:scale(.55) translateY(14px) rotate(var(--r,0deg)); }
          18%, 70% { opacity:.9; transform:scale(1) translateY(0) rotate(var(--r,0deg)); }
          85%,100% { opacity:0; transform:scale(1.06) translateY(-8px) rotate(var(--r,0deg)); }
        }
        .paw-track{position:relative;width:180px;height:260px;margin:0 auto 28px}
        .paw-track .paw{position:absolute;width:48px;height:48px;color:var(--gold);opacity:0;animation:pawStep 3.2s ease-in-out infinite;filter:drop-shadow(0 2px 8px rgba(201,168,76,.3))}
        .paw-track .paw-1{bottom:0;   left:24%;  --r:-14deg; animation-delay:0s}
        .paw-track .paw-2{bottom:64px;right:24%; --r:14deg;  animation-delay:.55s}
        .paw-track .paw-3{bottom:128px;left:24%; --r:-14deg; animation-delay:1.1s}
        .paw-track .paw-4{bottom:192px;right:24%;--r:14deg;  animation-delay:1.65s}

        /* Mobile polish */
        @media(max-width:640px){
          nav{padding:14px 16px !important;gap:8px !important}
          nav > div:first-child > span{font-size:16px !important}
          nav > div:nth-child(2){display:none !important}
          nav > div:last-child{font-size:10px !important}
          main{padding:24px 16px 60px !important}
          h1{font-size:clamp(26px,7vw,36px) !important;line-height:1.15 !important}
          .drop{padding:40px 20px !important;min-height:260px !important}
          .drop > div > div:first-child{font-size:40px !important}
          .btn-gold{padding:16px 24px !important;font-size:12px !important;width:100% !important}
          .btn-out{padding:14px 20px !important;font-size:10px !important}
          [style*="gridTemplateColumns:'repeat(4"],
          [style*="gridTemplateColumns: 'repeat(4"]{grid-template-columns:1fr 1fr !important;gap:10px !important}
          [style*="gridTemplateColumns:'repeat(3"],
          [style*="gridTemplateColumns: 'repeat(3"]{grid-template-columns:1fr 1fr !important;gap:10px !important}
          .img-card{aspect-ratio:3/4 !important}
          .input,.select{font-size:16px !important;padding:14px 16px !important}
          [style*="gridTemplateColumns:'1fr 1fr'"][style*="gap:16"]{grid-template-columns:1fr !important;gap:12px !important}
        }

          /* M3 — mobile-responsive create page */
          @media (max-width: 720px) {
            .create-container { padding: 28px 16px 60px !important; }
            .create-style-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 6px !important; margin-bottom: 24px !important; }
            .create-loading-thumbs { grid-template-columns: repeat(2, 1fr) !important; gap: 6px !important; }
            .create-portrait-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
            .create-pet-fields { grid-template-columns: 1fr !important; gap: 12px !important; }
            .create-nav-buttons { grid-template-columns: 1fr !important; gap: 8px !important; }
            .create-nav-buttons button { width: 100% !important; }
          }
      `}</style>
      <SiteNav currentPage={null} />
      <CreateSteps stepNum={stepNum as 1|2|3|4} />

      <div className="create-container" style={{maxWidth:860,margin:'0 auto',padding:'56px 24px 80px'}}>

        {/* ── RESUME SESSION BANNER ── */}
        {step==='upload' && savedSession && (
          <div style={{background:'linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.03))',border:'1px solid rgba(201,168,76,.5)',padding:'20px 28px',marginBottom:4,display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{fontSize:36}}>🎨</div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontSize:9,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:4}}>Previous Session Found</div>
              <div className="serif" style={{fontSize:17,color:'var(--cream)',marginBottom:4}}>
                {savedSession.petName ? `${savedSession.petName}'s portraits` : 'Your portraits'} — {savedSession.images.length} images ready
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
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 1 of {totalSteps}</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:400,marginBottom:12}}>Upload Your Pet's Photo</h1>
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
                    style={{position:'absolute',left:'50%',top:'50%',transform:`translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropZoom})`,maxWidth:'100%',maxHeight:'100%',pointerEvents:'none',userSelect:'none'}}
                  />
                </div>
                <div style={{marginTop:20,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
                  <span style={{fontSize:11,color:'var(--muted)',letterSpacing:'.12em',textTransform:'uppercase'}}>Zoom Out</span>
                  <input type="range" min="0.5" max="4" step="0.05" value={cropZoom} onChange={e=>setCropZoom(parseFloat(e.target.value))} style={{width:180,accentColor:'var(--gold)'}}/>
                  <span style={{fontSize:11,color:'var(--muted)',letterSpacing:'.12em',textTransform:'uppercase'}}>Zoom In</span>
                  <span style={{fontSize:11,color:'var(--gold)',minWidth:48,textAlign:'right',fontVariantNumeric:'tabular-nums'}}>{cropZoom.toFixed(2)}×</span>
                </div>
                <div style={{marginTop:24,display:'flex',gap:16}}>
                  <button onClick={()=>{setCropOffset({x:0,y:0});setCropZoom(1)}} className="btn-out">Reset</button>
                  <button onClick={commitCrop} className="btn-gold">Done</button>
                </div>
              </div>
            )}

            <div className={`drop${isDragging?' over':''}`} onDrop={handleDrop} onDragOver={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)} onClick={()=>!preview&&fileRef.current?.click()}>
              {preview?(
                <div onClick={e=>e.stopPropagation()}>
                  <div style={{position:'relative',display:'inline-block'}}>
                    <img src={preview} alt="Pet preview" style={{maxHeight:360,maxWidth:'100%',objectFit:'contain',display:'block',margin:'0 auto'}}
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

            <div className="create-pet-fields" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:24}}>
              <div>
                <label style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:8}}>Pet's Name <span style={{opacity:.5}}>(optional)</span></label>
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
              <button className="btn-gold" disabled={!uploadedFile || !imageLoaded} onClick={()=>setStep('styles')}>Choose Your Styles →</button>
            </div>
            <div style={{marginTop:16,display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
              {['✓ No account needed','✓ Free to preview','✓ Prints shipped in 5–7 days'].map(t=>(
                <span key={t} style={{fontSize:11,color:'var(--muted)'}}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: STYLE PICKER ── */}
        {step==='styles'&&(
          <div>
            <div style={{textAlign:'center',marginBottom:40}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 2 of {totalSteps}</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:400,marginBottom:14,letterSpacing:'-.01em'}}>Pick Your <em style={{color:'var(--gold)'}}>Styles</em></h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8,maxWidth:520,margin:'0 auto'}}>
                Choose up to <strong style={{color:'var(--cream)'}}>{GEN_LIMITS.MAX_STYLES_INITIAL}</strong> styles to start. We'll generate <strong style={{color:'var(--cream)'}}>{GEN_LIMITS.INITIAL_PER_STYLE} portraits</strong> of each, then you can explore more from the gallery.
              </p>
            </div>

            {/* Pet preview confirmation */}
            {preview && (
              <div style={{display:'flex',gap:20,alignItems:'center',padding:'16px 22px',background:'linear-gradient(135deg,rgba(201,168,76,.06),rgba(10,10,10,.4))',marginBottom:32,border:'1px solid rgba(201,168,76,.2)'}}>
                <div style={{width:56,height:56,borderRadius:4,overflow:'hidden',flexShrink:0,border:'2px solid rgba(201,168,76,.3)'}}>
                  <img src={preview} alt="Your pet" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',fontWeight:600,marginBottom:3}}>Photo ready</div>
                  <div style={{fontSize:14,fontWeight:500}}>{answers.petName||'Your pet'}</div>
                </div>
                <button onClick={()=>setStep('upload')} style={{background:'none',border:'1px solid var(--border)',color:'var(--muted)',cursor:'pointer',fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',padding:'7px 14px'}}>Change</button>
              </div>
            )}

            {/* Category filter pills */}
            {availableCategories.length > 1 && (
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>
                <button
                  onClick={()=>setActiveStyleCategory('all')}
                  style={{
                    padding:'8px 16px',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',
                    background: activeStyleCategory==='all' ? 'rgba(201,168,76,.08)' : '#141414',
                    border:`1px solid ${activeStyleCategory==='all' ? 'var(--gold)' : 'rgba(245,240,232,.1)'}`,
                    color: activeStyleCategory==='all' ? 'var(--gold)' : 'var(--muted)',
                    cursor:'pointer',fontWeight: activeStyleCategory==='all' ? 700 : 500,
                    fontFamily:"'DM Sans',sans-serif",
                  }}
                >All ({dynamicStyles.length})</button>
                {availableCategories.map(cat => {
                  const info = CATEGORY_LABELS[cat] || { label: cat, emoji: '🎨' }
                  const count = dynamicStyles.filter(s => s.category === cat).length
                  const isOn = activeStyleCategory === cat
                  return (
                    <button key={cat} onClick={()=>setActiveStyleCategory(cat)}
                      style={{
                        padding:'8px 16px',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',
                        background: isOn ? 'rgba(201,168,76,.08)' : '#141414',
                        border:`1px solid ${isOn ? 'var(--gold)' : 'rgba(245,240,232,.1)'}`,
                        color: isOn ? 'var(--gold)' : 'var(--muted)',
                        cursor:'pointer',fontWeight: isOn ? 700 : 500,
                        fontFamily:"'DM Sans',sans-serif",
                      }}
                    >{info.emoji} {info.label} ({count})</button>
                  )
                })}
              </div>
            )}

            {/* Selection counter */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:11,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--muted)'}}>
                {stylesLoading ? 'Loading styles...' : `${filteredStyles.length} styles`}
              </div>
              <div style={{fontSize:11,color:selectedStyles.length>0?'var(--gold)':'var(--muted)',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>
                {selectedStyles.length} of {GEN_LIMITS.MAX_STYLES_INITIAL} selected
              </div>
            </div>

            {/* Style grid */}
            <div className="create-style-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2,marginBottom:40}}>
              {filteredStyles.map(s=>{
                const isOn = selectedStyles.includes(s.id)
                const atCap = selectedStyles.length >= GEN_LIMITS.MAX_STYLES_INITIAL && !isOn
                return (
                  <button
                    key={s.id}
                    className={`style-toggle${isOn?' on':''}${atCap?' disabled':''}`}
                    onClick={()=>!atCap && toggleStyle(s.id)}
                    disabled={atCap}
                  >
                    {/* Selection indicator (top-right) */}
                    <div style={{position:'absolute',top:8,right:8,width:18,height:18,border:`1px solid ${isOn?'var(--gold)':'rgba(245,240,232,.2)'}`,borderRadius:'50%',background:isOn?'var(--gold)':'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--ink)',fontWeight:700,zIndex:2}}>
                      {isOn&&'✓'}
                    </div>

                    {/* Image — caption overlays bottom half */}
                    <div className="style-img-wrap" style={{width:'100%',aspectRatio:'2/3',overflow:'hidden',position:'relative'}}>
                      {s.styleImage
                        ? <img src={s.styleImage} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                        : <div style={{width:'100%',height:'100%',background:s.styleBg||'#1a1a1a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}><div style={{fontSize:34}}>{s.emoji}</div></div>
                      }

                      {/* Hover overlay caption — name always peeks, description reveals on hover/selected */}
                      <div className="style-caption">
                        <div className="style-caption-name">{s.emoji} {s.name}</div>
                        {s.description && <div className="style-caption-desc">{s.description}</div>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {error&&<div style={{color:'#C4622D',fontSize:13,marginBottom:16,padding:'12px 16px',background:'rgba(196,98,45,.08)',border:'1px solid rgba(196,98,45,.15)'}}>{error}</div>}

            <div className="create-nav-buttons" style={{display:'grid',gridTemplateColumns:'1fr 2.5fr',gap:3}}>
              <button className="btn-out" onClick={()=>setStep('upload')}>← Back</button>
              <button className="btn-gold" disabled={selectedStyles.length === 0} onClick={handleGenerate}>
                {selectedStyles.length === 0 ? 'Pick a Style to Start' : `Generate Portraits →`}
              </button>
            </div>
            <div style={{marginTop:16,textAlign:'center',fontSize:11,color:'var(--muted)'}}>
              Takes about 2–4 minutes · free to preview
            </div>
          </div>
        )}

        {/* ── GENERATING ── */}
        {step==='generating'&&(
          <div style={{textAlign:'center',padding:'60px 0',position:'relative'}}>
            <div className="paw-track" aria-label="Creating portraits">
              {[1,2,3,4].map(n => (
                <svg key={n} className={`paw paw-${n}`} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
                  {/* Main heel pad */}
                  <ellipse cx="25" cy="36" rx="10.5" ry="8.5"/>
                  {/* 4 toe pads in an arc */}
                  <ellipse cx="9"  cy="22" rx="4" ry="5.5"/>
                  <ellipse cx="19" cy="12" rx="4" ry="5.8"/>
                  <ellipse cx="31" cy="12" rx="4" ry="5.8"/>
                  <ellipse cx="41" cy="22" rx="4" ry="5.5"/>
                </svg>
              ))}
            </div>
            <h2 className="serif" style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:400,marginBottom:16}}>
              Creating {answers.petName?`${answers.petName}'s`:''} Portraits
            </h2>
            <p style={{color:'var(--gold)',fontSize:14,marginBottom:8,letterSpacing:'.04em',fontStyle:'italic',minHeight:22,transition:'opacity .4s'}} key={progressMsg}>
              {progressMsg}
            </p>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:48,lineHeight:1.8}}>
              Takes about 2–4 minutes · keep this tab open
            </p>
            <div style={{maxWidth:440,margin:'0 auto 40px'}}>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                <span style={{fontSize:11,color:'var(--muted)'}}>{progress}% complete</span>
                <span style={{fontSize:11,color:'var(--gold)'}}>{generated.length} of {expectedInitialTotal} ready</span>
              </div>
            </div>
            {generated.length>0&&(
              <div className="create-loading-thumbs" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,maxWidth:480,margin:'0 auto'}}>
                {generated.map((img,i)=>(
                  <div key={img.url} style={{animation:`fadeInScale .6s ease-out ${Math.min(i,12)*40}ms both`}}>
                    <WatermarkedImage src={img.url} alt={img.styleName} width={200} height={300} displayRatio="2/3" style={{opacity:.95}}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GALLERY — pick your favorite ── */}
        {step==='gallery'&&(
          <div style={{paddingBottom:140}}>
            <div style={{textAlign:'center',marginBottom:40,animation:'fadeInUp .6s ease-out both'}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:12}}>Step 3 of {totalSteps}</div>
              <h1 className="serif" style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:400,marginBottom:14,letterSpacing:'-.01em'}}>
                {picked ? <>This is the <em style={{color:'var(--gold)'}}>one</em>.</> : <>Find the <em style={{color:'var(--gold)'}}>one</em>.</>}
              </h1>
              <p style={{color:'var(--muted)',fontSize:15,lineHeight:1.8,maxWidth:520,margin:'0 auto'}}>
                {picked
                  ? `You chose ${picked.styleName}. Ready when you are.`
                  : `${generated.length} portraits · tap the one that feels most like them.`
                }
              </p>
              <div style={{marginTop:12,fontSize:11,color:atMaxTotal?'var(--rust)':'var(--muted)',letterSpacing:'.12em',textTransform:'uppercase'}}>
                {totalGenerated} of {GEN_LIMITS.MAX_TOTAL} portraits generated
              </div>
            </div>

            {(()=>{
              const groups: Record<string, typeof generated> = {}
              generated.forEach(img => {
                const key = img.styleName || img.styleId
                if (!groups[key]) groups[key] = []
                groups[key].push(img)
              })
              let globalIdx = 0
              return Object.entries(groups).map(([name, imgs], groupIdx) => {
                const styleFromImg = imgs[0]?.styleId?.replace(/_\d+$/, '')
                const style = dynamicStyles.find(s => s.id === styleFromImg)
                           || ART_STYLES.find(s => s.id === styleFromImg || s.generateStyleId === styleFromImg)
                const emoji = style?.emoji || imgs[0]?.styleName?.split(' ')[0] || '🎨'
                const countForStyle = imageCountByStyle[name] || 0
                const canAdd = canAddMoreToStyle(name)
                return (
                  <div key={name} style={{marginBottom:56,animation:`fadeInUp .6s ease-out ${Math.min(groupIdx,10)*60}ms both`}}>
                    <div style={{fontSize:10,letterSpacing:'.24em',textTransform:'uppercase',color:'var(--gold)',marginBottom:18,display:'flex',alignItems:'center',gap:14}}>
                      <span style={{fontSize:16,filter:'grayscale(.2)'}}>{emoji}</span>
                      <span style={{fontWeight:600}}>{name}</span>
                      <span style={{fontSize:9,opacity:.6}}>({countForStyle}/{GEN_LIMITS.MAX_PER_STYLE})</span>
                      <span style={{flex:1,height:1,background:'linear-gradient(to right,rgba(201,168,76,.25),rgba(245,240,232,.04))'}}/>
                    </div>
                    <div className="create-portrait-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                      {imgs.map((img,i)=>{
                        const isPicked = picked?.url===img.url
                        const delay = Math.min(globalIdx++, 14) * 40
                        return (
                          <div key={i}
                            style={{position:'relative',cursor:'pointer',animation:`fadeInScale .55s cubic-bezier(.2,.8,.2,1) ${delay}ms both`,transform: isPicked ? 'scale(1.01)' : undefined,transition:'transform .3s',zIndex: isPicked ? 2 : 1}}
                            onClick={()=>setLightboxImg({url:img.url,styleName:img.styleName})}
                          >
                            <WatermarkedImage src={img.url} alt={`${name} ${i+1}`} width={400} height={600} displayRatio="2/3" className={`img-card${isPicked?' picked':''}`}/>
                            {isPicked && (
                              <>
                                <div style={{position:'absolute',top:10,right:10,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,pointerEvents:'none',boxShadow:'0 4px 16px rgba(201,168,76,.4)'}}>✓</div>
                                <div style={{position:'absolute',top:12,left:12,background:'rgba(10,10,10,.85)',color:'var(--gold)',padding:'6px 10px',fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',fontWeight:700,pointerEvents:'none',backdropFilter:'blur(4px)'}}>The One</div>
                              </>
                            )}
                            <button onClick={(e)=>{e.stopPropagation();setPicked(img)}}
                              style={{position:'absolute',bottom:10,right:10,background:isPicked?'var(--gold)':'rgba(0,0,0,.7)',border:'none',color:isPicked?'var(--ink)':'#fff',padding:'7px 14px',borderRadius:3,cursor:'pointer',fontSize:10,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',opacity:0.92,transition:'all .2s',backdropFilter:'blur(4px)'}}
                              title="Select this portrait"
                            >{isPicked?'✓ Selected':'Select'}</button>
                          </div>
                        )
                      })}
                    </div>
                    {expandingStyle === name ? (
                      <div style={{marginTop:12}}>
                        <div style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>⟳ Generating 1 more in {name}...</div>
                        <div style={{height:3,background:'rgba(245,240,232,.08)',borderRadius:2,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${expandProgress}%`,background:'var(--gold)',borderRadius:2,transition:'width 0.4s ease'}}/>
                        </div>
                      </div>
                    ) : (
                      <button onClick={()=>handleExpandStyle(imgs[0]?.styleId, name)} disabled={!canAdd || !!expandingStyle}
                        style={{marginTop:14,background:'transparent',border:`1px solid ${canAdd?'rgba(201,168,76,.3)':'rgba(245,240,232,.08)'}`,color:canAdd?'var(--gold)':'var(--muted)',padding:'9px 22px',fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',cursor:canAdd?'pointer':'not-allowed',opacity:canAdd?1:.4,display:'flex',alignItems:'center',gap:8,transition:'all .2s'}}>
                        {canAdd ? '+ 1 More In This Style' : countForStyle >= GEN_LIMITS.MAX_PER_STYLE ? 'Max for this style' : 'Session limit reached'}
                      </button>
                    )}
                  </div>
                )
              })
            })()}

            {/* Add new style button */}
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
            )}

            {/* Sticky bottom bar */}
            <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:picked?'linear-gradient(to top,rgba(201,168,76,.08),rgba(10,10,10,.96))':'rgba(10,10,10,.96)',padding:'18px 24px',borderTop:picked?'1px solid rgba(201,168,76,.35)':'1px solid rgba(245,240,232,.08)',backdropFilter:'blur(16px)',transition:'all .4s ease'}}>
              {picked&&(
                <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:14,animation:'fadeInUp .4s ease-out both'}}>
                  <img src={picked.url} alt="Selected" style={{width:56,height:56,objectFit:'cover',boxShadow:'0 2px 12px rgba(0,0,0,.5)'}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:3,fontWeight:600}}>You picked</div>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{picked.styleName}</div>
                  </div>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:8}}>
                <button className="btn-out" style={{padding:'14px'}} onClick={()=>{ setGenerated([]); setPicked(null); setSelectedStyles([]); setStep(uploadedFile ? 'styles' : 'upload') }}>← Start Over</button>
                <button className="btn-gold" disabled={!picked} onClick={()=>setStep('checkout')}>{picked ? 'Make It Real →' : 'Pick Your Favorite'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKOUT — See / Hear / Feel ── */}
        {step==='checkout'&&picked&&(
          <div>
            {/* BIG multisensory hero */}
            <div style={{textAlign:'center',marginBottom:44}}>
              <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:16,fontWeight:600}}>Step 4 of {totalSteps} · Your Experience</div>
              <h1 className="serif" style={{fontSize:'clamp(42px,8vw,78px)',fontWeight:400,letterSpacing:'-.02em',lineHeight:1.05,marginBottom:18}}>
                See Them. <em style={{color:'var(--gold)'}}>Hear</em> Them.<br/>
                <span style={{color:'var(--gold)'}}>Feel</span> Them.
              </h1>
              <p style={{color:'var(--muted)',fontSize:16,lineHeight:1.7,maxWidth:560,margin:'0 auto'}}>
                A multisensory pet experience. Their portrait on your wall, their song in your ears, their keepsakes in your hands.
              </p>
            </div>

            {/* ═══════════ 👁️ SEE THEM ═══════════ */}
            <div style={{marginBottom:40}}>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
                <span style={{fontSize:32}}>👁️</span>
                <div>
                  <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700}}>See Them</div>
                  <div className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:'-.01em',marginTop:2}}>The Portrait</div>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:28,padding:'24px',background:'#141414',border:'1px solid rgba(201,168,76,.2)',marginBottom:16}}>
                <div>
                  <ProductMockup
                    productId={primaryProduct?.id || ''}
                    category={selectedMedium}
                    previewUrl={picked.url}
                    isSelected={false}
                  />
                </div>
                <div>
                  <div style={{fontSize:10,color:'var(--gold)',letterSpacing:'.2em',textTransform:'uppercase',fontWeight:600,marginBottom:6}}>Your Pick</div>
                  <div className="serif" style={{fontSize:24,fontWeight:400,marginBottom:8,lineHeight:1.15}}>{picked.styleName}</div>
                  <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,marginBottom:14}}>Archival materials, museum-grade inks. Arrives with a QR code that plays their custom song.</div>
                  {primaryProduct && (
                    <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
                      <span style={{fontSize:12,color:'var(--muted)',letterSpacing:'.05em'}}>{primaryProduct.name} · {primaryProduct.size}</span>
                      <span className="serif" style={{fontSize:24,color:'var(--gold)'}}>${primaryProduct.price}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* [C4f] Primary product Add to Cart — the portrait itself */}
              {picked && primaryProduct && (
                <div style={{marginBottom:16}}>
                  {cart.filter(ci => ci.productId === primaryProduct.id).reduce((a,ci)=>a+ci.quantity,0) > 0 && (
                    <div style={{margin:'0 0 8px',fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--gold)',textAlign:'center',opacity:.85}}>
                      In Cart · {cart.filter(ci => ci.productId === primaryProduct.id).reduce((a,ci)=>a+ci.quantity,0)}
                    </div>
                  )}
                  <button
                    onClick={()=>{
                      if (!picked || !primaryProduct) return
                      const ts = Date.now()
                      addItem({
                        lineId: `${primaryProduct.id}_${ts}`,
                        productId: primaryProduct.id,
                        productName: primaryProduct.name,
                        variantKey: primaryProduct.size,
                        variantId: (primaryProduct as any).printifyVariantId,
                        blueprintId: (primaryProduct as any).printifyBlueprintId,
                        quantity: 1,
                        unitPrice: primaryProduct.price,
                        portraitUrl: picked.url,
                        styleName: picked.styleName,
                        category: primaryProduct.category,
                        addedAt: ts,
                      })
                      setJustAddedId(primaryProduct.id)
                      setTimeout(()=>setJustAddedId(cur => cur === primaryProduct.id ? null : cur), 1400)
                    }}
                    style={{
                      width:'100%',padding:'14px 16px',fontSize:11,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',
                      background: justAddedId === primaryProduct.id ? 'var(--gold)' : 'rgba(201,168,76,.12)',
                      border:'1px solid var(--gold)',
                      color: justAddedId === primaryProduct.id ? 'var(--ink)' : 'var(--gold)',
                      cursor:'pointer',transition:'all .18s',
                      transform: justAddedId === primaryProduct.id ? 'scale(.99)' : 'scale(1)',
                    }}
                  >
                    {justAddedId === primaryProduct.id
                      ? '✓ Added to Cart'
                      : (cart.some(ci => ci.productId === primaryProduct.id) ? `+ Add Another ${primaryProduct.name}` : `+ Add ${primaryProduct.name} ${primaryProduct.size} to Cart`)}
                  </button>
                </div>
              )}

              {/* Skip-primary toggle — lets users checkout with just keepsakes */}

              {/* Medium toggle */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>Print Medium</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3}}>
                  {(['Canvas', 'Prints'] as const).map(m => (
                    <button key={m} onClick={()=>{
                      setSelectedMedium(m)
                      // Preserve size if it exists in the new medium; otherwise pick the first available
                      const sameSize = PRODUCTS.find(p => p.category === m && p.size === selectedSize)
                      if (!sameSize) {
                        const first = PRODUCTS.find(p => p.category === m)?.size
                        if (first) setSelectedSize(first)
                      }
                    }}
                      style={{padding:'16px 20px',background:selectedMedium===m?'rgba(201,168,76,.08)':'#141414',border:`1px solid ${selectedMedium===m?'var(--gold)':'rgba(245,240,232,.1)'}`,color:selectedMedium===m?'var(--gold)':'var(--cream)',cursor:'pointer',textAlign:'left',transition:'all .2s'}}>
                      <div className="serif" style={{fontSize:16,fontWeight:400,marginBottom:3}}>{m === 'Canvas' ? '🖼️ Canvas Print' : '📄 Fine Art Print'}</div>
                      <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.5}}>{m === 'Canvas' ? 'Gallery-wrapped, ready to hang' : 'Archival matte paper, frame yourself'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size pills */}
              <div>
                <div style={{fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>Size</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {availableSizes.map(s => (
                    <button key={s.size} onClick={()=>setSelectedSize(s.size)} className={`size-pill${selectedSize===s.size?' on':''}`}>
                      {s.size}
                      {s.popular && <span style={{display:'inline-block',marginLeft:6,fontSize:8,padding:'2px 5px',background:'var(--gold)',color:'var(--ink)',letterSpacing:'.08em',textTransform:'uppercase',fontWeight:700,verticalAlign:'middle'}}>Popular</span>}
                      <span className="price">${s.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══════════ 🎵 HEAR THEM ═══════════ */}
            <div style={{marginBottom:40,padding:'28px',background:'linear-gradient(135deg,rgba(139,92,246,.06),rgba(10,10,10,.4))',border:'1px solid rgba(139,92,246,.25)'}}>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:8}}>
                <span style={{fontSize:32}}>🎵</span>
                <div>
                  <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--purple)',fontWeight:700}}>Hear Them</div>
                  <div className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:'-.01em',marginTop:2}}>Their Song</div>
                </div>
              </div>
              <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.7,marginBottom:20,marginTop:4}}>
                A one-of-a-kind song composed from their story. Their name in the lyrics, their personality in every note. QR code on the print reveals it when it arrives.
              </p>

              {/* Song questions — compact grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                {SONG_QUESTIONS.filter(q => q.type === 'text').map(q => (
                  <div key={q.id}>
                    <label style={{fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:5}}>{q.label}</label>
                    <input className="input" style={{padding:'11px 13px',fontSize:13}} placeholder={q.placeholder} value={songAnswers[q.id]||''} onChange={e=>setSongAnswers(a=>({...a,[q.id]:e.target.value}))}/>
                  </div>
                ))}
              </div>

              {SONG_QUESTIONS.filter(q => q.type === 'textarea').map(q => (
                <div key={q.id} style={{marginBottom:14}}>
                  <label style={{fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:5}}>{q.label}</label>
                  <textarea className="textarea" placeholder={q.placeholder} value={songAnswers[q.id]||''} onChange={e=>setSongAnswers(a=>({...a,[q.id]:e.target.value}))}/>
                </div>
              ))}

              {/* Genre picker */}
              <div style={{marginTop:20}}>
                <label style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--cream)',display:'block',marginBottom:10,fontWeight:600}}>What music do they love? <span style={{color:'var(--purple)'}}>*</span></label>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {SONG_GENRES.map(g => (
                    <button key={g} onClick={()=>setSongGenre(g)} className={`genre-pill${songGenre===g?' on':''}`}>{g}</button>
                  ))}
                </div>
                {!songGenre && <div style={{fontSize:11,color:'var(--muted)',marginTop:8,fontStyle:'italic'}}>Pick a genre to continue</div>}
              </div>
            </div>

            {/* ═══════════ 🤲 FEEL THEM ═══════════ */}
            <div style={{marginBottom:32}}>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:8}}>
                <span style={{fontSize:32}}>🤲</span>
                <div>
                  <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',fontWeight:700}}>Feel Them</div>
                  <div className="serif" style={{fontSize:24,fontWeight:400,letterSpacing:'-.01em',marginTop:2}}>Premium Keepsakes</div>
                </div>
              </div>
              <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.7,marginBottom:20}}>
                Thicker canvas. Softer blankets. Heavier shirts. Every product hand-selected for quality — not a novelty gift.
              </p>

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:6}}>
                {PRODUCTS.filter(p=>!['Canvas','Prints'].includes(p.category)).map(p=>{
                  const isOn = cartExtras.includes(p.id)
                  const hasSizes = !!(p as any).sizes?.length
                  return (
                    <div key={p.id} style={{position:'relative'}}>
                      <div className={`product-card${isOn?' on':''}`} onClick={()=>{
                        if (hasSizes && !isOn) {
                          setCartExtraSizes(prev=>({...prev, [p.id]: (p as any).sizes?.[1] || (p as any).sizes?.[0] || 'M'}))
                          setCartExtraColors(prev=>({...prev, [p.id]: 'Black'}))
                          setCartExtras(prev=>[...prev, p.id])
                        } else {
                          setCartExtras(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])
                        }
                      }} style={{padding:0,overflow:'hidden'}}>
                        {isOn&&<div style={{position:'absolute',top:6,left:6,background:'var(--gold)',color:'var(--ink)',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,zIndex:2}}>✓</div>}
                        {PRODUCT_IMAGES[p.id] && <div onClick={(e)=>{e.stopPropagation();setProductDetail(p)}} style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,.6)',color:'#fff',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,zIndex:2,cursor:'pointer'}}>ⓘ</div>}
                        <ProductMockup productId={p.id} category={p.category} previewUrl={preview} isSelected={isOn} />
                        <div style={{padding:'6px 10px 10px'}}>
                          <div className="serif" style={{fontSize:13,marginBottom:1,fontWeight:400}}>{p.name}</div>
                          <div style={{fontSize:9,color:'var(--muted)',marginBottom:4}}>{p.size}</div>
                          <div className="serif" style={{fontSize:16,color:'var(--gold)'}}>${p.price}</div>
                        </div>
                      </div>
                      {isOn && hasSizes && (
                        <div style={{padding:'6px 4px'}}>
                          {(p as any).colors?.length > 0 && (
                            <div style={{display:'flex',gap:4,marginBottom:6,alignItems:'center'}}>
                              {((p as any).colors as string[]).map(c=>(
                                <button key={c} onClick={()=>setCartExtraColors(prev=>({...prev,[p.id]:c}))} style={{width:20,height:20,borderRadius:'50%',cursor:'pointer',background: c === 'Black' ? '#1a1a1a' : '#f5f0e8',border: `2px solid ${(cartExtraColors[p.id]||'Black')===c ? 'var(--gold)' : 'rgba(245,240,232,.15)'}`}} title={c} />
                              ))}
                              <span style={{fontSize:9,color:'var(--muted)',marginLeft:2}}>{cartExtraColors[p.id]||'Black'}</span>
                            </div>
                          )}
                          <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                            {((p as any).sizes as string[]).map(s=>(
                              <button key={s} onClick={()=>setCartExtraSizes(prev=>({...prev,[p.id]:s}))} style={{padding:'4px 10px',fontSize:9,fontWeight:600,background: cartExtraSizes[p.id]===s ? 'var(--gold)' : '#1a1a1a',color: cartExtraSizes[p.id]===s ? 'var(--ink)' : 'var(--muted)',border: `1px solid ${cartExtraSizes[p.id]===s ? 'var(--gold)' : 'rgba(245,240,232,.1)'}`,cursor:'pointer'}}>{s}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {isOn && (
                        <div style={{padding:'6px 4px',display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontSize:9,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase'}}>Qty</span>
                          <button onClick={(e)=>{e.stopPropagation(); setCartExtraQty(prev=>({...prev,[p.id]: Math.max(1,(prev[p.id]||1)-1)}))}} style={{width:22,height:22,fontSize:13,background:'#1a1a1a',border:'1px solid rgba(245,240,232,.15)',color:'var(--cream)',cursor:'pointer'}}>-</button>
                          <span style={{fontSize:12,minWidth:18,textAlign:'center'}}>{cartExtraQty[p.id]||1}</span>
                          <button onClick={(e)=>{e.stopPropagation(); setCartExtraQty(prev=>({...prev,[p.id]: Math.min(10,(prev[p.id]||1)+1)}))}} style={{width:22,height:22,fontSize:13,background:'#1a1a1a',border:'1px solid rgba(245,240,232,.15)',color:'var(--cream)',cursor:'pointer'}}>+</button>
                        </div>
                      )}
                      {isOn && cart.filter(ci => ci.productId === p.id).reduce((a,ci)=>a+ci.quantity,0) > 0 && (
                        <div style={{margin:'0 4px 4px',fontSize:9,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--gold)',textAlign:'center',opacity:.85}}>
                          In Cart · {cart.filter(ci => ci.productId === p.id).reduce((a,ci)=>a+ci.quantity,0)}
                        </div>
                      )}
                      {isOn && (
                        <button onClick={(e)=>{ e.stopPropagation(); if(!picked) return; const sz=cartExtraSizes[p.id]||''; const cl=cartExtraColors[p.id]||''; const vk=[cl,sz].filter(Boolean).join(' / '); const qty=cartExtraQty[p.id]||1; const ts=Date.now(); addItem({lineId:`${p.id}_${ts}`,productId:p.id,productName:p.name,variantKey:vk,variantId:(p as any).printifyVariantId,blueprintId:(p as any).printifyBlueprintId,quantity:qty,unitPrice:p.price,portraitUrl:picked.url,styleName:picked.styleName,category:p.category,addedAt:ts}); setCartExtraQty(prev=>({...prev,[p.id]:1})); setJustAddedId(p.id); setTimeout(()=>setJustAddedId(cur => cur === p.id ? null : cur), 1400); }}
                          style={{margin:'4px 4px 8px',padding:'8px 10px',fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',background: justAddedId === p.id ? 'var(--gold)' : 'rgba(201,168,76,.12)',border:'1px solid var(--gold)',color: justAddedId === p.id ? 'var(--ink)' : 'var(--gold)',cursor:'pointer',width:'calc(100% - 8px)',transition:'all .18s',transform: justAddedId === p.id ? 'scale(.97)' : 'scale(1)'}}>
                          {justAddedId === p.id ? '✓ Added to Cart' : (cart.some(ci => ci.productId === p.id) ? '+ Add Another' : '+ Add to Cart')}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* [C4f] Cart is the single source of truth — View Cart routes to /cart */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 2.5fr',gap:3,marginBottom:20}}>
              <button className="btn-out" onClick={()=>setStep('gallery')}>← Back</button>
              <button
                className="btn-gold"
                onClick={()=>{ if (cart.length > 0 && songGenre) window.location.href = '/cart' }}
                disabled={cart.length === 0 || !songGenre}
              >
                {cart.length === 0
                  ? 'Add an item above to continue'
                  : !songGenre
                    ? 'Pick a music genre to continue'
                    : `View Cart (${cart.length}) →`}
              </button>
            </div>

            <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap',marginTop:20}}>
              {['🔒 Secure checkout','📦 Ships 5–7 days','✓ Satisfaction guarantee'].map(t=>(
                <span key={t} style={{fontSize:10,color:'var(--muted)',letterSpacing:'.04em'}}>{t}</span>
              ))}
            </div>

            {/* Subtle signature/bespoke mention at the bottom */}
            <div style={{textAlign:'center',marginTop:40,paddingTop:28,borderTop:'1px solid rgba(245,240,232,.06)',fontSize:11,color:'var(--muted)',lineHeight:1.7}}>
              Want a fully custom portrait? Work 1-on-1 with one of our artists — <Link href="/bespoke" style={{color:'var(--gold)',textDecoration:'underline'}}>$49 upcharge →</Link>
            </div>
          </div>
        )}
      </div>

      {/* ── NEW STYLE PICKER MODAL ── */}
      {showStylePicker && (
        <div onClick={()=>setShowStylePicker(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20,cursor:'pointer'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#141414',border:'1px solid rgba(201,168,76,.2)',maxWidth:720,width:'100%',maxHeight:'85vh',overflow:'auto',cursor:'default',padding:32}}>
            <div style={{fontSize:10,letterSpacing:'.3em',textTransform:'uppercase',color:'var(--gold)',marginBottom:10}}>Add Another Style</div>
            <h3 className="serif" style={{fontSize:28,fontWeight:400,marginBottom:6}}>Pick one more style</h3>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:24}}>We'll generate 1 portrait in this style. {GEN_LIMITS.MAX_TOTAL - totalGenerated} left in your session.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {availableNewStyles.map(s => (
                <button key={s.id} onClick={()=>{ setShowStylePicker(false); handleExpandStyle(s.id, `${s.emoji} ${s.name}`) }}
                  className="style-toggle" style={{padding:0,cursor:'pointer'}}>
                  <div className="style-img-wrap" style={{width:'100%',aspectRatio:'2/3',overflow:'hidden',position:'relative'}}>
                    {s.styleImage
                      ? <img src={s.styleImage} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      : <div style={{width:'100%',height:'100%',background:s.styleBg||'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:34}}>{s.emoji}</div>
                    }
                    <div className="style-caption">
                      <div className="style-caption-name">{s.emoji} {s.name}</div>
                      {s.description && <div className="style-caption-desc">{s.description}</div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowStylePicker(false)} style={{marginTop:20,background:'transparent',border:'1px solid var(--border)',color:'var(--muted)',padding:'10px 20px',fontSize:11,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',width:'100%'}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{position: 'fixed',inset: 0,background: 'rgba(0,0,0,.95)',zIndex: 9999,display: 'flex',flexDirection: 'column',alignItems: 'center',justifyContent: 'center',cursor: 'pointer',padding: 20}}>
          <button onClick={() => setLightboxImg(null)} style={{position: 'absolute',top: 20,right: 20,background: 'rgba(255,255,255,.1)',border: 'none',color: '#fff',width: 44,height: 44,borderRadius: '50%',cursor: 'pointer',fontSize: 20,display: 'flex',alignItems: 'center',justifyContent: 'center'}}>✕</button>
          <div style={{position: 'absolute',top: 24,left: 24,color: 'var(--gold)',fontSize: 12,letterSpacing: '.2em',textTransform: 'uppercase'}}>{lightboxImg.styleName}</div>
          <img src={lightboxImg.url} alt={lightboxImg.styleName} onClick={(e) => e.stopPropagation()} style={{maxWidth: '90vw',maxHeight: '85vh',objectFit: 'contain',cursor: 'default',boxShadow: '0 20px 60px rgba(0,0,0,.5)'}}/>
          <div style={{position: 'absolute',bottom: 'calc(7.5vh + 20px)',right: 'calc(5vw + 16px)',background: 'rgba(0,0,0,.6)',color: 'var(--gold)',fontSize: 11,padding: '6px 12px',borderRadius: 4,pointerEvents: 'none'}}>© petprintsstudio.com</div>
          <button onClick={(e) => { e.stopPropagation(); const img = generated.find(g => g.url === lightboxImg.url); if (img) setPicked(img); setLightboxImg(null) }}
            style={{marginTop: 20,background: 'var(--gold)',color: 'var(--ink)',border: 'none',padding: '14px 36px',fontSize: 12,fontWeight: 600,letterSpacing: '.1em',textTransform: 'uppercase',cursor: 'pointer'}}
          >Select This Portrait</button>
          <div style={{marginTop:12,fontSize:11,color:'rgba(255,255,255,.4)'}}>Click anywhere to close</div>
        </div>
      )}

      {/* ── PRODUCT DETAIL MODAL ── */}
      {productDetail && (
        <div onClick={()=>setProductDetail(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',backdropFilter:'blur(12px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20,cursor:'pointer'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#141414',border:'1px solid rgba(201,168,76,.2)',maxWidth:480,width:'100%',overflow:'hidden',cursor:'default'}}>
            {PRODUCT_IMAGES[productDetail.id] && <img src={PRODUCT_IMAGES[productDetail.id]} alt={productDetail.name} style={{width:'100%',aspectRatio:'1',objectFit:'cover',display:'block'}} />}
            <div style={{padding:'24px 28px'}}>
              <div style={{fontSize:9,letterSpacing:'.25em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>{productDetail.category}</div>
              <h3 className="serif" style={{fontSize:24,fontWeight:400,marginBottom:4}}>{productDetail.name}</h3>
              <div style={{fontSize:13,color:'var(--muted)',marginBottom:12}}>{productDetail.size}</div>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.8,marginBottom:20}}>{productDetail.description}</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span className="serif" style={{fontSize:28,color:'var(--gold)'}}>${productDetail.price}</span>
                <button onClick={()=>{ setCartExtras(prev=>prev.includes(productDetail.id)?prev:[...prev, productDetail.id]); setProductDetail(null) }}
                  style={{background:'var(--gold)',color:'var(--ink)',padding:'12px 28px',fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',border:'none',cursor:'pointer'}}>
                  {cartExtras.includes(productDetail.id) ? '✓ Added' : 'Add to Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
