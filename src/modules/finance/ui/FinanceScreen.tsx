import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient, getSupabaseConfig } from '../../../lib/supabaseClient'
import { createSupabaseFinanceRepository } from '../data/supabaseFinanceRepository'
import { sumCommitmentsCents } from '../lib/applyLedger'
import type { FinanceRepository } from '../model/financeRepository'
import type {
  CreateCommitmentInput,
  CreateLedgerInput,
  FinanceBalances,
  FinanceBucket,
  FinanceCommitment,
  FinanceLedgerEntry,
} from '../model/types'
import { emptyBalances } from '../data/mapFinance'
import { FinanceDebtSheet } from './FinanceDebtSheet'
import { FinanceEntryForm } from './FinanceEntryForm'
import { FinanceLogSheet } from './FinanceLogSheet'
import { FinanceSummary } from './FinanceSummary'

function LogIcon() {
  return (
    <svg className="financeLogIcon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M6 3h9.5A2.5 2.5 0 0 1 18 5.5V21H7.5A1.5 1.5 0 0 1 6 19.5V3zm2 2v14h8V5.5a.5.5 0 0 0-.5-.5H8zm1.5 3h5v2h-5V8zm0 3.5h5V13h-5v-1.5zm0 3.5h3.5V16.5H9.5z"
      />
    </svg>
  )
}

export function FinanceScreen() {
  const configured = getSupabaseConfig() !== null
  const supabase = getSupabaseClient()

  const repo: FinanceRepository | null = useMemo(() => {
    if (!supabase) return null
    return createSupabaseFinanceRepository(supabase)
  }, [supabase])

  const [balances, setBalances] = useState<FinanceBalances>(emptyBalances)
  const [commitments, setCommitments] = useState<FinanceCommitment[]>([])
  const [ledger, setLedger] = useState<FinanceLedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [debtOpen, setDebtOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)

  const refresh = useCallback(async (): Promise<void> => {
    if (!repo) return
    setLoadError(null)
    try {
      const snapshot = await repo.loadSnapshot()
      setBalances(snapshot.balances)
      setCommitments(snapshot.commitments)
      setLedger(snapshot.ledger)
    } catch {
      setLoadError('Could not load finance data. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [repo])

  useEffect(() => {
    if (!repo) {
      setLoading(false)
      return
    }
    void refresh()
  }, [repo, refresh])

  const debtCents = sumCommitmentsCents(commitments)

  const onSaveBucket = async (
    bucket: FinanceBucket,
    cents: number,
  ): Promise<void> => {
    if (!repo) return
    setBusy(true)
    try {
      const patch =
        bucket === 'current'
          ? { currentCents: cents }
          : bucket === 'emergency'
            ? { emergencyCents: cents }
            : bucket === 'rewards'
              ? { rewardsCents: cents }
              : { investmentsCents: cents }
      const next = await repo.updateBalances(patch)
      setBalances(next)
    } finally {
      setBusy(false)
    }
  }

  const onSubmitEntry = async (input: CreateLedgerInput): Promise<void> => {
    if (!repo) throw new Error('not configured')
    setBusy(true)
    try {
      const result = await repo.createLedgerEntry(input)
      setBalances(result.balances)
      setLedger((prev) => [result.entry, ...prev])
    } finally {
      setBusy(false)
    }
  }

  const onAddCommitment = async (
    input: CreateCommitmentInput,
  ): Promise<void> => {
    if (!repo) return
    setBusy(true)
    try {
      const created = await repo.createCommitment(input)
      setCommitments((prev) => [created, ...prev])
    } finally {
      setBusy(false)
    }
  }

  const onRemoveCommitment = async (id: string): Promise<void> => {
    if (!repo) return
    setBusy(true)
    try {
      await repo.removeCommitment(id)
      setCommitments((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setBusy(false)
    }
  }

  if (!configured || !repo) {
    return (
      <main className="screen financeScreen" aria-label="Finance">
        <h1 className="financeTitle">Finance</h1>
        <div className="notesConfigHint">
          <p className="notesConfigTitle">Supabase not configured</p>
          <p className="notesConfigBody">
            Add <code className="notesCode">VITE_SUPABASE_URL</code> and{' '}
            <code className="notesCode">VITE_SUPABASE_PUBLISHABLE_KEY</code>, run{' '}
            <code className="notesCode">supabase/migrations/005_finance.sql</code>,
            then restart the dev server.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="screen financeScreen" aria-label="Finance">
      <header className="financeHeader">
        <h1 className="financeTitle">Finance</h1>
        <button
          type="button"
          className="financeLogButton"
          onClick={() => setLogOpen(true)}
          aria-label="Open transaction log"
        >
          <LogIcon />
        </button>
      </header>

      {loadError ? (
        <p className="financeInlineError" role="alert">
          {loadError}{' '}
          <button
            type="button"
            className="financeTextButton"
            onClick={() => {
              setLoading(true)
              void refresh()
            }}
          >
            Retry
          </button>
        </p>
      ) : null}

      {loading ? (
        <p className="financeMuted" role="status">
          Loading…
        </p>
      ) : (
        <>
          <FinanceSummary
            currentCents={balances.currentCents}
            debtCents={debtCents}
            investmentsCents={balances.investmentsCents}
            emergencyCents={balances.emergencyCents}
            rewardsCents={balances.rewardsCents}
            busy={busy}
            onOpenDebt={() => setDebtOpen(true)}
            onSaveBucket={onSaveBucket}
          />

          <h2 className="financeSectionTitle">New entry</h2>
          <FinanceEntryForm busy={busy} onSubmit={onSubmitEntry} />
        </>
      )}

      <FinanceDebtSheet
        open={debtOpen}
        commitments={commitments}
        busy={busy}
        onClose={() => setDebtOpen(false)}
        onAdd={onAddCommitment}
        onRemove={onRemoveCommitment}
      />

      <FinanceLogSheet
        open={logOpen}
        entries={ledger}
        onClose={() => setLogOpen(false)}
      />
    </main>
  )
}
