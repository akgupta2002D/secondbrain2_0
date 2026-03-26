export const clampScore = (n: number): number =>
  Math.max(0, Math.min(100, n))

const DELTA_CORRECT = 10
const DELTA_INCORRECT = 10

export type ReviewResult = 'correct' | 'incorrect'

export type MemoryScoreByTopicId = Record<string, number>

export const initMemoryScores = (
  memoryScoreDefault: number,
  topicPacks: Array<{ topicId: string }>,
): MemoryScoreByTopicId => {
  const initial = clampScore(memoryScoreDefault)
  const out: MemoryScoreByTopicId = {}

  for (const tp of topicPacks) {
    out[tp.topicId] = initial
  }

  return out
}

export const applyReviewResultToScore = (
  current: number,
  result: ReviewResult,
): number => {
  const delta = result === 'correct' ? DELTA_CORRECT : -DELTA_INCORRECT
  return clampScore(current + delta)
}

