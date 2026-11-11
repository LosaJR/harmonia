import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS, LESSONS, lessonsOfLevel } from '../content'
import { ProgressBar, useToast } from '../components/ui'
import { generatorInfo } from '../exercises/generators'
import type { GeneratorId } from '../exercises/types'
import { isDone, levelProgress, totalProgress } from '../store/curriculumState'
import { accuracy, exportProgress, importProgress, overallAccuracy, resetProgress, streakDays, weakTopics, useProgress } from '../store/progress'

export function Progress() {
  const s = useProgress()
  const [toast, say] = useToast()
  const [confirmReset, setConfirmReset] = useState(false)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const tp = totalProgress(s)
  const oa = overallAccuracy(s)
  const weak = weakTopics(s)
  const gens = Object.entries(s.generators).sort((a, b) => b[1].attempts - a[1].attempts)

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `harmonia-progreso-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    say('Progreso exportado')
  }
  const onFile = async (f: File | undefined) => {
    if (!f) return
    if (f.size > 2_000_000) { setImportMsg({ ok: false, text: 'El archivo es demasiado grande para ser un progreso de Harmonia.' }); return }
    const text = await f.text()
    const r = importProgress(text)
    setImportMsg(r.ok ? { ok: true, text: 'Progreso importado correctamente.' } : { ok: false, text: r.error })
    if (file.current) file.current.value = ''
  }

  return (
    <div className="page">
      <header className="page-head"><h1>Tu progreso</h1><p>Todo se guarda en este navegador. Exporta una copia para no perderlo o para llevarlo a otro equipo.</p></header>

      <section className="grid-3" aria-label="Resumen">
        <div className="card stat"><b className="mono-num">{tp.done}/{tp.total}</b><span>lecciones superadas</span><ProgressBar value={tp.ratio} /></div>
        <div className="card stat"><b className="mono-num">{oa.attempts ? `${Math.round(oa.acc * 100)}%` : '–'}</b><span>aciertos ({oa.correct} de {oa.attempts})</span></div>
        <div className="card stat"><b className="mono-num">{streakDays(s)}</b><span>días seguidos practicando · {s.practiceDays.length} en total</span></div>
      </section>

      <section className="section-gap" aria-labelledby="niv">
        <h2 id="niv" className="section-title">Por nivel</h2>
        <div className="stack">
          {LEVELS.map((lv) => {
            const p = levelProgress(s, lv.id)
            return (
              <div key={lv.id} className="card" style={{ borderLeft: `4px solid ${lv.color}`, borderRadius: '4px 16px 16px 4px' }}>
                <div className="cluster" style={{ justifyContent: 'space-between' }}><b>Nivel {lv.id}. {lv.name}</b><span className="muted mono-num">{p.done}/{p.total}</span></div>
                <ProgressBar value={p.ratio} color={lv.color} />
                <div className="cluster" style={{ marginTop: 12 }}>
                  {lessonsOfLevel(lv.id).map((l) => (
                    <Link key={l.id} to={`/curso/${l.id}`} className="chip" aria-pressed={isDone(s, l.id)} title={l.title}>{isDone(s, l.id) ? '✓ ' : ''}{l.order}{s.lessons[l.id]?.bestScore ? ` · ${Math.round(s.lessons[l.id].bestScore * 100)}%` : ''}</Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section-gap grid-2">
        <div className="card">
          <h2 className="card-title">Temas que requieren refuerzo</h2>
          {weak.length === 0 ? (
            <div className="empty" style={{ padding: 18 }}><h3>Nada que reforzar</h3><p>{oa.attempts < 3 ? 'Haz unos cuantos ejercicios y aquí aparecerán los temas más flojos.' : 'Tus aciertos están por encima del 70 % en todos los temas.'}</p></div>
          ) : (
            <ul className="list">{weak.map((w) => <li key={w.topic}><span>{w.topic}<span className="faint"> · {Math.round(w.acc * 100)} % en {w.attempts}</span></span></li>)}</ul>
          )}
          <Link to="/entrenador" className="btn" style={{ marginTop: 10 }}>Ir al entrenador</Link>
        </div>
        <div className="card">
          <h2 className="card-title">Rendimiento por ejercicio</h2>
          {gens.length === 0 ? (
            <div className="empty" style={{ padding: 18 }}><h3>Sin datos todavía</h3><p>Tus estadísticas por tipo de ejercicio aparecerán aquí.</p></div>
          ) : (
            <ul className="list">
              {gens.slice(0, 10).map(([id, r]) => (
                <li key={id}><span style={{ minWidth: 0 }}>{id === 'static' ? 'Preguntas de lección' : generatorInfo(id as GeneratorId).nameEs}</span><span className="mono-num" style={{ whiteSpace: 'nowrap' }}>{Math.round(accuracy(r) * 100)} % · {r.attempts}</span></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section-gap card">
        <h2 className="card-title">Historial reciente</h2>
        {s.history.length === 0 ? <div className="empty" style={{ padding: 18 }}><h3>Sin historial</h3><p>Cuando completes ejercicios o lecciones, los verás aquí.</p></div> : (
          <ul className="list">{[...s.history].reverse().slice(0, 15).map((h, i) => <li key={i}><span>{h.kind === 'exercise' ? (h.ok ? '✓ ' : '✗ ') : ''}{h.label}</span><span className="faint">{new Date(h.t).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span></li>)}</ul>
        )}
      </section>

      <section className="section-gap card" aria-labelledby="datos">
        <h2 id="datos" className="card-title">Tus datos</h2>
        <p className="muted" style={{ maxWidth: '62ch' }}>El progreso, tus progresiones guardadas y tus preferencias viven en este navegador ({LESSONS.length} lecciones, sin cuentas). Exporta un archivo JSON como copia de seguridad; al importar se valida su estructura antes de reemplazar nada.</p>
        <div className="cluster">
          <button className="btn btn-primary" onClick={download}>Exportar progreso</button>
          <label className="btn" style={{ cursor: 'pointer' }}>Importar progreso
            <input ref={file} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
          </label>
          {!confirmReset ? <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>Restablecer todo…</button> : (
            <span className="cluster" role="alertdialog" aria-label="Confirmar restablecimiento">
              <span>¿Borrar lecciones, estadísticas y progresiones? No se puede deshacer.</span>
              <button className="btn btn-danger btn-sm" onClick={() => { resetProgress(); setConfirmReset(false); say('Progreso restablecido') }}>Sí, borrar</button>
              <button className="btn btn-sm" onClick={() => setConfirmReset(false)}>Cancelar</button>
            </span>
          )}
        </div>
        {importMsg && <p className={`notice ${importMsg.ok ? 'good' : 'err'}`} role="status" style={{ marginTop: 14 }}>{importMsg.text}</p>}
      </section>
      {toast}
    </div>
  )
}
