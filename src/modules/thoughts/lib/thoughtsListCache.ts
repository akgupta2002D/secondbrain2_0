import type { Thought } from '../model/types'

let cache: Thought[] | null = null

export function readThoughtsListCache(): Thought[] | null {
  return cache
}

export function writeThoughtsListCache(thoughts: Thought[]): void {
  cache = thoughts
}

export function clearThoughtsListCache(): void {
  cache = null
}
