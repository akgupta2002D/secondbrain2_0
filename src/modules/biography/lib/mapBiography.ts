import type { BiographyFact, BiographyRecord, BiographyResult } from '../model/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function displayLabel(raw: string): string {
  const spaced = raw.replace(/_/g, ' ').trim().toLowerCase()
  if (!spaced) return raw
  return spaced.replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function readFacts(value: unknown): BiographyFact[] {
  if (!isRecord(value)) return []
  const facts: BiographyFact[] = []
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw !== 'string') continue
    const text = raw.trim()
    if (!text) continue
    facts.push({ label: displayLabel(key), value: text })
  }
  return facts
}

export function mapBiography(payload: unknown): BiographyResult {
  if (!isRecord(payload)) {
    return { kind: 'error', message: 'That lookup did not come back clearly. Try another name.' }
  }
  if (payload.ok === false) {
    return { kind: 'error', message: 'No biography found for that name. Try another spelling.' }
  }
  if (!isRecord(payload.data)) {
    return { kind: 'error', message: 'No biography found for that name. Try another spelling.' }
  }

  const name =
    typeof payload.data.name === 'string' ? payload.data.name.trim() : ''
  const summary =
    typeof payload.data.summary === 'string' ? payload.data.summary.trim() : ''
  if (!name && !summary) {
    return { kind: 'error', message: 'No biography found for that name. Try another spelling.' }
  }

  const sourceUrl =
    typeof payload.data.source_url === 'string' && payload.data.source_url.trim()
      ? payload.data.source_url.trim()
      : null

  const record: BiographyRecord = {
    name: name || 'Unknown',
    summary,
    facts: readFacts(payload.data.quick_facts),
    sourceUrl,
  }
  return { kind: 'ok', record }
}
