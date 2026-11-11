import { Interval, Note } from '@tonaljs/tonal'
import { buildChord, functionLabel, resolveRoman, type Key } from './chords'

export interface ProgressionItem {
  /** Número romano relativo a la tonalidad ("ii7", "V7", "bVII", "V7/ii"…). */
  roman: string
  /** Duración en pulsos. */
  beats: number
  /** Inversión (0 = fundamental). */
  inversion?: number
}

export interface ProgressionPreset {
  id: string
  name: string
  mode: 'major' | 'minor'
  romans: string[]
  description: string
}

export const PRESETS: ProgressionPreset[] = [
  { id: 'I-IV-V-I', name: 'I–IV–V–I', mode: 'major', romans: ['I', 'IV', 'V', 'I'], description: 'La cadencia básica del sistema tonal: tónica, subdominante, dominante, tónica.' },
  { id: 'I-V-vi-IV', name: 'I–V–vi–IV', mode: 'major', romans: ['I', 'V', 'vi', 'IV'], description: 'La progresión más usada del pop de las últimas décadas.' },
  { id: 'ii-V-I', name: 'ii–V–I (triadas)', mode: 'major', romans: ['ii', 'V', 'I'], description: 'Predominante, dominante y tónica: el motor de casi todo el jazz.' },
  { id: 'ii7-V7-Imaj7', name: 'ii7–V7–Imaj7', mode: 'major', romans: ['ii7', 'V7', 'Imaj7'], description: 'El ii–V–I con séptimas, tal como se toca en jazz.' },
  { id: 'I-vi-IV-V', name: 'I–vi–IV–V', mode: 'major', romans: ['I', 'vi', 'IV', 'V'], description: 'La progresión de los años 50 («doo-wop»).' },
  { id: 'vi-IV-I-V', name: 'vi–IV–I–V', mode: 'major', romans: ['vi', 'IV', 'I', 'V'], description: 'Las mismas cuatro notas de I–V–vi–IV, empezando por la relativa menor.' },
  { id: 'I-vi-ii-V', name: 'I–vi–ii–V', mode: 'major', romans: ['I', 'vi', 'ii', 'V'], description: 'Turnaround por círculo de quintas (vi–ii–V–I).' },
  { id: 'circle', name: 'Círculo de quintas diatónico', mode: 'major', romans: ['I', 'IV', 'vii°', 'iii', 'vi', 'ii', 'V', 'I'], description: 'Cada raíz desciende una quinta (o sube una cuarta) dentro de la escala.' },
  { id: 'pachelbel', name: 'Canon (I–V–vi–iii–IV–I–IV–V)', mode: 'major', romans: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], description: 'Basada en el esquema barroco del Canon de Pachelbel (obra de dominio público).' },
  { id: 'plagal', name: 'Cadencia plagal I–IV–I', mode: 'major', romans: ['I', 'IV', 'I'], description: 'El «amén»: subdominante a tónica.' },
  { id: 'deceptive', name: 'Cadencia rota V–vi', mode: 'major', romans: ['I', 'IV', 'V', 'vi'], description: 'La dominante promete la tónica pero resuelve en vi.' },
  { id: 'i-iv-V-i', name: 'i–iv–V–i (menor armónica)', mode: 'minor', romans: ['i', 'iv', 'V', 'i'], description: 'Cadencia auténtica en modo menor con sensible.' },
  { id: 'andalusian', name: 'Cadencia andaluza i–VII–VI–V', mode: 'minor', romans: ['i', 'VII', 'VI', 'V'], description: 'Descenso por tetracordo frigio, muy presente en la música española.' },
  { id: 'minor-turn', name: 'i–VI–III–VII', mode: 'minor', romans: ['i', 'VI', 'III', 'VII'], description: 'Progresión modal habitual en pop y música de cine.' },
  { id: 'minor-ii-V-i', name: 'iiø7–V7–i', mode: 'minor', romans: ['iiø7', 'V7', 'i'], description: 'El ii–V–i menor: semidisminuido, dominante y tónica menor.' },
  { id: 'secondary', name: 'Dominantes secundarias', mode: 'major', romans: ['I', 'V7/ii', 'ii', 'V7', 'I'], description: 'Un VI7 (V7/ii) que tonicaliza momentáneamente el ii.' },
  { id: 'borrowed', name: 'Intercambio modal', mode: 'major', romans: ['I', 'bVII', 'IV', 'iv', 'I'], description: 'Acordes prestados del modo menor paralelo (♭VII, iv).' },
  { id: 'tritone', name: 'Sustitución tritonal', mode: 'major', romans: ['ii7', 'bII7', 'Imaj7'], description: 'El bII7 sustituye a V7 porque comparten el tritono 3ª–7ª.' },
]

export interface ProgChord {
  roman: string
  symbol: string
  root: string
  quality: string
  notes: string[]
  beats: number
  inversion: number
  fn: string
  fnCode: string
}

export function buildProgression(items: ProgressionItem[], key: Key): ProgChord[] {
  return items.map((it) => {
    const r = resolveRoman(it.roman, key)
    const f = functionLabel(it.roman, key)
    return {
      roman: it.roman, symbol: r.symbol, root: r.root, quality: r.quality, notes: r.notes,
      beats: it.beats, inversion: it.inversion ?? 0, fn: f.label, fnCode: f.code,
    }
  })
}

export function presetItems(p: ProgressionPreset, beats = 4): ProgressionItem[] {
  return p.romans.map((roman) => ({ roman, beats }))
}

/** Transposición de acordes concretos por un intervalo (conserva la escritura). */
export function transposeChordRoots(chords: { root: string; quality: string }[], interval: string) {
  return chords.map((c) => {
    const root = Note.transpose(c.root, interval)
    return { root, quality: c.quality, symbol: buildChord(root, c.quality).symbol }
  })
}

export function transposeNotes(notes: string[], interval: string): string[] {
  return notes.map((n) => Note.transpose(n, interval))
}

/** Intervalo ascendente (simple) entre dos tónicas, para transponer la progresión de una tonalidad a otra. */
export function keyInterval(from: string, to: string): string {
  return Interval.distance(from, to)
}
