import type { SupabaseClient } from '@supabase/supabase-js'
import { mapNoteRow, type NoteRow } from '../model/mapNote'
import type {
  CreateNoteInput,
  NotesRepository,
  UpdateNoteInput,
} from '../model/notesRepository'
import type { Note } from '../model/types'

export function createSupabaseNotesRepository(
  client: SupabaseClient,
): NotesRepository {
  return {
    async list(): Promise<Note[]> {
      const { data, error } = await client
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as NoteRow[]).map(mapNoteRow)
    },

    async create(input: CreateNoteInput): Promise<Note> {
      const { data, error } = await client
        .from('notes')
        .insert({ text: input.text })
        .select()
        .single()

      if (error) throw error
      return mapNoteRow(data as NoteRow)
    },

    async update(id: string, input: UpdateNoteInput): Promise<Note> {
      const { data, error } = await client
        .from('notes')
        .update({ text: input.text })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return mapNoteRow(data as NoteRow)
    },

    async remove(id: string): Promise<void> {
      const { error } = await client.from('notes').delete().eq('id', id)
      if (error) throw error
    },
  }
}
