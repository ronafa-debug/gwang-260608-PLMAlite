import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useStudents } from '@/hooks/useStudents'
import { getStorageItem, setStorageItem } from '@/lib/storage'

interface StudentLog {
  id: string
  studentId: string
  studentName: string
  note: string
  createdAt: string
}

const KEY = 'work_student_logs'

export function StudentLogTool() {
  const { students } = useStudents()
  const [logs, setLogs] = useState<StudentLog[]>(() => getStorageItem(KEY, []))
  const [studentId, setStudentId] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    setStorageItem(KEY, logs)
  }, [logs])

  useEffect(() => {
    if (!studentId && students[0]) setStudentId(students[0].id)
  }, [students, studentId])

  const filtered = useMemo(() => {
    const list = studentId ? logs.filter((l) => l.studentId === studentId) : logs
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [logs, studentId])

  const add = () => {
    const student = students.find((s) => s.id === studentId)
    if (!student || !note.trim()) return
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        studentId: student.id,
        studentName: student.name,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setNote('')
  }

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        등록된 학생이 없습니다. 설정 → 학생 정보 관리에서 먼저 등록해 주세요.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="space-y-2 rounded-2xl border border-border/80 bg-muted/30 p-4">
        <label className="block text-sm font-medium text-foreground">
          학생
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.grade})
              </option>
            ))}
          </select>
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="상담·행동·특이사항을 한 줄로 남겨 주세요"
        />
        <Button type="button" className="rounded-xl" onClick={add}>
          기록 추가
        </Button>
      </div>

      <ul className="space-y-2">
        {filtered.map((log) => (
          <li
            key={log.id}
            className="rounded-2xl border border-border/80 bg-card px-3 py-2 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{log.studentName}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-muted-foreground">{log.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setLogs((prev) => prev.filter((l) => l.id !== log.id))}
              >
                삭제
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">이 학생의 기록이 아직 없습니다.</p>
      ) : null}
    </div>
  )
}
