import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Mode = 'live' | 'practice'
type DragHand = 'hour' | 'minute' | 'second' | null

interface ClockTime {
  hour12: number // 1–12
  minute: number
  second: number
  period: 'am' | 'pm'
}

function normalizeHour12(h: number) {
  const n = ((h - 1) % 12 + 12) % 12
  return n + 1
}

function toHour24(time: ClockTime): number {
  if (time.period === 'am') return time.hour12 === 12 ? 0 : time.hour12
  return time.hour12 === 12 ? 12 : time.hour12 + 12
}

function fromHour24(hour24: number, minute: number, second: number): ClockTime {
  const h = ((hour24 % 24) + 24) % 24
  const period: 'am' | 'pm' = h >= 12 ? 'pm' : 'am'
  let hour12 = h % 12
  if (hour12 === 0) hour12 = 12
  return {
    hour12,
    minute: ((minute % 60) + 60) % 60,
    second: ((second % 60) + 60) % 60,
    period,
  }
}

function fromDate(d: Date): ClockTime {
  return fromHour24(d.getHours(), d.getMinutes(), d.getSeconds())
}

function toTotalSeconds(time: ClockTime): number {
  return toHour24(time) * 3600 + time.minute * 60 + time.second
}

function fromTotalSeconds(total: number): ClockTime {
  const day = 24 * 3600
  let t = Math.round(total)
  t = ((t % day) + day) % day
  const hour24 = Math.floor(t / 3600)
  t %= 3600
  const minute = Math.floor(t / 60)
  const second = t % 60
  return fromHour24(hour24, minute, second)
}

function toDegrees(time: ClockTime) {
  const h = time.hour12 % 12
  return {
    second: time.second * 6,
    minute: time.minute * 6 + time.second * 0.1,
    hour: h * 30 + time.minute * 0.5,
  }
}

function formatDigital(time: ClockTime, showSeconds: boolean) {
  const hh = String(time.hour12).padStart(2, '0')
  const mm = String(time.minute).padStart(2, '0')
  const ss = String(time.second).padStart(2, '0')
  const period = time.period === 'am' ? '오전' : '오후'
  return showSeconds ? `${period} ${hh}:${mm}:${ss}` : `${period} ${hh}:${mm}`
}

function pointerAngleFromCenter(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): number {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  if (deg < 0) deg += 360
  return deg
}

/** Shortest signed delta from previous angle to next (−180 … 180]. */
function angleDelta(fromDeg: number, toDeg: number): number {
  let d = toDeg - fromDeg
  if (d > 180) d -= 360
  if (d <= -180) d += 360
  return d
}

/**
 * Apply continuous hand rotation. Minute/second full turns advance higher units
 * (and move the hour hand), matching a real clock.
 */
function applyHandDelta(
  hand: Exclude<DragHand, null>,
  deltaDeg: number,
  prev: ClockTime,
): ClockTime {
  const total = toTotalSeconds(prev)
  if (hand === 'second') {
    // 6° = 1 second
    return fromTotalSeconds(total + deltaDeg / 6)
  }
  if (hand === 'minute') {
    // 6° = 1 minute = 60 seconds
    return fromTotalSeconds(total + (deltaDeg / 6) * 60)
  }
  // 30° = 1 hour = 3600 seconds (hour hand drag also carries minutes visually via toDegrees)
  return fromTotalSeconds(total + (deltaDeg / 30) * 3600)
}

function stepHour(time: ClockTime, delta: number): ClockTime {
  return fromHour24(toHour24(time) + delta, time.minute, time.second)
}

function addMinutes(time: ClockTime, delta: number): ClockTime {
  return fromTotalSeconds(toTotalSeconds(time) + delta * 60)
}

function setOnTheHour(time: ClockTime): ClockTime {
  return { ...time, minute: 0, second: 0 }
}

