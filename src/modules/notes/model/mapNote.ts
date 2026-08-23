import type { Note } from './types'

export type NoteRow = {
  id: string
  text: string
  created_at: string
}

export function mapNoteRow(row: NoteRow): Note {
  return {
    id: row.id,
    text: row.text,
    date: row.created_at,
  }
}
