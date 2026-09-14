import { Bell, LogOut, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopBarProps {
  teacherName: string
  isDemo: boolean
  onSignOut: () => void
  leading?: ReactNode
}

export function TopBar({ teacherName, isDemo, onSignOut, leading }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:justify-end lg:px-8 lg:py-4">
      <div className="flex items-center gap-2 lg:hidden">{leading}</div>

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {isDemo ? (
          <span
            title="브라우저에만 저장됩니다. 스토어·관리자 주문 관리 포함"
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:py-1.5 sm:text-sm',
              'bg-accent-blue text-accent-blue-foreground',
            )}
          >
            데모
          </span>
        ) : null}

        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
          aria-label="알림"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-card px-2.5 py-1.5 shadow-sm ring-1 ring-border/60 sm:px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRound className="h-4 w-4" />
          </div>
          <span className="max-w-[7rem] truncate text-sm font-medium text-foreground sm:max-w-none">
            {teacherName}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={onSignOut}
            aria-label="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
