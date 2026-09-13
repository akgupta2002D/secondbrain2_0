import { useEffect } from 'react'

/** Sets --sb-keyboard-inset from the visual viewport (iOS keyboard). */
export function useKeyboardInset(): void {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const sync = (): void => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty(
        '--sb-keyboard-inset',
        `${Math.round(inset)}px`,
      )
    }

    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      document.documentElement.style.removeProperty('--sb-keyboard-inset')
    }
  }, [])
}

export function scrollFinanceFieldIntoView(
  target: EventTarget | null,
): void {
  if (!(target instanceof HTMLElement)) return
  window.setTimeout(() => {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, 50)
}
