import { Link } from 'react-router-dom'
import { LEVELS, LESSONS } from '../content'
import { generatorInfo } from '../exercises/generators'
import type { GeneratorId } from '../exercises/types'
import { Piano, PianoToolbar } from '../components/Piano'
import { useLiveLabel } from '../components/PianoDock'
import { ProgressBar } from '../components/ui'
import { continueLesson, levelProgress, recommended, totalProgress } from '../store/curriculumState'
import { accuracy, overallAccuracy, streakDays, useProgress } from '../store/progress'

const CHALLENGES: { gen: GeneratorId; title: string; text: string }[] = [
  { gen: 'scale-build', title: 'Una escala al día', text: 'Construye cinco escalas en tonalidades distintas.' },
  { gen: 'aural-chord', title: 'Escucha antes de mirar', text: 'Reconoce la calidad de cinco acordes solo por el oído.' },
  { gen: 'inversion-build', title: 'Mueve el bajo', text: 'Toca acordes en la inversión que se pide.' },
  { gen: 'voice-leading', title: 'Manos económicas', text: 'Elige la conducción de voces que menos se mueve.' },
  { gen: 'progression-analysis', title: 'Lee armonía', text: 'Analiza progresiones con números romanos.' },
]

function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.round(h / 24)} d`
}

export function Home() {
  const s = useProgress()
  const live = useLiveLabel()
  const cont = continueLesson(s)
  const next = recommended(s)
  const tp = totalProgress(s)
  const oa = overallAccuracy(s)
  const weak = Object.entries(s.generators).filter(([, r]) => r.attempts >= 3 && accuracy(r) < 0.7).map(([id, r]) => ({ id: id as GeneratorId, acc: accuracy(r) })).sort((a, b) => a.acc - b.acc).slice(0, 3)
  const day = Math.floor(Date.now() / 86400000)
  const challenge = CHALLENGES[day % CHALLENGES.length]
  const started = Object.keys(s.lessons).length > 0
  const lvColor = cont ? LEVELS[cont.level - 1].color : undefined

  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero-title">La armonía se aprende con las manos.</h1>
        <p className="hero-sub">Cinco niveles, {LESSONS.length} lecciones y un piano que suena en tu navegador. Sin cuentas, sin suscripciones, sin conexión.</p>
        <div className="hero-play">
          <div className="live" aria-live="polite">
            {live.main || <span className="faint" style={{ fontFamily: 'var(--sans)', fontSize: 17 }}>Pulsa unas teclas: Harmonia reconoce lo que tocas.</span>}
            {live.sub && <small>{live.sub}</small>}
          </div>
          <Piano height={168} />
          <PianoToolbar />
        </div>
      </section>

      <section className="section-gap grid-2" aria-label="Continuar">
        <div className="card" style={{ ['--lvc' as string]: lvColor }}>
          <h2 className="card-title">{started && cont ? 'Sigue donde lo dejaste' : 'Empieza el curso'}</h2>
          {cont ? (
            <>
              <p className="muted" style={{ margin: '0 0 4px' }}>Nivel {cont.level} · {LEVELS[cont.level - 1].name}</p>
              <p style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>{cont.title}</p>
              <p className="muted">{cont.objective}</p>
              <div className="cluster">
                <Link className="btn btn-primary" to={`/curso/${cont.id}`}>{started ? 'Continuar la lección' : 'Empezar la primera lección'}</Link>
                {next && next.id !== cont.id && <Link className="btn" to={`/curso/${next.id}`}>Siguiente recomendada: {next.title.split(':')[0]}</Link>}
              </div>
            </>
          ) : (
            <p>Has completado todas las lecciones. Repasa con el entrenador o construye en el laboratorio.</p>
          )}
        </div>
        <div className="card">
          <h2 className="card-title">Tu avance</h2>
          <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
            <div className="stat"><b className="mono-num">{tp.done}/{tp.total}</b><span>lecciones superadas</span></div>
            <div className="stat"><b className="mono-num">{oa.attempts ? Math.round(oa.acc * 100) : '–'}{oa.attempts ? '%' : ''}</b><span>aciertos en ejercicios</span></div>
            <div className="stat"><b className="mono-num">{oa.attempts}</b><span>ejercicios hechos</span></div>
            <div className="stat"><b className="mono-num">{streakDays(s)}</b><span>{streakDays(s) === 1 ? 'día seguido' : 'días seguidos'}</span></div>
          </div>
          <ProgressBar value={tp.ratio} />
        </div>
      </section>

      <section className="section-gap" aria-labelledby="niveles-h">
        <h2 id="niveles-h" className="section-title">Cinco niveles</h2>
        <div className="grid-3">
          {LEVELS.map((lv) => {
            const p = levelProgress(s, lv.id)
            return (
              <Link key={lv.id} to="/curso" className="card" style={{ textDecoration: 'none', borderTop: `4px solid ${lv.color}`, ['--lvc' as string]: lv.color }}>
                <p className="faint" style={{ margin: 0 }}>Nivel {lv.id}</p>
                <h3 className="serif" style={{ fontSize: 28, margin: '2px 0 6px' }}>{lv.name}</h3>
                <p className="muted" style={{ fontSize: 15 }}>{lv.tagline}</p>
                <ProgressBar value={p.ratio} color={lv.color} />
                <p className="faint" style={{ margin: '6px 0 0', fontSize: 14 }}>{p.done} de {p.total} lecciones</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section-gap grid-2">
        <div className="card">
          <h2 className="card-title">Reto de hoy</h2>
          <p style={{ fontWeight: 600, margin: '0 0 2px' }}>{challenge.title}</p>
          <p className="muted">{challenge.text}</p>
          <Link className="btn btn-primary" to={`/entrenador?gen=${challenge.gen}`}>Aceptar el reto</Link>
          {weak.length > 0 && (
            <>
              <h3 className="serif" style={{ fontSize: 22, margin: '22px 0 6px' }}>Conviene reforzar</h3>
              <ul className="list">
                {weak.map((w) => (
                  <li key={w.id}><span>{generatorInfo(w.id).nameEs}<span className="faint"> · {Math.round(w.acc * 100)} % de aciertos</span></span><Link className="btn btn-sm" to={`/entrenador?gen=${w.id}`}>Practicar</Link></li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="card">
          <h2 className="card-title">Actividad reciente</h2>
          {s.history.length === 0 ? (
            <div className="empty" style={{ padding: 20 }}><h3>Aún no hay actividad</h3><p>Completa un ejercicio y aparecerá aquí.</p></div>
          ) : (
            <ul className="list">
              {[...s.history].reverse().slice(0, 7).map((h, i) => (
                <li key={i}><span>{h.kind === 'exercise' ? (h.ok ? '✓ ' : '✗ ') : ''}{h.label}</span><span className="faint">{timeAgo(h.t)}</span></li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
