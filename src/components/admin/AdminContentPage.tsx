import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Clock,
  FileText,
  ImageIcon,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchContentQualityStats,
  formatDurationMs,
} from '@/lib/adminContentApi'
import { formatDateTime } from '@/lib/utils'
import type { ContentQualityStats } from '@/types/adminContent'

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string | number
  hint?: string
  icon: typeof FileText
  iconClass: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminContentPage() {
  const { isDemo, isAdmin } = useAuth()
  const [stats, setStats] = useState<ContentQualityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchContentQualityStats(isDemo)
      setStats(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '콘텐츠 통계를 불러오지 못했습니다. 마이그레이션 009를 적용했는지 확인해 주세요.',
      )
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void load()
  }, [load])

  if (!isAdmin) {
    return (
      <p className="text-sm text-muted-foreground">관리자만 접근할 수 있습니다.</p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">콘텐츠 · 품질</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            학습 자료 생성·저장·실패 현황을 확인합니다.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => void load()}
        >
          <RefreshCw className="h-4 w-4" />
          새로고침
        </Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">불러오는 중...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {stats && !loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="저장된 자료"
              value={stats.materialsTotal}
              hint={`스토리 ${stats.storytellingTotal} · 일기 ${stats.diaryTotal}`}
              icon={FileText}
              iconClass="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              label="최근 7일 저장"
              value={stats.last7DaysSaved}
              hint={`30일 ${stats.last30DaysSaved}건`}
              icon={BookOpen}
              iconClass="bg-blue-50 text-blue-600"
            />
            <StatCard
              label="이미지 포함"
              value={`${stats.withImageRate}%`}
              hint={`${stats.withImageCount} / ${stats.materialsTotal}`}
              icon={ImageIcon}
              iconClass="bg-amber-50 text-amber-700"
            />
            <StatCard
              label="생성 교사 수"
              value={stats.activeTeachers}
              hint="자료가 1건 이상인 계정"
              icon={Users}
              iconClass="bg-violet-50 text-violet-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="생성 성공률"
              value={`${stats.generateSuccessRate}%`}
              hint={`성공 ${stats.generateSuccess} · 실패 ${stats.generateFailed}`}
              icon={RefreshCw}
              iconClass="bg-primary/10 text-primary"
            />
            <StatCard
              label="생성 후 저장률"
              value={`${stats.saveRate}%`}
              hint={`저장 ${stats.savedEvents} / 성공 ${stats.generateSuccess}`}
              icon={FileText}
              iconClass="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              label="평균 생성 시간"
              value={formatDurationMs(stats.avgDurationMs)}
              hint="성공한 생성만"
              icon={Clock}
              iconClass="bg-sky-50 text-sky-700"
            />
            <StatCard
              label="삭제 이벤트"
              value={stats.deletedEvents}
              hint="라이브러리에서 삭제"
              icon={Trash2}
              iconClass="bg-rose-50 text-rose-600"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">과목별 스토리텔링 (저장)</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.subjectCounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">아직 데이터가 없습니다.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.subjectCounts.map(({ subject, count }) => (
                      <li
                        key={subject}
                        className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm"
                      >
                        <span>{subject}</span>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">최근 생성 실패</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentFailures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">최근 실패 기록이 없습니다.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.recentFailures.map((row, index) => (
                      <li
                        key={`${row.created_at}-${index}`}
                        className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2 font-medium text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {row.material_type === 'storytelling' ? '스토리텔링' : '그림일기'}
                        </div>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          {row.error_code || '원인 미상'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(row.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">최근 저장 자료</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentMaterials.length === 0 ? (
                <p className="text-sm text-muted-foreground">저장된 자료가 없습니다.</p>
              ) : (
                <ul className="divide-y divide-border/70">
                  {stats.recentMaterials.map((row) => (
                    <li
                      key={`${row.type}-${row.id}`}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{row.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.type === 'storytelling' ? '스토리텔링' : '그림일기'}
                          {row.hasImage ? ' · 이미지' : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDateTime(row.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
