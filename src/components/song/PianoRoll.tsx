import { useEffect, useMemo, useRef } from 'react'
import { formatNote, midiToName } from '../../music/notes'
import type { Score } from '../../songs/score'
import { useNaming } from '../ui'

const SPAN = 7 // segundos visibles
const HEAD = 0.22 // posición del cursor (fracción del ancho)
const TRACK_VARS = ['--copper', '--lv2', '--lv3', '--lv5', '--lv1', '--lv4']

interface Props {
  score: Score
  pos: number
  muted: Set<number>
  loop?: [number, number] | null
  onSeek: (t: number) => void
  height?: number
}

/** Rollo de piano: las notas se acercan al cursor desde la derecha. Un clic mueve la reproducción. */
export function PianoRoll({ score, pos, muted, loop, onSeek, height: minHeight = 190 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const naming = useNaming()
  const range = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const n of score.notes) { if (n.midi < lo) lo = n.midi; if (n.midi > hi) hi = n.midi }
    lo -= 1; hi += 1
    return { lo, hi, rows: Math.max(hi - lo + 1, 14) }
  }, [score])
  // Cada fila mide al menos 16 px para que se pueda leer el nombre de la nota
  const height = Math.min(620, Math.max(minHeight, range.rows * 16))

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const w = cv.clientWidth
    const h = height
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr) }
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const css = getComputedStyle(document.documentElement)
    const col = (v: string, fb: string) => css.getPropertyValue(v).trim() || fb
    const { lo, hi, rows } = range
    const rowH = h / rows
    const px = (t: number) => w * HEAD + ((t - pos) / SPAN) * w
    const yOf = (m: number) => h - (m - lo + 1) * rowH

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = col('--surface', '#16151a')
    ctx.fillRect(0, 0, w, h)
    // filas de teclas negras
    ctx.fillStyle = col('--raised', '#1f1d25')
    for (let m = lo; m <= hi; m++) if ([1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12)) ctx.fillRect(0, yOf(m), w, rowH)
    // bucle
    if (loop) {
      ctx.fillStyle = 'rgba(208,143,85,0.12)'
      ctx.fillRect(px(loop[0]), 0, px(loop[1]) - px(loop[0]), h)
    }
    // compases
    ctx.lineWidth = 1
    ctx.strokeStyle = col('--line', '#2c2933')
    score.bars.forEach((b, i) => {
      const x = px(b)
      if (x < -20 || x > w + 20) return
      ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke()
      ctx.fillStyle = col('--ink-3', '#8a847b'); ctx.font = '11px sans-serif'; ctx.fillText(String(i + 1), x + 4, 12)
    })
    // notas
    for (const n of score.notes) {
      const x0 = px(n.t)
      const x1 = px(n.t + n.d)
      if (x1 < 0) continue
      if (x0 > w) break
      const active = pos >= n.t && pos < n.t + n.d
      const base = col(TRACK_VARS[n.track % TRACK_VARS.length], '#d08f55')
      ctx.globalAlpha = muted.has(n.track) ? 0.18 : active ? 1 : 0.78
      ctx.fillStyle = base
      const rw = Math.max(3, x1 - x0 - 1)
      ctx.beginPath()
      ctx.roundRect(x0, yOf(n.midi) + 1, rw, Math.max(3, rowH - 2), 2)
      ctx.fill()
      // nombre de la nota dentro de la barra: completo si hay sitio, sin octava si es corta
      if (rw >= 14 && x0 + rw > 0) {
        const full = rw >= 40
        ctx.fillStyle = '#16120c'
        ctx.font = `700 ${Math.max(9, Math.min(13, Math.floor(rowH - 2)))}px sans-serif`
        ctx.textBaseline = 'middle'
        ctx.fillText(formatNote(midiToName(n.midi), naming, full), Math.max(x0, 0) + 3, yOf(n.midi) + rowH / 2 + 1, Math.max(10, rw - 4))
        ctx.textBaseline = 'alphabetic'
      }
    }
    ctx.globalAlpha = 1
    // cursor
    ctx.strokeStyle = col('--ink', '#f1ebdc')
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(w * HEAD, 0); ctx.lineTo(w * HEAD, h); ctx.stroke()
  })

  const click = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const t = pos + ((e.clientX - r.left) / r.width - HEAD) * SPAN
    onSeek(Math.min(score.duration, Math.max(0, t)))
  }

  return (
    <canvas
      ref={ref}
      onClick={click}
      style={{ width: '100%', height, display: 'block', borderRadius: 12, border: '1px solid var(--line-soft)', cursor: 'pointer' }}
      role="img"
      aria-label="Rollo de piano de la canción. Haz clic para moverte a otro punto."
    />
  )
}
