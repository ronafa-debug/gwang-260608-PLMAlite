import {
  Award,
  BookOpen,
  CalendarDays,
  Car,
  ChevronRight,
  FileText,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { DemoNotice } from '@/components/shared/DemoNotice'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeDate } from '@/lib/utils'
import type { LibraryItem, Student, StorytellingMaterial } from '@/types'
import type { AppPage, GenerateTab } from '@/types/navigation'

interface DashboardProps {
  students: Student[]
  items: LibraryItem[]
  loading: boolean
  teacherName: string
  onNavigate: (page: AppPage) => void
  onGenerate: (tab: GenerateTab) => void
}

const demoSchedule = [
  { time: '09:00', title: '1학년 수학', count: 5 },
  { time: '10:30', title: '2학년 읽기', count: 4 },
  { time: '14:00', title: '개별 지도', count: 3 },
]

function getMaterialTitle(item: LibraryItem) {
  if (item.type === 'storytelling') {
    const data = item.data as StorytellingMaterial
    return `${data.students?.name ?? '학생'} · ${data.subject}`
  }
  return `${item.data.students?.name ?? '학생'} · ${item.data.title}`
}

function getMaterialSubtitle(item: LibraryItem) {
  if (item.type === 'storytelling') {
    const data = item.data as StorytellingMaterial
    return `${data.subject} — ${data.learning_goal}`
  }
  return '그림일기 — 원고지 따라쓰기'
}

function countThisWeek(items: LibraryItem[]) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  return items.filter((item) => new Date(item.data.created_at) >= weekStart).length
}

export function Dashboard({
  students,
  items,
  loading,
  teacherName,
  onNavigate,
  onGenerate,
}: DashboardProps) {
  const { isDemo, isAdmin } = useAuth()
  const recentItems = items.slice(0, 5)
  const stats = [
    {
      label: '등록 학생',
      value: students.length,
      icon: Users,
      iconClass: 'bg-blue-50 text-blue-600',
    },
    {
      label: '생성 자료',
      value: items.length,
      icon: FileText,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: '이번 주 생성',
      value: countThisWeek(items),
      icon: TrendingUp,
      iconClass: 'bg-violet-50 text-violet-600',
    },
    {
      label: '즐겨찾기',
      value: items.filter((item) =>
        item.type === 'diary' ? item.data.image_url : item.data.coloring_image_url,
      ).length,
      icon: Award,
      iconClass: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            안녕하세요, {teacherName}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            오늘도 아이들의 맞춤 학습 자료를 만들어 볼까요?
          </p>
        </div>
        <Button
          type="button"
          className="h-11 rounded-2xl px-5 shadow-sm"
          onClick={() => onGenerate('storytelling')}
        >
          <Sparkles className="h-4 w-4" />
          새 자료 생성
        </Button>
      </div>

      {isDemo ? (
        <DemoNotice>
          데모 모드입니다. 학생·자료·스토어 주문이 브라우저에만 보관됩니다.
          {isAdmin
            ? ' 사이드바에서 스토어 · 내 주문 · 주문 관리(관리자)를 순서대로 체험해 보세요.'
            : ' 스토어와 내 주문을 열어 후불 주문 흐름을 확인할 수 있습니다.'}
        </DemoNotice>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          onClick={() => onNavigate('store')}
        >
          <ShoppingBag className="h-4 w-4" />
          스토어
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          onClick={() => onNavigate('orders')}
        >
          내 주문
        </Button>
        {isAdmin ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={() => onNavigate('admin_orders')}
          >
            주문 관리
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, iconClass }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-0 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">최근 생성 자료</CardTitle>
            <button
              type="button"
              onClick={() => onNavigate('library')}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              전체 보기
              <ChevronRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? <LoadingState message="자료를 불러오는 중..." /> : null}
            {!loading && recentItems.length === 0 ? (
              <div className="rounded-2xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
                아직 생성된 자료가 없습니다. 새 자료를 만들어 보세요.
              </div>
            ) : null}
            {!loading
              ? recentItems.map((item) => (
                  <div
                    key={`${item.type}-${item.data.id}`}
                    className="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sidebar-active text-primary">
                      {item.type === 'storytelling' ? (
                        <BookOpen className="h-5 w-5" />
                      ) : (
                        <Car className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {getMaterialTitle(item)}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {getMaterialSubtitle(item)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {formatRelativeDate(item.data.created_at)}
                    </span>
                  </div>
                ))
              : null}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">오늘의 수업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoSchedule.map((slot) => (
              <div
                key={slot.time}
                className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{slot.time}</p>
                  <p className="text-sm text-muted-foreground">{slot.title}</p>
                </div>
                <span className="rounded-full bg-accent-blue px-2.5 py-1 text-xs font-medium text-accent-blue-foreground">
                  {slot.count}명
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
