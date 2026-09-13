/** Parse a dollar string like "12.34" or "12" into integer cents. */
export function dollarsToCents(raw: string): number | null {
  const trimmed = raw.trim().replace(/\$/g, '').replace(/,/g, '')
  if (!trimmed) return null
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const negative = trimmed.startsWith('-')
  const abs = negative ? trimmed.slice(1) : trimmed
  const [wholePart, fracPart = ''] = abs.split('.')
  const whole = Number(wholePart)
  if (!Number.isFinite(whole)) return null
  const frac = (fracPart + '00').slice(0, 2)
  const cents = whole * 100 + Number(frac)
  if (!Number.isFinite(cents)) return null
  return negative ? -cents : cents
}

export function centsToDollarsInput(cents: number): string {
  const negative = cents < 0
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const frac = String(abs % 100).padStart(2, '0')
  return `${negative ? '-' : ''}${whole}.${frac}`
}

export function formatUsd(cents: number): string {
  const negative = cents < 0
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const frac = String(abs % 100).padStart(2, '0')
  const withCommas = whole.toLocaleString('en-US')
  return `${negative ? '-' : ''}$${withCommas}.${frac}`
}

export function todayIsoDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
