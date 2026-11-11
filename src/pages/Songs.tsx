import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AudioPractice } from '../components/song/AudioPractice'
import { ScorePractice } from '../components/song/ScorePractice'
import { useToast } from '../components/ui'
import { BUILTIN_SONGS } from '../songs/builtin'
import { chartToScore, PATTERNS, type AccompanimentPattern } from '../songs/chart'
import { addSong, deleteSong, getSong, listSongs, persistent, type SongRecord } from '../songs/db'
import { ACCEPT, classify, importFile, MAX_AUDIO, MAX_SCORE } from '../songs/import'
import { ImportError } from '../songs/score'

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

function useSongs() {
  const [songs, setSongs] = useState<SongRecord[] | null>(null)
  const reload = useCallback(() => { void listSongs().then(setSongs) }, [])
  useEffect(reload, [reload])
  return { songs, reload }
}

function AddSong({ onAdded }: { onAdded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const pick = (f: File | undefined) => {
    setError('')
    if (!f) return
    const kind = classify(f.name)
    if (kind === 'image' || kind === 'unknown') {
      setFile(null)
      void importFile(f).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Archivo no admitido.'))
      return
    }
    setFile(f)
    setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim())
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setBusy(true); setError('')
    try {
      const rec = await importFile(file, { title, artist })
      await addSong(rec)
      setFile(null); setTitle(''); setArtist('')
      if (input.current) input.current.value = ''
      onAdded()
    } catch (err) {
      setError(err instanceof ImportError || err instanceof Error ? err.message : 'No se ha podido añadir la canción.')
    } finally { setBusy(false) }
  }

  return (
    <form className="card stack" onSubmit={(e) => void submit(e)} aria-labelledby="add-h">
      <h2 id="add-h" className="card-title">Añadir canción</h2>
      <div
        className="empty" style={{ padding: 22, borderColor: drag ? 'var(--copper)' : undefined, background: drag ? 'color-mix(in srgb, var(--copper) 8%, transparent)' : undefined }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
      >
        <p style={{ margin: '0 0 10px' }}>{file ? <b>{file.name} · {fmtSize(file.size)}</b> : 'Arrastra aquí un archivo o elige uno.'}</p>
        <label className="btn" style={{ cursor: 'pointer' }}>Elegir archivo
          <input ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        <p className="faint" style={{ margin: '12px 0 0', fontSize: 14 }}>
          <b>Audio</b> (MP3, WAV, OGG, M4A…, hasta {MAX_AUDIO / 1048576} MB): suena tal cual y puedes tocar encima.<br />
          <b>Partitura</b> (MIDI, MusicXML, MXL, hasta {MAX_SCORE / 1048576} MB): Harmonia la convierte en sonido con su piano y la muestra como rollo de piano.
        </p>
      </div>
      {file && (
        <div className="row">
          <label className="field"><span>Título</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required /></label>
          <label className="field"><span>Artista (opcional)</span><input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} maxLength={100} /></label>
        </div>
      )}
      {error && <p className="notice err" role="alert">{error}</p>}
      <div className="cluster">
        <button className="btn btn-primary" type="submit" disabled={!file || busy}>{busy ? 'Procesando…' : 'Añadir a mi biblioteca'}</button>
      </div>
      <p className="faint" style={{ margin: 0, fontSize: 14 }}>Tus archivos se quedan en este navegador: no se suben a ningún servidor. Usa solo material que tengas derecho a utilizar para practicar.{!persistent && ' Atención: este navegador no permite guardar archivos y se perderán al cerrar la página.'}</p>
    </form>
  )
}

