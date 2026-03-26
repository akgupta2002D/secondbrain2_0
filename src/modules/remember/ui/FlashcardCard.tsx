import { useMemo, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Flashcard } from '../model/types'
import type { ReviewResult } from '../model/memoryScore'

type Props = {
  card: Flashcard
  deckClass: string
  isFlipped: boolean
  onFlip: () => void
  onSwipe?: (result: ReviewResult) => void
}

export const FlashcardCard = ({
  card,
  deckClass,
  isFlipped,
  onFlip,
  onSwipe,
}: Props) => {
  const ariaLabel = useMemo(() => {
    return isFlipped
      ? 'Flashcard back. Tap to show front.'
      : 'Flashcard front. Tap to show back.'
  }, [isFlipped])

  const startRef = useRef<{ x: number; y: number } | null>(null)
  const didSwipeRef = useRef(false)

  const SWIPE_THRESHOLD_PX = 55

  const handleClick = (): void => {
    // If a swipe triggered a review, swallow the subsequent click.
    if (didSwipeRef.current) {
      didSwipeRef.current = false
      return
    }
    onFlip()
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    startRef.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!onSwipe) return
    if (!isFlipped) return // only allow swipe on back side

    const start = startRef.current
    startRef.current = null
    if (!start) return

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y

    // Only accept mostly-horizontal swipes.
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    if (Math.abs(dy) > Math.abs(dx)) return

    didSwipeRef.current = true
    const result: ReviewResult = dx > 0 ? 'correct' : 'incorrect'
    onSwipe(result)
  }

  return (
    <button
      type="button"
      className="flashcardButton"
      onClick={handleClick}
      aria-pressed={isFlipped}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div
        className={isFlipped ? 'flashcardInner isFlipped' : 'flashcardInner'}
      >
        <div className="flashcardFace flashcardFront">
          <div className="flashcardTerm">{card.term}</div>
          <div className="flashcardMeta" aria-label="Topic meta">
            <span className="flashcardMetaClass">{deckClass}</span>
          </div>
        </div>

        <div className="flashcardFace flashcardBack">
          <div className="flashcardDefinition">{card.definition}</div>
        </div>
      </div>
    </button>
  )
}

