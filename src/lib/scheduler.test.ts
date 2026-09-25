import { describe, expect, it } from 'vitest'
import { applyAnswer, emptyProgress } from './progressStore'
import { generateLesson } from './lessonEngine'
import { pickReview } from './scheduler'
import { getAllItems } from './items'
import { mulberry32 } from './rng'
import type { Item, ItemProgress } from '../types'

const mango = getAllItems().find((item) => item.id === 'en.noun.mango') as Item
const banana = getAllItems().find((item) => item.id === 'en.noun.banana') as Item
const dog = getAllItems().find((item) => item.id === 'en.noun.dog') as Item

function progress(box: ItemProgress['box'], streak: number, lastSeenAt = 1): ItemProgress {
  return { box, streak, lastSeenAt, timesCorrect: streak, timesWrong: 0 }
}

describe('applyAnswer', () => {
  it('moves to known after three consecutive correct answers', () => {
    let p = emptyProgress()
    p = applyAnswer(p, true)
    p = applyAnswer(p, true)
    p = applyAnswer(p, true)
    expect(p.box).toBe('known')
    expect(p.streak).toBe(3)
  })

  it('demotes known to learning on a wrong answer', () => {
    let p = emptyProgress()
    p = applyAnswer(p, true)
    p = applyAnswer(p, true)
    p = applyAnswer(p, true)
    p = applyAnswer(p, false)
    expect(p.box).toBe('learning')
    expect(p.streak).toBe(0)
  })
})

describe('pickReview', () => {
  it('prefers the learning item with the lowest streak', () => {
    const step = pickReview({
      itemProgress: {
        [mango.id]: progress('learning', 2),
        [banana.id]: progress('learning', 0),
      },
      items: [mango, banana],
      recentIds: [],
      rng: mulberry32(1),
    })
    expect(step?.itemId).toBe(banana.id)
    expect(['IMAGE_MATCH', 'WORD_BUILD']).toContain(step?.type)
  })

  it('skips an item seen in the last 3 steps, then uses any learning item', () => {
    const step = pickReview({
      itemProgress: {
        [mango.id]: progress('learning', 0),
      },
      items: [mango],
      recentIds: [mango.id],
      rng: mulberry32(1),
    })
    expect(step?.itemId).toBe(mango.id)
  })

  it('falls back to a known item not seen for 3 days', () => {
    const now = 4 * 24 * 60 * 60 * 1000
    const step = pickReview({
      itemProgress: {
        [mango.id]: progress('known', 3, 1),
      },
      items: [mango],
      recentIds: [],
      rng: mulberry32(1),
      now,
    })
    expect(step?.itemId).toBe(mango.id)
  })

  it('uses comprehension types at streak 1', () => {
    const step = pickReview({
      itemProgress: {
        [mango.id]: progress('learning', 1),
      },
      items: [mango],
      recentIds: [],
      rng: mulberry32(1),
    })
    expect(['MCQ_SI_TO_EN', 'MCQ_EN_TO_SI', 'LISTEN_REPEAT']).toContain(step?.type)
  })

  it('uses spelling-from-audio types at streak 2', () => {
    const step = pickReview({
      itemProgress: {
        [mango.id]: progress('learning', 2),
      },
      items: [mango],
      recentIds: [],
      rng: mulberry32(1),
    })
    expect(['MCQ_SPELLING', 'SPELL_FROM_AUDIO']).toContain(step?.type)
  })
})

describe('generateLesson', () => {
  it('is identical for the same seed and progress', () => {
    const itemProgress = {
      [mango.id]: progress('learning', 0),
    }
    const a = generateLesson({ lessonNumber: 2, itemProgress, seed: 42 })
    const b = generateLesson({ lessonNumber: 2, itemProgress, seed: 42 })
    expect(a.steps).toEqual(b.steps)
  })

  it('teaches a new word as teach → say → build → type', () => {
    const lesson = generateLesson({ lessonNumber: 1, itemProgress: {}, seed: 1 })
    const mangoSteps = lesson.steps.filter((step) => step.itemId === mango.id && step.isNew)
    expect(mangoSteps.map((step) => step.type)).toEqual([
      'TEACH_CARD',
      'LISTEN_REPEAT',
      'WORD_BUILD',
      'TYPE_WORD',
    ])
    expect(mangoSteps.find((step) => step.type === 'LISTEN_REPEAT')?.awardsStar).toBeUndefined()
    expect(mangoSteps.find((step) => step.type === 'TYPE_WORD')?.awardsStar).toBe(true)
  })

  it('reviews a past word during a later lesson', () => {
    const lesson = generateLesson({
      lessonNumber: 2,
      itemProgress: { [mango.id]: progress('learning', 0) },
      seed: 7,
    })
    const review = lesson.steps.find((step) => step.isReview)
    expect(review?.itemId).toBe(mango.id)
    expect(lesson.steps.some((step) => step.itemId === dog.id && step.isNew)).toBe(true)
  })
})
