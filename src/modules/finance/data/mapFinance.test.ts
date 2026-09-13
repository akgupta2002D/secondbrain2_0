import { describe, expect, it } from 'vitest'
import {
  mapBalancesRow,
  mapCommitmentRow,
  mapLedgerRow,
} from './mapFinance'

describe('mapFinance', () => {
  it('maps balance, commitment, and ledger rows', () => {
    expect(
      mapBalancesRow({
        current_cents: 100,
        emergency_cents: 200,
        rewards_cents: 300,
        investments_cents: 400,
        updated_at: '2026-01-01T00:00:00Z',
      }),
    ).toEqual({
      currentCents: 100,
      emergencyCents: 200,
      rewardsCents: 300,
      investmentsCents: 400,
      updatedAt: '2026-01-01T00:00:00Z',
    })

    expect(
      mapCommitmentRow({
        id: 'c1',
        name: 'Card',
        amount_cents: 5000,
        created_at: '2026-01-02T00:00:00Z',
      }),
    ).toMatchObject({ id: 'c1', name: 'Card', amountCents: 5000 })

    expect(
      mapLedgerRow({
        id: 'l1',
        kind: 'expense',
        bucket: 'current',
        amount_cents: 999,
        description: 'Coffee',
        occurred_on: '2026-01-03',
        created_at: '2026-01-03T12:00:00Z',
      }),
    ).toMatchObject({
      id: 'l1',
      kind: 'expense',
      bucket: 'current',
      amountCents: 999,
      description: 'Coffee',
    })
  })
})
