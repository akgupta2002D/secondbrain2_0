import type {
  CreateCommitmentInput,
  CreateLedgerInput,
  FinanceBalances,
  FinanceCommitment,
  FinanceLedgerEntry,
  FinanceSnapshot,
  UpdateBalancesInput,
  UpdateCommitmentInput,
} from './types'

export type FinanceRepository = {
  loadSnapshot(): Promise<FinanceSnapshot>
  updateBalances(input: UpdateBalancesInput): Promise<FinanceBalances>
  createLedgerEntry(input: CreateLedgerInput): Promise<{
    entry: FinanceLedgerEntry
    balances: FinanceBalances
  }>
  listLedger(): Promise<FinanceLedgerEntry[]>
  createCommitment(input: CreateCommitmentInput): Promise<FinanceCommitment>
  updateCommitment(
    id: string,
    input: UpdateCommitmentInput,
  ): Promise<FinanceCommitment>
  removeCommitment(id: string): Promise<void>
}
