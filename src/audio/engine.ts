/**
 * Motor de audio. Módulo singleton: existe una única cadena de audio y un sintetizador
 * por timbre, aunque React monte los componentes varias veces (StrictMode).
 * El contexto de audio solo se inicia tras un gesto del usuario (ensureAudio).
 */
import * as Tone from 'tone'
import type { Step } from '../exercises/types'

export type Timbre = 'piano' | 'electric' | 'organ' | 'pad'

export const TIMBRES: { id: Timbre; nameEs: string }[] = [
  { id: 'piano', nameEs: 'Piano' },
  { id: 'electric', nameEs: 'Piano eléctrico' },
  { id: 'organ', nameEs: 'Órgano' },
  { id: 'pad', nameEs: 'Sintetizador (pad)' },
]

type Poly = Tone.PolySynth<Tone.Synth | Tone.FMSynth>

let started = false
let master: Tone.Volume | null = null
let current: Timbre = 'piano'
let volume = 0.8
const instruments = new Map<Timbre, Poly>()
/** Cuenta de pulsaciones simultáneas por nota (ratón + teclado + MIDI). */
const held = new Map<string, number>()
const listeners = new Set<() => void>()

export function onAudioStateChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
const emit = () => listeners.forEach((l) => l())

function dbFromVolume(v: number): number {
  return v <= 0.001 ? -80 : Math.max(-60, 20 * Math.log10(v)) - 6
}

function chain(): Tone.Volume {
  if (master) return master
  const limiter = new Tone.Limiter(-2).toDestination()
  const reverb = new Tone.Freeverb({ roomSize: 0.55, dampening: 3200, wet: 0.14 }).connect(limiter)
  master = new Tone.Volume(dbFromVolume(volume)).connect(reverb)
  return master
}

function makeInstrument(t: Timbre): Poly {
  const out = chain()
  let inst: Poly
  switch (t) {
    case 'piano': {
      const filter = new Tone.Filter(5200, 'lowpass').connect(out)
      inst = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'custom', partials: [1, 0.55, 0.32, 0.2, 0.12, 0.07, 0.04] },
        envelope: { attack: 0.004, decay: 1.6, sustain: 0.06, release: 0.9 },
      }).connect(filter)
      inst.volume.value = -9
      break
    }
    case 'electric': {
      const filter = new Tone.Filter(3800, 'lowpass').connect(out)
      inst = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2, modulationIndex: 1.6,
        envelope: { attack: 0.005, decay: 1.4, sustain: 0.18, release: 0.8 },
        modulationEnvelope: { attack: 0.002, decay: 0.5, sustain: 0.05, release: 0.5 },
      }).connect(filter)
      inst.volume.value = -11
      break
    }
    case 'organ': {
      inst = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'custom', partials: [1, 0.8, 0.55, 0.45, 0.25, 0.15] },
        envelope: { attack: 0.012, decay: 0.1, sustain: 0.9, release: 0.12 },
      }).connect(out)
      inst.volume.value = -14
      break
    }
    default: {
      const filter = new Tone.Filter(2200, 'lowpass').connect(out)
      inst = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 18 },
        envelope: { attack: 0.35, decay: 0.4, sustain: 0.75, release: 1.3 },
      }).connect(filter)
      inst.volume.value = -17
    }
  }
  inst.maxPolyphony = 32
  return inst
}

function instrument(t: Timbre = current): Poly {
  let inst = instruments.get(t)
  if (!inst) {
    inst = makeInstrument(t)
    instruments.set(t, inst)
  }
  return inst
}

/** Debe llamarse dentro de un gesto del usuario (clic, tecla, toque). */
export async function ensureAudio(): Promise<boolean> {
  try {
    if (!started || Tone.getContext().state !== 'running') {
      await Tone.start()
      started = true
      instrument()
      emit()
    }
    return true
  } catch {
    return false
  }
}

export const isAudioStarted = () => started && Tone.getContext().state === 'running'

export function setVolume(v: number) {
  volume = Math.min(1, Math.max(0, v))
  if (master) master.volume.value = dbFromVolume(volume)
}

export function setTimbre(t: Timbre) {
  if (t === current) return
  releaseEverything()
  current = t
  if (started) instrument(t)
}

