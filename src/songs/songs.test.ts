// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseMusicXml } from './musicXml'
import { parseMidi } from './midiFile'
import { chartToScore } from './chart'
import { BUILTIN_SONGS } from './builtin'
import { activeAt, barAt, ImportError } from './score'
import { parseChordSymbol } from '../music/chords'

/** Construye un MIDI formato 1 mínimo: pista de tempo + pista de notas. */
function buildMidi(opts: { tpq?: number; mpq?: number; notes: { midi: number; start: number; dur: number; ch?: number }[]; sig?: [number, number] }): ArrayBuffer {
  const tpq = opts.tpq ?? 480
  const vlq = (v: number) => { const b = [v & 0x7f]; while ((v >>= 7)) b.unshift((v & 0x7f) | 0x80); return b }
  const mpq = opts.mpq ?? 500000
  const t0 = [0, 0xff, 0x51, 3, (mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255, ...(opts.sig ? [0, 0xff, 0x58, 4, opts.sig[0], Math.log2(opts.sig[1]), 24, 8] : []), 0, 0xff, 0x2f, 0]
  const ev: { t: number; b: number[] }[] = []
  opts.notes.forEach((n) => { const ch = n.ch ?? 0; ev.push({ t: n.start, b: [0x90 | ch, n.midi, 90] }); ev.push({ t: n.start + n.dur, b: [0x80 | ch, n.midi, 0] }) })
  ev.sort((a, b) => a.t - b.t)
  const t1: number[] = []
  let last = 0
  ev.forEach((e) => { t1.push(...vlq(e.t - last), ...e.b); last = e.t })
  t1.push(0, 0xff, 0x2f, 0)
  const chunk = (tag: string, body: number[]) => [...tag].map((c) => c.charCodeAt(0)).concat([(body.length >>> 24) & 255, (body.length >>> 16) & 255, (body.length >>> 8) & 255, body.length & 255], body)
  const bytes = [...chunk('MThd', [0, 1, 0, 2, (tpq >> 8) & 255, tpq & 255]), ...chunk('MTrk', t0), ...chunk('MTrk', t1)]
  return new Uint8Array(bytes).buffer
}

describe('MIDI', () => {
  it('lee notas, duraciones y tempo (120 bpm: una negra = 0,5 s)', () => {
    const s = parseMidi(buildMidi({ notes: [{ midi: 60, start: 0, dur: 480 }, { midi: 64, start: 480, dur: 480 }, { midi: 67, start: 960, dur: 960 }] }))
    expect(s.tempo).toBe(120)
    expect(s.notes.map((n) => n.midi)).toEqual([60, 64, 67])
    expect(s.notes[1].t).toBeCloseTo(0.5)
    expect(s.notes[2].d).toBeCloseTo(1)
    expect(s.duration).toBeCloseTo(2)
    expect(s.bars[0]).toBe(0)
    expect(s.bars[1]).toBeCloseTo(2)
  })
  it('respeta otro tempo (60 bpm) y compás de 3/4', () => {
    const s = parseMidi(buildMidi({ mpq: 1000000, sig: [3, 4], notes: [{ midi: 60, start: 0, dur: 480 }, { midi: 62, start: 1440, dur: 480 }] }))
    expect(s.tempo).toBe(60)
    expect(s.timeSig).toEqual([3, 4])
    expect(s.notes[1].t).toBeCloseTo(3)
    expect(s.bars[1]).toBeCloseTo(3)
  })
  it('ignora la percusión (canal 10)', () => {
    const s = parseMidi(buildMidi({ notes: [{ midi: 60, start: 0, dur: 480 }, { midi: 36, start: 0, dur: 240, ch: 9 }] }))
    expect(s.notes).toHaveLength(1)
  })
  it('rechaza archivos que no son MIDI o están vacíos', () => {
    expect(() => parseMidi(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).buffer)).toThrow(ImportError)
    expect(() => parseMidi(buildMidi({ notes: [] }))).toThrow(/ninguna nota/)
  })
})

const XML = (body: string) => `<?xml version="1.0"?><score-partwise version="3.1"><work><work-title>Prueba</work-title></work><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list><part id="P1">${body}</part></score-partwise>`

