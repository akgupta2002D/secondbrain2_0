import { useEffect, useMemo, useState } from 'react'
import flashcardsJson from '../data/flashcards.json'
import { parseFlashcardsJsonV1 } from '../model/parseFlashcards'
import { initMemoryScores } from '../model/memoryScore'
import { FlashcardCard } from './FlashcardCard'

const MEMORY_SCORE_DEFAULT = 50

type Props = {
  onBack: () => void
}

const pickRandomCardId = (
  cards: Array<{ cardId: string }>,
): string => {
  if (cards.length === 0) return ''
  const idx = Math.floor(Math.random() * cards.length)
  return cards[idx]?.cardId ?? cards[0]!.cardId
}

export const RememberScreen = ({ onBack }: Props) => {
  const parsed = useMemo(() => {
    return parseFlashcardsJsonV1(flashcardsJson)
  }, [])

  const [activeTopicId, setActiveTopicId] = useState(() => {
    if (parsed.kind === 'ok') return parsed.value.topicPacks[0]?.topicId ?? ''
    return ''
  })

  const [activeCardId, setActiveCardId] = useState(() => {
    if (parsed.kind === 'ok') {
      const firstTopic = parsed.value.topicPacks[0]
      return firstTopic ? pickRandomCardId(firstTopic.cards) : ''
    }
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
  const firstTopic = deck.topicPacks[0]
  const activeTopic = deck.topicPacks.find((t) => t.topicId === activeTopicId)
  const topic = activeTopic ?? firstTopic

  useEffect(() => {
    const nextTopic =
      deck.topicPacks.find((t) => t.topicId === activeTopicId) ?? firstTopic
    setActiveCardId(pickRandomCardId(nextTopic.cards))
  }, [activeTopicId, deck]) // deck is stable (parsed once)

  return (
    <main className="screen rememberScreen" aria-label="Remember">
      <button
        type="button"
        className="backButton"
        onClick={onBack}
        aria-label="Back"
      >
        Back
      </button>

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
        key={`${topic.topicId}:${activeCardId}`}
        card={topic.cards.find((c) => c.cardId === activeCardId) ?? topic.cards[0]!}
        deckClass={deck.deckClass}
        chapter={topic.chapter}
      />
    </main>
  )
}

