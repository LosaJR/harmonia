import { ImportError } from './score'

const MAX_UNZIPPED = 30_000_000

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') throw new ImportError('Este navegador no puede descomprimir archivos .mxl. Exporta la partitura como MusicXML sin comprimir (.musicxml) o como MIDI.')
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Lector mínimo de ZIP (suficiente para .mxl): devuelve los archivos por nombre. */
export async function unzip(buf: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const u8 = new Uint8Array(buf)
  const dv = new DataView(buf)
  let eocd = -1
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new ImportError('El archivo .mxl no es un ZIP válido.')
  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true)
  const out = new Map<string, Uint8Array>()
  let total = 0
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new ImportError('El archivo .mxl está dañado.')
    const method = dv.getUint16(p + 10, true)
    const comp = dv.getUint32(p + 20, true)
    const size = dv.getUint32(p + 24, true)
    const nl = dv.getUint16(p + 28, true)
    const el = dv.getUint16(p + 30, true)
    const cl = dv.getUint16(p + 32, true)
    const off = dv.getUint32(p + 42, true)
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl))
    p += 46 + nl + el + cl
    if (name.endsWith('/')) continue
    total += size
    if (total > MAX_UNZIPPED) throw new ImportError('El archivo descomprimido es demasiado grande.')
    const lnl = dv.getUint16(off + 26, true)
    const lel = dv.getUint16(off + 28, true)
    const start = off + 30 + lnl + lel
    const raw = u8.subarray(start, start + comp)
    if (method === 0) out.set(name, raw.slice())
    else if (method === 8) out.set(name, await inflateRaw(raw))
    else throw new ImportError('El .mxl usa un método de compresión no admitido.')
  }
  return out
}
