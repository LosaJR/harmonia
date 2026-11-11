import { useEffect, useMemo, useState } from 'react'
import { playSteps } from '../audio/engine'
import { Piano, PianoToolbar } from '../components/Piano'
import { useLiveLabel } from '../components/PianoDock'
import { Staff } from '../components/Staff'
import { NoteSpec, RootSelect } from '../components/pickers'
import { QUALITIES, buildChord, chordNotesOct, qualityDef } from '../music/chords'
import { SCALE_DEFS, scaleDef, scaleNotes, scaleWithOctaves } from '../music/scales'
import { formatNote } from '../music/notes'
import { clearMarks, setTargets } from '../store/piano'
import { useProgress } from '../store/progress'
import { useNaming } from '../components/ui'

export function PianoPage() {
  const { settings } = useProgress()
  const naming = useNaming()
  const live = useLiveLabel()
  const [mode, setMode] = useState<'chord' | 'scale'>('chord')
  const [root, setRoot] = useState('C')
  const [quality, setQuality] = useState('maj')
  const [scale, setScale] = useState('major')
  const [inv, setInv] = useState(0)

  const lo = (settings.startOctave + 1) * 12
  const hi = lo + settings.octaves * 12
  const chord = useMemo(() => buildChord(root, quality), [root, quality])
  const octave = settings.startOctave + (settings.octaves >= 2 ? 1 : 0)
  const chordNotes = useMemo(() => chordNotesOct(root, quality, octave, Math.min(inv, chord.notes.length - 1)), [root, quality, octave, inv, chord.notes.length])
  const sNotes = useMemo(() => scaleNotes(root, scale), [root, scale])
  const sSeq = useMemo(() => scaleWithOctaves(root, scale, settings.startOctave + 1, true), [root, scale, settings.startOctave])

  useEffect(() => () => clearMarks(), [])
  const show = () => (mode === 'chord' ? setTargets(chordNotes) : setTargets(sNotes, [lo, hi]))
  const listen = () => void playSteps(mode === 'chord' ? [{ notes: chordNotes, beats: 3 }] : sSeq.map((n) => ({ notes: [n], beats: 0.5 })), { tempo: mode === 'chord' ? 80 : 120 })
  // Al cambiar la selección se actualiza el resaltado si ya estaba activo
  const [on, setOn] = useState(false)
  useEffect(() => { if (on) show() }, [on, mode, root, quality, scale, inv, settings.startOctave, settings.octaves]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <header className="page-head">
        <h1>Piano</h1>
        <p>Toca con el ratón, la pantalla táctil, las teclas del ordenador (Z X C V B N M y Q W E R T Y U) o un teclado MIDI. Si pulsas un acorde, Harmonia lo reconoce.</p>
      </header>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="big-symbol" aria-live="polite" style={{ minHeight: '1.1em' }}>{live.main || <span className="faint" style={{ fontSize: 28 }}>Pulsa una o varias teclas</span>}</div>
        <p className="muted" style={{ minHeight: '1.6em', margin: '4px 0 12px' }}>{live.sub}</p>
        <Piano height={230} />
        <PianoToolbar />
      </div>

      <div className="card">
        <h2 className="card-title">Resaltar en el piano</h2>
        <p className="muted">Elige un acorde o una escala para ver sus teclas iluminadas, escucharlo y tocarlo encima.</p>
        <div className="cluster" role="tablist" aria-label="Tipo" style={{ marginBottom: 12 }}>
          <button role="tab" aria-selected={mode === 'chord'} className="chip" aria-pressed={mode === 'chord'} onClick={() => setMode('chord')}>Acorde</button>
          <button role="tab" aria-selected={mode === 'scale'} className="chip" aria-pressed={mode === 'scale'} onClick={() => setMode('scale')}>Escala</button>
        </div>
        <div className="row">
          <RootSelect value={root} onChange={setRoot} />
          {mode === 'chord' ? (
            <>
              <label className="field"><span>Tipo de acorde</span>
                <select value={quality} onChange={(e) => { setQuality(e.target.value); setInv(0) }}>
                  {QUALITIES.map((q) => <option key={q.id} value={q.id}>{q.nameEs} ({q.suffix || 'mayor'})</option>)}
                </select>
              </label>
              <label className="field"><span>Inversión</span>
                <select value={Math.min(inv, chord.notes.length - 1)} onChange={(e) => setInv(Number(e.target.value))}>
                  {chord.notes.map((_, i) => <option key={i} value={i}>{i === 0 ? 'Estado fundamental' : `${i}ª inversión`}</option>)}
                </select>
              </label>
            </>
          ) : (
            <label className="field"><span>Escala</span>
              <select value={scale} onChange={(e) => setScale(e.target.value)}>
                {SCALE_DEFS.map((s) => <option key={s.id} value={s.id}>{s.nameEs}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="cluster" style={{ margin: '16px 0' }}>
          <button className="btn btn-primary" onClick={() => { setOn(true); show() }}>Iluminar teclas</button>
          <button className="btn" onClick={listen}>Escuchar</button>
          <button className="btn btn-ghost" onClick={() => { setOn(false); clearMarks() }}>Quitar resaltado</button>
        </div>
        <p style={{ fontWeight: 600, margin: '0 0 6px' }}>
          {mode === 'chord' ? `${formatChordName(chord.symbol, naming)} · ${qualityDef(quality).nameEs.toLowerCase()}` : `${formatNote(root, naming, false)} · ${scaleDef(scale).nameEs.toLowerCase()}`}
        </p>
        <NoteSpec notes={mode === 'chord' ? chord.notes : sNotes} />
        <div style={{ maxWidth: 560, marginTop: 14 }}>
          <Staff notes={mode === 'chord' ? chordNotes : sSeq} clef="treble" chord={mode === 'chord'} />
        </div>
      </div>
    </div>
  )
}

import { formatSymbol } from '../music/notes'
function formatChordName(s: string, naming: 'latin' | 'intl') { return formatSymbol(s, naming) }
