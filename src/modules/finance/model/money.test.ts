import { describe, expect, it } from 'vitest'
import {
  centsToDollarsInput,
  dollarsToCents,
  formatUsd,
} from './money'

describe('money', () => {
  it('parses dollars to cents', () => {
    expect(dollarsToCents('12.34')).toBe(1234)
    expect(dollarsToCents('12')).toBe(1200)
    expect(dollarsToCents('$1,200.05')).toBe(120005)
    expect(dollarsToCents('abc')).toBeNull()
    expect(dollarsToCents('')).toBeNull()
  })

  it('formats cents as USD', () => {
    expect(formatUsd(1234)).toBe('$12.34')
    expect(formatUsd(-500)).toBe('-$5.00')
    expect(centsToDollarsInput(105)).toBe('1.05')
  })
})
