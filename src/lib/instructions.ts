import type { ExerciseType } from '../types'

export const instructionSrc: Partial<Record<ExerciseType, string>> = {
  TEACH_CARD: '/audio/si/step.listen.mp3',
  LISTEN_REPEAT: '/audio/si/step.sayIt.mp3',
  WORD_BUILD: '/audio/si/step.arrangeLetters.mp3',
  TYPE_WORD: '/audio/si/step.typeTheWord.mp3',
  SPELL_FROM_AUDIO: '/audio/si/step.listenAndType.mp3',
  MCQ_SPELLING: '/audio/si/step.pickCorrectSpelling.mp3',
  MCQ_SI_TO_EN: '/audio/si/step.whatDoesThisMean.mp3',
  MCQ_EN_TO_SI: '/audio/si/step.pickSinhala.mp3',
  IMAGE_MATCH: '/audio/si/step.pickTheImage.mp3',
}
