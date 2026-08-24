# Current state and decisions

Read this first. It is a snapshot of **what the app actually is today** (version `0.0.34` in `vite.config.ts`) and **why**, so you can change it without rediscovering product rules.

Older docs in this folder (`project_description.md`, parts of `ARCHITECTURE.md`) describe earlier shapes (v1 “Hey Ankit”, Home + Modules button + Notes FAB). Prefer this file when they disagree.

Ops for Auth/SQL: [`../supabase/README.md`](../supabase/README.md). Coding rules: [`coding_reference.md`](coding_reference.md).

---

## What exists

### Stack and host

- **Vite + React + TypeScript** PWA (`vite-plugin-pwa`). No React Router.
- **Vercel** deploys `main`. **Supabase** is Auth + Postgres.
- Session lives in `localStorage` (Supabase client). App version is injected as `__APP_VERSION__`.
- iPhone-first: `viewport-fit=cover`, `100dvh` in Safari tab, `100lvh` in the installed PWA with overflow locked (no rubber-band), black UI, safe-area insets.

### Auth (gate, not a module)

Signed-out users only see sign-in. There is no tab bar on login.

- Magic link is primary (`signInWithOtp`, redirect = `window.location.origin`).
- Email + password sign-in and create-account are also on the same screen.
- Signed-in: `useAuthSession` stays in `App.tsx`; the shell does not recreate the session per screen.
- Sign out and Update are icons at the top right of Home (Sign out, then Update). Version stays bottom-left.
- Env: `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (legacy alias `VITE_SUPABASE_ANON_KEY`).

### Signed-in navigation

Persistent **`AppShell`** (`src/shell/`). Only the content pane swaps.

Tabs: **Home | Engine | Modules**. Notes is the `+` above the tab bar.

```
Sign in ──► AppShell
              ├── Home     (title; top-right Sign out + Update icons; version)
              ├── Engine   (placeholder systems stats; not listed under Modules)
              ├── Notes    (opened by +; not a tab; not listed under Modules)
              └── Modules
                    ├── list: Remember, Thoughts, Identity
                    ├── Remember
                    ├── Thoughts
                    └── Identity
```

- Home is **not** a launcher with a center Modules button. The Notes `+` sits above the tab bar (same control as on the Notes pad).
- **Engine is a top-level tab.** Notes is capture-only (`+`). Remember / Thoughts / Identity stay nested under Modules.
- After first visit, Notes / Remember / Thoughts / Identity **stay mounted** (hidden) so pad, draft, and scroll survive tab switches.
- Notes is **not** mounted at login (that would start a local draft without opening Notes).
- In a module, Back returns to the Modules list. Tapping **Modules** while inside a module also returns to the list.
- Optional history: `history.pushState` so iPhone edge-swipe / browser Back matches the UI. Still no React Router.

### Modules (product)

| Surface | Where | Data | Behavior that must not change casually |
| --- | --- | --- | --- |
| **Notes** | Shell `+` | Supabase `notes` | Blank **local** draft on open. Row is created only after real text. Autosave `update`. Delete is confirm + server delete. Date/status in footer. |
| **Engine** | Tab | None yet | Placeholder copy only. Live host/Supabase stats are planned in [`engine.md`](engine.md); do not scrape them from the PWA. |
| **Thoughts** | Modules | Supabase `thoughts` | If the list is empty, **insert one empty thought**. Search + drawer. Debounced save. Realtime refresh. |
| **Remember** | Modules | Bundled JSON decks | Swipe to score. Scores in `localStorage` (not Postgres). |
| **Identity** | Modules | Bundled `goalsGraph.json` | On-device graph only. |

Modules do not import each other. Public entry is each `src/modules/<id>/index.ts`. Auth and the shell are not modules.

### Loading / cache (presentation only)

- Tab taps switch immediately. No full-screen “Loading…” on navigation.
- Notes/Thoughts: keep header chrome; pad-sized **skeleton** if there is nothing to show yet.
- **Session in-memory last list** for Notes and Thoughts (`notesListCache.ts` / `thoughtsListCache.ts`). Not IndexedDB, not a second database. Server `list()` is still authoritative. Cache updates on create/update/delete.
- No optimistic delete/save.

### Tests

`src/App.test.tsx` drives Home / Engine / Modules through the **tab bar** and Notes through the **+** control. Remember swipe/score still starts from Modules. `npm test` + `npx tsc -b`.

---

## Decisions (do not “fix” these as drive-by refactors)

These are product/architecture choices, not leftovers.

1. **Personal PWA with Auth + RLS.** Anon is revoked. Rows are per `user_id`. Migration `003` removed auth historically; `004` restored it. First sign-in may call `claim_unowned_personal_rows()` for leftover null-owner rows.
2. **Notes create-on-type, not create-on-open.** Opening Notes must not insert an empty SQL row. Delete stays confirm-then-server.
3. **Thoughts always has at least one row** once the module has loaded against an empty table (insert-if-empty). Do not “fix” that to match Notes.
4. **Remember and Identity stay local.** Do not move scores or the identity graph to Supabase unless that is an explicit product change.
5. **Tab IA is Home | Engine | Modules.** Notes is the `+` above the tab bar, not a tab and not in the Modules list. Do not flatten Remember/Thoughts/Identity onto the tab bar without a product decision.
6. **No React Router.** In-memory view + optional `pushState` only. Do not invent new product routes.
7. **Shell owns chrome; modules own mutations.** Do not re-init auth on tab change. Do not remount Notes after first open just to “reset” the pad.
8. **One bottom offset.** Tab bar height only (`--sb-content-bottom`). Do not add `safe-area-inset-bottom` on the tab bar — iOS standalone already insets the webview, and stacking that inset triples the chrome. Pages must not add their own extra bottom safe-area (Notes footer used to pad for the old FAB).
9. **Presentation refactors must not change APIs/schema/auth/scoring.** If a UI change needs a schema or mutation change, stop and treat it as a separate product task.

---

## Where to edit

| Want to change | Start here |
| --- | --- |
| Tabs, history, keep-mounted | `src/shell/` |
| Sign-in / session | `src/auth/`, `src/App.tsx` |
| Supabase client / env names | `src/lib/supabaseClient.ts` |
| Notes pad / draft / delete | `src/modules/notes/` |
| Engine placeholder / later stats | `src/modules/engine/`, [`docs/engine.md`](engine.md) |
| Thoughts editor / empty-row | `src/modules/thoughts/` |
| Flashcards / scores | `src/modules/remember/` |
| Goals graph | `src/modules/identity/` |
| Layout, tab bar, tokens | `src/index.css` (`--sb-space-*`, `--sb-tab-bar-height`) |
| SQL / RLS | `supabase/migrations/` (add a new file; do not edit applied ones) |

---

## Out of scope today

No payments, push, or shared/multi-user product. No Edge Functions in the PWA. Background “organize notes” jobs are not in this client. Engine has no live metrics yet — see [`engine.md`](engine.md).

Planning leftovers (not current UI): `flashcards.md`, `src/modules_plans/`.
