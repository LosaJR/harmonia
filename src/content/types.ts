import type { ExerciseSpec, Step } from '../exercises/types'

export type LevelId = 1 | 2 | 3 | 4 | 5

export interface ExampleBlock {
  type: 'example'
  title: string
  caption: string
  /** Notas que se iluminan en el piano. */
  highlight: string[]
  /** Reproducción al pulsar «Escuchar». */
  steps: Step[]
  tempo: number
  staff?: { notes: string[]; clef: 'treble' | 'bass'; chord?: boolean }
  /** Nombre del acorde o escala para mostrar junto al ejemplo. */
  label?: string
  /** Segunda reproducción alternativa (p. ej. arpegio frente a bloque). */
  alt?: { label: string; steps: Step[] }
}

export interface TextBlock { type: 'text'; title?: string; body: string }
export interface CalloutBlock { type: 'callout'; kind: 'tip' | 'warning' | 'style' | 'note'; title?: string; body: string }

/** Tarea para tocar en el piano, verificada automáticamente. */
export interface TryBlock {
  type: 'try'
  instruction: string
  target: { notes: string[]; mode: 'set' | 'bass-set' | 'ordered'; bass?: string }
  success: string
}

/** Mini-proyecto de composición: se valida con las progresiones guardadas en el Laboratorio. */
export interface ProjectBlock {
  type: 'project'
  title: string
  brief: string
  criteria: { id: 'length8' | 'secondary' | 'color' | 'tonic-end' | 'tempo'; label: string }[]
}

export type Block = TextBlock | ExampleBlock | CalloutBlock | TryBlock | ProjectBlock

export interface StaticQuestion { q: string; options: string[]; answer: number; why: string; topic?: string }

export interface Lesson {
  id: string
  level: LevelId
  order: number
  title: string
  objective: string
  prerequisites: string[]
  minutes: number
  /** Ids del programa (N1.1…) que cubre esta lección. */
  covers: string[]
  blocks: Block[]
  /** Cómo practicar esta lección con el teclado, fuera de los ejercicios. */
  practiceTip: string
  practice: ExerciseSpec[]
  quiz: StaticQuestion[]
  mistakes: string[]
  /** Proporción mínima de aciertos para superar la lección. */
  passScore: number
  /** Si es true, además hay que cumplir el mini-proyecto de composición. */
  requiresProject?: boolean
}

export interface LevelInfo {
  id: LevelId
  name: string
  tagline: string
  goal: string
  color: string
}

export interface Topic { id: string; name: string }
