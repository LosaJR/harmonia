import { useEffect, useMemo, useRef, useState } from 'react'
import { Interval } from '@tonaljs/tonal'
import { playSteps, stopPlayback } from '../../audio/engine'
import { TONICS } from '../../components/pickers'
import { Play, Stop, useNaming, useToast } from '../../components/ui'
import { diatonicChords, inversionName, resolveRoman, type Key } from '../../music/chords'
import { formatNote, formatRoman, formatSymbol, intervalNameEs } from '../../music/notes'
import { progressionSteps, type VoicingMode } from '../../music/playback'
import { buildProgression, PRESETS, presetItems, type ProgressionItem } from '../../music/progressions'
import { clearMarks, setTargets } from '../../store/piano'
import { deleteProgression, saveProgression, useProgress, type SavedProgression } from '../../store/progress'

const BORROWED = ['bII7', 'bIII', 'iv', 'bVI', 'bVII', 'bVII7']
const SECONDARY = ['V7/ii', 'V7/iii', 'V7/IV', 'V7/V', 'V7/vi', 'vii°7/V']
const BEAT_OPTIONS = [1, 2, 3, 4, 6, 8]

const uid = () => `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`

export function ProgressionBuilder() {
  const naming = useNaming()
  const { progressions } = useProgress()
  const [toast, say] = useToast()
  const [key, setKey] = useState<Key>({ tonic: 'C', mode: 'major' })
  const [items, setItems] = useState<ProgressionItem[]>([{ roman: 'ii7', beats: 4 }, { roman: 'V7', beats: 4 }, { roman: 'Imaj7', beats: 4 }])
  const [tempo, setTempo] = useState(90)
  const [vmode, setVmode] = useState<VoicingMode>('smooth')
  const [bass, setBass] = useState(true)
  const [loop, setLoop] = useState(false)
  const [sevenths, setSevenths] = useState(true)
  const [name, setName] = useState('Mi progresión')
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [playing, setPlaying] = useState<number | null>(null)
  const [custom, setCustom] = useState('')
  const [customErr, setCustomErr] = useState('')

  const chords = useMemo(() => {
    try { return buildProgression(items, key) } catch { return [] }
  }, [items, key])
  const steps = useMemo(() => progressionSteps(chords, vmode, bass), [chords, vmode, bass])
  const diatonic = useMemo(() => diatonicChords(key.tonic, key.mode === 'major' ? 'major' : 'harmonic minor', sevenths ? 4 : 3), [key, sevenths])
  const totalBeats = items.reduce((s, i) => s + i.beats, 0)

  useEffect(() => () => { stopPlayback(); clearMarks() }, [])

  // Si cambia la progresión mientras suena, se detiene para no desincronizar
  const stop = () => { stopPlayback(); setPlaying(null); clearMarks() }
  useEffect(() => { if (playing !== null) stop() }, [items, key, vmode, bass]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = (bpm: number) => {
    if (!steps.length) return
    setPlaying(0)
    void playSteps(steps, {
      tempo: bpm,
      loop,
      onStep: (i) => { setPlaying(i); setTargets(steps[i].notes) },
      onEnd: () => { setPlaying(null); clearMarks() },
    })
  }
  const play = () => { if (playing !== null) stop(); else start(tempo) }
  // El tempo se aplica al instante: si está sonando, se relanza con el nuevo valor
  const firstTempo = useRef(true)
  useEffect(() => {
    if (firstTempo.current) { firstTempo.current = false; return }
    if (playing !== null) start(tempo)
  }, [tempo]) // eslint-disable-line react-hooks/exhaustive-deps
  const playOne = (i: number) => {
    stop()
    setTargets(steps[i].notes)
    void playSteps([{ ...steps[i], beats: 2 }], { tempo, onEnd: () => clearMarks() })
  }
  const add = (roman: string) => { setItems((it) => [...it, { roman, beats: 4 }]) }
  const addCustom = () => {
    const r = custom.trim().replace(/^♭/, 'b').replace(/^♯/, '#')
    if (!r) return
    try {
      resolveRoman(r, key)
      add(r)
      setCustom('')
      setCustomErr('')
    } catch {
      setCustomErr('No entiendo ese número romano. Ejemplos válidos: V7, ii7, bVII, iv, V7/vi, viiø7, Imaj7, IVsus4.')
    }
  }
  const update = (i: number, patch: Partial<ProgressionItem>) => setItems((it) => it.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  const move = (i: number, d: number) => setItems((it) => { const j = i + d; if (j < 0 || j >= it.length) return it; const c = [...it]; [c[i], c[j]] = [c[j], c[i]]; return c })
  const remove = (i: number) => setItems((it) => it.filter((_, k) => k !== i))

  const loadPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    setKey((k) => ({ tonic: p.mode === k.mode ? k.tonic : (p.mode === 'minor' ? 'A' : 'C'), mode: p.mode }))
    setItems(presetItems(p, 4))
    setName(p.name)
    setCurrentId(null)
  }
  const transpose = (to: string) => {
    const iv = Interval.distance(key.tonic, to)
    setKey({ ...key, tonic: to })
    say(`Transpuesta a ${formatNote(to, naming, false)} (${iv === '1P' ? 'sin cambio' : `${intervalNameEs(iv)} ascendente`})`)
  }
  const save = (asNew: boolean) => {
    const id = !asNew && currentId ? currentId : uid()
    const p: SavedProgression = { id, name: name.trim() || 'Sin título', key, items, tempo, createdAt: progressions.find((x) => x.id === id)?.createdAt ?? Date.now(), updatedAt: Date.now() }
    saveProgression(p)
    setCurrentId(id)
    say(asNew || !currentId ? 'Progresión guardada' : 'Cambios guardados')
  }
  const load = (p: SavedProgression) => { setKey(p.key); setItems(p.items); setTempo(p.tempo); setName(p.name); setCurrentId(p.id); say(`Cargada «${p.name}»`) }

  const tonics = key.mode === 'major' ? TONICS : ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D', 'G', 'C', 'F', 'Bb', 'Eb']

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="card">
        <div className="row">
          <label className="field"><span>Tonalidad</span>
            <select value={key.tonic} onChange={(e) => transpose(e.target.value)} aria-label="Tonalidad (al cambiarla se transpone la progresión)">
              {tonics.map((t) => <option key={t} value={t}>{formatNote(t, naming, false)}</option>)}
            </select>
          </label>
          <label className="field"><span>Modo</span>
            <select value={key.mode} onChange={(e) => setKey({ tonic: e.target.value === 'minor' ? 'A' : 'C', mode: e.target.value as 'major' | 'minor' })}>
              <option value="major">Mayor</option><option value="minor">Menor</option>
            </select>
          </label>
          <label className="field"><span>Progresión predefinida</span>
            <select value="" onChange={(e) => loadPreset(e.target.value)}>
              <option value="">Elegir…</option>
              {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Tempo: {tempo} bpm</span>
            <input type="range" min={40} max={200} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} aria-label="Tempo en pulsos por minuto" />
          </label>
        </div>
        <p className="faint" style={{ margin: '10px 0 0' }}>Cambiar la tonalidad transpone toda la progresión: los acordes se guardan como grados.</p>
      </div>

      <div className="card">
        <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 className="card-title" style={{ margin: 0 }}>Progresión · {items.length} acordes · {totalBeats} pulsos</h2>
          <div className="cluster">
            <button className="btn btn-primary" onClick={play} disabled={!items.length} aria-pressed={playing !== null}>{playing !== null ? <Stop /> : <Play />} {playing !== null ? 'Detener' : 'Reproducir'}</button>
            <label className="cluster"><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Repetir</label>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="empty"><h3>La progresión está vacía</h3><p>Añade acordes con los botones de abajo o carga una progresión predefinida.</p></div>
        ) : (
          <ol className="prog-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((it, i) => {
              const c = chords[i]
              if (!c) return null
              return (
                <li key={i} className={`prog-card fn-${c.fnCode}${playing === i ? ' playing' : ''}`}>
                  <span className="rom">{formatRoman(c.roman)}</span>
                  <span className="sym">{formatSymbol(c.symbol, naming)}</span>
                  <span className="fn">{c.fn}</span>
                  <div className="cluster" style={{ gap: 6 }}>
                    <label className="sr-only" htmlFor={`b${i}`}>Pulsos del acorde {i + 1}</label>
                    <select id={`b${i}`} value={it.beats} onChange={(e) => update(i, { beats: Number(e.target.value) })} style={{ minHeight: 30, padding: '2px 6px', width: 'auto' }} title="Pulsos">
                      {BEAT_OPTIONS.map((b) => <option key={b} value={b}>{b} p.</option>)}
                    </select>
                    {vmode === 'inversion' && (
                      <>
                        <label className="sr-only" htmlFor={`i${i}`}>Inversión del acorde {i + 1}</label>
                        <select id={`i${i}`} value={Math.min(it.inversion ?? 0, c.notes.length - 1)} onChange={(e) => update(i, { inversion: Number(e.target.value) })} style={{ minHeight: 30, padding: '2px 6px', width: 'auto' }} title={inversionName(it.inversion ?? 0, c.notes.length)}>
                          {c.notes.map((_, k) => <option key={k} value={k}>{k === 0 ? 'Fund.' : `${k}ª inv.`}</option>)}
                        </select>
                      </>
                    )}
                  </div>
                  <div className="tools">
                    <button className="tool" onClick={() => playOne(i)} aria-label={`Escuchar ${c.symbol}`} title="Escuchar"><Play /></button>
                    <button className="tool" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda" title="Mover antes">←</button>
                    <button className="tool" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Mover a la derecha" title="Mover después">→</button>
                    <button className="tool" onClick={() => remove(i)} aria-label="Eliminar acorde" title="Eliminar">✕</button>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
        <div className="cluster" style={{ marginTop: 14 }}>
          <label className="field" style={{ flex: '0 0 auto' }}><span>Distribución</span>
            <select value={vmode} onChange={(e) => setVmode(e.target.value as VoicingMode)}>
              <option value="smooth">Conducción suave de voces</option>
              <option value="inversion">Según la inversión elegida</option>
            </select>
          </label>
          <label className="cluster" style={{ alignSelf: 'end', minHeight: 42 }}><input type="checkbox" checked={bass} onChange={(e) => setBass(e.target.checked)} /> Añadir bajo</label>
          {items.length > 0 && <button className="btn btn-ghost" style={{ alignSelf: 'end' }} onClick={() => setItems([])}>Vaciar</button>}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Añadir acordes</h2>
        <div className="cluster" style={{ marginBottom: 8 }}>
          <b>De la tonalidad</b>
          <label className="cluster"><input type="checkbox" checked={sevenths} onChange={(e) => setSevenths(e.target.checked)} /> con séptimas</label>
        </div>
        <div className="cluster">
          {diatonic.map((d) => <button key={d.roman} className="chip" onClick={() => add(d.roman)}>{formatRoman(d.roman)} <span className="faint">{formatSymbol(d.symbol, naming)}</span></button>)}
          {key.mode === 'minor' && <button className="chip" onClick={() => add(sevenths ? 'V7' : 'V')}>{sevenths ? 'V7' : 'V'} <span className="faint">dominante mayor</span></button>}
        </div>
        <div className="cluster" style={{ margin: '14px 0 8px' }}><b>Dominantes secundarias</b></div>
        <div className="cluster">{SECONDARY.map((r) => { let sym = ''; try { sym = resolveRoman(r, key).symbol } catch { /* ignore */ } return <button key={r} className="chip" onClick={() => add(r)}>{formatRoman(r)} <span className="faint">{formatSymbol(sym, naming)}</span></button> })}</div>
        <div className="cluster" style={{ margin: '14px 0 8px' }}><b>Prestados y cromáticos</b></div>
        <div className="cluster">{BORROWED.map((r) => { let sym = ''; try { sym = resolveRoman(r, key).symbol } catch { /* ignore */ } return <button key={r} className="chip" onClick={() => add(r)}>{formatRoman(r)} <span className="faint">{formatSymbol(sym, naming)}</span></button> })}</div>
        <div className="row" style={{ marginTop: 16 }}>
          <label className="field"><span>Escribir un número romano</span>
            <input type="text" value={custom} onChange={(e) => { setCustom(e.target.value); setCustomErr('') }} onKeyDown={(e) => { if (e.key === 'Enter') addCustom() }} placeholder="Por ejemplo: IVmaj7, bVI, V7/vi" aria-invalid={!!customErr} aria-describedby="custom-err" />
          </label>
          <button className="btn" onClick={addCustom} style={{ flex: '0 0 auto' }}>Añadir</button>
        </div>
        {customErr && <p id="custom-err" className="notice err" role="alert" style={{ marginTop: 10 }}>{customErr}</p>}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">Guardar</h2>
          <div className="row">
            <label className="field"><span>Nombre</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>
          </div>
          <div className="cluster" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => save(false)} disabled={!items.length}>{currentId ? 'Guardar cambios' : 'Guardar progresión'}</button>
            {currentId && <button className="btn" onClick={() => save(true)} disabled={!items.length}>Guardar como nueva</button>}
            {currentId && <button className="btn btn-ghost" onClick={() => { setCurrentId(null); say('Ahora trabajas en una copia sin guardar') }}>Desvincular</button>}
          </div>
          {currentId && <p className="faint" style={{ marginBottom: 0 }}>Editando una progresión guardada.</p>}
        </div>
        <div className="card">
          <h2 className="card-title">Mis progresiones</h2>
          {progressions.length === 0 ? (
            <div className="empty" style={{ padding: 18 }}><h3>Aún no has guardado ninguna</h3><p>Compón arriba y pulsa «Guardar progresión».</p></div>
          ) : (
            <ul className="list">
              {progressions.map((p) => (
                <li key={p.id}>
                  <span style={{ minWidth: 0 }}><b>{p.name}</b><br /><span className="faint" style={{ fontSize: 13 }}>{formatNote(p.key.tonic, naming, false)} {p.key.mode === 'major' ? 'mayor' : 'menor'} · {p.items.length} acordes · {p.tempo} bpm</span></span>
                  <span className="cluster">
                    <button className="btn btn-sm" onClick={() => load(p)} aria-pressed={currentId === p.id}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => { deleteProgression(p.id); if (currentId === p.id) setCurrentId(null); say('Progresión eliminada') }} aria-label={`Eliminar ${p.name}`}>Borrar</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {toast}
    </div>
  )
}
