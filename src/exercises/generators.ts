import { Note } from '@tonaljs/tonal'
import {
  buildChord, chordNotesOct, diatonicChords, inversionName, qualityDef, resolveRoman, type Key,
} from '../music/chords'
import { intervalNameEs, chromaOf, toMidi } from '../music/notes'
import { buildProgression, PRESETS, transposeNotes } from '../music/progressions'
import { degreeOf, keySignature, scaleDef, scaleNotes, scaleWithOctaves } from '../music/scales'
import { smoothVoicing, voiceChord, voiceDistance, VOICING_STYLES, type VoicingStyle } from '../music/voicing'
import { C, N, P, R } from './rich'
import type { Exercise, GeneratorId, Rng, Step } from './types'

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type D = 1 | 2 | 3
interface Ctx { d: D; r: Rng; params: Record<string, unknown> }

const pick = <T,>(r: Rng, a: readonly T[]): T => a[Math.floor(r() * a.length)]
function shuffle<T>(r: Rng, a: readonly T[]): T[] {
  const out = [...a]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
const uniq = <T,>(a: T[]) => [...new Set(a)]
let counter = 0
const uid = (gen: string, r: Rng) => `${gen}-${++counter}-${Math.floor(r() * 1e6)}`

const TONICS_BY_D: Record<D, string[]> = {
  1: ['C', 'G', 'F', 'D', 'A'],
  2: ['C', 'G', 'F', 'D', 'A', 'Bb', 'E', 'Eb'],
  3: ['C', 'G', 'F', 'D', 'A', 'Bb', 'E', 'Eb', 'B', 'Ab', 'Db', 'F#'],
}
const tonicsFor = (c: Ctx): string[] => (c.params.tonics as string[] | undefined) ?? TONICS_BY_D[c.d]
const maxAlt = (notes: string[]) => Math.max(...notes.map((n) => Math.abs(Note.get(n).alt)))

const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const PC12 = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
const pairFor = (name: string): string => PC12[chromaOf(name)]

const seqSteps = (notes: string[], beats = 1): Step[] => notes.map((n) => ({ notes: [n], beats }))
const staffClef = (notes: string[]): 'treble' | 'bass' => (notes.reduce((s, n) => s + toMidi(n), 0) / notes.length < 59 ? 'bass' : 'treble')

const SCALE_FORMULA: Record<string, string> = {
  major: 'T–T–st–T–T–T–st', minor: 'T–st–T–T–st–T–T', 'harmonic minor': 'T–st–T–T–st–2st–st',
  'melodic minor': 'T–st–T–T–T–T–st (ascendente)',
}

// ---------- Fundamentos ----------

function noteId(c: Ctx): Exercise {
  const pcPair = c.d === 1 ? pick(c.r, WHITE) : pick(c.r, PC12)
  const note = `${pcPair.split('/')[0]}${3 + Math.floor(c.r() * 2)}`
  const options = c.d === 1 ? WHITE : PC12
  const [a, b] = pairFor(note).split('/')
  return {
    id: uid('note-id', c.r), gen: 'note-id', difficulty: c.d, topic: 'Notas en el teclado',
    prompt: '¿Qué nota es la tecla marcada en el piano?',
    visual: { keys: [note] }, hint: 'Busca el grupo de dos o tres teclas negras que tienes más cerca.',
    response: { type: 'choice', optionKind: 'note', options: [...options], correct: [pairFor(note)] },
    explanation: `La tecla marcada es ${N(a)}${b ? ` (o ${N(b)}, su enarmónica)` : ''}. Do está justo a la izquierda de cada grupo de dos teclas negras.`,
  }
}

function notePlay(c: Ctx): Exercise {
  const pc = c.d === 1 ? pick(c.r, WHITE) : pick(c.r, ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'F#', 'Bb', 'Eb', 'C#', 'Ab'])
  if (c.d === 3) {
    const note = `${pc}${3 + Math.floor(c.r() * 2)}`
    return {
      id: uid('note-play', c.r), gen: 'note-play', difficulty: 3, topic: 'Notas en el teclado',
      prompt: `Toca exactamente ${N(note)} (octava incluida; C4 es el Do central).`,
      visual: { staff: { notes: [note], clef: staffClef([note]) } },
      response: { type: 'notes', mode: 'exact', expected: [note], spellingRequired: false },
      explanation: `${N(note)} es la ${Note.get(note).letter} de la octava ${Note.get(note).oct}. El Do central del piano es C4 (MIDI 60).`,
    }
  }
  return {
    id: uid('note-play', c.r), gen: 'note-play', difficulty: c.d, topic: 'Notas en el teclado',
    prompt: `Toca la nota ${N(pc)} en cualquier octava.`,
    response: { type: 'notes', mode: 'set', expected: [pc], spellingRequired: false },
    explanation: `${N(pc)} se toca en la tecla ${Note.get(pc).acc ? 'negra' : 'blanca'} correspondiente; cualquier octava vale.`,
  }
}

function staffNote(c: Ctx): Exercise {
  const clef = c.d === 1 ? 'treble' : pick(c.r, ['treble', 'bass'] as const)
  const base = clef === 'treble' ? ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] : ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']
  let note = pick(c.r, base)
  if (c.d === 3) note = Note.transpose(note, pick(c.r, ['1A', '-1A'])) // alteración
  const options = c.d === 3 ? PC12 : WHITE
  return {
    id: uid('staff-note', c.r), gen: 'staff-note', difficulty: c.d, topic: 'Lectura en el pentagrama',
    prompt: `¿Qué nota está escrita en clave de ${clef === 'treble' ? 'sol' : 'fa'}?`,
    visual: { staff: { notes: [note], clef } },
    hint: clef === 'treble' ? 'La clave de sol rodea la segunda línea: ahí está Sol.' : 'La clave de fa marca la cuarta línea: ahí está Fa.',
    response: { type: 'choice', optionKind: 'note', options: [...options], correct: [pairFor(note)] },
    explanation: `La nota escrita es ${N(note)}${Note.get(note).acc ? ' (con alteración)' : ''}.`,
  }
}

