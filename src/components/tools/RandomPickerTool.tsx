import { useMemo, useState } from 'react'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useStudents } from '@/hooks/useStudents'
import { playChime } from '@/components/tools/audioHelpers'

interface PickItem {
  id: string
  label: string
  photoUrl: string | null
}

function studentPhotoUrl(student: {
  photoUrl?: string | null
  photo_path?: string | null
}): string | null {
  if (student.photoUrl) return student.photoUrl
  const path = student.photo_path
  if (path?.startsWith('data:') || path?.startsWith('http')) return path
  return null
}

export function RandomPickerTool() {
  const { students } = useStudents()
  const [mode, setMode] = useState<'students' | 'custom' | 'number'>('students')
  const [customText, setCustomText] = useState('민준\n서연\n하준')
  const [maxNum, setMaxNum] = useState(30)
  const [result, setResult] = useState<PickItem | null>(null)
  const [spinning, setSpinning] = useState(false)

  const pool = useMemo((): PickItem[] => {
    if (mode === 'students') {
      return students
        .filter((s) => s.name)
        .map((s) => ({
          id: s.id,
          label: s.name,
          photoUrl: studentPhotoUrl(s),
        }))
    }
    if (mode === 'custom') {
      return customText
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label, i) => ({ id: `c-${i}-${label}`, label, photoUrl: null }))
    }
    return Array.from({ length: Math.max(1, maxNum) }, (_, i) => ({
      id: `n-${i + 1}`,
      label: String(i + 1),
      photoUrl: null,
    }))
  }, [mode, students, customText, maxNum])

  const pick = () => {
    if (pool.length === 0) {
      setResult(null)
      return
    }
    setSpinning(true)
    let ticks = 0
    const id = window.setInterval(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)] ?? null)
      ticks += 1
      if (ticks >= 12) {
        window.clearInterval(id)
        const final = pool[Math.floor(Math.random() * pool.length)] ?? null
        setResult(final)
        setSpinning(false)
        playChime()
      }
    }, 60)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['students', '등록 학생'],
            ['custom', '직접 입력'],
            ['number', '번호'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={mode === id ? 'default' : 'outline'}
            onClick={() => {
              setMode(id)
              setResult(null)
            }}
          >
            {label}
          </Button>
        ))}
      </div>

      {mode === 'custom' ? (
        <Textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={5}
          placeholder="한 줄에 하나, 또는 쉼표로 구분"
        />
      ) : null}
      {mode === 'number' ? (
        <label className="flex items-center gap-2 text-sm">
          1 ~{' '}
          <input
            type="number"
            min={1}
            max={200}
            value={maxNum}
            onChange={(e) => setMaxNum(Math.max(1, Number(e.target.value) || 1))}
            className="w-20 rounded-lg border border-border px-2 py-1"
          />
        </label>
      ) : null}
      {mode === 'students' && pool.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          등록된 학생이 없습니다. 설정 → 학생 정보에서 등록하거나 직접 입력을 쓰세요.
        </p>
      ) : null}

      <div className="flex min-h-[7rem] items-center justify-center rounded-2xl bg-muted/40 px-4 py-8">
        {result ? (
          <div className="flex items-center gap-4">
            {mode === 'students' ? (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/70 sm:h-20 sm:w-20">
                {result.photoUrl ? (
                  <img
                    src={result.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8 sm:h-9 sm:w-9" />
                )}
              </div>
            ) : null}
            <p className="text-4xl font-bold text-foreground sm:text-5xl">{result.label}</p>
          </div>
        ) : (
          <p className="text-4xl font-bold text-foreground sm:text-5xl">?</p>
        )}
      </div>
      <div className="flex justify-center">
        <Button
          type="button"
          className="rounded-2xl px-8"
          disabled={spinning || pool.length === 0}
          onClick={pick}
        >
          {spinning ? '뽑는 중…' : '뽑기'}
        </Button>
      </div>
    </div>
  )
}
