import { useMemo, useRef, useState } from 'react'
import { BookOpen, Download, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { StudentSelect } from '@/components/shared/StudentSelect'
import { StorytellingWorksheet } from '@/components/storytelling/StorytellingWorksheet'
import { useAuth } from '@/contexts/AuthContext'
import { generateStorytelling, saveStorytellingMaterial } from '@/lib/api'
import { downloadSectionsAsPdf } from '@/lib/downloadPdf'
import type {
  StoryLength,
  StorytellingGenerateResponse,
  Student,
  Subject,
} from '@/types'

const subjects: Subject[] = ['국어', '수학', '사회', '과학', '기타']
const storyLengths: StoryLength[] = ['A4 절반', 'A4 한 장']

interface StorytellingGeneratorProps {
  students: Student[]
}

export function StorytellingGenerator({ students }: StorytellingGeneratorProps) {
  const { isDemo } = useAuth()
  const [studentId, setStudentId] = useState('')
  const [subject, setSubject] = useState<Subject>('국어')
  const [learningGoal, setLearningGoal] = useState('')
  const [storySituation, setStorySituation] = useState('')
  const [storyLength, setStoryLength] = useState<StoryLength>('A4 한 장')
  const [result, setResult] = useState<StorytellingGenerateResponse | null>(null)
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
    if (!learningGoal.trim() || !storySituation.trim()) {
      setError('학습목표와 스토리 상황을 입력해 주세요.')
      return
    }

    setGenerating(true)
    setError(null)
    setSavedMessage(null)
    try {
      const response = await generateStorytelling({
        student: selectedStudent,
        subject,
        learningGoal,
        storySituation,
        storyLength,
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '스토리텔링 생성에 실패했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!worksheetRef.current || !selectedStudent) return

    setDownloading(true)
    setError(null)
    try {
      const safeName = `${selectedStudent.name}_${subject}_${learningGoal}`
        .replace(/[\\/:*?"<>|]/g, '')
        .slice(0, 40)
      const sections = worksheetRef.current.querySelectorAll<HTMLElement>('[data-pdf-section]')
      await downloadSectionsAsPdf(
        Array.from(sections),
        `스토리텔링_${safeName}.pdf`,
        { fitOnSinglePage: [0, 1] },
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
      await saveStorytellingMaterial({
        student_id: selectedStudent.id,
        subject,
        learning_goal: learningGoal,
        story_situation: storySituation,
        story_length: storyLength,
        story_content: result.story,
        worksheet_content: result.questions,
        coloring_image_url: result.coloringImageUrl,
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
          <CardTitle>스토리텔링 학습지 생성</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>학생 선택</Label>
            <StudentSelect students={students} value={studentId} onChange={setStudentId} />
          </div>
          <div className="space-y-2">
            <Label>과목 선택</Label>
            <Select value={subject} onValueChange={(value) => setSubject(value as Subject)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="learningGoal">학습목표</Label>
            <Input
              id="learningGoal"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="인물의 성격 파악하기"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="storySituation">스토리 상황</Label>
            <Textarea
              id="storySituation"
              value={storySituation}
              onChange={(e) => setStorySituation(e.target.value)}
              placeholder="멜로디와 함께 브롤스타즈 하기"
            />
          </div>
          <div className="space-y-2">
            <Label>이야기 분량</Label>
            <Select
              value={storyLength}
              onValueChange={(value) => setStoryLength(value as StoryLength)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {storyLengths.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              className="w-full"
              onClick={() => void handleGenerate()}
              disabled={generating}
            >
              <BookOpen className="h-4 w-4" />
              {generating ? '생성 중...' : '스토리텔링 생성'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {savedMessage ? <p className="text-sm text-primary">{savedMessage}</p> : null}

      {generating ? <LoadingState message="AI가 맞춤 학습지를 만들고 있습니다..." /> : null}

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

          <div ref={worksheetRef} className="print-area">
            <StorytellingWorksheet
              story={result.story}
              questions={result.questions}
              coloringImageUrl={result.coloringImageUrl}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
