import { describe, expect, it } from 'vitest'
import { ringNodeFontSize, ringNodeRadius } from './ringNodeLabelLayout'

describe('ringNodeLabelLayout', () => {
  it('grows radius for longer first line', () => {
    const short = ringNodeRadius('Hi', 'Yo', 8)
    const long = ringNodeRadius('Charcoal', 'Craft', 8)
    expect(long).toBeGreaterThanOrEqual(short)
  })

  it('clamps font size', () => {
    const fs = ringNodeFontSize('A', 'B', 50)
    expect(fs).toBeGreaterThanOrEqual(7.25)
    expect(fs).toBeLessThanOrEqual(11.25)
  })
})
