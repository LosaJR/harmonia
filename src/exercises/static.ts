import type { StaticQuestion } from '../content/types'
import type { Exercise } from './types'

let n = 0

/** Convierte una pregunta escrita a mano en un ejercicio de opción múltiple. */
export function staticToExercise(q: StaticQuestion, topic: string): Exercise {
  return {
    id: `static-${++n}-${q.q.length}`,
    gen: 'static', difficulty: 1, topic: q.topic ?? topic,
    prompt: q.q,
    response: { type: 'choice', optionKind: 'text', options: q.options, correct: [q.options[q.answer]] },
    explanation: q.why,
  }
}
