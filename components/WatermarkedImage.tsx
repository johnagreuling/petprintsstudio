'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  width?: number
  height?: number
  displayRatio?: string
  highRes?: boolean // Render at higher resolution for better quality
}

export default function WatermarkedImage({ src, alt, className, style, onClick, width = 400, height, displayRatio, highRes = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  // Use 2x resolution for high-res mode (sharper on retina displays)
  const scale = highRes ? 2 : 1
  const renderWidth = width * scale
  const canvasH = height ?? Math.round(width * 1.5)
  const renderHeight = canvasH * scale

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setLoaded(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = renderWidth
      canvas.height = renderHeight
      ctx.fillStyle = '#141414'
      ctx.fillRect(0, 0, renderWidth, renderHeight)
      
      // Calculate cover fit
      const imgRatio = img.naturalWidth / img.naturalHeight
      const canvasRatio = renderWidth / renderHeight
      let drawW = renderWidth, drawH = renderHeight, drawX = 0, drawY = 0
      if (imgRatio > canvasRatio) {
        drawH = renderHeight; drawW = drawH * imgRatio; drawX = (renderWidth - drawW) / 2
      } else {
        drawW = renderWidth; drawH = drawW / imgRatio; drawY = 0
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
      
      // Small corner watermark (bottom-right)
      const padding = Math.round(renderWidth * 0.03)
      const fontSize = Math.round(renderWidth * 0.025)
      const text = '© petprintsstudio.com'
      
      ctx.save()
      ctx.font = `600 ${fontSize}px Arial, sans-serif`
      const textWidth = ctx.measureText(text).width
      const textHeight = fontSize
      
      // Semi-transparent background pill
      const pillPadX = fontSize * 0.5
      const pillPadY = fontSize * 0.3
      const pillX = renderWidth - textWidth - padding - pillPadX * 2
      const pillY = renderHeight - textHeight - padding - pillPadY * 2
      
      ctx.globalAlpha = 0.6
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      const radius = fontSize * 0.3
      ctx.roundRect(pillX, pillY, textWidth + pillPadX * 2, textHeight + pillPadY * 2, radius)
      ctx.fill()
      
      // Watermark text
      ctx.globalAlpha = 0.85
      ctx.fillStyle = '#C9A84C'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText(text, renderWidth - padding - pillPadX, renderHeight - padding - pillPadY)
      ctx.restore()
      
      setLoaded(true)
    }
    img.onerror = () => { ctx.fillStyle = '#141414'; ctx.fillRect(0, 0, renderWidth, renderHeight); setLoaded(true) }
    img.src = src
  }, [src, renderWidth, renderHeight])

  const ar = displayRatio || `${width}/${canvasH}`
  return (
    <>
      <div style={{...style, width:'100%', aspectRatio:ar, background:'#141414', display:loaded?'none':'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{width:24,height:24,border:'2px solid rgba(201,168,76,.25)',borderTopColor:'#C9A84C',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      </div>
      <canvas ref={canvasRef} className={className} style={{...style,width:'100%',aspectRatio:ar,objectFit:'cover',objectPosition:'center top',display:loaded?'block':'none'}} onClick={onClick} title={alt} width={renderWidth} height={renderHeight}/>
    </>
  )
}
