import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { playBeep } from '@/components/tools/audioHelpers'

export function DiceTool() {
  const [mode, setMode] = useState<'dice' | 'number'>('dice')
  const [diceCount, setDiceCount] = useState(1)
  const [max, setMax] = useState(20)
  const [values, setValues] = useState<number[]>([1])
  const [rolling, setRolling] = useState(false)

  const roll = () => {
    setRolling(true)
    let ticks = 0
    const id = window.setInterval(() => {
      if (mode === 'dice') {
        setValues(
          Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6)),
        )
      } else {
        setValues([1 + Math.floor(Math.random() * Math.max(1, max))])
      }
      ticks += 1
      if (ticks >= 10) {
        window.clearInterval(id)
        setRolling(false)
        playBeep()
      }
    }, 50)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === 'dice' ? 'default' : 'outline'}
          onClick={() => setMode('dice')}
        >
          주사위
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'number' ? 'default' : 'outline'}
          onClick={() => setMode('number')}
        >
          숫자 뽑기
        </Button>
      </div>

      {mode === 'dice' ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={diceCount === n ? 'default' : 'outline'}
              onClick={() => setDiceCount(n)}
            >
              {n}개
            </Button>
          ))}
        </div>
      ) : (
        <label className="flex items-center gap-2 text-sm">
          최대
          <input
            type="number"
            min={2}
            max={999}
            value={max}
            onChange={(e) => setMax(Math.max(2, Number(e.target.value) || 2))}
            className="w-24 rounded-lg border border-border px-2 py-1"
          />
        </label>
      )}

      <div className="flex min-h-[6rem] flex-wrap items-center justify-center gap-4">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/40 bg-card text-3xl font-bold shadow-sm"
          >
            {v}
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button type="button" className="rounded-2xl px-8" disabled={rolling} onClick={roll}>
          {rolling ? '굴리는 중…' : mode === 'dice' ? '주사위 굴리기' : '숫자 뽑기'}
        </Button>
      </div>
    </div>
  )
}
