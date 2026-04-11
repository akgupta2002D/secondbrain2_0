import type { Thought } from './types'

export type CreateThoughtInput = {
  title?: string | null
  body: string
}

export type UpdateThoughtInput = {
  title?: string | null
  body: string
}

export type ThoughtsRepository = {
  list(): Promise<Thought[]>
  create(input: CreateThoughtInput): Promise<Thought>
  update(id: string, input: UpdateThoughtInput): Promise<Thought>
  remove(id: string): Promise<void>
}
