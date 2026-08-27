# Add a tab or a module

This is the general recipe. Pick **one** place in the IA first:

| Kind | Where the user opens it | Copy this existing piece |
| --- | --- | --- |
| **Tab** | Bottom tab bar | Engine |
| **Module under Modules** | Modules list, then Back to the list | Remember / Thoughts / Identity |
| **Not a tab, not Modules** | Shell `+` | Notes (do not add another of these without a product decision) |

Replace `<id>` with a kebab folder name. Replace `<Name>` with the PascalCase screen name.

There is **no React Router**. Navigation is `tab` / `modulesPane` / `notesOpen` in `AppShell`, plus optional `history.pushState` for iPhone Back. See [Why not a router](#why-not-a-router) below.

---

## Directory map

```
docs/
  add-tab-and-module.md     this guide
  <id>.md                   optional long design

src/modules_plans/
  <id>.md                   live “what exists now”

src/modules/<id>/
  index.ts                  public export only
  ui/<Name>Screen.tsx       the screen
  model/                    types, domain (if needed)
  data/                     Supabase / fetch (if needed)
  lib/                      helpers (if needed)

src/shell/
  types.ts                  AppTab ids and ModulesPane ids
  TabBar.tsx                tab buttons + icons
  AppShell.tsx              which pane is visible
  ModulesList.tsx           Modules list buttons only

src/index.css               screen styles
src/App.test.tsx            click test
```

Modules do not import each other. Outside a module, import only `src/modules/<id>/index.ts`.

---

## How navigation already works

1. Tab click → `onSelect(item.id)` in `src/shell/TabBar.tsx`.
2. → `onSelectTab` in `src/shell/AppShell.tsx`.
3. → `tab` (and maybe `modulesPane` / `notesOpen`) in React state.
4. → the matching pane’s `hidden={...}` turns off.

You do not add a URL. You do not add a new click handler on `TabBar` beyond putting the id in `TABS`.

---

## A. Add a tab

1. Create `src/modules/<id>/`.
2. Create `src/modules/<id>/ui/<Name>Screen.tsx`.
3. Export `function <Name>Screen()`.
4. Return `<main className="screen <id>Screen" aria-label="<Name>">`.
5. Create `src/modules/<id>/index.ts`.
6. Write `export { <Name>Screen } from './ui/<Name>Screen'`.
7. Create `src/modules_plans/<id>.md` (purpose: this is a **tab**).
8. Optional: create `docs/<id>.md` for a longer plan.
9. Open `src/shell/types.ts`.
10. Add `'<id>'` to `AppTab`.
11. Add `value === '<id>'` in `isAppTab`.
12. Open `src/shell/TabBar.tsx`.
13. Add `{ id: '<id>', label: '<Name>' }` to `TABS`.
14. In `TabIcon`, add `if (id === '<id>')` and return an SVG with `className="appTabIcon"`.
15. Open `src/shell/AppShell.tsx`.
16. `import { <Name>Screen } from '../modules/<id>'`.
17. Copy an existing tab pane (Home or Engine).
18. Set `hidden={notesOpen || tab !== '<id>'}`.
19. Render `<<Name>Screen />` inside that pane.
20. Leave `<TabBar tab={tab} onSelect={onSelectTab} />` unchanged.
21. Open `src/index.css` and add `.<id>Screen`.
22. Open `src/App.test.tsx`, copy a tab-open test, swap the name.
23. Run `npx tsc -b && npm test`.

Example files for `<id>` = `stats`: `src/modules/stats/ui/StatsScreen.tsx`, `src/modules/stats/index.ts`, then `types.ts` + `TabBar.tsx` + `AppShell.tsx`.

---

## B. Add a module under Modules (not a tab)

Skip `AppTab` and skip `TabBar.tsx`.

1. Same module files as A steps 1–8, but the plan should say **under Modules**.
2. Open `src/shell/types.ts`.
3. Add `'<id>'` to `ModulesPane`.
4. Add it to `isModulesPane`.
5. Open `src/shell/AppShell.tsx`.
6. Add a `*Visited` flag (like Remember) so the screen stays mounted after first open.
7. In `applyNav`, set visited when `modulesPane === '<id>'`.
8. Add `open<Name>` → `navigate({ tab: 'modules', modulesPane: '<id>', notesOpen: false })`.
9. Copy a Remember/Thoughts/Identity **subpane**.
10. Render `<<Name>Screen onBack={goModulesList} />`.
11. Open `src/shell/ModulesList.tsx`.
12. Add `on<Name>: () => void`.
13. Add a `role="menuitem"` button.
14. Pass `on<Name>={open<Name>}` from `AppShell`.
15. Style in `src/index.css`. Use `.backButton` so chrome matches Home / Notes.
16. Add a test: Modules tab → menu item → screen.
17. Run `npx tsc -b && npm test`.

---

## Why not a router

This app is one signed-in **shell** (PWA), not a site with public URLs.

**What the current design gives you**

1. **Tab bar and `+` never unmount.** Chrome is not a route layout that remounts on every navigation.
2. **Panes can stay mounted** (`hidden`, not unmount). Notes draft, Thoughts scroll, Remember card position survive leaving and coming back. A typical `<Route>` swap destroys that unless you add extra keep-alive.
3. **Auth is created once** in `App.tsx`. Changing tab does not rebuild the session.
4. **iPhone Back** is `history.pushState` / `popstate` with a small `{ sb: { tab, modulesPane, notesOpen } }` blob. No `/engine` or `/modules/remember` to keep in sync with the tab bar.
5. **Invalid URLs cannot exist.** You cannot bookmark a half-open Notes draft or a Modules pane the IA does not allow. The type `AppTab` is the menu.
6. **Less PWA friction.** Installed standalone apps share one origin URL. Path-based routes fight cache, share links, and “reload = lost tab”.
7. **Fewer moving parts.** No `<Routes>`, no `useNavigate`, no `Outlet`. Adding a tab is: id + icon + pane.

**What a router would buy (and why we skip it)**

Deep links, shareable URLs, and nested layouts help a **website**. This product is a personal home-screen app. Those features would force remounts, extra keep-alive, and duplicate state (URL vs tab bar). `docs/project_description.md` still mentions React Router from an older v1 sketch; [`current-state.md`](current-state.md) is the rule: do not add it.

---

## What not to do

1. Do not add React Router or new product pathnames.
2. Do not import another module’s internals (only its `index.ts`).
3. Do not put a new capture surface on the tab bar. Notes is the `+`.
4. Do not flatten Remember / Thoughts / Identity onto the tab bar without a product decision.
5. Pick **tab** or **Modules list**, not both half-wired.
