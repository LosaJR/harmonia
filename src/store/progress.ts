import { useSyncExternalStore } from 'react'
import type { ProgressionItem } from '../music/progressions'
import { readItem, storageStatus, writeItem, removeItem } from './storage'
import type { NoteNaming } from '../music/notes'
import type { Timbre } from '../audio/engine'

export const STORAGE_KEY = 'harmonia.progress.v1'
export const SCHEMA_VERSION = 1

export interface LessonRecord { completed: boolean; bestScore: number; attempts: number; completedAt?: number; visitedAt?: number }
export interface GenRecord { attempts: number; correct: number; recent: (0 | 1)[] }
export interface TopicRecord { attempts: number; correct: number }
export interface HistoryEntry { t: number; kind: 'lesson' | 'exercise' | 'lab'; label: string; ok?: boolean }

export interface SavedProgression {
  id: string
  name: string
  key: { tonic: string; mode: 'major' | 'minor' }
  items: ProgressionItem[]
  tempo: number
  createdAt: number
  updatedAt: number
}

export interface Settings {
  naming: NoteNaming
  theme: 'dark' | 'light' | 'system'
  volume: number
  timbre: Timbre
  showNoteNames: boolean
  octaves: number
  startOctave: number
  reducedMotion: boolean
}

export interface ProgressState {
  version: number
  lessons: Record<string, LessonRecord>
  generators: Record<string, GenRecord>
  topics: Record<string, TopicRecord>
  history: HistoryEntry[]
  lastLesson?: string
  progressions: SavedProgression[]
  practiceDays: string[]
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  naming: 'latin', theme: 'dark', volume: 0.8, timbre: 'piano', showNoteNames: true, octaves: 2, startOctave: 3, reducedMotion: false,
}

export function emptyState(): ProgressState {
  return { version: SCHEMA_VERSION, lessons: {}, generators: {}, topics: {}, history: [], progressions: [], practiceDays: [], settings: { ...DEFAULT_SETTINGS } }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d)

/** Valida y normaliza datos externos (importación o almacenamiento corrupto). Lanza Error con mensaje claro. */
export function validateProgress(raw: unknown): ProgressState {
  if (!isObj(raw)) throw new Error('El archivo no contiene un objeto JSON válido.')
  if (raw.app !== undefined && raw.app !== 'harmonia') throw new Error('Este archivo no pertenece a Harmonia.')
  const data = isObj(raw.data) ? raw.data : raw
  if (typeof data.version !== 'number') throw new Error('Falta el número de versión del progreso.')
  if (data.version > SCHEMA_VERSION) throw new Error('El archivo procede de una versión más reciente de Harmonia.')
  const out = emptyState()
  if (!isObj(data.lessons)) throw new Error('Falta la sección de lecciones.')
  for (const [id, v] of Object.entries(data.lessons)) {
    if (!isObj(v)) throw new Error(`Registro de lección no válido: ${id}`)
    out.lessons[id] = {
      completed: v.completed === true, bestScore: Math.min(1, Math.max(0, num(v.bestScore))), attempts: Math.max(0, Math.floor(num(v.attempts))),
      completedAt: typeof v.completedAt === 'number' ? v.completedAt : undefined, visitedAt: typeof v.visitedAt === 'number' ? v.visitedAt : undefined,
    }
  }
  if (isObj(data.generators)) {
    for (const [id, v] of Object.entries(data.generators)) {
      if (!isObj(v)) continue
      const recent = Array.isArray(v.recent) ? v.recent.filter((x) => x === 0 || x === 1).slice(-20) as (0 | 1)[] : []
      out.generators[id] = { attempts: Math.max(0, Math.floor(num(v.attempts))), correct: Math.max(0, Math.floor(num(v.correct))), recent }
    }
  }
  if (isObj(data.topics)) {
    for (const [id, v] of Object.entries(data.topics)) {
      if (isObj(v)) out.topics[id] = { attempts: Math.max(0, Math.floor(num(v.attempts))), correct: Math.max(0, Math.floor(num(v.correct))) }
    }
  }
  if (Array.isArray(data.history)) {
    out.history = data.history.filter(isObj).slice(-60).map((h) => ({
      t: num(h.t), kind: h.kind === 'lesson' || h.kind === 'lab' ? h.kind : 'exercise', label: str(h.label), ok: typeof h.ok === 'boolean' ? h.ok : undefined,
    }))
  }
  if (typeof data.lastLesson === 'string') out.lastLesson = data.lastLesson
  if (Array.isArray(data.progressions)) {
    out.progressions = data.progressions.filter(isObj).filter((p) => typeof p.id === 'string' && Array.isArray(p.items) && isObj(p.key)).map((p) => ({
      id: str(p.id), name: str(p.name, 'Sin título'), tempo: Math.min(220, Math.max(30, num(p.tempo, 90))), createdAt: num(p.createdAt), updatedAt: num(p.updatedAt),
      key: { tonic: str((p.key as Record<string, unknown>).tonic, 'C'), mode: (p.key as Record<string, unknown>).mode === 'minor' ? 'minor' : 'major' },
      items: (p.items as unknown[]).filter(isObj).filter((i) => typeof i.roman === 'string').map((i) => ({ roman: str(i.roman), beats: Math.min(16, Math.max(1, num(i.beats, 4))), inversion: Math.max(0, Math.floor(num(i.inversion))) })),
    }))
  }
  if (Array.isArray(data.practiceDays)) out.practiceDays = data.practiceDays.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-400)
  if (isObj(data.settings)) {
    const s = data.settings
    out.settings = {
      naming: s.naming === 'intl' ? 'intl' : 'latin',
      theme: s.theme === 'light' || s.theme === 'system' ? s.theme : 'dark',
      volume: Math.min(1, Math.max(0, num(s.volume, 0.8))),
      timbre: s.timbre === 'electric' || s.timbre === 'organ' || s.timbre === 'pad' ? s.timbre : 'piano',
      showNoteNames: s.showNoteNames !== false,
      octaves: Math.min(5, Math.max(1, Math.floor(num(s.octaves, 2)))),
      startOctave: Math.min(5, Math.max(1, Math.floor(num(s.startOctave, 3)))),
      reducedMotion: s.reducedMotion === true,
    }
  }
  return out
}

