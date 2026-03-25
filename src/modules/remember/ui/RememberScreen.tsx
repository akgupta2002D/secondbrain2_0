import { useMemo, useState } from 'react'
import flashcardsJson from '../data/flashcards.json'
import { parseFlashcardsJsonV1 } from '../model/parseFlashcards'
import { initMemoryScores } from '../model/memoryScore'
import { FlashcardCard } from './FlashcardCard'

const MEMORY_SCORE_DEFAULT = 50

export const RememberScreen = () => {
  const parsed = useMemo(() => {
    return parseFlashcardsJsonV1(flashcardsJson)
  }, [])

  const [activeTopicId, setActiveTopicId] = useState(() => {
    if (parsed.kind === 'ok') return parsed.value.topicPacks[0]?.topicId ?? ''
    return ''
  })

  const [memoryScores] = useState(() => {
    if (parsed.kind === 'ok') {
      return initMemoryScores(
        MEMORY_SCORE_DEFAULT,
        parsed.value.topicPacks.map((t) => ({ topicId: t.topicId })),
      )
    }
    return {}
  })

  if (parsed.kind === 'err') {
    return (
      <main className="screen rememberScreen" aria-label="Remember error">
        <div className="rememberError">
          <p className="rememberErrorTitle">Failed to load flashcards</p>
          <p className="rememberErrorBody">{parsed.error.message}</p>
        </div>
      </main>
    )
  }

  const deck = parsed.value
  const activeTopic = deck.topicPacks.find((t) => t.topicId === activeTopicId)
  const firstTopic = deck.topicPacks[0]
  const topic = activeTopic ?? firstTopic
  const card = topic.cards[0]

  return (
    <main className="screen rememberScreen" aria-label="Remember">
      <div className="memoryScoreList" aria-label="Topic memory scores">
        {deck.topicPacks.map((tp) => {
          const score = memoryScores[tp.topicId] ?? MEMORY_SCORE_DEFAULT
          const isActive = tp.topicId === topic.topicId

          return (
            <button
              key={tp.topicId}
              className={isActive ? 'memoryScoreItem isActive' : 'memoryScoreItem'}
              type="button"
              onClick={() => setActiveTopicId(tp.topicId)}
              aria-pressed={isActive}
              aria-label={`Topic ${tp.title}`}
            >
              <span className="memoryScoreTitle">{tp.title}</span>
              <span className="memoryScoreValue">{score}</span>
            </button>
          )
        })}
      </div>

      <FlashcardCard
        card={card}
        deckClass={deck.deckClass}
        chapter={topic.chapter}
      />
    </main>
  )
}

