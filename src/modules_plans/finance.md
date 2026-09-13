# Finance Module

Personal money screen on the Finance tab: balances, debt commitments, expense/earning ledger.

## Purpose

Track current cash, emergency fund, rewards, and investments. Log expenses and earnings against a bucket. Track debt as a list of commitments whose total shows in red.

## Current State (Implemented)

- **Chrome**: Finance tab (currency icon). Not listed under Modules. Notes `+` is Home/Notes only.
- **Summary**: Green Current, red Debt (tap → commitments sheet), blue Invested, blue Emergency.
- **Editable buckets**: Current / Emergency / Rewards / Investments (tap value to edit).
- **Form**: Expense or earning; date; amount; description; bucket picker (default Current). Clears on successful submit. Updates the chosen bucket.
- **Log icon**: Bank-style history of ledger rows.
- **Data**: Supabase `finance_balances`, `finance_commitments`, `finance_ledger` (cents + RLS). Migration `005_finance.sql`.

## Known Decisions

- Finance is a **tab**, not a Modules item.
- Amounts stored as integer cents.
- Debt is commitments only — the expense form does not change debt.
- Do not import Notes / Thoughts / other module internals.
- Dashboard charts come later.
