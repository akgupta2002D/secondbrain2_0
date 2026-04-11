import type { Thought } from '../model/types'

export function filterThoughts(thoughts: Thought[], query: string): Thought[] {
  const q = query.trim().toLowerCase()
  if (!q) return thoughts
  return thoughts.filter((t) => {
    const title = (t.title ?? '').toLowerCase()
    const body = (t.body ?? '').toLowerCase()
    return title.includes(q) || body.includes(q)
  })
}
