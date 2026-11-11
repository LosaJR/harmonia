import { allowedTensions, customChord, toggleTension } from './customChord'
import { describe, expect, it } from 'vitest'
import {
  buildChord, chordNotesOct, detectChord, diatonicChords, functionLabel, resolveRoman,
} from './chords'
import { scaleNotes, keySignature, relativeKey, scaleWithOctaves, CIRCLE } from './scales'
import { formatNote, formatSymbol, intervalNameEs, midiToName, toMidi, chromaSet, sameChromaSet, alter } from './notes'
import { buildProgression, transposeNotes, keyInterval, PRESETS } from './progressions'
import { analyzeMotion, smoothVoicing, voiceChord, inversionOfVoicing } from './voicing'

describe('notas y convención de octavas', () => {
  it('C4 = MIDI 60', () => {
    expect(toMidi('C4')).toBe(60)
    expect(toMidi('A4')).toBe(69)
    expect(midiToName(61)).toBe('C#4')
    expect(midiToName(61, true)).toBe('Db4')
  })
  it('equivalencia enarmónica por chroma', () => {
    expect(sameChromaSet(['F#', 'A#', 'C#'], ['Gb', 'Bb', 'Db'])).toBe(true)
    expect(chromaSet(['C', 'E', 'G', 'C'])).toEqual([0, 4, 7])
  })
  it('formato latino/internacional con glifos', () => {
    expect(formatNote('F#4', 'latin')).toBe('Fa♯4')
    expect(formatNote('Bb3', 'intl')).toBe('B♭3')
    expect(formatSymbol('F#m7b5')).toBe('F♯m7♭5')
    expect(formatSymbol('Bb7#9', 'latin')).toBe('Si♭7♯9')
    expect(formatSymbol('G7')).toBe('G7')
    expect(formatSymbol('C/E')).toBe('C/E')
  })
  it('alter conserva la letra', () => {
    expect(alter('B', -1)).toBe('Bb')
    expect(alter('F#', 1)).toBe('F##')
    expect(alter('Bb', 1)).toBe('B')
  })
  it('nombres de intervalo', () => {
    expect(intervalNameEs('3M')).toBe('tercera mayor')
    expect(intervalNameEs('5d')).toBe('quinta disminuida')
    expect(intervalNameEs('4A')).toBe('cuarta aumentada')
  })
})

