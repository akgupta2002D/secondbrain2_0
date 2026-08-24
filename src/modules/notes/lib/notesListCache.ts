import type { Note } from '../model/types'

let cache: Note[] | null = null

export function readNotesListCache(): Note[] | null {
  return cache
}

export function writeNotesListCache(notes: Note[]): void {
  cache = notes
}

export function clearNotesListCache(): void {
  cache = null
}
