import { describe, expect, it } from 'vitest'
import { filterThoughts } from './filterThoughts'
import type { Thought } from '../model/types'

const base = (over: Partial<Thought>): Thought => ({
  id: '1',
  userId: 'u',
  title: null,
  body: '',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...over,
})

describe('filterThoughts', () => {
  it('returns all when query empty', () => {
    const rows = [base({ id: 'a', body: 'hello' })]
    expect(filterThoughts(rows, '   ')).toEqual(rows)
  })

  it('filters by body substring', () => {
    const rows = [
      base({ id: '1', body: 'alpha' }),
      base({ id: '2', body: 'beta' }),
    ]
    expect(filterThoughts(rows, 'alp').map((t) => t.id)).toEqual(['1'])
  })

  it('filters by title substring', () => {
    const rows = [base({ id: '1', title: 'Meeting notes', body: 'x' })]
    expect(filterThoughts(rows, 'meet').length).toBe(1)
  })
})
