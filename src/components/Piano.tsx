import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { onAudioStateChange, panic, setTimbre, setVolume, TIMBRES, type Timbre } from '../audio/engine'
import { midi as midiManager } from '../audio/midi'
import { formatNote, midiToName } from '../music/notes'
import { pressKey, releaseAllKeys, releaseKey, usePiano } from '../store/piano'
import { getState, updateSettings, useProgress } from '../store/progress'

const BLACK = new Set([1, 3, 6, 8, 10])

/** Teclado físico → semitonos sobre el Do de la octava inicial. */
export const KEYMAP: Record<string, number> = {
  KeyZ: 0, KeyS: 1, KeyX: 2, KeyD: 3, KeyC: 4, KeyV: 5, KeyG: 6, KeyB: 7, KeyH: 8, KeyN: 9, KeyJ: 10, KeyM: 11, Comma: 12, KeyL: 13, Period: 14, Semicolon: 15, Slash: 16,
  KeyQ: 12, Digit2: 13, KeyW: 14, Digit3: 15, KeyE: 16, KeyR: 17, Digit5: 18, KeyT: 19, Digit6: 20, KeyY: 21, Digit7: 22, KeyU: 23, KeyI: 24, Digit9: 25, KeyO: 26, Digit0: 27, KeyP: 28,
}
const HINT: Record<number, string> = {}
const LOWER = ['Z', 'S', 'X', 'D', 'C', 'V', 'G', 'B', 'H', 'N', 'J', 'M', ',', 'L', '.', ';', '/']
LOWER.forEach((k, i) => { HINT[i] = k })

let kbRefs = 0
const keyHolders = new Map<string, number>()
function onKeyDown(e: KeyboardEvent) {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
  const off = KEYMAP[e.code]
  if (off === undefined) return
  const t = e.target as HTMLElement | null
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
  const base = (getState().settings.startOctave + 1) * 12
  const midi = base + off
  if (midi > 127) return
  keyHolders.set(e.code, midi)
  pressKey(midi, 'kb:' + e.code)
  e.preventDefault()
}
function onKeyUp(e: KeyboardEvent) {
  const midi = keyHolders.get(e.code)
  if (midi === undefined) return
  keyHolders.delete(e.code)
  releaseKey(midi, 'kb:' + e.code)
}
function useKeyboardShortcuts() {
  useEffect(() => {
    if (kbRefs++ === 0) {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
    }
    return () => {
      if (--kbRefs === 0) {
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
        keyHolders.clear()
        releaseAllKeys()
      }
    }
  }, [])
}

/** Conecta el teclado MIDI físico con el piano virtual. */
export function useMidiBridge() {
  useEffect(() => midiManager.onNote((e) => (e.type === 'on' ? pressKey(e.midi, 'midi', e.velocity) : releaseKey(e.midi, 'midi'))), [])
}

export function useMidiStatus() {
  return useSyncExternalStore(
    (cb) => midiManager.onStatus(cb),
    () => midiManager.getStatus(),
    () => midiManager.getStatus(),
  )
}

function useAudioReady() {
  return useSyncExternalStore(onAudioStateChange, () => 0, () => 0)
}

export function PianoToolbar({ showMidi = true, compact = false }: { showMidi?: boolean; compact?: boolean }) {
  const { settings } = useProgress()
  const status = useMidiStatus()
  useAudioReady()
  const sound = (
    <>
      <label>Octavas
        <select value={settings.octaves} onChange={(e) => updateSettings({ octaves: Number(e.target.value), startOctave: Math.min(settings.startOctave, 7 - Number(e.target.value)) })} aria-label="Número de octavas">
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label>Sonido
        <select value={settings.timbre} onChange={(e) => { updateSettings({ timbre: e.target.value as Timbre }); setTimbre(e.target.value as Timbre) }} aria-label="Timbre">
          {TIMBRES.map((t) => <option key={t.id} value={t.id}>{t.nameEs}</option>)}
        </select>
      </label>
      <label>Volumen
        <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => { const v = Number(e.target.value); updateSettings({ volume: v }); setVolume(v) }} aria-label="Volumen" />
      </label>
    </>
  )
  return (
    <div className="piano-bar" role="group" aria-label="Controles del piano">
      <span className="cluster">
        <button className="btn btn-sm btn-ghost" onClick={() => updateSettings({ startOctave: Math.max(1, settings.startOctave - 1) })} aria-label="Bajar una octava" disabled={settings.startOctave <= 1}>‹ Grave</button>
        <b className="mono-num" aria-live="polite">C{settings.startOctave}–C{settings.startOctave + settings.octaves}</b>
        <button className="btn btn-sm btn-ghost" onClick={() => updateSettings({ startOctave: Math.min(6 - settings.octaves + 1, settings.startOctave + 1) })} aria-label="Subir una octava" disabled={settings.startOctave + settings.octaves >= 7}>Agudo ›</button>
      </span>
      {!compact && sound}
      <label><input type="checkbox" checked={settings.showNoteNames} onChange={(e) => updateSettings({ showNoteNames: e.target.checked })} /> Nombres</label>
      <button className="btn btn-sm btn-ghost" onClick={panic} title="Corta cualquier sonido que haya quedado activo">Silenciar</button>
      {showMidi && (
        <span className="cluster">
          <button className="btn btn-sm" onClick={() => (status.connected ? midiManager.disconnect() : void midiManager.connect())} aria-pressed={status.connected}>
            {status.connected ? 'MIDI conectado' : 'Conectar MIDI'}
          </button>
          {status.connected && <span className="faint">{status.devices.map((d) => d.name).join(', ')}</span>}
        </span>
      )}
      {compact && <details className="piano-more"><summary>Sonido y octavas</summary><div className="piano-more-body">{sound}</div></details>}
      {showMidi && status.error && <span className="faint" role="status" style={{ flexBasis: '100%' }}>{status.error}</span>}
    </div>
  )
}

