-- Finance balances, debt commitments, and expense/earning ledger.
-- Run after 004_restore_auth_rls.sql. See supabase/README.md.

create table if not exists public.finance_balances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_cents bigint not null default 0,
  emergency_cents bigint not null default 0,
  rewards_cents bigint not null default 0,
  investments_cents bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.finance_balances
  alter column user_id set default auth.uid();

create table if not exists public.finance_commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists finance_commitments_user_created_idx
  on public.finance_commitments (user_id, created_at desc);

create table if not exists public.finance_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind text not null check (kind in ('expense', 'earning')),
  bucket text not null check (bucket in ('current', 'emergency', 'rewards', 'investments')),
  amount_cents bigint not null check (amount_cents > 0),
  description text not null default '',
  occurred_on date not null default (timezone('utc', now()))::date,
  created_at timestamptz not null default now()
);

create index if not exists finance_ledger_user_occurred_idx
  on public.finance_ledger (user_id, occurred_on desc, created_at desc);

alter table public.finance_balances enable row level security;
alter table public.finance_commitments enable row level security;
alter table public.finance_ledger enable row level security;

drop policy if exists "Users read own finance_balances" on public.finance_balances;
drop policy if exists "Users insert own finance_balances" on public.finance_balances;
drop policy if exists "Users update own finance_balances" on public.finance_balances;
drop policy if exists "Users delete own finance_balances" on public.finance_balances;

create policy "Users read own finance_balances"
  on public.finance_balances for select
  using (auth.uid() = user_id);

create policy "Users insert own finance_balances"
  on public.finance_balances for insert
  with check (auth.uid() = user_id);

create policy "Users update own finance_balances"
  on public.finance_balances for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own finance_balances"
  on public.finance_balances for delete
  using (auth.uid() = user_id);

drop policy if exists "Users read own finance_commitments" on public.finance_commitments;
drop policy if exists "Users insert own finance_commitments" on public.finance_commitments;
drop policy if exists "Users update own finance_commitments" on public.finance_commitments;
drop policy if exists "Users delete own finance_commitments" on public.finance_commitments;

create policy "Users read own finance_commitments"
  on public.finance_commitments for select
  using (auth.uid() = user_id);

create policy "Users insert own finance_commitments"
  on public.finance_commitments for insert
  with check (auth.uid() = user_id);

create policy "Users update own finance_commitments"
  on public.finance_commitments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own finance_commitments"
  on public.finance_commitments for delete
  using (auth.uid() = user_id);

drop policy if exists "Users read own finance_ledger" on public.finance_ledger;
drop policy if exists "Users insert own finance_ledger" on public.finance_ledger;
drop policy if exists "Users update own finance_ledger" on public.finance_ledger;
drop policy if exists "Users delete own finance_ledger" on public.finance_ledger;

create policy "Users read own finance_ledger"
  on public.finance_ledger for select
  using (auth.uid() = user_id);

create policy "Users insert own finance_ledger"
  on public.finance_ledger for insert
  with check (auth.uid() = user_id);

create policy "Users update own finance_ledger"
  on public.finance_ledger for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own finance_ledger"
  on public.finance_ledger for delete
  using (auth.uid() = user_id);

revoke all on table public.finance_balances from anon, authenticated, public;
revoke all on table public.finance_commitments from anon, authenticated, public;
revoke all on table public.finance_ledger from anon, authenticated, public;

grant select, insert, update, delete on table public.finance_balances to authenticated;
grant select, insert, update, delete on table public.finance_commitments to authenticated;
grant select, insert, update, delete on table public.finance_ledger to authenticated;

grant all on table public.finance_balances to service_role;
grant all on table public.finance_commitments to service_role;
grant all on table public.finance_ledger to service_role;
