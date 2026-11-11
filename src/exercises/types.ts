export type GeneratorId =
  | 'note-id' | 'note-play' | 'staff-note' | 'key-signature' | 'degree-id'
  | 'scale-build' | 'interval-id' | 'interval-build'
  | 'triad-build' | 'seventh-build' | 'chord-id' | 'inversion-id' | 'inversion-build'
  | 'aural-interval' | 'aural-chord' | 'aural-cadence'
  | 'degree-function' | 'complete-progression' | 'voice-leading' | 'transpose-notes' | 'transpose-progression' | 'progression-analysis'
  | 'secondary-dominant' | 'voicing-id' | 'extension-build'

export type OptionKind = 'note' | 'chord' | 'text' | 'interval' | 'roman' | 'notes' | 'romans' | 'chords'

export interface Step { notes: string[]; beats: number }

export interface ListenSpec {
  steps: Step[]
  /** Pulsos por minuto para reproducir. */
  tempo: number
  label: string
}

export interface Visual {
  /** Notas a mostrar sobre un pentagrama. */
  staff?: { notes: string[]; clef: 'treble' | 'bass'; chord?: boolean }
  /** Notas resaltadas en el piano del exercise. */
  keys?: string[]
}

export interface ChoiceResponse {
  type: 'choice'
  options: string[]
  optionKind: OptionKind
  /** Respuestas aceptadas (puede haber varias defendibles). */
  correct: string[]
}

export type NotesMode = 'set' | 'ordered' | 'bass-set' | 'exact'

export interface NotesResponse {
  type: 'notes'
  mode: NotesMode
  /** Notas esperadas con la escritura teórica correcta (con octava si `mode` es exact). */
  expected: string[]
  /** Exige escritura correcta cuando la respuesta se da escribiendo notas (no al tocar). */
  spellingRequired: boolean
  /** Nota esperada en el bajo (solo bass-set), p. ej. "E". */
  bass?: string
}

export interface Exercise {
  id: string
  gen: GeneratorId | 'static'
  difficulty: 1 | 2 | 3
  prompt: string
  hint?: string
  listen?: ListenSpec
  /** Si es auditivo no se muestra visualmente la respuesta. */
  aural?: boolean
  visual?: Visual
  response: ChoiceResponse | NotesResponse
  explanation: string
  /** Etiquetas para detectar temas que requieren refuerzo. */
  topic: string
}

export type Answer =
  | { kind: 'choice'; value: string }
  | { kind: 'notes'; notes: string[]; source: 'piano' | 'spelled' }

export interface Grade {
  correct: boolean
  /** Sonido correcto pero escritura incorrecta, etc. */
  partial: boolean
  message: string
}

export interface ExerciseSpec {
  gen: GeneratorId
  count: number
  difficulty?: 1 | 2 | 3
  params?: Record<string, unknown>
}

export type Rng = () => number
