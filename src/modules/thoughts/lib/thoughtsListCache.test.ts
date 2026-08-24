import { describe, expect, it } from 'vitest'
import type { Thought } from '../model/types'
import {
  clearThoughtsListCache,
  readThoughtsListCache,
  writeThoughtsListCache,
} from './thoughtsListCache'

describe('thoughtsListCache', () => {
  it('stores and clears the last thoughts list', () => {
    clearThoughtsListCache()
    expect(readThoughtsListCache()).toBeNull()

    const thoughts: Thought[] = [
      {
        id: '1',
        title: 'Hello',
        body: 'Hello',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]
    writeThoughtsListCache(thoughts)
    expect(readThoughtsListCache()).toEqual(thoughts)

    clearThoughtsListCache()
    expect(readThoughtsListCache()).toBeNull()
  })
})
