import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { playSteps, stopPlayback } from '../audio/engine'
import { gradeAnswer } from '../exercises/grade'
import { rich } from '../exercises/rich'
import type { Answer, Exercise, Grade, ListenSpec, OptionKind } from '../exercises/types'
import { formatNote, formatRoman, formatSymbol, intervalNameEs, midiToName, toMidi, type NoteNaming } from '../music/notes'
import { clearMarks, resetLog, setMarks, startRecording, stopRecording, usePiano, type KeyMark } from '../store/piano'
import { recordExercise } from '../store/progress'
import { MiniKeyboard } from './MiniKeyboard'
import { Staff } from './Staff'
import { Play, Prose, Rich, Stop, useNaming } from './ui'

export function ListenButton({ spec, label, autoStopKey }: { spec: ListenSpec; label?: string; autoStopKey?: string }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => { stopPlayback() }, [autoStopKey])
  if (!spec.steps.length) return null
  return (
    <button className="btn" onClick={() => { if (playing) { stopPlayback(); setPlaying(false) } else { setPlaying(true); void playSteps(spec.steps, { tempo: spec.tempo, onEnd: () => setPlaying(false) }) } }} aria-pressed={playing}>
      {playing ? <Stop /> : <Play />} {playing ? 'Detener' : (label ?? spec.label ?? 'Escuchar')}
    </button>
  )
}

