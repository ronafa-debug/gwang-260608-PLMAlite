import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getStorageItem, setStorageItem } from '@/lib/storage'

interface MemoItem {
  id: string
  title: string
  body: string
  updatedAt: string
}

const KEY = 'work_memos'

export function MemoTool() {
  const [items, setItems] = useState<MemoItem[]>(() => getStorageItem(KEY, []))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    setStorageItem(KEY, items)
  }, [items])

  const active = items.find((m) => m.id === activeId) ?? null

  const openNew = () => {
    const created: MemoItem = {
      id: crypto.randomUUID(),
      title: '새 메모',
      body: '',
      updatedAt: new Date().toISOString(),
    }
    setItems((prev) => [created, ...prev])
    setActiveId(created.id)
    setTitle(created.title)
    setBody('')
  }

  const openItem = (item: MemoItem) => {
    setActiveId(item.id)
    setTitle(item.title)
    setBody(item.body)
  }

  const save = () => {
    if (!activeId) return
    setItems((prev) =>
      prev.map((m) =>
        m.id === activeId
          ? {
              ...m,
              title: title.trim() || '제목 없음',
              body,
              updatedAt: new Date().toISOString(),
            }
          : m,
      ),
    )
  }

  const remove = () => {
    if (!activeId) return
    setItems((prev) => prev.filter((m) => m.id !== activeId))
    setActiveId(null)
    setTitle('')
    setBody('')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
      <div className="space-y-2">
        <Button type="button" className="w-full rounded-xl" onClick={openNew}>
          새 메모
        </Button>
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => openItem(m)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                  activeId === m.id ? 'bg-primary/10 text-foreground' : 'hover:bg-muted'
                }`}
              >
                <p className="truncate font-medium">{m.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(m.updatedAt).toLocaleString('ko-KR')}
                </p>
              </button>
            </li>
          ))}
        </ul>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">저장된 메모가 없습니다.</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {active ? (
          <>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="내용을 입력하세요"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="rounded-xl" onClick={save}>
                저장
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={remove}>
                삭제
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">왼쪽에서 메모를 선택하거나 새로 만드세요.</p>
        )}
      </div>
    </div>
  )
}