function AnalogFace({
  time,
  showSeconds,
  interactive,
  onDragDelta,
  large,
}: {
  time: ClockTime
  showSeconds: boolean
  interactive: boolean
  onDragDelta?: (hand: Exclude<DragHand, null>, deltaDeg: number) => void
  large?: boolean
}) {
  const faceRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<DragHand>(null)
  const lastAngle = useRef<number | null>(null)
  const deg = toDegrees(time)

  const beginDrag = (hand: Exclude<DragHand, null>) => (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !onDragDelta) return
    e.preventDefault()
    e.stopPropagation()
    dragging.current = hand
    faceRef.current?.setPointerCapture(e.pointerId)
    const rect = faceRef.current!.getBoundingClientRect()
    lastAngle.current = pointerAngleFromCenter(e.clientX, e.clientY, rect)
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !onDragDelta || !faceRef.current || lastAngle.current === null) {
      return
    }
    const rect = faceRef.current.getBoundingClientRect()
    const angle = pointerAngleFromCenter(e.clientX, e.clientY, rect)
    const delta = angleDelta(lastAngle.current, angle)
    lastAngle.current = angle
    if (delta !== 0) onDragDelta(dragging.current, delta)
  }

  const onUp = () => {
    dragging.current = null
    lastAngle.current = null
  }

  return (
    <div
      ref={faceRef}
      className={cn(
        'relative touch-none rounded-full border-4 border-primary/30 bg-card shadow-inner',
        large ? 'h-72 w-72 sm:h-80 sm:w-80' : 'h-64 w-64 sm:h-72 sm:w-72',
        interactive && 'cursor-grab active:cursor-grabbing',
      )}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i + 1) * 30
        const rad = ((angle - 90) * Math.PI) / 180
        const x = 50 + Math.cos(rad) * 40
        const y = 50 + Math.sin(rad) * 40
        return (
          <span
            key={i}
            className="absolute text-sm font-semibold text-muted-foreground sm:text-base"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {i + 1}
          </span>
        )
      })}

      <div
        role={interactive ? 'slider' : undefined}
        aria-label="시침"
        className={cn(
          'absolute left-1/2 top-1/2 z-[3] h-[22%] w-1.5 origin-bottom rounded-full bg-foreground',
          interactive && 'cursor-grab',
        )}
        style={{ transform: `translate(-50%, -100%) rotate(${deg.hour}deg)` }}
        onPointerDown={beginDrag('hour')}
      />
      <div
        role={interactive ? 'slider' : undefined}
        aria-label="분침"
        className={cn(
          'absolute left-1/2 top-1/2 z-[4] h-[32%] w-1 origin-bottom rounded-full bg-foreground',
          interactive && 'cursor-grab',
        )}
        style={{ transform: `translate(-50%, -100%) rotate(${deg.minute}deg)` }}
        onPointerDown={beginDrag('minute')}
      />
      {showSeconds ? (
        <div
          role={interactive ? 'slider' : undefined}
          aria-label="초침"
          className={cn(
            'absolute left-1/2 top-1/2 z-[5] h-[38%] w-0.5 origin-bottom rounded-full bg-primary',
            interactive && 'cursor-grab',
          )}
          style={{ transform: `translate(-50%, -100%) rotate(${deg.second}deg)` }}
          onPointerDown={beginDrag('second')}
        />
      ) : null}
      <div className="absolute left-1/2 top-1/2 z-[6] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
    </div>
  )
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
}) {
  const display = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 w-9 p-0"
          onClick={() => onChange(value <= min ? max : value - 1)}
        >
          −
        </Button>
        <input
          type="number"
          min={min}
          max={max}
          value={display}
          className="h-10 w-14 rounded-xl border border-border bg-background text-center font-mono text-lg font-semibold tabular-nums"
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isNaN(n)) return
            onChange(Math.min(max, Math.max(min, n)))
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 w-9 p-0"
          onClick={() => onChange(value >= max ? min : value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  )
}

