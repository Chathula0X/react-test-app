import { createContext, useContext, useMemo, useState } from 'react'
import { poems } from '../data/poems'
import { mathsQuestions } from '../data/maths'
import { scienceTopics } from '../data/science'

const STORAGE_KEY = 'little-learners-progress'

const defaultProgress = {
  poems: {},
  mathsBest: 0,
  science: {},
}

const StarsContext = createContext(null)

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress
    const parsed = JSON.parse(raw)
    return {
      poems: parsed.poems ?? {},
      mathsBest: Number(parsed.mathsBest) || 0,
      science: parsed.science ?? {},
    }
  } catch {
    return defaultProgress
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function StarsProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress)

  const value = useMemo(() => {
    const poemStars = Object.values(progress.poems).filter(Boolean).length
    const scienceStars = Object.values(progress.science).reduce(
      (sum, score) => sum + Number(score || 0),
      0,
    )
    const totalStars = poemStars + progress.mathsBest + scienceStars
    const maxStars =
      poems.length +
      mathsQuestions.length +
      scienceTopics.reduce((sum, topic) => sum + topic.quiz.length, 0)

    function update(next) {
      setProgress(next)
      saveProgress(next)
    }

    return {
      progress,
      totalStars,
      maxStars,
      poemStars,
      scienceStars,
      hasReadPoem(id) {
        return Boolean(progress.poems[id])
      },
      markPoemRead(id) {
        if (progress.poems[id]) return
        update({
          ...progress,
          poems: { ...progress.poems, [id]: true },
        })
      },
      saveMathsScore(score) {
        if (score <= progress.mathsBest) return
        update({ ...progress, mathsBest: score })
      },
      getScienceBest(id) {
        return Number(progress.science[id] || 0)
      },
      saveScienceScore(id, score) {
        const previous = Number(progress.science[id] || 0)
        if (score <= previous) return
        update({
          ...progress,
          science: { ...progress.science, [id]: score },
        })
      },
    }
  }, [progress])

  return <StarsContext.Provider value={value}>{children}</StarsContext.Provider>
}

export function useStars() {
  const context = useContext(StarsContext)
  if (!context) {
    throw new Error('useStars must be used inside StarsProvider')
  }
  return context
}
