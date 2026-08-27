export type BiographyFact = {
  label: string
  value: string
}

export type BiographyRecord = {
  name: string
  summary: string
  facts: BiographyFact[]
  sourceUrl: string | null
}

export type BiographyResult =
  | { kind: 'ok'; record: BiographyRecord }
  | { kind: 'error'; message: string }