describe('MusicXML', () => {
  const m1 = `<measure number="1"><attributes><divisions>2</divisions><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves></attributes>
    <direction><sound tempo="100"/></direction>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
    <note><chord/><pitch><step>E</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><staff>1</staff></note>
    <note><pitch><step>F</step><alter>1</alter><octave>4</octave></pitch><duration>4</duration><staff>1</staff></note>
    <note><rest/><duration>2</duration><staff>1</staff></note>
    <backup><duration>8</duration></backup>
    <note><pitch><step>C</step><octave>3</octave></pitch><duration>8</duration><staff>2</staff></note></measure>
    <measure number="2"><note><rest/><duration>4</duration></note><note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><tie type="start"/></note></measure>
    <measure number="3"><note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><tie type="stop"/></note></measure>`
  it('lee alturas, alteraciones, acordes, manos y tempo', () => {
    const s = parseMusicXml(XML(m1))
    expect(s.title).toBe('Prueba')
    expect(s.tempo).toBe(100)
    const mid = s.notes.map((n) => n.midi)
    expect(mid).toContain(60)
    expect(mid).toContain(63)
    expect(mid).toContain(66)
    expect(mid).toContain(48)
    expect(s.tracks.map((t) => t.name)).toEqual(['Piano · mano derecha', 'Piano · mano izquierda'])
    const c4 = s.notes.find((n) => n.midi === 60)!
    const eb = s.notes.find((n) => n.midi === 63)!
    expect(c4.t).toBe(eb.t)
    expect(c4.d).toBeCloseTo(0.6)
    expect(s.bars).toHaveLength(3)
    expect(s.bars[1]).toBeCloseTo(2.4)
  })
  it('une las notas ligadas', () => {
    const s = parseMusicXml(XML(m1))
    const g = s.notes.filter((n) => n.midi === 67)
    expect(g).toHaveLength(1)
    expect(g[0].d).toBeCloseTo(1.2)
  })
  it('avisa de repeticiones y rechaza XML inválido o de otro tipo', () => {
    const rep = parseMusicXml(XML(m1.replace('</measure>', '<barline><repeat direction="forward"/></barline></measure>')))
    expect(rep.warnings?.[0]).toMatch(/repeticiones/)
    expect(() => parseMusicXml('<score-partwise><oops>')).toThrow(ImportError)
    expect(() => parseMusicXml('<html></html>')).toThrow(/no parece/)
    expect(() => parseMusicXml('<score-timewise/>')).toThrow(/timewise/)
  })
})

describe('cifrados y acompañamiento', () => {
  it('interpreta cifrados', () => {
    expect(parseChordSymbol('Am7')).toEqual({ root: 'A', quality: 'm7', bass: undefined })
    expect(parseChordSymbol('C/E')).toEqual({ root: 'C', quality: 'maj', bass: 'E' })
    expect(parseChordSymbol('F#m7b5')?.quality).toBe('m7b5')
    expect(parseChordSymbol('Bbmaj7')?.root).toBe('Bb')
    expect(parseChordSymbol('Hm')).toBeNull()
    expect(parseChordSymbol('Cxyz')).toBeNull()
  })
  it('Let It Be: 33 compases, acordes C G Am F y bajo en la fundamental', () => {
    const song = BUILTIN_SONGS[0]
    const s = chartToScore(song.chart, 'block', song.title)
    expect(s.bars).toHaveLength(8 * 5 + 1)
    expect(s.chords!.slice(0, 8).map((c) => c.symbol)).toEqual(['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'])
    expect(s.tempo).toBe(72)
    const bass = s.notes.filter((n) => n.track === 1)
    expect(bass[0].midi % 12).toBe(0)
    expect(bass[1].midi % 12).toBe(7)
    expect(s.duration).toBeCloseTo((41 * 4 * 60) / 72, 0)
    const first = s.notes.filter((n) => n.track === 0 && n.t < 0.1).map((n) => n.midi % 12)
    expect([...new Set(first)].sort((a, b) => a - b)).toEqual([0, 4, 7])
  })
  it('el patrón arpegio genera más notas', () => {
    const a = chartToScore(BUILTIN_SONGS[0].chart, 'arpeggio')
    const b = chartToScore(BUILTIN_SONGS[0].chart, 'block')
    expect(a.notes.length).toBeGreaterThan(b.notes.length / 2)
    expect(a.duration).toBeCloseTo(b.duration, 0)
  })
  it('rechaza acordes que no entiende', () => {
    expect(() => chartToScore({ key: 'C', tempo: 80, beatsPerBar: 4, sections: [{ name: 'A', bars: ['C', 'Qq'] }] })).toThrow(/Qq/)
  })
  it('un compás con dos acordes reparte los pulsos', () => {
    const s = chartToScore({ key: 'C', tempo: 120, beatsPerBar: 4, sections: [{ name: 'A', bars: ['C G'] }] })
    expect(s.chords!.map((c) => c.d)).toEqual([1, 1])
  })
  it('activeAt y barAt', () => {
    const s = chartToScore(BUILTIN_SONGS[0].chart, 'block')
    expect(activeAt(s, 0.2, new Set()).length).toBeGreaterThanOrEqual(4)
    expect(activeAt(s, 0.2, new Set([0, 1])).length).toBe(0)
    expect(barAt(s, 0)).toBe(0)
    expect(barAt(s, 3.4)).toBe(1)
  })
})
