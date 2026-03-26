import { useEffect, useState } from 'react'
import { RememberScreen } from './modules/remember'

type View = 'home' | 'modules' | 'remember'

function App() {
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false)
  const [view, setView] = useState<View>('home')

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

  const openModules = (): void => setView('modules')
  const goHome = (): void => setView('home')
  const goModules = (): void => setView('modules')
  const openRemember = (): void => {
    setView('remember')
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
        </main>
      ) : null}

      {view === 'remember' ? <RememberScreen onBack={goModules} /> : null}

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
