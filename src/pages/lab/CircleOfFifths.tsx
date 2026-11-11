import { useEffect, useMemo, useState } from 'react'
import { playSteps } from '../../audio/engine'
import { NoteSpec } from '../../components/pickers'
import { useNaming } from '../../components/ui'
import { chordNotesOct, diatonicChords } from '../../music/chords'
import { formatNote, formatRoman, formatSymbol } from '../../music/notes'
import { CIRCLE, keySignature, scaleNotes, scaleWithOctaves } from '../../music/scales'
import { clearMarks, setTargets } from '../../store/piano'

const CX = 180
const CY = 180

function arc(r1: number, r2: number, a0: number, a1: number) {
  const p = (r: number, a: number) => [CX + r * Math.sin(a), CY - r * Math.cos(a)]
  const [x0, y0] = p(r2, a0), [x1, y1] = p(r2, a1), [x2, y2] = p(r1, a1), [x3, y3] = p(r1, a0)
  return `M${x0} ${y0} A${r2} ${r2} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r1} ${r1} 0 0 0 ${x3} ${y3}Z`
}

export function CircleOfFifths() {
  const naming = useNaming()
  const [sel, setSel] = useState(0)
  const [minor, setMinor] = useState(false)
  const e = CIRCLE[sel]
  const tonic = minor ? e.minor : e.major
  const mode = minor ? 'minor' : 'major'
  const sig = useMemo(() => keySignature(tonic, mode), [tonic, mode])
  const notes = useMemo(() => scaleNotes(tonic, mode), [tonic, mode])
  const chords = useMemo(() => diatonicChords(tonic, minor ? 'harmonic minor' : 'major', 3), [tonic, minor])
  const sevenths = useMemo(() => diatonicChords(tonic, minor ? 'harmonic minor' : 'major', 4), [tonic, minor])
  const seq = useMemo(() => scaleWithOctaves(tonic, mode, 4, true), [tonic, mode])

  useEffect(() => { setTargets(seq) }, [seq])
  useEffect(() => () => clearMarks(), [])

  const choose = (i: number, m: boolean) => { setSel(i); setMinor(m) }
  const key = (i: number, m: boolean) => (ev: React.KeyboardEvent) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choose(i, m) } }
  const sigText = sig.count === 0 ? 'Sin alteraciones' : `${Math.abs(sig.count)} ${sig.count > 0 ? (sig.count === 1 ? 'sostenido' : 'sostenidos') : (sig.count === -1 ? 'bemol' : 'bemoles')}`
  const dominant = CIRCLE[(sel + 1) % 12]
  const subdominant = CIRCLE[(sel + 11) % 12]
  const near = (m: boolean) => (m ? [subdominant.minor, e.minor, dominant.minor] : [subdominant.major, e.major, dominant.major])

  return (
    <div className="lab-grid two">
      <div className="card" style={{ alignSelf: 'start' }}>
        <svg className="circle-svg" viewBox="0 0 360 360" role="group" aria-label="Círculo de quintas. Elige una tonalidad con el ratón o con Tab y Enter." style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }}>
          {CIRCLE.map((c, i) => {
            const a0 = ((i - 0.5) * Math.PI) / 6
            const a1 = ((i + 0.5) * Math.PI) / 6
            const mid = (i * Math.PI) / 6
            const tx = (r: number) => [CX + r * Math.sin(mid), CY - r * Math.cos(mid) + 5]
            const [mx, my] = tx(138)
            const [nx, ny] = tx(88)
            const isMaj = sel === i && !minor
            const isMin = sel === i && minor
            return (
              <g key={c.major}>
                <path className={`seg${isMaj ? ' sel' : ''}${isMin ? ' rel' : ''}`} d={arc(106, 168, a0, a1)} role="button" tabIndex={0} aria-pressed={isMaj} aria-label={`${formatNote(c.major, naming, false)} mayor`} onClick={() => choose(i, false)} onKeyDown={key(i, false)} />
                <text x={mx} y={my} textAnchor="middle" fontSize={16} className={isMaj ? 'sel-text' : ''}>{formatNote(c.major, naming, false)}</text>
                <path className={`seg${isMin ? ' sel' : ''}${isMaj ? ' rel' : ''}`} d={arc(58, 104, a0, a1)} role="button" tabIndex={0} aria-pressed={isMin} aria-label={`${formatNote(c.minor, naming, false)} menor`} onClick={() => choose(i, true)} onKeyDown={key(i, true)} />
                <text x={nx} y={ny} textAnchor="middle" fontSize={12} className={isMin ? 'sel-text' : ''}>{formatNote(c.minor, naming, false)}m</text>
              </g>
            )
          })}
          <circle className="inner" cx={CX} cy={CY} r={54} />
          <text x={CX} y={CY - 4} textAnchor="middle" fontSize={22} style={{ fontFamily: 'var(--serif)' }}>{formatNote(tonic, naming, false)}{minor ? 'm' : ''}</text>
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize={11} style={{ fill: 'var(--ink-3)' }}>{sig.count === 0 ? '0' : `${Math.abs(sig.count)}${sig.count > 0 ? '♯' : '♭'}`}</text>
        </svg>
        <p className="faint" style={{ textAlign: 'center', margin: '8px 0 0' }}>Anillo exterior: mayores. Anillo interior: menores relativas.</p>
      </div>

      <div className="card stack" style={{ alignContent: 'start' }}>
        <div>
          <div className="big-symbol">{formatNote(tonic, naming, false)} {minor ? 'menor' : 'mayor'}</div>
          <p className="muted" style={{ margin: '6px 0 0' }}>{sigText}{sig.accidentals.length ? `: ${sig.accidentals.map((a) => formatNote(a, naming, false)).join(' ')}` : ''} · relativa {minor ? 'mayor' : 'menor'}: {formatNote(minor ? e.major : e.minor, naming, false)}</p>
        </div>
        <div className="cluster" role="group" aria-label="Modo">
          <button className="chip" aria-pressed={!minor} onClick={() => setMinor(false)}>Mayor</button>
          <button className="chip" aria-pressed={minor} onClick={() => setMinor(true)}>Menor</button>
          <button className="btn btn-sm btn-primary" onClick={() => void playSteps(seq.map((n) => ({ notes: [n], beats: 0.5 })), { tempo: 120 })}>Escuchar la escala</button>
        </div>
        <NoteSpec notes={notes} />
        <div>
          <h3 className="serif" style={{ fontSize: 24, marginBottom: 8 }}>Acordes de la tonalidad {minor && <small className="faint" style={{ fontSize: 14, fontFamily: 'var(--sans)' }}>(menor armónica)</small>}</h3>
          <div className="prog-grid">
            {chords.map((c, i) => (
              <button key={c.degree} className={`prog-card fn-${c.fn}`} style={{ textAlign: 'left' }} onClick={() => { const ns = chordNotesOct(c.root, c.quality, 3); setTargets(ns); void playSteps([{ notes: ns, beats: 2.5 }], { tempo: 80, onEnd: () => setTargets(seq) }) }} aria-label={`Escuchar ${formatSymbol(c.symbol, naming)}`}>
                <span className="rom">{formatRoman(c.roman)}</span>
                <span className="sym">{formatSymbol(c.symbol, naming)}</span>
                <span className="fn">{formatSymbol(sevenths[i].symbol, naming)} con séptima</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="serif" style={{ fontSize: 24, marginBottom: 6 }}>Tonalidades vecinas</h3>
          <p className="muted" style={{ margin: 0 }}>Subdominante ({formatNote(near(minor)[0], naming, false)}) · Tónica ({formatNote(near(minor)[1], naming, false)}) · Dominante ({formatNote(near(minor)[2], naming, false)}). Comparten seis de sus siete notas con la tónica: son las modulaciones más naturales.</p>
          <div className="cluster" style={{ marginTop: 8 }}>
            <button className="btn btn-sm" onClick={() => choose((sel + 11) % 12, minor)}>← Subdominante</button>
            <button className="btn btn-sm" onClick={() => choose((sel + 1) % 12, minor)}>Dominante →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
