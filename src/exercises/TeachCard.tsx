import { useEffect, useState } from 'react'
import ItemImage from '../components/ItemImage'
import SpeakerButton from '../components/SpeakerButton'
import { playFile } from '../lib/audio'
import { t } from '../lib/i18n'
import type { Item, StepResult } from '../types'

type TeachCardProps = {
  item: Item
  onResult: (result: StepResult) => void
}

export default function TeachCard({ item, onResult }: TeachCardProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    playFile(item.audio_word)
    const timer = setTimeout(() => setReady(true), 2000)
    return () => clearTimeout(timer)
  }, [item])

  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center md:gap-4">
      <ItemImage item={item} />
      <div className="flex items-center gap-2">
        <p className="en text-4xl font-bold md:text-5xl">{item.en}</p>
        <SpeakerButton src={item.audio_word} />
      </div>
      <p className="si text-xl md:text-2xl">{item.si}</p>
      <div className="w-full border-t border-border pt-3">
        <button type="button" onClick={() => playFile(item.audio_sentence)} className="en text-xl text-ink md:text-2xl">
          {item.en_sentence}
        </button>
        <p className="si text-muted md:text-lg">{item.si_sentence}</p>
      </div>
      <button
        type="button"
        disabled={!ready}
        onClick={() => onResult({ correct: true, rescued: false })}
        className="btn-primary mt-auto"
      >
        {t('step.next')}
      </button>
    </div>
  )
}
