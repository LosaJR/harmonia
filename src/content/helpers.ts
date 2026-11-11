import { Note } from '@tonaljs/tonal'
import { buildChord, chordNotesOct, resolveRoman, type Key } from '../music/chords'
import { buildProgression, type ProgressionItem } from '../music/progressions'
import { scaleNotes, scaleWithOctaves } from '../music/scales'
import { smoothVoicing } from '../music/voicing'
import { chromaOf, toMidi } from '../music/notes'
import type { Step } from '../exercises/types'
import type { ExampleBlock, TryBlock, StaticQuestion } from './types'

const clefFor = (notes: string[]): 'treble' | 'bass' => (notes.reduce((s, n) => s + toMidi(n), 0) / notes.length < 59 ? 'bass' : 'treble')

/** Un acorde: se oye en bloque y, como alternativa, en arpegio. */
export function chordExample(title: string, caption: string, root: string, quality: string, opts: { oct?: number; inv?: number } = {}): ExampleBlock {
  const notes = chordNotesOct(root, quality, opts.oct ?? 4, opts.inv ?? 0)
  const c = buildChord(root, quality)
  return {
    type: 'example', title, caption, highlight: notes, label: c.symbol, tempo: 80,
    steps: [{ notes, beats: 3 }],
    alt: { label: 'Arpegio', steps: [...notes.map((n) => ({ notes: [n], beats: 0.6 })), { notes, beats: 2 }] },
    staff: { notes, clef: 'treble', chord: true },
  }
}

export function scaleExample(title: string, caption: string, tonic: string, id: string, oct = 4): ExampleBlock {
  const notes = scaleWithOctaves(tonic, id, oct, true)
  return {
    type: 'example', title, caption, highlight: notes, label: tonic, tempo: 120,
    steps: notes.map((n) => ({ notes: [n], beats: 0.5 })),
    staff: { notes, clef: clefFor(notes), chord: false },
  }
}

export function noteExample(title: string, caption: string, notes: string[], mode: 'melody' | 'chord' = 'melody', beats = 1): ExampleBlock {
  return {
    type: 'example', title, caption, highlight: notes, tempo: 90,
    steps: mode === 'chord' ? [{ notes, beats: 3 }] : notes.map((n) => ({ notes: [n], beats })),
    staff: { notes, clef: clefFor(notes), chord: mode === 'chord' },
  }
}

export function intervalExample(title: string, caption: string, low: string, interval: string): ExampleBlock {
  const top = Note.transpose(low, interval)
  return {
    type: 'example', title, caption, highlight: [low, top], label: interval, tempo: 80,
    steps: [{ notes: [low], beats: 1 }, { notes: [top], beats: 1 }],
    alt: { label: 'Simultáneo', steps: [{ notes: [low, top], beats: 3 }] },
    staff: { notes: [low, top], clef: clefFor([low, top]), chord: false },
  }
}

/** Una progresión con voice leading suave; resalta el primer acorde. */
export function progExample(title: string, caption: string, romans: string[], key: Key, beats = 2): ExampleBlock {
  const items: ProgressionItem[] = romans.map((roman) => ({ roman, beats }))
  const chords = buildProgression(items, key)
  let prev: string[] | null = null
  const steps: Step[] = chords.map((c) => {
    const notes = smoothVoicing(prev, c.notes, [52, 74])
    prev = notes
    return { notes: [Note.transpose(`${c.root}2`, '1P'), ...notes], beats }
  })
  return {
    type: 'example', title, caption, tempo: 76,
    highlight: steps[0].notes.slice(1), label: chords.map((c) => c.symbol).join(' – '),
    steps,
    staff: { notes: steps[0].notes.slice(1), clef: 'treble', chord: true },
  }
}

/** Ejemplo con pasos propios (ritmos, melodías con armonía…). */
export function customExample(title: string, caption: string, steps: Step[], tempo = 90, staffNotes?: string[], label?: string): ExampleBlock {
  const all = steps.flatMap((s) => s.notes)
  return {
    type: 'example', title, caption, tempo, steps, label,
    highlight: steps[0]?.notes ?? [],
    staff: staffNotes ? { notes: staffNotes, clef: clefFor(staffNotes), chord: false } : all.length ? { notes: [...new Set(all)].slice(0, 8), clef: clefFor(all), chord: false } : undefined,
  }
}

export function tryChord(instruction: string, root: string, quality: string, inv = 0): TryBlock {
  const c = buildChord(root, quality)
  const notes = c.notes
  return {
    type: 'try', instruction, target: { notes, mode: inv ? 'bass-set' : 'set', bass: inv ? notes[inv] : undefined },
    success: '¡Perfecto! Ese acorde suena y se ve exactamente como debe.',
  }
}

export function tryScale(instruction: string, tonic: string, id: string): TryBlock {
  return { type: 'try', instruction, target: { notes: scaleNotes(tonic, id), mode: 'ordered' }, success: '¡Escala completa y en orden!' }
}

export function tryNotes(instruction: string, notes: string[], mode: 'set' | 'ordered' = 'set'): TryBlock {
  return { type: 'try', instruction, target: { notes, mode }, success: '¡Correcto!' }
}

/** Atajo para preguntas de opción múltiple escritas a mano. */
export const Q = (q: string, options: string[], answer: number, why: string, topic?: string): StaticQuestion => ({ q, options, answer, why, topic })

export { resolveRoman, chromaOf }

/** Secuencia de acordes concretos [fundamental, calidad] con conducción suave y bajo en la fundamental. */
export function chordSeqExample(title: string, caption: string, chords: [string, string][], beats = 2, tempo = 76): ExampleBlock {
  let prev: string[] | null = null
  const built = chords.map(([root, quality]) => buildChord(root, quality))
  const steps: Step[] = built.map((c) => {
    const notes = smoothVoicing(prev, c.notes, [52, 74])
    prev = notes
    return { notes: [Note.transpose(`${c.root}2`, '1P'), ...notes], beats }
  })
  return {
    type: 'example', title, caption, tempo, steps, label: built.map((c) => c.symbol).join(' – '),
    highlight: steps[0].notes.slice(1), staff: { notes: steps[0].notes.slice(1), clef: 'treble', chord: true },
  }
}
