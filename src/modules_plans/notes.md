# Notes Module

Tracks the current plan + live state for the `notes` module.

## Purpose

`notes` is a capture pad opened from a home-screen icon (not listed under Modules).

Goals:
- Open a full-screen iOS-like typing surface
- List prior notes in a hamburger sidebar
- Update the same row when editing (not insert on every keystroke)
- Stay independent from `thoughts`

## Data Contract (v1)

Postgres table `public.notes` ([supabase/migrations/002_notes.sql](../../supabase/migrations/002_notes.sql); ownership restored in [004_restore_auth_rls.sql](../../supabase/migrations/004_restore_auth_rls.sql)):
- `id` uuid
- `user_id` uuid — owner (`auth.uid()`); RLS so only that user can read/write
- `"text"` text
- `created_at` timestamptz — the capture **date** (stable on update)

Domain type `{ id, text, date }` maps `created_at` → `date`.

Auth / dashboard URLs / env: [`supabase/README.md`](../../supabase/README.md).

Primary files:
- `src/modules/notes/model/types.ts`
- `src/modules/notes/model/mapNote.ts`
- `src/modules/notes/model/notesRepository.ts`
- `src/modules/notes/data/supabaseNotesRepository.ts`
- `src/modules/notes/ui/NotesScreen.tsx`
- `src/modules/notes/ui/NotePad.tsx`
- `src/modules/notes/ui/NotesDrawer.tsx`

## Current State (Implemented)

- **Home chrome**: Notes is a bottom-right `+` FAB. Update + version sit bottom-left. Notes is not in Modules.
- **Open**: loads existing rows, then inserts one new blank note and selects it.
- **Sidebar**: hamburger opens a left drawer of all notes (first line or “New Note”, plus date). Tap a row to edit it full screen; drawer closes.
- **Save**: typing autosaves with `update` on that id.
- **New note**: `+` FAB bottom-right creates another blank row and selects it.
- **Back**: flushes save, then returns home.

## Known Decisions

- Opening Notes still creates one new blank row, then you can pick older notes.
- `created_at` does not change when text is autosaved.
- Version/update UI is app-shell level; not owned by this module.

## Next Module Iterations

- Export / process pipeline over SQL
