import { Note } from '@tonaljs/tonal'
import { buildChord, parseChordSymbol } from '../music/chords'
import { chromaOf } from '../music/notes'
import { smoothVoicing } from '../music/voicing'
import { finalizeScore, ImportError, type Score, type ScoreChord, type ScoreNote } from './score'

export interface ChordChart {
  key: string
  tempo: number
  beatsPerBar: number
  /** Cada compás es una cadena de uno o varios cifrados separados por espacio («C», «Am G»). */
  sections: { name: string; bars: string[] }[]
}

export type AccompanimentPattern = 'block' | 'arpeggio'

export const PATTERNS: { id: AccompanimentPattern; label: string; hint: string }[] = [
  { id: 'block', label: 'Acordes', hint: 'Bajo y acorde a la vez, con un segundo golpe a mitad de compás.' },
  { id: 'arpeggio', label: 'Arpegio', hint: 'Bajo en el primer pulso y arpegio de corcheas, típico de baladas.' },
]

/** Convierte un esquema de acordes en una partitura de acompañamiento para piano (mano derecha + bajo). */
export function chartToScore(chart: ChordChart, pattern: AccompanimentPattern = 'block', title?: string): Score {
  const spb = 60 / chart.tempo
  const bpb = chart.beatsPerBar
  const notes: ScoreNote[] = []
  const chords: ScoreChord[] = []
  const bars: number[] = []
  let beat = 0
  let prev: string[] | null = null
  for (const sec of chart.sections) {
    for (const bar of sec.bars) {
      const symbols = bar.trim().split(/\s+/).filter(Boolean)
      if (!symbols.length) throw new ImportError(`Compás vacío en «${sec.name}».`)
      bars.push(beat * spb)
      const each = bpb / symbols.length
      for (const s of symbols) {
        const p = parseChordSymbol(s)
        if (!p) throw new ImportError(`No entiendo el acorde «${s}» en «${sec.name}».`)
        const ch = buildChord(p.root, p.quality, p.bass)
        const upper = smoothVoicing(prev, ch.notes, [57, 74])
        prev = upper
        const bassPc = p.bass ?? p.root
        const bass = `${bassPc}${chromaOf(bassPc) >= 5 ? 2 : 3}`
        const t0 = beat * spb
        const dur = each * spb
        const push = (midi: number, t: number, d: number, vel: number, track: number) => notes.push({ midi, t, d, vel, track })
        const bassMidi = Note.midi(bass)!
        chords.push({ t: t0, d: dur, symbol: s, section: sec.name })
        if (pattern === 'block') {
          push(bassMidi, t0, dur * 0.95, 0.8, 1)
          upper.forEach((n) => push(Note.midi(n)!, t0, Math.min(dur, each >= 4 ? 2 * spb : dur) * 0.95, 0.7, 0))
          if (each >= 4) upper.forEach((n) => push(Note.midi(n)!, t0 + 2 * spb, (each - 2) * spb * 0.95, 0.62, 0))
        } else {
          push(bassMidi, t0, dur * 0.95, 0.75, 1)
          const order = [0, 1, 2, upper.length > 3 ? 3 : 1, 2, 1].map((i) => upper[Math.min(i, upper.length - 1)])
          const steps = Math.max(1, Math.round(each * 2))
          for (let i = 0; i < steps; i++) push(Note.midi(order[i % order.length])!, t0 + (i * spb) / 2, spb * 0.55, 0.62, 0)
        }
        beat += each
      }
    }
  }
  return finalizeScore({ title, tempo: chart.tempo, timeSig: [bpb, 4], notes, trackNames: ['Acordes (mano derecha)', 'Bajo (mano izquierda)'], bars, chords })
}
