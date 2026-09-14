import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStorageItem, setStorageItem } from '@/lib/storage'

interface ScheduleItem {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:mm optional display
}

const KEY = 'work_schedule'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function SchedulerTool() {
  const [items, setItems] = useState<ScheduleItem[]>(() => getStorageItem(KEY, []))
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState('09:00')

  useEffect(() => {
    setStorageItem(KEY, items)
  }, [items])

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const ad = `${a.date}T${a.time || '00:00'}`
        const bd = `${b.date}T${b.time || '00:00'}`
        return ad.localeCompare(bd)
      }),
    [items],
  )

  const upcoming = sorted.filter((i) => i.date >= todayStr())
  const past = sorted.filter((i) => i.date < todayStr())

  const add = () => {
    if (!title.trim() || !date) return
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        date,
        time: time || '09:00',
      },
      ...prev,
    ])
    setTitle('')
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="space-y-2 rounded-2xl border border-border/80 bg-muted/30 p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목 (예: 학년 회의)"
        />
        <div className="flex flex-wrap gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-auto" />
          <Button type="button" className="rounded-xl" onClick={add}>
            추가
          </Button>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">다가오는 일정</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">예정된 일정이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.date} · {item.time}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">지난 일정</h3>
          <ul className="space-y-2 opacity-70">
            {past.slice(0, 5).map((item) => (
              <li key={item.id} className="rounded-xl bg-muted/40 px-3 py-2 text-sm">
                {item.date} {item.time} · {item.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
