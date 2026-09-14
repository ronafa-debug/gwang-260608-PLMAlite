import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { playBeep } from '@/components/tools/audioHelpers'

type Hand = '가위' | '바위' | '보'

const HANDS: Hand[] = ['가위', '바위', '보']

function verdict(player: Hand, cpu: Hand) {
  if (player === cpu) return '비김'
  if (
    (player === '가위' && cpu === '보') ||
    (player === '바위' && cpu === '가위') ||
    (player === '보' && cpu === '바위')
  ) {
    return '이김'
  }
  return '짐'
}

export function RpsTool() {
  const [player, setPlayer] = useState<Hand | null>(null)
  const [cpu, setCpu] = useState<Hand | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const play = (hand: Hand) => {
    const other = HANDS[Math.floor(Math.random() * 3)]!
    setPlayer(hand)
    setCpu(other)
    setResult(verdict(hand, other))
    playBeep()
  }

  return (
    <div className="space-y-6 text-center">
      <div className="grid grid-cols-3 gap-3">
        {HANDS.map((h) => (
          <Button
            key={h}
            type="button"
            className="h-20 rounded-2xl text-lg"
            variant="outline"
            onClick={() => play(h)}
          >
            {h}
          </Button>
        ))}
      </div>
      <div className="rounded-2xl bg-muted/40 px-4 py-8">
        <p className="text-sm text-muted-foreground">선생님 vs 교실</p>
        <p className="mt-3 text-3xl font-bold">
          {player && cpu ? `${player} vs ${cpu}` : '손을 고르세요'}
        </p>
        {result ? <p className="mt-3 text-xl font-semibold text-primary">{result}!</p> : null}
      </div>
    </div>
  )
}
