import unit01 from '../data/unit-01.json'
import type { ContentPack, ExerciseType } from '../types'

export type CurriculumView = {
  units: number
  lessons: number
  words: number
  skills: Array<{
    id: 'reading' | 'understanding' | 'spelling' | 'listening' | 'speaking'
    si: string
    en: string
  }>
  unitsLive: Array<{
    id: string
    order: number
    title_en: string
    title_si: string
    outcome_en: string
    outcome_si: string
    lessons: Array<{
      id: string
      order: number
      theme_en: string
      theme_si: string
      pattern: string
      words: Array<{ id: string; en: string; si: string }>
    }>
  }>
  comingNext: Array<{ title_en: string; title_si: string }>
}

const ALL_PACKS: ContentPack[] = [unit01 as ContentPack]

const ACTIVE_EXERCISE_TYPES: ExerciseType[] = [
  'TEACH_CARD',
  'WORD_BUILD',
  'TYPE_WORD',
  'MCQ_SPELLING',
  'MCQ_SI_TO_EN',
  'MCQ_EN_TO_SI',
  'IMAGE_MATCH',
  'SPELL_FROM_AUDIO',
  'LISTEN_REPEAT',
]

function hasExercise(...types: ExerciseType[]) {
  return types.some((type) => ACTIVE_EXERCISE_TYPES.includes(type))
}

export function getCurriculumView(): CurriculumView {
  const livePacks = ALL_PACKS.filter((p) => p.status === 'live').sort(
    (a, b) => a.order - b.order,
  )
  const nextPacks = ALL_PACKS.filter((p) => p.status === 'next').sort(
    (a, b) => a.order - b.order,
  )

  const liveWordIds = new Set<string>()
  livePacks.forEach((pack) => {
    pack.lessons.forEach((lesson) => {
      lesson.items.forEach((id) => liveWordIds.add(id))
    })
  })

  const skills: CurriculumView['skills'] = []

  if (hasExercise('TEACH_CARD')) {
    skills.push({ id: 'reading', si: 'කියවීම', en: 'Reading' })
  }
  if (hasExercise('IMAGE_MATCH', 'MCQ_SI_TO_EN', 'MCQ_EN_TO_SI')) {
    skills.push({ id: 'understanding', si: 'තේරුම් ගැනීම', en: 'Understanding' })
  }
  if (hasExercise('WORD_BUILD', 'TYPE_WORD', 'MCQ_SPELLING')) {
    skills.push({ id: 'spelling', si: 'අක්ෂර වින්‍යාසය', en: 'Spelling' })
  }
  if (hasExercise('SPELL_FROM_AUDIO')) {
    skills.push({ id: 'listening', si: 'සවන්දීම', en: 'Listening' })
  }
  if (hasExercise('LISTEN_REPEAT')) {
    skills.push({ id: 'speaking', si: 'කතා කිරීම', en: 'Speaking' })
  }

  const unitsLive = livePacks.map((pack) => {
    const itemMap = new Map(pack.items.map((item) => [item.id, item]))

    return {
      id: pack.id,
      order: pack.order,
      title_en: pack.title_en,
      title_si: pack.title_si,
      outcome_en: pack.outcome_en,
      outcome_si: pack.outcome_si,
      lessons: [...pack.lessons]
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({
          id: lesson.id,
          order: lesson.order,
          theme_en: lesson.theme_en,
          theme_si: lesson.theme_si,
          pattern: lesson.pattern,
          words: lesson.items.flatMap((itemId) => {
            const item = itemMap.get(itemId)
            return item ? [{ id: item.id, en: item.en, si: item.si }] : []
          }),
        })),
    }
  })

  return {
    units: livePacks.length,
    lessons: livePacks.reduce((acc, pack) => acc + pack.lessons.length, 0),
    words: liveWordIds.size,
    skills,
    unitsLive,
    comingNext: nextPacks.map((pack) => ({
      title_en: pack.title_en,
      title_si: pack.title_si,
    })),
  }
}