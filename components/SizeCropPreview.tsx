'use client'
import { useEffect, useRef } from 'react'

const SIZE_RATIOS: Record<string, {w: number, h: number}> = {
  '8x10':  {w: 8,  h: 10},
  '11x14': {w: 11, h: 14},
  '12x16': {w: 12, h: 16},
  '16x20': {w: 16, h: 20},
  '18x24': {w: 18, h: 24},
  '20x30': {w: 20, h: 30},
  '24x36': {w: 24, h: 36},
}

interface Props {
  imageUrl: string
  sizeKey: string
  displayWidth?: number
}

export default function SizeCropPreview({ imageUrl, sizeKey, displayWidth = 280 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ratio = SIZE_RATIOS[sizeKey] || {w: 2, h: 3}
  const displayHeight = Math.round(displayWidth * ratio.h / ratio.w)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = displayWidth
    canvas.height = displayHeight

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const srcW = img.naturalWidth
      const srcH = img.naturalHeight
      const targetRatio = ratio.w / ratio.h
      const srcRatio = srcW / srcH

      let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH

      if (srcRatio > targetRatio) {
        cropH = srcH
        cropW = Math.round(srcH * targetRatio)
        cropX = Math.round((srcW - cropW) / 2)
      } else {
        cropW = srcW
        cropH = Math.round(srcW / targetRatio)
        cropY = 0
      }

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, displayWidth, displayHeight)

      // Size label
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, displayHeight - 28, displayWidth, 28)
      ctx.fillStyle = '#C9A84C'
      ctx.font = `bold ${Math.round(displayWidth * 0.045)}px Arial, sans-serif`
      ctx.textAlign = 'center'
      const isFull = ratio.w === 2 && ratio.h === 3
      ctx.fillText(`${sizeKey}"${isFull ? ' ✓ Full portrait' : ''}`, displayWidth / 2, displayHeight - 10)
    }
    img.src = imageUrl
  }, [imageUrl, sizeKey, displayWidth, displayHeight, ratio])

  return (
    <canvas
      ref={canvasRef}
      width={displayWidth}
      height={displayHeight}
      style={{width: '100%', display: 'block', aspectRatio: `${ratio.w}/${ratio.h}`}}
    />
  )
}
