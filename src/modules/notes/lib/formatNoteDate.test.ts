import { describe, expect, it } from 'vitest'
import { formatNoteDate } from './formatNoteDate'

describe('formatNoteDate', () => {
  it('returns the original string when the timestamp is invalid', () => {
    expect(formatNoteDate('not-a-date')).toBe('not-a-date')
  })

  it('formats a valid ISO timestamp', () => {
    const formatted = formatNoteDate('2026-08-23T12:00:00.000Z')
    expect(formatted).not.toBe('2026-08-23T12:00:00.000Z')
    expect(formatted).toMatch(/2026/)
  })
})
