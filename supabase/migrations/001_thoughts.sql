-- Thoughts module: run in Supabase SQL Editor or via CLI after creating a project.
-- Requires Authentication (email magic link, etc.) enabled in the dashboard.

create table public.thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_thoughts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger thoughts_set_updated_at
before update on public.thoughts
for each row
execute procedure public.set_thoughts_updated_at();

create index thoughts_user_updated_idx
  on public.thoughts (user_id, updated_at desc);

alter table public.thoughts enable row level security;

create policy "Users read own thoughts"
  on public.thoughts for select
  using (auth.uid() = user_id);

create policy "Users insert own thoughts"
  on public.thoughts for insert
  with check (auth.uid() = user_id);

create policy "Users update own thoughts"
  on public.thoughts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own thoughts"
  on public.thoughts for delete
  using (auth.uid() = user_id);

-- Optional: live sync across devices (ThoughtsScreen subscribes if you enable this).
alter publication supabase_realtime add table public.thoughts;
