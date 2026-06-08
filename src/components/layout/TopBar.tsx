import { Bell, LogOut, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopBarProps {
  teacherName: string
  isDemo: boolean
  onSignOut: () => void
}

export function TopBar({ teacherName, isDemo, onSignOut }: TopBarProps) {
  return (
    <header className="flex items-center justify-end gap-3 border-b border-border/60 bg-background/80 px-8 py-4 backdrop-blur-sm">
      {isDemo ? (
        <span
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium',
            'bg-accent-blue text-accent-blue-foreground',
          )}
        >
          데모 모드
        </span>
      ) : null}

      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="알림"
      >
        <Bell className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-sm ring-1 ring-border/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserRound className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-foreground">{teacherName}</span>
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
    </header>
  )
}
