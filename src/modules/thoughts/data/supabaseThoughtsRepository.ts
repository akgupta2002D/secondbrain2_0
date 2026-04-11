import type { SupabaseClient } from '@supabase/supabase-js'
import type { Thought } from '../model/types'
import type {
  CreateThoughtInput,
  ThoughtsRepository,
  UpdateThoughtInput,
} from '../model/thoughtsRepository'

type ThoughtRow = {
  id: string
  user_id: string
  title: string | null
  body: string
  created_at: string
  updated_at: string
}

function mapRow(row: ThoughtRow): Thought {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function createSupabaseThoughtsRepository(
  client: SupabaseClient,
): ThoughtsRepository {
  return {
    async list(): Promise<Thought[]> {
      const { data, error } = await client
        .from('thoughts')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return (data as ThoughtRow[]).map(mapRow)
    },

    async create(input: CreateThoughtInput): Promise<Thought> {
      const {
        data: { user },
        error: userErr,
      } = await client.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Not signed in')

      const { data, error } = await client
        .from('thoughts')
        .insert({
          user_id: user.id,
          title: input.title ?? null,
          body: input.body,
        })
        .select()
        .single()

      if (error) throw error
      return mapRow(data as ThoughtRow)
    },

    async update(id: string, input: UpdateThoughtInput): Promise<Thought> {
      const { data, error } = await client
        .from('thoughts')
        .update({
          title: input.title ?? null,
          body: input.body,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return mapRow(data as ThoughtRow)
    },

    async remove(id: string): Promise<void> {
      const { error } = await client.from('thoughts').delete().eq('id', id)
      if (error) throw error
    },
  }
}