// ---------- almacén reactivo ----------

let state: ProgressState = emptyState()
let loaded = false
let saveError: string | undefined
const subs = new Set<() => void>()

function load() {
  if (loaded) return
  loaded = true
  const raw = readItem(STORAGE_KEY)
  if (!raw) return
  try {
    state = validateProgress(JSON.parse(raw))
  } catch {
    state = emptyState()
    saveError = 'Los datos guardados estaban dañados y se ha empezado de cero.'
  }
}

function commit(next: ProgressState) {
  state = next
  const ok = writeItem(STORAGE_KEY, JSON.stringify(next))
  const st = storageStatus()
  saveError = ok ? undefined : st.error ?? 'No se ha podido guardar el progreso.'
  subs.forEach((s) => s())
}

export const getState = (): ProgressState => { load(); return state }
export const getSaveError = () => saveError

export function subscribe(fn: () => void): () => void {
  subs.add(fn)
  return () => { subs.delete(fn) }
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getState, getState)
}

const today = () => new Date().toISOString().slice(0, 10)

function withDay(s: ProgressState): ProgressState {
  const d = today()
  return s.practiceDays.includes(d) ? s : { ...s, practiceDays: [...s.practiceDays, d].slice(-400) }
}

function pushHistory(s: ProgressState, h: HistoryEntry): ProgressState {
  return { ...s, history: [...s.history, h].slice(-60) }
}

// ---------- acciones ----------

export function recordExercise(gen: string, topic: string, ok: boolean, label?: string) {
  const s = getState()
  const g = s.generators[gen] ?? { attempts: 0, correct: 0, recent: [] }
  const t = s.topics[topic] ?? { attempts: 0, correct: 0 }
  let next: ProgressState = {
    ...s,
    generators: { ...s.generators, [gen]: { attempts: g.attempts + 1, correct: g.correct + (ok ? 1 : 0), recent: [...g.recent, ok ? 1 as const : 0 as const].slice(-20) } },
    topics: { ...s.topics, [topic]: { attempts: t.attempts + 1, correct: t.correct + (ok ? 1 : 0) } },
  }
  next = pushHistory(withDay(next), { t: Date.now(), kind: 'exercise', label: label ?? topic, ok })
  commit(next)
}

