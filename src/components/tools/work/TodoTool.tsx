import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface TodoItem {
  id: string
  text: string
  done: boolean
  createdAt: string
}

const KEY = 'work_todos'

export function TodoTool() {
  const [items, setItems] = useState<TodoItem[]>(() => getStorageItem(KEY, []))
  const [text, setText] = useState('')

  useEffect(() => {
    setStorageItem(KEY, items)
  }, [items])

  const add = () => {
    const value = text.trim()
    if (!value) return
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        text: value,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setText('')
  }

  const openCount = items.filter((i) => !i.done).length

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">남은 할 일 {openCount}개</p>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="할 일 입력"
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
        />
        <Button type="button" className="shrink-0 rounded-xl" onClick={add}>
          추가
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-3 py-2"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() =>
                setItems((prev) =>
                  prev.map((t) => (t.id === item.id ? { ...t, done: !t.done } : t)),
                )
              }
              className="h-4 w-4"
            />
            <span
              className={cn(
                'min-w-0 flex-1 text-sm',
                item.done && 'text-muted-foreground line-through',
              )}
            >
              {item.text}
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
            >
              삭제
            </Button>
          </li>
        ))}
      </ul>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">할 일을 추가해 보세요.</p>
      ) : null}
    </div>
  )
}
