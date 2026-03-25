# Coding reference: clear, modular, defensive

This repo is intended to grow into a **PWA app shell + independent modules**. Use the rules below to keep code easy to change, safe, and predictable.

## Core principles

- **Make invalid states unrepresentable**: prefer types and explicit states over `any`, `null`, "magic strings", and implicit assumptions.
- **Keep modules independent**: modules should depend on `shared/` and platform APIs, not on each other.
- **Fail fast at the edges**: validate and normalize external inputs (user input, URL params, storage, network) at the boundary.
- **Be explicit about side effects**: keep pure computation separate from I/O (DOM, storage, network, timers).
- **Prefer boring code**: readability and predictability beat cleverness.

## Project structure + module boundaries

- **App shell** owns:
  - bootstrapping, routing, PWA registration, top-level layout, global styling tokens
  - module discovery/registration (a "module registry")
- **Each module** owns:
  - its routes (if any), screens/components, local state, domain logic
  - a single public entry (e.g. `src/modules/<id>/index.ts`)
- **Shared** owns:
  - reusable UI primitives, utility functions, typed wrappers for browser APIs, and cross-module conventions
- **Rule**: do not import from another module's internal paths (anything other than its public `index.ts`).

## Naming + exports

- **Files**: `kebab-case` for folders, `PascalCase.tsx` for React components, `camelCase.ts` for utilities.
- **React components**: `PascalCase` and **one component per file** unless tiny and tightly coupled.
- **Exports**:
  - default exports only for React pages/screens (optional)
  - otherwise prefer **named exports** to preserve refactor safety
- **Public API**: if something is used outside a folder, export it from that folder's `index.ts` and import from there.

## Defensive code at boundaries

### Inputs (URL params, forms, localStorage, network)

- **Validate**: parse and validate on entry; reject/return a typed error early.
- **Normalize**: trim strings, coerce enums, clamp ranges, handle empty values explicitly.
- **Never trust localStorage**: treat as untyped external input; version/namespace keys.

### Errors

- **Use typed results for expected failures**:
  - expected failures: return `Result<T, E>`-style objects or discriminated unions
  - unexpected failures: throw (and catch at the boundary)
- **Catch at module boundaries**:
  - route loaders / top-level effects should catch and convert to user-safe UI state
- **User-safe messaging**:
  - show friendly, generic messages; keep technical details for logs/dev only

### Null/undefined

- Avoid optional chaining as a "band-aid" over unknown shapes. Prefer:
  - explicit types
  - early returns / guards
  - `assert`/`invariant` helpers in `shared/` (if/when added)

## TypeScript rules

- **No `any`** unless wrapping a third-party library or browser API edge; isolate it and add runtime checks.
- Prefer **discriminated unions** for UI states:
  - `type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'ready'; data: ... } | { kind: 'error'; message: string }`
- Keep types close to usage; export only what's part of the public contract.
- Avoid broad "utility types" if they obscure intent; choose clarity over cleverness.

## React rules (clarity + predictability)

- Keep components **pure**: render from props/state; do side effects in `useEffect`.
- **One responsibility per component**:
  - container (data + orchestration) vs presentational (UI)
- Avoid state derived from props unless necessary; prefer computing on render.
- Prefer `useMemo`/`useCallback` only when it improves correctness or clearly measured performance.
- Keep effects minimal; include full dependency arrays; extract effect logic to named functions when non-trivial.

## UI + accessibility (PWA/iPhone-first)

- Respect safe areas (`env(safe-area-inset-*)`) in layout primitives.
- Interactive elements:
  - accessible names (`aria-label` when needed)
  - correct semantics (`button`, `a`, `input`)
  - visible focus states
- Keep tap targets large; avoid tiny icon-only buttons without labels.

## Side effects: storage, network, time

- **Wrap browser APIs** in `shared/` (later) to centralize:
  - key naming/versioning for storage
  - fetch defaults (timeouts, headers, error mapping)
  - date/time formatting and clock access (testability)
- Prefer dependency injection for "hard" dependencies (clock, storage) in domain logic.

## Data invariants + state

- Define invariants in one place and enforce them:
  - e.g. "Flashcard term is non-empty", "deck ids are stable strings"
- Keep state updates atomic; avoid multi-step updates that can partially apply.
- Prefer immutable updates and pure reducers for non-trivial state transitions.

## Review checklist (quick)

- **Modularity**: is the change confined to one module or `shared/`? Any cross-module imports?
- **Edges**: are external inputs validated and normalized?
- **Errors**: are expected vs unexpected failures handled appropriately?
- **Types**: are states explicit and hard to misuse?
- **Side effects**: are effects isolated and dependencies explicit?
- **UX**: is the iPhone-first layout and accessibility preserved?