export function Songs() {
  const { songs, reload } = useSongs()
  const [toast, say] = useToast()
  const [confirm, setConfirm] = useState<string | null>(null)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Canciones</h1>
        <p>Practica con canciones: añade una grabación de piano en MP3 para tocar encima, o una partitura en MIDI o MusicXML para que Harmonia la haga sonar con su piano, a la velocidad que quieras.</p>
      </header>

      <section aria-labelledby="lib-h" className="stack" style={{ gap: 14 }}>
        <h2 id="lib-h" className="section-title" style={{ marginBottom: 0 }}>Biblioteca</h2>
        {BUILTIN_SONGS.map((s) => (
          <Link key={s.id} to={`/canciones/${s.id}`} className="card" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span><b style={{ fontSize: 20 }}>{s.title}</b><br /><span className="muted">{s.artist}</span></span>
            <span className="cluster"><span className="badge">Incluida</span><span className="badge">Esquema de acordes</span><span className="badge">{s.chart.tempo} bpm</span></span>
          </Link>
        ))}
        {songs === null && <p className="faint">Cargando tu biblioteca…</p>}
        {songs?.map((s) => (
          <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to={`/canciones/${s.id}`} style={{ textDecoration: 'none', flex: '1 1 240px', minWidth: 0 }}>
              <b style={{ fontSize: 20 }}>{s.title}</b><br /><span className="muted">{s.artist || s.fileName}</span>
            </Link>
            <span className="cluster">
              <span className="badge">{s.kind === 'audio' ? 'Audio' : 'Partitura'}</span>
              <span className="badge">{s.kind === 'audio' ? fmtSize(s.size) : `${s.score!.notes.length} notas · ${fmtDur(s.score!.duration)}`}</span>
              {confirm === s.id ? (
                <>
                  <button className="btn btn-sm btn-danger" onClick={() => { void deleteSong(s.id).then(() => { setConfirm(null); reload(); say('Canción eliminada') }) }}>Sí, borrar</button>
                  <button className="btn btn-sm" onClick={() => setConfirm(null)}>Cancelar</button>
                </>
              ) : <button className="btn btn-sm btn-ghost" onClick={() => setConfirm(s.id)} aria-label={`Eliminar ${s.title}`}>Eliminar</button>}
            </span>
          </div>
        ))}
        {songs?.length === 0 && (
          <div className="empty"><h3>Todavía no has añadido canciones</h3><p>Usa el formulario de abajo para subir un MP3 o una partitura MIDI/MusicXML.</p></div>
        )}
      </section>

      <section className="section-gap"><AddSong onAdded={() => { reload(); say('Canción añadida') }} /></section>
      {toast}
    </div>
  )
}

export function SongPage() {
  const { songId = '' } = useParams()
  const builtin = BUILTIN_SONGS.find((s) => s.id === songId)
  const [rec, setRec] = useState<SongRecord | null | undefined>(builtin ? null : undefined)
  const [pattern, setPattern] = useState<AccompanimentPattern>('block')

  useEffect(() => {
    if (builtin) { setRec(null); return }
    setRec(undefined)
    void getSong(songId).then((r) => setRec(r ?? null))
  }, [songId, builtin])

  const chartScore = useMemo(() => (builtin ? chartToScore(builtin.chart, pattern, builtin.title) : null), [builtin, pattern])

  if (!builtin && rec === undefined) return <div className="page page-narrow"><p className="faint">Cargando canción…</p></div>
  if (!builtin && !rec) {
    return <div className="page page-narrow"><div className="empty"><h3>No encuentro esa canción</h3><p>Puede que la hayas eliminado, o que se añadiera en otro navegador u ordenador: la biblioteca es local.</p><Link className="btn btn-primary" to="/canciones">Ir a Canciones</Link></div></div>
  }
  const title = builtin?.title ?? rec!.title
  const artist = builtin?.artist ?? rec!.artist

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <nav className="crumbs" aria-label="Ruta" style={{ ['--lvc' as string]: 'var(--copper)' }}><Link to="/canciones">Canciones</Link><span aria-hidden="true">/</span><span>{title}</span></nav>
      <header className="page-head" style={{ marginBottom: 18 }}>
        <h1>{title}</h1>
        {artist && <p style={{ marginTop: 4 }}>{artist}</p>}
      </header>
      {builtin && <p className="notice" role="note" style={{ marginBottom: 20 }}>{builtin.note}</p>}

      {builtin && chartScore && (
        <>
          <div className="cluster" role="group" aria-label="Acompañamiento" style={{ marginBottom: 16 }}>
            <b>Acompañamiento:</b>
            {PATTERNS.map((p) => <button key={p.id} className="chip" aria-pressed={pattern === p.id} onClick={() => setPattern(p.id)} title={p.hint}>{p.label}</button>)}
          </div>
          <ScorePractice score={chartScore} />
        </>
      )}
      {rec?.kind === 'score' && rec.score && <ScorePractice score={rec.score} />}
      {rec?.kind === 'audio' && rec.blob && <AudioPractice blob={rec.blob} />}
    </div>
  )
}
