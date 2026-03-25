const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n))

export type MemoryScoreByTopicId = Record<string, number>

export const initMemoryScores = (
  memoryScoreDefault: number,
  topicPacks: Array<{ topicId: string }>,
): MemoryScoreByTopicId => {
  const initial = clamp(memoryScoreDefault, 0, 100)
  const out: MemoryScoreByTopicId = {}

  for (const tp of topicPacks) {
    out[tp.topicId] = initial
  }

  return out
}

