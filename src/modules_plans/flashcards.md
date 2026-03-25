# Remember (Flashcards Module) Plan

This document defines the first module for your **PWA app shell + modules** architecture: **`remember`**.

The module’s v1 goal is to:
- Load learning content from a **JSON file**
- Parse that JSON to produce **flashcards**
- Track a **memory score per topic**
- Keep logic modular so we can later add:
  - random “remember” mode
  - topic selection
  - more game mechanics / gamification

---

## Module Contract (module boundary)

Following `coding_reference.md`, the `remember` module will be self-contained and expose a single public entry:

- Module `id`: `remember`
- Module `name`: “Remember”
- Public entry: `src/modules/remember/index.ts` (later)
- Module-owned UI/screens/components and domain logic live under `src/modules/remember/`
- Shared helpers (if any) live under `src/shared/`

Rule of thumb from `coding_reference.md`:
- Do not import from another module’s internal paths; only import from that module’s public `index.ts`.

---

## v1 User Experience

### Single module view (for now)
- A simple screen that lists/selects topics (later)
- Flashcards UI for the active topic (later)
- A visible memory score per topic (later)

### What “v1 remember” will not do yet
- No backend / sync
- No authentication
- No push notifications
- No complex navigation framework (v1 can remain single-route)

---

## Content Source: JSON File

The module will take information from a JSON file (static for now) and parse it to create flashcards.

### Proposed JSON schema

`flashcards.json` (example shape):

```json
{
  "version": 1,
  "deckId": "remember-default",
  "class": "CS-101",
  "topicPacks": [
    {
      "topicId": "react-hooks",
      "title": "React Hooks",
      "chapter": "Hooks",
      "cards": [
        {
          "cardId": "rh-1",
          "term": "What is a Hook?",
          "definition": "A Hook is a function that lets you use React features like state and lifecycle from function components."
        },
        {
          "cardId": "rh-2",
          "term": "useEffect purpose?",
          "definition": "Runs side effects after render in function components."
        }
      ]
    },
    {
      "topicId": "typescript-basics",
      "title": "TypeScript Basics",
      "chapter": "Basics",
      "cards": [
        {
          "cardId": "ts-1",
          "term": "What is a type?",
          "definition": "A type describes the shape and constraints of data in TypeScript."
        }
      ]
    }
  ]
}
```

### Field meanings
- `version`: schema version for safe evolution
- `deckId`: stable identifier for this content set (useful for memory score keys later)
- `topics[]`:
  - `topicId`: stable key (string) for memory score
  - `title`: human label for UI
  - `cards[]`:
    - `cardId`: stable key (string) for per-card stats later
    - `front`: prompt text
    - `back`: answer text

### Defensive parsing requirements (from `coding_reference.md`)

At the parsing boundary:
- Validate the JSON shape and types
- Normalize:
  - trim `title`, `front`, `back`
- Fail fast:
  - return a typed error or an error UI state (not silent partial parsing)

Recommended approach:
- Define a runtime schema validator (later), or implement explicit guards.
- Keep invalid states unrepresentable (avoid `any` / unknown shapes in the module core).

---

## Domain Model

### Core types (conceptual)
- `Deck`: `{ deckId, topics[] }`
- `Topic`: `{ topicId, title, cards[] }`
- `Card`: `{ cardId, front, back }`

### Memory score model (per topic)

The module tracks a **memory score per topic**.

Proposed v1 definition:
- `memoryScore` is an integer in `[0..100]`
- Each topic starts at an initial score:
  - default `50` (or configurable later)
- After each review interaction (later in v1.1+), update the topic score.

Possible update rule (v1 placeholder; tune later):
- If user answers correctly:
  - `memoryScore += +deltaCorrect`
- If user answers incorrectly:
  - `memoryScore -= deltaIncorrect`
- Clamp to `[0..100]`

Later we can evolve this toward spaced repetition:
- store per-card “next review” and per-topic aggregates
- add confidence buttons

---

## Flashcard Generation + Review Flow

### v1 flow (planned, simplified)
1. Load `flashcards.json` (static import / bundled asset)
2. Parse and validate JSON → build `Deck`
3. Initialize memory score map for topics:
   - `memoryScoreByTopicId: Record<string, number>`
4. Render:
   - topic labels + current memory score
   - flashcard view for the active topic
5. Future interactions will update memory score.

### Future flow extensions
- random “remember” mode
- pick between topics
- gamification:
  - streaks
  - badges
  - XP
  - session quests

The key is: keep “game rules / scoring” in a dedicated domain layer so the UI can be swapped without rewriting logic.

---

## Modular Code Plan (folder structure)

This is the future-friendly structure aligned to your `project_description.md`:

```text
src/modules/remember/
  index.ts                      (public entry)
  model/
    types.ts                    (Deck/Topic/Card types)
    memoryScore.ts             (score update logic)
    validation.ts             (runtime validation/guards)
  data/
    flashcards.json            (content source)
    loadDeck.ts                (JSON import + parse)
  ui/
    RememberScreen.tsx
    FlashcardCard.tsx
    TopicScoreList.tsx
  state/
    rememberState.ts          (React state shape + update actions)
    reducers.ts               (optional, later)
```

If you later introduce a shared module registry or app-shell router, `remember` will plug in without changing the app shell.

---

## Defensive State & Error Handling

The module UI should represent these explicit states:
- `idle` (waiting to load/parse)
- `ready` (deck loaded + scores initialized)
- `error` (JSON invalid or parsing failed)

Per `coding_reference.md`, errors should be:
- typed
- user-safe in UI
- technical details kept for logs/dev

---

## High-level Data Flow Diagram

```mermaid
flowchart TD
  AppShell[App shell] -->|loads module entry| RememberEntry[remember module entry]
  RememberEntry --> Load[loadDeck(): import JSON + parse]
  Load --> Validate[validate JSON + normalize strings]
  Validate --> DeckBuilt[build Deck model]
  DeckBuilt --> Scores[init memoryScoreByTopicId]
  Scores --> UI[render RememberScreen]
  UI -->|user answers (later)| ScoreUpdate[update memory score]
  ScoreUpdate --> Scores
```

---

## Acceptance Criteria for v1 (module)

When implemented, v1 remember should:
- Load the JSON deck successfully (or show a clear error UI)
- Render flashcards from parsed JSON content
- Show memory score per topic (even if scoring updates only happen in a later iteration)
- Keep module logic isolated from other modules

---

## Next Step After This Doc

After we agree on this plan, the next step would be:
- create the `src/modules/remember/` skeleton (module entry + types + validation)
- add a minimal `RememberScreen` that uses the parsed JSON and displays:
  - the first topic’s cards (or topic list + first topic)
  - initial memory scores