export function AnalogClockTool() {
  const [mode, setMode] = useState<Mode>('practice')
  const [liveNow, setLiveNow] = useState(() => new Date())
  const [practice, setPractice] = useState<ClockTime>(() => fromDate(new Date()))
  const [showSeconds, setShowSeconds] = useState(true)
  const [quizMode, setQuizMode] = useState(false)

  useEffect(() => {
    if (mode !== 'live') return
    const id = window.setInterval(() => setLiveNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [mode])

  const liveTime = fromDate(liveNow)
  const active = mode === 'live' ? liveTime : practice

  const onDragDelta = (hand: Exclude<DragHand, null>, deltaDeg: number) => {
    setPractice((prev) => applyHandDelta(hand, deltaDeg, prev))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === 'practice' ? 'default' : 'outline'}
          onClick={() => setMode('practice')}
        >
          연습 시계
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'live' ? 'default' : 'outline'}
          onClick={() => setMode('live')}
        >
          지금 시각
        </Button>
      </div>

      {mode === 'practice' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={showSeconds ? 'default' : 'outline'}
            onClick={() => setShowSeconds((v) => !v)}
          >
            {showSeconds ? '초침 켜짐' : '초침 숨김'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={quizMode ? 'default' : 'outline'}
            onClick={() => setQuizMode((v) => !v)}
          >
            {quizMode ? '문제 모드 ON' : '문제 모드'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPractice(setOnTheHour(practice))}
          >
            정각
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPractice(addMinutes(practice, 5))}
          >
            +5분
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPractice(addMinutes(practice, 15))}
          >
            +15분
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPractice(fromDate(new Date()))}
          >
            지금으로
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-5">
        <AnalogFace
          time={active}
          showSeconds={mode === 'live' ? true : showSeconds}
          interactive={mode === 'practice'}
          onDragDelta={mode === 'practice' ? onDragDelta : undefined}
          large
        />

        {mode === 'live' || !quizMode ? (
          <p className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl">
            {formatDigital(active, mode === 'live' || showSeconds)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            문제 모드: 디지털 시각이 숨겨져 있습니다. 시계를 읽고 말해 보세요.
          </p>
        )}

        {mode === 'practice' ? (
          <p className="text-center text-xs text-muted-foreground">
            시침·분침{showSeconds ? '·초침' : ''}을 드래그하거나 아래 숫자로 맞출 수 있습니다.
          </p>
        ) : null}
      </div>

      {mode === 'practice' ? (
        <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border/80 bg-muted/30 p-4">
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={practice.period === 'am' ? 'default' : 'outline'}
              onClick={() => setPractice((t) => ({ ...t, period: 'am' }))}
            >
              오전
            </Button>
            <Button
              type="button"
              size="sm"
              variant={practice.period === 'pm' ? 'default' : 'outline'}
              onClick={() => setPractice((t) => ({ ...t, period: 'pm' }))}
            >
              오후
            </Button>
          </div>

          {!quizMode ? (
            <div className="flex flex-wrap justify-center gap-4">
              <Stepper
                label="시"
                value={practice.hour12}
                min={1}
                max={12}
                onChange={(hour12) =>
                  setPractice((t) => ({ ...t, hour12: normalizeHour12(hour12) }))
                }
              />
              <Stepper
                label="분"
                value={practice.minute}
                min={0}
                max={59}
                onChange={(minute) => setPractice((t) => ({ ...t, minute }))}
              />
              {showSeconds ? (
                <Stepper
                  label="초"
                  value={practice.second}
                  min={0}
                  max={59}
                  onChange={(second) => setPractice((t) => ({ ...t, second }))}
                />
              ) : null}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              문제 모드에서는 디지털 조작도 숨깁니다. 바늘만 보여 주세요.
            </p>
          )}

          {!quizMode ? (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPractice((t) => stepHour(t, -1))}
              >
                시 −1
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPractice((t) => stepHour(t, 1))}
              >
                시 +1
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
