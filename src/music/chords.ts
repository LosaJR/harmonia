import { Note, Interval } from '@tonaljs/tonal'
import { alter, chromaOf, formatSymbol, type NoteNaming } from './notes'
import { scaleNotes } from './scales'

export interface QualityDef {
  id: string
  /** Sufijo ASCII del cifrado americano ("" = mayor, "m7b5"…). */
  suffix: string
  nameEs: string
  intervals: string[]
  group: 'triada' | 'séptima' | 'suspendido' | 'añadido' | 'extendido' | 'alterado'
  /** Tipo de tercera para el romano ("M" = mayúscula; "m" = minúscula). */
  caseUpper: boolean
}

const q = (id: string, suffix: string, nameEs: string, intervals: string[], group: QualityDef['group'], caseUpper: boolean): QualityDef => ({ id, suffix, nameEs, intervals, group, caseUpper })

export const QUALITIES: QualityDef[] = [
  q('maj', '', 'Mayor', ['1P', '3M', '5P'], 'triada', true),
  q('min', 'm', 'Menor', ['1P', '3m', '5P'], 'triada', false),
  q('dim', 'dim', 'Disminuida', ['1P', '3m', '5d'], 'triada', false),
  q('aug', 'aug', 'Aumentada', ['1P', '3M', '5A'], 'triada', true),
  q('maj7', 'maj7', 'Mayor 7', ['1P', '3M', '5P', '7M'], 'séptima', true),
  q('7', '7', 'Dominante 7', ['1P', '3M', '5P', '7m'], 'séptima', true),
  q('m7', 'm7', 'Menor 7', ['1P', '3m', '5P', '7m'], 'séptima', false),
  q('m7b5', 'm7b5', 'Semidisminuido', ['1P', '3m', '5d', '7m'], 'séptima', false),
  q('dim7', 'dim7', 'Disminuido 7', ['1P', '3m', '5d', '7d'], 'séptima', false),
  q('mMaj7', 'm(maj7)', 'Menor con 7ª mayor', ['1P', '3m', '5P', '7M'], 'séptima', false),
  q('maj7#5', 'maj7#5', 'Mayor 7 con 5ª aumentada', ['1P', '3M', '5A', '7M'], 'séptima', true),
  q('sus2', 'sus2', 'Suspendido de 2ª', ['1P', '2M', '5P'], 'suspendido', true),
  q('sus4', 'sus4', 'Suspendido de 4ª', ['1P', '4P', '5P'], 'suspendido', true),
  q('7sus4', '7sus4', 'Dominante 7 suspendido', ['1P', '4P', '5P', '7m'], 'suspendido', true),
  q('6', '6', 'Mayor con sexta añadida', ['1P', '3M', '5P', '6M'], 'añadido', true),
  q('m6', 'm6', 'Menor con sexta añadida', ['1P', '3m', '5P', '6M'], 'añadido', false),
  q('add9', 'add9', 'Mayor con novena añadida', ['1P', '3M', '5P', '9M'], 'añadido', true),
  q('madd9', 'madd9', 'Menor con novena añadida', ['1P', '3m', '5P', '9M'], 'añadido', false),
  q('9', '9', 'Dominante 9', ['1P', '3M', '5P', '7m', '9M'], 'extendido', true),
  q('maj9', 'maj9', 'Mayor 9', ['1P', '3M', '5P', '7M', '9M'], 'extendido', true),
  q('m9', 'm9', 'Menor 9', ['1P', '3m', '5P', '7m', '9M'], 'extendido', false),
  q('m11', 'm11', 'Menor 11', ['1P', '3m', '5P', '7m', '9M', '11P'], 'extendido', false),
  q('13', '13', 'Dominante 13', ['1P', '3M', '5P', '7m', '9M', '13M'], 'extendido', true),
  q('maj13', 'maj13', 'Mayor 13', ['1P', '3M', '5P', '7M', '9M', '13M'], 'extendido', true),
  q('7b9', '7b9', 'Dominante 7 con 9ª menor', ['1P', '3M', '5P', '7m', '9m'], 'alterado', true),
  q('7#9', '7#9', 'Dominante 7 con 9ª aumentada', ['1P', '3M', '5P', '7m', '9A'], 'alterado', true),
  q('7#11', '7#11', 'Dominante 7 con 11ª aumentada', ['1P', '3M', '5P', '7m', '9M', '11A'], 'alterado', true),
  q('7b13', '7b13', 'Dominante 7 con 13ª menor', ['1P', '3M', '5P', '7m', '13m'], 'alterado', true),
  q('7alt', '7alt', 'Dominante alterado (♯9 ♭13)', ['1P', '3M', '7m', '9A', '13m'], 'alterado', true),
]

