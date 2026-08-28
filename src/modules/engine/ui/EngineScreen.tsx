import { useEngineStats } from "../lib/hooks/useEngineStats"
import { EngineOverview } from "./components/EngineOverview"

import "./css/engine.css"

export function EngineScreen() {
  const {
    stats,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
  } = useEngineStats()

  return (
    <main
  className="screen engineScreen"
  aria-label="Engine"
  aria-busy={loading || refreshing}
>
  <header className="engineHeader">
    <div className="engineHeaderCopy">
      <h1 className="engineTitle">
        Engine
      </h1>

      <p className="engineSubtitle">
        Welcome to Second Brain's Engine.
      </p>
    </div>

    <button
      type="button"
      className="engineRefreshButton"
      onClick={() => {
        void refresh()
      }}
      disabled={refreshing}
    >
      {refreshing ? "Refreshing…" : "Refresh"}
    </button>
  </header>

  {loading && !stats && (
    <div
      className="engineLoading"
      role="status"
      aria-live="polite"
    >
      Connecting to engine…
    </div>
  )}

  {error && !stats && (
    <div
      className="engineError"
      role="alert"
    >
      <strong>Engine unavailable</strong>

      <span>{error}</span>

      <button
        type="button"
        className="engineRetryButton"
        onClick={() => {
          void refresh()
        }}
      >
        Try again
      </button>
    </div>
  )}

  {stats && <EngineOverview stats={stats} />}

  {stats && (
    <footer className="engineFooter">
      <span>
        {error
          ? "Refresh failed. Showing last known data."
          : "Live server data"}
      </span>

      {lastUpdated && (
        <span>
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </footer>
  )}
</main>
  )
}