export const getTimbre = () => current

// ---------- notas sostenidas (piano en vivo) ----------

export function noteOn(note: string, velocity = 0.8): void {
  if (!started) return
  const n = (held.get(note) ?? 0) + 1
  held.set(note, n)
  if (n === 1) instrument().triggerAttack(note, Tone.now(), velocity)
}

export function noteOff(note: string): void {
  const n = held.get(note)
  if (!n) return
  if (n > 1) { held.set(note, n - 1); return }
  held.delete(note)
  if (started) instrument().triggerRelease(note, Tone.now())
}

export function heldNotes(): string[] {
  return [...held.keys()]
}

function releaseEverything() {
  held.clear()
  instruments.forEach((i) => i.releaseAll(Tone.now()))
}

// ---------- reproducción programada ----------

let activeId = 0
let onEndCb: (() => void) | undefined

export interface PlayOptions {
  tempo?: number
  loop?: boolean
  /** Se llama (en el hilo de UI, sincronizado) al empezar cada paso. */
  onStep?: (index: number) => void
  onEnd?: () => void
  velocity?: number
  /** Fracción de la duración que suena antes de soltar (legato = 1). */
  gate?: number
}

export function stopPlayback(): void {
  activeId++
  try {
    const tr = Tone.getTransport()
    tr.stop()
    tr.cancel(0)
    tr.loop = false
    Tone.getDraw().cancel(0)
  } catch { /* contexto aún no creado */ }
  instruments.forEach((i) => i.releaseAll(Tone.now()))
  const cb = onEndCb
  onEndCb = undefined
  cb?.()
}

/** Reproduce una secuencia de pasos (cada paso = notas simultáneas con duración en pulsos). */
export async function playSteps(steps: Step[], opts: PlayOptions = {}): Promise<void> {
  if (!(await ensureAudio()) || steps.length === 0) return
  stopPlayback()
  const id = activeId
  const tempo = opts.tempo ?? 90
  const spb = 60 / tempo
  const inst = instrument()
  const gate = opts.gate ?? 0.92
  const tr = Tone.getTransport()
  tr.position = 0
  let t = 0
  steps.forEach((s, i) => {
    const dur = s.beats * spb
    tr.schedule((time) => {
      if (id !== activeId) return
      if (s.notes.length) inst.triggerAttackRelease(s.notes, Math.max(0.08, dur * gate), time, opts.velocity ?? 0.75)
      Tone.getDraw().schedule(() => { if (id === activeId) opts.onStep?.(i) }, time)
    }, t)
    t += dur
  })
  if (opts.loop) {
    tr.loop = true
    tr.loopStart = 0
    tr.loopEnd = t
  } else {
    tr.loop = false
    onEndCb = opts.onEnd
    tr.schedule((time) => {
      Tone.getDraw().schedule(() => {
        if (id !== activeId) return
        const cb = onEndCb
        onEndCb = undefined
        cb?.()
      }, time)
    }, t + 0.05)
  }
  tr.start('+0.05')
}

export async function playNote(note: string, beats = 1, tempo = 100): Promise<void> {
  return playSteps([{ notes: [note], beats }], { tempo })
}

export async function playChord(notes: string[], beats = 2, tempo = 80): Promise<void> {
  return playSteps([{ notes, beats }], { tempo })
}

export function totalSeconds(steps: Step[], tempo: number): number {
  return steps.reduce((s, x) => s + x.beats, 0) * (60 / tempo)
}

// ---------- seguridad ante notas colgadas ----------

if (typeof window !== 'undefined') {
  const safeRelease = () => { stopPlayback(); releaseEverything(); emit() }
  window.addEventListener('blur', safeRelease)
  document.addEventListener('visibilitychange', () => { if (document.hidden) safeRelease() })
}

export function panic(): void {
  stopPlayback()
  releaseEverything()
  emit()
}

// Utilidad de depuración (solo en desarrollo): permite comprobar el estado del audio desde la consola.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__audio = {
    state: () => (started ? Tone.getContext().state : 'sin iniciar'),
    held: () => [...held.keys()],
    voices: () => [...instruments.entries()].map(([k, v]) => [k, v.activeVoices]),
    transport: () => Tone.getTransport().state,
  }
}
