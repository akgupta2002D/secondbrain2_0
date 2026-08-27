import { mapBiography } from '../lib/mapBiography'
import type { BiographyResult } from '../model/types'

const BIOGRAPHY_API = 'https://biography.sarpasahajivan.org/api/biography'

export async function fetchBiography(name: string): Promise<BiographyResult> {
  const trimmed = name.trim()
  if (!trimmed) {
    return { kind: 'error', message: 'Type a name first.' }
  }

  try {
    const url = new URL(BIOGRAPHY_API)
    url.searchParams.set('name', trimmed)
    const response = await fetch(url.toString())
    if (!response.ok) {
      return {
        kind: 'error',
        message: 'That lookup did not work. Try another name in a moment.',
      }
    }
    const json: unknown = await response.json()
    return mapBiography(json)
  } catch {
    return {
      kind: 'error',
      message: 'Could not reach the biography service. Try again in a moment.',
    }
  }
}
