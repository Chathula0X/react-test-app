import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { applyAnswer, emptyProgress, emptyState, loadState, saveState } from '../lib/progressStore'
import { generateLesson } from '../lib/lessonEngine'
import { getLessonMeta } from '../lib/items'
import type { ActiveLesson, AppState, LessonStep, Profile, StepResult } from '../types'

type AppContextValue = {
  ready: boolean
  profiles: Profile[]
  profile: Profile | null
  selectProfile: (id: string) => void
  addProfile: (name: string, avatar: string) => void
  startOrResumeLesson: () => void
  startLesson: (lessonNumber: number) => void
  answerStep: (step: LessonStep, result: StepResult) => void
}

function createActiveLesson(profile: Profile, lessonNumber: number): ActiveLesson | null {
  if (profile.activeLesson) return null
  if (!getLessonMeta(lessonNumber)) return null
  const lesson = generateLesson({
    lessonNumber,
    itemProgress: profile.itemProgress,
    seed: Date.now(),
  })
  return {
    ...lesson,
    stepIndex: 0,
    starsThisLesson: 0,
    quizWrong: false,
    newDone: {},
  }
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadState().then((loaded) => {
      if (!cancelled) {
        setState(loaded)
        setReady(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    saveState(state)
  }, [ready, state])

  const profile = state.profiles.find((p) => p.id === state.activeId) || null

  const api = useMemo<AppContextValue>(
    () => ({
      ready,
      profiles: state.profiles,
      profile,
      selectProfile(id) {
        setState((s) => ({ ...s, activeId: id }))
      },
      addProfile(name, avatar) {
        const id = crypto.randomUUID()
        const next: Profile = {
          id,
          name: name.trim() || 'ළමයා',
          avatar: avatar || '🦊',
          stars: 0,
          lessonNumber: 1,
          itemProgress: {},
          activeLesson: null,
        }
        setState((s) => ({ profiles: [...s.profiles, next], activeId: id }))
      },
      startLesson(lessonNumber) {
        if (!profile) return
        const activeLesson = createActiveLesson(profile, lessonNumber)
        if (!activeLesson) return
        setState((s) => ({
          ...s,
          profiles: s.profiles.map((p) => (p.id === s.activeId ? { ...p, activeLesson } : p)),
        }))
      },
      startOrResumeLesson() {
        if (!profile) return
        const activeLesson = createActiveLesson(profile, profile.lessonNumber)
        if (!activeLesson) return
        setState((s) => ({
          ...s,
          profiles: s.profiles.map((p) => (p.id === s.activeId ? { ...p, activeLesson } : p)),
        }))
      },
      answerStep(step, result) {
        setState((s) => ({
          ...s,
          profiles: s.profiles.map((p) => {
            if (p.id !== s.activeId || !p.activeLesson) return p
            const itemProgress = { ...p.itemProgress }
            const scoredSpeech =
              step.type === 'LISTEN_REPEAT' &&
              result.correct &&
              !result.rescued &&
              !result.skipped &&
              !result.unscored

            const ignore =
              result.skipped ||
              result.unscored ||
              (step.type === 'LISTEN_REPEAT' && !scoredSpeech)

            if (!ignore) {
              const prev = itemProgress[step.itemId] || emptyProgress()
              const scoredCorrect = Boolean(result.correct) && !result.rescued
              itemProgress[step.itemId] = applyAnswer(prev, scoredCorrect)
            }

            const lesson = { ...p.activeLesson }
            if (step.isQuiz && !ignore && !(result.correct && !result.rescued)) {
              lesson.quizWrong = true
            }

            if (step.awardsStar && result.correct && !result.skipped && !result.unscored) {
              lesson.newDone = { ...lesson.newDone, [step.itemId]: true }
              lesson.starsThisLesson += 1
            }

            const nextIndex = lesson.stepIndex + 1
            if (nextIndex >= lesson.steps.length) {
              const bonus = lesson.quizWrong ? 0 : 2
              const gained = lesson.starsThisLesson + bonus
              return {
                ...p,
                itemProgress,
                stars: p.stars + gained,
                lastStars: gained,
                lessonNumber: p.lessonNumber + 1,
                activeLesson: null,
              }
            }

            lesson.stepIndex = nextIndex
            return { ...p, itemProgress, activeLesson: lesson }
          }),
        }))
      },
    }),
    [ready, state, profile],
  )

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used inside AppProvider')
  }
  return context
}