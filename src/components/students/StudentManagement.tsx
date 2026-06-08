import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import type { Student, StudentInput } from '@/types'

const emptyForm: StudentInput = {
  name: '',
  grade: '',
  favorite_character: '',
  favorite_activity: '',
  notes: '',
}

interface StudentManagementProps {
  students: Student[]
  loading: boolean
  error: string | null
  onAdd: (input: StudentInput) => Promise<unknown>
  onEdit: (id: string, input: Partial<StudentInput>) => Promise<unknown>
  onDelete: (id: string) => Promise<void>
}

export function StudentManagement({
  students,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
}: StudentManagementProps) {
  const [form, setForm] = useState<StudentInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setFormError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!form.name || !form.grade || !form.favorite_character || !form.favorite_activity) {
      setFormError('필수 항목을 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await onEdit(editingId, form)
      } else {
        await onAdd(form)
      }
      resetForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (student: Student) => {
    setEditingId(student.id)
    setForm({
      name: student.name,
      grade: student.grade,
      favorite_character: student.favorite_character,
      favorite_activity: student.favorite_activity,
      notes: student.notes ?? '',
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 학생을 삭제할까요? 연결된 자료도 함께 삭제됩니다.')) return
    try {
      await onDelete(id)
      if (editingId === id) resetForm()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? '학생 수정' : '학생 등록'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">학생 이름</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="지우"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">학년</Label>
              <Input
                id="grade"
                value={form.grade}
                onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
                placeholder="초3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favorite_character">좋아하는 캐릭터</Label>
              <Input
                id="favorite_character"
                value={form.favorite_character}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, favorite_character: e.target.value }))
                }
                placeholder="브롤스타즈 멜로디"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favorite_activity">좋아하는 활동</Label>
              <Input
                id="favorite_activity"
                value={form.favorite_activity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, favorite_activity: e.target.value }))
                }
                placeholder="게임하기"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">특이사항 (선택)</Label>
              <Textarea
                id="notes"
                value={form.notes ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="학습 수준, 선호 스타일 등"
              />
            </div>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4" />
                {editingId ? '수정 저장' : '학생 추가'}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  취소
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingState message="학생 목록을 불러오는 중..." /> : null}
          {!loading && error ? (
            <EmptyState title="학생 목록을 불러올 수 없습니다" description={error} />
          ) : null}
          {!loading && !error && students.length === 0 ? (
            <EmptyState
              title="등록된 학생이 없습니다"
              description="왼쪽 폼에서 학생 정보를 먼저 등록해 주세요."
            />
          ) : null}
          {!loading && !error && students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {student.name}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({student.grade})
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      캐릭터: {student.favorite_character}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      활동: {student.favorite_activity}
                    </p>
                    {student.notes ? (
                      <p className="text-sm text-muted-foreground">특이사항: {student.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(student)}
                    >
                      <Pencil className="h-4 w-4" />
                      수정
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
