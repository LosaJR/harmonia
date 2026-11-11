/** Integración opcional con teclados MIDI mediante Web MIDI API. */

export interface MidiEvent { type: 'on' | 'off'; midi: number; velocity: number }

/** Interpreta un mensaje MIDI crudo. note-on con velocidad 0 = note-off. */
export function parseMidiMessage(data: ArrayLike<number>): MidiEvent | null {
  if (!data || data.length < 3) return null
  const status = data[0] & 0xf0
  const midi = data[1]
  const vel = data[2]
  if (status === 0x90) return vel > 0 ? { type: 'on', midi, velocity: vel / 127 } : { type: 'off', midi, velocity: 0 }
  if (status === 0x80) return { type: 'off', midi, velocity: 0 }
  return null
}

export interface MidiDevice { id: string; name: string }
export interface MidiStatus {
  supported: boolean
  connected: boolean
  devices: MidiDevice[]
  error?: string
}

type NoteListener = (e: MidiEvent) => void
type StatusListener = (s: MidiStatus) => void

interface MinimalInput {
  id: string; name?: string | null; state?: string; type?: string
  onmidimessage: ((e: { data: Uint8Array | null }) => void) | null
}
interface MinimalAccess {
  inputs: Map<string, MinimalInput> | { values(): IterableIterator<MinimalInput>; forEach: (cb: (v: MinimalInput) => void) => void }
  onstatechange: ((e: unknown) => void) | null
}

class MidiManager {
  private access: MinimalAccess | null = null
  private noteListeners = new Set<NoteListener>()
  private statusListeners = new Set<StatusListener>()
  private status: MidiStatus = { supported: typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator, connected: false, devices: [] }

  getStatus = () => this.status

  onNote(fn: NoteListener): () => void {
    this.noteListeners.add(fn)
    return () => { this.noteListeners.delete(fn) }
  }

  onStatus(fn: StatusListener): () => void {
    this.statusListeners.add(fn)
    return () => { this.statusListeners.delete(fn) }
  }

  private setStatus(patch: Partial<MidiStatus>) {
    this.status = { ...this.status, ...patch }
    this.statusListeners.forEach((l) => l(this.status))
  }

  private handle = (e: { data: Uint8Array | null }) => {
    const ev = e.data ? parseMidiMessage(e.data) : null
    if (ev) this.noteListeners.forEach((l) => l(ev))
  }

  private refresh() {
    if (!this.access) return
    const devices: MidiDevice[] = []
    const inputs = this.access.inputs as unknown as { forEach: (cb: (v: MinimalInput) => void) => void }
    inputs.forEach((input) => {
      if (input.state && input.state !== 'connected') {
        input.onmidimessage = null
        return
      }
      input.onmidimessage = this.handle
      devices.push({ id: input.id, name: input.name || 'Dispositivo MIDI' })
    })
    this.setStatus({ devices, connected: devices.length > 0, error: devices.length ? undefined : 'No se detecta ningún teclado MIDI. Conéctalo y vuelve a intentarlo.' })
  }

  /** Pide permiso y empieza a escuchar. Debe llamarse desde una acción del usuario. */
  async connect(): Promise<void> {
    if (!this.status.supported) {
      this.setStatus({ error: 'Este navegador no admite Web MIDI (prueba con Chrome, Edge u Opera). El piano virtual sigue disponible.' })
      return
    }
    try {
      this.access = (await (navigator as unknown as { requestMIDIAccess: (o?: unknown) => Promise<MinimalAccess> }).requestMIDIAccess({ sysex: false }))
      this.access.onstatechange = () => this.refresh()
      this.refresh()
    } catch (err) {
      const msg = err instanceof Error && err.name === 'SecurityError'
        ? 'Permiso MIDI denegado. Actívalo en la configuración del navegador para este sitio.'
        : 'No se pudo acceder a MIDI. El piano virtual sigue disponible.'
      this.setStatus({ connected: false, devices: [], error: msg })
    }
  }

  disconnect(): void {
    if (this.access) {
      const inputs = this.access.inputs as unknown as { forEach: (cb: (v: MinimalInput) => void) => void }
      inputs.forEach((i) => { i.onmidimessage = null })
      this.access.onstatechange = null
      this.access = null
    }
    this.setStatus({ connected: false, devices: [], error: undefined })
  }
}

export const midi = new MidiManager()
