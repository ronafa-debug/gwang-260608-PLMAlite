import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

function formatHms(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const cs = Math.floor((ms % 1000) / 10)
  const base = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
  return h > 0 ? `${h}:${base}` : base
}

export function StopwatchTool() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startedAt = useRef(0)

  useEffect(() => {
    if (!running) return
    startedAt.current = Date.now() - elapsed
    const id = window.setInterval(() => {
      setElapsed(Date.now() - startedAt.current)
    }, 50)
    return () => window.clearInterval(id)
    // elapsed captured only when starting/resuming
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  return (
    <div className="space-y-6">
      <p className="text-center font-mono text-5xl font-bold tracking-tight sm:text-6xl">
        {formatHms(elapsed)}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" className="rounded-2xl px-6" onClick={() => setRunning((r) => !r)}>
          {running ? '정지' : '시작'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          disabled={running || elapsed === 0}
          onClick={() => setLaps((prev) => [elapsed, ...prev].slice(0, 20))}
        >
          랩
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          onClick={() => {
            setRunning(false)
            setElapsed(0)
            setLaps([])
          }}
        >
          리셋
        </Button>
      </div>
      {laps.length > 0 ? (
        <ul className="mx-auto max-w-sm space-y-1 text-sm">
          {laps.map((lap, i) => (
            <li
              key={`${lap}-${i}`}
              className="flex justify-between rounded-xl bg-muted/50 px-3 py-2 font-mono"
            >
              <span>랩 {laps.length - i}</span>
              <span>{formatHms(lap)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
