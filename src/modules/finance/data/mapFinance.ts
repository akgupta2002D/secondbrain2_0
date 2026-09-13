import type {
  FinanceBalances,
  FinanceBucket,
  FinanceCommitment,
  FinanceLedgerEntry,
  LedgerKind,
} from '../model/types'

export type FinanceBalancesRow = {
  current_cents: number
  emergency_cents: number
  rewards_cents: number
  investments_cents: number
  updated_at: string
}

export type FinanceCommitmentRow = {
  id: string
  name: string
  amount_cents: number
  created_at: string
}

export type FinanceLedgerRow = {
  id: string
  kind: string
  bucket: string
  amount_cents: number
  description: string
  occurred_on: string
  created_at: string
}

const BUCKETS: FinanceBucket[] = [
  'current',
  'emergency',
  'rewards',
  'investments',
]

function isBucket(value: string): value is FinanceBucket {
  return (BUCKETS as string[]).includes(value)
}

function isKind(value: string): value is LedgerKind {
  return value === 'expense' || value === 'earning'
}

export function mapBalancesRow(row: FinanceBalancesRow): FinanceBalances {
  return {
    currentCents: Number(row.current_cents) || 0,
    emergencyCents: Number(row.emergency_cents) || 0,
    rewardsCents: Number(row.rewards_cents) || 0,
    investmentsCents: Number(row.investments_cents) || 0,
    updatedAt: row.updated_at,
  }
}

export function mapCommitmentRow(row: FinanceCommitmentRow): FinanceCommitment {
  return {
    id: row.id,
    name: row.name,
    amountCents: Number(row.amount_cents) || 0,
    createdAt: row.created_at,
  }
}

export function mapLedgerRow(row: FinanceLedgerRow): FinanceLedgerEntry {
  const kind = isKind(row.kind) ? row.kind : 'expense'
  const bucket = isBucket(row.bucket) ? row.bucket : 'current'
  return {
    id: row.id,
    kind,
    bucket,
    amountCents: Number(row.amount_cents) || 0,
    description: typeof row.description === 'string' ? row.description : '',
    occurredOn: row.occurred_on,
    createdAt: row.created_at,
  }
}

export function emptyBalances(updatedAt = new Date().toISOString()): FinanceBalances {
  return {
    currentCents: 0,
    emergencyCents: 0,
    rewardsCents: 0,
    investmentsCents: 0,
    updatedAt,
  }
}