export function visitLesson(id: string) {
  const s = getState()
  const rec = s.lessons[id] ?? { completed: false, bestScore: 0, attempts: 0 }
  commit({ ...s, lastLesson: id, lessons: { ...s.lessons, [id]: { ...rec, visitedAt: Date.now() } } })
}

export function finishLessonAttempt(id: string, title: string, score: number, passed: boolean) {
  const s = getState()
  const rec = s.lessons[id] ?? { completed: false, bestScore: 0, attempts: 0 }
  const wasDone = rec.completed
  let next: ProgressState = {
    ...s,
    lessons: { ...s.lessons, [id]: { ...rec, attempts: rec.attempts + 1, bestScore: Math.max(rec.bestScore, score), completed: rec.completed || passed, completedAt: rec.completedAt ?? (passed ? Date.now() : undefined) } },
  }
  next = withDay(next)
  if (passed && !wasDone) next = pushHistory(next, { t: Date.now(), kind: 'lesson', label: `Lección superada: ${title}`, ok: true })
  commit(next)
}

export function saveProgression(p: SavedProgression) {
  const s = getState()
  const exists = s.progressions.some((x) => x.id === p.id)
  const progressions = exists ? s.progressions.map((x) => (x.id === p.id ? { ...p, updatedAt: Date.now() } : x)) : [...s.progressions, p]
  commit(pushHistory({ ...s, progressions }, { t: Date.now(), kind: 'lab', label: `Progresión guardada: ${p.name}` }))
}

export function deleteProgression(id: string) {
  const s = getState()
  commit({ ...s, progressions: s.progressions.filter((x) => x.id !== id) })
}

export function updateSettings(patch: Partial<Settings>) {
  const s = getState()
  commit({ ...s, settings: { ...s.settings, ...patch } })
}

export function resetProgress() {
  removeItem(STORAGE_KEY)
  state = emptyState()
  saveError = undefined
  subs.forEach((s) => s())
}

export function exportProgress(): string {
  return JSON.stringify({ app: 'harmonia', exportedAt: new Date().toISOString(), data: getState() }, null, 2)
}

export function importProgress(text: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(text)
    const valid = validateProgress(parsed)
    commit(valid)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof SyntaxError ? 'El archivo no es un JSON válido.' : (e as Error).message }
  }
}

/** Solo para pruebas. */
export function __setStateForTests(s: ProgressState) { loaded = true; state = s }
export function __resetForTests() { loaded = false; state = emptyState(); saveError = undefined }

// ---------- derivados ----------

export function accuracy(r?: { attempts: number; correct: number }): number {
  return r && r.attempts > 0 ? r.correct / r.attempts : 0
}

export function weakTopics(s: ProgressState, minAttempts = 3, threshold = 0.7): { topic: string; acc: number; attempts: number }[] {
  return Object.entries(s.topics)
    .filter(([, r]) => r.attempts >= minAttempts && accuracy(r) < threshold)
    .map(([topic, r]) => ({ topic, acc: accuracy(r), attempts: r.attempts }))
    .sort((a, b) => a.acc - b.acc)
}

export function overallAccuracy(s: ProgressState): { attempts: number; correct: number; acc: number } {
  const all = Object.values(s.generators)
  const attempts = all.reduce((a, r) => a + r.attempts, 0)
  const correct = all.reduce((a, r) => a + r.correct, 0)
  return { attempts, correct, acc: attempts ? correct / attempts : 0 }
}

export function streakDays(s: ProgressState): number {
  const set = new Set(s.practiceDays)
  let n = 0
  const d = new Date()
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

/** Dificultad adaptativa según los últimos intentos del generador. */
export function adaptiveDifficulty(s: ProgressState, gen: string): 1 | 2 | 3 {
  const r = s.generators[gen]
  if (!r || r.recent.length < 5) return 1
  const rec = r.recent.slice(-10)
  const acc = rec.reduce<number>((a, b) => a + b, 0) / rec.length
  const attempts = r.attempts
  if (acc >= 0.85 && attempts >= 15) return 3
  if (acc >= 0.7 && attempts >= 6) return 2
  return 1
}
