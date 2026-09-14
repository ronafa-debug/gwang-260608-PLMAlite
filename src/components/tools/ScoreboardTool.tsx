import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Team {
  id: string
  name: string
  score: number
}

const COLORS = [
  'bg-sky-50 text-sky-900',
  'bg-emerald-50 text-emerald-900',
  'bg-amber-50 text-amber-900',
  'bg-violet-50 text-violet-900',
]

export function ScoreboardTool() {
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: '모둠 1', score: 0 },
    { id: '2', name: '모둠 2', score: 0 },
    { id: '3', name: '모둠 3', score: 0 },
    { id: '4', name: '모둠 4', score: 0 },
  ])

  const bump = (id: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, score: Math.max(0, t.score + delta) } : t)),
    )
  }

  const rename = (id: string, name: string) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)))
  }

  const reset = () => {
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          점수 리셋
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((team, i) => (
          <div
            key={team.id}
            className={`rounded-2xl p-4 shadow-sm ${COLORS[i % COLORS.length]}`}
          >
            <Input
              value={team.name}
              onChange={(e) => rename(team.id, e.target.value)}
              className="mb-3 border-0 bg-white/70 font-semibold"
            />
            <p className="text-center text-5xl font-bold tabular-nums">{team.score}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => bump(team.id, -1)}>
                −1
              </Button>
              <Button type="button" size="sm" onClick={() => bump(team.id, 1)}>
                +1
              </Button>
              <Button type="button" size="sm" onClick={() => bump(team.id, 5)}>
                +5
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
