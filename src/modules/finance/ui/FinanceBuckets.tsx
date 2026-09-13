import { useEffect, useState } from 'react'
import { centsToDollarsInput, dollarsToCents, formatUsd } from '../model/money'
import type { FinanceBalances, FinanceBucket } from '../model/types'

type Props = {
  balances: FinanceBalances
  busy: boolean
  onSave: (bucket: FinanceBucket, cents: number) => Promise<void>
}

const ROWS: { bucket: FinanceBucket; label: string }[] = [
  { bucket: 'current', label: 'Current' },
  { bucket: 'emergency', label: 'Emergency' },
  { bucket: 'rewards', label: 'Rewards' },
  { bucket: 'investments', label: 'Investments' },
]

function centsFor(balances: FinanceBalances, bucket: FinanceBucket): number {
  switch (bucket) {
    case 'current':
      return balances.currentCents
    case 'emergency':
      return balances.emergencyCents
    case 'rewards':
      return balances.rewardsCents
    case 'investments':
      return balances.investmentsCents
  }
}

export function FinanceBuckets({ balances, busy, onSave }: Props) {
  const [editing, setEditing] = useState<FinanceBucket | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editing) return
    setDraft(centsToDollarsInput(centsFor(balances, editing)))
    setError(null)
  }, [editing, balances])

  const commit = async (): Promise<void> => {
    if (!editing) return
    const cents = dollarsToCents(draft)
    if (cents === null) {
      setError('Enter a valid dollar amount.')
      return
    }
    try {
      await onSave(editing, cents)
      setEditing(null)
      setError(null)
    } catch {
      setError('Could not save that balance. Try again.')
    }
  }

  return (
    <section className="financeBuckets" aria-label="Editable balances">
      {ROWS.map((row) => {
        const value = centsFor(balances, row.bucket)
        const isEditing = editing === row.bucket
        return (
          <div key={row.bucket} className="financeBucketRow">
            <span className="financeBucketLabel">{row.label}</span>
            {isEditing ? (
              <input
                className="financeBucketInput"
                value={draft}
                inputMode="decimal"
                aria-label={`Edit ${row.label}`}
                disabled={busy}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  void commit()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void commit()
                  }
                  if (e.key === 'Escape') {
                    setEditing(null)
                    setError(null)
                  }
                }}
              />
            ) : (
              <button
                type="button"
                className="financeBucketValue"
                disabled={busy}
                onClick={() => setEditing(row.bucket)}
              >
                {formatUsd(value)}
              </button>
            )}
          </div>
        )
      })}
      {error ? (
        <p className="financeInlineError" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
