import { describe, expect, it } from 'vitest'
import type { Note } from '../model/types'
import {
  clearNotesListCache,
  readNotesListCache,
  writeNotesListCache,
} from './notesListCache'

describe('notesListCache', () => {
  it('stores and clears the last notes list', () => {
    clearNotesListCache()
    expect(readNotesListCache()).toBeNull()

    const notes: Note[] = [{ id: '1', text: 'hello', date: '2026-01-01T00:00:00.000Z' }]
    writeNotesListCache(notes)
    expect(readNotesListCache()).toEqual(notes)

    clearNotesListCache()
    expect(readNotesListCache()).toBeNull()
  })
})
