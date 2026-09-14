/** Shared helpers for whiteboard emoji / student photo stamps */

export function resolveStudentPhotoUrl(student: {
  photoUrl?: string | null
  photo_path?: string | null
}): string | null {
  if (student.photoUrl) return student.photoUrl
  const path = student.photo_path
  if (path?.startsWith('data:') || path?.startsWith('http')) return path
  return null
}

export type StampChoice =
  | { kind: 'emoji'; value: string }
  | { kind: 'student'; id: string; name: string; photoUrl: string | null }

const imageCache = new Map<string, HTMLImageElement>()

export function loadStampImage(src: string): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(src)
  if (cached?.complete) return Promise.resolve(cached)
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function initials(name: string) {
  const t = name.trim()
  if (!t) return '?'
  return t.slice(0, 2)
}

/** Draw circular student (or initial) stamp centered at (cx, cy). */
export function drawStudentStamp(
  ctx: CanvasRenderingContext2D,
  opts: {
    cx: number
    cy: number
    radius: number
    name: string
    photo: HTMLImageElement | null
    showName?: boolean
  },
) {
  const { cx, cy, radius, name, photo, showName = true } = opts
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1

  // Shadow ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 1.5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.12)'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  if (photo) {
    const iw = photo.naturalWidth || photo.width
    const ih = photo.naturalHeight || photo.height
    const side = Math.min(iw, ih)
    const sx = (iw - side) / 2
    const sy = (ih - side) / 2
    ctx.drawImage(photo, sx, sy, side, side, cx - radius, cy - radius, radius * 2, radius * 2)
  } else {
    ctx.fillStyle = '#d1fae5'
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    ctx.fillStyle = '#047857'
    ctx.font = `600 ${Math.max(12, radius * 0.7)}px Pretendard, "Noto Sans KR", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials(name), cx, cy)
  }

  ctx.restore()

  // Border
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(2, radius * 0.08)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()

  if (showName && name.trim()) {
    ctx.save()
    ctx.font = `600 ${Math.max(11, radius * 0.35)}px Pretendard, "Noto Sans KR", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const labelY = cy + radius + 4
    const metrics = ctx.measureText(name)
    const padX = 6
    const padY = 2
    const bw = metrics.width + padX * 2
    const bh = Math.max(14, radius * 0.4) + padY * 2
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)'
    ctx.lineWidth = 1
    const bx = cx - bw / 2
    const by = labelY
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 6)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#1f2937'
    ctx.fillText(name, cx, by + padY)
    ctx.restore()
  }
}

export function drawEmojiStamp(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.font = `${Math.max(28, size + 8)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(emoji, cx, cy)
  ctx.restore()
}
