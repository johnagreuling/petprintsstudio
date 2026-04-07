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
}

export default function WatermarkedImage({ src, alt, className, style, onClick, width = 400, height, displayRatio }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  const canvasH = height ?? Math.round(width * 1.5)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setLoaded(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = width
      canvas.height = canvasH
      ctx.fillStyle = '#141414'
      ctx.fillRect(0, 0, width, canvasH)
      const imgRatio = img.naturalWidth / img.naturalHeight
      const canvasRatio = width / canvasH
      let drawW = width, drawH = canvasH, drawX = 0, drawY = 0
      if (imgRatio > canvasRatio) {
        drawH = canvasH; drawW = drawH * imgRatio; drawX = (width - drawW) / 2
      } else {
        drawW = width; drawH = drawW / imgRatio; drawY = 0
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
      ctx.save()
      ctx.globalAlpha = 0.13
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${Math.round(width * 0.036)}px Arial, sans-serif`
      ctx.textAlign = 'center'
      const text = 'PET PRINTS STUDIO'
      const spacingX = width * 0.45
      const spacingY = canvasH * 0.17
      ctx.translate(width / 2, canvasH / 2)
      ctx.rotate(-Math.PI / 6)
      for (let y = -canvasH; y < canvasH * 1.5; y += spacingY) {
        for (let x = -width * 1.5; x < width * 1.5; x += spacingX) {
          ctx.fillText(text, x, y)
        }
      }
      ctx.restore()
      const bh = Math.round(canvasH * 0.06)
      const grad = ctx.createLinearGradient(0, canvasH - bh * 1.5, 0, canvasH)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(0.4, 'rgba(0,0,0,0.72)')
      grad.addColorStop(1, 'rgba(0,0,0,0.88)')
      ctx.fillStyle = grad
      ctx.fillRect(0, canvasH - bh * 1.5, width, bh * 1.5)
      ctx.fillStyle = 'rgba(201,168,76,0.92)'
      ctx.font = `bold ${Math.round(width * 0.024)}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('\u00a9 PET PRINTS STUDIO  \u00b7  petprintsstudio.com', width / 2, canvasH - Math.round(bh * 0.25))
      setLoaded(true)
    }
    img.onerror = () => { ctx.fillStyle = '#141414'; ctx.fillRect(0, 0, width, canvasH); setLoaded(true) }
    img.src = src
  }, [src, width, canvasH])

  const ar = displayRatio || `${width}/${canvasH}`
  return (
    <>
      <div style={{...style, width:'100%', aspectRatio:ar, background:'#141414', display:loaded?'none':'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{width:24,height:24,border:'2px solid rgba(201,168,76,.25)',borderTopColor:'#C9A84C',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      </div>
      <canvas ref={canvasRef} className={className} style={{...style,width:'100%',aspectRatio:ar,objectFit:'cover',objectPosition:'center top',display:loaded?'block':'none'}} onClick={onClick} title={alt} width={width} height={canvasH}/>
    </>
  )
}
