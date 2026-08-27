# Notes Module

Tracks the current plan + live state for the `notes` module.

## Purpose

`notes` is a capture pad opened from the shell `+` above the tab bar (not listed under Modules).

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

- **Home chrome**: Notes is the shell `+` above the tab bar on Home and Notes only (not a tab, not in Modules). Sign out + Update are top-right icons; version sits bottom-left.
- **Open**: loads existing rows and shows a blank pad. No row is inserted until you type.
- **Sidebar**: hamburger opens a left drawer of persisted notes (first line or “New Note”, plus date). Tap a row to edit it full screen; drawer closes.
- **Save**: first non-empty text `create`s a row; later typing `update`s that id.
- **New note**: `+` FAB bottom-right switches to a blank pad. A row is created only after you type.
- **Delete**: trash icon on the open-note header removes the saved row (after confirm) and returns to a blank pad. Unsaved drafts are discarded without a server call.
- **Back**: chevron icon flushes save, then returns to the previous tab.
- **Chrome**: date/time sits in the footer with save status; header is back, list, and delete icons.

## Known Decisions

- Blank / whitespace-only pads are not stored. Opening Notes or tapping `+` does not insert a row by itself.
- `created_at` does not change when text is autosaved.
- Version/update UI is app-shell level; not owned by this module.

## Next Module Iterations

- Export / process pipeline over SQL
