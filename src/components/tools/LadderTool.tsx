import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { playChime } from '@/components/tools/audioHelpers'

type Bridge = { from: number; to: number; y: number }

function buildBridges(n: number): Bridge[] {
  const bridges: Bridge[] = []
  const rows = 6
  for (let r = 0; r < rows; r++) {
    const y = 12 + r * 14
    for (let i = 0; i < n - 1; i++) {
      if (Math.random() > 0.45) {
        bridges.push({ from: i, to: i + 1, y })
        i += 1
      }
    }
  }
  return bridges
}

function follow(start: number, n: number, bridges: Bridge[]) {
  let col = start
  const sorted = [...bridges].sort((a, b) => a.y - b.y)
  for (const b of sorted) {
    if (b.from === col) col = b.to
    else if (b.to === col) col = b.from
  }
  return Math.max(0, Math.min(n - 1, col))
}

export function LadderTool() {
  const [count, setCount] = useState(4)
  const [tops, setTops] = useState(['A', 'B', 'C', 'D'])
  const [bottoms, setBottoms] = useState(['1등', '2등', '3등', '4등'])
  const [bridges, setBridges] = useState<Bridge[]>(() => buildBridges(4))
  const [activeStart, setActiveStart] = useState<number | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const n = Math.min(8, Math.max(2, count))

  const syncSize = (next: number) => {
    const size = Math.min(8, Math.max(2, next))
    setCount(size)
    setTops((prev) =>
      Array.from({ length: size }, (_, i) => prev[i] ?? String.fromCharCode(65 + i)),
    )
    setBottoms((prev) =>
      Array.from({ length: size }, (_, i) => prev[i] ?? `${i + 1}번`),
    )
    setBridges(buildBridges(size))
    setActiveStart(null)
    setResult(null)
  }

  const width = 100
  const positions = useMemo(
    () => Array.from({ length: n }, (_, i) => ((i + 0.5) / n) * width),
    [n],
  )

  const runFrom = (start: number) => {
    const end = follow(start, n, bridges)
    setActiveStart(start)
    setResult(`${tops[start]} → ${bottoms[end]}`)
    playChime()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">인원</span>
        {[2, 3, 4, 5, 6].map((c) => (
          <Button
            key={c}
            type="button"
            size="sm"
            variant={n === c ? 'default' : 'outline'}
            onClick={() => syncSize(c)}
          >
            {c}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => syncSize(n)}>
          사다리 다시 섞기
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">위 (이름)</p>
          {tops.slice(0, n).map((t, i) => (
            <Input
              key={`t-${i}`}
              value={t}
              onChange={(e) =>
                setTops((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
              }
            />
          ))}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">아래 (결과)</p>
          {bottoms.slice(0, n).map((t, i) => (
            <Input
              key={`b-${i}`}
              value={t}
              onChange={(e) =>
                setBottoms((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
              }
            />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card p-3">
        <svg viewBox="0 0 100 100" className="mx-auto h-56 w-full max-w-lg">
          {positions.map((x, i) => (
            <line
              key={`v-${i}`}
              x1={x}
              y1={8}
              x2={x}
              y2={92}
              stroke="currentColor"
              className="text-muted-foreground"
              strokeWidth={0.8}
            />
          ))}
          {bridges.map((b, i) => (
            <line
              key={`h-${i}`}
              x1={positions[b.from]}
              y1={b.y}
              x2={positions[b.to]}
              y2={b.y}
              stroke="currentColor"
              className="text-primary"
              strokeWidth={1.2}
            />
          ))}
          {activeStart !== null ? (
            <circle
              cx={positions[activeStart]}
              cy={8}
              r={2.2}
              className="fill-primary"
            />
          ) : null}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2">
        {tops.slice(0, n).map((t, i) => (
          <Button key={i} type="button" variant="outline" size="sm" onClick={() => runFrom(i)}>
            {t} 타기
          </Button>
        ))}
      </div>
      {result ? (
        <p className="text-center text-xl font-bold text-foreground">{result}</p>
      ) : null}
    </div>
  )
}
