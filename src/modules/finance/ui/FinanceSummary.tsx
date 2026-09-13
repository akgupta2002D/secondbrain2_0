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

const EDITABLE: {
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

function EditableChip({
  label,
  tone,
  valueCents,
  busy,
  editing,
  draft,
  onStartEdit,
  onDraftChange,
  onCommit,
  onCancel,
}: {
  label: string
  tone: 'green' | 'blue'
  valueCents: number
  busy: boolean
  editing: boolean
  draft: string
  onStartEdit: () => void
  onDraftChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
}) {
  return (
    <button
      type="button"
      className={`financeChip financeChip--${tone} financeChipButton`}
      disabled={busy && !editing}
      onClick={() => {
        if (!editing) onStartEdit()
      }}
      aria-label={
        editing
          ? `Editing ${label}`
          : `${label} ${formatUsd(valueCents)}. Tap to edit.`
      }
    >
      <span className="financeChipLabel">{label}</span>
      {editing ? (
        <input
          className="financeChipInput"
          value={draft}
          inputMode="decimal"
          aria-label={`Edit ${label}`}
          disabled={busy}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onDraftChange(e.target.value)}
          onFocus={(e) => {
            e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }}
          onBlur={() => {
            onCommit()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onCommit()
            }
            if (e.key === 'Escape') onCancel()
          }}
        />
      ) : (
        <span className="financeChipValue">{formatUsd(valueCents)}</span>
      )}
    </button>
  )
}

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
  const availableCents = currentCents - debtCents

  const [editing, setEditing] = useState<FinanceBucket | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editing) return
    const chip = EDITABLE.find((item) => item.bucket === editing)
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

  const renderEditable = (bucket: FinanceBucket) => {
    const chip = EDITABLE.find((item) => item.bucket === bucket)
    if (!chip) return null
    return (
      <EditableChip
        key={chip.bucket}
        label={chip.label}
        tone={chip.tone}
        valueCents={amounts[chip.centsKey]}
        busy={busy}
        editing={editing === chip.bucket}
        draft={draft}
        onStartEdit={() => setEditing(chip.bucket)}
        onDraftChange={setDraft}
        onCommit={() => {
          void commit()
        }}
        onCancel={() => {
          setEditing(null)
          setError(null)
        }}
      />
    )
  }

  return (
    <section className="financeSummary" aria-label="Balances summary">
      <div
        className="financeChip financeChip--net"
        aria-label={`Available after debt ${formatUsd(availableCents)}`}
      >
        <span className="financeChipLabel">Available</span>
        <span className="financeChipValue">{formatUsd(availableCents)}</span>
      </div>

      {renderEditable('current')}

      <button
        type="button"
        className="financeChip financeChip--red financeChipButton"
        onClick={onOpenDebt}
        aria-label={`Debt ${formatUsd(debtCents)}. Open commitments.`}
      >
        <span className="financeChipLabel">Debt</span>
        <span className="financeChipValue">{formatUsd(debtCents)}</span>
      </button>

      {renderEditable('investments')}
      {renderEditable('emergency')}
      {renderEditable('rewards')}

      {error ? (
        <p className="financeInlineError financeSummaryError" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
