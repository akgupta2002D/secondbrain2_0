import type { SupabaseClient } from '@supabase/supabase-js'
import { applyLedgerToBalances } from '../lib/applyLedger'
import type { FinanceRepository } from '../model/financeRepository'
import type {
  CreateCommitmentInput,
  CreateLedgerInput,
  FinanceBalances,
  UpdateBalancesInput,
  UpdateCommitmentInput,
} from '../model/types'
import {
  mapBalancesRow,
  mapCommitmentRow,
  mapLedgerRow,
  type FinanceBalancesRow,
  type FinanceCommitmentRow,
  type FinanceLedgerRow,
} from './mapFinance'

function balancesPatch(input: UpdateBalancesInput): Record<string, number | string> {
  const patch: Record<string, number | string> = {
    updated_at: new Date().toISOString(),
  }
  if (input.currentCents !== undefined) patch.current_cents = input.currentCents
  if (input.emergencyCents !== undefined) patch.emergency_cents = input.emergencyCents
  if (input.rewardsCents !== undefined) patch.rewards_cents = input.rewardsCents
  if (input.investmentsCents !== undefined) {
    patch.investments_cents = input.investmentsCents
  }
  return patch
}

export function createSupabaseFinanceRepository(
  client: SupabaseClient,
): FinanceRepository {
  async function requireUserId(): Promise<string> {
    const { data, error } = await client.auth.getUser()
    if (error) throw error
    const id = data.user?.id
    if (!id) throw new Error('Not signed in.')
    return id
  }

  async function ensureBalances(): Promise<FinanceBalances> {
    const userId = await requireUserId()
    const { data, error } = await client
      .from('finance_balances')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    if (data) return mapBalancesRow(data as FinanceBalancesRow)

    const { data: inserted, error: insertError } = await client
      .from('finance_balances')
      .insert({
        user_id: userId,
        current_cents: 0,
        emergency_cents: 0,
        rewards_cents: 0,
        investments_cents: 0,
      })
      .select()
      .single()

    // If a concurrent insert won, read the existing row.
    if (insertError) {
      const { data: existing, error: readError } = await client
        .from('finance_balances')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (readError) throw readError
      if (existing) return mapBalancesRow(existing as FinanceBalancesRow)
      throw insertError
    }
    return mapBalancesRow(inserted as FinanceBalancesRow)
  }

  async function updateOwnBalances(
    patch: Record<string, number | string>,
  ): Promise<FinanceBalances> {
    const userId = await requireUserId()
    const { data, error } = await client
      .from('finance_balances')
      .update(patch)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return mapBalancesRow(data as FinanceBalancesRow)
  }

  return {
    async loadSnapshot() {
      const balances = await ensureBalances()

      const [commitmentsRes, ledgerRes] = await Promise.all([
        client
          .from('finance_commitments')
          .select('*')
          .order('created_at', { ascending: false }),
        client
          .from('finance_ledger')
          .select('*')
          .order('occurred_on', { ascending: false })
          .order('created_at', { ascending: false }),
      ])

      if (commitmentsRes.error) throw commitmentsRes.error
      if (ledgerRes.error) throw ledgerRes.error

      return {
        balances,
        commitments: (commitmentsRes.data as FinanceCommitmentRow[]).map(
          mapCommitmentRow,
        ),
        ledger: (ledgerRes.data as FinanceLedgerRow[]).map(mapLedgerRow),
      }
    },

    async updateBalances(input) {
      await ensureBalances()
      return updateOwnBalances(balancesPatch(input))
    },

    async createLedgerEntry(input: CreateLedgerInput) {
      const balances = await ensureBalances()
      if (input.amountCents <= 0) {
        throw new Error('Amount must be greater than zero.')
      }

      const { data: entryRow, error: entryError } = await client
        .from('finance_ledger')
        .insert({
          kind: input.kind,
          bucket: input.bucket,
          amount_cents: input.amountCents,
          description: input.description.trim(),
          occurred_on: input.occurredOn,
        })
        .select()
        .single()

      if (entryError) throw entryError

      const next = applyLedgerToBalances(balances, input)
      const balanceRow = await updateOwnBalances({
        current_cents: next.currentCents,
        emergency_cents: next.emergencyCents,
        rewards_cents: next.rewardsCents,
        investments_cents: next.investmentsCents,
        updated_at: new Date().toISOString(),
      })

      return {
        entry: mapLedgerRow(entryRow as FinanceLedgerRow),
        balances: balanceRow,
      }
    },

    async listLedger() {
      const { data, error } = await client
        .from('finance_ledger')
        .select('*')
        .order('occurred_on', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as FinanceLedgerRow[]).map(mapLedgerRow)
    },

    async createCommitment(input: CreateCommitmentInput) {
      const { data, error } = await client
        .from('finance_commitments')
        .insert({
          name: input.name.trim(),
          amount_cents: input.amountCents,
        })
        .select()
        .single()

      if (error) throw error
      return mapCommitmentRow(data as FinanceCommitmentRow)
    },

    async updateCommitment(id: string, input: UpdateCommitmentInput) {
      const patch: Record<string, string | number> = {}
      if (input.name !== undefined) patch.name = input.name.trim()
      if (input.amountCents !== undefined) patch.amount_cents = input.amountCents

      const { data, error } = await client
        .from('finance_commitments')
        .update(patch)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return mapCommitmentRow(data as FinanceCommitmentRow)
    },

    async removeCommitment(id: string) {
      const { error } = await client
        .from('finance_commitments')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  }
}
