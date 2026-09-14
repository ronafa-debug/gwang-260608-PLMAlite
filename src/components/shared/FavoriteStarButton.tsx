import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoriteStarButtonProps {
  active: boolean
  onToggle: () => void
  label: string
}

export function FavoriteStarButton({ active, onToggle, label }: FavoriteStarButtonProps) {
  return (
    <button
      type="button"
      aria-label={active ? `${label} 즐겨찾기 해제` : `${label} 즐겨찾기`}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        'absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors',
        active
          ? 'text-amber-500 hover:bg-amber-400/10'
          : 'text-muted-foreground/70 hover:bg-muted hover:text-foreground',
      )}
    >
      <Star
        className={cn(
          'h-4 w-4',
          active ? 'fill-amber-400 text-amber-500' : 'fill-transparent',
        )}
        strokeWidth={1.75}
      />
    </button>
  )
}
