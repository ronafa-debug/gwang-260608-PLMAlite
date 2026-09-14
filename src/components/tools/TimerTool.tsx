import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { playBeep, startSoftBgm } from '@/components/tools/audioHelpers'

function formatMmSs(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TimerTool() {
  const [minutes, setMinutes] = useState(5)
  const [secondsLeft, setSecondsLeft] = useState(5 * 60)
  const [running, setRunning] = useState(false)
  const [bgm, setBgm] = useState(false)
  const stopBgmRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!running) return
    if (secondsLeft <= 0) {
      setRunning(false)
      playBeep()
      stopBgmRef.current?.()
      stopBgmRef.current = null
      return
    }
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearInterval(id)
  }, [running, secondsLeft])

  useEffect(() => {
    if (running && bgm && !stopBgmRef.current) {
      stopBgmRef.current = startSoftBgm()
    }
    if ((!running || !bgm) && stopBgmRef.current) {
      stopBgmRef.current()
      stopBgmRef.current = null
    }
  }, [running, bgm])

  useEffect(
    () => () => {
      stopBgmRef.current?.()
    },
    [],
  )

  const applyPreset = (min: number) => {
    setMinutes(min)
    setSecondsLeft(min * 60)
    setRunning(false)
  }

  return (
    <div className="space-y-6">
      <p className="text-center font-mono text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
        {formatMmSs(Math.max(0, secondsLeft))}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[1, 3, 5, 10].map((min) => (
          <Button key={min} type="button" variant="outline" size="sm" onClick={() => applyPreset(min)}>
            {min}분
          </Button>
        ))}
      </div>
      <div className="mx-auto flex max-w-xs flex-col gap-3">
        <div className="space-y-2">
          <Label htmlFor="timer-min">직접 설정 (분)</Label>
          <Input
            id="timer-min"
            type="number"
            min={0}
            max={99}
            value={minutes}
            disabled={running}
            onChange={(e) => {
              const v = Math.max(0, Math.min(99, Number(e.target.value) || 0))
              setMinutes(v)
              setSecondsLeft(v * 60)
            }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={bgm}
            onChange={(e) => setBgm(e.target.checked)}
            className="rounded border-border"
          />
          진행 중 부드러운 BGM
        </label>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" className="rounded-2xl px-6" onClick={() => setRunning((r) => !r)}>
          {running ? '일시정지' : '시작'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          onClick={() => {
            setRunning(false)
            setSecondsLeft(minutes * 60)
          }}
        >
          리셋
        </Button>
      </div>
    </div>
  )
}
