import { useMemo, useState } from 'react'
import type { Flashcard } from '../model/types'

type Props = {
  card: Flashcard
  deckClass: string
  chapter: string
}

export const FlashcardCard = ({ card, deckClass, chapter }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const ariaLabel = useMemo(() => {
    return isFlipped
      ? 'Flashcard back. Tap to show front.'
      : 'Flashcard front. Tap to show back.'
  }, [isFlipped])

  return (
    <button
      type="button"
      className="flashcardButton"
      onClick={() => setIsFlipped((v) => !v)}
      aria-pressed={isFlipped}
      aria-label={ariaLabel}
    >
      <div
        className={isFlipped ? 'flashcardInner isFlipped' : 'flashcardInner'}
      >
        <div className="flashcardFace flashcardFront">
          <div className="flashcardTerm">{card.term}</div>
          <div className="flashcardMeta" aria-label="Topic meta">
            <span className="flashcardMetaClass">{deckClass}</span>
            <span className="flashcardMetaChapter">{chapter}</span>
          </div>
        </div>

        <div className="flashcardFace flashcardBack">
          <div className="flashcardDefinition">{card.definition}</div>
        </div>
      </div>
    </button>
  )
}

