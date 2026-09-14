/** Lightweight Web Audio helpers for classroom tools (no asset files). */

let sharedCtx: AudioContext | null = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!sharedCtx) {
    sharedCtx = new AudioContext()
  }
  return sharedCtx
}

export function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
) {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  g.gain.value = gain
  osc.connect(g)
  g.connect(ctx.destination)
  const now = ctx.currentTime
  osc.start(now)
  g.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000)
  osc.stop(now + durationMs / 1000 + 0.02)
}

export function playBeep() {
  playTone(880, 180, 'square', 0.1)
}

export function playApplause() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  for (let i = 0; i < 8; i++) {
    window.setTimeout(() => {
      playTone(200 + Math.random() * 600, 40, 'triangle', 0.06)
    }, i * 45)
  }
}

export function playChime() {
  playTone(523, 120)
  window.setTimeout(() => playTone(659, 120), 100)
  window.setTimeout(() => playTone(784, 220), 200)
}

/** Soft looping pad while timer runs — call stop() when done. */
export function startSoftBgm(): () => void {
  const ctx = getCtx()
  if (!ctx) return () => undefined
  void ctx.resume()

  const oscA = ctx.createOscillator()
  const oscB = ctx.createOscillator()
  const g = ctx.createGain()
  oscA.type = 'sine'
  oscB.type = 'sine'
  oscA.frequency.value = 220
  oscB.frequency.value = 277
  g.gain.value = 0.03
  oscA.connect(g)
  oscB.connect(g)
  g.connect(ctx.destination)
  oscA.start()
  oscB.start()

  return () => {
    try {
      oscA.stop()
      oscB.stop()
    } catch {
      /* already stopped */
    }
  }
}
