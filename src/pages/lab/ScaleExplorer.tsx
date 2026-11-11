import { useEffect, useMemo, useState } from 'react'
import { Interval } from '@tonaljs/tonal'
import { playSteps } from '../../audio/engine'
import { MiniKeyboard } from '../../components/MiniKeyboard'
import { NoteSpec, RootSelect } from '../../components/pickers'
import { Staff } from '../../components/Staff'
import { useNaming } from '../../components/ui'
import { chordNotesOct, diatonicChords, type DiatonicChord } from '../../music/chords'
import { formatNote, formatRoman, formatSymbol, intervalNameEs } from '../../music/notes'
import { DEGREE_NAMES_ES, SCALE_DEFS, scaleDef, scaleNotes, scaleWithOctaves } from '../../music/scales'
import { clearMarks, setTargets } from '../../store/piano'

export function ScaleExplorer() {
  const naming = useNaming()
  const [tonic, setTonic] = useState('D')
  const [id, setId] = useState('major')
  const [size, setSize] = useState<3 | 4>(3)
  const def = scaleDef(id)
  const notes = useMemo(() => scaleNotes(tonic, id), [tonic, id])
  const seq = useMemo(() => scaleWithOctaves(tonic, id, 4, true), [tonic, id])
  const steps = useMemo(() => {
    const semis = seq.map((n) => Interval.semitones(Interval.distance(seq[0], n)) ?? 0)
    return semis.slice(1).map((s, i) => s - semis[i])
  }, [seq])
  const chords: DiatonicChord[] | null = useMemo(() => {
    try { return diatonicChords(tonic, id, size) } catch { return null }
  }, [tonic, id, size])

  useEffect(() => { setTargets(seq) }, [seq])
  useEffect(() => () => clearMarks(), [])

  const play = (desc: boolean) => {
    const s = (desc ? [...seq].reverse() : seq).map((n) => ({ notes: [n], beats: 0.5 }))
    void playSteps(s, { tempo: 120, onStep: (i) => setTargets(s[i].notes), onEnd: () => setTargets(seq) })
  }
  const playChord = (c: DiatonicChord) => {
    const ns = chordNotesOct(c.root, c.quality, 3)
    setTargets(ns)
    void playSteps([{ notes: ns, beats: 2.5 }], { tempo: 80, onEnd: () => setTargets(seq) })
  }
  const stepName = (s: number) => (s === 1 ? 'st' : s === 2 ? 'T' : s === 3 ? 'T+st' : `${s}st`)

  return (
    <div className="lab-grid two">
      <div className="card stack" style={{ alignContent: 'start' }}>
        <RootSelect value={tonic} onChange={setTonic} label="Tónica" />
        <label className="field"><span>Tipo de escala</span>
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {['diatónica', 'menor', 'modo', 'pentatónica', 'simétrica', 'jazz'].map((g) => (
              <optgroup key={g} label={g[0].toUpperCase() + g.slice(1)}>{SCALE_DEFS.filter((s) => s.group === g).map((s) => <option key={s.id} value={s.id}>{s.nameEs}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <div className="cluster">
          <button className="btn btn-primary" onClick={() => play(false)}>Ascendente</button>
          <button className="btn" onClick={() => play(true)}>Descendente</button>
        </div>
        <p className="faint" style={{ margin: 0 }}>Fórmula: {steps.map(stepName).join(' – ')}</p>
      </div>

      <div className="card stack" style={{ alignContent: 'start' }}>
        <div>
          <div className="big-symbol">{formatNote(tonic, naming, false)} <span style={{ fontSize: '0.5em', color: 'var(--ink-2)' }}>{def.nameEs.toLowerCase()}</span></div>
        </div>
        <NoteSpec notes={notes} intervals={def.intervals} />
        <div className="example-vis two">
          <Staff notes={seq} clef="treble" />
          <MiniKeyboard notes={seq} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Grado</th>{notes.map((_, i) => <th key={i}>{i + 1}º</th>)}</tr></thead>
            <tbody>
              <tr><th>Nota</th>{notes.map((n, i) => <td key={i}><b>{formatNote(n, naming, false)}</b></td>)}</tr>
              <tr><th>Intervalo</th>{def.intervals.map((iv, i) => <td key={i} title={intervalNameEs(iv)}>{iv}</td>)}</tr>
              {notes.length === 7 && <tr><th>Nombre</th>{notes.map((_, i) => <td key={i} className="faint" style={{ fontSize: 12 }}>{DEGREE_NAMES_ES[i]}</td>)}</tr>}
            </tbody>
          </table>
        </div>
        <div>
          <div className="cluster" style={{ justifyContent: 'space-between' }}>
            <h3 className="serif" style={{ fontSize: 26 }}>Acordes diatónicos</h3>
            <div className="cluster" role="group" aria-label="Tipo de acorde">
              <button className="chip" aria-pressed={size === 3} onClick={() => setSize(3)}>Tríadas</button>
              <button className="chip" aria-pressed={size === 4} onClick={() => setSize(4)}>Séptimas</button>
            </div>
          </div>
          {chords ? (
            <div className="prog-grid" style={{ marginTop: 10 }}>
              {chords.map((c) => (
                <button key={c.degree} className={`prog-card fn-${c.fn}`} onClick={() => playChord(c)} style={{ textAlign: 'left' }} aria-label={`Escuchar ${formatSymbol(c.symbol, naming)}`}>
                  <span className="rom">{id === 'major' || id === 'minor' || id === 'harmonic minor' || id === 'melodic minor' ? formatRoman(c.roman) : `${c.degree}º grado`}</span>
                  <span className="sym">{formatSymbol(c.symbol, naming)}</span>
                  <span className="fn">{c.notes.map((n) => formatNote(n, naming, false)).join(' ')}</span>
                </button>
              ))}
            </div>
          ) : <p className="notice">Esta escala no tiene siete notas, así que no se armoniza por terceras de forma directa.</p>}
        </div>
      </div>
    </div>
  )
}
