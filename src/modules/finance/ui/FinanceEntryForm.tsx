import { useState, type FormEvent } from 'react'
import { scrollFinanceFieldIntoView } from '../lib/useKeyboardInset'
import { dollarsToCents, todayIsoDate } from '../model/money'
import type { CreateLedgerInput, FinanceBucket, LedgerKind } from '../model/types'

type Props = {
  busy: boolean
  onSubmit: (input: CreateLedgerInput) => Promise<void>
}

const BUCKETS: { id: FinanceBucket; label: string }[] = [
  { id: 'current', label: 'Current' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'investments', label: 'Investments' },
]

export function FinanceEntryForm({ busy, onSubmit }: Props) {
  const [kind, setKind] = useState<LedgerKind>('expense')
  const [bucket, setBucket] = useState<FinanceBucket>('current')
  const [date, setDate] = useState(todayIsoDate)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const clear = (): void => {
    setKind('expense')
    setBucket('current')
    setDate(todayIsoDate())
    setAmount('')
    setDescription('')
    setError(null)
  }

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const cents = dollarsToCents(amount)
    if (cents === null || cents <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    const text = description.trim()
    if (!text) {
      setError('Add a short description.')
      return
    }
    if (!date) {
      setError('Pick a date.')
      return
    }

    try {
      await onSubmit({
        kind,
        bucket,
        amountCents: cents,
        description: text.slice(0, 120),
        occurredOn: date,
      })
      clear()
    } catch {
      setError('Could not save that entry. Try again in a moment.')
    }
  }

  return (
    <form className="financeForm" onSubmit={(e) => void handleSubmit(e)}>
      <div className="financeKindToggle" role="group" aria-label="Entry type">
        <button
          type="button"
          className={
            kind === 'expense'
              ? 'financeKindButton financeKindButton--activeExpense'
              : 'financeKindButton'
          }
          onClick={() => setKind('expense')}
          disabled={busy}
        >
          Expense
        </button>
        <button
          type="button"
          className={
            kind === 'earning'
              ? 'financeKindButton financeKindButton--activeEarning'
              : 'financeKindButton'
          }
          onClick={() => setKind('earning')}
          disabled={busy}
        >
          Earning
        </button>
      </div>

      <label className="financeField financeField--row">
        <span>Bucket</span>
        <select
          className="financeSelect"
          value={bucket}
          disabled={busy}
          onChange={(e) => setBucket(e.target.value as FinanceBucket)}
          onFocus={(e) => scrollFinanceFieldIntoView(e.target)}
        >
          {BUCKETS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="financeField financeField--row">
        <span>Date</span>
        <input
          className="financeInput"
          type="date"
          value={date}
          disabled={busy}
          onChange={(e) => setDate(e.target.value)}
          onFocus={(e) => scrollFinanceFieldIntoView(e.target)}
        />
      </label>

      <label className="financeField financeField--row">
        <span>Amount</span>
        <input
          className="financeInput"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          disabled={busy}
          onChange={(e) => setAmount(e.target.value)}
          onFocus={(e) => scrollFinanceFieldIntoView(e.target)}
        />
      </label>

      <label className="financeField financeField--row">
        <span>Note</span>
        <input
          className="financeInput"
          maxLength={120}
          placeholder="Short note"
          value={description}
          disabled={busy}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={(e) => scrollFinanceFieldIntoView(e.target)}
        />
      </label>

      {error ? (
        <p className="financeInlineError" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="financeSubmit" disabled={busy}>
        {busy ? 'Saving…' : 'Submit'}
      </button>
    </form>
  )
}
