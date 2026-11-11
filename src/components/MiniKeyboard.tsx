import { useMemo } from 'react'
import { formatNote } from '../music/notes'
import { toMidi } from '../music/notes'
import { useNaming } from './ui'

const BLACK = new Set([1, 3, 6, 8, 10])

/** Teclado SVG de solo lectura que ilumina un conjunto de notas (con octava). */
export function MiniKeyboard({ notes, from, to, label, showLabels = true }: { notes: string[]; from?: number; to?: number; label?: string; showLabels?: boolean }) {
  const naming = useNaming()
  const midis = useMemo(() => notes.map(toMidi), [notes])
  const lo = from ?? Math.max(24, Math.floor((Math.min(...midis, 60) - 2) / 12) * 12)
  const hi = to ?? Math.max(lo + 12, Math.ceil((Math.max(...midis, 60) + 2) / 12) * 12)
  const whites: number[] = []
  for (let m = lo; m <= hi; m++) if (!BLACK.has(m % 12)) whites.push(m)
  const blackMidis = []
  for (let m = lo; m <= hi; m++) if (BLACK.has(m % 12)) blackMidis.push(m)
  const idxOfWhiteBefore = (m: number) => whites.filter((w) => w < m).length
  const names: Record<number, string> = {}
  notes.forEach((n) => { names[toMidi(n)] = formatNote(n, naming, false) })
  return (
    <svg className="mini-kb" viewBox={`0 0 ${whites.length * 14} 60`} role="img" aria-label={label ?? `Teclado con ${notes.length} notas resaltadas`} preserveAspectRatio="xMidYMid meet">
      {whites.map((m, i) => (
        <g key={m}>
          <rect className={`w${midis.includes(m) ? ' on' : ''}`} x={i * 14 + 0.5} y={0.5} width={13} height={58} rx={2} />
          {showLabels && names[m] && !BLACK.has(m % 12) && <text x={i * 14 + 7} y={52} textAnchor="middle">{names[m]}</text>}
        </g>
      ))}
      {blackMidis.map((m) => (
        <g key={m}>
          <rect className={`b${midis.includes(m) ? ' on' : ''}`} x={idxOfWhiteBefore(m) * 14 - 4.2} y={0.5} width={8.4} height={34} rx={1.6} />
        </g>
      ))}
    </svg>
  )
}
