import { finalizeScore, ImportError, type Score, type ScoreNote } from './score'

interface RawNote { midi: number; start: number; end: number; vel: number; track: number }

/** Lee un archivo MIDI estándar (formato 0 o 1) y lo convierte en partitura con tiempos en segundos. */
export function parseMidi(buf: ArrayBuffer, fallbackTitle = 'Canción MIDI'): Score {
  const u8 = new Uint8Array(buf)
  const dv = new DataView(buf)
  const tag = (o: number) => String.fromCharCode(...u8.subarray(o, o + 4))
  if (u8.length < 14 || tag(0) !== 'MThd') throw new ImportError('El archivo no es un MIDI válido (falta la cabecera MThd).')
  const hdrLen = dv.getUint32(4)
  const ntracks = dv.getUint16(10)
  const division = dv.getUint16(12)
  if (division & 0x8000) throw new ImportError('Este MIDI usa tiempos SMPTE, que no están admitidos.')
  const tpq = division
  if (tpq === 0) throw new ImportError('El MIDI no indica su resolución temporal.')

  let pos = 8 + hdrLen
  const raws: RawNote[] = []
  const tempos: { tick: number; mpq: number }[] = []
  const sigs: { tick: number; num: number; den: number }[] = []
  const names: string[] = []
  let title: string | undefined
  let endTick = 0

  for (let tr = 0; tr < ntracks && pos + 8 <= u8.length; tr++) {
    if (tag(pos) !== 'MTrk') throw new ImportError('El MIDI está dañado (pista no reconocida).')
    const len = dv.getUint32(pos + 4)
    let p = pos + 8
    const end = Math.min(u8.length, p + len)
    pos = p + len
    let tick = 0
    let running = 0
    const open = new Map<number, { start: number; vel: number }>()
    const readVlq = () => {
      let v = 0
      for (let i = 0; i < 4; i++) {
        if (p >= end) throw new ImportError('El MIDI termina de forma inesperada.')
        const b = u8[p++]
        v = (v << 7) | (b & 0x7f)
        if (!(b & 0x80)) break
      }
      return v
    }
    while (p < end) {
      tick += readVlq()
      let status = u8[p]
      if (status < 0x80) status = running
      else { p++; if (status < 0xf0) running = status }
      if (status === 0xff) {
        const type = u8[p++]
        const l = readVlq()
        if (type === 0x51 && l === 3) tempos.push({ tick, mpq: (u8[p] << 16) | (u8[p + 1] << 8) | u8[p + 2] })
        else if (type === 0x58 && l >= 2) sigs.push({ tick, num: u8[p], den: 2 ** u8[p + 1] })
        else if (type === 0x03) {
          const nm = new TextDecoder().decode(u8.subarray(p, p + l)).trim()
          if (nm) { names[tr] = nm; if (tr === 0 && !title && ntracks > 1) title = nm }
        }
        p += l
        if (type === 0x2f) break
      } else if (status === 0xf0 || status === 0xf7) {
        p += readVlq()
      } else {
        const hi = status & 0xf0
        const ch = status & 0x0f
        const one = hi === 0xc0 || hi === 0xd0
        const d1 = u8[p++]
        const d2 = one ? 0 : u8[p++]
        if (ch === 9) continue // percusión: no se reproduce
        const key = ch * 128 + d1
        if (hi === 0x90 && d2 > 0) {
          if (!open.has(key)) open.set(key, { start: tick, vel: d2 })
        } else if (hi === 0x80 || (hi === 0x90 && d2 === 0)) {
          const o = open.get(key)
          if (o) { raws.push({ midi: d1, start: o.start, end: Math.max(tick, o.start + 1), vel: o.vel, track: tr }); open.delete(key) }
        }
      }
    }
    open.forEach((o, key) => raws.push({ midi: key % 128, start: o.start, end: Math.max(tick, o.start + tpq), vel: o.vel, track: tr }))
    endTick = Math.max(endTick, tick)
  }

  // mapa de tempo: ticks → segundos
  tempos.sort((a, b) => a.tick - b.tick)
  if (!tempos.length || tempos[0].tick > 0) tempos.unshift({ tick: 0, mpq: 500000 })
  const segs: { tick: number; sec: number; mpq: number }[] = []
  let sec = 0
  tempos.forEach((t, i) => {
    if (i > 0) sec += ((t.tick - tempos[i - 1].tick) * tempos[i - 1].mpq) / tpq / 1e6
    segs.push({ tick: t.tick, sec, mpq: t.mpq })
  })
  const toSec = (tick: number) => {
    let s = segs[0]
    for (const x of segs) { if (x.tick <= tick) s = x; else break }
    return s.sec + ((tick - s.tick) * s.mpq) / tpq / 1e6
  }

  const notes: ScoreNote[] = raws.map((r) => ({ midi: r.midi, t: toSec(r.start), d: Math.max(0.05, toSec(r.end) - toSec(r.start)), vel: r.vel / 127, track: r.track }))

  // compases según los cambios de compás
  sigs.sort((a, b) => a.tick - b.tick)
  if (!sigs.length || sigs[0].tick > 0) sigs.unshift({ tick: 0, num: 4, den: 4 })
  const bars: number[] = []
  for (let i = 0; i < sigs.length; i++) {
    const from = sigs[i].tick
    const to = i + 1 < sigs.length ? sigs[i + 1].tick : endTick + 1
    const barTicks = (tpq * 4 * sigs[i].num) / sigs[i].den
    for (let t = from; t < to && bars.length < 5000; t += barTicks) bars.push(toSec(t))
  }

  return finalizeScore({
    title: title ?? fallbackTitle, tempo: Math.round(60e6 / segs[0].mpq), timeSig: [sigs[0].num, sigs[0].den],
    notes, trackNames: names.map((n, i) => n || `Pista ${i + 1}`), bars,
    warnings: raws.length ? undefined : ['No se encontraron notas.'],
  })
}
