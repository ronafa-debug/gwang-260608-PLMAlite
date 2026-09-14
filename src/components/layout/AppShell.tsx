import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'
import type { AppPage } from '@/types/navigation'

interface AppShellProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  teacherName: string
  isDemo: boolean
  isAdmin?: boolean
  onSignOut: () => void
  children: ReactNode
}

export function AppShell({
  activePage,
  onNavigate,
  teacherName,
  isDemo,
  isAdmin = false,
  onSignOut,
  children,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navigate = (page: AppPage) => {
    onNavigate(page)
    setMobileNavOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar activePage={activePage} onNavigate={navigate} isAdmin={isAdmin} />
      </div>

      {/* Mobile drawer sidebar */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="메뉴 닫기"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex max-w-[85vw] shadow-xl">
            <Sidebar activePage={activePage} onNavigate={navigate} isAdmin={isAdmin} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          teacherName={teacherName}
          isDemo={isDemo}
          onSignOut={onSignOut}
          leading={
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="메뉴 열기"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          }
        />
        <main
          className={cn(
            'flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6',
            'pb-24 lg:pb-6',
          )}
        >
          {children}
        </main>
      </div>

      <MobileBottomNav activePage={activePage} onNavigate={navigate} />
    </div>
  )
}
