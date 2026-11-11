import { describe, expect, it } from 'vitest'
import { LESSONS, LEVELS, TOPICS } from './index'
import { GENERATOR_IDS, generateExercise, mulberry32 } from '../exercises/generators'
import { gradeAnswer } from '../exercises/grade'
import { staticToExercise } from '../exercises/static'

describe('contenido del curso', () => {
  it('hay al menos 36 lecciones en exactamente 5 niveles', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(36)
    expect(new Set(LESSONS.map((l) => l.level))).toEqual(new Set([1, 2, 3, 4, 5]))
    expect(LEVELS).toHaveLength(5)
    for (const lv of LEVELS) expect(LESSONS.filter((l) => l.level === lv.id).length).toBeGreaterThanOrEqual(7)
  })

  it('ids únicos y orden consistente', () => {
    const ids = LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const lv of LEVELS) {
      const orders = LESSONS.filter((l) => l.level === lv.id).map((l) => l.order)
      expect(orders).toEqual([...orders].sort((a, b) => a - b))
    }
  })

  it('cada lección tiene todos los campos exigidos', () => {
    for (const l of LESSONS) {
      const ctx = l.id
      expect(l.title.length, ctx).toBeGreaterThan(5)
      expect(l.objective.length, ctx).toBeGreaterThan(20)
      expect(l.minutes, ctx).toBeGreaterThan(0)
      expect(l.practiceTip.length, ctx).toBeGreaterThan(30)
      expect(l.mistakes.length, ctx).toBeGreaterThanOrEqual(1)
      expect(l.passScore, ctx).toBeGreaterThan(0)
      expect(l.blocks.some((b) => b.type === 'text'), `${ctx} sin explicación`).toBe(true)
      expect(l.blocks.some((b) => b.type === 'example' || b.type === 'try'), `${ctx} sin ejemplo`).toBe(true)
      expect(l.practice.length + l.quiz.length, `${ctx} sin ejercicios`).toBeGreaterThan(0)
      for (const b of l.blocks) {
        if (b.type === 'text' || b.type === 'callout') expect(b.body.length, ctx).toBeGreaterThan(30)
        if (b.type === 'example') {
          expect(b.steps.length, `${ctx} ${b.title}`).toBeGreaterThan(0)
          expect(b.highlight.length, `${ctx} ${b.title}`).toBeGreaterThan(0)
          expect(b.caption.length, `${ctx} ${b.title}`).toBeGreaterThan(10)
        }
        if (b.type === 'try') expect(b.target.notes.length).toBeGreaterThan(0)
      }
    }
  })

  it('los prerrequisitos existen y aparecen antes', () => {
    const index = new Map(LESSONS.map((l, i) => [l.id, i]))
    for (const l of LESSONS) {
      for (const p of l.prerequisites) {
        expect(index.has(p), `${l.id} → ${p} no existe`).toBe(true)
        expect(index.get(p)!, `${l.id} → ${p} debe estar antes`).toBeLessThan(index.get(l.id)!)
      }
    }
    expect(LESSONS[0].prerequisites).toEqual([])
  })

  it('el temario completo está cubierto', () => {
    const covered = new Set(LESSONS.flatMap((l) => l.covers))
    const missing = TOPICS.filter((t) => !covered.has(t.id)).map((t) => `${t.id} ${t.name}`)
    expect(missing).toEqual([])
    const valid = new Set(TOPICS.map((t) => t.id))
    for (const l of LESSONS) for (const c of l.covers) expect(valid.has(c), `${l.id} cubre ${c} inexistente`).toBe(true)
    expect(TOPICS).toHaveLength(83)
  })

  it('los ejercicios referencian generadores reales y generan sin errores', () => {
    const rng = mulberry32(99)
    for (const l of LESSONS) {
      for (const spec of l.practice) {
        expect(GENERATOR_IDS, `${l.id}: ${spec.gen}`).toContain(spec.gen)
        expect(spec.count).toBeGreaterThan(0)
        for (let i = 0; i < spec.count; i++) {
          const ex = generateExercise(spec.gen, spec.difficulty ?? 1, rng, spec.params ?? {})
          expect(ex.prompt.length).toBeGreaterThan(3)
        }
      }
    }
  })

  it('las preguntas estáticas son coherentes', () => {
    for (const l of LESSONS) {
      for (const q of l.quiz) {
        expect(q.options.length, `${l.id}: ${q.q}`).toBeGreaterThanOrEqual(2)
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThan(q.options.length)
        expect(new Set(q.options).size).toBe(q.options.length)
        const ex = staticToExercise(q, l.title)
        expect(gradeAnswer(ex, { kind: 'choice', value: q.options[q.answer] }).correct).toBe(true)
      }
    }
  })

  it('cada lección tiene suficientes preguntas para evaluar', () => {
    for (const l of LESSONS) {
      const total = l.quiz.length + l.practice.reduce((s, p) => s + p.count, 0)
      expect(total, l.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('el proyecto final solo aparece donde se exige', () => {
    for (const l of LESSONS) {
      const hasProject = l.blocks.some((b) => b.type === 'project')
      expect(hasProject, l.id).toBe(!!l.requiresProject)
    }
  })
})