export const QUALITY_BY_ID: Record<string, QualityDef> = Object.fromEntries(QUALITIES.map((x) => [x.id, x]))

export function qualityDef(id: string): QualityDef {
  const d = QUALITY_BY_ID[id]
  if (!d) throw new Error(`Calidad de acorde desconocida: ${id}`)
  return d
}

export const TRIAD_IDS = ['maj', 'min', 'dim', 'aug']
export const SEVENTH_IDS = ['maj7', '7', 'm7', 'm7b5', 'dim7', 'mMaj7']

export interface Chord {
  root: string
  quality: string
  symbol: string
  /** Notas en estado fundamental, sin octava, con escritura correcta. */
  notes: string[]
  intervals: string[]
  bass?: string
}

export function chordSymbol(root: string, quality: string, bass?: string): string {
  const s = `${root}${qualityDef(quality).suffix}`
  return bass ? `${s}/${bass}` : s
}

export function buildChord(root: string, quality: string, bass?: string): Chord {
  const def = qualityDef(quality)
  return {
    root,
    quality,
    symbol: chordSymbol(root, quality, bass),
    notes: def.intervals.map((i) => Note.transpose(root, i)).map((n) => Note.pitchClass(n)),
    intervals: def.intervals,
    bass,
  }
}

export function displayChord(c: Chord, naming: NoteNaming = 'intl'): string {
  return formatSymbol(c.symbol, naming)
}

/** Nombre completo en español: "Do mayor", "Sol dominante 7"… */
export function chordNameEs(root: string, quality: string): string {
  return `${formatSymbol(root, 'latin')} ${qualityDef(quality).nameEs.toLowerCase()}`
}

/** Notas con octava, posición cerrada desde la fundamental en `octave`, con `inversion` aplicada. */
export function chordNotesOct(root: string, quality: string, octave = 4, inversion = 0): string[] {
  const base = qualityDef(quality).intervals.map((i) => Note.transpose(`${root}${octave}`, i))
  return invertNotes(base, inversion)
}

/** Aplica n inversiones: la nota más grave sube una octava. */
export function invertNotes(notes: string[], n: number): string[] {
  let out = [...notes]
  for (let k = 0; k < n; k++) {
    const [first, ...rest] = out
    out = [...rest, Note.transpose(first, '8P')]
  }
  return out
}

export function inversionName(n: number, size: number): string {
  if (n === 0) return 'estado fundamental'
  if (size <= 3) return n === 1 ? 'primera inversión' : 'segunda inversión'
  return ['estado fundamental', 'primera inversión', 'segunda inversión', 'tercera inversión', 'cuarta inversión', 'quinta inversión'][n] ?? `inversión ${n}`
}

export function inversionFigure(n: number, size: number): string {
  if (size <= 3) return ['5/3', '6', '6/4'][n] ?? ''
  return ['7', '6/5', '4/3', '4/2'][n] ?? ''
}

// ---------- Detección ----------

export interface Detected {
  root: string
  quality: string
  symbol: string
  bass: string
  inversion: number
}

const chromaSetOf = (def: QualityDef): number[] => [...new Set(def.intervals.map((i) => ((Interval.semitones(i) ?? 0) % 12 + 12) % 12))].sort((a, b) => a - b)

