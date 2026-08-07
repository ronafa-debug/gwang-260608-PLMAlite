import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DemoNoticeProps {
  children: React.ReactNode
  className?: string
}

/** In-app tip shown only in demo mode (store flows). */
export function DemoNotice({ children, className }: DemoNoticeProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex gap-3 rounded-2xl border border-accent-blue/30 bg-accent-blue/40 px-4 py-3 text-sm text-accent-blue-foreground',
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  )
}