function keySignatureEx(c: Ctx): Exercise {
  const max = c.d === 1 ? 2 : c.d === 2 ? 4 : 7
  const pool = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].filter((t) => Math.abs(keySignature(t).count) <= max)
  const tonic = pick(c.r, pool)
  const sig = keySignature(tonic)
  const label = (n: number) => (n === 0 ? 'Sin alteraciones' : `${Math.abs(n)} ${n > 0 ? (n === 1 ? 'sostenido' : 'sostenidos') : n === -1 ? 'bemol' : 'bemoles'}`)
  if (c.r() < 0.5) {
    const nums = uniq([sig.count, ...shuffle(c.r, [-3, -2, -1, 0, 1, 2, 3, 4].filter((n) => n !== sig.count && Math.abs(n) <= Math.max(max, 3))).slice(0, 3)])
    return {
      id: uid('key-signature', c.r), gen: 'key-signature', difficulty: c.d, topic: 'Armaduras y tonalidades',
      prompt: `¿Qué armadura tiene ${N(tonic)} mayor?`,
      response: { type: 'choice', optionKind: 'text', options: shuffle(c.r, nums).map(label), correct: [label(sig.count)] },
      explanation: `${N(tonic)} mayor lleva ${label(sig.count).toLowerCase()}${sig.accidentals.length ? `: ${P(sig.accidentals)}` : ''}. Truco: la tónica de una tonalidad con sostenidos está un semitono por encima del último sostenido; con bemoles, el penúltimo bemol da la tónica.`,
    }
  }
  const same = pool.filter((t) => keySignature(t).count !== sig.count)
  const opts = uniq([tonic, ...shuffle(c.r, same).slice(0, 3)])
  return {
    id: uid('key-signature', c.r), gen: 'key-signature', difficulty: c.d, topic: 'Armaduras y tonalidades',
    prompt: `¿Qué tonalidad mayor tiene ${label(sig.count).toLowerCase()}?`,
    response: { type: 'choice', optionKind: 'note', options: shuffle(c.r, opts), correct: [tonic] },
    explanation: `${label(sig.count)} corresponde a ${N(tonic)} mayor${sig.accidentals.length ? ` (${P(sig.accidentals)})` : ''}.`,
  }
}

function degreeIdEx(c: Ctx): Exercise {
  const tonic = pick(c.r, tonicsFor(c))
  const id = c.d === 3 ? pick(c.r, ['major', 'minor', 'harmonic minor']) : 'major'
  const notes = scaleNotes(tonic, id)
  const deg = 1 + Math.floor(c.r() * 7)
  const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  const nm = scaleDef(id).nameEs.split(' (')[0].toLowerCase()
  if (c.r() < 0.5) {
    const wrong = shuffle(c.r, notes.filter((_, i) => i !== deg - 1)).slice(0, 3)
    return {
      id: uid('degree-id', c.r), gen: 'degree-id', difficulty: c.d, topic: 'Grados de la escala',
      prompt: `En ${N(tonic)} ${nm}, ¿qué nota es el grado ${ROM[deg - 1]} (${deg}º)?`,
      response: { type: 'choice', optionKind: 'note', options: shuffle(c.r, [notes[deg - 1], ...wrong]), correct: [notes[deg - 1]] },
      explanation: `La escala de ${N(tonic)} ${nm} es ${P(notes)}; el grado ${deg} es ${N(notes[deg - 1])}.`,
    }
  }
  const n = notes[deg - 1]
  const wrong = shuffle(c.r, ROM.filter((_, i) => i !== deg - 1)).slice(0, 3)
  return {
    id: uid('degree-id', c.r), gen: 'degree-id', difficulty: c.d, topic: 'Grados de la escala',
    prompt: `En ${N(tonic)} ${nm}, ¿qué grado de la escala es la nota ${N(n)}?`,
    response: { type: 'choice', optionKind: 'text', options: shuffle(c.r, [ROM[degreeOf(n, tonic, id) - 1], ...wrong]), correct: [ROM[deg - 1]] },
    explanation: `${P(notes)}: ${N(n)} ocupa el lugar ${deg}º de la escala.`,
  }
}

function scaleBuild(c: Ctx): Exercise {
  const ids = (c.params.scales as string[] | undefined) ?? (c.d === 1 ? ['major'] : c.d === 2 ? ['major', 'minor'] : ['major', 'minor', 'harmonic minor', 'melodic minor'])
  const id = pick(c.r, ids)
  const tonics = (c.params.tonics as string[] | undefined) ?? (id === 'major' ? tonicsFor(c) : tonicsFor(c).filter((t) => maxAlt(scaleNotes(t, id)) <= 1))
  const tonic = pick(c.r, tonics)
  const notes = scaleNotes(tonic, id)
  const def = scaleDef(id)
  return {
    id: uid('scale-build', c.r), gen: 'scale-build', difficulty: c.d, topic: 'Construcción de escalas',
    prompt: `Construye la escala de ${N(tonic)} (${def.nameEs.toLowerCase()}), ascendente. Tócala nota a nota o escríbela.`,
    hint: SCALE_FORMULA[id] ? `Fórmula en tonos (T) y semitonos (st): ${SCALE_FORMULA[id]}. Usa cada letra una sola vez.` : 'Usa cada letra una sola vez.',
    listen: { steps: seqSteps(scaleWithOctaves(tonic, id, 4, true), 0.5), tempo: 110, label: 'Escuchar la solución' },
    response: { type: 'notes', mode: 'ordered', expected: notes, spellingRequired: true },
    explanation: `${N(tonic)} ${def.nameEs.toLowerCase()}: ${P(notes)}. ${SCALE_FORMULA[id] ? `Sigue la fórmula ${SCALE_FORMULA[id]}.` : ''}`,
  }
}

const INT_BY_D: Record<D, string[]> = {
  1: ['2M', '3M', '4P', '5P', '6M', '8P'],
  2: ['2m', '2M', '3m', '3M', '4P', '5P', '6m', '6M', '7m', '7M', '8P'],
  3: ['2m', '2M', '3m', '3M', '4P', '4A', '5d', '5P', '5A', '6m', '6M', '7m', '7M', '8P'],
}
const ROOTS_INT = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'F#']

function intervalId(c: Ctx): Exercise {
  const set = (c.params.intervals as string[] | undefined) ?? INT_BY_D[c.d]
  for (let k = 0; k < 40; k++) {
    const interval = pick(c.r, set)
    const rootPc = pick(c.r, ROOTS_INT)
    const root = `${rootPc}${3 + Math.floor(c.r() * 2)}`
    const top = Note.transpose(root, interval)
    if (Math.abs(Note.get(top).alt) > (c.d === 3 ? 1 : 1) || Note.get(top).acc.length > 1) continue
    return {
      id: uid('interval-id', c.r), gen: 'interval-id', difficulty: c.d, topic: 'Intervalos',
      prompt: `¿Qué intervalo hay entre ${N(root)} y ${N(top)}?`,
      visual: { staff: { notes: [root, top], clef: staffClef([root, top]), chord: false }, keys: [root, top] },
      listen: { steps: [{ notes: [root], beats: 1 }, { notes: [top], beats: 1 }], tempo: 90, label: 'Escuchar' },
      hint: 'Cuenta las letras (nombres de nota) para el número y los semitonos para la calidad.',
      response: { type: 'choice', optionKind: 'interval', options: [...set], correct: [interval] },
      explanation: `De ${N(root)} a ${N(top)} hay ${Note.get(top).midi! - Note.get(root).midi!} semitonos y ${Math.abs(parseInt(interval, 10))} letras: ${intervalNameEs(interval)} (${interval}).`,
    }
  }
  return intervalId({ ...c, params: {} })
}

