# Supabase (auth, RLS, dashboard)

Ops reference for this personal app. Update this file when dashboard URLs, env names, or migrations change.

App code: `src/auth/` (shell, not a module) and `src/lib/supabaseClient.ts`.

## Dashboard: Authentication

**Authentication → URL configuration**

| Field | Value | Notes |
| --- | --- | --- |
| Site URL | `http://localhost:5173` | No `*`. Production: your Vercel origin, no path. |
| Redirect URLs | `http://localhost:5173/**` | `/**` = this origin + any path. Not part of the URL you type in the browser. |
| Redirect URLs | `https://<your-vercel-app>.vercel.app/**` | Same pattern for production. Add a custom domain the same way if you use one. |

Magic link uses `window.location.origin` (origin only, no path). `http://localhost:5173` would also work; `/**` is the looser, preferred allowlist.

**Authentication → Providers → Email**

- Enable Email.
- Enable email + password.
- Enable magic links.
- Optional for this personal app: turn **off** “Confirm email” so the first password signup works immediately.
- Later: disable public signups if you do not want anyone else creating an account.

## Env vars (Vite + Vercel)

Do not commit `.env`. Local and Vercel need:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (legacy alias: `VITE_SUPABASE_ANON_KEY`)

Restart `npm run dev` after changing `.env`. After changing Vercel env vars, redeploy.

## Migrations (SQL editor, in order)

1. `migrations/001_thoughts.sql`
2. `migrations/002_notes.sql`
3. `migrations/003_remove_auth.sql` — historical; already applied in prod
4. `migrations/004_restore_auth_rls.sql` — restore `user_id`, RLS, revoke `anon`, `claim_unowned_personal_rows()`

After `004`, the old unauthenticated PWA cannot read/write notes or thoughts. Deploy the login UI in the same window.

On first sign-in, the app calls `claim_unowned_personal_rows()` so leftover `user_id is null` rows attach to that user (only if no other owner exists).

One-shot data wipe (not a migration): `sql/delete_all_notes.sql` — deletes every row in `public.notes`.

## When you change something later

- **New domain or port** → add `https://that-origin/**` (and Site URL if it is the primary site). Keep this table in sync.
- **New env var names** → `src/lib/supabaseClient.ts`, `src/vite-env.d.ts`, Vercel, `.env`, this file.
- **Auth UI / session** → `src/auth/ui/LoginScreen.tsx`, `src/auth/useAuthSession.ts`, `src/App.tsx`.
- **RLS / ownership** → new migration after `004`; do not edit applied SQL files.
