import { describe, expect, it } from 'vitest'
import { mapBiography } from './mapBiography'

describe('mapBiography', () => {
  it('reads name, summary, and quick facts', () => {
    const result = mapBiography({
      ok: true,
      data: {
        name: 'Napoleon',
        summary: 'French general and emperor.',
        quick_facts: {
          BORN: 'August 15, 1769',
          ASTROLOGICAL_SIGN: 'Leo',
        },
        source_url: 'https://example.com/napoleon',
      },
    })
    expect(result).toEqual({
      kind: 'ok',
      record: {
        name: 'Napoleon',
        summary: 'French general and emperor.',
        facts: [
          { label: 'Born', value: 'August 15, 1769' },
          { label: 'Astrological Sign', value: 'Leo' },
        ],
        sourceUrl: 'https://example.com/napoleon',
      },
    })
  })

  it('returns a soft error when the payload is empty', () => {
    expect(mapBiography({ ok: false })).toMatchObject({ kind: 'error' })
    expect(mapBiography(null)).toMatchObject({ kind: 'error' })
  })
})