function intervalBuild(c: Ctx): Exercise {
  const set = (c.params.intervals as string[] | undefined) ?? INT_BY_D[c.d]
  for (let k = 0; k < 40; k++) {
    const interval = pick(c.r, set.filter((i) => i !== '8P' || c.d < 3))
    const rootPc = pick(c.r, c.d === 1 ? ['C', 'D', 'E', 'F', 'G', 'A'] : ROOTS_INT)
    const top = Note.transpose(rootPc, interval)
    if (Note.get(top).acc.length > 1) continue
    return {
      id: uid('interval-build', c.r), gen: 'interval-build', difficulty: c.d, topic: 'Intervalos',
      prompt: `Construye una ${intervalNameEs(interval)} ascendente sobre ${N(rootPc)}. Marca las dos notas.`,
      hint: 'Piensa primero en la letra que toca y después ajusta la alteración.',
      response: { type: 'notes', mode: 'set', expected: [rootPc, Note.pitchClass(top)], spellingRequired: true },
      listen: { steps: [{ notes: [`${rootPc}4`], beats: 1 }, { notes: [Note.transpose(`${rootPc}4`, interval)], beats: 1 }], tempo: 90, label: 'Escuchar la solución' },
      explanation: `${intervalNameEs(interval)} sobre ${N(rootPc)} = ${N(Note.pitchClass(top))}. La letra se obtiene contando; la alteración, midiendo semitonos.`,
    }
  }
  return intervalBuild({ ...c, params: {} })
}

// ---------- Acordes ----------

const TRIADS_BY_D: Record<D, string[]> = { 1: ['maj', 'min'], 2: ['maj', 'min', 'dim', 'aug'], 3: ['maj', 'min', 'dim', 'aug'] }
const SEVENTHS_BY_D: Record<D, string[]> = { 1: ['maj7', '7', 'm7'], 2: ['maj7', '7', 'm7', 'm7b5'], 3: ['maj7', '7', 'm7', 'm7b5', 'dim7', 'mMaj7'] }

function chordBuild(gen: 'triad-build' | 'seventh-build' | 'extension-build', c: Ctx): Exercise {
  const qs = (c.params.qualities as string[] | undefined) ?? (gen === 'triad-build' ? TRIADS_BY_D[c.d] : gen === 'seventh-build' ? SEVENTHS_BY_D[c.d] : ['9', 'maj9', 'm9', '13', '7b9', '7#9'])
  for (let k = 0; k < 50; k++) {
    const quality = pick(c.r, qs)
    const root = pick(c.r, tonicsFor(c).concat(c.d === 1 ? [] : ['G#', 'C#']))
    const ch = buildChord(root, quality)
    if (maxAlt(ch.notes) > 1) continue
    const q = qualityDef(quality)
    return {
      id: uid(gen, c.r), gen, difficulty: c.d, topic: gen === 'triad-build' ? 'Tríadas' : gen === 'seventh-build' ? 'Acordes de séptima' : 'Extensiones',
      prompt: `Construye ${N(root)} ${q.nameEs.toLowerCase()}${ch.symbol !== root ? ` (${C(ch.symbol)})` : ''}. Toca o escribe sus notas.`,
      hint: `Fórmula: ${q.intervals.join(' · ')}. Las notas se apilan por terceras (letras alternas).`,
      listen: { steps: [{ notes: chordNotesOct(root, quality, 3), beats: 2 }], tempo: 80, label: 'Escuchar la solución' },
      response: { type: 'notes', mode: 'set', expected: ch.notes, spellingRequired: true },
      explanation: `${C(ch.symbol)} = ${P(ch.notes)} (${q.intervals.join(' – ')}).`,
    }
  }
  return chordBuild(gen, { ...c, params: {} })
}

function chordIdEx(c: Ctx): Exercise {
  const qs = c.d === 1 ? TRIADS_BY_D[1] : c.d === 2 ? ['maj', 'min', 'dim', 'aug', 'maj7', '7', 'm7', 'm7b5'] : SEVENTHS_BY_D[3]
  for (let k = 0; k < 50; k++) {
    const quality = pick(c.r, qs)
    const root = pick(c.r, tonicsFor(c))
    const ch = buildChord(root, quality)
    if (maxAlt(ch.notes) > 1) continue
    const inv = c.d === 3 ? Math.floor(c.r() * Math.min(ch.notes.length, 3)) : 0
    const notes = chordNotesOct(root, quality, 4, inv)
    const same = qs.filter((x) => x !== quality && maxAlt(buildChord(root, x).notes) <= 1).map((x) => buildChord(root, x).symbol)
    const opts = uniq([ch.symbol, ...shuffle(c.r, same).slice(0, 3)])
    return {
      id: uid('chord-id', c.r), gen: 'chord-id', difficulty: c.d, topic: 'Reconocimiento de acordes',
      prompt: `Observa las notas. ¿Qué acorde forman${inv ? ' (el bajo no es la fundamental)' : ''}?`,
      visual: { staff: { notes, clef: 'treble', chord: true }, keys: notes },
      listen: { steps: [{ notes, beats: 2 }], tempo: 80, label: 'Escuchar' },
      hint: 'Ordena las notas por terceras para encontrar la fundamental.',
      response: { type: 'choice', optionKind: 'chord', options: shuffle(c.r, opts), correct: [ch.symbol] },
      explanation: `Las notas ${P(ch.notes)} apiladas por terceras dan ${C(ch.symbol)}: ${qualityDef(quality).nameEs.toLowerCase()}.`,
    }
  }
  return chordIdEx({ ...c, params: {} })
}

