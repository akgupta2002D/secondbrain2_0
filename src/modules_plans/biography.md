# Biography Module

Lookup a person by name and show a short life plus quick facts.

API: `GET https://biography.sarpasahajivan.org/api/biography?name=…`

## Purpose

`biography` is a first-class tab. Type a name, send, read the reply in a chat-style thread.

## Current State (Implemented)

- **Chrome**: Biography tab (book icon). Not listed under Modules.
- **Screen**: Thread + composer above the tab bar. The Notes `+` is Home/Notes only, so the composer uses full width.
- **Send**: Clears the input immediately, then fetches. Soft errors stay in the thread.
- **Shown**: Summary paragraph and quick facts. No extra product routes.

## Known Decisions

- Biography is a **tab**, not a Modules item.
- Name is a query param (`?name=`), not a JSON body.
- Failures stay gentle copy. Do not crash the shell. Network/CORS misses are the same: a thread message, not an exception.
- Do not import Notes / Thoughts / other module internals.
