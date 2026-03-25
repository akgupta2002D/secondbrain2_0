import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

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
