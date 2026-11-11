import { formatNote } from '../music/notes'
import { useNaming } from './ui'

export const ROOTS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']
export const TONICS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']

export function RootSelect({ value, onChange, label = 'Nota fundamental', list = ROOTS }: { value: string; onChange: (v: string) => void; label?: string; list?: string[] }) {
  const naming = useNaming()
  return (
    <label className="field"><span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {list.map((r) => <option key={r} value={r}>{formatNote(r, naming, false)}</option>)}
      </select>
    </label>
  )
}

/** Notas con su nombre en el sistema elegido. */
export function NoteSpec({ notes, intervals }: { notes: string[]; intervals?: string[] }) {
  const naming = useNaming()
  return (
    <div className="note-chips" aria-label="Notas">
      {notes.map((n, i) => (
        <span key={`${n}${i}`} className="note-chip">{formatNote(n, naming, /\d/.test(n))}{intervals && <small>{intervals[i]}</small>}</span>
      ))}
    </div>
  )
}
