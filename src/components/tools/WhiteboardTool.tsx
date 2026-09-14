import type { PointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

const COLORS = ['#1f2937', '#dc2626', '#2563eb', '#16a34a', '#ca8a04']

export function WhiteboardTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(4)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = 360 * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = '360px'
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, rect.width, 360)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const pos = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const onUp = () => {
    drawing.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, 360)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`색 ${c}`}
            className="h-8 w-8 rounded-full border-2 border-border"
            style={{
              backgroundColor: c,
              outline: color === c ? '2px solid var(--color-primary, #16a34a)' : undefined,
              outlineOffset: 2,
            }}
            onClick={() => setColor(c)}
          />
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
          굵기
          <input
            type="range"
            min={2}
            max={16}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          지우기
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <canvas
          ref={canvasRef}
          className="touch-none w-full cursor-crosshair bg-white"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        />
      </div>
    </div>
  )
}
