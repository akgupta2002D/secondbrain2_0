# Biography Module

Lookup a person by name and show a short life plus quick facts.

API: `GET https://biography.sarpasahajivan.org/api/biography?name=…`

## Purpose

`biography` lives under **Modules**. Type a name, send, read the reply in a chat-style thread.

## Current State (Implemented)

- **Chrome**: Modules app icon → Biography. Back returns to the Modules grid.
- **Screen**: Thread + composer above the tab bar. Notes `+` is Home/Notes only.
- **Send**: Clears the input immediately, then fetches. Soft errors stay in the thread.
- **Shown**: Summary paragraph and quick facts.

## Known Decisions

- Biography is a **Modules item**, not a tab (Finance took that tab slot).
- Name is a query param (`?name=`), not a JSON body.
- Failures stay gentle copy. Do not crash the shell. Network/CORS misses are the same: a thread message, not an exception.
- Do not import Notes / Thoughts / other module internals.
