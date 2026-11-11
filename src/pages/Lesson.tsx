import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { playSteps, stopPlayback } from '../audio/engine'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { MiniKeyboard } from '../components/MiniKeyboard'
import { Staff } from '../components/Staff'
import { Play, Prose, Rich, Stop, useNaming } from '../components/ui'
import { getLesson, LEVELS, nextLesson, prevLesson, type Block, type ExampleBlock, type Lesson, type ProjectBlock, type TryBlock } from '../content'
import { generateSet } from '../exercises/generators'
import { staticToExercise } from '../exercises/static'
import type { Exercise } from '../exercises/types'
import { resolveRoman } from '../music/chords'
import { chromaOf, formatNote, formatSymbol } from '../music/notes'
import { missingPrereqs, isDone } from '../store/curriculumState'
import { clearMarks, getPiano, onPianoNote, setTargets } from '../store/piano'
import { finishLessonAttempt, useProgress, visitLesson, type SavedProgression } from '../store/progress'

// ───────── Ejemplo reproducible ─────────
function ExampleCard({ b }: { b: ExampleBlock }) {
  const naming = useNaming()
  const [playing, setPlaying] = useState<'main' | 'alt' | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => () => { stopPlayback() }, [])
  const stop = () => { stopPlayback(); setPlaying(null); if (!shown) clearMarks() }
  const play = (which: 'main' | 'alt') => {
    if (playing === which) { stop(); return }
    const steps = which === 'main' ? b.steps : b.alt!.steps
    setPlaying(which)
    void playSteps(steps, {
      tempo: b.tempo,
      onStep: (i) => setTargets(steps[i].notes),
      onEnd: () => { setPlaying(null); if (shown) setTargets(b.highlight); else clearMarks() },
    })
  }
  const toggleShow = () => {
    if (shown) { setShown(false); clearMarks() } else { setShown(true); setTargets(b.highlight) }
  }
  useEffect(() => () => { if (shown) clearMarks() }, [shown])

  return (
    <figure className="example lesson-block" style={{ margin: 0 }} aria-label={b.title}>
      <div className="example-head">
        <h4>{b.title}</h4>
        {b.label && <span className="label">{formatLabel(b.label, naming)}</span>}
      </div>
      <p className="cap"><Rich text={b.caption} /></p>
      <div className={`example-vis${b.staff ? ' two' : ''}`}>
        {b.staff && <Staff notes={b.staff.notes} clef={b.staff.clef} chord={b.staff.chord} />}
        <MiniKeyboard notes={b.highlight} />
      </div>
      <div className="cluster" style={{ marginTop: 14 }}>
        <button className="btn btn-primary btn-sm" onClick={() => play('main')} aria-pressed={playing === 'main'}>{playing === 'main' ? <Stop /> : <Play />} {playing === 'main' ? 'Detener' : 'Escuchar'}</button>
        {b.alt && <button className="btn btn-sm" onClick={() => play('alt')} aria-pressed={playing === 'alt'}>{playing === 'alt' ? <Stop /> : <Play />} {b.alt.label}</button>}
        <button className="btn btn-sm" onClick={toggleShow} aria-pressed={shown}>{shown ? 'Quitar del piano' : 'Ver en el piano'}</button>
      </div>
    </figure>
  )
}

