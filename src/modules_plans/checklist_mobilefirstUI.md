# checklist_mobilefirstUI.md

## Purpose
Keep the UI consistent and “iPhone-ready” by standardizing safe-area spacing, touch ergonomics, overlay stacking, and mobile viewport height behavior.

## Global Mobile-First Rules
- Always respect safe areas for top/bottom spacing using `env(safe-area-inset-*)`.
- Prefer `svh` over `vh` for mobile viewport height sizing (`svh` reduces iOS address bar jumpiness).
- Ensure touch targets are comfortable on iPhone (aim ~44px tall; avoid tiny pill buttons).
- Respect `prefers-reduced-motion: reduce` by disabling heavy transitions/animations where appropriate.
- Avoid layout shift when elements appear/disappear (reserve space for modals, prompts, buttons, etc.).

## Absolute / Fixed Positioning (Most Important)
If you use `position: absolute` or `position: fixed` for top nav controls (Back, `...`, etc.):
1. Always reserve vertical space in the screen container so content never starts underneath nav.
2. Never rely on `max(env(safe-area-inset-top), something)` alone—include nav height explicitly.
3. Assign explicit `z-index` values so nav is above swipe/feedback overlays.

Recommended z-index tiers:
- Nav: `20`
- Swipe background / overlays: `5–10`
- Feedback text (if used): `10–40`
- Modals/dialogs: `80+`
- System prompts/toasts: `50+`

## Gesture / Swipe UI Standards
- Use `touch-action: pan-y` (or the appropriate value for your gesture) to prevent scrolling conflicts.
- Add a deadzone to ignore micro-movements.
- Only allow swipe gestures in the correct state (e.g. back side only).
- Prevent accidental click actions after a swipe/drag (track `didSwipe` / `didDrag`).

## Typography & Visual Consistency
- Use `clamp()` for font sizes on mobile instead of hard-coded px values.
- Maintain contrast on matte black backgrounds; apply subtle shadows/glow only when needed for readability.

## Screen Build Checklist (Run After Any UI Change)
1. Does this screen have any top/bottom `absolute` or `fixed` elements?
2. If yes, does the parent container reserve enough safe-area space under those elements?
3. Do nav buttons have a higher `z-index` than swipe/feedback overlays?
4. Any full-screen overlays using `position: fixed` cover nav unintentionally?
5. Any `vh` usage that should be changed to `svh` for iOS stability?
6. Do interactions (tap/flip/swipe) still work smoothly with iOS touch behavior?
7. Do prompts/feedback disappear cleanly and never “stick” into the next card/view?

## Regression Notes (What to Watch For)
- Nav buttons overlapping the first piece of content on iPhone.
- Swipe feedback or overlays persisting into the next card.
- iOS layout jitter caused by `vh` or missing `safe-area` padding.

