import { describe, expect, it } from 'vitest'
import { deflateRawSync } from 'node:zlib'
import { unzip } from './zip'

function crc32(buf: Uint8Array) {
  let c: number
  let crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeZip(files: Record<string, string>, compress = true): ArrayBuffer {
  const enc = new TextEncoder()
  const parts: number[] = []
  const central: number[] = []
  const le = (v: number, n: number) => Array.from({ length: n }, (_, i) => (v >>> (8 * i)) & 255)
  for (const [name, text] of Object.entries(files)) {
    const raw = enc.encode(text)
    const data = compress ? new Uint8Array(deflateRawSync(raw)) : raw
    const nm = Array.from(enc.encode(name))
    const off = parts.length
    parts.push(...le(0x04034b50, 4), ...le(20, 2), ...le(0, 2), ...le(compress ? 8 : 0, 2), ...le(0, 4), ...le(crc32(raw), 4), ...le(data.length, 4), ...le(raw.length, 4), ...le(nm.length, 2), ...le(0, 2), ...nm, ...data)
    central.push(...le(0x02014b50, 4), ...le(20, 2), ...le(20, 2), ...le(0, 2), ...le(compress ? 8 : 0, 2), ...le(0, 4), ...le(crc32(raw), 4), ...le(data.length, 4), ...le(raw.length, 4), ...le(nm.length, 2), ...le(0, 2), ...le(0, 2), ...le(0, 2), ...le(0, 2), ...le(0, 4), ...le(off, 4), ...nm)
  }
  const cdOff = parts.length
  const n = Object.keys(files).length
  const eocd = [...le(0x06054b50, 4), ...le(0, 2), ...le(0, 2), ...le(n, 2), ...le(n, 2), ...le(central.length, 4), ...le(cdOff, 4), ...le(0, 2)]
  return new Uint8Array([...parts, ...central, ...eocd]).buffer
}

describe('ZIP (.mxl)', () => {
  it('descomprime archivos comprimidos y almacenados', async () => {
    for (const compress of [true, false]) {
      const files = await unzip(makeZip({ 'a.txt': 'hola mundo', 'dir/b.txt': 'adiós' }, compress))
      expect(new TextDecoder().decode(files.get('a.txt'))).toBe('hola mundo')
      expect(new TextDecoder().decode(files.get('dir/b.txt'))).toBe('adiós')
    }
  })
  it('rechaza archivos que no son ZIP', async () => {
    await expect(unzip(new Uint8Array(40).buffer)).rejects.toThrow(/ZIP/)
  })
})
