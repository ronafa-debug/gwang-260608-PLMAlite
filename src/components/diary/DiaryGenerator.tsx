import { useMemo, useRef, useState } from 'react'
import { Download, ImageIcon, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DiaryIllustrationPage,
  DiaryWorksheetTemplate,
} from '@/components/diary/DiaryWorksheet'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { StudentSelect } from '@/components/shared/StudentSelect'
import { useAuth } from '@/contexts/AuthContext'
import { generateDiary, saveDiaryMaterial } from '@/lib/api'
import { downloadSectionsAsPdf } from '@/lib/downloadPdf'
import { DIARY_PDF_WIDTH } from '@/lib/utils'
import type { DiaryGenerateResponse, Student } from '@/types'

interface DiaryGeneratorProps {
  students: Student[]
}

export function DiaryGenerator({ students }: DiaryGeneratorProps) {
  const { isDemo } = useAuth()
  const [studentId, setStudentId] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [result, setResult] = useState<DiaryGenerateResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const worksheetRef = useRef<HTMLDivElement>(null)

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === studentId),
    [students, studentId],
  )

  const handleGenerate = async () => {
    if (!selectedStudent) {
      setError('학생을 선택해 주세요.')
      return
    }
    if (!rawInput.trim()) {
      setError('학생이 한 일을 입력해 주세요.')
      return
    }

    setGenerating(true)
    setError(null)
    setSavedMessage(null)
    try {
      const response = await generateDiary({
        student: selectedStudent,
        rawInput,
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '그림일기 생성에 실패했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!worksheetRef.current || !selectedStudent || !result) return

    setDownloading(true)
    setError(null)
    try {
      const safeName = `${selectedStudent.name}_${result.title}`
        .replace(/[\\/:*?"<>|]/g, '')
        .slice(0, 40)
      const sections = worksheetRef.current.querySelectorAll<HTMLElement>('[data-pdf-section]')
      await downloadSectionsAsPdf(
        Array.from(sections),
        `그림일기_${safeName}.pdf`,
        {
          pageMarginMm: 0,
          fitOnSinglePage: result.illustrationUrl ? [1] : [],
        },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 다운로드에 실패했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedStudent || !result) return
    if (isDemo) {
      setError('데모 모드에서는 저장할 수 없습니다. 회원가입 후 이용해 주세요.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await saveDiaryMaterial({
        student_id: selectedStudent.id,
        title: result.title,
        raw_input: rawInput,
        final_text: result.sentences.join('\n'),
        image_url: result.illustrationUrl,
      })
      setSavedMessage('자료 라이브러리에 저장되었습니다.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (students.length === 0) {
    return (
      <EmptyState
        title="등록된 학생이 없습니다"
        description="학생 관리 탭에서 학생을 먼저 등록해 주세요."
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>그림일기 생성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>학생 선택</Label>
            <StudentSelect students={students} value={studentId} onChange={setStudentId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rawInput">학생이 한 일</Label>
            <Textarea
              id="rawInput"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={`주말에 아빠랑 바닷가에 갔어요.\n갈매기한테 새우깡을 주었어요.`}
              className="min-h-[140px]"
            />
          </div>
          <Button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generating}
          >
            <ImageIcon className="h-4 w-4" />
            {generating ? '생성 중...' : '그림일기 생성'}
          </Button>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {savedMessage ? <p className="text-sm text-primary">{savedMessage}</p> : null}

      {generating ? (
        <LoadingState message="AI가 그림일기와 색칠 그림을 만들고 있습니다..." />
      ) : null}

      {result && !generating ? (
        <div className="space-y-6">
          <div className="no-print flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDownloadPdf()}
              disabled={downloading}
            >
              <Download className="h-4 w-4" />
              {downloading ? 'PDF 생성 중...' : 'PDF 다운로드'}
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? '저장 중...' : '자료 라이브러리에 저장'}
            </Button>
          </div>

          <div
            ref={worksheetRef}
            className="print-area worksheet-pdf mx-auto bg-white"
            style={{ width: DIARY_PDF_WIDTH }}
          >
            <div data-pdf-section>
              <DiaryWorksheetTemplate title={result.title} sentences={result.sentences} />
            </div>
            {result.illustrationUrl ? (
              <div data-pdf-section>
                <DiaryIllustrationPage
                  illustrationUrl={result.illustrationUrl}
                  title={result.title}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
