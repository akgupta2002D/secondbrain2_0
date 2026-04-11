import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { splitDefinitionForDisplay } from '../lib/splitDefinitionLines'
import type { Flashcard } from '../model/types'
import type { ReviewResult } from '../model/memoryScore'

type Props = {
  card: Flashcard
  deckClass: string
  isFlipped: boolean
  onFlip: () => void
  onSwipe?: (result: ReviewResult) => void
  onSwipeUiChange?: (ui: {
    dragStrength: number
    dragDirection: 'left' | 'right' | 'none'
    isDragging: boolean
  }) => void
}

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n))

export const FlashcardCard = ({
  card,
  deckClass,
  isFlipped,
  onFlip,
  onSwipe,
  onSwipeUiChange,
}: Props) => {
  const ariaLabel = useMemo(() => {
    return isFlipped
      ? 'Flashcard back. Tap to show front.'
      : 'Flashcard front. Tap to show back or swipe left or right to review.'
  }, [isFlipped])

  const startRef = useRef<{ x: number; y: number } | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const didSwipeRef = useRef(false)
  const didDragRef = useRef(false)
  const settleTimeoutRef = useRef<number | null>(null)

  const DRAG_DEADZONE_PX = 8
  const SWIPE_THRESHOLD_PX = 70

  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSettling, setIsSettling] = useState(false)
  const [settleResult, setSettleResult] = useState<ReviewResult | null>(null)

  const handleClick = (): void => {
    // If a swipe triggered a review, swallow the subsequent click.
    if (didSwipeRef.current) {
      didSwipeRef.current = false
      return
    }
    // If we dragged even a little, swallow click to avoid accidental flips.
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    onFlip()
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!onSwipe) return
    startRef.current = { x: e.clientX, y: e.clientY }
    pointerIdRef.current = e.pointerId
    didDragRef.current = false
    setIsDragging(true)
    setIsSettling(false)
    setDragX(0)
    setSettleResult(null)
    onSwipeUiChange?.({ dragStrength: 0, dragDirection: 'none', isDragging: true })
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // no-op: pointer capture can fail in some environments
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!onSwipe) return
    if (!isDragging) return
    if (pointerIdRef.current !== e.pointerId) return

    const start = startRef.current
    if (!start) return

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y

    // If it becomes mostly vertical, stop treating it as a swipe gesture.
    if (Math.abs(dy) > Math.abs(dx) * 1.1) return

    if (Math.abs(dx) > DRAG_DEADZONE_PX) didDragRef.current = true
    setDragX(dx)
  }

  const endGesture = (): void => {
    startRef.current = null
    pointerIdRef.current = null
    setIsDragging(false)
    onSwipeUiChange?.({ dragStrength: 0, dragDirection: 'none', isDragging: false })
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!onSwipe) return
    if (pointerIdRef.current !== e.pointerId) return

    const start = startRef.current
    if (!start) {
      endGesture()
      return
    }

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    endGesture()

    // Only accept mostly-horizontal swipes.
    if (Math.abs(dy) > Math.abs(dx)) {
      setIsSettling(true)
      setDragX(0)
      setSettleResult(null)
      onSwipeUiChange?.({ dragStrength: 0, dragDirection: 'none', isDragging: false })
      return
    }

    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) {
      setIsSettling(true)
      setDragX(0)
      setSettleResult(null)
      onSwipeUiChange?.({ dragStrength: 0, dragDirection: 'none', isDragging: false })
      return
    }

    didSwipeRef.current = true
    const result: ReviewResult = dx > 0 ? 'correct' : 'incorrect'
    setSettleResult(result)

    // Animate off-screen, then trigger review (so it feels smooth).
    setIsSettling(true)
    const offscreenX = (dx > 0 ? 1 : -1) * 520
    setDragX(offscreenX)

    if (settleTimeoutRef.current) window.clearTimeout(settleTimeoutRef.current)
    settleTimeoutRef.current = window.setTimeout(() => {
      onSwipe(result)
      setDragX(0)
      setIsSettling(false)
      setSettleResult(null)
      onSwipeUiChange?.({ dragStrength: 0, dragDirection: 'none', isDragging: false })
    }, 140)
  }

  const onPointerCancel = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return
    endGesture()
    setIsSettling(true)
    setDragX(0)
    setSettleResult(null)
    onSwipeUiChange?.({ dragStrength: 0, dragDirection: 'none', isDragging: false })
  }

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) window.clearTimeout(settleTimeoutRef.current)
    }
  }, [])

  const definitionLines = useMemo(
    () => splitDefinitionForDisplay(card.definition),
    [card.definition],
  )

  const dragStrength = onSwipe
    ? clamp01(Math.abs(dragX) / SWIPE_THRESHOLD_PX)
    : 0
  const dragDirection = dragX > 0 ? 'right' : dragX < 0 ? 'left' : 'none'
  const rotateZ =
    onSwipe && (isDragging || isSettling || Math.abs(dragX) > 0.5)
      ? clamp01(dragStrength) * (dragX > 0 ? 1 : -1) * 2.5
      : 0

  const showDragTransform =
    Boolean(onSwipe) &&
    (isDragging || isSettling || Math.abs(dragX) > 0.5)

  // Omit `onSwipe` from deps: parent often passes an inline handler; including it retriggers
  // every render and loops with setSwipeUi.
  useEffect(() => {
    if (!onSwipe) return
    const active =
      isDragging || isSettling || Math.abs(dragX) > 0.5
    if (!active) {
      onSwipeUiChange?.({
        dragStrength: 0,
        dragDirection: 'none',
        isDragging: false,
      })
      return
    }
    onSwipeUiChange?.({
      dragStrength,
      dragDirection,
      isDragging,
    })
  }, [
    dragStrength,
    dragDirection,
    dragX,
    isDragging,
    isSettling,
    onSwipeUiChange,
  ])

  return (
    <button
      type="button"
      className="flashcardButton"
      onClick={handleClick}
      aria-pressed={isFlipped}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className={[
          'flashcardDrag',
          isDragging ? 'isDragging' : '',
          isSettling ? 'isSettling' : '',
        ].filter(Boolean).join(' ')}
        style={{
          transform: showDragTransform
            ? `translateX(${dragX}px) rotateZ(${rotateZ}deg)`
            : 'translateX(0px) rotateZ(0deg)',
        }}
      >
        {settleResult ? (
          <div
            className={[
              'swipeTopFeedback',
              settleResult === 'correct' ? 'swipeTopFeedbackCorrect' : 'swipeTopFeedbackIncorrect',
            ].join(' ')}
            aria-live="polite"
          >
            {settleResult === 'correct' ? 'Know' : "Don't know"}
          </div>
        ) : null}

        <div className={isFlipped ? 'flashcardInner isFlipped' : 'flashcardInner'}>
          <div className="flashcardFace flashcardFront">
            <div className="flashcardTerm">{card.term}</div>
            <div className="flashcardMeta" aria-label="Topic meta">
              <span className="flashcardMetaClass">{deckClass}</span>
            </div>
          </div>

          <div className="flashcardFace flashcardBack">
            <div className="flashcardDefinitionStack">
              {definitionLines.map((line, i) => (
                <p key={i} className="flashcardDefinitionLine">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

