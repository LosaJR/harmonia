import type { ChordChart } from './chart'

export interface BuiltinSong {
  id: string
  title: string
  artist: string
  chart: ChordChart
  note: string
}

/**
 * Canciones incluidas. Solo contienen el esquema armónico (los acordes) y un acompañamiento original
 * generado por la aplicación: no incluyen la melodía ni la letra, que están protegidas por derechos de autor.
 */
export const BUILTIN_SONGS: BuiltinSong[] = [
  {
    id: 'builtin-let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    note: 'Esquema de acordes en Do mayor con un acompañamiento de piano generado por Harmonia. No incluye la melodía ni la letra (están protegidas por derechos de autor). Si tienes la partitura en MIDI o MusicXML de una fuente que puedas usar, añádela con «Añadir canción» para practicar también la melodía.',
    chart: {
      key: 'C', tempo: 72, beatsPerBar: 4,
      sections: [
        { name: 'Introducción', bars: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'] },
        { name: 'Estrofa', bars: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'] },
        { name: 'Estribillo', bars: ['Am', 'G', 'F', 'C', 'C', 'G', 'F', 'C'] },
        { name: 'Estrofa', bars: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'] },
        { name: 'Estribillo', bars: ['Am', 'G', 'F', 'C', 'C', 'G', 'F', 'C'] },
        { name: 'Final', bars: ['C'] },
      ],
    },
  },
]
