import type { Score } from './score'

export interface SongRecord {
  id: string
  kind: 'audio' | 'score'
  title: string
  artist: string
  addedAt: number
  fileName: string
  size: number
  mime?: string
  /** Solo en canciones de audio. */
  blob?: Blob
  /** Solo en partituras. */
  score?: Score
}

const DB_NAME = 'harmonia-songs'
const STORE = 'songs'
const memory = new Map<string, SongRecord>()
let dbPromise: Promise<IDBDatabase | null> | null = null
export let persistent = true

function open(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') throw new Error('sin IndexedDB')
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }) }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => { persistent = false; resolve(null) }
      req.onblocked = () => { persistent = false; resolve(null) }
    } catch {
      persistent = false
      resolve(null)
    }
  })
  return dbPromise
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const r = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(r.result)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  })
}

export async function listSongs(): Promise<SongRecord[]> {
  const db = await open()
  const all = db ? await tx<SongRecord[]>(db, 'readonly', (s) => s.getAll()).catch(() => [] as SongRecord[]) : [...memory.values()]
  return all.sort((a, b) => b.addedAt - a.addedAt)
}

export async function getSong(id: string): Promise<SongRecord | undefined> {
  const db = await open()
  if (!db) return memory.get(id)
  return (await tx<SongRecord | undefined>(db, 'readonly', (s) => s.get(id)).catch(() => undefined)) ?? undefined
}

/** Guarda una canción. Lanza un Error con mensaje legible si el navegador no puede guardarla. */
export async function addSong(rec: SongRecord): Promise<void> {
  const db = await open()
  if (!db) { memory.set(rec.id, rec); return }
  try {
    await tx(db, 'readwrite', (s) => s.put(rec))
  } catch (e) {
    const quota = e instanceof DOMException && e.name === 'QuotaExceededError'
    throw new Error(quota ? 'No hay espacio suficiente en el navegador para guardar esta canción. Borra alguna o usa un archivo más pequeño.' : 'El navegador no ha podido guardar la canción.')
  }
}

export async function deleteSong(id: string): Promise<void> {
  const db = await open()
  if (!db) { memory.delete(id); return }
  await tx(db, 'readwrite', (s) => s.delete(id)).catch(() => undefined)
}
