import { useEffect, useState } from 'react'
import { LoginScreen, useAuthSession } from './auth'
import { getSupabaseClient } from './lib/supabaseClient'
import { AppShell } from './shell/AppShell'
import { UpdatePrompt } from './shell/UpdatePrompt'

function App() {
  const auth = useAuthSession()
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false)

  const appVersion = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0'

  useEffect(() => {
    const onNeedRefresh = (): void => {
      setShowRefreshPrompt(true)
    }

    window.addEventListener('pwa-update-needed', onNeedRefresh)
    return () => {
      window.removeEventListener('pwa-update-needed', onNeedRefresh)
    }
  }, [])

  const onRefresh = async (): Promise<void> => {
    setShowRefreshPrompt(false)

    const reloadPage = (window as any).__pwaReloadPage as
      | undefined
      | ((reload?: boolean) => Promise<void>)

    if (typeof reloadPage === 'function') {
      try {
        await reloadPage()
      } catch {
        setShowRefreshPrompt(true)
      }
      return
    }

    // Fallback: if we can't find the registered reload callback, do a full refresh.
    window.location.reload()
  }

  const onHardUpdate = async (): Promise<void> => {
    setShowRefreshPrompt(false)

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          // Force an update check.
          await reg.update()
          // If a new SW is waiting, tell it to activate immediately.
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
          // Give the browser a moment to activate before reloading.
          await new Promise((r) => window.setTimeout(r, 500))
        }
      } catch {
        // Ignore and fall back to reload below.
      }
    }

    // "Hard reload" behavior: full page reload so assets are refetched.
    window.location.reload()
  }

  const onSignOut = (): void => {
    void getSupabaseClient()?.auth.signOut()
  }

  if (auth.kind === 'booting') {
    return (
      <main className="screen loginScreen" aria-label="Loading">
        <p className="loginMuted">Loading…</p>
      </main>
    )
  }

  if (auth.kind === 'signedOut') {
    return (
      <>
        <LoginScreen />
        {showRefreshPrompt ? (
          <UpdatePrompt
            onRefresh={() => void onRefresh()}
            onDismiss={() => setShowRefreshPrompt(false)}
          />
        ) : null}
      </>
    )
  }

  return (
    <AppShell
      appVersion={appVersion}
      onHardUpdate={() => void onHardUpdate()}
      onSignOut={onSignOut}
      showRefreshPrompt={showRefreshPrompt}
      onRefresh={() => void onRefresh()}
      onDismissRefresh={() => setShowRefreshPrompt(false)}
    />
  )
}

export default App
