import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db, emptyProgress } from '../firebase'
import { mathsQuestions } from '../data/maths'
import { poems } from '../data/poems'
import { scienceTopics } from '../data/science'
import { useAuth } from './useAuth'

const StarsContext = createContext(null)

export function StarsProvider({ children }) {
  const { user, setUserProgress } = useAuth()
  const [progress, setProgress] = useState(user?.progress ?? emptyProgress)

  useEffect(() => {
    setProgress(user?.progress ?? emptyProgress)
  }, [user])

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
      setUserProgress(next)
      if (!user?.id) return
      setDoc(doc(db, 'users', user.id), { progress: next }, { merge: true }).catch(
        (error) => {
          console.error(error)
        },
      )
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
  }, [progress, user?.id, setUserProgress])

  return <StarsContext.Provider value={value}>{children}</StarsContext.Provider>
}

export function useStars() {
  const context = useContext(StarsContext)
  if (!context) {
    throw new Error('useStars must be used inside StarsProvider')
  }
  return context
}
