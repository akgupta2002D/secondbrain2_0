import { useEffect, useMemo, useState } from 'react'
import flashcardsJson from '../data/definitions306.json'
import { parseFlashcardsJsonV1 } from '../model/parseFlashcards'
import { applyReviewResultToScore, initMemoryScores } from '../model/memoryScore'
import { loadMemoryScores, saveMemoryScores } from '../model/memoryScoreStorage'
import { FlashcardCard } from './FlashcardCard'
import type { ReviewResult } from '../model/memoryScore'

const MEMORY_SCORE_DEFAULT = 50
const MEMORY_SCORE_ID = 'class'

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

  const [activeCardId, setActiveCardId] = useState(() => {
    if (parsed.kind === 'ok') {
      const allCards = parsed.value.topicPacks.flatMap((tp) => tp.cards)
      return allCards.length > 0 ? pickRandomCardId(allCards) : ''
    }
    return ''
  })

  const [memoryScores, setMemoryScores] = useState(() => {
    if (parsed.kind !== 'ok') return {}

    const deckId = parsed.value.deckId

    const loaded = loadMemoryScores(
      deckId,
      [MEMORY_SCORE_ID],
      MEMORY_SCORE_DEFAULT,
    )
    const loadedHasKeys = Object.keys(loaded).length > 0

    return loadedHasKeys
      ? loaded
      : initMemoryScores(
          MEMORY_SCORE_DEFAULT,
          [{ topicId: MEMORY_SCORE_ID }],
        )
  })

  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [swipeUi, setSwipeUi] = useState<{
    dragStrength: number
    dragDirection: 'left' | 'right' | 'none'
    isDragging: boolean
  }>({ dragStrength: 0, dragDirection: 'none', isDragging: false })
  const [cycleReviewedCardIds, setCycleReviewedCardIds] = useState<string[]>(
    [],
  )
  const [cyclePromptOpen, setCyclePromptOpen] = useState(false)

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
  const allCards = useMemo(() => {
    return deck.topicPacks.flatMap((tp) => tp.cards)
  }, [deck])

  const activeCard = allCards.find((c) => c.cardId === activeCardId) ?? allCards[0]

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
    // Deck is stable (parsed once). When it changes, reset review state.
    setIsCardFlipped(false)
    setCycleReviewedCardIds([])
    setCyclePromptOpen(false)
    setActiveCardId(allCards.length > 0 ? pickRandomCardId(allCards) : '')
  }, [deck, allCards])

  useEffect(() => {
    saveMemoryScores(deck.deckId, memoryScores)
  }, [deck.deckId, memoryScores])

  const onFlip = (): void => setIsCardFlipped((v) => !v)

  const onReview = (result: 'correct' | 'incorrect'): void => {
    if (!isCardFlipped) return
    if (cyclePromptOpen) return
    if (!activeCard) return

    const current = memoryScores[MEMORY_SCORE_ID] ?? MEMORY_SCORE_DEFAULT
    const next = applyReviewResultToScore(
      current,
      result,
    )

    setMemoryScores((prev) => ({
      ...prev,
      [MEMORY_SCORE_ID]: next,
    }))

    setIsCardFlipped(false)

    const allCardIds = allCards.map((c) => c.cardId)
    const currentCardId = activeCard.cardId
    const nextReviewedIds = Array.from(
      new Set([...cycleReviewedCardIds, currentCardId]),
    )
    const didCompleteCycle = nextReviewedIds.length >= allCardIds.length

    if (didCompleteCycle) {
      setCyclePromptOpen(true)
      setCycleReviewedCardIds([])
      return
    }

    setCycleReviewedCardIds(nextReviewedIds)

    const nextCardId = pickRandomDifferentCardId(
      allCards,
      currentCardId,
    )
    setActiveCardId(nextCardId)
  }

  const onSwipeReview = (result: ReviewResult): void => {
    if (cyclePromptOpen) return
    onReview(result)
  }

  const onStartAgain = (): void => {
    setCyclePromptOpen(false)
    setIsCardFlipped(false)
    const nextCardId = activeCard
      ? pickRandomDifferentCardId(allCards, activeCard.cardId)
      : pickRandomCardId(allCards)
    setActiveCardId(nextCardId)
  }

  const onChooseDifferentTopic = (): void => {
    setCyclePromptOpen(false)
    setTopicModalOpen(true)
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

      <div
        className={[
          'swipeSplitBg',
          isCardFlipped ? 'isActive' : '',
          swipeUi.isDragging ? 'isDragging' : '',
        ].filter(Boolean).join(' ')}
        aria-hidden="true"
        style={{
          opacity: isCardFlipped ? 1 : 0,
          // subtle "activation" as you drag
          ['--swipe-strength' as any]: String(swipeUi.dragStrength),
        }}
      >
        <div className="swipeSplitLeft" />
        <div className="swipeSplitRight" />
        <div
          className={[
            'swipeEdgeLabel',
            swipeUi.dragDirection === 'left' ? 'isRight' : '',
            swipeUi.dragDirection === 'right' ? 'isLeft' : '',
          ].filter(Boolean).join(' ')}
          style={{ opacity: Math.max(0, swipeUi.dragStrength - 0.1) }}
        >
          {swipeUi.dragDirection === 'left' ? "Don't know" : swipeUi.dragDirection === 'right' ? 'Know' : ''}
        </div>
      </div>

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
              <button
                key={deck.deckId}
                type="button"
                className="topicModalItem isActive"
                onClick={() => setTopicModalOpen(false)}
                aria-pressed={true}
                aria-label={`Class ${deck.deckClass}`}
              >
                <div className="topicModalItemMain">
                  <span className="topicModalItemTitle">{deck.deckClass}</span>
                </div>
                <div className="topicModalItemMeta">
                  {memoryScores[MEMORY_SCORE_ID] ?? MEMORY_SCORE_DEFAULT}
                </div>
              </button>
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

      {cyclePromptOpen ? (
        <div className="cycleCompletePrompt" aria-live="polite">
          <p className="cycleCompleteTitle">Completed. Start again.</p>
          <div className="cycleCompleteActions">
            <button
              type="button"
              className="cycleActionButton"
              onClick={onStartAgain}
            >
              Start Again
            </button>
            <button
              type="button"
              className="cycleActionButton cycleActionAlt"
              onClick={onChooseDifferentTopic}
            >
              Different Topic
            </button>
          </div>
        </div>
      ) : null}

      <FlashcardCard
        key={activeCardId}
        card={activeCard ?? allCards[0]!}
        deckClass={deck.deckClass}
        isFlipped={isCardFlipped}
        onFlip={onFlip}
        onSwipe={onSwipeReview}
        onSwipeUiChange={setSwipeUi}
      />
    </main>
  )
}