const CHORD_RE = /^[A-G][#b]{0,2}(maj|m|dim|aug|sus|add|alt|M|\d|\(|\/|#|b|-|\+)*$/
function formatLabel(l: string, naming: 'latin' | 'intl') {
  const parts = l.split(' – ')
  if (parts.every((p) => CHORD_RE.test(p))) return parts.map((p) => formatSymbol(p, naming)).join(' – ')
  return l
}

// ───────── Tarea en el piano ─────────
function TryCard({ b }: { b: TryBlock }) {
  const naming = useNaming()
  const [done, setDone] = useState(false)
  const seq = useRef<{ c: number; t: number }[]>([])
  const doneRef = useRef(false)

  useEffect(() => onPianoNote((e) => {
    if (e.type !== 'on' || doneRef.current) return
    const { down } = getPiano()
    const target = b.target
    const tchromas = target.notes.map(chromaOf)
    let ok = false
    if (target.mode === 'ordered') {
      seq.current = [...seq.current.filter((x) => Date.now() - x.t < 15000), { c: e.midi % 12, t: Date.now() }]
      const last = seq.current.slice(-tchromas.length).map((x) => x.c)
      ok = last.length === tchromas.length && last.every((c, i) => c === tchromas[i])
      // permite octava final repetida
      if (!ok && tchromas.length > 1) {
        const l2 = seq.current.slice(-(tchromas.length + 1)).map((x) => x.c)
        ok = l2.length === tchromas.length + 1 && l2.slice(0, -1).every((c, i) => c === tchromas[i]) && l2[l2.length - 1] === tchromas[0]
      }
    } else {
      const set = new Set(down.map((m) => m % 12))
      const want = new Set(tchromas)
      ok = set.size === want.size && [...want].every((c) => set.has(c))
      if (ok && target.mode === 'bass-set' && target.bass) ok = Math.min(...down) % 12 === chromaOf(target.bass)
    }
    if (ok) { doneRef.current = true; setDone(true); seq.current = [] }
  }), [b])

  const reset = () => { doneRef.current = false; setDone(false); seq.current = [] }
  const showTarget = () => setTargets(b.target.notes, [48, 84])
  return (
    <div className={`try lesson-block${done ? ' done' : ''}`}>
      <div>
        <p><b>Prueba en el piano. </b><Rich text={b.instruction} /></p>
        {done && <p style={{ marginTop: 6, color: 'var(--ok)', fontWeight: 600 }}>✓ {b.success}</p>}
        {!done && <p className="faint" style={{ marginTop: 4, fontSize: 14 }}>Objetivo: {b.target.notes.map((n) => formatNote(n, naming, false)).join(' – ')}{b.target.mode === 'bass-set' && b.target.bass ? ` (bajo: ${formatNote(b.target.bass, naming, false)})` : ''}</p>}
      </div>
      <div className="cluster">
        {!done && <button className="btn btn-sm" onClick={showTarget}>Mostrar las teclas</button>}
        {done ? <button className="btn btn-sm btn-ghost" onClick={() => { reset(); clearMarks() }}>Repetir</button> : <button className="btn btn-sm btn-ghost" onClick={clearMarks}>Ocultar</button>}
      </div>
    </div>
  )
}

// ───────── Mini-proyecto ─────────
export function projectCheck(p: SavedProgression) {
  const key = p.key
  let resolved: ReturnType<typeof resolveRoman>[] = []
  try { resolved = p.items.map((i) => resolveRoman(i.roman, key)) } catch { /* ignora romanos inválidos */ }
  const length8 = p.items.length >= 8
  const secondary = p.items.some((i) => i.roman.includes('/'))
  const color = p.items.some((i) => /^[b#]/.test(i.roman) || /(7|9|13|sus|add)/.test(i.roman) || (key.mode === 'major' && i.roman === 'iv'))
  const last = resolved[resolved.length - 1]
  const tonicEnd = !!last && last.degree === 1 && !last.secondaryOf && !/^[b#]/.test(last.roman)
  return { length8, secondary, color, 'tonic-end': tonicEnd, tempo: true } as Record<string, boolean>
}

export function projectStatus(progressions: SavedProgression[], b: ProjectBlock) {
  let best: { p: SavedProgression; res: Record<string, boolean>; score: number } | null = null
  for (const p of progressions) {
    const res = projectCheck(p)
    const score = b.criteria.filter((c) => res[c.id]).length
    if (!best || score > best.score) best = { p, res, score }
  }
  const ok = !!best && best.score === b.criteria.length
  return { best, ok }
}

function ProjectCard({ b }: { b: ProjectBlock }) {
  const { progressions } = useProgress()
  const { best, ok } = projectStatus(progressions, b)
  return (
    <section className="card lesson-block" aria-label={b.title}>
      <h3 className="card-title">{b.title}</h3>
      <p className="muted" style={{ maxWidth: '62ch' }}>{b.brief}</p>
      <ul className="crit list" style={{ border: 0 }}>
        {b.criteria.map((c) => (
          <li key={c.id} className={best?.res[c.id] ? 'ok' : ''} style={{ justifyContent: 'flex-start', borderBottom: 0, padding: '4px 0' }}>
            <span className="tick" aria-hidden="true">{best?.res[c.id] ? '✓' : ''}</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
      {best ? <p className="faint">Comprobado con tu progresión «{best.p.name}».</p> : <p className="faint">Todavía no has guardado ninguna progresión.</p>}
      <div className="cluster"><Link className="btn btn-primary" to="/laboratorio?tab=progresiones">Abrir el constructor de progresiones</Link>{ok && <span className="badge ok">Proyecto cumplido</span>}</div>
    </section>
  )
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'text': return <div key={i} className="lesson-block">{b.title && <h3 className="serif" style={{ fontSize: 30, marginBottom: 10 }}>{b.title}</h3>}<Prose body={b.body} /></div>
          case 'example': return <ExampleCard key={i} b={b} />
          case 'callout': return <div key={i} className={`callout lesson-block ${b.kind}`}>{b.title && <b className="t">{b.title}</b>}<Rich text={b.body} /></div>
          case 'try': return <TryCard key={i} b={b} />
          case 'project': return <ProjectCard key={i} b={b} />
        }
      })}
    </>
  )
}

function buildExercises(l: Lesson): Exercise[] {
  const gen = l.practice.flatMap((spec) => generateSet(spec.gen, spec.count, spec.difficulty ?? 1, Math.random, spec.params ?? {}))
  const stat = l.quiz.map((q) => {
    const ex = staticToExercise(q, l.title)
    // baraja las opciones conservando la respuesta correcta
    if (ex.response.type === 'choice') ex.response.options = [...ex.response.options].sort(() => Math.random() - 0.5)
    return ex
  })
  return [...gen, ...stat]
}

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = getLesson(lessonId)
  const s = useProgress()
  const [round, setRound] = useState(0)
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<{ correct: number; total: number; passed: boolean } | null>(null)

  useEffect(() => { if (lesson) visitLesson(lesson.id); setStarted(false); setResult(null); setRound(0) }, [lesson?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const exercises = useMemo(() => (lesson ? buildExercises(lesson) : []), [lesson, round]) // eslint-disable-line react-hooks/exhaustive-deps

  const projectBlock = lesson?.blocks.find((b): b is ProjectBlock => b.type === 'project')
  const projectOk = projectBlock ? projectStatus(s.progressions, projectBlock).ok : true

  const onComplete = useCallback((r: { correct: number; total: number }) => {
    if (!lesson) return
    const score = r.total ? r.correct / r.total : 0
    const passed = score >= lesson.passScore
    const finalPassed = passed && (!lesson.requiresProject || projectOk)
    finishLessonAttempt(lesson.id, lesson.title, score, finalPassed)
    setResult({ ...r, passed: finalPassed })
  }, [lesson, projectOk])

  if (!lesson) {
    return <div className="page page-narrow"><div className="empty"><h3>No encuentro esa lección</h3><p>Puede que el enlace sea antiguo. Elige una lección del curso.</p><Link className="btn btn-primary" to="/curso">Ver el curso</Link></div></div>
  }
  const lv = LEVELS[lesson.level - 1]
  const missing = missingPrereqs(s, lesson)
  const done = isDone(s, lesson.id)
  const next = nextLesson(lesson.id)
  const prev = prevLesson(lesson.id)
  const total = exercises.length

  return (
    <div className="page" style={{ ['--lvc' as string]: lv.color, maxWidth: 960 }}>
      <header className="lesson-top" style={{ ['--lvc' as string]: lv.color }}>
        <nav className="crumbs" aria-label="Ruta"><Link to="/curso">Curso</Link><span aria-hidden="true">/</span><span>Nivel {lesson.level} · {lv.name}</span><span aria-hidden="true">/</span><span>{lesson.minutes} min</span>{done && <span className="badge ok">Superada</span>}</nav>
        <h1>{lesson.title}</h1>
        <p className="objective">{lesson.objective}</p>
      </header>

      {missing.length > 0 && !done && (
        <div className="notice" role="note" style={{ marginBottom: 24 }}>
          Esta lección da por sabido: {missing.map((m, i) => <span key={m.id}>{i > 0 && ', '}<Link to={`/curso/${m.id}`}><b>{m.title}</b></Link></span>)}. Puedes continuar, pero te será más fácil si empiezas por ahí.
        </div>
      )}
      {lesson.prerequisites.length > 0 && missing.length === 0 && (
        <p className="faint" style={{ marginTop: -8, marginBottom: 20 }}>Requisitos: {lesson.prerequisites.map((p) => getLesson(p)?.title).filter(Boolean).join(' · ')}</p>
      )}

      <Blocks blocks={lesson.blocks} />

      <section className="lesson-block" aria-labelledby="practica-h">
        <h3 id="practica-h" className="serif" style={{ fontSize: 30, marginBottom: 10 }}>Cómo practicarlo al teclado</h3>
        <div className="callout tip"><Rich text={lesson.practiceTip} /></div>
      </section>

      <section className="lesson-block" aria-labelledby="err-h">
        <h3 id="err-h" className="serif" style={{ fontSize: 30, marginBottom: 10 }}>Errores habituales</h3>
        <ul className="prose" style={{ paddingLeft: '1.2em' }}>{lesson.mistakes.map((m, i) => <li key={i}><Rich text={m} /></li>)}</ul>
      </section>

      <section className="lesson-block" aria-labelledby="ej-h">
        <h3 id="ej-h" className="serif" style={{ fontSize: 30, marginBottom: 6 }}>Comprueba lo aprendido</h3>
        <p className="muted" style={{ maxWidth: '62ch' }}>
          Criterio para superar la lección: acertar al menos el {Math.round(lesson.passScore * 100)} % de las {total} preguntas
          {lesson.requiresProject ? ' y cumplir los criterios del mini-proyecto' : ''}. Los ejercicios se generan de nuevo cada vez.
        </p>
        {!started && !result && (
          <div className="cluster"><button className="btn btn-primary" onClick={() => setStarted(true)}>{s.lessons[lesson.id]?.attempts ? 'Hacer los ejercicios otra vez' : 'Empezar los ejercicios'}</button>{s.lessons[lesson.id]?.bestScore ? <span className="faint">Mejor resultado: {Math.round(s.lessons[lesson.id].bestScore * 100)} %</span> : null}</div>
        )}
        {started && !result && <ExercisePlayer exercises={exercises} color={lv.color} onComplete={onComplete} completeLabel="Ver resultado" />}
        {result && (
          <div className="card" role="status">
            <h3 className="card-title">{result.passed ? '¡Lección superada!' : result.correct / result.total >= lesson.passScore ? 'Casi: falta el mini-proyecto' : 'Todavía no'}</h3>
            <p className="muted">Has acertado {result.correct} de {result.total} ({Math.round((result.correct / result.total) * 100)} %).
              {!result.passed && result.correct / result.total >= lesson.passScore && lesson.requiresProject ? ' Guarda en el Laboratorio una progresión que cumpla todos los criterios y vuelve a comprobarlo.' : ''}
              {result.correct / result.total < lesson.passScore ? ` Necesitas ${Math.round(lesson.passScore * 100)} %: repasa la explicación y vuelve a intentarlo.` : ''}</p>
            <div className="cluster">
              <button className="btn" onClick={() => { setResult(null); setStarted(true); setRound((r) => r + 1) }}>Repetir con ejercicios nuevos</button>
              {(result.passed || done) && next && <Link className="btn btn-primary" to={`/curso/${next.id}`}>Siguiente: {next.title}</Link>}
              {result.passed && !next && <Link className="btn btn-primary" to="/progreso">Ver mi progreso</Link>}
            </div>
          </div>
        )}
      </section>

      <nav className="cluster" style={{ justifyContent: 'space-between', marginTop: 24 }} aria-label="Lecciones vecinas">
        {prev ? <Link className="btn btn-ghost" to={`/curso/${prev.id}`}>← {prev.title}</Link> : <span />}
        {next && <Link className="btn btn-ghost" to={`/curso/${next.id}`}>{next.title} →</Link>}
      </nav>
    </div>
  )
}

