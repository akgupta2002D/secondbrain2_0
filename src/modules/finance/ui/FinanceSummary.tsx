import { formatUsd } from '../model/money'

type Props = {
  currentCents: number
  debtCents: number
  investmentsCents: number
  emergencyCents: number
  onOpenDebt: () => void
}

export function FinanceSummary({
  currentCents,
  debtCents,
  investmentsCents,
  emergencyCents,
  onOpenDebt,
}: Props) {
  return (
    <section className="financeSummary" aria-label="Balances summary">
      <div className="financeChip financeChip--green">
        <span className="financeChipLabel">Current</span>
        <span className="financeChipValue">{formatUsd(currentCents)}</span>
      </div>

      <button
        type="button"
        className="financeChip financeChip--red financeChipButton"
        onClick={onOpenDebt}
        aria-label={`Debt ${formatUsd(debtCents)}. Open commitments.`}
      >
        <span className="financeChipLabel">Debt</span>
        <span className="financeChipValue">{formatUsd(debtCents)}</span>
      </button>

      <div className="financeChip financeChip--blue">
        <span className="financeChipLabel">Invested</span>
        <span className="financeChipValue">{formatUsd(investmentsCents)}</span>
      </div>

      <div className="financeChip financeChip--blue">
        <span className="financeChipLabel">Emergency</span>
        <span className="financeChipValue">{formatUsd(emergencyCents)}</span>
      </div>
    </section>
  )
}
