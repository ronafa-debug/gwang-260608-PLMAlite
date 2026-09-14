import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Circle,
  ClipboardCopy,
  CopyPlus,
  Download,
  Eraser,
  Flashlight,
  Focus,
  Grid3x3,
  Highlighter,
  Minus,
  Paintbrush,
  PenLine,
  Plus,
  Redo2,
  Square,
  StickyNote,
  TextCursorInput,
  Trash2,
  Type,
  Undo2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStudents } from '@/hooks/useStudents'
import { cn } from '@/lib/utils'
import {
  drawEmojiStamp,
  drawStudentStamp,
  loadStampImage,
  resolveStudentPhotoUrl,
  type StampChoice,
} from '@/components/tools/whiteboardStamp'

const COLORS = ['#1f2937', '#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#ffffff']
const CANVAS_H = 420
const MAX_HISTORY = 40
const STAMPS = ['👍', '⭐', '❤️', '👏', '😊', '✅', '🔥', '💡', '🎯', '📝']

type DrawTool =
  | 'pen'
  | 'marker'
  | 'highlighter'
  | 'eraser'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'arrow'
  | 'text'
  | 'stamp'
  | 'student'
  | 'laser'
  | 'spotlight'

type BgStyle = 'blank' | 'grid' | 'lined'

type PageData = {
  ink: string
  undo: string[]
  redo: string[]
}

const DRAW_TOOLS: Array<{ id: DrawTool; label: string; icon: typeof PenLine }> = [
  { id: 'pen', label: '펜', icon: PenLine },
  { id: 'marker', label: '마커', icon: Paintbrush },
  { id: 'highlighter', label: '형광펜', icon: Highlighter },
  { id: 'eraser', label: '지우개', icon: Eraser },
  { id: 'line', label: '선', icon: Minus },
  { id: 'rect', label: '사각', icon: Square },
  { id: 'ellipse', label: '원', icon: Circle },
  { id: 'arrow', label: '화살표', icon: ArrowRight },
  { id: 'text', label: '글자', icon: Type },
  { id: 'stamp', label: '스탬프', icon: StickyNote },
  { id: 'student', label: '학생', icon: Users },
  { id: 'laser', label: '레이저', icon: Flashlight },
  { id: 'spotlight', label: '스포트', icon: Focus },
]

