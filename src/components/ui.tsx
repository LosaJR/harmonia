import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { rich } from '../exercises/rich'
import { formatNote, formatRoman, formatSymbol, type NoteNaming } from '../music/notes'
import { useProgress } from '../store/progress'

export function useNaming(): NoteNaming {
  return useProgress().settings.naming
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })
}

/** Texto en línea con marcas de nota y negrita/cursiva. */
export function Rich({ text }: { text: string }) {
  const naming = useNaming()
  return <>{inline(rich(text, naming))}</>
}

/** Párrafos y listas con «- ». */
export function Prose({ body }: { body: string }) {
  const naming = useNaming()
  const paras = body.split(/\n\n/)
  return (
    <div className="prose">
      {paras.map((p, i) => {
        const lines = p.split('\n')
        if (lines.every((l) => l.startsWith('- '))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(rich(l.slice(2), naming))}</li>)}</ul>
        }
        if (lines.length > 1 && lines.slice(1).every((l) => /^(\d+\.|- )/.test(l)) && /^(\d+\.|- )/.test(lines[0])) {
          const ordered = /^\d+\./.test(lines[0])
          const Tag = ordered ? 'ol' : 'ul'
          return <Tag key={i} style={ordered ? { paddingLeft: '1.4em' } : undefined}>{lines.map((l, j) => <li key={j}>{inline(rich(l.replace(/^(\d+\.\s|- )/, ''), naming))}</li>)}</Tag>
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(rich(l, naming))}</Fragment>)}</p>
      })}
    </div>
  )
}

export function NoteName({ n, octave = true }: { n: string; octave?: boolean }) {
  return <>{formatNote(n, useNaming(), octave)}</>
}
export function Sym({ s }: { s: string }) {
  return <>{formatSymbol(s, useNaming())}</>
}
export function Roman({ r }: { r: string }) {
  return <>{formatRoman(r)}</>
}

export function useToast(): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2600)
    return () => clearTimeout(t)
  }, [msg])
  return [msg ? <div className="toast" role="status">{msg}</div> : null, setMsg]
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} style={color ? ({ '--lvc': color } as React.CSSProperties) : undefined}>
      <span style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  )
}

export const Play = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="currentColor" /></svg>
)
export const Stop = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="2.5" width="9" height="9" rx="1.5" fill="currentColor" /></svg>
)
