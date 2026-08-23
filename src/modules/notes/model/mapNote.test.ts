import { describe, expect, it } from 'vitest'
import { mapNoteRow } from './mapNote'

describe('mapNoteRow', () => {
  it('maps created_at onto date and keeps text', () => {
    expect(
      mapNoteRow({
        id: 'n1',
        text: 'hello',
        created_at: '2026-08-23T12:00:00.000Z',
      }),
    ).toEqual({
      id: 'n1',
      text: 'hello',
      date: '2026-08-23T12:00:00.000Z',
    })
  })
})
