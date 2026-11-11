import { describe, expect, it } from 'vitest'
import { GENERATORS, generateExercise, mulberry32 } from './generators'
import { gradeAnswer } from './grade'
import type { Answer, Exercise } from './types'
import { chromaOf } from '../music/notes'

function perfectAnswer(ex: Exercise): Answer {
  const r = ex.response
  if (r.type === 'choice') return { kind: 'choice', value: r.correct[0] }
  const notes = r.mode === 'bass-set' && r.bass ? [r.bass, ...r.expected.filter((n) => n !== r.bass)] : r.expected
  return { kind: 'notes', notes, source: r.mode === 'exact' ? 'piano' : 'spelled' }
}

describe('generadores', () => {
  for (const g of GENERATORS) {
    for (const d of [1, 2, 3] as const) {
      it(`${g.id} d${d}: genera ejercicios válidos que se autocorrigen`, () => {
        const rng = mulberry32(1234 + d)
        for (let i = 0; i < 25; i++) {
          const ex = generateExercise(g.id, d, rng)
          expect(ex.prompt.length).toBeGreaterThan(5)
          expect(ex.explanation.length).toBeGreaterThan(5)
          if (ex.response.type === 'choice') {
            expect(ex.response.options.length).toBeGreaterThanOrEqual(2)
            expect(new Set(ex.response.options).size).toBe(ex.response.options.length)
            expect(ex.response.correct.some((c) => (ex.response as { options: string[] }).options.includes(c))).toBe(true)
          } else {
            expect(ex.response.expected.length).toBeGreaterThan(0)
          }
          expect(gradeAnswer(ex, perfectAnswer(ex)).correct).toBe(true)
          expect(JSON.stringify(ex)).not.toContain('undefined')
        }
      })
    }
  }
})

describe('corrección musical', () => {
  const base = (over: Partial<Exercise['response']>): Exercise => ({
    id: 't', gen: 'triad-build', difficulty: 1, topic: 't', prompt: 'p', explanation: 'e',
    response: { type: 'notes', mode: 'set', expected: ['C', 'E', 'G'], spellingRequired: true, ...over } as Exercise['response'],
  })
  it('acordes: importa el conjunto, no el orden ni la octava', () => {
    const ex = base({})
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['G4', 'C5', 'E5'], source: 'piano' }).correct).toBe(true)
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['G', 'E', 'C'], source: 'spelled' }).correct).toBe(true)
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['C4', 'E4'], source: 'piano' }).correct).toBe(false)
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['C4', 'E4', 'G4', 'B4'], source: 'piano' }).correct).toBe(false)
  })
  it('suena igual pero mal escrito: parcial, no error rotundo', () => {
    const ex = base({ expected: ['Db', 'F', 'Ab'] })
    const bad = gradeAnswer(ex, { kind: 'notes', notes: ['C#', 'E#', 'G#'], source: 'spelled' })
    expect(bad.correct).toBe(false)
    expect(bad.partial).toBe(true)
    expect(bad.message).toMatch(/escritura/)
    // al tocar en el piano no existe escritura: Db–F–Ab == C#–F–G#
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['C#4', 'F4', 'G#4'], source: 'piano' }).correct).toBe(true)
  })
  it('escala: orden ascendente y octava final opcional', () => {
    const ex = base({ mode: 'ordered', expected: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] })
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'], source: 'piano' }).correct).toBe(true)
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['E', 'D', 'F#', 'G', 'A', 'B', 'C#'], source: 'spelled' }).correct).toBe(false)
    const enh = gradeAnswer(ex, { kind: 'notes', notes: ['D', 'E', 'Gb', 'G', 'A', 'B', 'Db'], source: 'spelled' })
    expect(enh.partial).toBe(true)
    expect(enh.correct).toBe(false)
  })
  it('inversión: se comprueba el bajo', () => {
    const ex = base({ mode: 'bass-set', bass: 'E' })
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['E4', 'G4', 'C5'], source: 'piano' }).correct).toBe(true)
    const wrong = gradeAnswer(ex, { kind: 'notes', notes: ['C4', 'E4', 'G4'], source: 'piano' })
    expect(wrong.correct).toBe(false)
    expect(wrong.partial).toBe(true)
    expect(wrong.message).toMatch(/bajo/)
  })
  it('registro: octava exacta', () => {
    const ex = base({ mode: 'exact', expected: ['A3'], spellingRequired: false })
    expect(gradeAnswer(ex, { kind: 'notes', notes: ['A3'], source: 'piano' }).correct).toBe(true)
    const off = gradeAnswer(ex, { kind: 'notes', notes: ['A4'], source: 'piano' })
    expect(off.correct).toBe(false)
    expect(off.partial).toBe(true)
  })
  it('opciones múltiples con varias respuestas válidas', () => {
    const ex: Exercise = { id: 'c', gen: 'complete-progression', difficulty: 1, topic: 't', prompt: 'p', explanation: 'e', response: { type: 'choice', optionKind: 'chord', options: ['F', 'Dm', 'Em'], correct: ['F', 'Dm'] } }
    expect(gradeAnswer(ex, { kind: 'choice', value: 'Dm' }).correct).toBe(true)
    expect(gradeAnswer(ex, { kind: 'choice', value: 'F' }).correct).toBe(true)
    expect(gradeAnswer(ex, { kind: 'choice', value: 'Em' }).correct).toBe(false)
    expect(chromaOf('Db')).toBe(chromaOf('C#'))
  })
})
