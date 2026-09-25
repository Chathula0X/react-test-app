import { useEffect, useRef, useState } from 'react'
import ItemImage from '../components/ItemImage'
import SpeakerButton from '../components/SpeakerButton'
import { playFile, playTone } from '../lib/audio'
import { t } from '../lib/i18n'
import type { Item, StepResult } from '../types'

const PRACTICE_MODE = true
const MAX_MS = 5000
const SILENCE_RMS = 0.02

type ListenRepeatProps = {
  item: Item
  onResult: (result: StepResult) => void
  onSilence: () => void
}

export default function ListenRepeat({ item, onResult, onSilence }: ListenRepeatProps) {
  const [phase, setPhase] = useState<'ready' | 'listening' | 'retry' | 'silence' | 'rescue'>('ready')
  const [level, setLevel] = useState(0)
  const scoredFails = useRef(0)
  const settled = useRef(false)
  const alive = useRef(true)
  const cleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    alive.current = true
    playFile(item.audio_sentence)
    return () => {
      alive.current = false
      cleanup.current?.()
      cleanup.current = null
    }
  }, [item])

  function finish(result: StepResult) {
    if (!alive.current || settled.current) return
    settled.current = true
    onResult(result)
  }

  async function record() {
    setPhase('listening')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      finish({ correct: true, rescued: false, skipped: true })
      return
    }

    if (!alive.current || typeof MediaRecorder === 'undefined') {
      stream.getTracks().forEach((track) => track.stop())
      if (alive.current) finish({ correct: true, rescued: false, skipped: true })
      return
    }

    const ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    const data = new Float32Array(analyser.fftSize)

    const chunks: BlobPart[] = []
    const recorder = new MediaRecorder(stream)
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data)
    }

    let heard = false
    let silentMs = 0
    let aborted = false
    const started = Date.now()

    const tick = window.setInterval(() => {
      analyser.getFloatTimeDomainData(data)
      let sum = 0
      for (const sample of data) sum += sample * sample
      const rms = Math.sqrt(sum / data.length)
      setLevel(Math.min(1, rms * 8))
      if (rms > SILENCE_RMS) {
        heard = true
        silentMs = 0
      } else if (heard) {
        silentMs += 80
      }
      if (Date.now() - started >= MAX_MS || silentMs >= 700) stop()
    }, 80)

    function release() {
      window.clearInterval(tick)
      stream.getTracks().forEach((track) => track.stop())
      ctx.close().catch(() => {})
      setLevel(0)
    }

    function stop() {
      window.clearInterval(tick)
      if (recorder.state !== 'inactive') recorder.stop()
    }

    cleanup.current = () => {
      aborted = true
      stop()
      release()
    }

    recorder.onstop = async () => {
      cleanup.current = null
      release()
      if (aborted || !alive.current) return

      if (!heard) {
        setPhase('silence')
        onSilence()
        playFile(item.audio_sentence)
        window.setTimeout(() => {
          if (alive.current) setPhase('ready')
        }, 1200)
        return
      }

      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      const url = URL.createObjectURL(blob)

      if (PRACTICE_MODE) {
        const replay = new Audio(url)
        try {
          await new Promise<void>((resolve) => {
            let ended = false
            let durationWait = 0
            const done = () => {
              if (ended) return
              ended = true
              window.clearTimeout(fallback)
              window.clearTimeout(durationWait)
              replay.onended = null
              replay.onerror = null
              resolve()
            }
            const fallback = window.setTimeout(done, 6000)
            cleanup.current = () => {
              aborted = true
              replay.pause()
              replay.removeAttribute('src')
              replay.load()
              done()
            }
            replay.onended = done
            replay.onerror = done
            replay
              .play()
              .then(() => {
                const ms = replay.duration
                if (Number.isFinite(ms) && ms > 0) {
                  window.clearTimeout(fallback)
                  durationWait = window.setTimeout(done, Math.ceil(ms * 1000) + 80)
                }
              })
              .catch(done)
          })
        } finally {
          cleanup.current = null
          URL.revokeObjectURL(url)
        }
        if (!alive.current || aborted) return
        playTone(true)
        finish({ correct: true, rescued: false, unscored: true })
        return
      }

      URL.revokeObjectURL(url)
      // Later: replace this with the Phase 0 scorer.
      // pass → finish({ correct: true, rescued: false })
      // low score → scoredFails.current += 1; if >= 3 rescue else setPhase('retry') and replay model
      void scoredFails
    }

    try {
      recorder.start()
    } catch {
      cleanup.current = null
      release()
      finish({ correct: true, rescued: false, skipped: true })
    }
  }

  if (phase === 'rescue') {
    return (
      <div className="flex flex-1 flex-col items-center gap-3 text-center">
        <p className="si text-muted">{t('fb.theAnswerIs')}</p>
        <p className="en text-3xl font-bold">{item.en_sentence}</p>
        <SpeakerButton src={item.audio_sentence} />
        <button
          type="button"
          className="btn-primary mt-auto"
          onClick={() => finish({ correct: true, rescued: true })}
        >
          {t('step.next')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <p className="si text-muted">{t('step.sayIt')}</p>
      <ItemImage item={item} />
      <p className="en text-2xl font-bold">{item.en_sentence}</p>
      <p className="si text-lg text-soft">{item.si}</p>
      <SpeakerButton src={item.audio_sentence} />

      <div className="h-2 w-40 overflow-hidden rounded-full bg-border">
        <i className="block h-full bg-primary" style={{ width: `${level * 100}%` }} />
      </div>

      <p className="si text-soft">
        {phase === 'listening'
          ? t('step.listening')
          : phase === 'silence'
            ? t('fb.didntHear')
            : phase === 'retry'
              ? t('fb.sayAgain')
              : t('step.tapMic')}
      </p>

      <button
        type="button"
        disabled={phase === 'listening'}
        onClick={record}
        className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl text-white"
      >
        🎤
      </button>
    </div>
  )
}