export function Piano({ height = 150 }: { height?: number }) {
  const { settings } = useProgress()
  const piano = usePiano()
  const naming = settings.naming
  useKeyboardShortcuts()
  const lo = (settings.startOctave + 1) * 12
  const hi = lo + settings.octaves * 12
  const keys = useMemo(() => {
    const out: { midi: number; black: boolean; whiteBefore: number }[] = []
    let whites = 0
    for (let m = lo; m <= hi; m++) {
      const black = BLACK.has(m % 12)
      out.push({ midi: m, black, whiteBefore: whites })
      if (!black) whites++
    }
    return { list: out, whites }
  }, [lo, hi])

  const pointers = useRef(new Map<number, number>())
  const container = useRef<HTMLDivElement>(null)

  const keyAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest('[data-midi]') as HTMLElement | null
    return el?.dataset.midi ? Number(el.dataset.midi) : null
  }
  const down = (e: React.PointerEvent) => {
    const m = keyAt(e.clientX, e.clientY)
    if (m === null) return
    e.preventDefault()
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* puntero sintético o ya liberado */ }
    pointers.current.set(e.pointerId, m)
    pressKey(m, 'ptr' + e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    const prev = pointers.current.get(e.pointerId)!
    const m = keyAt(e.clientX, e.clientY)
    if (m !== null && m !== prev) {
      releaseKey(prev, 'ptr' + e.pointerId)
      pointers.current.set(e.pointerId, m)
      pressKey(m, 'ptr' + e.pointerId)
    }
  }
  const up = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (prev === undefined) return
    pointers.current.delete(e.pointerId)
    releaseKey(prev, 'ptr' + e.pointerId)
  }

  // Si el piano se desmonta con teclas pulsadas, se sueltan
  useEffect(() => () => { pointers.current.forEach((m, id) => releaseKey(m, 'ptr' + id)); pointers.current.clear() }, [])

  const bw = 0.62 / keys.whites * 100
  const hintOf = (midi: number) => HINT[midi - lo] ?? ''
  const cls = (m: number) => {
    const mark = piano.marks[m]
    return `${piano.down.includes(m) ? ' is-down' : ''}${mark ? ` is-${mark}` : ''}`
  }
  return (
    <div className="piano-scroll">
      <div className="piano" style={{ ['--kh' as string]: `${height}px`, minWidth: keys.whites * 40 }} role="group" aria-label="Piano virtual. Se puede tocar con ratón, pantalla táctil o las teclas Z X C V B N M y Q W E R T Y U del ordenador."
        ref={container} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
          {keys.list.filter((k) => !k.black).map((k) => (
            <div key={k.midi} data-midi={k.midi} className={`key white${cls(k.midi)}`} role="button" aria-label={formatNote(midiToName(k.midi), naming)} aria-pressed={piano.down.includes(k.midi)}>
              {settings.showNoteNames && <span className="key-label">{(k.midi % 12 === 0) ? formatNote(midiToName(k.midi), naming) : formatNote(midiToName(k.midi), naming, false)}</span>}
              {hintOf(k.midi) && <span className="hint" aria-hidden="true">{hintOf(k.midi)}</span>}
            </div>
          ))}
          {keys.list.filter((k) => k.black).map((k) => (
            <div key={k.midi} data-midi={k.midi} className={`key black${cls(k.midi)}`} role="button" aria-label={`${formatNote(midiToName(k.midi), naming)} / ${formatNote(midiToName(k.midi, true), naming)}`} aria-pressed={piano.down.includes(k.midi)}
              style={{ left: `calc(${(k.whiteBefore / keys.whites) * 100}% - ${bw / 2}%)`, width: `${bw}%` }}>
              {hintOf(k.midi) && <span className="hint" aria-hidden="true">{hintOf(k.midi)}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
