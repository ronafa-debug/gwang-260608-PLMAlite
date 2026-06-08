import { BookOpen, ImageIcon } from 'lucide-react'
import { DiaryGenerator } from '@/components/diary/DiaryGenerator'
import { StorytellingGenerator } from '@/components/storytelling/StorytellingGenerator'
import { cn } from '@/lib/utils'
import type { Student } from '@/types'
import type { GenerateTab } from '@/types/navigation'

interface MaterialGeneratorProps {
  students: Student[]
  activeTab: GenerateTab
  onTabChange: (tab: GenerateTab) => void
}

const tabs: Array<{ id: GenerateTab; label: string; description: string; icon: typeof BookOpen }> =
  [
    {
      id: 'storytelling',
      label: '스토리텔링',
      description: '이야기와 학습 문제, 색칠하기',
      icon: BookOpen,
    },
    {
      id: 'diary',
      label: '그림일기',
      description: '원고지 따라쓰기와 일러스트',
      icon: ImageIcon,
    },
  ]

export function MaterialGenerator({ students, activeTab, onTabChange }: MaterialGeneratorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">학습 자료 생성</h1>
        <p className="mt-1 text-muted-foreground">
          학생 정보를 바탕으로 맞춤형 학습 자료를 만들어 보세요.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tabs.map(({ id, label, description, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                'flex items-start gap-4 rounded-2xl border p-5 text-left transition-all',
                active
                  ? 'border-primary/30 bg-sidebar-active shadow-sm'
                  : 'border-border/80 bg-card hover:border-primary/20 hover:bg-muted/30',
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl',
                  active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:p-6">
        {activeTab === 'storytelling' ? (
          <StorytellingGenerator students={students} />
        ) : (
          <DiaryGenerator students={students} />
        )}
      </div>
    </div>
  )
}
