import { Sparkles } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">PLMA Lite</h1>
          <p className="text-sm text-muted-foreground">
            Personalized Learning Material AI — 모든 아이는 자신만의 길을 가진다
          </p>
        </div>
      </div>
    </header>
  )
}
