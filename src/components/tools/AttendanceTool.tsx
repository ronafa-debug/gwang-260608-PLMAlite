import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStudents } from '@/hooks/useStudents'
import { playBeep } from '@/components/tools/audioHelpers'

type Mark = 'present' | 'absent' | 'unset'

export function AttendanceTool() {
  const { students } = useStudents()
  const [marks, setMarks] = useState<Record<string, Mark>>({})
  const [callIndex, setCallIndex] = useState(0)

  const list = useMemo(() => students.map((s) => ({ id: s.id, name: s.name })), [students])

  useEffect(() => {
    setMarks((prev) => {
      const next = { ...prev }
      for (const s of list) {
        if (!(s.id in next)) next[s.id] = 'unset'
      }
      return next
    })
  }, [list])

  const setMark = (id: string, mark: Mark) => {
    setMarks((prev) => ({ ...prev, [id]: mark }))
  }

  const present = list.filter((s) => marks[s.id] === 'present').length
  const absent = list.filter((s) => marks[s.id] === 'absent').length
  const current = list[callIndex]

  const nextCall = () => {
    if (list.length === 0) return
    setCallIndex((i) => (i + 1) % list.length)
    playBeep()
  }

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        등록된 학생이 없습니다. 설정 → 학생 정보 관리에서 등록해 주세요.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">출석 {present}</span>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-800">결석 {absent}</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          미정 {list.length - present - absent}
        </span>
      </div>

      <div className="rounded-2xl bg-muted/40 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">호명</p>
        <p className="mt-2 text-4xl font-bold">{current?.name}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (current) setMark(current.id, 'present')
              nextCall()
            }}
          >
            출석 · 다음
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (current) setMark(current.id, 'absent')
              nextCall()
            }}
          >
            결석 · 다음
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={nextCall}>
            건너뛰기
          </Button>
        </div>
      </div>

      <ul className="divide-y divide-border/60 rounded-2xl border border-border/80">
        {list.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <span>{s.name}</span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={marks[s.id] === 'present' ? 'default' : 'outline'}
                className="h-8"
                onClick={() => setMark(s.id, 'present')}
              >
                출
              </Button>
              <Button
                type="button"
                size="sm"
                variant={marks[s.id] === 'absent' ? 'destructive' : 'outline'}
                className="h-8"
                onClick={() => setMark(s.id, 'absent')}
              >
                결
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
