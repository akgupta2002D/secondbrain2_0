import { useEffect } from 'react'

const KEYBOARD_OPEN_PX = 80

function readKeyboardInset(): number {
  const vv = window.visualViewport
  if (!vv) return 0
  return Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
}

function applyKeyboardInset(inset: number): void {
  const rounded = Math.round(inset)
  document.documentElement.style.setProperty(
    '--sb-keyboard-inset',
    `${rounded}px`,
  )
  document.documentElement.classList.toggle(
    'is-keyboard-open',
    rounded >= KEYBOARD_OPEN_PX,
  )
}

/** Tracks visual-viewport keyboard inset for Finance (and CSS transitions). */
export function useKeyboardInset(): void {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const sync = (): void => {
      applyKeyboardInset(readKeyboardInset())
    }

    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('focusin', sync)
    window.addEventListener('focusout', sync)

    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('focusin', sync)
      window.removeEventListener('focusout', sync)
      document.documentElement.style.removeProperty('--sb-keyboard-inset')
      document.documentElement.classList.remove('is-keyboard-open')
    }
  }, [])
}

function scrollWithin(
  scroller: HTMLElement,
  field: HTMLElement,
  bottomClearance: number,
): void {
  const scrollerRect = scroller.getBoundingClientRect()
  const fieldRect = field.getBoundingClientRect()
  const visibleBottom = scrollerRect.bottom - bottomClearance
  const pad = 12

  if (fieldRect.bottom > visibleBottom) {
    scroller.scrollBy({
      top: fieldRect.bottom - visibleBottom + pad,
      behavior: 'smooth',
    })
    return
  }

  if (fieldRect.top < scrollerRect.top + pad) {
    scroller.scrollBy({
      top: fieldRect.top - scrollerRect.top - pad,
      behavior: 'smooth',
    })
  }
}

/**
 * Keep a focused Finance control above the keyboard by scrolling its
 * local pane/sheet — closer to iOS keyboard avoidance than window scroll.
 */
export function scrollFinanceFieldIntoView(
  target: EventTarget | null,
): void {
  if (!(target instanceof HTMLElement)) return

  const run = (): void => {
    const sheet = target.closest('.financeSheet')
    if (sheet instanceof HTMLElement) {
      const inset = readKeyboardInset()
      scrollWithin(sheet, target, Math.max(16, inset * 0.05))
      return
    }

    const pane = target.closest('.appShellPane')
    if (pane instanceof HTMLElement) {
      const inset = readKeyboardInset()
      const tabBar = getComputedStyle(document.documentElement)
        .getPropertyValue('--sb-content-bottom')
        .trim()
      // Approximate clearance: tab bar band + keyboard + cushion.
      const tabPx = Number.parseFloat(tabBar) || 64
      scrollWithin(pane, target, tabPx + inset + 24)
      return
    }

    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  // Wait for keyboard / inset to settle, then nudge again once.
  window.setTimeout(run, 60)
  window.setTimeout(run, 280)
}
