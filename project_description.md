# Project: Modular iPhone-first PWA (FlashCards Hub)

## Goal
Build a **simple Progressive Web App (PWA)** optimized for **iPhone 15 Pro** that can host **multiple small apps/modules** over time (e.g., FlashCards, timers, notes, etc.).

## v1 (Initial Milestone)
When opened (and optionally installed to Home Screen), the app shows only:

- **App installed**
- **Hey Ankit**

No navigation, no extra UI, no data storage in v1.

## Target Platform + Constraints
- **Primary device**: iPhone 15 Pro (Safari / Home Screen installed PWA).
- **PWA requirements**:
  - `manifest.webmanifest` with app name, icons, theme colors, display mode.
  - Service worker for offline shell (even if minimal).
  - Responsive layout for iPhone viewport, safe-area insets support.
- **Non-goals for v1**:
  - Authentication
  - Backend
  - Push notifications
  - Sync

## Tech Stack (Proposed)
- **Language**: TypeScript
- **UI**: React
- **Build tooling**: Vite
- **Routing**: React Router (module-friendly route composition)
- **Styling**: Tailwind CSS (fast iteration, consistent design)
- **PWA**: `vite-plugin-pwa` (manifest + service worker integration)
- **Backend / Database (later)**: Supabase (Postgres + API + Auth-ready)
- **Custom API layer (optional, later)**:
  - Prefer **Supabase Edge Functions** for server-side logic close to Supabase.
  - Use **Express (Node.js)** only if we need a standalone server (custom integrations, non-Supabase services, long-running jobs, or a self-hosted API gateway).
- **Quality**:
  - ESLint + Prettier
  - Type-checking in CI (later)

## Architecture (Modular / Multi-app Ready)
The app is a **shell + modules** design:

- **App Shell**: bootstraps the PWA, registers service worker, loads the active module.
- **Modules (Apps)**: self-contained feature areas that can be added incrementally.

### Module Contract (Concept)
Each module should provide:
- **id**: unique string (e.g., `"hello"`, `"flashcards"`)
- **name**: human readable label
- **routes** (optional): module-owned routes
- **entry component**: render function/component for its root view

This keeps modules isolated and makes it easy to add new ones without rewriting the shell.

## Navigation Strategy (Future)
For v1: a single screen.

For future versions:
- A simple home screen listing available modules
- Optional deep links to a specific module
- Route-based module loading

## Suggested Folder Structure (Future-friendly)
This is the intended shape once implementation begins:

```
/
  public/
    manifest.webmanifest
    icons/
  src/
    app-shell/
      registerServiceWorker.(ts|js)
      layout.(tsx|jsx)
      router.(ts|js)
    modules/
      hello/
        index.(ts|js)
        HelloScreen.(tsx|jsx)
      flashcards/
        ...
    shared/
      ui/
      utils/
```

## UX Notes (iPhone-first)
- Use large, readable typography and comfortable spacing.
- Respect safe areas with CSS env variables:
  - `env(safe-area-inset-top/right/bottom/left)`
- Keep first load very fast (tiny bundle, minimal assets).

## Testing Checklist (v1)
- Opens in Safari and shows the two lines of text.
- Add to Home Screen → launches full-screen and still shows the same content.
- Works offline after first visit (app shell cached).

## Next Steps After This Document
- Scaffold a minimal web project (framework choice can come later).
- Add `manifest.webmanifest` and icons.
- Add service worker with basic caching.
- Implement the v1 screen (“App installed — Hey Ankit”).
