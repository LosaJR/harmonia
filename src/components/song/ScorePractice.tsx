import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { playScoreEvents, scorePosition, stopPlayback } from '../../audio/engine'
import { formatSymbol } from '../../music/notes'
import { activeAt, barAt, type Score } from '../../songs/score'
import { clearMarks, setMarks, type KeyMark } from '../../store/piano'
import { Play, Stop, useNaming } from '../ui'
import { PianoRoll } from './PianoRoll'

const RATES = [0.5, 0.75, 0.9, 1, 1.1]
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function ScorePractice({ score }: { score: Score }) {
  const naming = useNaming()
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [rate, setRate] = useState(1)
  const [muted, setMuted] = useState<Set<number>>(new Set())
  const [loopOn, setLoopOn] = useState(false)
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(Math.min(4, score.bars.length))
  const posRef = useRef(0)
  const lastMarks = useRef('')
  const run = useRef(0)

  const bars = score.bars
  const loop = useMemo<[number, number] | null>(() => {
    if (!loopOn) return null
    const a = bars[Math.max(0, from - 1)] ?? 0
    const b = bars[Math.min(to, bars.length)] ?? score.duration
    return b > a ? [a, b] : null
  }, [loopOn, from, to, bars, score.duration])

  const events = useMemo(() => score.notes.filter((n) => !muted.has(n.track)).map((n) => ({ t: n.t, d: n.d, midi: n.midi, vel: n.vel })), [score, muted])

  const start = useCallback((at: number) => {
    setPlaying(true)
    const begin = loop && (at < loop[0] || at >= loop[1]) ? loop[0] : at
    posRef.current = begin
    setPos(begin)
    const id = ++run.current
    void playScoreEvents(events, {
      rate, from: begin, loop,
      // solo cuenta el final natural de ESTA reproducción (no el corte por pausa o reinicio)
      onEnd: () => { if (id !== run.current) return; setPlaying(false); posRef.current = 0; setPos(0); clearMarks(); lastMarks.current = '' },
    })
  }, [events, rate, loop])

  /** Ilumina en el piano las notas que suenan en el instante `t`. */
  const showAt = useCallback((t: number, m: Set<number>) => {
    const marks: Record<number, KeyMark> = {}
    activeAt(score, t, m).forEach((n) => { marks[n] = 'target' })
    lastMarks.current = Object.keys(marks).join(',')
    setMarks(marks)
  }, [score])
  // Al pausar, las teclas se quedan iluminadas donde se haya parado la canción
  const pause = useCallback((keepKeys = true) => {
    run.current++
    const at = scorePosition() ?? posRef.current
    stopPlayback()
    setPlaying(false)
    if (keepKeys) { posRef.current = at; setPos(at); showAt(at, muted) } else { clearMarks(); lastMarks.current = '' }
  }, [showAt, muted])
  const stop = () => { pause(false); posRef.current = 0; setPos(0) }

  // Cursor, teclas iluminadas y bucle visual mientras suena
  useEffect(() => {
    if (!playing) return
    const tick = () => {
      const p = scorePosition()
      if (p !== null) {
        posRef.current = p
        setPos(p)
        const act = activeAt(score, p, muted)
        const key = act.join(',')
        if (key !== lastMarks.current) {
          lastMarks.current = key
          const marks: Record<number, KeyMark> = {}
          act.forEach((m) => { marks[m] = 'target' })
          setMarks(marks)
        }
      }
    }
    const id = setInterval(tick, 33)
    return () => clearInterval(id)
  }, [playing, score, muted])

  // Si cambian velocidad, pistas o bucle mientras suena, se relanza desde el punto actual
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (playing) start(posRef.current)
  }, [rate, muted, loop]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { stopPlayback(); clearMarks() }, [])
  // Cambiar de canción (o de patrón) reinicia el reproductor
  useEffect(() => { pause(false); posRef.current = 0; setPos(0); setMuted(new Set()); setLoopOn(false); setFrom(1); setTo(Math.min(4, score.bars.length)) }, [score]) // eslint-disable-line react-hooks/exhaustive-deps

  const seek = (t: number) => { posRef.current = t; setPos(t); if (playing) start(t); else showAt(t, muted) }
  const curBar = barAt(score, pos)
  const curChord = score.chords?.findIndex((c) => pos >= c.t && pos < c.t + c.d) ?? -1
  const toggleTrack = (i: number) => {
    const n = new Set(muted)
    if (n.has(i)) n.delete(i); else n.add(i)
    setMuted(n)
    if (!playing && pos > 0) showAt(posRef.current, n)
  }

  const sections = useMemo(() => {
    if (!score.chords) return []
    const out: { name: string; items: { i: number; symbol: string; t: number }[] }[] = []
    score.chords.forEach((c, i) => {
      const last = out[out.length - 1]
      // una sección nueva empieza cuando cambia su nombre o se reinicia (misma etiqueta no consecutiva)
      const startsNew = !last || (c.section !== last.name) || false
      if (startsNew) out.push({ name: c.section ?? '', items: [] })
      out[out.length - 1].items.push({ i, symbol: c.symbol, t: c.t })
    })
    return out
  }, [score])

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="cluster" style={{ justifyContent: 'space-between' }}>
        <div className="cluster">
          <button className="btn btn-primary" onClick={() => (playing ? pause(true) : start(posRef.current >= score.duration - 0.05 ? 0 : posRef.current))} aria-pressed={playing}>{playing ? <Stop /> : <Play />} {playing ? 'Pausa' : pos > 0.05 ? 'Continuar' : 'Reproducir'}</button>
          <button className="btn" onClick={stop}>Al principio</button>
        </div>
        <span className="mono-num muted" aria-live="off">Compás {curBar + 1} de {bars.length} · {fmt(pos)} / {fmt(score.duration)}</span>
      </div>

      <PianoRoll score={score} pos={pos} muted={muted} loop={loop} onSeek={seek} />
      <input type="range" min={0} max={Math.max(1, Math.round(score.duration * 10))} value={Math.round(pos * 10)} onChange={(e) => seek(Number(e.target.value) / 10)} aria-label="Posición en la canción" />

      <div className="row">
        <label className="field"><span>Velocidad</span>
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))}>
            {RATES.map((r) => <option key={r} value={r}>{Math.round(r * 100)} %{r === 1 ? ' (original)' : ''} · {Math.round(score.tempo * r)} bpm</option>)}
          </select>
        </label>
        <label className="field"><span>Practicar del compás</span>
          <input type="number" min={1} max={bars.length} value={from} onChange={(e) => setFrom(Math.max(1, Math.min(bars.length, Number(e.target.value) || 1)))} />
        </label>
        <label className="field"><span>al compás</span>
          <input type="number" min={from} max={bars.length} value={to} onChange={(e) => setTo(Math.max(from, Math.min(bars.length, Number(e.target.value) || from)))} />
        </label>
        <label className="cluster" style={{ minHeight: 42, alignSelf: 'end' }}><input type="checkbox" checked={loopOn} onChange={(e) => setLoopOn(e.target.checked)} /> Repetir esos compases</label>
      </div>

      {score.tracks.length > 1 && (
        <div>
          <p className="faint" style={{ margin: '0 0 6px' }}>Pistas (silencia una para tocarla tú):</p>
          <div className="cluster">
            {score.tracks.map((t) => (
              <button key={t.id} className="chip" aria-pressed={!muted.has(t.id)} onClick={() => toggleTrack(t.id)}>{muted.has(t.id) ? 'Silenciada · ' : ''}{t.name} <span className="faint">({t.notes})</span></button>
            ))}
          </div>
        </div>
      )}

      {score.chords && (
        <div className="card" style={{ background: 'var(--bg)' }}>
          <h3 className="card-title" style={{ fontSize: 22 }}>Acordes</h3>
          <div className="stack" style={{ gap: 12 }}>
            {sections.map((s, k) => (
              <div key={k}>
                <b className="muted" style={{ fontSize: 14 }}>{s.name}</b>
                <div className="cluster" style={{ marginTop: 6, gap: 6 }}>
                  {s.items.map((it) => (
                    <button key={it.i} className={`chip${curChord === it.i ? ' is-on' : ''}`} style={{ fontFamily: 'var(--serif)', fontSize: 22, minWidth: 56, justifyContent: 'center' }} onClick={() => seek(it.t)} aria-label={`Ir al acorde ${formatSymbol(it.symbol, naming)}`}>{formatSymbol(it.symbol, naming)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {score.warnings?.map((w) => <p key={w} className="notice" role="note">{w}</p>)}
    </div>
  )
}
