import {
  BarChart3,
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  Leaf,
  Settings,
  Users,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppPage } from '@/types/navigation'

const navItems: Array<{ id: AppPage; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'students', label: '학생 관리', icon: Users },
  { id: 'generate', label: '학습 자료 생성', icon: Sparkles },
  { id: 'library', label: '자료 라이브러리', icon: FolderOpen },
  { id: 'reports', label: '리포트', icon: BarChart3 },
  { id: 'settings', label: '설정', icon: Settings },
]

interface SidebarProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border/80 bg-sidebar px-4 py-6">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-foreground">PLMA</p>
          <p className="text-xs text-muted-foreground">맞춤 학습 자료</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-active text-foreground'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-6 rounded-2xl bg-muted/60 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BookOpen className="h-4 w-4 text-primary" />
          PLMA Lite
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          모든 아이는 자신만의 길을 가진다
        </p>
      </div>
    </aside>
  )
}
