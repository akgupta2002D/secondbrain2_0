import { describe, expect, it } from 'vitest'
import { organicBlobPath, pointOnBlobToward, stringSeedRadians, stringVineAsymmetry } from './organicBlobPath'

describe('organicBlobPath', () => {
  it('returns a closed path', () => {
    const d = organicBlobPath(100, 100, 40, 1.2)
    expect(d.startsWith('M ')).toBe(true)
    expect(d.endsWith(' Z')).toBe(true)
  })

  it('keeps pointOnBlobToward near nominal radius', () => {
    const c = { x: 200, y: 200 }
    const p = pointOnBlobToward(100, 100, 40, 0.5, c)
    const dist = Math.hypot(p.x - 100, p.y - 100)
    expect(dist).toBeGreaterThan(30)
    expect(dist).toBeLessThan(52)
  })
})

describe('stringSeedRadians', () => {
  it('is stable per id', () => {
    expect(stringSeedRadians('ai')).toBe(stringSeedRadians('ai'))
  })
})

describe('stringVineAsymmetry', () => {
  it('stays in [-1, 1]', () => {
    for (const id of ['a', 'family', 'x'.repeat(40)]) {
      const a = stringVineAsymmetry(id)
      expect(a).toBeGreaterThanOrEqual(-1)
      expect(a).toBeLessThanOrEqual(1)
    }
  })
})