export function optionLabel(kind: OptionKind, value: string, naming: NoteNaming): { main: string; sub?: string } {
  switch (kind) {
    case 'note': return { main: value.split('/').map((n) => formatNote(n, naming, false)).join(' / ') }
    case 'chord': return { main: formatSymbol(value, naming) }
    case 'interval': return { main: value === 'TT' ? 'Tritono' : value, sub: value === 'TT' ? '4ª aum. / 5ª dism.' : intervalNameEs(value) }
    case 'roman': return { main: formatRoman(value) }
    case 'romans': return { main: value.split(',').map(formatRoman).join(' – ') }
    case 'chords': return { main: value.split(',').map((c) => formatSymbol(c, naming)).join(' – ') }
    case 'notes': return { main: value.split(',').map((n) => formatNote(n, naming)).join(' – ') }
    default: return { main: value }
  }
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

function NoteSpeller({ notes, onChange }: { notes: string[]; onChange: (n: string[]) => void }) {
  const [acc, setAcc] = useState<'' | '#' | 'b'>('')
  const naming = useNaming()
  return (
    <div className="speller">
      <div className="accs" role="group" aria-label="Alteración">
        {([['b', '♭'], ['', '♮'], ['#', '♯']] as const).map(([v, g]) => (
          <button key={v} className="chip" aria-pressed={acc === v} onClick={() => setAcc(v)}>{g}</button>
        ))}
      </div>
      <div className="letters" role="group" aria-label="Notas">
        {LETTERS.map((l) => (
          <button key={l} className="btn btn-sm" onClick={() => onChange([...notes, l + acc])}>{formatNote(l + acc, naming, false)}</button>
        ))}
        <button className="btn btn-sm btn-ghost" onClick={() => onChange(notes.slice(0, -1))} disabled={!notes.length} aria-label="Quitar la última nota">⌫</button>
      </div>
    </div>
  )
}

interface Props {
  exercises: Exercise[]
  title?: string
  color?: string
  onComplete?: (r: { correct: number; total: number }) => void
  completeLabel?: string
  record?: boolean
}

export function ExercisePlayer({ exercises, title, color, onComplete, completeLabel = 'Terminar', record = true }: Props) {
  const naming = useNaming()
  const piano = usePiano()
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [spelled, setSpelled] = useState<string[]>([])
  const [results, setResults] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const ex = exercises[i]
  const done_ = useRef(false)

  // Reinicio completo cuando cambia el conjunto de ejercicios
  const key = useMemo(() => exercises.map((e) => e.id).join('|'), [exercises])
  useEffect(() => { setI(0); setPicked(null); setGrade(null); setSpelled([]); setResults([]); setDone(false); done_.current = false }, [key])

  // Grabación del piano para respuestas con notas
  const needsNotes = ex?.response.type === 'notes'
  useEffect(() => {
    clearMarks()
    if (!needsNotes) resetLog()
  }, [ex, needsNotes])
  useEffect(() => {
    if (!ex) return
    if (needsNotes && !grade) startRecording(); else stopRecording()
    return () => { stopRecording() }
  }, [ex, needsNotes, grade])
  useEffect(() => () => { clearMarks(); stopPlayback() }, [])

  // Notas tocadas → marcas azules
  useEffect(() => {
    if (!needsNotes || grade) return
    const marks: Record<number, KeyMark> = {}
    piano.log.forEach((m) => { marks[m] = 'played' })
    setMarks(marks)
  }, [piano.log, needsNotes, grade])

  const pianoNotes = useMemo(() => [...new Set(piano.log)].map((m) => midiToName(m)), [piano.log])
  const inputNotes = spelled.length ? spelled : (ex?.response.type === 'notes' && ex.response.mode === 'ordered' ? piano.log.map((m) => midiToName(m)) : pianoNotes)
  const source: 'piano' | 'spelled' = spelled.length ? 'spelled' : 'piano'

  const finishQuestion = useCallback((answer: Answer) => {
    if (!ex) return
    const g = gradeAnswer(ex, answer)
    setGrade(g)
    setResults((r) => [...r, g.correct])
    if (record) recordExercise(ex.gen, ex.topic, g.correct)
    if (ex.response.type === 'notes') {
      const marks: Record<number, KeyMark> = {}
      const exp = ex.response.expected
      const mids = (answer.kind === 'notes' && answer.source === 'piano') ? answer.notes.map(toMidi) : []
      mids.forEach((m) => { marks[m] = exp.some((n) => ((toMidi(/\d/.test(n) ? n : `${n}4`)) % 12 + 12) % 12 === m % 12) ? 'ok' : 'wrong' })
      if (!g.correct) {
        const base = 60
        exp.forEach((n) => { const mm = /\d/.test(n) ? toMidi(n) : base + ((toMidi(`${n}4`) - base) % 12 + 12) % 12; if (!(mm in marks)) marks[mm] = 'target' })
      }
      setMarks(marks)
    }
  }, [ex, record])

  const pick = (v: string) => {
    if (grade || !ex) return
    setPicked(v)
    finishQuestion({ kind: 'choice', value: v })
  }
  const check = () => {
    if (!ex || grade || !inputNotes.length) return
    finishQuestion({ kind: 'notes', notes: inputNotes, source })
  }
  const clearInput = () => { setSpelled([]); resetLog() }
  const next = useCallback(() => {
    if (i + 1 >= exercises.length) { setDone(true); return }
    setI(i + 1); setPicked(null); setGrade(null); setSpelled([]); resetLog()
  }, [i, exercises.length])

  const correctCount = results.filter(Boolean).length
  useEffect(() => {
    if (done && !done_.current) { done_.current = true; onComplete?.({ correct: correctCount, total: exercises.length }) }
  }, [done, correctCount, exercises.length, onComplete])

  // Enter: comprobar o continuar
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || (e.target as HTMLElement)?.closest('button, select, input, textarea, a')) return
      if (grade) next(); else if (needsNotes) check()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  if (!exercises.length) return <div className="empty"><h3>No hay ejercicios</h3><p>Esta lección no tiene práctica automática.</p></div>

  if (done) {
    const pct = Math.round((correctCount / exercises.length) * 100)
    return (
      <div className="ex" style={color ? ({ '--lvc': color } as React.CSSProperties) : undefined}>
        <div className="cluster" style={{ gap: 28, alignItems: 'center' }}>
          <div className="score-ring" style={{ ['--p' as string]: pct }}><span>{pct}%</span></div>
          <div>
            <h3 className="serif" style={{ fontSize: 32 }}>{correctCount} de {exercises.length} correctas</h3>
            <p className="muted">{pct >= 70 ? 'Buen trabajo: dominas este bloque.' : 'Repasa las explicaciones y vuelve a intentarlo: cada vuelta genera ejercicios nuevos.'}</p>
          </div>
        </div>
        <div className="ex-actions">
          <button className="btn btn-primary" onClick={() => onComplete?.({ correct: correctCount, total: exercises.length })}>{completeLabel}</button>
        </div>
      </div>
    )
  }

  const r = ex.response
  const isAural = !!ex.aural
  return (
    <div className="ex" style={color ? ({ '--lvc': color } as React.CSSProperties) : undefined}>
      <div className="ex-head">
        <span>{title ? `${title} · ` : ''}Pregunta {i + 1} de {exercises.length}</span>
        <span aria-label={`${correctCount} aciertos`}>{correctCount} ✓</span>
      </div>
      <div className="bar" style={{ marginBottom: 18 }}><span style={{ width: `${(i / exercises.length) * 100}%` }} /></div>
      <p className="ex-prompt"><Rich text={ex.prompt} /></p>

      {!isAural && ex.visual?.staff && (
        <div className="ex-visual"><Staff notes={ex.visual.staff.notes} clef={ex.visual.staff.clef} chord={ex.visual.staff.chord} /></div>
      )}
      {!isAural && ex.visual?.keys && (
        <div className="ex-visual"><MiniKeyboard notes={ex.visual.keys} showLabels={!!grade} label="Teclado con las notas de la pregunta resaltadas" /></div>
      )}
      {ex.listen && ex.listen.steps.length > 0 && (
        <div className="ex-actions" style={{ marginTop: 0, marginBottom: 14 }}>
          <ListenButton spec={ex.listen} label={isAural ? 'Escuchar' : (grade ? ex.listen.label : ex.listen.label || 'Escuchar')} autoStopKey={ex.id} />
          {isAural && !grade && <span className="faint">Puedes repetirlo cuantas veces quieras.</span>}
        </div>
      )}

      {r.type === 'choice' ? (
        <div className="ex-options" role="group" aria-label="Opciones de respuesta">
          {r.options.map((o) => {
            const lab = optionLabel(r.optionKind, o, naming)
            const isCorrect = r.correct.includes(o)
            const cls = grade ? (isCorrect ? 'ok' : picked === o ? 'bad' : '') : picked === o ? 'picked' : ''
            return (
              <button key={o} className={`opt ${cls}`} disabled={!!grade} onClick={() => pick(o)}>
                <span>{lab.main}{lab.sub && <small>{lab.sub}</small>}</span>
                {r.optionKind === 'notes' && (
                  <span role="button" tabIndex={0} className="tool" aria-label="Escuchar esta distribución" onClick={(e) => { e.stopPropagation(); void playSteps([{ notes: o.split(','), beats: 2 }], { tempo: 80 }) }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); void playSteps([{ notes: o.split(','), beats: 2 }], { tempo: 80 }) } }}><Play /></span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div>
          <p className="faint" style={{ margin: '0 0 6px' }}>
            {r.mode === 'exact' || r.mode === 'bass-set' ? 'Responde tocando en el piano (ratón, teclado del ordenador o MIDI).' : 'Responde tocando en el piano o escribiendo las notas con los botones.'}
          </p>
          <div className="answer-strip" aria-live="polite" aria-label="Tu respuesta">
            {inputNotes.length === 0 && <span className="faint">Tu respuesta aparecerá aquí…</span>}
            {inputNotes.map((n, k) => <span key={k} className="pill">{formatNote(n, naming, source === 'piano')}</span>)}
          </div>
          {!grade && r.mode !== 'exact' && r.mode !== 'bass-set' && <NoteSpeller notes={spelled} onChange={(n) => { setSpelled(n); resetLog() }} />}
          {!grade && (
            <div className="ex-actions">
              <button className="btn btn-primary" onClick={check} disabled={!inputNotes.length}>Comprobar</button>
              <button className="btn btn-ghost" onClick={clearInput} disabled={!inputNotes.length}>Borrar</button>
            </div>
          )}
        </div>
      )}

      {grade && (
        <div className={`feedback ${grade.correct ? 'ok' : grade.partial ? 'part' : 'bad'}`} role="status" aria-live="polite">
          <h4>{grade.correct ? 'Correcto' : grade.partial ? 'Casi' : 'No es esa'}</h4>
          {!grade.correct && <p style={{ margin: '0 0 6px' }}><Rich text={grade.message} /></p>}
          <Prose body={ex.explanation} />
          {ex.hint && !grade.correct && <p className="faint">Pista: {rich(ex.hint, naming)}</p>}
          <div className="ex-actions" style={{ marginTop: 10 }}>
            {ex.listen && ex.listen.steps.length > 0 && !isAural && r.type === 'notes' && <ListenButton spec={ex.listen} autoStopKey={ex.id + 'sol'} />}
            <button className="btn btn-primary" onClick={next} autoFocus>{i + 1 >= exercises.length ? 'Ver resultado' : 'Siguiente'}</button>
          </div>
        </div>
      )}
      {!grade && ex.hint && <p className="faint" style={{ marginTop: 14 }}>Pista: {rich(ex.hint, naming)}</p>}
    </div>
  )
}
