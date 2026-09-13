import { useState, type FormEvent } from 'react'
import { scrollFinanceFieldIntoView } from '../lib/useKeyboardInset'
import { dollarsToCents, formatUsd } from '../model/money'
import type { CreateCommitmentInput, FinanceCommitment } from '../model/types'

type Props = {
  open: boolean
  commitments: FinanceCommitment[]
  busy: boolean
  onClose: () => void
  onAdd: (input: CreateCommitmentInput) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function FinanceDebtSheet({
  open,
  commitments,
  busy,
  onClose,
  onAdd,
  onRemove,
}: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const total = commitments.reduce((sum, item) => sum + item.amountCents, 0)

  const handleAdd = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const cents = dollarsToCents(amount)
    if (!name.trim()) {
      setError('Name the commitment.')
      return
    }
    if (cents === null || cents <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    try {
      await onAdd({ name: name.trim().slice(0, 80), amountCents: cents })
      setName('')
      setAmount('')
      setError(null)
    } catch {
      setError('Could not add that commitment.')
    }
  }

  return (
    <div className="financeSheetScrim" role="presentation" onClick={onClose}>
      <div
        className="financeSheet"
        role="dialog"
        aria-modal="true"
        aria-label="Debt commitments"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="financeSheetHeader">
          <div>
            <h2 className="financeSheetTitle">Debt</h2>
            <p className="financeSheetSub">Total {formatUsd(total)}</p>
          </div>
          <button
            type="button"
            className="financeSheetClose"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </header>

        <ul className="financeCommitmentList">
          {commitments.length === 0 ? (
            <li className="financeEmptyHint">No commitments yet.</li>
          ) : (
            commitments.map((item) => (
              <li key={item.id} className="financeCommitmentItem">
                <div className="financeCommitmentCopy">
                  <span className="financeCommitmentName">{item.name}</span>
                  <span className="financeCommitmentAmount">
                    {formatUsd(item.amountCents)}
                  </span>
                </div>
                <button
                  type="button"
                  className="financeCommitmentRemove"
                  disabled={busy}
                  aria-label={`Remove ${item.name}`}
                  onClick={() => {
                    void onRemove(item.id)
                  }}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>

        <form className="financeCommitmentForm" onSubmit={(e) => void handleAdd(e)}>
          <label className="financeField financeField--row">
            <span>Name</span>
            <input
              className="financeInput"
              placeholder="Commitment"
              value={name}
              disabled={busy}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => scrollFinanceFieldIntoView(e.target)}
            />
          </label>
          <label className="financeField financeField--row">
            <span>Amount</span>
            <input
              className="financeInput"
              placeholder="0.00"
              inputMode="decimal"
              value={amount}
              disabled={busy}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={(e) => scrollFinanceFieldIntoView(e.target)}
            />
          </label>
          {error ? (
            <p className="financeInlineError" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="financeSubmit" disabled={busy}>
            Add
          </button>
        </form>
      </div>
    </div>
  )
}
