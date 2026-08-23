import type { Note } from './types'

export type CreateNoteInput = {
  text: string
}

export type UpdateNoteInput = {
  text: string
}

export type NotesRepository = {
  list(): Promise<Note[]>
  create(input: CreateNoteInput): Promise<Note>
  update(id: string, input: UpdateNoteInput): Promise<Note>
  remove(id: string): Promise<void>
}
