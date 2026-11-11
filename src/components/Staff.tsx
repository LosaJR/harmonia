import { Note } from '@tonaljs/tonal'
import { toMidi } from '../music/notes'

interface Props { notes: string[]; clef: 'treble' | 'bass'; chord?: boolean; label?: string }

const LETTER_INDEX: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
const diatonic = (n: string) => {
  const p = Note.get(n)
  return LETTER_INDEX[p.letter] + 7 * (p.oct ?? 4)
}
const ACC: Record<string, string> = { '#': '♯', '##': '𝄪', b: '♭', bb: '𝄫' }

/** Pentagrama SVG sencillo: melodía (notas separadas) o acorde (apiladas). */
export function Staff({ notes, clef, chord = false, label }: Props) {
  const BOTTOM = 80
  const STEP = 5
  const dBottom = clef === 'treble' ? 30 : 18 // E4 / G2 en la línea inferior
  const yOf = (d: number) => BOTTOM - (d - dBottom) * STEP
  const items = notes.map((n) => ({ n, d: diatonic(n), acc: Note.get(n).acc, midi: toMidi(n) }))
  const spacing = chord ? 0 : 42
  const width = 70 + (chord ? 70 : items.length * spacing + 16)
  const els: React.ReactNode[] = []

  // notas
  const ordered = chord ? [...items].sort((a, b) => a.d - b.d) : items
  const used = new Set<number>()
  ordered.forEach((it, idx) => {
    const x = chord ? 80 : 70 + idx * spacing + 14
    const y = yOf(it.d)
    const isSecond = chord && ordered.some((o) => o.d === it.d - 1 && !used.has(o.d) && idx > 0 && Math.abs(yOf(o.d) - y) === STEP)
    const nx = isSecond ? x + 11 : x
    if (chord) used.add(it.d)
    // líneas adicionales
    const lines: number[] = []
    for (let d = dBottom - 2; d >= it.d; d -= 2) lines.push(yOf(d))
    for (let d = dBottom + 10; d <= it.d; d += 2) lines.push(yOf(d))
    lines.forEach((ly, k) => els.push(<line key={`l${idx}-${k}`} className="sl" x1={nx - 12} x2={nx + 12} y1={ly} y2={ly} />))
    els.push(
      <g key={`n${idx}`}>
        {it.acc && <text className="acc" x={nx - 26 - (chord ? (idx % 2) * 10 : 0)} y={y + 7}>{ACC[it.acc]}</text>}
        <ellipse className="nh" cx={nx} cy={y} rx={6.4} ry={4.6} transform={`rotate(-18 ${nx} ${y})`} />
        {!chord && <line className="stem" x1={it.d >= (clef === 'treble' ? 34 : 22) ? nx - 6 : nx + 6} x2={it.d >= (clef === 'treble' ? 34 : 22) ? nx - 6 : nx + 6} y1={y} y2={it.d >= (clef === 'treble' ? 34 : 22) ? y + 30 : y - 30} />}
      </g>,
    )
  })
  if (chord && ordered.length) {
    const x = 80
    const top = yOf(ordered[ordered.length - 1].d)
    const bottom = yOf(ordered[0].d)
    els.push(<line key="cs" className="stem" x1={x + 6} x2={x + 6} y1={top - 28} y2={bottom} />)
  }

  return (
    <svg className="staff" viewBox={`0 0 ${Math.max(width, 150)} 126`} role="img" aria-label={label ?? `Pentagrama en clave de ${clef === 'treble' ? 'sol' : 'fa'} con ${notes.length} nota${notes.length === 1 ? '' : 's'}`}>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} className="sl" x1={8} x2={Math.max(width, 150) - 8} y1={BOTTOM - i * 10} y2={BOTTOM - i * 10} />)}
      {clef === 'treble'
        ? <text className="clef" x={14} y={BOTTOM - 12} fontSize={62}>𝄞</text>
        : <text className="clef" x={14} y={BOTTOM - 26} fontSize={52}>𝄢</text>}
      {els}
    </svg>
  )
}
