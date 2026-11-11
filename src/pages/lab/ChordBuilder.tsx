import { useEffect, useMemo, useState } from 'react'
import { playSteps } from '../../audio/engine'
import { MiniKeyboard } from '../../components/MiniKeyboard'
import { NoteSpec, RootSelect } from '../../components/pickers'
import { Staff } from '../../components/Staff'
import { useNaming } from '../../components/ui'
import { QUALITIES, inversionName, qualityDef } from '../../music/chords'
import { allowedTensions, customChord, TENSION_LABEL, toggleTension } from '../../music/customChord'
import { formatSymbol } from '../../music/notes'
import { clearMarks, setTargets } from '../../store/piano'

const GROUPS = ['triada', 'séptima', 'suspendido', 'añadido', 'extendido', 'alterado'] as const
const GROUP_LABEL: Record<string, string> = { triada: 'Tríadas', séptima: 'Séptimas', suspendido: 'Suspendidos', añadido: 'Añadidos', extendido: 'Extendidos', alterado: 'Alterados' }

export function ChordBuilder() {
  const naming = useNaming()
  const [root, setRoot] = useState('C')
  const [quality, setQuality] = useState('maj7')
  const [tensions, setTensions] = useState<string[]>([])
  const [inv, setInv] = useState(0)
  const [octave, setOctave] = useState(3)

  const allowed = useMemo(() => allowedTensions(quality), [quality])
  const chord = useMemo(() => customChord(root, quality, tensions, inv, octave), [root, quality, tensions, inv, octave])
  const def = qualityDef(quality)

  useEffect(() => { setTargets(chord.voiced) }, [chord.voiced])
  useEffect(() => () => clearMarks(), [])

  const pickQuality = (q: string) => { setQuality(q); setTensions((t) => t.filter((x) => allowedTensions(q).includes(x))); setInv(0) }
  const play = (arp: boolean) => void playSteps(arp ? [...chord.voiced.map((n) => ({ notes: [n], beats: 0.5 })), { notes: chord.voiced, beats: 2.5 }] : [{ notes: chord.voiced, beats: 3 }], { tempo: 80 })

  return (
    <div className="lab-grid two">
      <div className="card stack" style={{ alignContent: 'start' }}>
        <RootSelect value={root} onChange={setRoot} />
        <label className="field"><span>Calidad</span>
          <select value={quality} onChange={(e) => pickQuality(e.target.value)}>
            {GROUPS.map((g) => (
              <optgroup key={g} label={GROUP_LABEL[g]}>
                {QUALITIES.filter((q) => q.group === g).map((q) => <option key={q.id} value={q.id}>{q.nameEs} · {q.suffix || 'mayor'}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Extensiones y alteraciones compatibles</legend>
          {allowed.length === 0 ? <p className="faint" style={{ margin: 0 }}>Este acorde no admite tensiones añadidas.</p> : (
            <div className="cluster">
              {allowed.map((t) => <button key={t} className="chip" aria-pressed={tensions.includes(t)} onClick={() => setTensions(toggleTension(tensions, t))}>{TENSION_LABEL[t]}</button>)}
            </div>
          )}
          <p className="faint" style={{ fontSize: 13, margin: '8px 0 0' }}>Solo se ofrecen tensiones que no chocan con la 3ª o la 7ª del acorde.</p>
        </fieldset>
        <div className="row">
          <label className="field"><span>Inversión</span>
            <select value={Math.min(inv, chord.voiced.length - 1)} onChange={(e) => setInv(Number(e.target.value))}>
              {chord.voiced.map((_, i) => <option key={i} value={i}>{i === 0 ? 'Fundamental' : `${i}ª`}</option>)}
            </select>
          </label>
          <label className="field"><span>Registro</span>
            <select value={octave} onChange={(e) => setOctave(Number(e.target.value))}>{[2, 3, 4, 5].map((o) => <option key={o} value={o}>Octava {o}</option>)}</select>
          </label>
        </div>
      </div>

      <div className="card stack" style={{ alignContent: 'start' }}>
        <div>
          <div className="big-symbol" aria-live="polite">{formatSymbol(chord.symbol, naming)}</div>
          <p className="muted" style={{ margin: '6px 0 0' }}>{def.nameEs}{tensions.length ? ` con ${tensions.map((t) => TENSION_LABEL[t]).join(', ')}` : ''} · {inversionName(Math.min(inv, chord.voiced.length - 1), chord.voiced.length)}</p>
        </div>
        <NoteSpec notes={chord.voiced} />
        <p className="faint" style={{ margin: 0 }}>Fórmula: {chord.intervals.map((i) => TENSION_LABEL[i] ?? i).join(' · ')}</p>
        <div className="example-vis two">
          <Staff notes={chord.voiced} clef={Number(octave) <= 3 ? 'bass' : 'treble'} chord />
          <MiniKeyboard notes={chord.voiced} />
        </div>
        <div className="cluster">
          <button className="btn btn-primary" onClick={() => play(false)}>Escuchar acorde</button>
          <button className="btn" onClick={() => play(true)}>Escuchar arpegio</button>
        </div>
        <p className="faint" style={{ margin: 0 }}>Las teclas del acorde se iluminan en el piano de abajo: tócalas para comprobar que las encuentras.</p>
      </div>
    </div>
  )
}
