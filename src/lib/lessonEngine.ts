import type { ActiveLesson, ExerciseType, ItemProgress, LessonStep } from '../types'
import { getLessonItems } from './items'
import { mulberry32, shuffle } from './rng'
import { pickReview } from './scheduler'

export function generateLesson({
  lessonNumber,
  itemProgress,
  seed,
}: {
  lessonNumber: number
  itemProgress: Record<string, ItemProgress>
  seed: number
}): Pick<ActiveLesson, 'seed' | 'lessonNumber' | 'steps'> {
  const rng = mulberry32(seed)
  const lessonItems = getLessonItems(lessonNumber)
  const steps: LessonStep[] = []
  const recent: string[] = []

  lessonItems.forEach((item, index) => {
    steps.push({ type: 'TEACH_CARD', itemId: item.id, isNew: true })
    steps.push({ type: 'WORD_BUILD', itemId: item.id, isNew: true })
    steps.push({ type: 'TYPE_WORD', itemId: item.id, isNew: true, awardsStar: true })
    recent.push(item.id)
    if (recent.length > 3) recent.shift()

    if ((index + 1) % 2 === 0) {
      const review = pickReview({
        itemProgress,
        items: lessonItems,
        recentIds: recent.slice(-3),
        rng,
      })
      if (review) {
        steps.push(review)
        recent.push(review.itemId)
      }
    }
  })

  const quizTypes: ExerciseType[] = ['MCQ_SPELLING', 'MCQ_SI_TO_EN', 'IMAGE_MATCH']
  shuffle(lessonItems, rng)
    .slice(0, 5)
    .forEach((item) => {
      steps.push({
        type: quizTypes[Math.floor(rng() * quizTypes.length)],
        itemId: item.id,
        isQuiz: true,
      })
    })

  return { seed, lessonNumber, steps }
}
