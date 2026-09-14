import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStudents } from '@/hooks/useStudents'
import { playChime } from '@/components/tools/audioHelpers'

function shuffle<T>(arr: T[]) {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  return next
}

export function GroupSeatingTool() {
  const { students } = useStudents()
  const [groupSize, setGroupSize] = useState(4)
  const [customNames, setCustomNames] = useState('')
  const [groups, setGroups] = useState<string[][]>([])

  const names = useMemo(() => {
    if (customNames.trim()) {
      return customNames
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
    return students.map((s) => s.name)
  }, [customNames, students])

  const shuffleGroups = () => {
    const list = shuffle(names)
    const size = Math.max(2, groupSize)
    const next: string[][] = []
    for (let i = 0; i < list.length; i += size) {
      next.push(list.slice(i, i + size))
    }
    setGroups(next)
    playChime()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        등록 학생을 쓰거나, 아래에 이름을 직접 입력할 수 있습니다.
      </p>
      <Input
        value={customNames}
        onChange={(e) => setCustomNames(e.target.value)}
        placeholder="직접 입력 시: 이름1, 이름2 … (비우면 등록 학생 사용)"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">모둠당</span>
        {[2, 3, 4, 5, 6].map((n) => (
          <Button
            key={n}
            type="button"
            size="sm"
            variant={groupSize === n ? 'default' : 'outline'}
            onClick={() => setGroupSize(n)}
          >
            {n}명
          </Button>
        ))}
        <Button
          type="button"
          className="rounded-2xl"
          disabled={names.length === 0}
          onClick={shuffleGroups}
        >
          섞기
        </Button>
      </div>
      {names.length === 0 ? (
        <p className="text-sm text-muted-foreground">이름이 없습니다. 학생을 등록하거나 직접 입력하세요.</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((g, i) => (
          <div key={i} className="rounded-2xl border border-border/80 bg-muted/30 p-4">
            <p className="mb-2 text-sm font-semibold text-primary">모둠 {i + 1}</p>
            <ul className="space-y-1 text-sm">
              {g.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
