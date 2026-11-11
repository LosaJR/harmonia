import { beforeEach, describe, expect, it } from 'vitest'
import { __resetStorageForTests, readItem, storageStatus, writeItem } from './storage'
import {
  __resetForTests, adaptiveDifficulty, emptyState, exportProgress, finishLessonAttempt, getSaveError, getState, importProgress,
  recordExercise, resetProgress, saveProgression, STORAGE_KEY, validateProgress, weakTopics, updateSettings,
} from './progress'
import { parseMidiMessage } from '../audio/midi'

class MemStorage implements Storage {
  private m = new Map<string, string>()
  get length() { return this.m.size }
  clear() { this.m.clear() }
  getItem(k: string) { return this.m.get(k) ?? null }
  key(i: number) { return [...this.m.keys()][i] ?? null }
  removeItem(k: string) { this.m.delete(k) }
  setItem(k: string, v: string) { this.m.set(k, v) }
}

class FullStorage extends MemStorage {
  setItem(): void { throw new DOMException('lleno', 'QuotaExceededError') }
}

beforeEach(() => {
  __resetStorageForTests(new MemStorage())
  __resetForTests()
})

describe('persistencia', () => {
  it('guarda y recupera el progreso', () => {
    recordExercise('scale-build', 'Construcción de escalas', true)
    finishLessonAttempt('n1-l1', 'Prueba', 0.9, true)
    const raw = readItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    __resetForTests()
    const s = getState()
    expect(s.lessons['n1-l1'].completed).toBe(true)
    expect(s.generators['scale-build'].correct).toBe(1)
  })
  it('un almacenamiento lleno no rompe la app y avisa', () => {
    __resetStorageForTests(new FullStorage())
    recordExercise('note-id', 'Notas', false)
    expect(getState().generators['note-id'].attempts).toBe(1)
    expect(getSaveError()).toMatch(/lleno/)
    expect(storageStatus().persistent).toBe(false)
    expect(writeItem('x', 'y')).toBe(false)
    expect(readItem('x')).toBe('y')
  })
  it('sin localStorage usa memoria', () => {
    __resetStorageForTests(null)
    expect(writeItem('a', '1')).toBe(false)
    expect(readItem('a')).toBe('1')
  })
  it('datos corruptos se descartan sin romper', () => {
    writeItem(STORAGE_KEY, '{no es json')
    __resetForTests()
    expect(getState().lessons).toEqual({})
    expect(getSaveError()).toMatch(/dañados/)
  })
})

describe('exportar / importar', () => {
  it('ida y vuelta', () => {
    recordExercise('interval-id', 'Intervalos', true)
    saveProgression({ id: 'p1', name: 'Mi ii–V–I', key: { tonic: 'C', mode: 'major' }, items: [{ roman: 'ii7', beats: 4 }], tempo: 100, createdAt: 1, updatedAt: 1 })
    updateSettings({ naming: 'intl' })
    const json = exportProgress()
    resetProgress()
    expect(getState().progressions).toHaveLength(0)
    const r = importProgress(json)
    expect(r.ok).toBe(true)
    expect(getState().progressions[0].name).toBe('Mi ii–V–I')
    expect(getState().settings.naming).toBe('intl')
    expect(getState().generators['interval-id'].attempts).toBe(1)
  })
  it('rechaza archivos mal formados', () => {
    expect(importProgress('hola').ok).toBe(false)
    expect(importProgress('[]').ok).toBe(false)
    expect(importProgress('{"version": 1}').ok).toBe(false)
    expect(importProgress('{"app":"otra","data":{}}').ok).toBe(false)
    expect(importProgress(JSON.stringify({ version: 99, lessons: {} })).ok).toBe(false)
    expect(importProgress(JSON.stringify({ version: 1, lessons: { a: 5 } })).ok).toBe(false)
  })
  it('sanea valores fuera de rango', () => {
    const s = validateProgress({ version: 1, lessons: { a: { completed: true, bestScore: 7, attempts: -3 } }, settings: { volume: 9, octaves: 99, theme: 'x' } })
    expect(s.lessons.a.bestScore).toBe(1)
    expect(s.lessons.a.attempts).toBe(0)
    expect(s.settings.volume).toBe(1)
    expect(s.settings.octaves).toBe(5)
    expect(s.settings.theme).toBe('dark')
  })
  it('un fallo de importación no altera el estado actual', () => {
    recordExercise('note-id', 'Notas', true)
    importProgress('{"version":1,"lessons":"mal"}')
    expect(getState().generators['note-id'].attempts).toBe(1)
  })
})

describe('refuerzo y dificultad', () => {
  it('detecta temas flojos', () => {
    for (let i = 0; i < 4; i++) recordExercise('interval-id', 'Intervalos', i === 0)
    for (let i = 0; i < 4; i++) recordExercise('note-id', 'Notas', true)
    const w = weakTopics(getState())
    expect(w.map((x) => x.topic)).toEqual(['Intervalos'])
  })
  it('sube la dificultad con buenos resultados', () => {
    expect(adaptiveDifficulty(emptyState(), 'note-id')).toBe(1)
    for (let i = 0; i < 8; i++) recordExercise('note-id', 'Notas', true)
    expect(adaptiveDifficulty(getState(), 'note-id')).toBe(2)
    for (let i = 0; i < 10; i++) recordExercise('note-id', 'Notas', true)
    expect(adaptiveDifficulty(getState(), 'note-id')).toBe(3)
  })
  it('una lección superada no se "desuperar" con un intento peor', () => {
    finishLessonAttempt('x', 'X', 0.9, true)
    finishLessonAttempt('x', 'X', 0.2, false)
    expect(getState().lessons.x.completed).toBe(true)
    expect(getState().lessons.x.bestScore).toBe(0.9)
    expect(getState().lessons.x.attempts).toBe(2)
  })
})

describe('MIDI', () => {
  it('note-on, note-off y note-on con velocidad 0', () => {
    expect(parseMidiMessage([0x90, 60, 100])).toEqual({ type: 'on', midi: 60, velocity: 100 / 127 })
    expect(parseMidiMessage([0x90, 60, 0])).toEqual({ type: 'off', midi: 60, velocity: 0 })
    expect(parseMidiMessage([0x80, 64, 40])?.type).toBe('off')
    expect(parseMidiMessage([0x93, 67, 80])?.type).toBe('on') // otro canal
    expect(parseMidiMessage([0xb0, 64, 127])).toBeNull() // control change
    expect(parseMidiMessage([0x90, 60])).toBeNull()
  })
})
