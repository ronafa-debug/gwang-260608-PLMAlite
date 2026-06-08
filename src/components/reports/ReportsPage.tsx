import { BarChart3, BookOpen, FileText, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import type { LibraryItem } from '@/types'

interface ReportsPageProps {
  items: LibraryItem[]
  studentCount: number
  loading: boolean
}

export function ReportsPage({ items, studentCount, loading }: ReportsPageProps) {
  const storytellingCount = items.filter((item) => item.type === 'storytelling').length
  const diaryCount = items.filter((item) => item.type === 'diary').length

  const bySubject = items
    .filter((item) => item.type === 'storytelling')
    .reduce<Record<string, number>>((acc, item) => {
      const subject = item.data.subject
      acc[subject] = (acc[subject] ?? 0) + 1
      return acc
    }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">리포트</h1>
        <p className="mt-1 text-muted-foreground">생성 자료와 학생 현황을 한눈에 확인합니다.</p>
      </div>

      {loading ? <LoadingState message="리포트를 불러오는 중..." /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{studentCount}</p>
              <p className="text-sm text-muted-foreground">등록 학생</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-sm text-muted-foreground">전체 자료</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{storytellingCount}</p>
              <p className="text-sm text-muted-foreground">스토리텔링</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{diaryCount}</p>
              <p className="text-sm text-muted-foreground">그림일기</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">과목별 스토리텔링 자료</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(bySubject).length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 스토리텔링 자료가 없습니다.</p>
          ) : (
            Object.entries(bySubject).map(([subject, count]) => (
              <div
                key={subject}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"
              >
                <span className="font-medium">{subject}</span>
                <span className="text-sm text-muted-foreground">{count}건</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
