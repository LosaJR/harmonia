import { Note } from '@tonaljs/tonal'
import { chordSymbol, invertNotes, qualityDef } from './chords'
import { toMidi } from './notes'

export const TENSION_LABEL: Record<string, string> = { '9M': '9', '9m': '♭9', '9A': '♯9', '11P': '11', '11A': '♯11', '13M': '13', '13m': '♭13' }
export const TENSION_ASCII: Record<string, string> = { '9M': '9', '9m': 'b9', '9A': '#9', '11P': '11', '11A': '#11', '13M': '13', '13m': 'b13' }
const GROUPS = [['9M', '9m', '9A'], ['11P', '11A'], ['13M', '13m']]

/** Tensiones que tienen sentido (no chocan con una nota real) sobre cada tipo de acorde. */
export function allowedTensions(quality: string): string[] {
  const def = qualityDef(quality)
  const has = (i: string) => def.intervals.includes(i)
  let allowed: string[]
  if (['7', '9', '13', '7b9', '7#9', '7#11', '7b13', '7alt'].includes(quality)) allowed = ['9M', '9m', '9A', '11A', '13M', '13m']
  else if (['maj7', 'maj9', 'maj13', 'maj7#5'].includes(quality)) allowed = ['9M', '11A', '13M']
  else if (['m7', 'm9', 'm11', 'mMaj7'].includes(quality)) allowed = ['9M', '11P', '13M']
  else if (quality === 'm7b5') allowed = ['9M', '11P', '13m']
  else if (['maj', 'min', 'sus2', 'sus4', 'aug', '6', 'm6'].includes(quality)) allowed = ['9M']
  else allowed = []
  // no ofrece lo que el acorde ya contiene
  return allowed.filter((t) => !has(t) && !GROUPS.some((g) => g.includes(t) && g.some((x) => has(x))))
}

export function toggleTension(current: string[], t: string): string[] {
  if (current.includes(t)) return current.filter((x) => x !== t)
  const group = GROUPS.find((g) => g.includes(t)) ?? [t]
  return [...current.filter((x) => !group.includes(x)), t]
}

export interface CustomChord {
  symbol: string
  intervals: string[]
  /** Nombres sin octava en estado fundamental. */
  pcs: string[]
  /** Notas con octava, con la inversión aplicada, en orden ascendente. */
  voiced: string[]
}

export function customChord(root: string, quality: string, tensions: string[], inversion: number, octave: number): CustomChord {
  const def = qualityDef(quality)
  const ts = tensions.filter((t) => allowedTensions(quality).includes(t))
  const intervals = [...def.intervals, ...ts]
  const stacked = intervals.map((i) => Note.transpose(`${root}${octave}`, i)).sort((a, b) => toMidi(a) - toMidi(b))
  const inv = Math.min(Math.max(0, inversion), stacked.length - 1)
  const labels = ts.map((t) => TENSION_ASCII[t])
  const base = chordSymbol(root, quality)
  return {
    symbol: labels.length ? `${base}(${labels.join(',')})` : base,
    intervals,
    pcs: intervals.map((i) => Note.pitchClass(Note.transpose(root, i))),
    voiced: invertNotes(stacked, inv),
  }
}
