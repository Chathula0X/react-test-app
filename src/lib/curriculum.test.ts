import { describe, expect, it } from 'vitest'
import { getCurriculumView } from './curriculum'

describe('getCurriculumView', () => {
  it('shows listening and speaking once those types are live', () => {
    const view = getCurriculumView()
    expect(view.skills.map((skill) => skill.id)).toEqual([
      'reading',
      'understanding',
      'spelling',
      'listening',
      'speaking',
    ])
  })
})
