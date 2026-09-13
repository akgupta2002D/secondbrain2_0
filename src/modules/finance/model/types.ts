export type FinanceBucket = 'current' | 'emergency' | 'rewards' | 'investments'

export type LedgerKind = 'expense' | 'earning'

export type FinanceBalances = {
  currentCents: number
  emergencyCents: number
  rewardsCents: number
  investmentsCents: number
  updatedAt: string
}

export type FinanceCommitment = {
  id: string
  name: string
  amountCents: number
  createdAt: string
}

export type FinanceLedgerEntry = {
  id: string
  kind: LedgerKind
  bucket: FinanceBucket
  amountCents: number
  description: string
  occurredOn: string
  createdAt: string
}

export type FinanceSnapshot = {
  balances: FinanceBalances
  commitments: FinanceCommitment[]
  ledger: FinanceLedgerEntry[]
}

export type CreateLedgerInput = {
  kind: LedgerKind
  bucket: FinanceBucket
  amountCents: number
  description: string
  occurredOn: string
}

export type CreateCommitmentInput = {
  name: string
  amountCents: number
}

export type UpdateCommitmentInput = {
  name?: string
  amountCents?: number
}

export type UpdateBalancesInput = {
  currentCents?: number
  emergencyCents?: number
  rewardsCents?: number
  investmentsCents?: number
}
