import { useEffect, useState } from 'react'
import { RememberScreen } from './modules/remember'
import { ThoughtsScreen } from './modules/thoughts'

type View = 'home' | 'modules' | 'remember' | 'thoughts'

function App() {
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false)
  const [view, setView] = useState<View>('home')

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

  const openModules = (): void => setView('modules')
  const goHome = (): void => setView('home')
  const goModules = (): void => setView('modules')
  const openRemember = (): void => {
    setView('remember')
  }

  const openThoughts = (): void => {
    setView('thoughts')
  }

  return (
    <>
      {view === 'home' ? (
        <main className="screen homeScreen" aria-label="Home">
          <h1 className="title">Second Brain</h1>

          <button
            type="button"
            className="modulesButton"
            onClick={openModules}
          >
            Modules
          </button>

          <span className="bottomUpdateVersion" aria-label={`Version ${appVersion}`}>
            <button
              type="button"
              className="updateLinkSmall"
              onClick={onHardUpdate}
              aria-label="Update PWA"
            >
              Update
            </button>
            <span className="versionText">{appVersion}</span>
          </span>
        </main>
      ) : null}

      {view === 'modules' ? (
        <main className="screen modulesScreen" aria-label="Modules">
          <button
            type="button"
            className="backButton"
            onClick={goHome}
            aria-label="Back"
          >
            Back
          </button>

          <button
            type="button"
            role="menuitem"
            className="moduleMenuItem"
            onClick={openRemember}
          >
            Remember
          </button>

          <button
            type="button"
            role="menuitem"
            className="moduleMenuItem"
            onClick={openThoughts}
          >
            Thoughts
          </button>
        </main>
      ) : null}

      {view === 'remember' ? <RememberScreen onBack={goModules} /> : null}

      {view === 'thoughts' ? <ThoughtsScreen onBack={goModules} /> : null}

      {showRefreshPrompt ? (
        <div className="updatePrompt" role="alertdialog" aria-live="polite">
          <div className="updatePromptInner">
            <div className="updatePromptText">
              <p className="updatePromptTitle">Update available</p>
              <p className="updatePromptBody">Tap refresh to get the latest version.</p>
            </div>
            <div className="updatePromptActions">
              <button className="updatePromptButton" onClick={onRefresh}>
                Refresh
              </button>
              <button
                className="updatePromptDismiss"
                onClick={() => setShowRefreshPrompt(false)}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default App
