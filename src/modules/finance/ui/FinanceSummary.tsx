import { useEffect, useState } from 'react'
import { centsToDollarsInput, dollarsToCents, formatUsd } from '../model/money'
import type { FinanceBucket } from '../model/types'

type Props = {
  currentCents: number
  debtCents: number
  investmentsCents: number
  emergencyCents: number
  rewardsCents: number
  busy: boolean
  onOpenDebt: () => void
  onSaveBucket: (bucket: FinanceBucket, cents: number) => Promise<void>
}

const CHIP_META: {
  bucket: FinanceBucket
  label: string
  tone: 'green' | 'blue'
  centsKey: 'currentCents' | 'investmentsCents' | 'emergencyCents' | 'rewardsCents'
}[] = [
  { bucket: 'current', label: 'Current', tone: 'green', centsKey: 'currentCents' },
  { bucket: 'investments', label: 'Invested', tone: 'blue', centsKey: 'investmentsCents' },
  { bucket: 'emergency', label: 'Emergency', tone: 'blue', centsKey: 'emergencyCents' },
  { bucket: 'rewards', label: 'Rewards', tone: 'blue', centsKey: 'rewardsCents' },
]

export function FinanceSummary({
  currentCents,
  debtCents,
  investmentsCents,
  emergencyCents,
  rewardsCents,
  busy,
  onOpenDebt,
  onSaveBucket,
}: Props) {
  const amounts = {
    currentCents,
    investmentsCents,
    emergencyCents,
    rewardsCents,
  }

  const [editing, setEditing] = useState<FinanceBucket | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editing) return
    const chip = CHIP_META.find((item) => item.bucket === editing)
    if (!chip) return
    setDraft(centsToDollarsInput(amounts[chip.centsKey]))
    setError(null)
  }, [editing, currentCents, investmentsCents, emergencyCents, rewardsCents])

  const commit = async (): Promise<void> => {
    if (!editing) return
    const cents = dollarsToCents(draft)
    if (cents === null) {
      setError('Enter a valid dollar amount.')
      return
    }
    try {
      await onSaveBucket(editing, cents)
      setEditing(null)
      setError(null)
    } catch {
      setError('Could not save that balance. Try again.')
    }
  }

  return (
    <section className="financeSummary" aria-label="Balances summary">
      {CHIP_META.map((chip) => {
        const value = amounts[chip.centsKey]
        const isEditing = editing === chip.bucket
        return (
          <button
            key={chip.bucket}
            type="button"
            className={`financeChip financeChip--${chip.tone} financeChipButton`}
            disabled={busy && !isEditing}
            onClick={() => {
              if (!isEditing) setEditing(chip.bucket)
            }}
            aria-label={
              isEditing
                ? `Editing ${chip.label}`
                : `${chip.label} ${formatUsd(value)}. Tap to edit.`
            }
          >
            <span className="financeChipLabel">{chip.label}</span>
            {isEditing ? (
              <input
                className="financeChipInput"
                value={draft}
                inputMode="decimal"
                aria-label={`Edit ${chip.label}`}
                disabled={busy}
                autoFocus
                onClick={(e) => e.stopPropagation()}
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
              <span className="financeChipValue">{formatUsd(value)}</span>
            )}
          </button>
        )
      })}

      <button
        type="button"
        className="financeChip financeChip--red financeChipButton"
        onClick={onOpenDebt}
        aria-label={`Debt ${formatUsd(debtCents)}. Open commitments.`}
      >
        <span className="financeChipLabel">Debt</span>
        <span className="financeChipValue">{formatUsd(debtCents)}</span>
      </button>

      {error ? (
        <p className="financeInlineError financeSummaryError" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
