import type { FinanceBalances, FinanceBucket, LedgerKind } from '../model/types'

export function applyLedgerToBalances(
  balances: FinanceBalances,
  input: { kind: LedgerKind; bucket: FinanceBucket; amountCents: number },
): FinanceBalances {
  const delta = input.kind === 'earning' ? input.amountCents : -input.amountCents
  const next = { ...balances, updatedAt: new Date().toISOString() }

  switch (input.bucket) {
    case 'current':
      next.currentCents += delta
      break
    case 'emergency':
      next.emergencyCents += delta
      break
    case 'rewards':
      next.rewardsCents += delta
      break
    case 'investments':
      next.investmentsCents += delta
      break
  }

  return next
}

export function sumCommitmentsCents(
  commitments: { amountCents: number }[],
): number {
  return commitments.reduce((sum, item) => sum + item.amountCents, 0)
}
