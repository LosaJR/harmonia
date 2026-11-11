/** localStorage con respaldo en memoria: si el almacenamiento falla, la app sigue funcionando. */

const memory = new Map<string, string>()
let persistent = true
let lastError: string | undefined

function probe(): Storage | null {
  try {
    const s = window.localStorage
    const k = '__harmonia_probe__'
    s.setItem(k, '1')
    s.removeItem(k)
    return s
  } catch (e) {
    persistent = false
    lastError = describe(e)
    return null
  }
}

function describe(e: unknown): string {
  if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) return 'El almacenamiento del navegador está lleno.'
  return 'El navegador no permite guardar datos (modo privado o bloqueado).'
}

let store: Storage | null | undefined

function backend(): Storage | null {
  if (store === undefined) store = typeof window === 'undefined' ? null : probe()
  return store
}

export function storageStatus() {
  backend()
  return { persistent, error: lastError }
}

export function readItem(key: string): string | null {
  try {
    const s = backend()
    const v = s?.getItem(key)
    if (v !== null && v !== undefined) return v
  } catch (e) {
    persistent = false
    lastError = describe(e)
  }
  return memory.get(key) ?? null
}

/** Devuelve true si se guardó de forma persistente. */
export function writeItem(key: string, value: string): boolean {
  memory.set(key, value)
  try {
    const s = backend()
    if (s) {
      s.setItem(key, value)
      persistent = true
      lastError = undefined
      return true
    }
  } catch (e) {
    persistent = false
    lastError = describe(e)
  }
  return false
}

export function removeItem(key: string): void {
  memory.delete(key)
  try { backend()?.removeItem(key) } catch { /* ignorar */ }
}

/** Solo para pruebas: reinicia el estado interno. */
export function __resetStorageForTests(s: Storage | null) {
  store = s
  persistent = s !== null
  lastError = undefined
  memory.clear()
}
