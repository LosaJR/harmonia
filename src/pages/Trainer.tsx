import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExercisePlayer } from '../components/ExercisePlayer'
import { GENERATORS, generateExercise, generateSet } from '../exercises/generators'
import type { Exercise, GeneratorId } from '../exercises/types'
import { accuracy, adaptiveDifficulty, useProgress } from '../store/progress'

type Cat = 'todas' | 'fundamentos' | 'acordes' | 'oído' | 'armonía' | 'avanzado'
const CATS: { id: Cat; label: string }[] = [
  { id: 'todas', label: 'Todas' }, { id: 'fundamentos', label: 'Fundamentos' }, { id: 'acordes', label: 'Acordes' },
  { id: 'oído', label: 'Oído' }, { id: 'armonía', label: 'Armonía' }, { id: 'avanzado', label: 'Avanzado' },
]
const INPUT_LABEL = { opciones: 'Opciones', piano: 'Piano / MIDI', mixto: 'Piano, MIDI o escribir' } as const

export function Trainer() {
  const s = useProgress()
  const [params, setParams] = useSearchParams()
  const initial = (params.get('gen') as GeneratorId | null) ?? null
  const [cat, setCat] = useState<Cat>('todas')
  const [gen, setGen] = useState<GeneratorId | 'mezcla'>(initial && GENERATORS.some((g) => g.id === initial) ? initial : 'mezcla')
  const [diff, setDiff] = useState<'auto' | 1 | 2 | 3>('auto')
  const [count, setCount] = useState(10)
  const [session, setSession] = useState<{ n: number; exercises: Exercise[] } | null>(null)
  const [summary, setSummary] = useState<{ correct: number; total: number } | null>(null)

  const list = GENERATORS.filter((g) => cat === 'todas' || g.category === cat)
  const pool = gen === 'mezcla' ? list : list.filter((g) => g.id === gen)
  const difficultyFor = (id: GeneratorId): 1 | 2 | 3 => (diff === 'auto' ? adaptiveDifficulty(s, id) : diff)

  const start = () => {
    const exercises: Exercise[] = []
    if (gen === 'mezcla') {
      for (let i = 0; i < count; i++) {
        const g = pool[Math.floor(Math.random() * pool.length)]
        exercises.push(generateExercise(g.id, difficultyFor(g.id)))
      }
    } else {
      exercises.push(...generateSet(gen, count, difficultyFor(gen)))
    }
    setSummary(null)
    setSession({ n: (session?.n ?? 0) + 1, exercises })
  }

  const clearInitial = () => { if (params.has('gen')) setParams({}, { replace: true }) }
  const ready = useMemo(() => pool.length > 0, [pool.length])

  if (session && !summary) {
    return (
      <div className="page page-narrow">
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <h1 className="serif" style={{ fontSize: 36 }}>Entrenador</h1>
          <button className="btn btn-ghost" onClick={() => setSession(null)}>Salir de la serie</button>
        </div>
        <ExercisePlayer key={session.n} exercises={session.exercises} onComplete={(r) => setSummary(r)} completeLabel="Ver resultado" />
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Entrenador</h1>
        <p>Ejercicios generados por reglas musicales, con corrección que distingue sonido, escritura y registro. La dificultad automática sube cuando aciertas.</p>
      </header>

      {summary && (
        <div className="notice good" role="status" style={{ marginBottom: 24 }}>
          <b>Serie terminada:</b> {summary.correct} de {summary.total} correctas ({Math.round((summary.correct / summary.total) * 100)} %).{' '}
          <button className="btn btn-sm btn-primary" onClick={start}>Otra serie igual</button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title">Configura tu serie</h2>
        <div className="cluster" role="group" aria-label="Categoría" style={{ marginBottom: 14 }}>
          {CATS.map((c) => <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => { setCat(c.id); setGen('mezcla') }}>{c.label}</button>)}
        </div>
        <div className="row">
          <label className="field"><span>Tipo de ejercicio</span>
            <select value={gen} onChange={(e) => { setGen(e.target.value as GeneratorId | 'mezcla'); clearInitial() }}>
              <option value="mezcla">Mezcla de la categoría</option>
              {list.map((g) => <option key={g.id} value={g.id}>{g.nameEs}</option>)}
            </select>
          </label>
          <label className="field"><span>Dificultad</span>
            <select value={String(diff)} onChange={(e) => setDiff(e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as 1 | 2 | 3))}>
              <option value="auto">Automática</option><option value="1">1 · Básica</option><option value="2">2 · Intermedia</option><option value="3">3 · Avanzada</option>
            </select>
          </label>
          <label className="field"><span>Preguntas</span>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select>
          </label>
          <button className="btn btn-primary" onClick={start} disabled={!ready} style={{ flex: '0 0 auto' }}>Empezar</button>
        </div>
      </div>

      <h2 className="section-title">Tipos de ejercicio</h2>
      <div className="grid-3">
        {list.map((g) => {
          const r = s.generators[g.id]
          return (
            <button key={g.id} className="card" style={{ textAlign: 'left', borderColor: gen === g.id ? 'var(--copper)' : undefined }} onClick={() => { setGen(g.id); clearInitial() }} aria-pressed={gen === g.id}>
              <b style={{ display: 'block', fontSize: 17 }}>{g.nameEs}</b>
              <span className="faint" style={{ fontSize: 14 }}>{INPUT_LABEL[g.input]}{g.category === 'oído' ? ' · sin ver la respuesta' : ''}</span>
              <span className="muted" style={{ display: 'block', marginTop: 8, fontSize: 14 }}>
                {r ? `${Math.round(accuracy(r) * 100)} % de aciertos en ${r.attempts} intentos · nivel auto ${adaptiveDifficulty(s, g.id)}` : 'Sin intentos todavía'}
              </span>
            </button>
          )
        })}
      </div>
      {list.length === 0 && <div className="empty"><h3>No hay ejercicios en esta categoría</h3></div>}
    </div>
  )
}
