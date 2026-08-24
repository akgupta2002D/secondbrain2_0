PWA Refactor Checklist
Goal: make the existing PWA feel fast, stable, and iOS-like without changing what the app does.

NON-NEGOTIABLE: This is a presentation, navigation, loading-state, caching, and interaction refactor. Do not intentionally change product functionality, business rules, API contracts, database schema, authentication behavior, permissions, routes, or user-visible data semantics.
Definition of Done
☐ Every existing feature still works with the same inputs, outputs, permissions, and side effects.
☐ Primary navigation responds immediately and does not trigger full-page reloads.
☐ Opening a screen never shows an avoidable blank page while data is loading.
☐ iPhone safe areas, bottom navigation, and dynamic viewport height are handled consistently.
☐ Common actions give immediate visual feedback; network work continues in the background where safe.
☐ No new layout shift, duplicate spacing, hidden controls, or regression on desktop/mobile.
☐ Automated tests and a manual regression pass succeed before merge.
0. Freeze Behavior Before Refactoring
☐ Create a short inventory of all routes/screens, primary actions, forms, modals, authentication flows, and background jobs.
☐ Record the current API endpoints, request/response shapes, Supabase queries, storage behavior, and error behavior used by the UI.
☐ Identify flows that must not be touched: login/logout, create/update/delete operations, permissions, payments if any, sync jobs, notifications, and destructive actions.
☐ Capture baseline screenshots on at least one iPhone-sized viewport and one desktop viewport.
☐ Capture baseline performance: cold start, warm navigation, slowest screens, largest bundles, and obvious layout shifts.
☐ Add or preserve regression tests for critical flows before changing shared layout/navigation code.
1. Establish One Persistent App Shell
☐ Keep the application shell mounted across top-level navigation.
☐ Move persistent UI into the shell: global header/navigation, bottom tab bar, global toasts, modal portal, and shared background.
☐ Only the screen-content region should swap during normal navigation.
☐ Verify route changes use client-side navigation and never cause document reloads unless explicitly required.
☐ Do not reinitialize auth/session/global stores on each screen change.
☐ Preserve deep links and browser back/forward behavior.
2. Fix Mobile Viewport + Safe Areas
☐ Ensure the viewport meta tag uses width=device-width, initial-scale=1, viewport-fit=cover.
☐ Replace app-height uses of 100vh with 100dvh or a tested dynamic-height equivalent.
☐ Use env(safe-area-inset-top) and env(safe-area-inset-bottom) only where needed.
☐ Assign a single layout owner for bottom-tab spacing. Do not stack page padding + tab padding + arbitrary margins.
☐ Ensure scrollable content ends above the bottom tab bar/home indicator without a large empty gap.
☐ Test keyboard open/close, Safari toolbar expansion/collapse, rotation, and standalone PWA mode.
Reference layout rule
Rule: Page content gets exactly one bottom offset equal to the persistent tab bar plus the device safe-area inset. Individual pages should not invent their own extra bottom compensation.
3. Make Navigation Feel Instant
☐ On tap, update selected-tab/navigation state immediately before waiting for remote data.
☐ Render the destination shell/content frame immediately.
☐ Preserve each primary tab’s scroll position and local UI state when users switch away and return.
☐ Prefetch likely next-route code/data when cheap and safe.
☐ Avoid remounting expensive shared components during route transitions.
☐ Use subtle transitions only; do not delay navigation to complete animations.
4. Replace Blank Loading With Stable Loading States
☐ Remove avoidable full-screen spinners for normal screen navigation.
☐ Render cached/stale data immediately when available, then refresh in the background.
☐ Where no cached data exists, render a skeleton matching the final layout dimensions.
☐ Keep titles, navigation, and major controls stable while content loads.
☐ Reserve image/card/list dimensions to avoid cumulative layout shift.
☐ Show errors inside the affected content region rather than replacing the entire app shell.
5. Add Safe Caching Without Changing Data Semantics
☐ Identify read-heavy screens that can safely show recently cached data.
☐ Use an existing query cache or a small IndexedDB/local cache layer rather than duplicating the source of truth.
☐ Treat Supabase/backend data as authoritative; cached data is a fast render source, not an independent database.
☐ Refresh stale data in the background and reconcile visibly only when the authoritative data differs.
☐ Never cache secrets, sensitive tokens, or data that the existing security model forbids storing locally.
☐ Preserve current invalidation behavior after create/update/delete operations.
6. Use Optimistic UI Only Where Reversible
☐ Use immediate UI updates for safe, reversible actions such as toggles, checkboxes, ordering, or simple edits.
☐ Keep the existing server mutation/API call exactly intact behind the optimistic state.
☐ On failure, revert the optimistic change or mark it unsynced and offer retry.
☐ Do not use optimistic success for irreversible/destructive/security-sensitive operations unless the existing product already does so.
☐ Prevent duplicate submissions while a mutation is in flight.
7. Normalize Visual System
☐ Create shared design tokens for spacing, radii, typography, borders, surfaces, and motion duration.
☐ Use a small spacing scale such as 4 / 8 / 12 / 16 / 24 / 32 / 48 px.
☐ Remove one-off margins/paddings that visually compensate for unrelated layout bugs.
☐ Use cards only when grouping or hierarchy requires them; avoid card-within-card layouts.
☐ Reduce heavy shadows and borders; prefer whitespace and type hierarchy.
☐ Keep top-level titles, section headings, list rows, inputs, sheets/modals, and empty states consistent across screens.
☐ Make interactive icon/control hit areas at least approximately 44 × 44 CSS px even when the visible icon is smaller.
8. Interaction + Motion Pass
☐ Every tap/click must produce immediate visual feedback.
☐ Add consistent pressed/active states for buttons, rows, tab items, and icon buttons.
☐ Keep routine transitions short and subtle (roughly 100–250 ms).
☐ Respect prefers-reduced-motion.
☐ Do not animate layout in ways that move the target away from the user’s finger.
☐ Use toasts/banners sparingly for background success/failure; do not block the screen unnecessarily.
9. Performance Pass
☐ Code-split genuinely heavy routes/components but keep primary shell/navigation eagerly available.
☐ Lazy-load noncritical images, editors, charts, and secondary modules.
☐ Avoid duplicate API requests caused by remounts or competing effects.
☐ Memoize only measured hot paths; do not add complexity without evidence.
☐ Keep list rendering efficient for long lists; virtualize only when necessary.
☐ Move expensive work off the initial render path.
☐ Verify service-worker caching does not serve stale app code indefinitely after deployment.
10. Accessibility + Native-Feeling Details
☐ Maintain visible focus states and keyboard operation on desktop.
☐ Use semantic buttons/links/inputs rather than clickable generic containers.
☐ Provide accessible names for icon-only controls.
☐ Respect text scaling and avoid fixed-height containers that clip larger text.
☐ Do not rely on color alone to convey state.
☐ Ensure sheets/modals trap focus appropriately and restore focus on close.
☐ Avoid disabling native scrolling/bounce behavior globally unless a specific tested component requires it.
11. Regression Gate — Functionality Must Be Unchanged
☐ Compare route inventory before vs. after: no route removed or silently redirected.
☐ Run critical user flows end to end using the same test data.
☐ Compare API calls for critical actions: same endpoint, method, essential payload, auth, and success/error semantics.
☐ Verify create/update/delete operations persist correctly after refresh/relogin.
☐ Verify offline/backend-unavailable states fail gracefully and do not corrupt local or remote state.
☐ Verify auth expiry, logout, protected routes, and permission failures.
☐ Compare before/after screenshots for accidental missing content or controls.
☐ Test at least: iPhone standalone PWA, iPhone Safari, narrow responsive browser, and desktop.
☐ Run automated test suite, lint, type-check, and production build before merge.
Recommended Refactor Order
Phase
Focus
Exit condition
1
Baseline + regression protection
No UI changes yet.
2
App shell + routing
Persistent shell; client-side navigation.
3
Viewport + safe area
Fix height/bottom-gap/keyboard issues.
4
Loading states
Skeletons, cached render, localized errors.
5
State preservation
Scroll/tab/form state survives navigation.
6
Visual normalization
Tokens, spacing, touch targets, cards.
7
Optimistic interactions
Only safe, reversible mutations.
8
Performance
Bundle/network/render improvements.
9
Full regression
Functionality comparison + device pass.
Agent Instruction — Use This During the Refactor
Instruction: Work phase-by-phase. Before each phase, identify files/components to change and the regression risk. Make the smallest structural change that satisfies the checklist. Do not redesign features or alter business behavior. After each phase, run tests/build and verify the affected flows before continuing.
STOP CONDITIONS

☐ A refactor requires an API/schema/auth/business-rule change to proceed.
☐ Existing behavior is unclear and cannot be protected with a test or reproducible baseline.
☐ A shared-layout change breaks a route or changes the outcome of a user action.
☐ Caching/optimistic state can expose stale or unauthorized information.
If a stop condition occurs: Do not silently “fix” the product behavior as part of this refactor. Isolate and document it as a separate product/engineering change.