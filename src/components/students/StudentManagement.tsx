import { useState } from 'react'
import { ImagePlus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { useAuth } from '@/contexts/AuthContext'
import { uploadStudentPhoto } from '@/lib/api'
import type { Student, StudentInput } from '@/types'

const emptyForm: StudentInput = {
  name: '',
  grade: '',
  favorite_character: '',
  favorite_activity: '',
  notes: '',
  photo_path: null,
}

interface StudentManagementProps {
  students: Student[]
  loading: boolean
  error: string | null
  onAdd: (input: StudentInput) => Promise<unknown>
  onEdit: (id: string, input: Partial<StudentInput>) => Promise<unknown>
  onDelete: (id: string) => Promise<void>
  /** When true, omit page-level title (used inside 설정). */
  embedded?: boolean
}

export function StudentManagement({
  students,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  embedded = false,
}: StudentManagementProps) {
  const { isDemo } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<StudentInput>(emptyForm)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)

  const resetForm = () => {
    setForm(emptyForm)
    setPreviewUrl(null)
    setEditingId(null)
    setFormError(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (student: Student) => {
    setEditingId(student.id)
    setForm({
      name: student.name,
      grade: student.grade,
      favorite_character: student.favorite_character,
      favorite_activity: student.favorite_activity,
      notes: student.notes ?? '',
      photo_path: student.photo_path ?? null,
    })
    setPreviewUrl(student.photoUrl ?? student.photo_path ?? null)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) resetForm()
  }

  const handlePhotoSelect = async (file: File | null) => {
    if (!file) return
    setFormError(null)
    setUploading(true)
    try {
      const { path, previewUrl: url } = await uploadStudentPhoto(isDemo, file)
      setForm((prev) => ({ ...prev, photo_path: path }))
      setPreviewUrl(url)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '사진 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const clearPhoto = () => {
    setForm((prev) => ({ ...prev, photo_path: null }))
    setPreviewUrl(null)
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
      const payload: StudentInput = {
        ...form,
        notes: form.notes?.trim() ? form.notes : null,
        photo_path: form.photo_path ?? null,
      }
      if (editingId) {
        await onEdit(editingId, payload)
      } else {
        await onAdd(payload)
      }
      handleDialogChange(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const requestDelete = (student: Student) => {
    setDeleteTarget(student)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await onDelete(deleteTarget.id)
      if (editingId === deleteTarget.id) handleDialogChange(false)
      setDeleteTarget(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {embedded ? (
          <div>
            <h2 className="text-lg font-semibold text-foreground">학생 목록</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              등록된 학생을 확인하고 맞춤 학습에 활용하세요.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">학생 관리</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              등록된 학생을 확인하고 맞춤 학습에 활용하세요.
            </p>
          </div>
        )}
        <Button
          type="button"
          className="h-11 shrink-0 rounded-2xl px-5"
          onClick={openCreate}
        >
          학생 등록
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          {loading ? <LoadingState message="학생 목록을 불러오는 중..." /> : null}
          {!loading && error ? (
            <EmptyState title="학생 목록을 불러올 수 없습니다" description={error} />
          ) : null}
          {!loading && !error && students.length === 0 ? (
            <EmptyState
              title="등록된 학생이 없습니다"
              description="오른쪽 위 「학생 등록」으로 학생을 추가해 주세요."
            />
          ) : null}
          {!loading && !error && students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student) => {
                const photo =
                  student.photoUrl ??
                  (student.photo_path?.startsWith('data:') ||
                  student.photo_path?.startsWith('http')
                    ? student.photo_path
                    : null)
                return (
                  <div
                    key={student.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/70">
                        {photo ? (
                          <img
                            src={photo}
                            alt={`${student.name} 사진`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-foreground">
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
                          <p className="text-sm text-muted-foreground">
                            특이사항: {student.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 rounded-xl p-0 text-base"
                        aria-label="수정"
                        title="수정"
                        onClick={() => openEdit(student)}
                      >
                        ✏️
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 rounded-xl p-0 text-base"
                        aria-label="삭제"
                        title="삭제"
                        onClick={() => requestDelete(student)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? '학생 수정' : '학생 등록'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="student-photo">학생 사진 (선택)</Label>
              <div className="flex items-start gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/70">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="학생 사진 미리보기"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-8 w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    id="student-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading || submitting}
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      void handlePhotoSelect(file)
                      e.target.value = ''
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading || submitting}
                      onClick={() => document.getElementById('student-photo')?.click()}
                    >
                      <ImagePlus className="h-4 w-4" />
                      {uploading ? '업로드 중…' : previewUrl ? '사진 변경' : '사진 선택'}
                    </Button>
                    {previewUrl ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={uploading || submitting}
                        onClick={clearPhoto}
                      >
                        사진 제거
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    추천: 얼굴이 잘 보이는 상반신 사진 (jpg/png/webp, 4MB 이하)
                  </p>
                </div>
              </div>
            </div>

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

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={submitting || uploading} className="rounded-xl">
                {editingId ? '수정 저장' : '등록하기'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => handleDialogChange(false)}
              >
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>학생 삭제 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">{deleteTarget?.name}</span> 학생을 정말
              삭제할까요?
            </p>
            <p className="text-sm text-muted-foreground">
              삭제하면 이 학생과 연결된 학습 자료도 함께 삭제될 수 있으며, 되돌릴 수
              없습니다.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl"
                disabled={deleting}
                onClick={() => void confirmDelete()}
              >
                {deleting ? '삭제 중…' : '삭제하기'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
