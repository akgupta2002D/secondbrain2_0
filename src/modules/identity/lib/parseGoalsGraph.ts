import type { GoalsGraphData, GoalsGraphNode } from '../model/types'

export type ParseGoalsGraphResult =
  | { ok: true; data: GoalsGraphData }
  | { ok: false; message: string }

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const nonEmpty = (v: unknown, path: string): string | null => {
  if (typeof v !== 'string' || v.trim().length === 0) return `Expected non-empty string at ${path}`
  return null
}

const parseNode = (raw: unknown, index: number): GoalsGraphNode | string => {
  if (!isRecord(raw)) return `nodes[${index}] must be an object`
  const idErr = nonEmpty(raw.id, `nodes[${index}].id`)
  if (idErr) return idErr
  const labelErr = nonEmpty(raw.label, `nodes[${index}].label`)
  if (labelErr) return labelErr

  const node: GoalsGraphNode = {
    id: (raw.id as string).trim(),
    label: (raw.label as string).trim(),
  }
  if (typeof raw.detail === 'string' && raw.detail.trim().length > 0) {
    node.detail = raw.detail.trim()
  }
  if (typeof raw.strokeColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.strokeColor)) {
    node.strokeColor = raw.strokeColor
  }
  return node
}

const MAX_NODES = 32

/** Parse bundled JSON for the Identity module goals graph. Add or remove entries in goalsGraph.json. */
export function parseGoalsGraph(input: unknown): ParseGoalsGraphResult {
  if (!isRecord(input)) return { ok: false, message: 'Root must be an object' }
  if (input.version !== 1) return { ok: false, message: 'Unsupported version (expected 1)' }

  if (!isRecord(input.center)) return { ok: false, message: 'center must be an object' }
  const cid = nonEmpty(input.center.id, 'center.id')
  if (cid) return { ok: false, message: cid }
  const clabel = nonEmpty(input.center.label, 'center.label')
  if (clabel) return { ok: false, message: clabel }

  if (!Array.isArray(input.nodes)) return { ok: false, message: 'nodes must be an array' }
  if (input.nodes.length === 0) return { ok: false, message: 'nodes must contain at least one goal' }
  if (input.nodes.length > MAX_NODES) {
    return { ok: false, message: `nodes must have at most ${MAX_NODES} entries` }
  }

  const nodes: GoalsGraphNode[] = []
  const seen = new Set<string>()
  for (let i = 0; i < input.nodes.length; i++) {
    const parsed = parseNode(input.nodes[i], i)
    if (typeof parsed === 'string') return { ok: false, message: parsed }
    if (seen.has(parsed.id)) return { ok: false, message: `Duplicate node id: ${parsed.id}` }
    seen.add(parsed.id)
    nodes.push(parsed)
  }

  if (seen.has((input.center.id as string).trim())) {
    return { ok: false, message: 'A node id must not match center.id' }
  }

  return {
    ok: true,
    data: {
      version: 1,
      center: {
        id: (input.center.id as string).trim(),
        label: (input.center.label as string).trim(),
      },
      nodes,
    },
  }
}
