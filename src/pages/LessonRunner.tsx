import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import TeachCard from '../exercises/TeachCard'
import WordBuild from '../exercises/WordBuild'
import TypeWord from '../exercises/TypeWord'
import ListenRepeat from '../exercises/ListenRepeat'
import Mcq from '../exercises/Mcq'
import { useApp } from '../hooks/useApp'
import { playFile } from '../lib/audio'
import { instructionSrc } from '../lib/instructions'
import { getItem } from '../lib/items'
import { t } from '../lib/i18n'
import { askMic, getMicSession, setMicSession, type MicSession } from '../lib/mic'
import type { StepResult } from '../types'

const skippedKeys = new Set<string>()

export default function LessonRunner() {
  const { ready, profile, answerStep } = useApp()
  const navigate = useNavigate()
  const [exit, setExit] = useState(false)
  const [mic, setMic] = useState<MicSession>(() => {
    try {
      return getMicSession()
    } catch {
      return 'unknown'
    }
  })
  const [quietHint, setQuietHint] = useState(false)
  const finishing = useRef(false)
  const skipped = useRef<number | null>(null)
  const silences = useRef(0)
  const lesson = profile?.activeLesson
  const step = lesson?.steps[lesson.stepIndex]
  const item = step ? getItem(step.itemId) : undefined

  useEffect(() => {
    if (!ready) return
    if (!profile) {
      navigate('/', { replace: true })
      return
    }
    if (!profile.activeLesson && !finishing.current) {
      navigate('/home', { replace: true })
    }
  }, [ready, profile, navigate])

  useEffect(() => {
    if (!step) return
    playFile(instructionSrc[step.type])
  }, [step, lesson?.stepIndex])

  useLayoutEffect(() => {
    if (!lesson || !step || step.type !== 'LISTEN_REPEAT') return
    if (mic !== 'denied') return
    const skipKey = `${lesson.seed}-${lesson.stepIndex}`
    if (skippedKeys.has(skipKey) || skipped.current === lesson.stepIndex) return
    skippedKeys.add(skipKey)
    skipped.current = lesson.stepIndex
    const last = lesson.stepIndex >= lesson.steps.length - 1
    if (last) finishing.current = true
    answerStep(step, { correct: true, rescued: false, skipped: true })
    if (last) navigate('/complete', { replace: true })
  }, [mic, lesson, step, answerStep, navigate])

  if (!ready || !profile || !lesson || !step || !item) return null

  const currentLesson = lesson
  const currentStep = step
  const currentItem = item

  function onResult(result: StepResult) {
    const last = currentLesson.stepIndex >= currentLesson.steps.length - 1
    if (last) finishing.current = true
    answerStep(currentStep, result)
    if (last) navigate('/complete', { replace: true })
  }

  const seed = currentLesson.seed + currentLesson.stepIndex
  const stepKey = `${currentLesson.stepIndex}-${currentStep.type}-${currentStep.itemId}`
  const view =
    currentStep.type === 'TEACH_CARD' ? (
      <TeachCard key={stepKey} item={currentItem} onResult={onResult} />
    ) : currentStep.type === 'WORD_BUILD' ? (
      <WordBuild key={stepKey} item={currentItem} seed={seed} onResult={onResult} />
    ) : currentStep.type === 'TYPE_WORD' || currentStep.type === 'SPELL_FROM_AUDIO' ? (
      <TypeWord
        key={stepKey}
        item={currentItem}
        audioOnly={currentStep.type === 'SPELL_FROM_AUDIO'}
        onResult={onResult}
      />
    ) : currentStep.type === 'LISTEN_REPEAT' ? (
      mic === 'unknown' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="si text-xl">{t('mic.ask')}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              void askMic().then(setMic)
            }}
          >
            {t('step.tapMic')}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setMicSession('denied')
              setMic('denied')
              onResult({ correct: true, rescued: false, skipped: true })
            }}
          >
            {t('mic.skip')}
          </button>
        </div>
      ) : mic === 'denied' ? null : (
        <ListenRepeat
          key={stepKey}
          item={currentItem}
          onResult={onResult}
          onSilence={() => {
            silences.current += 1
            if (silences.current === 2) setQuietHint(true)
          }}
        />
      )
    ) : (
      <Mcq key={stepKey} item={currentItem} type={currentStep.type} seed={seed} onResult={onResult} />
    )

  const total = currentLesson.steps.length
  const current = Math.min(currentLesson.stepIndex + 1, total)

  return (
    <AppShell>
      <header className="mb-3 flex items-center gap-3">
        <button type="button" className="grid h-12 w-12 shrink-0 place-items-center text-xl text-ink" onClick={() => setExit(true)}>
          ✕
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <i className="si block h-full rounded-full bg-primary" style={{ width: `${(current / total) * 100}%` }} />
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold text-ink">⭐ {profile.stars}</span>
      </header>
      {view}
      {quietHint && <p className="si mt-2 text-center text-soft">{t('fb.quietPlace')}</p>}
      {exit && (
        <div className="fixed inset-0 z-20 bg-ink/40">
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface p-5 md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(100%-2rem,24rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl">
            <p className="si text-center text-xl font-bold text-ink">{t('exit.confirm')}</p>
            <p className="si mb-4 text-center text-soft">{t('exit.safe')}</p>
            <button type="button" className="btn-primary mb-2" onClick={() => setExit(false)}>
              {t('exit.stay')}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/home')}>
              {t('exit.stop')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
