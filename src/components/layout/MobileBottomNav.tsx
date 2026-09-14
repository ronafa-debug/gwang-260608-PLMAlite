import {
  LayoutDashboard,
  MessagesSquare,
  Settings,
  ShoppingBag,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isMaterialsSection, isStoreSection, type AppPage } from '@/types/navigation'

const primaryTabs: Array<{ id: AppPage; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: '홈', icon: LayoutDashboard },
  { id: 'tools', label: '도구', icon: Wrench },
  { id: 'generate', label: '자료', icon: Sparkles },
  { id: 'community', label: '커뮤니티', icon: MessagesSquare },
  { id: 'store', label: '스토어', icon: ShoppingBag },
  { id: 'settings', label: '설정', icon: Settings },
]

function isTabActive(tabId: AppPage, activePage: AppPage) {
  if (tabId === 'store') return isStoreSection(activePage)
  if (tabId === 'generate') return isMaterialsSection(activePage)
  return activePage === tabId
}

interface MobileBottomNavProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

export function MobileBottomNav({ activePage, onNavigate }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
      aria-label="모바일 주요 메뉴"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {primaryTabs.map(({ id, label, icon: Icon }) => {
          const active = isTabActive(id, activePage)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-2 text-[11px] font-medium',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
