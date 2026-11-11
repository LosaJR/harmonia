import { LEVEL1 } from './level1'
import { LEVEL2 } from './level2'
import { LEVEL3 } from './level3'
import { LEVEL4 } from './level4'
import { LEVEL5 } from './level5'
import { LEVELS, TOPICS } from './curriculum'
import type { Lesson, LevelId } from './types'

export { LEVELS, TOPICS }
export const LESSONS: Lesson[] = [...LEVEL1, ...LEVEL2, ...LEVEL3, ...LEVEL4, ...LEVEL5]

const byId = new Map(LESSONS.map((l) => [l.id, l]))

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id)
}

export function lessonsOfLevel(level: LevelId): Lesson[] {
  return LESSONS.filter((l) => l.level === level)
}

export function nextLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id)
  return i >= 0 ? LESSONS[i + 1] : undefined
}

export function prevLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id)
  return i > 0 ? LESSONS[i - 1] : undefined
}

export * from './types'
