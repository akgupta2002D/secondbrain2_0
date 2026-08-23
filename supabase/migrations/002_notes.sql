-- Notes module: run in Supabase SQL Editor or via CLI after creating a project.
-- Requires Authentication (email magic link, etc.) enabled in the dashboard.
-- Capture date is insert-only; later autosaves update "text" only.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  "text" text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.notes_keep_created_at()
returns trigger
language plpgsql
as $$
begin
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger notes_keep_created_at
before update on public.notes
for each row
execute procedure public.notes_keep_created_at();

create index notes_user_created_idx
  on public.notes (user_id, created_at desc);

alter table public.notes enable row level security;

create policy "Users read own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users update own notes"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);
