export type LeitnerBox = 'new' | 'learning' | 'known'

export type ExerciseType =
  | 'TEACH_CARD'
  | 'WORD_BUILD'
  | 'TYPE_WORD'
  | 'MCQ_SPELLING'
  | 'MCQ_SI_TO_EN'
  | 'MCQ_EN_TO_SI'
  | 'IMAGE_MATCH'
  | 'SPELL_FROM_AUDIO'
  | 'LISTEN_REPEAT'

export type ItemProgress = {
  box: LeitnerBox
  streak: number
  lastSeenAt: number
  timesCorrect: number
  timesWrong: number
}

export type Item = {
  id: string
  type: string
  lesson: number
  en: string
  en_sentence: string
  si: string
  si_sentence: string
  emoji: string
  image: string
  audio_word: string
  audio_sentence: string
  distractors: {
    spelling: string[]
    meaning_en: string[]
    letters: string[]
    image: string[]
  }
}

export type UnitStatus = 'live' | 'next'

export type LessonMeta = {
  id: string
  order: number
  theme_en: string
  theme_si: string
  pattern: string
  items: string[]
}

export type ContentPack = {
  id: string
  order: number
  title_en: string
  title_si: string
  outcome_en: string
  outcome_si: string
  status: UnitStatus
  lessons: LessonMeta[]
  items: Item[]
}

export type LessonStep = {
  type: ExerciseType
  itemId: string
  isNew?: boolean
  awardsStar?: boolean
  isQuiz?: boolean
  isReview?: boolean
}

export type ActiveLesson = {
  seed: number
  lessonNumber: number
  steps: LessonStep[]
  stepIndex: number
  starsThisLesson: number
  quizWrong: boolean
  newDone: Record<string, boolean>
}

export type Profile = {
  id: string
  name: string
  avatar: string
  stars: number
  lessonNumber: number
  itemProgress: Record<string, ItemProgress>
  activeLesson: ActiveLesson | null
  lastStars?: number
}

export type AppState = {
  profiles: Profile[]
  activeId: string | null
}

export type StepResult = {
  correct: boolean
  rescued: boolean
  skipped?: boolean
  unscored?: boolean 
}

export type Rng = () => number