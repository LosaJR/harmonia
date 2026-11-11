import { parseMidi } from './midiFile'
import { parseMusicXml, parseMxl } from './musicXml'
import { ImportError } from './score'
import type { SongRecord } from './db'

export const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'webm', 'opus']
export const SCORE_EXT = ['mid', 'midi', 'musicxml', 'xml', 'mxl']
const IMAGE_EXT = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tif', 'tiff']
export const MAX_AUDIO = 80 * 1024 * 1024
export const MAX_SCORE = 10 * 1024 * 1024

export const ACCEPT = [...AUDIO_EXT, ...SCORE_EXT].map((e) => `.${e}`).join(',')

const ext = (name: string) => name.split('.').pop()?.toLowerCase() ?? ''
const baseName = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Sin título'
const uid = () => `s${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`

export function classify(name: string): 'audio' | 'score' | 'image' | 'unknown' {
  const e = ext(name)
  if (AUDIO_EXT.includes(e)) return 'audio'
  if (SCORE_EXT.includes(e)) return 'score'
  if (IMAGE_EXT.includes(e)) return 'image'
  return 'unknown'
}

/** Valida y convierte un archivo en un registro guardable. Lanza ImportError con un mensaje claro. */
export async function importFile(file: File, meta: { title?: string; artist?: string } = {}): Promise<SongRecord> {
  const kind = classify(file.name)
  const title = meta.title?.trim() || baseName(file.name)
  const base = { id: uid(), title, artist: meta.artist?.trim() ?? '', addedAt: Date.now(), fileName: file.name, size: file.size }
  if (kind === 'image') {
    throw new ImportError('Un PDF o una imagen de partitura no se puede convertir en sonido sin un reconocimiento óptico de partituras, que no está incluido. Descarga la partitura en formato MIDI (.mid) o MusicXML (.musicxml, .mxl): MuseScore y la mayoría de webs de partituras ofrecen esas descargas.')
  }
  if (kind === 'unknown') throw new ImportError(`Formato no admitido (.${ext(file.name) || '?'}). Admitidos: audio (${AUDIO_EXT.slice(0, 5).join(', ')}…) y partituras (MIDI, MusicXML, MXL).`)
  if (file.size === 0) throw new ImportError('El archivo está vacío.')
  if (kind === 'audio') {
    if (file.size > MAX_AUDIO) throw new ImportError(`El audio pesa ${(file.size / 1048576).toFixed(0)} MB; el máximo es ${MAX_AUDIO / 1048576} MB.`)
    return { ...base, kind: 'audio', mime: file.type || 'audio/mpeg', blob: file }
  }
  if (file.size > MAX_SCORE) throw new ImportError(`La partitura pesa ${(file.size / 1048576).toFixed(1)} MB; el máximo es ${MAX_SCORE / 1048576} MB.`)
  const buf = await file.arrayBuffer()
  const e = ext(file.name)
  let score
  if (e === 'mid' || e === 'midi') score = parseMidi(buf, title)
  else if (e === 'mxl') score = await parseMxl(buf, title)
  else score = parseMusicXml(new TextDecoder().decode(buf), title)
  return { ...base, title: meta.title?.trim() || score.title || title, kind: 'score', score }
}
