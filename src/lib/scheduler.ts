import type { ExerciseType, Item, ItemProgress, LessonStep, Rng } from '../types'

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000

export function pickReview({
  itemProgress,
  items,
  recentIds,
  rng,
  now = Date.now(),
}: {
  itemProgress: Record<string, ItemProgress>
  items: Item[]
  recentIds: string[]
  rng: Rng
  now?: number
}): LessonStep | null {
  const learning = items.filter((item) => {
    const p = itemProgress[item.id]
    return p?.box === 'learning' && !recentIds.includes(item.id)
  })
  learning.sort((a, b) => (itemProgress[a.id]?.streak || 0) - (itemProgress[b.id]?.streak || 0))
  if (learning.length) return chooseType(learning[0], itemProgress[learning[0].id], rng)

  const staleKnown = items.find((item) => {
    const p = itemProgress[item.id]
    return p?.box === 'known' && now - p.lastSeenAt >= THREE_DAYS
  })
  if (staleKnown) return chooseType(staleKnown, itemProgress[staleKnown.id], rng)

  const anyLearning = items.find((item) => itemProgress[item.id]?.box === 'learning')
  if (anyLearning) return chooseType(anyLearning, itemProgress[anyLearning.id], rng)
  return null
}

function chooseType(item: Item, progress: ItemProgress | undefined, rng: Rng): LessonStep {
  const streak = progress?.streak || 0
  const tier0: ExerciseType[] = ['IMAGE_MATCH', 'WORD_BUILD']
  const tier1: ExerciseType[] = ['MCQ_SI_TO_EN', 'MCQ_EN_TO_SI', 'LISTEN_REPEAT']
  const tier2: ExerciseType[] = ['MCQ_SPELLING', 'SPELL_FROM_AUDIO']
  const pool = streak <= 0 ? tier0 : streak === 1 ? tier1 : tier2
  const type = pool[Math.floor(rng() * pool.length)]
  return { type, itemId: item.id, isReview: true }
}
