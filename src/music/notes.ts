/**
 * Notas y conversiones. Convención: C4 = MIDI 60 (la misma que Tonal.js).
 * La escritura interna usa ASCII ("F#4", "Bb3"); los glifos ♯/♭ solo se usan para mostrar.
 */
import { Note, Interval } from '@tonaljs/tonal'

export type NoteNaming = 'latin' | 'intl'

export const MIDI_C4 = 60
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export const LATIN: Record<string, string> = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }

/** Nombres de las 12 clases de altura con sostenidos o bemoles (solo para entrada MIDI sin escritura). */
export const PC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const PC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export function toMidi(name: string): number {
  const m = Note.midi(name)
  if (m === null || m === undefined) throw new Error(`Nota no válida: ${name}`)
  return m
}

export function chromaOf(name: string): number {
  const c = Note.chroma(name)
  if (c === undefined || Number.isNaN(c)) throw new Error(`Nota no válida: ${name}`)
  return c
}

export function midiToName(midi: number, flats = false): string {
  return (flats ? Note.fromMidi(midi) : Note.fromMidiSharps(midi))
}

/** Nombre de clase de altura (sin octava). */
export function pcOf(name: string): string {
  return Note.pitchClass(name)
}

/** Conjunto ordenado y sin duplicados de chromas. */
export function chromaSet(names: string[]): number[] {
  return [...new Set(names.map(chromaOf))].sort((a, b) => a - b)
}

export function sameChromaSet(a: string[], b: string[]): boolean {
  const x = chromaSet(a)
  const y = chromaSet(b)
  return x.length === y.length && x.every((v, i) => v === y[i])
}

/** Desplaza la alteración de una nota conservando la letra (spelling). */
export function alter(name: string, delta: number): string {
  const n = Note.get(name)
  if (n.empty) throw new Error(`Nota no válida: ${name}`)
  const alt = n.alt + delta
  const acc = alt > 0 ? '#'.repeat(alt) : 'b'.repeat(-alt)
  return `${n.letter}${acc}${n.oct ?? ''}`
}

export function withOctave(pc: string, oct: number): string {
  return `${pc}${oct}`
}

export function transposeNote(name: string, interval: string): string {
  return Note.transpose(name, interval)
}

const ACC_GLYPH: Record<string, string> = { '#': '♯', '##': '♯♯', b: '♭', bb: '♭♭', '': '' }

export function accidentalGlyph(acc: string): string {
  return ACC_GLYPH[acc] ?? acc
}

/** Formatea una nota para mostrarla: "F#4" → "F♯4" / "Fa♯4". */
export function formatNote(name: string, naming: NoteNaming = 'intl', octave = true): string {
  const n = Note.get(name)
  if (n.empty) return name
  const letter = naming === 'latin' ? LATIN[n.letter] : n.letter
  return `${letter}${accidentalGlyph(n.acc)}${octave && n.oct !== undefined ? n.oct : ''}`
}

/** Convierte cifrados ASCII ("F#m7b5", "Bb7#9") a glifos, con el nombre de nota en latino o internacional. */
export function formatSymbol(symbol: string, naming: NoteNaming = 'intl'): string {
  const m = symbol.match(/^([A-G])(#{1,2}|b{1,2})?(.*)$/)
  if (!m) return symbol
  const [, letter, acc = '', rest] = m
  const slash = rest.match(/^(.*)\/([A-G])(#{1,2}|b{1,2})?$/)
  const head = naming === 'latin' ? LATIN[letter] : letter
  const qual = (slash ? slash[1] : rest).replace(/#/g, '♯').replace(/(?<=\d|\(|^|,)b(?=\d)/g, '♭')
  const out = `${head}${accidentalGlyph(acc)}${qual}`
  if (slash) {
    const bl = naming === 'latin' ? LATIN[slash[2]] : slash[2]
    return `${out}/${bl}${accidentalGlyph(slash[3] ?? '')}`
  }
  return out
}

/** Etiqueta de grados/romanos con glifos (bVII → ♭VII). */
export function formatRoman(r: string): string {
  return r.replace(/^b/, '♭').replace(/^#/, '♯').replace(/\/b/g, '/♭').replace(/\/#/g, '/♯')
}

// ---------- Intervalos ----------

const NUM_ES: Record<number, string> = {
  1: 'unísono', 2: 'segunda', 3: 'tercera', 4: 'cuarta', 5: 'quinta', 6: 'sexta', 7: 'séptima',
  8: 'octava', 9: 'novena', 10: 'décima', 11: 'oncena', 12: 'duodécima', 13: 'trecena',
}
const QUAL_ES: Record<string, [string, string]> = {
  M: ['mayor', 'mayor'], m: ['menor', 'menor'], P: ['justa', 'justo'], A: ['aumentada', 'aumentado'], d: ['disminuida', 'disminuido'],
  AA: ['doblemente aumentada', 'doblemente aumentado'], dd: ['doblemente disminuida', 'doblemente disminuido'],
}

export function intervalNameEs(interval: string): string {
  const i = Interval.get(interval)
  if (i.empty) return interval
  const num = Math.abs(i.num)
  const q = QUAL_ES[i.q]
  if (num === 1 && i.q === 'P') return 'unísono'
  if (num === 8 && i.q === 'P') return 'octava justa'
  const word = NUM_ES[num] ?? `${num}ª`
  return `${word} ${q ? q[0] : i.q}`
}

/** Abreviatura clásica: 3M, 5P, 7m, 4A… con glifo para legibilidad. */
export function intervalShort(interval: string): string {
  return interval
}

export function intervalBetween(a: string, b: string): string {
  return Interval.distance(a, b)
}

export function semitonesOf(interval: string): number {
  return Interval.semitones(interval) ?? 0
}
