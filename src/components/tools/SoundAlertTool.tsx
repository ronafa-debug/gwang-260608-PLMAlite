import { Button } from '@/components/ui/button'
import { playApplause, playBeep, playChime } from '@/components/tools/audioHelpers'

export function SoundAlertTool() {
  return (
    <div className="mx-auto grid max-w-md gap-3 sm:grid-cols-1">
      <Button
        type="button"
        className="h-16 rounded-2xl text-lg"
        onClick={() => playApplause()}
      >
        박수
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-16 rounded-2xl text-lg"
        onClick={() => playBeep()}
      >
        짧은 알림 (삐)
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-16 rounded-2xl text-lg"
        onClick={() => playChime()}
      >
        차임 (전환)
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        기기 소리가 켜져 있어야 들립니다. 브라우저가 처음 재생을 막을 수 있어요.
      </p>
    </div>
  )
}