/** Identifica un acorde por sus notas (con o sin octava). Si hay octavas, el bajo es la nota más grave. */
export function detectChord(notes: string[], preferFlats = false): Detected | null {
  if (notes.length < 3) return null
  const withMidi = notes.map((n) => ({ n, midi: Note.midi(n) }))
  const hasOct = withMidi.every((x) => x.midi !== null && x.midi !== undefined)
  const bassName = hasOct ? [...withMidi].sort((a, b) => (a.midi as number) - (b.midi as number))[0].n : notes[0]
  const bassPc = Note.pitchClass(bassName)
  const pcs = [...new Set(notes.map((n) => Note.pitchClass(n)))]
  const chromas = pcs.map(chromaOf)
  let best: { root: string; q: QualityDef; score: number } | null = null
  for (const rootPc of pcs) {
    const rc = chromaOf(rootPc)
    const rel = [...new Set(chromas.map((c) => (c - rc + 12) % 12))].sort((a, b) => a - b)
    for (const def of QUALITIES) {
      const set = chromaSetOf(def)
      if (set.length !== rel.length || !set.every((v, i) => v === rel[i])) continue
      const rootIsBass = chromaOf(bassPc) === rc
      const score = (rootIsBass ? 100 : 0) - QUALITIES.indexOf(def)
      if (!best || score > best.score) best = { root: rootPc, q: def, score }
    }
  }
  if (!best) return null
  let root = best.root
  if (!hasOct) {
    // sin escritura fiable: prefiere bemoles/sostenidos según se pida
    const c = chromaOf(root)
    root = preferFlats ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'][c] : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][c]
  }
  const tones = best.q.intervals.map((i) => chromaOf(Note.transpose(root, i)))
  const inversion = Math.max(0, tones.indexOf(chromaOf(bassPc)))
  const bass = inversion === 0 ? undefined : bassPc
  return { root, quality: best.q.id, symbol: chordSymbol(root, best.q.id, bass), bass: bassPc, inversion }
}

// ---------- Armonización ----------

export type KeyMode = 'major' | 'minor' | 'harmonic minor' | 'melodic minor'

export interface Key { tonic: string; mode: 'major' | 'minor' }

export interface DiatonicChord {
  degree: number
  root: string
  quality: string
  symbol: string
  roman: string
  notes: string[]
  fn: 'T' | 'PD' | 'D'
}