function inversionId(c: Ctx): Exercise {
  const qs = c.d === 1 ? ['maj', 'min'] : c.d === 2 ? ['maj', 'min', '7', 'maj7', 'm7'] : ['maj', 'min', '7', 'maj7', 'm7', 'm7b5']
  for (let k = 0; k < 50; k++) {
    const quality = pick(c.r, qs)
    const root = pick(c.r, tonicsFor(c))
    const ch = buildChord(root, quality)
    if (maxAlt(ch.notes) > 1) continue
    const inv = Math.floor(c.r() * ch.notes.length)
    const notes = chordNotesOct(root, quality, 4, inv)
    const opts = ch.notes.length === 3 ? ['Estado fundamental', 'Primera inversión', 'Segunda inversión'] : ['Estado fundamental', 'Primera inversión', 'Segunda inversión', 'Tercera inversión']
    return {
      id: uid('inversion-id', c.r), gen: 'inversion-id', difficulty: c.d, topic: 'Inversiones',
      prompt: `${C(ch.symbol)} aparece con estas notas. ¿En qué posición está?`,
      visual: { staff: { notes, clef: 'treble', chord: true }, keys: notes },
      listen: { steps: [{ notes, beats: 2 }], tempo: 80, label: 'Escuchar' },
      hint: 'Mira cuál es la nota más grave y qué función tiene dentro del acorde.',
      response: { type: 'choice', optionKind: 'text', options: opts, correct: [opts[inv]] },
      explanation: `El bajo es ${N(Note.pitchClass(notes[0]))}, ${inv === 0 ? 'la fundamental' : inv === 1 ? 'la tercera' : inv === 2 ? 'la quinta' : 'la séptima'} del acorde: ${inversionName(inv, ch.notes.length)}.`,
    }
  }
  return inversionId({ ...c, params: {} })
}

function inversionBuild(c: Ctx): Exercise {
  const qs = c.d === 1 ? ['maj', 'min'] : ['maj', 'min', '7', 'maj7', 'm7']
  for (let k = 0; k < 50; k++) {
    const quality = pick(c.r, qs)
    const root = pick(c.r, tonicsFor(c))
    const ch = buildChord(root, quality)
    if (maxAlt(ch.notes) > 1) continue
    const inv = 1 + Math.floor(c.r() * (ch.notes.length - 1))
    const bass = ch.notes[inv]
    return {
      id: uid('inversion-build', c.r), gen: 'inversion-build', difficulty: c.d, topic: 'Inversiones',
      prompt: `Toca ${C(ch.symbol)} en ${inversionName(inv, ch.notes.length)} (el bajo debe ser ${N(bass)}).`,
      hint: 'Toca las notas del acorde con la nota indicada como la más grave.',
      listen: { steps: [{ notes: chordNotesOct(root, quality, 3, inv), beats: 2 }], tempo: 80, label: 'Escuchar la solución' },
      response: { type: 'notes', mode: 'bass-set', expected: ch.notes, bass, spellingRequired: true },
      explanation: `${C(ch.symbol)} contiene ${P(ch.notes)}; en ${inversionName(inv, ch.notes.length)} el bajo es ${N(bass)}.`,
    }
  }
  return inversionBuild({ ...c, params: {} })
}

// ---------- Oído ----------

const AURAL_INT_BY_D: Record<D, string[]> = {
  1: ['2M', '3M', '4P', '5P', '8P'],
  2: ['2m', '2M', '3m', '3M', '4P', '5P', '6m', '6M', '7m', '7M', '8P'],
  3: ['2m', '2M', '3m', '3M', '4P', 'TT', '5P', '6m', '6M', '7m', '7M', '8P'],
}

function auralInterval(c: Ctx): Exercise {
  const set = (c.params.intervals as string[] | undefined) ?? AURAL_INT_BY_D[c.d]
  const kind = c.d === 1 ? 'asc' : pick(c.r, ['asc', 'desc', 'harm'] as const)
  const interval = pick(c.r, set)
  const real = interval === 'TT' ? '4A' : interval
  const rootN = pick(c.r, ['C4', 'D4', 'E4', 'F4', 'G4', 'A3', 'Bb3', 'Eb4', 'F#3'])
  const other = kind === 'desc' ? Note.transpose(rootN, `-${real}`) : Note.transpose(rootN, real)
  const steps: Step[] = kind === 'harm' ? [{ notes: [rootN, other], beats: 2 }] : [{ notes: [rootN], beats: 1 }, { notes: [other], beats: 1 }]
  const label = kind === 'asc' ? 'melódico ascendente' : kind === 'desc' ? 'melódico descendente' : 'armónico (simultáneo)'
  return {
    id: uid('aural-interval', c.r), gen: 'aural-interval', difficulty: c.d, aural: true, topic: 'Oído: intervalos',
    prompt: `Escucha el intervalo (${label}) y di cuál es.`,
    listen: { steps, tempo: 80, label: 'Escuchar el intervalo' },
    hint: 'Canta mentalmente: 2ª mayor = «Cumpleaños feliz» (inicio), 5ª justa = «Estrellita», 4ª justa = «Marcha nupcial».',
    response: { type: 'choice', optionKind: 'interval', options: [...set], correct: interval === 'TT' ? ['TT'] : [interval] },
    explanation: `Era ${interval === 'TT' ? 'el tritono (4ª aumentada / 5ª disminuida)' : intervalNameEs(interval)} entre ${N(rootN)} y ${N(other)}.`,
  }
}

const AURAL_Q_BY_D: Record<D, string[]> = { 1: ['maj', 'min'], 2: ['maj', 'min', 'dim', 'aug'], 3: ['maj7', '7', 'm7', 'm7b5', 'dim7'] }
const AURAL_Q_NAME: Record<string, string> = { maj: 'Mayor', min: 'Menor', dim: 'Disminuida', aug: 'Aumentada', maj7: 'Maj7', '7': 'Dominante 7', m7: 'Menor 7', m7b5: 'Semidisminuido', dim7: 'Disminuido 7' }

