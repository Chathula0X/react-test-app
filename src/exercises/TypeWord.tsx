import { useState } from 'react'
import ItemImage from '../components/ItemImage'
import LatinInput, { sameWord } from '../components/LatinInput'
import { t } from '../lib/i18n'
import { playTone } from '../lib/audio'
import type { Item, StepResult } from '../types'

type TypeWordProps = {
  item: Item
  onResult: (result: StepResult) => void
}

export default function TypeWord({ item, onResult }: TypeWordProps) {
  const [value, setValue] = useState('')
  const [reps, setReps] = useState(0)
  const [fails, setFails] = useState(0)
  const [rescue, setRescue] = useState(false)

  function submit() {
    if (sameWord(value, item.en)) {
      const next = reps + 1
      setReps(next)
      setValue('')
      setFails(0)
      playTone(true)
      if (next >= 3) onResult({ correct: true, rescued: rescue })
      return
    }
    playTone(false)
    const nextFails = fails + 1
    setFails(nextFails)
    if (nextFails >= 4) {
      setRescue(true)
      setValue('')
      setReps(3)
      setTimeout(() => onResult({ correct: true, rescued: true }), 1200)
    }
  }

  if (rescue) {
    return (
      <div className="flex flex-1 flex-col items-center gap-3 text-center">
        <p className="si text-muted">{t('fb.theAnswerIs')}</p>
        <p className="en text-4xl font-bold text-success">{item.en}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <p className="si text-muted">{t('step.typeTheWord')}</p>
      <ItemImage item={item} />
      <p className="en text-3xl font-bold">{item.en}</p>
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
