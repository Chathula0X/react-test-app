import packJson from '../data/unit-01.json'
import type { ContentPack, Item } from '../types'

const pack = packJson as ContentPack

export function getPack() {
  return pack
}

export function getItem(id: string): Item | undefined {
  return pack.items.find((item) => item.id === id)
}

export function getLessonItems(lessonNumber: number) {
  return pack.items.filter((item) => item.lesson === lessonNumber)
}

export function getLessonMeta(lessonNumber: number) {
  return pack.lessons.find((lesson) => lesson.n === lessonNumber)
}
