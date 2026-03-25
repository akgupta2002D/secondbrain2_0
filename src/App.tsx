import { useEffect, useState } from 'react'
import { RememberScreen } from './modules/remember'

function App() {
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false)

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

  return (
    <>
      <RememberScreen />

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
