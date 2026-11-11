import { Note } from '@tonaljs/tonal'
import { chromaOf } from './notes'

export interface ScaleDef {
  id: string
  nameEs: string
  intervals: string[]
  group: 'diatónica' | 'menor' | 'modo' | 'pentatónica' | 'simétrica' | 'jazz'
}

export const SCALE_DEFS: ScaleDef[] = [
  { id: 'major', nameEs: 'Mayor (jónica)', intervals: ['1P', '2M', '3M', '4P', '5P', '6M', '7M'], group: 'diatónica' },
  { id: 'minor', nameEs: 'Menor natural (eolia)', intervals: ['1P', '2M', '3m', '4P', '5P', '6m', '7m'], group: 'menor' },
  { id: 'harmonic minor', nameEs: 'Menor armónica', intervals: ['1P', '2M', '3m', '4P', '5P', '6m', '7M'], group: 'menor' },
  { id: 'melodic minor', nameEs: 'Menor melódica (ascendente)', intervals: ['1P', '2M', '3m', '4P', '5P', '6M', '7M'], group: 'menor' },
  { id: 'dorian', nameEs: 'Dórica', intervals: ['1P', '2M', '3m', '4P', '5P', '6M', '7m'], group: 'modo' },
  { id: 'phrygian', nameEs: 'Frigia', intervals: ['1P', '2m', '3m', '4P', '5P', '6m', '7m'], group: 'modo' },
  { id: 'lydian', nameEs: 'Lidia', intervals: ['1P', '2M', '3M', '4A', '5P', '6M', '7M'], group: 'modo' },
  { id: 'mixolydian', nameEs: 'Mixolidia', intervals: ['1P', '2M', '3M', '4P', '5P', '6M', '7m'], group: 'modo' },
  { id: 'locrian', nameEs: 'Locria', intervals: ['1P', '2m', '3m', '4P', '5d', '6m', '7m'], group: 'modo' },
  { id: 'major pentatonic', nameEs: 'Pentatónica mayor', intervals: ['1P', '2M', '3M', '5P', '6M'], group: 'pentatónica' },
  { id: 'minor pentatonic', nameEs: 'Pentatónica menor', intervals: ['1P', '3m', '4P', '5P', '7m'], group: 'pentatónica' },
  { id: 'blues', nameEs: 'Blues', intervals: ['1P', '3m', '4P', '5d', '5P', '7m'], group: 'pentatónica' },
  { id: 'whole tone', nameEs: 'Tonos enteros', intervals: ['1P', '2M', '3M', '4A', '5A', '7m'], group: 'simétrica' },
  { id: 'dim wh', nameEs: 'Disminuida tono–semitono', intervals: ['1P', '2M', '3m', '4P', '5d', '6m', '6M', '7M'], group: 'simétrica' },
  { id: 'dim hw', nameEs: 'Disminuida semitono–tono (dominante)', intervals: ['1P', '2m', '3m', '3M', '4A', '5P', '6M', '7m'], group: 'simétrica' },
  { id: 'lydian dominant', nameEs: 'Lidia dominante', intervals: ['1P', '2M', '3M', '4A', '5P', '6M', '7m'], group: 'jazz' },
  { id: 'altered', nameEs: 'Alterada (superlocria)', intervals: ['1P', '2m', '3m', '4d', '5d', '6m', '7m'], group: 'jazz' },
  { id: 'phrygian dominant', nameEs: 'Frigia dominante', intervals: ['1P', '2m', '3M', '4P', '5P', '6m', '7m'], group: 'jazz' },
]

export function scaleDef(id: string): ScaleDef {
  const d = SCALE_DEFS.find((s) => s.id === id)
  if (!d) throw new Error(`Escala desconocida: ${id}`)
  return d
}

/** Notas (clases de altura, con escritura correcta) de una escala. */
export function scaleNotes(tonic: string, id: string): string[] {
  return scaleDef(id).intervals.map((i) => Note.transpose(tonic, i))
}

/** Notas de la escala con octava, ascendiendo desde la tónica en `octave`; incluye la octava superior si `closeOctave`. */
export function scaleWithOctaves(tonic: string, id: string, octave = 4, closeOctave = true): string[] {
  const t = `${tonic}${octave}`
  const out = scaleDef(id).intervals.map((i) => Note.transpose(t, i))
  if (closeOctave) out.push(Note.transpose(t, '8P'))
  return out
}

/** Tonalidades mayores y menores usadas habitualmente (escritura con ≤ 7 alteraciones). */
export const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']
export const MINOR_KEYS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab']

/** Tónicas cómodas para ejercicios (evitan dobles alteraciones). */
export const COMMON_TONICS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db']
export const EASY_TONICS = ['C', 'G', 'D', 'F', 'A', 'Bb']

export interface KeySignature {
  /** Positivo = sostenidos, negativo = bemoles. */
  count: number
  accidentals: string[]
}

const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#']
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb']

/** Armadura de una tonalidad mayor o menor (natural). */
export function keySignature(tonic: string, mode: 'major' | 'minor' = 'major'): KeySignature {
  const notes = scaleNotes(tonic, mode === 'major' ? 'major' : 'minor')
  const count = notes.reduce((acc, n) => acc + Note.get(n).alt, 0)
  return { count, accidentals: count >= 0 ? SHARP_ORDER.slice(0, count) : FLAT_ORDER.slice(0, -count) }
}

/** Tonalidad relativa (mayor ↔ menor). */
export function relativeKey(tonic: string, mode: 'major' | 'minor'): string {
  return mode === 'major' ? Note.transpose(tonic, '-3m') : Note.transpose(tonic, '3m')
}

export interface CircleEntry { major: string; minor: string; sig: number }

/** Círculo de quintas, 12 posiciones empezando por Do arriba y avanzando por quintas. */
export const CIRCLE: CircleEntry[] = [
  { major: 'C', minor: 'A', sig: 0 },
  { major: 'G', minor: 'E', sig: 1 },
  { major: 'D', minor: 'B', sig: 2 },
  { major: 'A', minor: 'F#', sig: 3 },
  { major: 'E', minor: 'C#', sig: 4 },
  { major: 'B', minor: 'G#', sig: 5 },
  { major: 'F#', minor: 'D#', sig: 6 },
  { major: 'Db', minor: 'Bb', sig: -5 },
  { major: 'Ab', minor: 'F', sig: -4 },
  { major: 'Eb', minor: 'C', sig: -3 },
  { major: 'Bb', minor: 'G', sig: -2 },
  { major: 'F', minor: 'D', sig: -1 },
]

/** Grado de una nota dentro de una escala (1-based) o 0 si no pertenece. */
export function degreeOf(note: string, tonic: string, id: string): number {
  const c = chromaOf(note)
  const idx = scaleNotes(tonic, id).findIndex((n) => chromaOf(n) === c)
  return idx + 1
}

export const DEGREE_NAMES_ES = ['tónica', 'supertónica', 'mediante', 'subdominante', 'dominante', 'superdominante', 'sensible']
export const DEGREE_NAMES_MINOR_ES = ['tónica', 'supertónica', 'mediante', 'subdominante', 'dominante', 'superdominante', 'subtónica']
