# Remember Module

This document replaces `flashcards.md` and tracks the current plan + live state for the `remember` module.

## Purpose

`remember` is the flashcards module inside the Second Brain app shell.

Goals:
- Load cards from JSON
- Parse/validate defensively
- Review cards with fast mobile interactions
- Track memory score progress per class deck

## Data Contract (v1)

Source JSON shape (implemented in parser/types):
- `version`
- `deckId`
- `class`
- `topicPacks[]`
  - `topicId`
  - `title`
  - `chapter`
  - `cards[]`
    - `cardId`
    - `term`
    - `definition`

Primary files:
- `src/modules/remember/model/types.ts`
- `src/modules/remember/model/parseFlashcards.ts`
- `src/modules/remember/data/definitions306.json`

## JSON Reference Template (for parser input)

Use this structure when creating a new class JSON file:

```json
{
  "version": 1,
  "deckId": "cs-306-core",
  "class": "CS-306",
  "topicPacks": [
    {
      "topicId": "decision-problems",
      "title": "Decision Problems",
      "chapter": "Complexity Basics",
      "cards": [
        {
          "cardId": "dp-001",
          "term": "Decision Problem",
          "definition": "A problem where each instance has a yes/no answer."
        },
        {
          "cardId": "dp-002",
          "term": "Language L",
          "definition": "Set of strings over an alphabet."
        }
      ]
    }
  ]
}
```

Notes:
- Keep IDs stable (`deckId`, `topicId`, `cardId`) so progress mapping stays reliable.
- Use non-empty strings for `term` and `definition`.
- `class` is the top-level class name shown in the Remember module.

## Current State (Implemented)

- **Module entry wired** via `src/modules/remember/index.ts` and rendered from `src/App.tsx`.
- **Navigation flow working**: Home -> Modules -> Remember -> Back.
- **Remember screen top controls**:
  - Back button (left)
  - Topics (`...`) button (right)
- **Topic modal behavior**:
  - Shows class-level deck view
  - Displays memory score in modal
  - Close + escape handling supported
- **Flashcard behavior**:
  - Front shows `term`
  - Back shows `definition`
  - Card supports tap flip
  - Swipe review on back:
    - left => incorrect
    - right => correct
- **Cycle behavior**:
  - Tracks reviewed cards in current cycle
  - Shows "Completed. Start again." prompt after full cycle
  - Actions: Start Again / Different Topic
- **Memory scoring**:
  - Class-level score model
  - Update by correct/incorrect
  - Clamp + persistence to localStorage
  - Storage load/save + migration support in model
- **Mobile-first styling**:
  - Safe-area-aware spacing
  - iPhone-friendly touch targets
  - Matte black visual design

## Known Decisions

- One class deck is treated as one active topic scope in UI.
- Current sample content uses `definitions306.json`.
- Version/update UI is app-shell level; not owned by this module.

## Next Module Iterations

- Add multi-deck/class switching from multiple JSON files.
- Add optional random mode across decks.
- Add stronger spaced repetition logic (per-card scheduling).
- Add richer progress analytics/history.