function auralChord(c: Ctx): Exercise {
  const qs = (c.params.qualities as string[] | undefined) ?? AURAL_Q_BY_D[c.d]
  const quality = pick(c.r, qs)
  const root = pick(c.r, ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb'])
  const notes = chordNotesOct(root, quality, 3 + Math.floor(c.r() * 2))
  const arpeg = c.d > 1 && c.r() < 0.4
  return {
    id: uid('aural-chord', c.r), gen: 'aural-chord', difficulty: c.d, aural: true, topic: 'Oído: acordes',
    prompt: 'Escucha el acorde y reconoce su calidad.',
    listen: { steps: arpeg ? [...seqSteps(notes, 0.5), { notes, beats: 2 }] : [{ notes, beats: 2.5 }], tempo: 90, label: 'Escuchar el acorde' },
    hint: 'Mayor: brillante. Menor: oscuro. Disminuido: tenso e inestable. Aumentado: flotante y ambiguo.',
    response: { type: 'choice', optionKind: 'text', options: qs.map((q) => AURAL_Q_NAME[q]), correct: [AURAL_Q_NAME[quality]] },
    explanation: `Era un acorde ${AURAL_Q_NAME[quality].toLowerCase()} (${C(buildChord(root, quality).symbol)}).`,
  }
}

function auralCadence(c: Ctx): Exercise {
  const types = c.d === 1 ? ['Auténtica', 'Plagal', 'Semicadencia'] : ['Auténtica', 'Plagal', 'Semicadencia', 'Rota']
  const type = pick(c.r, types)
  const tonic = pick(c.r, ['C', 'G', 'F', 'D', 'Bb', 'A'])
  const key: Key = { tonic, mode: 'major' }
  const romans = { Auténtica: ['I', 'V', 'I'], Plagal: ['I', 'IV', 'I'], Semicadencia: ['I', 'IV', 'V'], Rota: ['I', 'V', 'vi'] }[type] as string[]
  let prev: string[] | null = null
  const steps: Step[] = romans.map((rm) => {
    const ch = resolveRoman(rm, key)
    const notes = smoothVoicing(prev, ch.notes, [52, 72])
    prev = notes
    return { notes, beats: 2 }
  })
  const bassNotes = romans.map((rm) => Note.transpose(`${resolveRoman(rm, key).root}2`, '1P'))
  const merged = steps.map((s, i) => ({ ...s, notes: [bassNotes[i], ...s.notes] }))
  return {
    id: uid('aural-cadence', c.r), gen: 'aural-cadence', difficulty: c.d, aural: true, topic: 'Oído: cadencias',
    prompt: 'Escucha los tres acordes (empieza siempre en la tónica). ¿Con qué cadencia terminan?',
    listen: { steps: merged, tempo: 70, label: 'Escuchar la cadencia' },
    hint: 'Auténtica: acaba en reposo (V→I). Plagal: «amén» (IV→I). Semicadencia: queda abierta en V. Rota: V→vi, sorpresa.',
    response: { type: 'choice', optionKind: 'text', options: types, correct: [type] },
    explanation: `Era una cadencia ${type.toLowerCase()}: ${R(romans.join(' '))} → ${romans.map((rm) => C(resolveRoman(rm, key).symbol)).join(' – ')}.`,
  }
}

// ---------- Función y análisis ----------

const FN_NAME = { T: 'Tónica', PD: 'Predominante', D: 'Dominante' } as const

function degreeFunction(c: Ctx): Exercise {
  const tonic = pick(c.r, tonicsFor(c))
  const mode = c.d === 3 ? pick(c.r, ['major', 'minor'] as const) : 'major'
  const size = c.d >= 2 ? 4 : 3
  const chords = diatonicChords(tonic, mode === 'minor' ? 'harmonic minor' : 'major', size)
  const ch = pick(c.r, chords.filter((x) => x.quality !== 'aug'))
  const keyName = `${N(tonic)} ${mode === 'major' ? 'mayor' : 'menor'}`
  if (c.d === 1 || c.r() < 0.5) {
    const wrong = shuffle(c.r, chords.filter((x) => x.roman !== ch.roman && x.quality !== 'aug')).slice(0, 3).map((x) => x.roman)
    return {
      id: uid('degree-function', c.r), gen: 'degree-function', difficulty: c.d, topic: 'Grados y funciones',
      prompt: `En ${keyName}, ¿qué número romano corresponde al acorde ${C(ch.symbol)}?`,
      response: { type: 'choice', optionKind: 'roman', options: shuffle(c.r, [ch.roman, ...wrong]), correct: [ch.roman] },
      explanation: `${C(ch.symbol)} se construye sobre el grado ${ch.degree} de ${keyName}; por su calidad se escribe ${R(ch.roman)}.`,
    }
  }
  return {
    id: uid('degree-function', c.r), gen: 'degree-function', difficulty: c.d, topic: 'Grados y funciones',
    prompt: `En ${keyName}, ¿qué función armónica principal tiene ${C(ch.symbol)} (${R(ch.roman)})?`,
    response: { type: 'choice', optionKind: 'text', options: ['Tónica', 'Predominante', 'Dominante'], correct: [FN_NAME[ch.fn]] },
    explanation: `${R(ch.roman)} es ${FN_NAME[ch.fn].toLowerCase()}: ${ch.fn === 'T' ? 'I, vi y iii dan reposo (iii y vi comparten notas con I).' : ch.fn === 'PD' ? 'ii y IV preparan la dominante.' : 'V y vii° crean tensión que pide resolver en la tónica.'}`,
  }
}

interface Template { romans: string[]; mode: 'major' | 'minor'; accept: string[]; bad: string[]; why: string }
const TEMPLATES: Record<D, Template[]> = {
  1: [
    { romans: ['I', 'IV', '?', 'I'], mode: 'major', accept: ['V', 'V7'], bad: ['ii', 'iii', 'vi'], why: 'Antes de volver a la tónica hace falta una dominante.' },
    { romans: ['I', '?', 'V', 'I'], mode: 'major', accept: ['IV', 'ii'], bad: ['iii', 'vii°', 'III'], why: 'Entre tónica y dominante encaja un predominante (IV o ii).' },
    { romans: ['I', 'vi', '?', 'V'], mode: 'major', accept: ['ii', 'IV'], bad: ['iii', 'vii°', 'III'], why: 'vi → predominante → V es la ruta clásica.' },
    { romans: ['vi', 'IV', 'I', '?'], mode: 'major', accept: ['V', 'V7'], bad: ['iii', 'vii°', 'ii'], why: 'Para cerrar el ciclo y volver a empezar, la dominante.' },
  ],
  2: [
    { romans: ['ii', '?', 'I'], mode: 'major', accept: ['V', 'V7', 'vii°'], bad: ['iii', 'vi', 'IV'], why: 'ii → dominante → tónica.' },
    { romans: ['I', 'vi', 'ii', '?'], mode: 'major', accept: ['V', 'V7'], bad: ['iii', 'IV', 'vi'], why: 'Círculo de quintas: vi → ii → V.' },
    { romans: ['i', 'iv', '?', 'i'], mode: 'minor', accept: ['V', 'V7', 'vii°'], bad: ['III', 'VI', 'ii°'], why: 'En menor armónica, la dominante lleva sensible (V mayor).' },
    { romans: ['i', '?', 'III', 'VII'], mode: 'minor', accept: ['VI', 'iv'], bad: ['V', 'ii°', 'vii°'], why: 'i → VI → III → VII es una cadena modal habitual (usa VI o iv antes de III).' },
  ],
  3: [
    { romans: ['ii7', '?', 'Imaj7'], mode: 'major', accept: ['V7', 'bII7'], bad: ['iii7', 'vi7', 'IVmaj7'], why: 'Dominante o su sustituto tritonal bII7: ambos resuelven por semitono/quinta.' },
    { romans: ['Imaj7', 'vi7', 'ii7', '?'], mode: 'major', accept: ['V7', 'bII7'], bad: ['iii7', 'IVmaj7', 'vi7'], why: 'Turnaround clásico: acaba en dominante (o bII7).' },
    { romans: ['I', 'V7/ii', '?', 'V7'], mode: 'major', accept: ['ii', 'ii7'], bad: ['iii', 'IV', 'vi'], why: 'V7/ii resuelve en ii: la dominante secundaria necesita su objetivo.' },
  ],
}

function completeProgression(c: Ctx): Exercise {
  const t = pick(c.r, TEMPLATES[c.d])
  const tonic = pick(c.r, t.mode === 'minor' ? ['A', 'D', 'E', 'G', 'C'] : tonicsFor(c))
  const key: Key = { tonic, mode: t.mode }
  const sym = (rm: string) => resolveRoman(rm, key).symbol
  const accept = t.accept.map(sym)
  const correctShown = pick(c.r, t.accept)
  const opts = uniq([sym(correctShown), ...shuffle(c.r, t.bad).slice(0, 3).map(sym)])
  const shown = t.romans.map((rm) => (rm === '?' ? '¿?' : C(sym(rm)))).join(' – ')
  return {
    id: uid('complete-progression', c.r), gen: 'complete-progression', difficulty: c.d, topic: 'Progresiones',
    prompt: `En ${N(tonic)} ${t.mode === 'major' ? 'mayor' : 'menor'}: ${shown}. ¿Qué acorde falta?`,
    hint: 'Piensa en la función de cada acorde: tónica, predominante o dominante.',
    response: { type: 'choice', optionKind: 'chord', options: shuffle(c.r, opts), correct: accept },
    explanation: `${t.why} Aquí valen: ${accept.map((x) => C(x)).join(', ')} (${t.accept.map((x) => R(x)).join(', ')}). La armonía admite varias soluciones defendibles; las demás opciones rompen la lógica funcional.`,
  }
}

function voiceLeading(c: Ctx): Exercise {
  const pairs: [string, string][] = c.d === 1
    ? [['I', 'IV'], ['I', 'V'], ['IV', 'V'], ['V', 'I'], ['vi', 'IV']]
    : [['ii7', 'V7'], ['V7', 'Imaj7'], ['IV', 'V7'], ['vi', 'ii7'], ['Imaj7', 'vi7']]
  const [r1, r2] = pick(c.r, pairs)
  const tonic = pick(c.r, tonicsFor(c).filter((t) => maxAlt(scaleNotes(t, 'major')) <= 1))
  const key: Key = { tonic, mode: 'major' }
  const a = resolveRoman(r1, key)
  const b = resolveRoman(r2, key)
  const start = smoothVoicing(null, a.notes, [52, 72])
  const best = smoothVoicing(start, b.notes, [48, 76])
  const cand: string[][] = [best]
  // alternativas: otras inversiones/octavas razonables
  for (let inv = 0; inv < b.notes.length; inv++) {
    for (let o = 3; o <= 5; o++) {
      const rot = [...b.notes.slice(inv), ...b.notes.slice(0, inv)]
      const notes: string[] = []
      let prev = -1
      rot.forEach((pc) => { let oct = o; while (toMidi(`${pc}${oct}`) <= prev) oct++; notes.push(`${pc}${oct}`); prev = toMidi(`${pc}${oct}`) })
      if (!cand.some((x) => x.join() === notes.join())) cand.push(notes)
    }
  }
  const bestD = voiceDistance(start, best)
  const worse = shuffle(c.r, cand.filter((x) => voiceDistance(start, x) >= bestD + 4)).slice(0, 2)
  if (worse.length < 2) return voiceLeading({ ...c, d: 1, params: {} })
  const ties = cand.filter((x) => voiceDistance(start, x) === bestD).map((x) => x.join(','))
  const opts = shuffle(c.r, [best, ...worse]).map((x) => x.join(','))
  const dist = (s: string) => voiceDistance(start, s.split(','))
  return {
    id: uid('voice-leading', c.r), gen: 'voice-leading', difficulty: c.d, topic: 'Conducción de voces',
    prompt: `Tocas ${C(a.symbol)} con ${P(start)}. ¿Qué distribución de ${C(b.symbol)} conduce mejor las voces (menos movimiento)?`,
    visual: { staff: { notes: start, clef: 'treble', chord: true }, keys: start },
    listen: { steps: [{ notes: start, beats: 2 }], tempo: 80, label: 'Escuchar el primer acorde' },
    hint: 'Busca las notas comunes y mueve las demás lo mínimo, por grado conjunto.',
    response: { type: 'choice', optionKind: 'notes', options: opts, correct: ties },
    explanation: `Movimiento total (semitonos): ${opts.map((o) => dist(o)).join(' / ')}. La mejor reparte los saltos mínimos y mantiene las notas comunes en su sitio. En música real puede interesar un salto por motivos melódicos o de registro, pero como regla de partida: movimiento mínimo.`,
  }
}

function transposeNotesEx(c: Ctx): Exercise {
  const set = c.d === 1 ? ['2M', '5P', '4P'] : c.d === 2 ? ['2M', '3M', '3m', '4P', '5P', '6M'] : ['2M', '3m', '3M', '4P', '5P', '6m', '7m', '2m']
  for (let k = 0; k < 60; k++) {
    const interval = pick(c.r, set)
    const quality = pick(c.r, ['maj', 'min'])
    const root = pick(c.r, tonicsFor(c))
    const src = buildChord(root, quality).notes
    const out = transposeNotes(src, interval)
    if (maxAlt(out) > 1) continue
    return {
      id: uid('transpose-notes', c.r), gen: 'transpose-notes', difficulty: c.d, topic: 'Transposición',
      prompt: `Transpón ${P(src)} una ${intervalNameEs(interval)} ascendente.`,
      hint: 'Sube cada nota el mismo intervalo: cuenta las letras y ajusta las alteraciones.',
      response: { type: 'notes', mode: 'ordered', expected: out, spellingRequired: true },
      explanation: `${P(src)} + ${interval} = ${P(out)}. Se desplaza cada nota con el mismo intervalo (conservando el tipo de acorde).`,
    }
  }
  return transposeNotesEx({ ...c, params: {} })
}

function transposeProgression(c: Ctx): Exercise {
  const base = pick(c.r, PRESETS.filter((p) => p.mode === 'major' && p.romans.every((x) => !x.includes('/'))))
  const from = 'C'
  const to = pick(c.r, tonicsFor(c).filter((t) => t !== 'C'))
  const key: Key = { tonic: from, mode: 'major' }
  const src = buildProgression(base.romans.map((x) => ({ roman: x, beats: 4 })), key).map((x) => x.symbol)
  const dst = buildProgression(base.romans.map((x) => ({ roman: x, beats: 4 })), { tonic: to, mode: 'major' }).map((x) => x.symbol)
  const wrongA = src.map((s) => s.replace(/^[A-G][#b]?/, (m) => Note.transpose(m, '2M')))
  const wrongB = dst.map((s, i) => (i === 1 ? s.replace(/m(?!aj)/, '') || s : s))
  const wrongC = buildProgression(base.romans.map((x) => ({ roman: x, beats: 4 })), { tonic: Note.transpose(to, '-2m'), mode: 'major' }).map((x) => x.symbol)
  const opts = uniq([dst.join(','), wrongA.join(','), wrongC.join(','), wrongB.join(',')]).slice(0, 4)
  return {
    id: uid('transpose-progression', c.r), gen: 'transpose-progression', difficulty: c.d, topic: 'Transposición',
    prompt: `${src.map((x) => C(x)).join(' – ')} está en ${N(from)} mayor. ¿Cómo queda en ${N(to)} mayor?`,
    response: { type: 'choice', optionKind: 'chords', options: shuffle(c.r, opts), correct: [dst.join(',')] },
    explanation: `Se conserva la función (${R(base.romans.join(' – '))}) y cambia la tónica: ${dst.map((x) => C(x)).join(' – ')}.`,
  }
}

function progSteps(romans: string[], key: Key): Step[] {
  let prev: string[] | null = null
  return romans.map((rm) => {
    const notes = smoothVoicing(prev, resolveRoman(rm, key).notes, [52, 74])
    prev = notes
    return { notes: [Note.transpose(`${resolveRoman(rm, key).root}2`, '1P'), ...notes], beats: 2 }
  })
}

function progressionAnalysis(c: Ctx): Exercise {
  const pool = PRESETS.filter((p) => !p.romans.some((x) => x.includes('/') || x.startsWith('b')) && (c.d >= 2 || p.romans.every((x) => /^[IV]+$|^[iv]+$/.test(x) || x === 'vi')))
  const p = pick(c.r, pool)
  const tonic = pick(c.r, p.mode === 'minor' ? ['A', 'D', 'E', 'G'] : tonicsFor(c))
  const key: Key = { tonic, mode: p.mode }
  const syms = buildProgression(p.romans.map((x) => ({ roman: x, beats: 4 })), key).map((x) => x.symbol)
  const mutate = (rs: string[]) => {
    const out = [...rs]
    const i = 1 + Math.floor(c.r() * (out.length - 1))
    const alt = pick(c.r, ['ii', 'IV', 'V', 'vi', 'iii', 'iv', 'VI'].filter((x) => x !== out[i]))
    out[i] = alt
    return out
  }
  const opts = uniq([p.romans.join(','), mutate(p.romans).join(','), mutate(p.romans).join(','), mutate(p.romans).join(',')])
  return {
    id: uid('progression-analysis', c.r), gen: 'progression-analysis', difficulty: c.d, topic: 'Análisis armónico',
    prompt: `Analiza en ${N(tonic)} ${p.mode === 'major' ? 'mayor' : 'menor'}: ${syms.map((x) => C(x)).join(' – ')}`,
    listen: { steps: progSteps(p.romans, key), tempo: 80, label: 'Escuchar la progresión' },
    response: { type: 'choice', optionKind: 'romans', options: shuffle(c.r, opts), correct: [p.romans.join(',')] },
    explanation: `${syms.map((s, i) => `${C(s)} = ${R(p.romans[i])}`).join('; ')}. ${p.description}`,
  }
}

function secondaryDominant(c: Ctx): Exercise {
  const targets = c.d === 1 ? ['V', 'vi'] : ['ii', 'iii', 'IV', 'V', 'vi']
  const tonic = pick(c.r, tonicsFor(c).filter((t) => maxAlt(scaleNotes(t, 'major')) <= 1))
  const key: Key = { tonic, mode: 'major' }
  const target = pick(c.r, targets)
  const rom = `V7/${target}`
  const sym = resolveRoman(rom, key).symbol
  const tsym = resolveRoman(target, key).symbol
  const opts = uniq([rom, ...shuffle(c.r, targets.filter((x) => x !== target)).slice(0, 3).map((x) => `V7/${x}`)])
  return {
    id: uid('secondary-dominant', c.r), gen: 'secondary-dominant', difficulty: c.d, topic: 'Dominantes secundarias',
    prompt: `En ${N(tonic)} mayor aparece ${C(sym)}, un acorde ajeno a la escala. ¿Cómo se analiza?`,
    hint: '¿A qué acorde de la tonalidad resolvería por quinta descendente?',
    listen: { steps: [{ notes: chordNotesOct(resolveRoman(rom, key).root, '7', 3), beats: 2 }, { notes: chordNotesOct(resolveRoman(target, key).root, resolveRoman(target, key).quality, 3), beats: 2 }], tempo: 80, label: 'Escuchar la resolución' },
    response: { type: 'choice', optionKind: 'roman', options: shuffle(c.r, opts), correct: [rom] },
    explanation: `${C(sym)} es la dominante de ${C(tsym)} (${R(target)}): resuelve a ${C(tsym)} por quinta descendente, así que se escribe ${R(rom)}.`,
  }
}

function voicingId(c: Ctx): Exercise {
  const quality = pick(c.r, ['maj7', 'm7', '7'])
  const root = pick(c.r, ['C', 'D', 'F', 'G', 'Bb', 'Eb', 'A'])
  const styles: { s: VoicingStyle; name: string }[] = [
    { s: 'close', name: 'Cerrado' }, { s: 'drop2', name: 'Drop 2' }, { s: 'rootlessA', name: 'Sin fundamental' }, { s: 'shell', name: 'Shell (1-3-7)' },
  ]
  const target = pick(c.r, styles)
  const v = voiceChord(root, quality, target.s, { octave: 3, inversion: target.s === 'close' ? 0 : 0 })
  const ch = buildChord(root, quality)
  return {
    id: uid('voicing-id', c.r), gen: 'voicing-id', difficulty: 3, topic: 'Voicings',
    prompt: `Sobre ${C(ch.symbol)} suenan estas notas. ¿Qué tipo de distribución es?`,
    visual: { staff: { notes: v.notes, clef: staffClef(v.notes), chord: true }, keys: v.notes },
    listen: { steps: [{ notes: v.notes, beats: 2.5 }], tempo: 80, label: 'Escuchar' },
    response: { type: 'choice', optionKind: 'text', options: styles.map((x) => x.name), correct: [target.name] },
    explanation: `${P(v.notes)} sobre ${C(ch.symbol)}: ${VOICING_STYLES.find((x) => x.id === target.s)?.hint ?? ''}`,
  }
}

export interface GeneratorInfo {
  id: GeneratorId
  nameEs: string
  category: 'fundamentos' | 'acordes' | 'oído' | 'armonía' | 'avanzado'
  input: 'opciones' | 'piano' | 'mixto'
  minLevel: number
  make: (c: Ctx) => Exercise
}

export const GENERATORS: GeneratorInfo[] = [
  { id: 'note-id', nameEs: 'Identificar notas en el teclado', category: 'fundamentos', input: 'opciones', minLevel: 1, make: noteId },
  { id: 'note-play', nameEs: 'Tocar una nota', category: 'fundamentos', input: 'piano', minLevel: 1, make: notePlay },
  { id: 'staff-note', nameEs: 'Leer notas en el pentagrama', category: 'fundamentos', input: 'opciones', minLevel: 1, make: staffNote },
  { id: 'key-signature', nameEs: 'Armaduras y tonalidades', category: 'fundamentos', input: 'opciones', minLevel: 1, make: keySignatureEx },
  { id: 'degree-id', nameEs: 'Grados de la escala', category: 'fundamentos', input: 'opciones', minLevel: 1, make: degreeIdEx },
  { id: 'scale-build', nameEs: 'Construir escalas', category: 'fundamentos', input: 'mixto', minLevel: 1, make: scaleBuild },
  { id: 'interval-id', nameEs: 'Identificar intervalos', category: 'fundamentos', input: 'opciones', minLevel: 1, make: intervalId },
  { id: 'interval-build', nameEs: 'Construir intervalos', category: 'fundamentos', input: 'mixto', minLevel: 1, make: intervalBuild },
  { id: 'triad-build', nameEs: 'Construir tríadas', category: 'acordes', input: 'mixto', minLevel: 2, make: (c) => chordBuild('triad-build', c) },
  { id: 'seventh-build', nameEs: 'Construir acordes de séptima', category: 'acordes', input: 'mixto', minLevel: 2, make: (c) => chordBuild('seventh-build', c) },
  { id: 'chord-id', nameEs: 'Reconocer acordes', category: 'acordes', input: 'opciones', minLevel: 2, make: chordIdEx },
  { id: 'inversion-id', nameEs: 'Identificar inversiones', category: 'acordes', input: 'opciones', minLevel: 2, make: inversionId },
  { id: 'inversion-build', nameEs: 'Tocar inversiones', category: 'acordes', input: 'piano', minLevel: 2, make: inversionBuild },
  { id: 'aural-interval', nameEs: 'Oído: intervalos', category: 'oído', input: 'opciones', minLevel: 1, make: auralInterval },
  { id: 'aural-chord', nameEs: 'Oído: calidad de acordes', category: 'oído', input: 'opciones', minLevel: 2, make: auralChord },
  { id: 'aural-cadence', nameEs: 'Oído: cadencias', category: 'oído', input: 'opciones', minLevel: 2, make: auralCadence },
  { id: 'degree-function', nameEs: 'Grados y funciones armónicas', category: 'armonía', input: 'opciones', minLevel: 2, make: degreeFunction },
  { id: 'complete-progression', nameEs: 'Completar progresiones', category: 'armonía', input: 'opciones', minLevel: 2, make: completeProgression },
  { id: 'voice-leading', nameEs: 'Elegir la mejor conducción de voces', category: 'armonía', input: 'opciones', minLevel: 3, make: voiceLeading },
  { id: 'transpose-notes', nameEs: 'Transponer notas y acordes', category: 'armonía', input: 'mixto', minLevel: 2, make: transposeNotesEx },
  { id: 'transpose-progression', nameEs: 'Transponer progresiones', category: 'armonía', input: 'opciones', minLevel: 2, make: transposeProgression },
  { id: 'progression-analysis', nameEs: 'Analizar progresiones', category: 'armonía', input: 'opciones', minLevel: 2, make: progressionAnalysis },
  { id: 'secondary-dominant', nameEs: 'Dominantes secundarias', category: 'armonía', input: 'opciones', minLevel: 3, make: secondaryDominant },
  { id: 'voicing-id', nameEs: 'Reconocer voicings', category: 'avanzado', input: 'opciones', minLevel: 4, make: voicingId },
  { id: 'extension-build', nameEs: 'Construir extensiones y alteraciones', category: 'avanzado', input: 'mixto', minLevel: 4, make: (c) => chordBuild('extension-build', c) },
]

export const GENERATOR_IDS = GENERATORS.map((g) => g.id)

export function generatorInfo(id: GeneratorId): GeneratorInfo {
  const g = GENERATORS.find((x) => x.id === id)
  if (!g) throw new Error(`Generador desconocido: ${id}`)
  return g
}

export function generateExercise(gen: GeneratorId, difficulty: D = 1, rng: Rng = Math.random, params: Record<string, unknown> = {}): Exercise {
  return generatorInfo(gen).make({ d: difficulty, r: rng, params })
}

export function generateSet(gen: GeneratorId, count: number, difficulty: D, rng: Rng = Math.random, params: Record<string, unknown> = {}): Exercise[] {
  const out: Exercise[] = []
  const seen = new Set<string>()
  let guard = 0
  while (out.length < count && guard++ < count * 12) {
    const ex = generateExercise(gen, difficulty, rng, params)
    const sig = `${ex.prompt}|${ex.response.type === 'choice' ? '' : ex.response.expected.join()}`
    if (seen.has(sig) && guard < count * 8) continue
    seen.add(sig)
    out.push(ex)
  }
  return out
}
