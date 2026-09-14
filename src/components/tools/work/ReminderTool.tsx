import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface ReminderItem {
  id: string
  text: string
  dueDate: string
  done: boolean
}

const KEY = 'work_reminders'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function ReminderTool() {
  const [items, setItems] = useState<ReminderItem[]>(() => getStorageItem(KEY, []))
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState(todayStr)

  useEffect(() => {
    setStorageItem(KEY, items)
  }, [items])

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1
        return a.dueDate.localeCompare(b.dueDate)
      }),
    [items],
  )

  const add = () => {
    if (!text.trim()) return
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        text: text.trim(),
        dueDate: dueDate || todayStr(),
        done: false,
      },
      ...prev,
    ])
    setText('')
  }

  const today = todayStr()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 가정통신문 발송"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-auto sm:w-40"
        />
        <Button type="button" className="rounded-xl" onClick={add}>
          추가
        </Button>
      </div>

      <ul className="space-y-2">
        {sorted.map((item) => {
          const overdue = !item.done && item.dueDate < today
          const dueToday = !item.done && item.dueDate === today
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card px-3 py-2"
            >
              <input
                type="checkbox"
                checked={item.done}
                className="mt-1 h-4 w-4"
                onChange={() =>
                  setItems((prev) =>
                    prev.map((r) => (r.id === item.id ? { ...r, done: !r.done } : r)),
                  )
                }
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    item.done && 'text-muted-foreground line-through',
                  )}
                >
                  {item.text}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    overdue
                      ? 'font-medium text-destructive'
                      : dueToday
                        ? 'font-medium text-amber-700'
                        : 'text-muted-foreground',
                  )}
                >
                  {overdue ? '기한 지남 · ' : dueToday ? '오늘 · ' : ''}
                  {item.dueDate}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setItems((prev) => prev.filter((r) => r.id !== item.id))}
              >
                삭제
              </Button>
            </li>
          )
        })}
      </ul>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">리마인더를 추가해 보세요.</p>
      ) : null}
    </div>
  )
}
