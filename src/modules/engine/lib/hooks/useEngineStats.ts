import {
    useCallback,
    useEffect,
    useRef,
    useState,
  } from "react"
  
  import { getEngineStats } from "../api/engineApi"
  import type { EngineStats } from "../types/engine"
  
  const REFRESH_INTERVAL_MS = 15_000
  
  export function useEngineStats() {
    const [stats, setStats] =
      useState<EngineStats | null>(null)
  
    const [loading, setLoading] =
      useState(true)
  
    const [refreshing, setRefreshing] =
      useState(false)
  
    const [error, setError] =
      useState<string | null>(null)
  
    const [lastUpdated, setLastUpdated] =
      useState<Date | null>(null)
  
    const controllerRef =
      useRef<AbortController | null>(null)
  
    const hasDataRef = useRef(false)
  
    const refresh = useCallback(async (): Promise<void> => {
      controllerRef.current?.abort()
  
      const controller = new AbortController()
  
      controllerRef.current = controller
  
      if (hasDataRef.current) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
  
      try {
        setError(null)
  
        const data = await getEngineStats({
          signal: controller.signal,
        })
  
        hasDataRef.current = true
  
        setStats(data)
        setLastUpdated(new Date())
      } catch (error: unknown) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }
  
        setError(
          error instanceof Error
            ? error.message
            : "Could not reach the engine server.",
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }, [])
  
    useEffect(() => {
      void refresh()
  
      const interval = window.setInterval(() => {
        void refresh()
      }, REFRESH_INTERVAL_MS)
  
      return () => {
        window.clearInterval(interval)
        controllerRef.current?.abort()
      }
    }, [refresh])
  
    return {
      stats,
      loading,
      refreshing,
      error,
      lastUpdated,
      refresh,
    }
  }