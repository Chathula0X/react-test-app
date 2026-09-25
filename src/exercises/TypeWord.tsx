import { useEffect, useRef, useState } from 'react'
import ItemImage from '../components/ItemImage'
import LatinInput, { sameWord } from '../components/LatinInput'
import { t } from '../lib/i18n'
import { playFile, playTone } from '../lib/audio'
import type { Item, StepResult } from '../types'

type TypeWordProps = {
  item: Item
  onResult: (result: StepResult) => void
  audioOnly?: boolean
}

export default function TypeWord({ item, onResult, audioOnly = false }: TypeWordProps) {
  const [value, setValue] = useState('')
  const [reps, setReps] = useState(0)
  const [fails, setFails] = useState(0)
  const [rescue, setRescue] = useState(false)
  const [shown, setShown] = useState('')
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    if (!audioOnly) return
    playFile(item.audio_word)
  }, [audioOnly, item.audio_word])

  useEffect(() => {
    if (!rescue) return
    playFile(item.audio_word)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(item.en.slice(0, i))
      if (i >= item.en.length) {
        window.clearInterval(id)
        window.setTimeout(() => onResultRef.current({ correct: true, rescued: true }), 800)
      }
    }, 350)
    return () => window.clearInterval(id)
  }, [rescue, item.en, item.audio_word])

  function submit() {
    if (sameWord(value, item.en)) {
      const next = reps + 1
      setReps(next)
      setValue('')
      setFails(0)
      playTone(true)
      if (next >= 3) onResult({ correct: true, rescued: false })
      return
    }
    playTone(false)
    const nextFails = fails + 1
    setFails(nextFails)
    if (nextFails >= (audioOnly ? 3 : 4)) {
      setRescue(true)
      setValue('')
    }
  }

  if (rescue) {
    return (
      <div className="flex flex-1 flex-col items-center gap-3 text-center">
        <p className="si text-muted">{t('fb.theAnswerIs')}</p>
        <p className="en text-4xl font-bold text-success">{shown || ' '}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <p className="si text-muted">{audioOnly ? t('step.listenAndType') : t('step.typeTheWord')}</p>
      {!audioOnly && <ItemImage item={item} />}
      {!audioOnly && <p className="en text-3xl font-bold">{item.en}</p>}
      {audioOnly && (
        <button
          type="button"
          onClick={() => playFile(item.audio_word)}
          className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-2xl"
          aria-label={t('step.listen')}
        >
          🔊
        </button>
      )}
      <LatinInput value={value} onChange={setValue} autoFocus />
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            className={`block h-3 w-3 rounded-full ${i < reps ? 'bg-success' : 'border-2 border-border'}`}
          />
        ))}
      </div>
      <button type="button" onClick={submit} className="btn-primary mt-auto">
        {t('step.next')}
      </button>
    </div>
  )
}
