import { finalizeScore, ImportError, type Score, type ScoreNote } from './score'
import { unzip } from './zip'

const STEP: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

const kids = (el: Element, name: string): Element[] => [...el.children].filter((c) => c.tagName === name)
const kid = (el: Element, name: string): Element | undefined => kids(el, name)[0]
const num = (el: Element | undefined, d = 0) => { const v = el ? Number(el.textContent) : NaN; return Number.isFinite(v) ? v : d }

interface RawNote { midi: number; start: number; dur: number; vel: number; track: string }

/** Convierte MusicXML (score-partwise sin comprimir) en una partitura reproducible. Las repeticiones no se expanden. */
export function parseMusicXml(text: string, fallbackTitle = 'Partitura'): Score {
  if (typeof DOMParser === 'undefined') throw new ImportError('Este entorno no puede leer MusicXML.')
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length) throw new ImportError('El archivo MusicXML no es válido o está incompleto.')
  const root = doc.documentElement
  if (root.tagName === 'score-timewise') throw new ImportError('Este MusicXML es «timewise». Expórtalo de nuevo como «partwise» o usa MIDI.')
  if (root.tagName !== 'score-partwise') throw new ImportError('El archivo no parece una partitura MusicXML.')

  const title = (root.getElementsByTagName('work-title')[0]?.textContent || root.getElementsByTagName('movement-title')[0]?.textContent || '').trim() || fallbackTitle
  const partNames = new Map<string, string>()
  for (const sp of [...root.getElementsByTagName('score-part')]) {
    partNames.set(sp.getAttribute('id') ?? '', (kid(sp, 'part-name')?.textContent ?? '').trim())
  }

  const raws: RawNote[] = []
  const tempoEv: { beat: number; bpm: number }[] = []
  const barBeats: number[] = []
  let timeSig: [number, number] = [4, 4]
  const trackKeys: string[] = []
  const trackNames: string[] = []
  const warnings: string[] = []
  let hasRepeats = false

  const parts = kids(root, 'part')
  if (!parts.length) throw new ImportError('La partitura no contiene partes.')
  parts.forEach((part, pi) => {
    let divisions = 1
    let measureStart = 0
    const pname = partNames.get(part.getAttribute('id') ?? '') || `Parte ${pi + 1}`
    const stavesSeen = new Set<number>()
    const open = new Map<string, number>()
    kids(part, 'measure').forEach((m) => {
      let cursor = measureStart
      let maxCursor = measureStart
      let lastStart = measureStart
      if (pi === 0) barBeats.push(measureStart)
      for (const ch of m.children) {
        if (ch.tagName === 'attributes') {
          const dv = kid(ch, 'divisions'); if (dv) divisions = num(dv, divisions) || divisions
          const ts = kid(ch, 'time')
          if (ts && pi === 0 && barBeats.length === 1) timeSig = [num(kid(ts, 'beats'), 4), num(kid(ts, 'beat-type'), 4)]
          const st = kid(ch, 'staves'); if (st) for (let s = 1; s <= num(st, 1); s++) stavesSeen.add(s)
        } else if (ch.tagName === 'direction') {
          const snd = ch.getElementsByTagName('sound')[0]
          const pm = ch.getElementsByTagName('per-minute')[0]
          const bu = ch.getElementsByTagName('beat-unit')[0]?.textContent
          let bpm = snd?.getAttribute('tempo') ? Number(snd.getAttribute('tempo')) : NaN
          if (!Number.isFinite(bpm) && pm) {
            bpm = Number(pm.textContent)
            if (bu === 'half') bpm *= 2
            else if (bu === 'eighth') bpm /= 2
            else if (bu === 'quarter' && ch.getElementsByTagName('beat-unit-dot').length) bpm *= 1.5
          }
          if (Number.isFinite(bpm) && bpm > 20 && bpm < 400 && pi === 0) tempoEv.push({ beat: cursor, bpm })
        } else if (ch.tagName === 'sound' && ch.getAttribute('tempo') && pi === 0) {
          const bpm = Number(ch.getAttribute('tempo'))
          if (bpm > 20 && bpm < 400) tempoEv.push({ beat: cursor, bpm })
        } else if (ch.tagName === 'barline') {
          if (ch.getElementsByTagName('repeat').length) hasRepeats = true
        } else if (ch.tagName === 'backup') {
          cursor -= num(kid(ch, 'duration')) / divisions
        } else if (ch.tagName === 'forward') {
          cursor += num(kid(ch, 'duration')) / divisions
        } else if (ch.tagName === 'note') {
          if (kid(ch, 'grace')) continue
          const isChord = !!kid(ch, 'chord')
          const dur = num(kid(ch, 'duration')) / divisions
          const start = isChord ? lastStart : cursor
          if (!isChord) { lastStart = cursor; cursor += dur }
          maxCursor = Math.max(maxCursor, cursor)
          const pitch = kid(ch, 'pitch')
          if (!pitch || kid(ch, 'rest')) continue
          const step = kid(pitch, 'step')?.textContent ?? 'C'
          const midi = 12 * (num(kid(pitch, 'octave'), 4) + 1) + (STEP[step] ?? 0) + Math.round(num(kid(pitch, 'alter')))
          const staff = num(kid(ch, 'staff'), 1)
          stavesSeen.add(staff)
          const key = `${pi}:${staff}`
          let ti = trackKeys.indexOf(key)
          if (ti < 0) { trackKeys.push(key); ti = trackKeys.length - 1 }
          const ties = kids(ch, 'tie').map((t) => t.getAttribute('type'))
          const okey = `${key}:${midi}`
          if (ties.includes('stop') && open.has(okey)) {
            const idx = open.get(okey)!
            raws[idx].dur = start + dur - raws[idx].start
            if (!ties.includes('start')) open.delete(okey)
          } else {
            raws.push({ midi, start, dur, vel: 0.8, track: key })
            if (ties.includes('start')) open.set(okey, raws.length - 1)
          }
        }
      }
      measureStart = Math.max(maxCursor, cursor)
    })
    stavesSeen.forEach((s) => {
      const k = `${pi}:${s}`
      const i = trackKeys.indexOf(k)
      if (i >= 0) trackNames[i] = stavesSeen.size > 1 ? `${pname} · ${s === 1 ? 'mano derecha' : s === 2 ? 'mano izquierda' : `pentagrama ${s}`}` : pname
    })
  })

  // mapa de tempo en pulsos (negras) → segundos
  tempoEv.sort((a, b) => a.beat - b.beat)
  if (!tempoEv.length || tempoEv[0].beat > 0) tempoEv.unshift({ beat: 0, bpm: tempoEv[0]?.bpm ?? 120 })
  const segs: { beat: number; sec: number; bpm: number }[] = []
  let sec = 0
  tempoEv.forEach((t, i) => {
    if (i > 0) sec += ((t.beat - tempoEv[i - 1].beat) * 60) / tempoEv[i - 1].bpm
    segs.push({ beat: t.beat, sec, bpm: t.bpm })
  })
  const toSec = (beat: number) => {
    let s = segs[0]
    for (const x of segs) { if (x.beat <= beat) s = x; else break }
    return s.sec + ((beat - s.beat) * 60) / s.bpm
  }
  const notes: ScoreNote[] = raws.map((r) => ({ midi: r.midi, t: toSec(r.start), d: Math.max(0.05, toSec(r.start + r.dur) - toSec(r.start)), vel: r.vel, track: trackKeys.indexOf(r.track) }))
  if (hasRepeats) warnings.push('La partitura tiene repeticiones: se reproduce una sola vez, sin repetirlas.')
  return finalizeScore({ title, tempo: Math.round(segs[0].bpm), timeSig, notes, trackNames, bars: barBeats.map(toSec), warnings: warnings.length ? warnings : undefined })
}

/** Lee un .mxl (ZIP con MusicXML dentro). */
export async function parseMxl(buf: ArrayBuffer, fallbackTitle?: string): Promise<Score> {
  const files = await unzip(buf)
  const dec = new TextDecoder()
  let path: string | undefined
  const container = files.get('META-INF/container.xml')
  if (container) {
    const m = dec.decode(container).match(/full-path="([^"]+)"/)
    path = m?.[1]
  }
  if (!path || !files.has(path)) path = [...files.keys()].find((n) => /\.(musicxml|xml)$/i.test(n) && !n.startsWith('META-INF'))
  if (!path) throw new ImportError('El .mxl no contiene ninguna partitura MusicXML.')
  return parseMusicXml(dec.decode(files.get(path)!), fallbackTitle)
}
