import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true
if (isStandalone) {
  document.documentElement.classList.add('is-pwa')

  const pinViewport = (): void => {
    window.scrollTo(0, 0)
  }
  pinViewport()
  window.addEventListener('scroll', pinViewport, { passive: true })
  window.visualViewport?.addEventListener('scroll', pinViewport)
  window.visualViewport?.addEventListener('resize', pinViewport)

  document.addEventListener(
    'touchmove',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) {
        event.preventDefault()
        return
      }
      const scrollable = target.closest(
        'textarea, .appShellPane:not(.appShellPane--locked), .appShellSubpane, .loginScreen, .notesDrawerList, .thoughtsDrawerList, .identityBody',
      )
      if (!scrollable) event.preventDefault()
    },
    { passive: false },
  )
}

// Keep SW logic outside React to avoid issues with test environments.
const reloadPage = registerSW({
  immediate: true,
  onNeedRefresh: () => {
    window.dispatchEvent(new Event('pwa-update-needed'))
  },
})

;(window as any).__pwaReloadPage = reloadPage

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
