import { describe, expect, it } from 'vitest'
import { applyLedgerToBalances, sumCommitmentsCents } from './applyLedger'
import { emptyBalances } from '../data/mapFinance'

describe('applyLedger', () => {
  it('adds earnings and subtracts expenses on the chosen bucket', () => {
    const base = emptyBalances()
    const earned = applyLedgerToBalances(base, {
      kind: 'earning',
      bucket: 'current',
      amountCents: 2500,
    })
    expect(earned.currentCents).toBe(2500)

    const spent = applyLedgerToBalances(earned, {
      kind: 'expense',
      bucket: 'emergency',
      amountCents: 400,
    })
    expect(spent.currentCents).toBe(2500)
    expect(spent.emergencyCents).toBe(-400)
  })

  it('sums commitment amounts', () => {
    expect(
      sumCommitmentsCents([
        { amountCents: 1000 },
        { amountCents: 250 },
      ]),
    ).toBe(1250)
  })
})
