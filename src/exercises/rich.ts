import { formatNote, formatRoman, formatSymbol, type NoteNaming } from '../music/notes'

/**
 * Texto con marcas que se formatean según la nomenclatura elegida:
 *   {{n:F#4}} nota · {{c:F#m7}} cifrado · {{r:V7/ii}} romano · {{p:C,E,G}} lista de notas
 */
export function rich(text: string, naming: NoteNaming): string {
  return text.replace(/\{\{([ncrp]):([^}]+)\}\}/g, (_m, kind: string, v: string) => {
    switch (kind) {
      case 'n': return formatNote(v, naming)
      case 'c': return formatSymbol(v, naming)
      case 'r': return formatRoman(v)
      default: return v.split(',').map((x) => formatNote(x.trim(), naming)).join(' – ')
    }
  })
}

export const N = (n: string) => `{{n:${n}}}`
export const C = (c: string) => `{{c:${c}}}`
export const R = (r: string) => `{{r:${r}}}`
export const P = (ns: string[]) => `{{p:${ns.join(',')}}}`
