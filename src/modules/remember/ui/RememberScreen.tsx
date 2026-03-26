import { useEffect, useMemo, useState } from 'react'
import flashcardsJson from '../data/flashcards.json'
import { parseFlashcardsJsonV1 } from '../model/parseFlashcards'
import { applyReviewResultToScore, initMemoryScores } from '../model/memoryScore'
import { loadMemoryScores, saveMemoryScores } from '../model/memoryScoreStorage'
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

const pickRandomDifferentCardId = (
  cards: Array<{ cardId: string }>,
  currentCardId: string,
): string => {
  if (cards.length === 0) return ''
  if (cards.length === 1) return cards[0]!.cardId

  const filtered = cards.filter((c) => c.cardId !== currentCardId)
  return pickRandomCardId(
    filtered.length > 0 ? filtered : cards,
  )
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

  const [memoryScores, setMemoryScores] = useState(() => {
    if (parsed.kind !== 'ok') return {}

    const deckId = parsed.value.deckId
    const topicPacks = parsed.value.topicPacks
    const topicIds = topicPacks.map((t) => t.topicId)

    const loaded = loadMemoryScores(
      deckId,
      topicIds,
      MEMORY_SCORE_DEFAULT,
    )
    const loadedHasKeys = Object.keys(loaded).length > 0

    return loadedHasKeys
      ? loaded
      : initMemoryScores(
          MEMORY_SCORE_DEFAULT,
          topicPacks.map((t) => ({ topicId: t.topicId })),
        )
  })

  const [isCardFlipped, setIsCardFlipped] = useState(false)

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

  const [topicModalOpen, setTopicModalOpen] = useState(false)

  useEffect(() => {
    if (!topicModalOpen) return

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setTopicModalOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [topicModalOpen])

  useEffect(() => {
    const nextTopic =
      deck.topicPacks.find((t) => t.topicId === activeTopicId) ?? firstTopic
    setIsCardFlipped(false)
    setActiveCardId(pickRandomCardId(nextTopic.cards))
  }, [activeTopicId, deck]) // deck is stable (parsed once)

  useEffect(() => {
    saveMemoryScores(deck.deckId, memoryScores)
  }, [deck.deckId, memoryScores])

  const onFlip = (): void => setIsCardFlipped((v) => !v)

  const onReview = (result: 'correct' | 'incorrect'): void => {
    if (!isCardFlipped) return

    const topicId = topic.topicId
    const current = memoryScores[topicId] ?? MEMORY_SCORE_DEFAULT
    const next = applyReviewResultToScore(
      current,
      result,
    )

    setMemoryScores((prev) => ({
      ...prev,
      [topicId]: next,
    }))

    setIsCardFlipped(false)
    const nextCardId = pickRandomDifferentCardId(
      topic.cards,
      activeCardId,
    )
    setActiveCardId(nextCardId)
  }

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

      <button
        type="button"
        className="topicMenuButton"
        onClick={() => setTopicModalOpen(true)}
        aria-label="Topics"
        aria-haspopup="dialog"
        aria-expanded={topicModalOpen}
        title="Topics"
      >
        ...
      </button>

      {topicModalOpen ? (
        <div
          className="topicModalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Select topic"
          onClick={() => setTopicModalOpen(false)}
        >
          <div
            className="topicModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="topicModalHeader">
              <p className="topicModalHeaderClass">{deck.deckClass}</p>
              <p className="topicModalHeaderTitle">Topics</p>
            </div>

            <div className="topicModalList" aria-label="Topic list">
              {deck.topicPacks.map((tp) => {
                const score =
                  memoryScores[tp.topicId] ?? MEMORY_SCORE_DEFAULT
                const isActive = tp.topicId === topic.topicId

                return (
                  <button
                    key={tp.topicId}
                    type="button"
                    className={
                      isActive ? 'topicModalItem isActive' : 'topicModalItem'
                    }
                    onClick={() => {
                      setActiveTopicId(tp.topicId)
                      setTopicModalOpen(false)
                    }}
                    aria-pressed={isActive}
                    aria-label={`Topic ${tp.title}`}
                  >
                    <div className="topicModalItemMain">
                      <span className="topicModalItemTitle">{tp.title}</span>
                      <span className="topicModalItemChapter">{tp.chapter}</span>
                    </div>
                    <div className="topicModalItemMeta">{score}</div>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="topicModalClose"
              onClick={() => setTopicModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <FlashcardCard
        key={`${topic.topicId}:${activeCardId}`}
        card={topic.cards.find((c) => c.cardId === activeCardId) ?? topic.cards[0]!}
        deckClass={deck.deckClass}
        chapter={topic.chapter}
        isFlipped={isCardFlipped}
        onFlip={onFlip}
      />

      <div
        className={
          isCardFlipped ? 'reviewActions' : 'reviewActions reviewActionsHidden'
        }
        aria-label="Review actions"
      >
        <button
          type="button"
          className="reviewButton reviewCorrect"
          onClick={() => onReview('correct')}
          disabled={!isCardFlipped}
        >
          Correct
        </button>
        <button
          type="button"
          className="reviewButton reviewIncorrect"
          onClick={() => onReview('incorrect')}
          disabled={!isCardFlipped}
        >
          Incorrect
        </button>
      </div>
    </main>
  )
}

