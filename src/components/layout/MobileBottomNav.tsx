import {
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  ShoppingBag,
  Sparkles,
  BarChart3,
  Shield,
  Wrench,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isMaterialsSection, isStoreSection, type AppPage } from '@/types/navigation'

const primaryTabs: Array<{ id: AppPage; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: '홈', icon: LayoutDashboard },
  { id: 'tools', label: '도구', icon: Wrench },
  { id: 'generate', label: '학습', icon: Sparkles },
  { id: 'store', label: '스토어', icon: ShoppingBag },
]

const morePages: Array<{ id: AppPage; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }> = [
  { id: 'admin_orders', label: '주문 관리', icon: Shield, adminOnly: true },
  { id: 'admin_content', label: '콘텐츠·품질', icon: BarChart3, adminOnly: true },
  { id: 'settings', label: '설정', icon: Settings },
]

/** 장바구니·주문하기·내 주문은 스토어 하위 */
function isPrimaryActive(tabId: AppPage, activePage: AppPage, moreOpen: boolean) {
  if (moreOpen) return false
  if (tabId === 'store') return isStoreSection(activePage)
  if (tabId === 'generate') return isMaterialsSection(activePage)
  return activePage === tabId
}

function isMoreSheetActive(activePage: AppPage) {
  return (
    !isStoreSection(activePage) &&
    !isMaterialsSection(activePage) &&
    !primaryTabs.some((t) => t.id === activePage)
  )
}

interface MobileBottomNavProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  isAdmin?: boolean
  moreOpen: boolean
  onMoreOpenChange: (open: boolean) => void
}

export function MobileBottomNav({
  activePage,
  onNavigate,
  isAdmin = false,
  moreOpen,
  onMoreOpenChange,
}: MobileBottomNavProps) {
  const moreActive = moreOpen || isMoreSheetActive(activePage)
  const visibleMore = morePages.filter((p) => !p.adminOnly || isAdmin)

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="메뉴 닫기"
            onClick={() => onMoreOpenChange(false)}
          />
          <div className="absolute inset-x-0 bottom-16 z-50 mx-3 mb-1 rounded-2xl border border-border bg-card p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-foreground">더보기</p>
              <button
                type="button"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                onClick={() => onMoreOpenChange(false)}
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {visibleMore.map(({ id, label, icon: Icon }) => {
                const active = activePage === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onNavigate(id)
                      onMoreOpenChange(false)
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-medium',
                      active
                        ? 'bg-sidebar-active text-foreground'
                        : 'text-muted-foreground hover:bg-muted/70',
                    )}
                  >
                    <Icon className={cn('h-5 w-5', active && 'text-primary')} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
        aria-label="모바일 주요 메뉴"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {primaryTabs.map(({ id, label, icon: Icon }) => {
            const active = isPrimaryActive(id, activePage, moreOpen)
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onMoreOpenChange(false)
                  onNavigate(id)
                }}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => onMoreOpenChange(!moreOpen)}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium',
              moreActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="truncate">더보기</span>
          </button>
        </div>
      </nav>
    </>
  )
}
