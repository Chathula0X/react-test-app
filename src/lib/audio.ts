export function playFile(src?: string) {
  if (!src) return
  const audio = new Audio(src)
  audio.play().catch(() => {})
}

export function playTone(ok: boolean) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = ok ? 880 : 220
    gain.gain.value = 0.05
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.18)
    osc.onended = () => {
      ctx.close().catch(() => {})
    }
  } catch {
    /* sound is optional — never block a step */
  }
}
