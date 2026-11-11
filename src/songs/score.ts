/** Representación común de una partitura/canción reproducible, con tiempos en segundos. */
export interface ScoreNote { midi: number; t: number; d: number; vel: number; track: number }
export interface ScoreTrack { id: number; name: string; notes: number }
export interface ScoreChord { t: number; d: number; symbol: string; section?: string }

export interface Score {
  title?: string
  /** Tempo inicial en pulsos (negras) por minuto. */
  tempo: number
  timeSig: [number, number]
  /** Duración total en segundos. */
  duration: number
  notes: ScoreNote[]
  tracks: ScoreTrack[]
  /** Inicio de cada compás, en segundos. */
  bars: number[]
  /** Cifrado, si la canción es un esquema de acordes. */
  chords?: ScoreChord[]
  warnings?: string[]
}

export class ImportError extends Error {}

export const MAX_NOTES = 40000

/** Cierra una partitura: ordena notas, calcula duración y pistas. */
export function finalizeScore(p: { title?: string; tempo: number; timeSig: [number, number]; notes: ScoreNote[]; trackNames: string[]; bars: number[]; chords?: ScoreChord[]; warnings?: string[] }): Score {
  if (p.notes.length === 0) throw new ImportError('El archivo no contiene ninguna nota que se pueda reproducir.')
  if (p.notes.length > MAX_NOTES) throw new ImportError(`La partitura tiene ${p.notes.length} notas; el máximo admitido es ${MAX_NOTES}.`)
  const notes = [...p.notes].sort((a, b) => a.t - b.t || a.midi - b.midi)
  const used = [...new Set(notes.map((n) => n.track))].sort((a, b) => a - b)
  const remap = new Map(used.map((id, i) => [id, i]))
  const tracks = used.map((id, i) => ({ id: i, name: p.trackNames[id] || `Pista ${i + 1}`, notes: notes.filter((n) => n.track === id).length }))
  const mapped = notes.map((n) => ({ ...n, track: remap.get(n.track)! }))
  const duration = mapped.reduce((m, n) => Math.max(m, n.t + n.d), 0)
  const bars = p.bars.length ? p.bars : [0]
  return { title: p.title, tempo: p.tempo, timeSig: p.timeSig, duration, notes: mapped, tracks, bars, chords: p.chords, warnings: p.warnings }
}

/** Notas activas en el instante `t` (segundos). */
export function activeAt(score: Score, t: number, muted: Set<number>): number[] {
  const out: number[] = []
  for (const n of score.notes) {
    if (n.t > t) break
    if (!muted.has(n.track) && t < n.t + n.d) out.push(n.midi)
  }
  return out
}

/** Compás (índice desde 0) al que pertenece el instante `t`. */
export function barAt(score: Score, t: number): number {
  let lo = 0
  for (let i = 0; i < score.bars.length; i++) { if (score.bars[i] <= t + 1e-6) lo = i; else break }
  return lo
}
