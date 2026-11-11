import { Note } from '@tonaljs/tonal'
import { chordNotesOct } from './chords'
import { chromaOf } from './notes'
import type { ProgChord } from './progressions'
import { smoothVoicing } from './voicing'
import type { Step } from '../exercises/types'

export type VoicingMode = 'smooth' | 'inversion'

/** Pasos reproducibles de una progresión. `bass` añade la fundamental dos octavas por debajo. */
export function progressionSteps(chords: ProgChord[], mode: VoicingMode, bass: boolean): Step[] {
  let prev: string[] | null = null
  return chords.map((c) => {
    let notes: string[]
    if (mode === 'smooth') {
      notes = smoothVoicing(prev, c.notes, [52, 74])
    } else {
      notes = chordNotesOct(c.root, c.quality, chromaOf(c.root) >= 6 ? 3 : 4, c.inversion)
    }
    prev = notes
    const b = bass ? [Note.transpose(`${c.root}2`, '1P')] : []
    return { notes: [...b, ...notes], beats: c.beats }
  })
}
