import { useEffect, useRef, useState } from 'react'
import { panic } from '../../audio/engine'
import { Play, Stop } from '../ui'

const RATES = [0.5, 0.75, 0.9, 1, 1.1, 1.25]
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Reproductor de audio para tocar encima: velocidad sin cambiar el tono y bucle A–B. */
export function AudioPractice({ blob }: { blob: Blob }) {
  const el = useRef<HTMLAudioElement>(null)
  const [url, setUrl] = useState<string>()
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [rate, setRate] = useState(1)
  const [vol, setVol] = useState(0.9)
  const [a, setA] = useState<number | null>(null)
  const [b, setB] = useState<number | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    const u = URL.createObjectURL(blob)
    setUrl(u)
    setErr(''); setA(null); setB(null); setTime(0); setPlaying(false)
    return () => URL.revokeObjectURL(u)
  }, [blob])

  useEffect(() => {
    const a_ = el.current
    if (!a_) return
    a_.playbackRate = rate
    a_.preservesPitch = true
    a_.volume = vol
  }, [rate, vol, url])

  // El bucle A–B se vigila con frecuencia alta para que el corte sea limpio
  useEffect(() => {
    if (!playing || a === null || b === null || b <= a) return
    const id = setInterval(() => {
      const e = el.current
      if (e && e.currentTime >= b) e.currentTime = a
    }, 40)
    return () => clearInterval(id)
  }, [playing, a, b])

  useEffect(() => () => { el.current?.pause() }, [])

  const toggle = async () => {
    const e = el.current
    if (!e) return
    if (e.paused) {
      panic() // corta cualquier nota del piano virtual que siguiera sonando
      try { await e.play() } catch { setErr('El navegador no ha podido reproducir este archivo.') }
    } else e.pause()
  }
  const seek = (t: number) => { if (el.current) { el.current.currentTime = t; setTime(t) } }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <audio
        ref={el} src={url} preload="metadata"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onError={() => setErr('Este navegador no puede reproducir el archivo. Prueba con MP3 o WAV.')}
      />
      {err && <p className="notice err" role="alert">{err}</p>}
      <div className="cluster" style={{ justifyContent: 'space-between' }}>
        <button className="btn btn-primary" onClick={() => void toggle()} aria-pressed={playing} disabled={!!err}>{playing ? <Stop /> : <Play />} {playing ? 'Pausa' : 'Reproducir'}</button>
        <span className="mono-num muted">{fmt(time)} / {fmt(dur)}</span>
      </div>
      <input type="range" min={0} max={Math.max(1, dur)} step={0.1} value={time} onChange={(e) => seek(Number(e.target.value))} aria-label="Posición en el audio" />
      {dur > 0 && a !== null && (
        <div className="bar" aria-hidden="true" style={{ position: 'relative', height: 8 }}>
          <span style={{ position: 'absolute', left: `${(a / dur) * 100}%`, width: `${((b ?? a) - a) / dur * 100}%`, minWidth: 3, background: 'var(--copper)' }} />
        </div>
      )}
      <div className="row">
        <label className="field"><span>Velocidad (el tono se mantiene)</span>
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))}>{RATES.map((r) => <option key={r} value={r}>{Math.round(r * 100)} %{r === 1 ? ' (original)' : ''}</option>)}</select>
        </label>
        <label className="field"><span>Volumen del audio</span><input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(Number(e.target.value))} /></label>
      </div>
      <div className="cluster">
        <button className="btn btn-sm" onClick={() => { setA(time); if (b !== null && b <= time) setB(null) }}>Marcar inicio (A){a !== null ? ` · ${fmt(a)}` : ''}</button>
        <button className="btn btn-sm" onClick={() => { if (a !== null && time > a) setB(time) }} disabled={a === null}>Marcar fin (B){b !== null ? ` · ${fmt(b)}` : ''}</button>
        <button className="btn btn-sm btn-ghost" onClick={() => { setA(null); setB(null) }} disabled={a === null && b === null}>Quitar bucle</button>
        {a !== null && b !== null && <span className="badge ok">Bucle activo</span>}
      </div>
      <p className="faint" style={{ margin: 0 }}>Toca el piano de abajo a la vez que suena la canción. El audio y el piano son independientes.</p>
    </div>
  )
}