function emptyPage(): PageData {
  return { ink: '', undo: [], redo: [] }
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, style: BgStyle) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  if (style === 'grid') {
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let x = 24; x < w; x += 24) {
      ctx.beginPath()
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, h)
      ctx.stroke()
    }
    for (let y = 24; y < h; y += 24) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(w, y + 0.5)
      ctx.stroke()
    }
  } else if (style === 'lined') {
    ctx.strokeStyle = '#dbeafe'
    ctx.lineWidth = 1
    for (let y = 28; y < h; y += 28) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(w, y + 0.5)
      ctx.stroke()
    }
    ctx.strokeStyle = '#fecaca'
    ctx.beginPath()
    ctx.moveTo(48.5, 0)
    ctx.lineTo(48.5, h)
    ctx.stroke()
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const head = 14
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) {
      resolve(null)
      return
    }
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export function WhiteboardTool() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)

  const sizeRef = useRef({ w: 640, h: CANVAS_H, dpr: 1 })
  const pagesRef = useRef<PageData[]>([emptyPage()])
  const pageIndexRef = useRef(0)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const shapeStart = useRef<{ x: number; y: number } | null>(null)
  const laserPos = useRef<{ x: number; y: number } | null>(null)
  const spotlightPos = useRef<{ x: number; y: number } | null>(null)
  const animRef = useRef<number | null>(null)
  const readyRef = useRef(false)

  const [tool, setTool] = useState<DrawTool>('pen')
  const [color, setColor] = useState(COLORS[0])
  const [penSize, setPenSize] = useState(4)
  const [eraserSize, setEraserSize] = useState(24)
  const [bg, setBg] = useState<BgStyle>('blank')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [stamp, setStamp] = useState<StampChoice>({ kind: 'emoji', value: STAMPS[0] })
  const [showStudentName, setShowStudentName] = useState(true)
  const [textDraft, setTextDraft] = useState('')
  const [textSize, setTextSize] = useState(22)
  const [status, setStatus] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const { students } = useStudents()

  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const penSizeRef = useRef(penSize)
  const eraserSizeRef = useRef(eraserSize)
  const stampRef = useRef(stamp)
  const showStudentNameRef = useRef(showStudentName)
  const textDraftRef = useRef(textDraft)
  const textSizeRef = useRef(textSize)
  const bgRefState = useRef(bg)

  useEffect(() => {
    toolRef.current = tool
  }, [tool])
  useEffect(() => {
    colorRef.current = color
  }, [color])
  useEffect(() => {
    penSizeRef.current = penSize
  }, [penSize])
  useEffect(() => {
    eraserSizeRef.current = eraserSize
  }, [eraserSize])
  useEffect(() => {
    stampRef.current = stamp
  }, [stamp])
  useEffect(() => {
    showStudentNameRef.current = showStudentName
  }, [showStudentName])
  useEffect(() => {
    textDraftRef.current = textDraft
  }, [textDraft])
  useEffect(() => {
    textSizeRef.current = textSize
  }, [textSize])
  useEffect(() => {
    bgRefState.current = bg
  }, [bg])

  const syncFlags = useCallback(() => {
    const p = pagesRef.current[pageIndexRef.current]
    setCanUndo((p?.undo.length ?? 0) > 0)
    setCanRedo((p?.redo.length ?? 0) > 0)
  }, [])

  const exportInk = useCallback(() => {
    const canvas = inkRef.current
    if (!canvas) return ''
    return canvas.toDataURL('image/png')
  }, [])

  const clearInk = useCallback(() => {
    const canvas = inkRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { w, h, dpr } = sizeRef.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
  }, [])

  const paintBg = useCallback(() => {
    const canvas = bgRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { w, h, dpr } = sizeRef.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawBackground(ctx, w, h, bgRefState.current)
  }, [])

  const clearOverlay = useCallback(() => {
    const canvas = overlayRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { w, h, dpr } = sizeRef.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
  }, [])

  const loadInk = useCallback(
    async (dataUrl: string) => {
      clearInk()
      const img = await loadImage(dataUrl)
      if (!img) return
      const ctx = inkRef.current?.getContext('2d')
      if (!ctx) return
      const { w, h, dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.drawImage(img, 0, 0, w, h)
    },
    [clearInk],
  )

  const persistCurrentPageInk = useCallback(() => {
    const idx = pageIndexRef.current
    const pages = pagesRef.current
    if (!pages[idx]) return
    pages[idx] = { ...pages[idx], ink: exportInk() }
  }, [exportInk])

  const commitEdit = useCallback(() => {
    const idx = pageIndexRef.current
    const pages = pagesRef.current
    const cur = pages[idx]
    if (!cur) return
    const nextInk = exportInk()
    pages[idx] = {
      ink: nextInk,
      undo: [...cur.undo, cur.ink].slice(-MAX_HISTORY),
      redo: [],
    }
    syncFlags()
  }, [exportInk, syncFlags])

  const resizeCanvases = useCallback(async () => {
    const wrap = wrapRef.current
    if (!wrap) return
    const prevInk = readyRef.current ? exportInk() : pagesRef.current[pageIndexRef.current]?.ink ?? ''
    const rect = wrap.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const w = Math.max(1, Math.floor(rect.width))
    const h = CANVAS_H
    sizeRef.current = { w, h, dpr }

    for (const ref of [bgRef, inkRef, overlayRef]) {
      const c = ref.current
      if (!c) continue
      c.width = Math.floor(w * dpr)
      c.height = Math.floor(h * dpr)
      c.style.width = `${w}px`
      c.style.height = `${h}px`
    }
    paintBg()
    await loadInk(prevInk)
    readyRef.current = true
    syncFlags()
  }, [exportInk, loadInk, paintBg, syncFlags])

  useEffect(() => {
    void resizeCanvases()
    const onResize = () => void resizeCanvases()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [resizeCanvases])

  useEffect(() => {
    paintBg()
  }, [bg, paintBg])

  const paintLiveOverlay = useCallback(() => {
    const canvas = overlayRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { w, h, dpr } = sizeRef.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const t = toolRef.current

    if (t === 'spotlight' && spotlightPos.current) {
      const { x, y } = spotlightPos.current
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 90, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 90, 0, Math.PI * 2)
      ctx.stroke()
    }

    if (t === 'laser' && laserPos.current) {
      const { x, y } = laserPos.current
      const g = ctx.createRadialGradient(x, y, 0, x, y, 18)
      g.addColorStop(0, 'rgba(239,68,68,0.95)')
      g.addColorStop(0.45, 'rgba(239,68,68,0.45)')
      g.addColorStop(1, 'rgba(239,68,68,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, 18, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  useEffect(() => {
    if (tool !== 'laser' && tool !== 'spotlight') {
      laserPos.current = null
      spotlightPos.current = null
      clearOverlay()
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }
    const tick = () => {
      paintLiveOverlay()
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [tool, clearOverlay, paintLiveOverlay])

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const applyBrush = (ctx: CanvasRenderingContext2D, t: DrawTool) => {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (t === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.globalAlpha = 1
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = eraserSizeRef.current
      return
    }
    ctx.globalCompositeOperation = 'source-over'
    const c = colorRef.current
    const ps = penSizeRef.current
    if (t === 'highlighter') {
      ctx.globalAlpha = 0.35
      ctx.lineWidth = Math.max(ps * 3, 12)
      ctx.strokeStyle = c === '#ffffff' ? '#fde047' : c
      return
    }
    if (t === 'marker') {
      ctx.globalAlpha = 0.85
      ctx.lineWidth = Math.max(ps * 1.8, 6)
      ctx.strokeStyle = c
      return
    }
    ctx.globalAlpha = 1
    ctx.lineWidth = ps
    ctx.strokeStyle = c
    ctx.fillStyle = c
  }

  const strokeShape = (
    ctx: CanvasRenderingContext2D,
    t: DrawTool,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => {
    const c = colorRef.current
    const ps = penSizeRef.current
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.strokeStyle = c
    ctx.fillStyle = c
    ctx.lineWidth = ps
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (t === 'line') {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    } else if (t === 'rect') {
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    } else if (t === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        Math.abs(x2 - x1) / 2 || 0.5,
        Math.abs(y2 - y1) / 2 || 0.5,
        0,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
    } else if (t === 'arrow') {
      drawArrow(ctx, x1, y1, x2, y2)
    }
  }

  const isFreehand = (t: DrawTool) =>
    t === 'pen' || t === 'marker' || t === 'highlighter' || t === 'eraser'
  const isShape = (t: DrawTool) =>
    t === 'line' || t === 'rect' || t === 'ellipse' || t === 'arrow'

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = pos(e)
    const t = toolRef.current
    overlayRef.current?.setPointerCapture(e.pointerId)

    if (t === 'laser') {
      laserPos.current = { x, y }
      return
    }
    if (t === 'spotlight') {
      spotlightPos.current = { x, y }
      return
    }
    if (t === 'text') {
      const content = textDraftRef.current.trim()
      if (!content) {
        setStatus('위에 글자를 입력한 뒤 보드를 클릭하세요.')
        return
      }
      const ctx = inkRef.current?.getContext('2d')
      if (!ctx) return
      const { dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle = colorRef.current
      ctx.font = `600 ${textSizeRef.current}px Pretendard, "Noto Sans KR", sans-serif`
      ctx.textBaseline = 'top'
      ctx.fillText(content, x, y)
      commitEdit()
      setStatus(null)
      return
    }
    if (t === 'stamp') {
      const choice = stampRef.current
      const emoji = choice.kind === 'emoji' ? choice.value : STAMPS[0]
      const ctx = inkRef.current?.getContext('2d')
      if (!ctx) return
      const { dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawEmojiStamp(ctx, emoji, x, y, textSizeRef.current)
      commitEdit()
      return
    }
    if (t === 'student') {
      const choice = stampRef.current
      if (choice.kind !== 'student') {
        setStatus('아래 목록에서 학생을 선택한 뒤 보드를 클릭하세요.')
        return
      }
      void (async () => {
        const radius = Math.max(22, textSizeRef.current * 1.15)
        const photo = choice.photoUrl ? await loadStampImage(choice.photoUrl) : null
        const inkCtx = inkRef.current?.getContext('2d')
        if (!inkCtx) return
        const sz = sizeRef.current
        inkCtx.setTransform(sz.dpr, 0, 0, sz.dpr, 0, 0)
        drawStudentStamp(inkCtx, {
          cx: x,
          cy: y,
          radius,
          name: choice.name,
          photo,
          showName: showStudentNameRef.current,
        })
        commitEdit()
        setStatus(null)
      })()
      return
    }
    if (isShape(t)) {
      drawing.current = true
      shapeStart.current = { x, y }
      return
    }
    if (isFreehand(t)) {
      drawing.current = true
      lastPoint.current = { x, y }
      const ctx = inkRef.current?.getContext('2d')
      if (!ctx) return
      const { dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      applyBrush(ctx, t)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 0.01, y)
      ctx.stroke()
    }
  }

  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = pos(e)
    const t = toolRef.current
    if (t === 'laser') {
      laserPos.current = { x, y }
      return
    }
    if (t === 'spotlight') {
      spotlightPos.current = { x, y }
      return
    }
    if (!drawing.current) return
    if (isShape(t) && shapeStart.current) {
      const ctx = overlayRef.current?.getContext('2d')
      if (!ctx) return
      const { w, h, dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      strokeShape(ctx, t, shapeStart.current.x, shapeStart.current.y, x, y)
      return
    }
    if (isFreehand(t)) {
      const ctx = inkRef.current?.getContext('2d')
      if (!ctx) return
      const { dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      applyBrush(ctx, t)
      const prev = lastPoint.current
      ctx.beginPath()
      if (prev) ctx.moveTo(prev.x, prev.y)
      else ctx.moveTo(x, y)
      ctx.lineTo(x, y)
      ctx.stroke()
      lastPoint.current = { x, y }
    }
  }

  const onUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const t = toolRef.current
    if (t === 'laser' || t === 'spotlight') return

    if (isShape(t) && drawing.current && shapeStart.current) {
      const { x, y } = pos(e)
      const ctx = inkRef.current?.getContext('2d')
      if (ctx) {
        const { dpr } = sizeRef.current
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        strokeShape(ctx, t, shapeStart.current.x, shapeStart.current.y, x, y)
        commitEdit()
      }
      clearOverlay()
      shapeStart.current = null
      drawing.current = false
      return
    }

    if (isFreehand(t) && drawing.current) {
      drawing.current = false
      lastPoint.current = null
      const ctx = inkRef.current?.getContext('2d')
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
      commitEdit()
    }
    drawing.current = false
  }

  const goToPage = async (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= pagesRef.current.length) return
    persistCurrentPageInk()
    pageIndexRef.current = nextIndex
    setPageIndex(nextIndex)
    await loadInk(pagesRef.current[nextIndex]?.ink ?? '')
    syncFlags()
    clearOverlay()
  }

  const undo = async () => {
    const idx = pageIndexRef.current
    const cur = pagesRef.current[idx]
    if (!cur || cur.undo.length === 0) return
    const prev = cur.undo[cur.undo.length - 1]
    const now = exportInk()
    pagesRef.current[idx] = {
      ink: prev,
      undo: cur.undo.slice(0, -1),
      redo: [...cur.redo, now].slice(-MAX_HISTORY),
    }
    await loadInk(prev)
    syncFlags()
  }

  const redo = async () => {
    const idx = pageIndexRef.current
    const cur = pagesRef.current[idx]
    if (!cur || cur.redo.length === 0) return
    const nextInk = cur.redo[cur.redo.length - 1]
    const now = exportInk()
    pagesRef.current[idx] = {
      ink: nextInk,
      undo: [...cur.undo, now].slice(-MAX_HISTORY),
      redo: cur.redo.slice(0, -1),
    }
    await loadInk(nextInk)
    syncFlags()
  }

  const clearAll = () => {
    clearInk()
    commitEdit()
  }

  const compositeExport = async (): Promise<Blob | null> => {
    const { w, h } = sizeRef.current
    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const ctx = off.getContext('2d')
    if (!ctx) return null
    drawBackground(ctx, w, h, bgRefState.current)
    const ink = inkRef.current
    if (ink) ctx.drawImage(ink, 0, 0, w, h)
    return new Promise((resolve) => off.toBlob((b) => resolve(b), 'image/png'))
  }

  const downloadPng = async () => {
    const blob = await compositeExport()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plma-whiteboard-p${pageIndexRef.current + 1}.png`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('이미지를 저장했습니다.')
  }

  const copyPng = async () => {
    try {
      const blob = await compositeExport()
      if (!blob) return
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setStatus('클립보드에 복사했습니다.')
    } catch {
      setStatus('이 브라우저에서는 이미지 복사가 제한될 수 있습니다. PNG 저장을 이용해 주세요.')
    }
  }

  const addPage = async () => {
    persistCurrentPageInk()
    pagesRef.current = [...pagesRef.current, emptyPage()]
    const next = pagesRef.current.length - 1
    pageIndexRef.current = next
    setPageCount(pagesRef.current.length)
    setPageIndex(next)
    await loadInk('')
    syncFlags()
  }

  const duplicatePage = async () => {
    persistCurrentPageInk()
    const ink = pagesRef.current[pageIndexRef.current]?.ink ?? exportInk()
    const copy: PageData = { ink, undo: [], redo: [] }
    const insertAt = pageIndexRef.current + 1
    pagesRef.current = [
      ...pagesRef.current.slice(0, insertAt),
      copy,
      ...pagesRef.current.slice(insertAt),
    ]
    pageIndexRef.current = insertAt
    setPageCount(pagesRef.current.length)
    setPageIndex(insertAt)
    await loadInk(ink)
    syncFlags()
  }

  const deletePage = async () => {
    if (pagesRef.current.length <= 1) {
      clearAll()
      return
    }
    persistCurrentPageInk()
    const idx = pageIndexRef.current
    pagesRef.current = pagesRef.current.filter((_, i) => i !== idx)
    const next = Math.min(idx, pagesRef.current.length - 1)
    pageIndexRef.current = next
    setPageCount(pagesRef.current.length)
    setPageIndex(next)
    await loadInk(pagesRef.current[next]?.ink ?? '')
    syncFlags()
  }

  const sizeValue = tool === 'eraser' ? eraserSize : penSize
  const sizeMin = tool === 'eraser' ? 8 : 2
  const sizeMax = tool === 'eraser' ? 64 : 20
  const showColor =
    tool !== 'eraser' &&
    tool !== 'laser' &&
    tool !== 'spotlight' &&
    tool !== 'stamp' &&
    tool !== 'student'
  const showSize =
    tool === 'pen' ||
    tool === 'marker' ||
    tool === 'highlighter' ||
    tool === 'eraser' ||
    isShape(tool)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          페이지 {pageIndex + 1} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageIndex <= 0}
          onClick={() => void goToPage(pageIndex - 1)}
        >
          이전
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => void goToPage(pageIndex + 1)}
        >
          다음
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void addPage()}>
          <Plus className="h-4 w-4" />
          새 페이지
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void duplicatePage()}>
          <CopyPlus className="h-4 w-4" />
          복제
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void deletePage()}>
          <Trash2 className="h-4 w-4" />
          페이지 삭제
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {DRAW_TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTool(id)
              setStatus(null)
              clearOverlay()
              if (id === 'student') {
                const first = students[0]
                if (first) {
                  setStamp({
                    kind: 'student',
                    id: first.id,
                    name: first.name,
                    photoUrl: resolveStudentPhotoUrl(first),
                  })
                } else {
                  setStatus('등록된 학생이 없습니다. 설정에서 학생을 추가해 주세요.')
                }
              }
              if (id === 'stamp' && stamp.kind !== 'emoji') {
                setStamp({ kind: 'emoji', value: STAMPS[0] })
              }
            }}
            className={cn(
              'inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm',
              tool === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!canUndo} onClick={() => void undo()}>
          <Undo2 className="h-4 w-4" />
          실행 취소
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!canRedo} onClick={() => void redo()}>
          <Redo2 className="h-4 w-4" />
          다시 실행
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        {(
          [
            ['blank', '흰 배경'],
            ['grid', '격자'],
            ['lined', '줄노트'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setBg(id)}
            className={cn(
              'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium',
              bg === id
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {id === 'grid' ? <Grid3x3 className="h-3.5 w-3.5" /> : null}
            {label}
          </button>
        ))}

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <Button type="button" variant="outline" size="sm" onClick={() => void downloadPng()}>
          <Download className="h-4 w-4" />
          PNG 저장
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void copyPng()}>
          <ClipboardCopy className="h-4 w-4" />
          복사
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={clearAll}>
          <Trash2 className="h-4 w-4" />
          전체 지우기
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showColor
          ? COLORS.map((c) => (
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
            ))
          : null}

        {tool === 'eraser' ? (
          <span className="text-sm text-muted-foreground">드래그한 부분만 지워집니다</span>
        ) : null}

        {showSize ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {tool === 'eraser' ? '지우개 크기' : '굵기'}
            <input
              type="range"
              min={sizeMin}
              max={sizeMax}
              value={sizeValue}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (tool === 'eraser') setEraserSize(v)
                else setPenSize(v)
              }}
            />
            <span className="w-6 tabular-nums text-xs">{sizeValue}</span>
          </label>
        ) : null}

        {tool === 'text' ? (
          <div className="flex flex-wrap items-center gap-2">
            <TextCursorInput className="h-4 w-4 text-muted-foreground" />
            <Input
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              placeholder="입력 후 보드 클릭"
              className="h-9 w-44 sm:w-56"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              크기
              <input
                type="range"
                min={14}
                max={48}
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
              />
            </label>
          </div>
        ) : null}

        {tool === 'stamp' ? (
          <div className="flex flex-wrap items-center gap-1">
            {STAMPS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStamp({ kind: 'emoji', value: s })}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl text-lg',
                  stamp.kind === 'emoji' && stamp.value === s
                    ? 'bg-primary/15 ring-1 ring-primary/40'
                    : 'bg-muted hover:bg-muted/80',
                )}
              >
                {s}
              </button>
            ))}
            <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
              크기
              <input
                type="range"
                min={14}
                max={48}
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
              />
            </label>
          </div>
        ) : null}

        {tool === 'student' ? (
          <div className="w-full space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                학생을 고른 뒤 보드를 클릭하면 원형 얼굴 스탬프가 붙습니다.
              </span>
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showStudentName}
                  onChange={(e) => setShowStudentName(e.target.checked)}
                  className="rounded border-border"
                />
                이름 표시
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                크기
                <input
                  type="range"
                  min={14}
                  max={48}
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                />
              </label>
            </div>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                등록된 학생이 없습니다. 설정 → 학생 정보에서 사진과 함께 등록해 주세요.
              </p>
            ) : (
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-xl border border-border/70 bg-muted/20 p-2">
                {students.map((s) => {
                  const photoUrl = resolveStudentPhotoUrl(s)
                  const active = stamp.kind === 'student' && stamp.id === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setStamp({
                          kind: 'student',
                          id: s.id,
                          name: s.name,
                          photoUrl,
                        })
                      }
                      className={cn(
                        'flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm transition-colors',
                        active
                          ? 'bg-primary/15 ring-1 ring-primary/40'
                          : 'bg-card hover:bg-muted',
                      )}
                    >
                      <span className="flex h-8 w-8 overflow-hidden rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            {s.name.slice(0, 1)}
                          </span>
                        )}
                      </span>
                      <span className="max-w-[4.5rem] truncate font-medium text-foreground">
                        {s.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              PNG 저장·복사 시 얼굴 이미지가 파일에 포함됩니다. 공유 전에 확인해 주세요.
            </p>
          </div>
        ) : null}

        {tool === 'laser' ? (
          <span className="text-sm text-muted-foreground">
            포인터를 따라 빨간 레이저가 표시됩니다 (저장되지 않음)
          </span>
        ) : null}
        {tool === 'spotlight' ? (
          <span className="text-sm text-muted-foreground">
            주변을 어둡게 하고 포커스 원만 밝게 보입니다
          </span>
        ) : null}
      </div>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
        style={{ height: CANVAS_H }}
      >
        <canvas ref={bgRef} className="pointer-events-none absolute inset-0 block" />
        <canvas ref={inkRef} className="pointer-events-none absolute inset-0 block" />
        <canvas
          ref={overlayRef}
          className={cn(
            'absolute inset-0 z-10 block touch-none',
            tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair',
          )}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
    </div>
  )
}
