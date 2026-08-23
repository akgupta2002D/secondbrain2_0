-- Restore per-user ownership on notes + thoughts. Run AFTER 001, 002, and 003.
-- Dashboard URLs, Email provider, and env vars: see supabase/README.md (keep that file in sync).
--
-- Dashboard (Authentication) — summary:
-- 1. Email provider: enable email+password and magic links.
-- 2. Redirect URLs: http://localhost:5173/** and https://<vercel-app>.vercel.app/**
--    (Site URL is the origin only, no stars. /** means origin + any path.)
-- 3. Optional personal-app: turn off "Confirm email" so the first password signup works
--    immediately. Later you can disable public signups so nobody else creates an account.
--
-- Existing rows: if auth.users has exactly one user, they are attached now.
-- Otherwise user_id stays null until the signed-in app calls claim_unowned_personal_rows().

alter table public.thoughts
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.notes
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.thoughts
  alter column user_id set default auth.uid();

alter table public.notes
  alter column user_id set default auth.uid();

do $$
declare
  only_user uuid;
  user_count integer;
begin
  select count(*)::integer into user_count from auth.users;
  if user_count = 1 then
    select id into only_user from auth.users limit 1;
    update public.thoughts set user_id = only_user where user_id is null;
    update public.notes set user_id = only_user where user_id is null;
  end if;
end $$;

drop index if exists thoughts_updated_idx;
drop index if exists notes_created_idx;

create index if not exists thoughts_user_updated_idx
  on public.thoughts (user_id, updated_at desc);

create index if not exists notes_user_created_idx
  on public.notes (user_id, created_at desc);

alter table public.thoughts enable row level security;
alter table public.notes enable row level security;

drop policy if exists "Users read own thoughts" on public.thoughts;
drop policy if exists "Users insert own thoughts" on public.thoughts;
drop policy if exists "Users update own thoughts" on public.thoughts;
drop policy if exists "Users delete own thoughts" on public.thoughts;

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

drop policy if exists "Users read own notes" on public.notes;
drop policy if exists "Users insert own notes" on public.notes;
drop policy if exists "Users update own notes" on public.notes;
drop policy if exists "Users delete own notes" on public.notes;

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

revoke all on table public.thoughts from anon, authenticated, public;
revoke all on table public.notes from anon, authenticated, public;

grant select, insert, update, delete on table public.thoughts to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;
grant all on table public.thoughts to service_role;
grant all on table public.notes to service_role;

create or replace function public.claim_unowned_personal_rows()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1 from public.thoughts
    where user_id is not null and user_id <> uid
  ) or exists (
    select 1 from public.notes
    where user_id is not null and user_id <> uid
  ) then
    return;
  end if;

  update public.thoughts set user_id = uid where user_id is null;
  update public.notes set user_id = uid where user_id is null;
end;
$$;

revoke all on function public.claim_unowned_personal_rows() from public, anon;
grant execute on function public.claim_unowned_personal_rows() to authenticated;
