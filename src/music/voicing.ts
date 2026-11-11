import { Note } from '@tonaljs/tonal'
import { chordNotesOct, invertNotes, qualityDef, buildChord } from './chords'
import { chromaOf, toMidi } from './notes'

export type VoicingStyle = 'close' | 'open' | 'drop2' | 'drop3' | 'shell' | 'rootlessA' | 'rootlessB' | 'quartal'

export interface VoicingStyleDef { id: VoicingStyle; nameEs: string; hint: string }

export const VOICING_STYLES: VoicingStyleDef[] = [
  { id: 'close', nameEs: 'Cerrado', hint: 'Todas las notas dentro de una octava, lo más juntas posible.' },
  { id: 'open', nameEs: 'Abierto', hint: 'La nota central sube una octava: más espacio, sonido más amplio.' },
  { id: 'drop2', nameEs: 'Drop 2', hint: 'En un acorde de cuatro notas, la segunda desde arriba baja una octava.' },
  { id: 'drop3', nameEs: 'Drop 3', hint: 'La tercera desde arriba baja una octava; deja un hueco grande en el grave.' },
  { id: 'shell', nameEs: 'Shell (fundamental, 3ª, 7ª)', hint: 'Esqueleto del acorde: fundamental y las dos notas que definen su calidad.' },
  { id: 'rootlessA', nameEs: 'Sin fundamental A (3-5-7-9)', hint: 'Estilo jazz: el bajo toca la fundamental; la mano izquierda empieza en la 3ª.' },
  { id: 'rootlessB', nameEs: 'Sin fundamental B (7-9-3-5)', hint: 'Estilo jazz: empieza en la 7ª. Alterna con A para moverte poco.' },
  { id: 'quartal', nameEs: 'Cuartal', hint: 'Cuatro notas apiladas por cuartas sobre la nota más aguda del acorde.' },
]

export interface Voicing { notes: string[]; style: VoicingStyle; label: string }

const lowestFirst = (notes: string[]) => [...notes].sort((a, b) => toMidi(a) - toMidi(b))

/** Sitúa una lista de nombres de nota (sin octava) en orden ascendente a partir de `startOct`. */
function stackAscending(pcs: string[], startOct: number): string[] {
  const out: string[] = []
  let prev = -Infinity
  pcs.forEach((pc, i) => {
    let oct = i === 0 ? startOct : Note.get(out[i - 1]).oct ?? startOct
    let name = `${pc}${oct}`
    while (toMidi(name) <= prev) { oct++; name = `${pc}${oct}` }
    out.push(name)
    prev = toMidi(name)
  })
  return out
}

/** Elige octava inicial para que la primera nota quede cerca de `target` MIDI. */
function startOctaveNear(pc: string, target: number): number {
  let best = 3
  let bestD = Infinity
  for (let o = 1; o <= 6; o++) {
    const d = Math.abs(toMidi(`${pc}${o}`) - target)
    if (d < bestD) { bestD = d; best = o }
  }
  return best
}

