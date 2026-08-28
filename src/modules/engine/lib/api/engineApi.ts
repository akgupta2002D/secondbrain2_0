import type { EngineStats } from "../types/engine"

const ENGINE_STATS_API = import.meta.env.VITE_ENGINE_STATS_API as
  | string
  | undefined

function getEngineApiBase(): string {
  if (!ENGINE_STATS_API) {
    throw new Error(
      "VITE_ENGINE_STATS_API is not configured.",
    )
  }

  return ENGINE_STATS_API.replace(/\/+$/, "")
}

interface GetEngineStatsOptions {
  signal?: AbortSignal
}

export async function getEngineStats(
  options: GetEngineStatsOptions = {},
): Promise<EngineStats> {
  const baseUrl = getEngineApiBase()

  const response = await fetch(
    `${baseUrl}/v1/engine/health`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: options.signal,
    },
  )

  if (!response.ok) {
    throw new Error(
      `Engine API returned ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as EngineStats
}