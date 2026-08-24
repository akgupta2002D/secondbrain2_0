# Engine Module

Tracks the current plan + live state for the `engine` module.

The systems-stats design (microservice, Ubuntu, Supabase) lives in [`docs/engine.md`](../../docs/engine.md).

## Purpose

`engine` is a first-class tab that will show health and capacity of the machines this app depends on.

Goals:
- Open from the bottom tab bar (Home | Engine | Modules)
- Read stats from a dedicated microservice (not from the PWA directly)
- Stay independent from notes / thoughts / remember / identity

## Current State (Implemented)

- **Chrome**: Engine is a tab with a CPU/stats icon. Notes is no longer a tab; capture is the shell `+` FAB above the tab bar.
- **Screen**: Placeholder copy only — “This will display stats about the server we use.”
- **Network**: No fetch. No env vars. No schema.

## Known Decisions

- Engine is **not** listed under Modules.
- Live metrics must not be scraped from the browser (no SSH keys, no service-role key in the PWA).
- Do not add a stats table or Edge Function until the service contract in `docs/engine.md` is implemented as its own task.
