import { Link } from 'react-router-dom'
import { LEVELS, lessonsOfLevel } from '../content'
import { ProgressBar } from '../components/ui'
import { isDone, levelProgress, missingPrereqs, recommended } from '../store/curriculumState'
import { useProgress } from '../store/progress'

export function Course() {
  const s = useProgress()
  const rec = recommended(s)
  return (
    <div className="page">
      <header className="page-head">
        <h1>Curso de armonía para piano</h1>
        <p>Cada lección explica, deja escuchar, te pone al teclado y se autocorrige. Las lecciones se desbloquean en orden, pero puedes saltarte cualquiera cuando quieras.</p>
      </header>
      <div className="stack" style={{ gap: 22 }}>
        {LEVELS.map((lv) => {
          const p = levelProgress(s, lv.id)
          return (
            <section key={lv.id} className="level-card" style={{ ['--lvc' as string]: lv.color }} aria-labelledby={`lv-${lv.id}`}>
              <div className="level-head">
                <h2 id={`lv-${lv.id}`}>Nivel {lv.id}. {lv.name}</h2>
                <span className="muted mono-num">{p.done} de {p.total} superadas</span>
              </div>
              <p className="muted" style={{ margin: '6px 0 14px', maxWidth: '70ch' }}>{lv.goal}</p>
              <ProgressBar value={p.ratio} color={lv.color} />
              <div style={{ marginTop: 10 }}>
                {lessonsOfLevel(lv.id).map((l) => {
                  const done = isDone(s, l.id)
                  const missing = missingPrereqs(s, l)
                  const locked = !done && missing.length > 0
                  const rec_ = rec?.id === l.id
                  return (
                    <Link key={l.id} to={`/curso/${l.id}`} className={`lesson-row${done ? ' done' : ''}${locked ? ' locked' : ''}`} aria-label={`${l.title}${done ? ', superada' : locked ? ', bloqueada por prerrequisitos' : ''}`}>
                      <span className="lesson-dot" aria-hidden="true">{done ? '✓' : l.order}</span>
                      <span className="t">
                        <b>{l.title}</b>
                        <span>{l.minutes} min{locked ? ` · antes: ${missing.map((m) => m.title.split(':')[0]).slice(0, 2).join(', ')}` : ''}</span>
                      </span>
                      {rec_ && <span className="badge ok">Recomendada</span>}
                      {s.lessons[l.id] && !done && s.lessons[l.id].attempts > 0 && <span className="badge warn">En curso</span>}
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
