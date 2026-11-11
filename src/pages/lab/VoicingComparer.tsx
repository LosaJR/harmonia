import { useEffect, useMemo, useState } from 'react'
import { playSteps } from '../../audio/engine'
import { MiniKeyboard } from '../../components/MiniKeyboard'
import { RootSelect } from '../../components/pickers'
import { useNaming } from '../../components/ui'
import { QUALITIES, buildChord } from '../../music/chords'
import { formatNote, formatSymbol, toMidi } from '../../music/notes'
import { VOICING_STYLES, analyzeMotion, voiceChord, type VoicingStyle } from '../../music/voicing'
import { clearMarks, setTargets } from '../../store/piano'

const COMMON = ['maj7', 'm7', '7', 'm7b5', 'maj', 'min', 'dim7', '9', 'm9', 'maj9', '13']

export function VoicingComparer() {
  const naming = useNaming()
  const [rootA, setRootA] = useState('D')
  const [qA, setQA] = useState('m7')
  const [rootB, setRootB] = useState('G')
  const [qB, setQB] = useState('7')
  const [styles, setStyles] = useState<VoicingStyle[]>(['close', 'drop2', 'rootlessA'])

  const toggle = (s: VoicingStyle) => setStyles((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))
  const A = useMemo(() => styles.map((s) => ({ s, v: voiceChord(rootA, qA, s, { octave: 3 }) })), [styles, rootA, qA])
  const B = useMemo(() => styles.map((s) => ({ s, v: voiceChord(rootB, qB, s, { octave: 3 }) })), [styles, rootB, qB])
  const combos = useMemo(() => {
    const out: { a: (typeof A)[number]; b: (typeof B)[number]; total: number; common: number; outer: string; parallels: string[] }[] = []
    A.forEach((a) => B.forEach((b) => {
      const m = analyzeMotion(a.v.notes, b.v.notes)
      out.push({ a, b, total: m.total, common: m.common, outer: m.outer, parallels: [...new Set(m.parallelPerfects)] })
    }))
    return out.sort((x, y) => x.total - y.total)
  }, [A, B])

  useEffect(() => () => clearMarks(), [])
  const label = (s: VoicingStyle) => VOICING_STYLES.find((x) => x.id === s)!
  const span = (notes: string[]) => toMidi(notes[notes.length - 1]) - toMidi(notes[0])
  const hear = (notes: string[]) => { setTargets(notes); void playSteps([{ notes, beats: 2.5 }], { tempo: 80, onEnd: () => clearMarks() }) }
  const hearPair = (a: string[], b: string[]) => void playSteps([{ notes: a, beats: 2 }, { notes: b, beats: 3 }], { tempo: 76, onStep: (i) => setTargets(i === 0 ? a : b), onEnd: () => clearMarks() })
  const sA = formatSymbol(buildChord(rootA, qA).symbol, naming)
  const sB = formatSymbol(buildChord(rootB, qB).symbol, naming)

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="card">
        <div className="row">
          <RootSelect value={rootA} onChange={setRootA} label="Primer acorde: fundamental" />
          <label className="field"><span>Calidad</span><select value={qA} onChange={(e) => setQA(e.target.value)}>{QUALITIES.filter((q) => COMMON.includes(q.id)).map((q) => <option key={q.id} value={q.id}>{q.nameEs}</option>)}</select></label>
          <RootSelect value={rootB} onChange={setRootB} label="Segundo acorde: fundamental" />
          <label className="field"><span>Calidad</span><select value={qB} onChange={(e) => setQB(e.target.value)}>{QUALITIES.filter((q) => COMMON.includes(q.id)).map((q) => <option key={q.id} value={q.id}>{q.nameEs}</option>)}</select></label>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: '16px 0 0' }}>
          <legend style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Distribuciones a comparar (elige dos o más)</legend>
          <div className="cluster">{VOICING_STYLES.map((s) => <button key={s.id} className="chip" aria-pressed={styles.includes(s.id)} onClick={() => toggle(s.id)} title={s.hint}>{s.nameEs}</button>)}</div>
        </fieldset>
      </div>

      {styles.length < 2 ? (
        <div className="empty"><h3>Elige al menos dos distribuciones</h3><p>Así podrás comparar notas, registro y movimiento entre voces.</p></div>
      ) : (
        <>
          <div className="card">
            <h2 className="card-title">{sA}: cada distribución</h2>
            <div className="grid-3">
              {A.map(({ s, v }) => (
                <div key={s} className="prog-card" style={{ gap: 8 }}>
                  <b>{label(s).nameEs}</b>
                  <MiniKeyboard notes={v.notes} />
                  <span className="fn">{v.notes.map((n) => formatNote(n, naming)).join(' ')}</span>
                  <span className="fn">Bajo: {formatNote(v.notes[0], naming)} · Registro: {v.notes.length} notas en {span(v.notes)} semitonos</span>
                  <p className="faint" style={{ margin: 0, fontSize: 13 }}>{label(s).hint}</p>
                  <button className="btn btn-sm" onClick={() => hear(v.notes)}><span aria-hidden="true">▶</span> Escuchar</button>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="card-title">Movimiento de {sA} a {sB}</h2>
            <p className="muted">Ordenado de menos a más movimiento. El menor movimiento no siempre es la mejor opción: depende de la melodía, el registro y el estilo.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead><tr><th>Desde</th><th>Hacia</th><th>Semitonos movidos</th><th>Notas comunes</th><th>Voces extremas</th><th>Observaciones</th><th /></tr></thead>
                <tbody>
                  {combos.map((c, i) => (
                    <tr key={`${c.a.s}-${c.b.s}`} style={i === 0 ? { background: 'color-mix(in srgb, var(--ok) 10%, transparent)' } : undefined}>
                      <td>{label(c.a.s).nameEs}</td><td>{label(c.b.s).nameEs}</td>
                      <td className="mono-num"><b>{c.total}</b></td><td className="mono-num">{c.common}</td><td>{c.outer}</td>
                      <td>{c.parallels.length ? c.parallels.join(', ') : i === 0 ? 'La más económica' : '—'}</td>
                      <td><button className="btn btn-sm" onClick={() => hearPair(c.a.v.notes, c.b.v.notes)} aria-label={`Escuchar ${label(c.a.s).nameEs} hacia ${label(c.b.s).nameEs}`}>▶</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="faint">«Quintas/octavas paralelas» se señalan como dato: en armonía clásica se evitan; en jazz y pop son un recurso más.</p>
          </div>
        </>
      )}
    </div>
  )
}
