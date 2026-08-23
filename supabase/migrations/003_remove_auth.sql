-- Personal single-user app: no login.
-- Drops auth.users FKs and opens thoughts/notes to the publishable (anon) key.
-- Run after 001_thoughts.sql and 002_notes.sql.

drop policy if exists "Users read own thoughts" on public.thoughts;
drop policy if exists "Users insert own thoughts" on public.thoughts;
drop policy if exists "Users update own thoughts" on public.thoughts;
drop policy if exists "Users delete own thoughts" on public.thoughts;

drop index if exists thoughts_user_updated_idx;

alter table public.thoughts
  drop column if exists user_id;

create index if not exists thoughts_updated_idx
  on public.thoughts (updated_at desc);

alter table public.thoughts disable row level security;

drop policy if exists "Users read own notes" on public.notes;
drop policy if exists "Users insert own notes" on public.notes;
drop policy if exists "Users update own notes" on public.notes;
drop policy if exists "Users delete own notes" on public.notes;

drop index if exists notes_user_created_idx;

alter table public.notes
  drop column if exists user_id;

create index if not exists notes_created_idx
  on public.notes (created_at desc);

alter table public.notes disable row level security;
