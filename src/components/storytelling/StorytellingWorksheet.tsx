import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import type { WorksheetQuestion } from '@/types'

function questionTypeLabel(type: WorksheetQuestion['type']) {
  switch (type) {
    case 'multiple_choice':
      return '객관식'
    case 'short_answer':
      return '단답형'
    case 'essay':
      return '서술형'
  }
}

interface StorytellingWorksheetProps {
  story: string
  questions: WorksheetQuestion[]
  coloringImageUrl?: string | null
}

export function StorytellingWorksheet({
  story,
  questions,
  coloringImageUrl,
}: StorytellingWorksheetProps) {
  return (
    <div className="worksheet-pdf space-y-6 bg-white p-2">
      <div data-pdf-section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. 이야기</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-8">{story}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. 학습 문제 (5문항)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="space-y-2 border-b border-border pb-4 last:border-0">
                <p className="font-medium">
                  {index + 1}. [{questionTypeLabel(question.type)}] {question.question}
                </p>
                {question.options?.map((option) => (
                  <p key={option} className="pl-4 text-sm text-muted-foreground">
                    {option}
                  </p>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card data-pdf-section>
        <CardHeader>
          <CardTitle>3. 색칠하기 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          {coloringImageUrl ? (
            <img
              src={coloringImageUrl}
              alt="색칠하기 이미지"
              crossOrigin="anonymous"
              className="mx-auto max-h-[240mm] w-full object-contain"
            />
          ) : (
            <EmptyState title="이미지를 생성하지 못했습니다" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