function qualityFromSemis(semis: number[]): string | null {
  const key = semis.join(',')
  const table: Record<string, string> = {
    '4,7': 'maj', '3,7': 'min', '3,6': 'dim', '4,8': 'aug',
    '4,7,11': 'maj7', '4,7,10': '7', '3,7,10': 'm7', '3,6,10': 'm7b5', '3,6,9': 'dim7', '3,7,11': 'mMaj7', '4,8,11': 'maj7#5',
  }
  return table[key] ?? null
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

export function romanFor(degree: number, quality: string): string {
  const base = ROMAN[degree - 1]
  switch (quality) {
    case 'maj': return base
    case 'min': return base.toLowerCase()
    case 'dim': return `${base.toLowerCase()}°`
    case 'aug': return `${base}+`
    case 'maj7': return `${base}maj7`
    case '7': return `${base}7`
    case 'm7': return `${base.toLowerCase()}7`
    case 'm7b5': return `${base.toLowerCase()}ø7`
    case 'dim7': return `${base.toLowerCase()}°7`
    case 'mMaj7': return `${base.toLowerCase()}(maj7)`
    case 'maj7#5': return `${base}maj7+5`
    default: return base
  }
}

function fnOfDegree(degree: number): 'T' | 'PD' | 'D' {
  if ([1, 3, 6].includes(degree)) return 'T'
  if ([2, 4].includes(degree)) return 'PD'
  return 'D'
}

/** Acordes diatónicos (triadas o séptimas) apilando terceras sobre cada grado. */
export function diatonicChords(tonic: string, mode: KeyMode | string, size: 3 | 4 = 3): DiatonicChord[] {
  const sc = scaleNotes(tonic, mode)
  if (sc.length !== 7) throw new Error('Solo las escalas de siete notas se pueden armonizar por terceras.')
  const out: DiatonicChord[] = []
  for (let i = 0; i < 7; i++) {
    const idx = [0, 2, 4, 6].slice(0, size).map((k) => sc[(i + k) % 7])
    const root = idx[0]
    const semis = idx.slice(1).map((n) => (chromaOf(n) - chromaOf(root) + 12) % 12)
    const quality = qualityFromSemis(semis)
    if (!quality) throw new Error(`Acorde diatónico no reconocido en ${tonic} ${mode} grado ${i + 1}`)
    const degree = i + 1
    out.push({
      degree, root, quality, symbol: chordSymbol(root, quality), roman: romanFor(degree, quality),
      notes: idx, fn: fnOfDegree(degree),
    })
  }
  return out
}

// ---------- Números romanos ----------

const MAJOR_DEG = ['1P', '2M', '3M', '4P', '5P', '6M', '7M']
const MINOR_DEG = ['1P', '2M', '3m', '4P', '5P', '6m', '7m']

export interface ResolvedRoman {
  roman: string
  root: string
  quality: string
  symbol: string
  notes: string[]
  degree: number
  secondaryOf?: string
}

const ROMAN_RE = /^(b|#)?(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(maj7|M7|ø7|ø|°7|°|\+|7|9|6|sus4|sus2|add9|13|7alt|7b9|7#9|7#11|7b13|maj9|m7b5|\(maj7\))?(?:\/(.+))?$/

function qualityFromRoman(upper: boolean, suf: string | undefined): string {
  const s = suf ?? ''
  if (upper) {
    switch (s) {
      case '': return 'maj'
      case '7': return '7'
      case 'maj7': case 'M7': return 'maj7'
      case '+': return 'aug'
      case '9': return '9'
      case '6': return '6'
      case 'sus4': return 'sus4'
      case 'sus2': return 'sus2'
      case 'add9': return 'add9'
      case '13': return '13'
      case '7alt': return '7alt'
      case '7b9': return '7b9'
      case '7#9': return '7#9'
      case '7#11': return '7#11'
      case '7b13': return '7b13'
      case 'maj9': return 'maj9'
      case '°': return 'dim'
      case '°7': return 'dim7'
      case 'ø': case 'ø7': case 'm7b5': return 'm7b5'
    }
  } else {
    switch (s) {
      case '': return 'min'
      case '7': return 'm7'
      case 'maj7': case 'M7': case '(maj7)': return 'mMaj7'
      case '°': return 'dim'
      case '°7': return 'dim7'
      case 'ø': case 'ø7': case 'm7b5': return 'm7b5'
      case '9': return 'm9'
      case '6': return 'm6'
      case 'add9': return 'madd9'
      case '+': return 'aug'
    }
  }
  throw new Error(`Cifrado romano no admitido: ${s}`)
}

/** Resuelve un número romano ("V7/V", "bVII", "iiø7") a acorde concreto en la tonalidad dada. */
export function resolveRoman(roman: string, key: Key): ResolvedRoman {
  const m = roman.match(ROMAN_RE)
  if (!m) throw new Error(`Número romano no válido: ${roman}`)
  const [, acc, numeral, suffix, target] = m
  let ref: Key = key
  let secondaryOf: string | undefined
  if (target) {
    const t = resolveRoman(target, key)
    ref = { tonic: t.root, mode: 'major' }
    secondaryOf = target
  }
  const degree = ROMAN.indexOf(numeral.toUpperCase()) + 1
  const table = ref.mode === 'major' ? MAJOR_DEG : MINOR_DEG
  let root = Note.transpose(ref.tonic, table[degree - 1])
  if (acc) root = alter(root, acc === 'b' ? -1 : 1)
  const upper = numeral === numeral.toUpperCase()
  const quality = qualityFromRoman(upper, suffix)
  const chord = buildChord(root, quality)
  return { roman, root, quality, symbol: chord.symbol, notes: chord.notes, degree, secondaryOf }
}

/** Describe la función armónica de un romano ya resuelto. */
export function functionLabel(roman: string, key: Key): { code: 'T' | 'PD' | 'D' | 'SD' | 'X'; label: string } {
  const m = roman.match(ROMAN_RE)
  if (!m) return { code: 'X', label: 'Sin clasificar' }
  const [, acc, numeral, suffix, target] = m
  if (target) return { code: 'SD', label: `Dominante secundaria de ${target}` }
  const degree = ROMAN.indexOf(numeral.toUpperCase()) + 1
  const upper = numeral === numeral.toUpperCase()
  if (acc) return { code: 'X', label: 'Acorde prestado / cromático' }
  if (key.mode === 'major') {
    if (degree === 4 && !upper) return { code: 'X', label: 'Prestado del modo menor (iv)' }
    if (degree === 1 && !upper) return { code: 'X', label: 'Prestado del modo menor (i)' }
  }
  if (key.mode === 'minor' && degree === 5 && !upper) return { code: 'D', label: 'Dominante (modal, sin sensible)' }
  void suffix
  const f = fnOfDegree(degree)
  return { code: f, label: f === 'T' ? 'Tónica' : f === 'PD' ? 'Predominante' : 'Dominante' }
}