describe('escalas', () => {
  it('Do mayor y Re mayor', () => {
    expect(scaleNotes('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(scaleNotes('D', 'major')).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#'])
  })
  it('F♯ mayor tiene E♯ y Gb mayor tiene Cb (escritura correcta)', () => {
    expect(scaleNotes('F#', 'major')).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'])
    expect(scaleNotes('Gb', 'major')).toEqual(['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'])
  })
  it('menores natural, armónica y melódica', () => {
    expect(scaleNotes('A', 'minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(scaleNotes('A', 'harmonic minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#'])
    expect(scaleNotes('A', 'melodic minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F#', 'G#'])
    expect(scaleNotes('Bb', 'minor')).toEqual(['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'])
  })
  it('modos', () => {
    expect(scaleNotes('D', 'dorian')).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C'])
    expect(scaleNotes('F', 'lydian')).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E'])
    expect(scaleNotes('G', 'mixolydian')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F'])
    expect(scaleNotes('G', 'altered')).toEqual(['G', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'])
  })
  it('con octavas, ascendente', () => {
    expect(scaleWithOctaves('D', 'major', 4)).toEqual(['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'])
    expect(scaleWithOctaves('A', 'major', 3, false).length).toBe(7)
  })
  it('armaduras y tonalidad relativa', () => {
    expect(keySignature('D').count).toBe(2)
    expect(keySignature('D').accidentals).toEqual(['F#', 'C#'])
    expect(keySignature('Eb').count).toBe(-3)
    expect(keySignature('A', 'minor').count).toBe(0)
    expect(keySignature('F#', 'minor').count).toBe(3)
    expect(keySignature('Bb', 'minor').count).toBe(-5)
    expect(relativeKey('C', 'major')).toBe('A')
    expect(relativeKey('F#', 'minor')).toBe('A')
    expect(relativeKey('Eb', 'major')).toBe('C')
  })
  it('círculo de quintas coherente', () => {
    expect(CIRCLE).toHaveLength(12)
    for (const e of CIRCLE) {
      expect(keySignature(e.major).count).toBe(e.sig === 6 ? 6 : e.sig === -5 ? -5 : e.sig)
      expect(relativeKey(e.major, 'major').replace('♯', '#')).toBeTruthy()
    }
  })
})

describe('acordes', () => {
  it('tríadas de referencia', () => {
    expect(buildChord('C', 'maj').notes).toEqual(['C', 'E', 'G'])
    expect(buildChord('A', 'min').notes).toEqual(['A', 'C', 'E'])
    expect(buildChord('B', 'dim').notes).toEqual(['B', 'D', 'F'])
    expect(buildChord('C', 'aug').notes).toEqual(['C', 'E', 'G#'])
  })
  it('séptimas de referencia', () => {
    expect(buildChord('G', '7').notes).toEqual(['G', 'B', 'D', 'F'])
    expect(buildChord('B', 'dim7').notes).toEqual(['B', 'D', 'F', 'Ab'])
    expect(buildChord('C', 'dim7').notes).toEqual(['C', 'Eb', 'Gb', 'Bbb'])
    expect(buildChord('F#', 'm7b5').notes).toEqual(['F#', 'A', 'C', 'E'])
    expect(buildChord('D', 'm7').symbol).toBe('Dm7')
    expect(buildChord('Eb', 'maj7').notes).toEqual(['Eb', 'G', 'Bb', 'D'])
  })
  it('enarmonía: F# frente a Gb', () => {
    expect(buildChord('F#', 'maj').notes).toEqual(['F#', 'A#', 'C#'])
    expect(buildChord('Gb', 'maj').notes).toEqual(['Gb', 'Bb', 'Db'])
    expect(sameChromaSet(buildChord('F#', 'maj').notes, buildChord('Gb', 'maj').notes)).toBe(true)
  })
  it('inversiones con octava', () => {
    expect(chordNotesOct('C', 'maj', 4)).toEqual(['C4', 'E4', 'G4'])
    expect(chordNotesOct('C', 'maj', 4, 1)).toEqual(['E4', 'G4', 'C5'])
    expect(chordNotesOct('C', 'maj', 4, 2)).toEqual(['G4', 'C5', 'E5'])
    expect(chordNotesOct('G', '7', 3, 3)).toEqual(['F4', 'G4', 'B4', 'D5'])
  })
  it('detección con inversión', () => {
    const d = detectChord(['E4', 'G4', 'C5'])
    expect(d?.root).toBe('C')
    expect(d?.quality).toBe('maj')
    expect(d?.inversion).toBe(1)
    expect(d?.symbol).toBe('C/E')
    expect(detectChord(['G3', 'B3', 'D4', 'F4'])?.symbol).toBe('G7')
    expect(detectChord(['A', 'C', 'E'])?.symbol).toBe('Am')
    expect(detectChord(['C#3', 'E3', 'G#3'], false)?.symbol).toBe('C#m')
    expect(detectChord(['C', 'D'])).toBeNull()
  })
  it('detección sin escritura usa sostenidos o bemoles a petición', () => {
    expect(detectChord(['C#', 'F', 'G#'], true)?.symbol).toBe('Db')
    expect(detectChord(['C#', 'F', 'G#'], false)?.symbol).toBe('C#')
  })
  it('armonización de Do mayor y la menor', () => {
    const t = diatonicChords('C', 'major', 3)
    expect(t.map((c) => c.symbol)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'])
    expect(t.map((c) => c.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'])
    const s = diatonicChords('C', 'major', 4)
    expect(s.map((c) => c.symbol)).toEqual(['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'])
    const m = diatonicChords('A', 'harmonic minor', 3)
    expect(m.map((c) => c.symbol)).toEqual(['Am', 'Bdim', 'Caug', 'Dm', 'E', 'F', 'G#dim'])
    expect(diatonicChords('A', 'minor', 3).map((c) => c.symbol)).toEqual(['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'])
  })
  it('armonización en tonalidad con alteraciones', () => {
    expect(diatonicChords('F#', 'major', 4).map((c) => c.symbol)).toEqual(['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'E#m7b5'])
    expect(diatonicChords('Db', 'major', 3).map((c) => c.symbol)).toEqual(['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'])
  })
})

describe('números romanos y progresiones', () => {
  it('resuelve romanos básicos', () => {
    const key = { tonic: 'C', mode: 'major' as const }
    expect(resolveRoman('ii7', key).symbol).toBe('Dm7')
    expect(resolveRoman('V7', key).notes).toEqual(['G', 'B', 'D', 'F'])
    expect(resolveRoman('Imaj7', key).symbol).toBe('Cmaj7')
    expect(resolveRoman('bVII', key).symbol).toBe('Bb')
    expect(resolveRoman('iv', key).symbol).toBe('Fm')
    expect(resolveRoman('vii°7', key).symbol).toBe('Bdim7')
    expect(resolveRoman('viiø7', key).symbol).toBe('Bm7b5')
    expect(resolveRoman('bII7', key).symbol).toBe('Db7')
  })
  it('dominantes secundarias', () => {
    const key = { tonic: 'C', mode: 'major' as const }
    expect(resolveRoman('V7/V', key).symbol).toBe('D7')
    expect(resolveRoman('V7/ii', key).symbol).toBe('A7')
    expect(resolveRoman('V7/vi', key).symbol).toBe('E7')
    expect(resolveRoman('vii°7/V', key).symbol).toBe('F#dim7')
    expect(resolveRoman('V7/IV', { tonic: 'G', mode: 'major' }).symbol).toBe('G7')
  })
  it('menor: romano sobre escala natural', () => {
    const key = { tonic: 'A', mode: 'minor' as const }
    expect(resolveRoman('VI', key).symbol).toBe('F')
    expect(resolveRoman('V7', key).symbol).toBe('E7')
    expect(resolveRoman('iiø7', key).symbol).toBe('Bm7b5')
    expect(resolveRoman('VII', key).symbol).toBe('G')
  })
  it('ii–V–I en Do mayor: Dm7–G7–Cmaj7', () => {
    const p = buildProgression([{ roman: 'ii7', beats: 4 }, { roman: 'V7', beats: 4 }, { roman: 'Imaj7', beats: 4 }], { tonic: 'C', mode: 'major' })
    expect(p.map((c) => c.symbol)).toEqual(['Dm7', 'G7', 'Cmaj7'])
    const triads = buildProgression([{ roman: 'ii', beats: 4 }, { roman: 'V', beats: 4 }, { roman: 'I', beats: 4 }], { tonic: 'C', mode: 'major' })
    expect(triads.map((c) => c.symbol)).toEqual(['Dm', 'G', 'C'])
  })
  it('todos los presets se resuelven en varias tonalidades', () => {
    for (const p of PRESETS) {
      for (const tonic of ['C', 'F#', 'Bb', 'E', 'Ab']) {
        const out = buildProgression(p.romans.map((r) => ({ roman: r, beats: 4 })), { tonic, mode: p.mode })
        expect(out.length).toBe(p.romans.length)
        out.forEach((c) => expect(c.notes.length).toBeGreaterThanOrEqual(3))
      }
    }
  })
  it('funciones armónicas', () => {
    const k = { tonic: 'C', mode: 'major' as const }
    expect(functionLabel('I', k).code).toBe('T')
    expect(functionLabel('IV', k).code).toBe('PD')
    expect(functionLabel('V7', k).code).toBe('D')
    expect(functionLabel('V7/V', k).code).toBe('SD')
    expect(functionLabel('bVII', k).code).toBe('X')
  })
})

describe('transposición', () => {
  it('C–E–G una segunda mayor arriba = D–F#–A', () => {
    expect(transposeNotes(['C', 'E', 'G'], '2M')).toEqual(['D', 'F#', 'A'])
  })
  it('conserva la escritura (Eb–G–Bb → F–A–C con 2M)', () => {
    expect(transposeNotes(['Eb', 'G', 'Bb'], '2M')).toEqual(['F', 'A', 'C'])
    expect(transposeNotes(['B', 'D#', 'F#'], '2M')).toEqual(['C#', 'E#', 'G#'])
  })
  it('intervalo entre tonalidades', () => {
    expect(keyInterval('C', 'G')).toBe('5P')
    expect(keyInterval('C', 'Eb')).toBe('3m')
    expect(transposeNotes(scaleNotes('C', 'major'), keyInterval('C', 'Eb'))).toEqual(scaleNotes('Eb', 'major'))
  })
})

describe('voicings y conducción', () => {
  it('cerrado, abierto y drop2', () => {
    expect(voiceChord('C', 'maj', 'close', { octave: 4 }).notes).toEqual(['C4', 'E4', 'G4'])
    expect(voiceChord('C', 'maj', 'open', { octave: 3 }).notes).toEqual(['C3', 'G3', 'E4'])
    const d2 = voiceChord('C', 'maj7', 'drop2', { octave: 4 }).notes
    expect(d2).toEqual(['G3', 'C4', 'E4', 'B4'])
  })
  it('rootless A de Dm7 = F–A–C–E', () => {
    const v = voiceChord('D', 'm7', 'rootlessA')
    expect(v.notes.map((n) => n.replace(/\d/g, ''))).toEqual(['F', 'A', 'C', 'E'])
  })
  it('rootless B de G7 = F–A–B–D', () => {
    const v = voiceChord('G', '7', 'rootlessB')
    expect(v.notes.map((n) => n.replace(/\d/g, ''))).toEqual(['F', 'A', 'B', 'D'])
  })
  it('inversión de un voicing', () => {
    expect(inversionOfVoicing('C', 'maj', ['E4', 'G4', 'C5'])).toBe(1)
    expect(inversionOfVoicing('C', 'maj', ['G3', 'C4', 'E4'])).toBe(2)
  })
  it('conducción suave: de C a F minimiza el movimiento', () => {
    const c = ['C4', 'E4', 'G4']
    const f = smoothVoicing(c, ['F', 'A', 'C'])
    expect(f.map((n) => n.replace(/\d/g, '')).sort()).toEqual(['A', 'C', 'F'])
    const report = analyzeMotion(c, f)
    expect(report.total).toBeLessThanOrEqual(5)
    expect(report.common).toBeGreaterThanOrEqual(1)
  })
  it('detecta quintas paralelas', () => {
    const r = analyzeMotion(['C3', 'G3'], ['D3', 'A3'])
    expect(r.parallelPerfects).toContain('quintas paralelas')
    const ok = analyzeMotion(['C3', 'E4'], ['D3', 'D4'])
    expect(ok.parallelPerfects).toHaveLength(0)
    expect(ok.outer).toBe('contrario')
  })
})

describe('acordes con extensiones y alteraciones', () => {
  it('G7 con ♭9 y ♭13', () => {
    const c = customChord('G', '7', ['9m', '13m'], 0, 3)
    expect(c.pcs).toEqual(['G', 'B', 'D', 'F', 'Ab', 'Eb'])
    expect(c.symbol).toBe('G7(b9,b13)')
    expect(c.voiced).toHaveLength(6)
  })
  it('Cmaj7 con ♯11 y 9', () => {
    const c = customChord('C', 'maj7', ['9M', '11A'], 0, 3)
    expect(c.pcs).toEqual(['C', 'E', 'G', 'B', 'D', 'F#'])
    expect(c.symbol).toBe('Cmaj7(9,#11)')
  })
  it('no permite tensiones que chocan', () => {
    expect(allowedTensions('maj7')).not.toContain('11P')
    expect(allowedTensions('7')).not.toContain('11P')
    expect(allowedTensions('m7')).toContain('11P')
    expect(allowedTensions('maj9')).not.toContain('9M')
    expect(allowedTensions('7b9')).not.toContain('9A')
  })
  it('solo una tensión por número', () => {
    expect(toggleTension(['9M'], '9m')).toEqual(['9m'])
    expect(toggleTension(['9m', '13M'], '13m')).toEqual(['9m', '13m'])
    expect(toggleTension(['9m'], '9m')).toEqual([])
  })
  it('inversión de un acorde con extensiones', () => {
    const c = customChord('C', 'maj7', ['9M'], 1, 3)
    expect(c.voiced[0].replace(/\d/g, '')).toBe('E')
  })
})

import { progressionSteps } from './playback'
describe('reproducción de progresiones', () => {
  const key = { tonic: 'C', mode: 'major' as const }
  const chords = buildProgression([{ roman: 'ii7', beats: 4 }, { roman: 'V7', beats: 2 }, { roman: 'Imaj7', beats: 4 }], key)
  it('respeta duraciones y añade el bajo', () => {
    const s = progressionSteps(chords, 'smooth', true)
    expect(s.map((x) => x.beats)).toEqual([4, 2, 4])
    expect(s[0].notes[0]).toBe('D2')
    expect(s[1].notes[0]).toBe('G2')
    expect(s[0].notes.length).toBe(5)
  })
  it('conducción suave mueve poco entre ii7 y V7', () => {
    const s = progressionSteps(chords, 'smooth', false)
    expect(analyzeMotion(s[0].notes, s[1].notes).total).toBeLessThanOrEqual(6)
  })
  it('modo por inversión respeta la inversión elegida', () => {
    const c2 = buildProgression([{ roman: 'I', beats: 4, inversion: 1 }], key)
    const s = progressionSteps(c2, 'inversion', false)
    expect(s[0].notes.map((n) => n.replace(/\d/g, ''))).toEqual(['E', 'G', 'C'])
  })
})
