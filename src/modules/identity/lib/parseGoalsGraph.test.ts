import { describe, expect, it } from 'vitest'
import { parseGoalsGraph } from './parseGoalsGraph'

describe('parseGoalsGraph', () => {
  it('accepts minimal valid graph', () => {
    const r = parseGoalsGraph({
      version: 1,
      center: { id: 'me', label: 'Me' },
      nodes: [{ id: 'a', label: 'A' }],
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.nodes).toHaveLength(1)
  })

  it('rejects duplicate node ids', () => {
    const r = parseGoalsGraph({
      version: 1,
      center: { id: 'me', label: 'Me' },
      nodes: [
        { id: 'x', label: '1' },
        { id: 'x', label: '2' },
      ],
    })
    expect(r.ok).toBe(false)
  })

  it('rejects node id colliding with center', () => {
    const r = parseGoalsGraph({
      version: 1,
      center: { id: 'me', label: 'Me' },
      nodes: [{ id: 'me', label: 'Bad' }],
    })
    expect(r.ok).toBe(false)
  })
})
