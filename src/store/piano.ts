import { useSyncExternalStore } from 'react'
import { noteOff, noteOn, ensureAudio } from '../audio/engine'
import { chromaOf, midiToName, toMidi } from '../music/notes'

export type KeyMark = 'target' | 'ok' | 'wrong' | 'played'
export type Source = 'mouse' | 'keyboard' | 'midi' | 'touch'

export interface PianoState {
  /** Teclas pulsadas ahora mismo. */
  down: number[]
  /** Marcas visuales por nota MIDI. */
  marks: Record<number, KeyMark>
  /** Notas pulsadas desde el último reinicio (para responder ejercicios). */
  log: number[]
  recording: boolean
}

let state: PianoState = { down: [], marks: {}, log: [], recording: false }
const subs = new Set<() => void>()
const noteSubs = new Set<(e: { type: 'on' | 'off'; midi: number }) => void>()
/** Una tecla puede mantenerla pulsada más de una fuente (ratón + MIDI). */
const holders = new Map<number, Set<string>>()

function set(patch: Partial<PianoState>) {
  state = { ...state, ...patch }
  subs.forEach((s) => s())
}

export const getPiano = () => state
export function subscribePiano(fn: () => void) { subs.add(fn); return () => { subs.delete(fn) } }
export function usePiano(): PianoState { return useSyncExternalStore(subscribePiano, getPiano, getPiano) }
export function onPianoNote(fn: (e: { type: 'on' | 'off'; midi: number }) => void) { noteSubs.add(fn); return () => { noteSubs.delete(fn) } }

export function pressKey(midi: number, source: string = 'mouse', velocity = 0.8): void {
  const set_ = holders.get(midi) ?? new Set<string>()
  if (set_.has(source)) return
  set_.add(source)
  holders.set(midi, set_)
  void ensureAudio().then(() => {
    // si la tecla se soltó mientras arrancaba el audio, no suena
    if (holders.get(midi)?.has(source)) noteOn(midiToName(midi), velocity)
  })
  const down = state.down.includes(midi) ? state.down : [...state.down, midi]
  const log = state.recording ? [...state.log, midi] : state.log
  set({ down, log })
  noteSubs.forEach((l) => l({ type: 'on', midi }))
}

export function releaseKey(midi: number, source: string = 'mouse'): void {
  const h = holders.get(midi)
  if (!h || !h.has(source)) return
  h.delete(source)
  noteOff(midiToName(midi))
  if (h.size === 0) {
    holders.delete(midi)
    set({ down: state.down.filter((m) => m !== midi) })
  }
  noteSubs.forEach((l) => l({ type: 'off', midi }))
}

export function releaseAllKeys(): void {
  [...holders.entries()].forEach(([midi, h]) => [...h].forEach((src) => releaseKey(midi, src)))
  holders.clear()
  set({ down: [] })
}

export function setMarks(marks: Record<number, KeyMark>) { set({ marks }) }
export function clearMarks() { if (Object.keys(state.marks).length) set({ marks: {} }) }

/** Marca como objetivo las notas dadas (nombres con octava, o sin octava para todas las octavas visibles). */
export function setTargets(names: string[], range?: [number, number]) {
  const marks: Record<number, KeyMark> = {}
  for (const n of names) {
    const hasOct = /\d$/.test(n)
    if (hasOct) marks[toMidi(n)] = 'target'
    else if (range) {
      for (let m = range[0]; m <= range[1]; m++) if (m % 12 === chromaOf(n)) marks[m] = 'target'
    }
  }
  set({ marks })
}

export function startRecording() { set({ recording: true, log: [] }) }
export function stopRecording() { set({ recording: false }) }
export function resetLog() { set({ log: [] }) }

window.addEventListener('blur', () => releaseAllKeys())
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAllKeys() })
