import { LESSONS, getLesson, lessonsOfLevel, type Lesson, type LevelId } from '../content'
import type { ProgressState } from './progress'

export const isDone = (s: ProgressState, id: string) => !!s.lessons[id]?.completed

export function missingPrereqs(s: ProgressState, l: Lesson): Lesson[] {
  return l.prerequisites.filter((p) => !isDone(s, p)).map((p) => getLesson(p)!).filter(Boolean)
}

export const isUnlocked = (s: ProgressState, l: Lesson) => missingPrereqs(s, l).length === 0

export function levelProgress(s: ProgressState, level: LevelId) {
  const ls = lessonsOfLevel(level)
  const done = ls.filter((l) => isDone(s, l.id)).length
  return { done, total: ls.length, ratio: ls.length ? done / ls.length : 0 }
}

export function totalProgress(s: ProgressState) {
  const done = LESSONS.filter((l) => isDone(s, l.id)).length
  return { done, total: LESSONS.length, ratio: done / LESSONS.length }
}

/** Siguiente lección recomendada: la primera sin completar con prerrequisitos cumplidos. */
export function recommended(s: ProgressState): Lesson | undefined {
  return LESSONS.find((l) => !isDone(s, l.id) && isUnlocked(s, l)) ?? LESSONS.find((l) => !isDone(s, l.id))
}

/** Dónde continuar: la última lección visitada si no está terminada; si no, la recomendada. */
export function continueLesson(s: ProgressState): Lesson | undefined {
  const last = s.lastLesson ? getLesson(s.lastLesson) : undefined
  if (last && !isDone(s, last.id)) return last
  return recommended(s)
}
