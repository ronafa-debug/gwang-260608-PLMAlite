import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
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
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onNavigate={onNavigate} isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar teacherName={teacherName} isDemo={isDemo} onSignOut={onSignOut} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
