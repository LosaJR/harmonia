import { Note } from '@tonaljs/tonal'
import { chromaOf, toMidi } from '../music/notes'
import type { Answer, Exercise, Grade } from './types'
import { P } from './rich'

const pcName = (n: string) => Note.pitchClass(n)

function diff(expected: string[], given: string[]) {
  const ec = expected.map(chromaOf)
  const gc = given.map(chromaOf)
  const missing = expected.filter((_, i) => !gc.includes(ec[i]))
  const extra = given.filter((_, i) => !ec.includes(gc[i]))
  return { missing: [...new Set(missing.map(pcName))], extra: [...new Set(extra.map(pcName))] }
}

function describeDiff(expected: string[], given: string[]): string {
  const { missing, extra } = diff(expected, given)
  const parts: string[] = []
  if (missing.length) parts.push(`falta${missing.length > 1 ? 'n' : ''} ${P(missing)}`)
  if (extra.length) parts.push(`sobra${extra.length > 1 ? 'n' : ''} ${P(extra)}`)
  return parts.length ? `Casi: ${parts.join(' y ')}.` : 'Las notas no coinciden.'
}

const uniq = <T,>(a: T[]) => [...new Set(a)]

function chromaSetEq(a: string[], b: string[]) {
  const x = uniq(a.map(chromaOf)).sort((p, q) => p - q)
  const y = uniq(b.map(chromaOf)).sort((p, q) => p - q)
  return x.length === y.length && x.every((v, i) => v === y[i])
}

/** Quita la octava repetida final (Do–Re–…–Si–Do) de una secuencia ordenada. */
function trimOctave(seq: string[], expectedLen: number): string[] {
  if (seq.length === expectedLen + 1 && chromaOf(seq[seq.length - 1]) === chromaOf(seq[0])) return seq.slice(0, -1)
  return seq
}

export function gradeAnswer(ex: Exercise, answer: Answer): Grade {
  const r = ex.response
  if (r.type === 'choice') {
    if (answer.kind !== 'choice') return { correct: false, partial: false, message: 'Esta pregunta se responde con las opciones.' }
    const ok = r.correct.includes(answer.value)
    return { correct: ok, partial: false, message: ok ? 'Correcto.' : 'No es esa.' }
  }
  if (answer.kind !== 'notes') return { correct: false, partial: false, message: 'Esta pregunta se responde con notas.' }
  const given = answer.notes
  if (given.length === 0) return { correct: false, partial: false, message: 'Aún no has marcado ninguna nota.' }
  const spelled = answer.source === 'spelled'

  switch (r.mode) {
    case 'exact': {
      const a = uniq(given.map(toMidi)).sort((x, y) => x - y)
      const b = uniq(r.expected.map(toMidi)).sort((x, y) => x - y)
      const ok = a.length === b.length && a.every((v, i) => v === b[i])
      if (ok) return { correct: true, partial: false, message: 'Correcto: nota y octava exactas.' }
      if (chromaSetEq(given, r.expected)) return { correct: false, partial: true, message: 'Tienes la nota correcta pero en otra octava.' }
      return { correct: false, partial: false, message: describeDiff(r.expected, given) }
    }
    case 'ordered': {
      const seq = trimOctave(given, r.expected.length)
      const exp = r.expected
      const sameSound = seq.length === exp.length && seq.every((n, i) => chromaOf(n) === chromaOf(exp[i]))
      if (!sameSound) {
        if (chromaSetEq(seq, exp) && seq.length === exp.length) return { correct: false, partial: false, message: 'Las notas son correctas, pero no están en orden ascendente.' }
        return { correct: false, partial: false, message: seq.length !== exp.length ? `Debe tener ${exp.length} notas distintas y has marcado ${seq.length}. ${describeDiff(exp, seq)}` : describeDiff(exp, seq) }
      }
      if (spelled && r.spellingRequired && !seq.every((n, i) => pcName(n) === pcName(exp[i]))) {
        const wrong = seq.map((n, i) => (pcName(n) !== pcName(exp[i]) ? `${P([pcName(n)])} → ${P([pcName(exp[i])])}` : null)).filter(Boolean)
        return { correct: false, partial: true, message: `Suena igual, pero la escritura teórica es otra (${wrong.join('; ')}). En una escala cada letra aparece una sola vez.` }
      }
      return { correct: true, partial: false, message: 'Correcto.' }
    }
    case 'set':
    case 'bass-set': {
      const sound = chromaSetEq(given, r.expected)
      if (!sound) return { correct: false, partial: false, message: describeDiff(r.expected, given) }
      if (r.mode === 'bass-set' && r.bass) {
        const bassNote = spelled ? given[0] : [...given].sort((a, b) => toMidi(a) - toMidi(b))[0]
        if (chromaOf(bassNote) !== chromaOf(r.bass)) {
          return { correct: false, partial: true, message: `Las notas son correctas, pero el bajo debe ser ${P([r.bass])}${spelled ? ' (colócalo en primer lugar)' : ' (la nota más grave)'}.` }
        }
      }
      if (spelled && r.spellingRequired) {
        const a = uniq(given.map(pcName)).sort()
        const b = uniq(r.expected.map(pcName)).sort()
        if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
          return { correct: false, partial: true, message: `Suena igual, pero la escritura correcta es ${P(r.expected.map(pcName))}: las terceras y quintas se escriben con letras alternas.` }
        }
      }
      return { correct: true, partial: false, message: 'Correcto.' }
    }
  }
}