export function voiceChord(root: string, quality: string, style: VoicingStyle = 'close', opts: { octave?: number; inversion?: number } = {}): Voicing {
  const oct = opts.octave ?? 3
  const inv = opts.inversion ?? 0
  const def = qualityDef(quality)
  const chord = buildChord(root, quality)
  const label = VOICING_STYLES.find((s) => s.id === style)?.nameEs ?? style
  const close = chordNotesOct(root, quality, oct, 0)
  const n = close.length
  let notes: string[]
  switch (style) {
    case 'close':
      notes = invertNotes(close, inv % n)
      break
    case 'open': {
      const base = invertNotes(close, inv % n)
      if (n === 3) notes = [base[0], base[2], Note.transpose(base[1], '8P')]
      else notes = [base[0], base[2], Note.transpose(base[1], '8P'), ...base.slice(3)]
      break
    }
    case 'drop2': {
      const base = invertNotes(close, inv % n)
      if (n < 4) { notes = invertNotes(close, inv % n); break }
      const idx = n - 2
      notes = base.map((x, i) => (i === idx ? Note.transpose(x, '-8P') : x))
      break
    }
    case 'drop3': {
      const base = invertNotes(close, inv % n)
      if (n < 4) { notes = invertNotes(close, inv % n); break }
      const idx = n - 3
      notes = base.map((x, i) => (i === idx ? Note.transpose(x, '-8P') : x))
      break
    }
    case 'shell': {
      const third = chord.notes[1]
      const seventh = def.intervals.length >= 4 ? chord.notes[3] : chord.notes[2]
      const order = inv % 2 === 0 ? [root, seventh, third] : [root, third, seventh]
      notes = stackAscending(order, oct)
      break
    }
    case 'rootlessA':
    case 'rootlessB': {
      const hasSeventh = def.intervals.some((i) => ['7M', '7m', '7d'].includes(i))
      const third = chord.notes[1]
      const fifth = chord.notes[2]
      const seventh = chord.notes[3] ?? chord.notes[2]
      const ninthI = def.intervals.find((i) => i.startsWith('9')) ?? '9M'
      const ninth = Note.pitchClass(Note.transpose(root, ninthI))
      const pcs = !hasSeventh
        ? [third, fifth, root]
        : style === 'rootlessA' ? [third, fifth, seventh, ninth] : [seventh, ninth, third, fifth]
      // si el acorde ya contiene 13ª alterada y no tiene 5ª, sustituye
      const clean = pcs.filter((p, i) => !(i > 0 && pcs[i - 1] === p))
      notes = stackAscending(clean, startOctaveNear(clean[0], style === 'rootlessA' ? 56 : 53))
      break
    }
    case 'quartal': {
      const top = chord.notes[n - 1 > 0 ? Math.min(n - 1, 3) : 0]
      const stack: string[] = [`${top}${oct + 1}`]
      for (let k = 0; k < 3; k++) stack.push(Note.transpose(stack[stack.length - 1], '-4P'))
      notes = lowestFirst(stack)
      break
    }
    default:
      notes = close
  }
  return { notes: lowestFirst(notes), style, label }
}

/** Todas las distribuciones cerradas posibles (inversiones × octavas) dentro de un rango MIDI. */
function candidates(pcs: string[], low: number, high: number): string[][] {
  const out: string[][] = []
  for (let inv = 0; inv < pcs.length; inv++) {
    for (let o = 1; o <= 6; o++) {
      const rotated = [...pcs.slice(inv), ...pcs.slice(0, inv)]
      const notes = stackAscending(rotated, o)
      const lo = toMidi(notes[0])
      const hi = toMidi(notes[notes.length - 1])
      if (lo >= low && hi <= high) out.push(notes)
    }
  }
  return out
}

/** Movimiento total (suma de semitonos) entre dos voces ordenadas; las listas de distinto tamaño se emparejan por el extremo. */
export function voiceDistance(a: string[], b: string[]): number {
  const x = a.map(toMidi).sort((p, q) => p - q)
  const y = b.map(toMidi).sort((p, q) => p - q)
  const n = Math.min(x.length, y.length)
  let d = 0
  for (let i = 0; i < n; i++) d += Math.abs(x[x.length - 1 - i] - y[y.length - 1 - i])
  return d + Math.abs(x.length - y.length) * 2
}

/** Elige, de entre todas las inversiones, la que menos se mueve respecto a la anterior. */
export function smoothVoicing(prev: string[] | null, pcs: string[], range: [number, number] = [48, 76]): string[] {
  const cands = candidates(pcs, range[0], range[1])
  if (!prev) {
    // primera: la más cercana a un centro cómodo
    const center = 62
    return cands.sort((p, q) => Math.abs(avg(p) - center) - Math.abs(avg(q) - center))[0]
  }
  return cands.sort((p, q) => voiceDistance(prev, p) - voiceDistance(prev, q) || Math.abs(avg(p) - avg(prev)) - Math.abs(avg(q) - avg(prev)))[0]
}

const avg = (n: string[]) => n.map(toMidi).reduce((a, b) => a + b, 0) / n.length

export type MotionKind = 'contrario' | 'paralelo' | 'oblicuo' | 'directo' | 'estático'

export interface VoiceMove { from: string; to: string; semitones: number }

export interface MotionReport {
  moves: VoiceMove[]
  total: number
  common: number
  outer: MotionKind
  parallelPerfects: string[]
}

