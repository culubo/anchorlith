'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface DrawingPadProps {
  onSave: (dataUrl: string) => void
  onClose: () => void
}

export default function DrawingPad({ onSave, onClose }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [strokes, setStrokes] = useState<string[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = Math.min(window.innerWidth - 40, 800)
    canvas.height = 400
    const c = canvas.getContext('2d')
    if (!c) return
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.lineWidth = 3
    c.strokeStyle = '#111827'
    setCtx(c)
  }, [])

  useEffect(() => {
    // redraw strokes from data urls
    const canvas = canvasRef.current
    const c = ctx
    if (!canvas || !c) return
    c.clearRect(0, 0, canvas.width, canvas.height)
    strokes.forEach((d) => {
      const img = new Image()
      img.src = d
      img.onload = () => c.drawImage(img, 0, 0)
    })
  }, [strokes, ctx])

  const pointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    const c = ctx
    if (!canvas || !c) return
    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    // Use proper coordinate calculation without offset
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    c.beginPath()
    c.moveTo(x, y)
  }

  const pointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const c = ctx
    if (!canvas || !c) return
    const rect = canvas.getBoundingClientRect()
    // Use proper coordinate calculation without offset
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    c.lineTo(x, y)
    c.stroke()
  }

  const pointerUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    setStrokes(prev => [...prev, dataUrl])
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const c = ctx
    if (!canvas || !c) return
    c.clearRect(0, 0, canvas.width, canvas.height)
    setStrokes([])
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL('image/png'))
    onClose()
  }

  return (
    <div className="p-4 bg-bg-secondary rounded shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={handleClear} variant="ghost" className="text-sm">Clear</Button>
          <Button onClick={onClose} variant="ghost" className="text-sm">Cancel</Button>
        </div>
        <Button onClick={handleSave} className="text-sm">Done</Button>
      </div>
      <div className="border border-border-subtle rounded overflow-hidden bg-white" style={{ padding: 0, margin: 0 }}>
        <canvas
          ref={canvasRef}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerLeave={pointerUp}
          className="w-full touch-none block"
          style={{ display: 'block', margin: 0, padding: 0 }}
        />
      </div>
      <p className="mt-2 text-xs text-text-secondary">
        Draw with mouse or touch. Click &quot;Done&quot; to insert the image into your note.
      </p>
    </div>
  )
}
