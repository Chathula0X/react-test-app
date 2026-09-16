import { useEffect, useMemo, useRef, useState } from 'react'
import ItemImage from '../components/ItemImage'
import SpeakerButton from '../components/SpeakerButton'
import { getItem } from '../lib/items'
import { t } from '../lib/i18n'
import { mulberry32, shuffle } from '../lib/rng'
import { playFile, playTone, speakSi } from '../lib/audio'
import type { ExerciseType, Item, StepResult } from '../types'

type McqOption = {
  id: string
  label?: string
  correct?: boolean
  en?: boolean
  image?: boolean
  item?: Item
}

type McqProps = {
  item: Item
  type: ExerciseType
  seed: number
  onResult: (result: StepResult) => void
}

export default function Mcq({ item, type, seed, onResult }: McqProps) {
  const [wrong, setWrong] = useState<string[]>([])
  const [good, setGood] = useState(false)
  const [rescue, setRescue] = useState(false)
  const settled = useRef(false)

  useEffect(() => {
    settled.current = false
    setWrong([])
    setGood(false)
    setRescue(false)
  }, [item.id, type, seed])

  useEffect(() => {
    if (type === 'MCQ_SI_TO_EN') {
      speakSi(item.si_sentence)
      return
    }
    playFile(type === 'IMAGE_MATCH' ? item.audio_sentence : item.audio_word)
  }, [item, type, seed])

  const options = useMemo<McqOption[]>(() => {
    const rng = mulberry32(seed)
    if (type === 'MCQ_SPELLING') {
      return shuffle(
        [{ id: item.en, label: item.en, correct: true }, ...item.distractors.spelling.map((s) => ({ id: s, label: s }))],
        rng,
      )
    }
    if (type === 'MCQ_SI_TO_EN') {
      return shuffle(
        [
          { id: item.en_sentence, label: item.en_sentence, correct: true, en: true },
          ...item.distractors.meaning_en.map((s) => ({ id: s, label: s, en: true })),
        ],
        rng,
      )
    }
    return shuffle(
      [
        { id: item.id, item, correct: true, image: true },
        ...item.distractors.image.map((id) => ({ id, item: getItem(id), image: true })),
      ].filter((opt) => Boolean(opt.item)),
      rng,
    )
  }, [item, type, seed])

  const title =
    type === 'MCQ_SPELLING'
      ? t('step.pickCorrectSpelling')
      : type === 'MCQ_SI_TO_EN'
        ? t('step.whatDoesThisMean')
        : t('step.pickTheImage')

  function finish(result: StepResult) {
    if (settled.current) return
    settled.current = true
    onResult(result)
  }

  function pick(opt: McqOption) {
    if (settled.current || good || rescue || wrong.includes(opt.id)) return
    if (opt.correct) {
      setGood(true)
      window.setTimeout(() => finish({ correct: true, rescued: false }), 800)
      playTone(true)
      return
    }
    playTone(false)
    const next = [...wrong, opt.id]
    setWrong(next)
    if (next.length >= 2) {
      setRescue(true)
      playFile(item.audio_word)
    }
  }

  if (rescue) {
    return (
      <div className="flex flex-1 flex-col items-center gap-3 text-center">
        <p className="si text-muted">{t('fb.theAnswerIs')}</p>
        <ItemImage item={item} />
        <p className="en text-4xl font-bold text-success">{item.en}</p>
        <p className="si text-xl">{item.si}</p>
        <button type="button" onClick={() => finish({ correct: false, rescued: true })} className="btn-primary mt-auto">
          {t('step.next')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="si text-center text-muted">{title}</p>
      {type === 'MCQ_SI_TO_EN' ? (
        <button type="button" onClick={() => speakSi(item.si_sentence)} className="si text-center text-2xl font-bold">
          {item.si_sentence}
        </button>
      ) : type === 'IMAGE_MATCH' ? (
        <div className="flex items-center justify-center gap-2">
          <button type="button" onClick={() => playFile(item.audio_sentence)} className="en text-xl">
            {item.en_sentence}
          </button>
          <SpeakerButton src={item.audio_sentence} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={() => playFile(item.audio_word)}>
            <ItemImage item={item} />
          </button>
          <SpeakerButton src={item.audio_word} />
        </div>
      )}
      <div className={type === 'IMAGE_MATCH' ? 'grid grid-cols-2 items-stretch gap-3' : 'grid gap-2 md:gap-3'}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => pick(opt)}
            className={`rounded-xl border-2 ${
              type === 'IMAGE_MATCH'
                ? 'aspect-square grid min-h-0 p-2.5 md:p-3'
                : 'min-h-12 p-3 md:min-h-14 md:p-4'
            } ${
              good && opt.correct
                ? 'border-success bg-success-soft'
                : wrong.includes(opt.id)
                  ? 'border-incorrect bg-incorrect-soft'
                  : type === 'IMAGE_MATCH'
                    ? 'border-border bg-primary-soft hover:border-border-interactive focus-visible:border-primary'
                    : 'border-border bg-surface hover:border-border-interactive hover:bg-primary-soft focus-visible:border-primary focus-visible:bg-primary-soft'
            }`}
          >
            {opt.image && opt.item ? (
              <ItemImage item={opt.item} size="sm" />
            ) : (
              <span className={opt.en || type === 'MCQ_SPELLING' ? 'en text-lg font-bold' : 'si'}>{opt.label}</span>
            )}
          </button>
        ))}
      </div>
      {wrong.length > 0 && !good && <p className="si text-center text-muted">{t('fb.tryAgain')}</p>}
      {good && (
        <>
          <p className="si text-center font-bold text-success">{t('fb.great')}</p>
          <button type="button" onClick={() => finish({ correct: true, rescued: false })} className="btn-primary mt-auto">
            {t('step.next')}
          </button>
        </>
      )}
    </div>
  )
}