function motionKind(b1: number, b2: number, t1: number, t2: number): MotionKind {
  const db = b2 - b1
  const dt = t2 - t1
  if (db === 0 && dt === 0) return 'estático'
  if (db === 0 || dt === 0) return 'oblicuo'
  if (Math.sign(db) !== Math.sign(dt)) return 'contrario'
  return db === dt || (b2 - t2) % 12 === (b1 - t1) % 12 ? 'paralelo' : 'directo'
}

/** Analiza el paso de un acorde a otro: movimiento por voz, notas comunes, tipo de movimiento exterior y quintas/octavas paralelas. */
export function analyzeMotion(a: string[], b: string[]): MotionReport {
  const x = lowestFirst(a)
  const y = lowestFirst(b)
  const n = Math.min(x.length, y.length)
  const moves: VoiceMove[] = []
  for (let i = 0; i < n; i++) {
    const from = x[x.length - 1 - i]
    const to = y[y.length - 1 - i]
    moves.unshift({ from, to, semitones: toMidi(to) - toMidi(from) })
  }
  const total = moves.reduce((s, m) => s + Math.abs(m.semitones), 0)
  const common = moves.filter((m) => m.semitones === 0).length
  const outer = motionKind(toMidi(x[0]), toMidi(y[0]), toMidi(x[x.length - 1]), toMidi(y[y.length - 1]))
  const parallelPerfects: string[] = []
  for (let i = 0; i < moves.length; i++) {
    for (let j = i + 1; j < moves.length; j++) {
      const i1 = Math.abs(toMidi(moves[j].from) - toMidi(moves[i].from)) % 12
      const i2 = Math.abs(toMidi(moves[j].to) - toMidi(moves[i].to)) % 12
      const same = moves[i].semitones !== 0 && Math.sign(moves[i].semitones) === Math.sign(moves[j].semitones)
      if (same && i1 === i2 && (i1 === 7 || i1 === 0)) parallelPerfects.push(i1 === 7 ? 'quintas paralelas' : 'octavas paralelas')
    }
  }
  return { moves, total, common, outer, parallelPerfects }
}

export function bassOf(notes: string[]): string {
  return lowestFirst(notes)[0]
}

export function midiSetEqual(a: string[], b: string[]): boolean {
  const x = a.map(toMidi).sort((p, q) => p - q)
  const y = b.map(toMidi).sort((p, q) => p - q)
  return x.length === y.length && x.every((v, i) => v === y[i])
}

/** Nombre de la inversión de un voicing dado su bajo real. */
export function inversionOfVoicing(root: string, quality: string, notes: string[]): number {
  const tones = qualityDef(quality).intervals.map((i) => chromaOf(Note.transpose(root, i)))
  return Math.max(0, tones.indexOf(chromaOf(bassOf(notes))))
}

/** Estructuras superiores sobre un dominante (sobre la fundamental `root`). */
export interface UpperStructure { id: string; nameEs: string; triadRoot: string; triadQuality: 'maj' | 'min'; tensions: string; scaleHint: string }

export function dominantUpperStructures(root: string): UpperStructure[] {
  const t = (i: string) => Note.transpose(root, i)
  return [
    { id: 'II', nameEs: 'Tríada mayor sobre el II', triadRoot: t('2M'), triadQuality: 'maj', tensions: '9, ♯11, 13', scaleHint: 'Sugiere lidia dominante: color brillante y abierto.' },
    { id: 'bIII', nameEs: 'Tríada menor sobre el ♭III', triadRoot: t('3m'), triadQuality: 'min', tensions: '♯9, ♯11 (♭5), 7', scaleHint: 'Sonido bluesy con tensión.' },
    { id: 'bVI', nameEs: 'Tríada mayor sobre el ♭VI', triadRoot: t('6m'), triadQuality: 'maj', tensions: '♭13, 1, ♯9', scaleHint: 'Dominante alterado oscuro.' },
    { id: 'bII', nameEs: 'Tríada mayor sobre el ♭II', triadRoot: t('2m'), triadQuality: 'maj', tensions: '♭9, 3, ♭13', scaleHint: 'Dominante alterado con ♭9 y ♭13.' },
  ]
}
