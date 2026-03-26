import { clampScore, type MemoryScoreByTopicId } from './memoryScore'

const STORAGE_KEY_PREFIX = 'remember:v1:'

type RawTopicScoreMap = Record<string, unknown>

const isRecord = (value: unknown): value is RawTopicScoreMap => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const loadMemoryScores = (
  deckId: string,
  topicIds: string[],
  defaultScore: number,
): MemoryScoreByTopicId => {
  const key = `${STORAGE_KEY_PREFIX}${deckId}:memoryScores`
  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return {}

    const out: MemoryScoreByTopicId = {}
    for (const topicId of topicIds) {
      const candidate = parsed[topicId]
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        out[topicId] = clampScore(candidate)
      } else {
        out[topicId] = clampScore(defaultScore)
      }
    }

    return out
  } catch {
    return {}
  }
}

export const saveMemoryScores = (
  deckId: string,
  memoryScores: MemoryScoreByTopicId,
): void => {
  const key = `${STORAGE_KEY_PREFIX}${deckId}:memoryScores`
  window.localStorage.setItem(key, JSON.stringify(memoryScores))
}

