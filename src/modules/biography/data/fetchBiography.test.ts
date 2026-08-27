import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchBiography } from './fetchBiography'

describe('fetchBiography', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GETs the trimmed name as a query param', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          name: 'Napoleon',
          summary: 'French general and emperor.',
          quick_facts: { BORN: 'August 15, 1769' },
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchBiography(' Napoleon ')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://biography.sarpasahajivan.org/api/biography?name=Napoleon',
    )
    expect(result).toMatchObject({
      kind: 'ok',
      record: { name: 'Napoleon' },
    })
  })

  it('returns a soft error when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    const result = await fetchBiography('Napoleon')

    expect(result.kind).toBe('error')
  })
})
