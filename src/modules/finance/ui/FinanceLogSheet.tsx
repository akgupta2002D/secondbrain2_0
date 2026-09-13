import { formatUsd } from '../model/money'
import type { FinanceLedgerEntry } from '../model/types'

type Props = {
  open: boolean
  entries: FinanceLedgerEntry[]
  onClose: () => void
}

function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function FinanceLogSheet({ open, entries, onClose }: Props) {
  if (!open) return null

  return (
    <div className="financeSheetScrim" role="presentation" onClick={onClose}>
      <div
        className="financeSheet"
        role="dialog"
        aria-modal="true"
        aria-label="Transaction log"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="financeSheetHeader">
          <h2 className="financeSheetTitle">Log</h2>
          <button
            type="button"
            className="financeSheetClose"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </header>

        <ul className="financeLogList">
          {entries.length === 0 ? (
            <li className="financeEmptyHint">No entries yet.</li>
          ) : (
            entries.map((entry) => {
              const signed =
                entry.kind === 'expense' ? -entry.amountCents : entry.amountCents
              return (
                <li key={entry.id} className="financeLogItem">
                  <div className="financeLogTop">
                    <span className="financeLogDate">{formatDay(entry.occurredOn)}</span>
                    <span
                      className={
                        entry.kind === 'expense'
                          ? 'financeLogAmount financeLogAmount--out'
                          : 'financeLogAmount financeLogAmount--in'
                      }
                    >
                      {formatUsd(signed)}
                    </span>
                  </div>
                  <p className="financeLogDesc">{entry.description || '—'}</p>
                  <p className="financeLogMeta">
                    {entry.kind === 'expense' ? 'Expense' : 'Earning'} · {entry.bucket}
                  </p>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
