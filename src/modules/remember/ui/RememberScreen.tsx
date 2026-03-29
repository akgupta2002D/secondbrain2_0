import { useEffect, useMemo, useState } from 'react'
import flashcardsJson from '../data/definitions306.json'
import cellBioJson from '../data/cellBio_cellJunction.json'
import spanishExam4Json from '../data/spanish_exam4.json'
import { parseFlashcardsJsonV1 } from '../model/parseFlashcards'
import { applyReviewResultToScore, initMemoryScores } from '../model/memoryScore'
import { loadMemoryScores, saveMemoryScores } from '../model/memoryScoreStorage'
import { FlashcardCard } from './FlashcardCard'
import type { ReviewResult } from '../model/memoryScore'
import type { Deck } from '../model/types'

const MEMORY_SCORE_DEFAULT = 50
const MEMORY_SCORE_ID = 'class'

type Props = {
  onBack: () => void
}

/** Stable deck order, then rotate so review visits every card once in a fixed ring. */
const buildRotatedCycleOrder = (cardIds: string[]): string[] => {
  if (cardIds.length === 0) return []
  const start = Math.floor(Math.random() * cardIds.length)
  return [...cardIds.slice(start), ...cardIds.slice(0, start)]
}

export const RememberScreen = ({ onBack }: Props) => {
  const parsedDecks = useMemo(() => {
    const parsed = [
      parseFlashcardsJsonV1(flashcardsJson),
      parseFlashcardsJsonV1(cellBioJson),
      parseFlashcardsJsonV1(spanishExam4Json),
    ]

    const firstErr = parsed.find((r) => r.kind === 'err')
    if (firstErr && firstErr.kind === 'err') return firstErr

    const decks = parsed
      .map((r) => (r.kind === 'ok' ? r.value : null))
      .filter((d): d is Deck => d !== null)

    if (decks.length === 0) {
      return {
        kind: 'err' as const,
        error: { kind: 'invalid' as const, message: 'No decks available' },
      }
    }

    return { kind: 'ok' as const, value: decks }
  }, [])

  const [activeDeckId, setActiveDeckId] = useState(() => {
    if (parsedDecks.kind !== 'ok') return ''
    return parsedDecks.value[0]?.deckId ?? ''
  })

  const activeDeck = useMemo(() => {
    if (parsedDecks.kind !== 'ok') return null
    return parsedDecks.value.find((d) => d.deckId === activeDeckId) ?? parsedDecks.value[0] ?? null
  }, [parsedDecks, activeDeckId])

  const [cycleOrder, setCycleOrder] = useState<string[]>([])
  const [cycleIndex, setCycleIndex] = useState(0)
  const [activeCardId, setActiveCardId] = useState('')

  const [memoryScores, setMemoryScores] = useState<Record<string, number>>({})

  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [swipeUi, setSwipeUi] = useState<{
    dragStrength: number
    dragDirection: 'left' | 'right' | 'none'
    isDragging: boolean
  }>({ dragStrength: 0, dragDirection: 'none', isDragging: false })
  const [cyclePromptOpen, setCyclePromptOpen] = useState(false)

  if (parsedDecks.kind === 'err') {
    return (
      <main className="screen rememberScreen" aria-label="Remember error">
        <div className="rememberError">
          <p className="rememberErrorTitle">Failed to load flashcards</p>
          <p className="rememberErrorBody">{parsedDecks.error.message}</p>
        </div>
      </main>
    )
  }

  if (!activeDeck) {
    return (
      <main className="screen rememberScreen" aria-label="Remember error">
        <div className="rememberError">
          <p className="rememberErrorTitle">No active deck found</p>
        </div>
      </main>
    )
  }

  const deck = activeDeck
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
    setIsCardFlipped(false)
    setCyclePromptOpen(false)
    const ids = allCards.map((c) => c.cardId)
    if (ids.length === 0) {
      setCycleOrder([])
      setCycleIndex(0)
      setActiveCardId('')
      return
    }
    const order = buildRotatedCycleOrder(ids)
    setCycleOrder(order)
    setCycleIndex(0)
    setActiveCardId(order[0]!)
  }, [deck, allCards])

  useEffect(() => {
    const loaded = loadMemoryScores(
      deck.deckId,
      [MEMORY_SCORE_ID],
      MEMORY_SCORE_DEFAULT,
    )
    const loadedHasKeys = Object.keys(loaded).length > 0
    setMemoryScores(
      loadedHasKeys
        ? loaded
        : initMemoryScores(
            MEMORY_SCORE_DEFAULT,
            [{ topicId: MEMORY_SCORE_ID }],
          ),
    )
  }, [deck.deckId])

  useEffect(() => {
    saveMemoryScores(deck.deckId, memoryScores)
  }, [deck.deckId, memoryScores])

  const onFlip = (): void => setIsCardFlipped((v) => !v)

  const onReview = (result: 'correct' | 'incorrect'): void => {
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

    const n = cycleOrder.length
    if (n === 0) return

    // Just finished the last card in the rotated cycle.
    if (cycleIndex >= n - 1) {
      setCyclePromptOpen(true)
      return
    }

    const nextIdx = cycleIndex + 1
    setCycleIndex(nextIdx)
    setActiveCardId(cycleOrder[nextIdx]!)
  }

  const onSwipeReview = (result: ReviewResult): void => {
    if (cyclePromptOpen) return
    onReview(result)
  }

  const onStartAgain = (): void => {
    const ids = allCards.map((c) => c.cardId)
    if (ids.length === 0) {
      setCyclePromptOpen(false)
      return
    }
    const order = buildRotatedCycleOrder(ids)
    setCycleOrder(order)
    setCycleIndex(0)
    setActiveCardId(order[0]!)
    setCyclePromptOpen(false)
    setIsCardFlipped(false)
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
          isCardFlipped ||
          swipeUi.isDragging ||
          swipeUi.dragStrength > 0.02
            ? 'isActive'
            : '',
          swipeUi.isDragging ? 'isDragging' : '',
        ].filter(Boolean).join(' ')}
        aria-hidden="true"
        style={{
          opacity:
            isCardFlipped ||
            swipeUi.isDragging ||
            swipeUi.dragStrength > 0.02
              ? 1
              : 0,
          // subtle "activation" as you drag
          ['--swipe-strength' as any]: String(swipeUi.dragStrength),
        }}
      >
        <div className="swipeSplitLeft" />
        <div className="swipeSplitRight" />
        <div
          className={[
            'swipeEdgeLabel',
            swipeUi.dragDirection === 'left' ? 'isLeft' : '',
            swipeUi.dragDirection === 'right' ? 'isRight' : '',
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
              <p className="topicModalHeaderTitle">Classes</p>
            </div>

            <div className="topicModalList" aria-label="Topic list">
              {parsedDecks.value.map((d) => {
                const scoreForDeck = d.deckId === deck.deckId
                  ? (memoryScores[MEMORY_SCORE_ID] ?? MEMORY_SCORE_DEFAULT)
                  : (loadMemoryScores(d.deckId, [MEMORY_SCORE_ID], MEMORY_SCORE_DEFAULT)[MEMORY_SCORE_ID] ?? MEMORY_SCORE_DEFAULT)

                const isActive = d.deckId === deck.deckId
                return (
                  <button
                    key={d.deckId}
                    type="button"
                    className={`topicModalItem ${isActive ? 'isActive' : ''}`}
                    onClick={() => {
                      setActiveDeckId(d.deckId)
                      setTopicModalOpen(false)
                    }}
                    aria-pressed={isActive}
                    aria-label={`Class ${d.deckClass}`}
                  >
                    <div className="topicModalItemMain">
                      <span className="topicModalItemTitle">{d.deckClass}</span>
                    </div>
                    <div className="topicModalItemMeta">
                      {scoreForDeck}
                    </div>
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

      {cycleOrder.length > 0 && !cyclePromptOpen ? (
        <p
          className="rememberCycleProgress"
          aria-label={`Card ${cycleIndex + 1} of ${cycleOrder.length}`}
        >
          {cycleIndex + 1} / {cycleOrder.length}
        </p>
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

