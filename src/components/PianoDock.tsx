import { useEffect, useMemo, useRef, useState } from 'react'
import { detectChord, inversionName, qualityDef } from '../music/chords'
import { formatNote, formatSymbol, intervalNameEs, midiToName } from '../music/notes'
import { Interval } from '@tonaljs/tonal'
import { usePiano } from '../store/piano'
import { Piano, PianoToolbar } from './Piano'
import { useNaming } from './ui'

/** Etiqueta en vivo: notas, intervalo o acorde reconocido a partir de las teclas pulsadas. */
export function useLiveLabel(): { main: string; sub?: string } {
  const { down } = usePiano()
  const naming = useNaming()
  return useMemo(() => {
    if (!down.length) return { main: '' }
    const sorted = [...down].sort((a, b) => a - b)
    const names = sorted.map((m) => midiToName(m))
    if (sorted.length === 1) return { main: formatNote(names[0], naming) }
    if (sorted.length === 2) {
      const i = Interval.distance(names[0], names[1])
      const nm = intervalNameEs(i)
      return { main: names.map((n) => formatNote(n, naming)).join(' + '), sub: sorted[1] - sorted[0] === 0 ? undefined : nm }
    }
    const det = detectChord(names, false)
    if (det) {
      const q = qualityDef(det.quality)
      const n = q.intervals.length
      return { main: formatSymbol(det.symbol, naming), sub: `${q.nameEs.toLowerCase()} · ${inversionName(det.inversion, n)}` }
    }
    return { main: names.map((n) => formatNote(n, naming, false)).join(' – '), sub: 'Sin nombre de acorde común' }
  }, [down, naming])
}

export function PianoDock() {
  const ref = useRef<HTMLElement>(null)
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  const live = useLiveLabel()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const set = () => document.documentElement.style.setProperty('--dock-h', `${el.offsetHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => { ro.disconnect(); document.documentElement.style.setProperty('--dock-h', '0px') }
  }, [])
  return (
    <aside ref={ref} className={`dock${collapsed ? ' is-collapsed' : ''}`} aria-label="Piano virtual">
      <div className="dock-inner">
        <div className="dock-handle">
          <div className="live" aria-live="polite">{live.main}{live.sub && <small className="faint" style={{ fontFamily: 'var(--sans)', fontSize: 13, marginLeft: 10 }}>{live.sub}</small>}{!live.main && <span className="faint" style={{ fontFamily: 'var(--sans)', fontSize: 14 }}>Toca el piano: ratón, pantalla táctil o teclado del ordenador</span>}</div>
          <button className="btn btn-sm btn-ghost" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed}>{collapsed ? 'Mostrar piano' : 'Ocultar'}</button>
        </div>
        {!collapsed && (
          <div className="piano-wrap">
            <Piano height={110} />
            <PianoToolbar compact />
          </div>
        )}
      </div>
    </aside>
  )
}
