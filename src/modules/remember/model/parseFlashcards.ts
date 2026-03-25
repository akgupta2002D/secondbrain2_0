import type { Deck } from './types'
import { err, ok, type Result } from './result'

export type ParseFlashcardsError =
  | {
      kind: 'invalid';
      message: string
      path?: string
    }
  | {
      kind: 'unknown';
      message: string
    }

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0
}

const trimString = (value: string): string => value.trim()

const expectNonEmptyString = (
  value: unknown,
  path: string,
): Result<string, ParseFlashcardsError> => {
  if (!isNonEmptyString(value)) {
    return err({ kind: 'invalid', message: 'Expected non-empty string', path })
  }
  return ok(trimString(value))
}

export const parseFlashcardsJsonV1 = (
  input: unknown,
): Result<Deck, ParseFlashcardsError> => {
  try {
    if (!isRecord(input)) {
      return err({ kind: 'invalid', message: 'Expected an object at root' })
    }

    const version = (input as UnknownRecord).version
    if (version !== 1) {
      return err({
        kind: 'invalid',
        message: 'Unsupported version',
        path: 'version',
      })
    }

    const deckIdRes = expectNonEmptyString((input as UnknownRecord).deckId, 'deckId')
    if (deckIdRes.kind === 'err') return deckIdRes

    const deckClassRes = expectNonEmptyString(
      (input as UnknownRecord).class,
      'class',
    )
    if (deckClassRes.kind === 'err') return deckClassRes

    const topicPacks = (input as UnknownRecord).topicPacks
    if (!Array.isArray(topicPacks)) {
      return err({
        kind: 'invalid',
        message: 'Expected topicPacks to be an array',
        path: 'topicPacks',
      })
    }

    const topicPacksParsed = topicPacks.map((t, topicIndex) => {
      const basePath = `topicPacks[${topicIndex}]`
      if (!isRecord(t)) {
        return err({
          kind: 'invalid',
          message: 'Expected topicPack object',
          path: basePath,
        })
      }

      const topicIdRes = expectNonEmptyString(t.topicId, `${basePath}.topicId`)
      if (topicIdRes.kind === 'err') return topicIdRes

      const titleRes = expectNonEmptyString(t.title, `${basePath}.title`)
      if (titleRes.kind === 'err') return titleRes

      const chapterRes = expectNonEmptyString(t.chapter, `${basePath}.chapter`)
      if (chapterRes.kind === 'err') return chapterRes

      const cards = t.cards
      if (!Array.isArray(cards)) {
        return err({
          kind: 'invalid',
          message: 'Expected cards to be an array',
          path: `${basePath}.cards`,
        })
      }

      const cardsParsed = cards.map((c, cardIndex) => {
        const cardPath = `${basePath}.cards[${cardIndex}]`
        if (!isRecord(c)) {
          return err({
            kind: 'invalid',
            message: 'Expected card object',
            path: cardPath,
          })
        }

        const cardIdRes = expectNonEmptyString(c.cardId, `${cardPath}.cardId`)
        if (cardIdRes.kind === 'err') return cardIdRes

        const termRes = expectNonEmptyString(c.term, `${cardPath}.term`)
        if (termRes.kind === 'err') return termRes

        const defRes = expectNonEmptyString(
          c.definition,
          `${cardPath}.definition`,
        )
        if (defRes.kind === 'err') return defRes

        return ok({
          cardId: cardIdRes.value,
          term: termRes.value,
          definition: defRes.value,
        })
      })

      // Propagate first error (no partial parsing).
      const firstErr = cardsParsed.find(
        (r): r is { kind: 'err'; error: ParseFlashcardsError } => r.kind === 'err',
      )
      if (firstErr) return firstErr

      const cardsOk = cardsParsed.map((r) => (r.kind === 'ok' ? r.value : null)).filter(
        (v): v is NonNullable<typeof v> => v !== null,
      )

      return ok({
        topicId: topicIdRes.value,
        title: titleRes.value,
        chapter: chapterRes.value,
        cards: cardsOk,
      })
    })

    const firstTopicErr = topicPacksParsed.find(
      (r): r is { kind: 'err'; error: ParseFlashcardsError } => r.kind === 'err',
    )
    if (firstTopicErr) return firstTopicErr

    const topicPacksOk = topicPacksParsed.map((r) => (r.kind === 'ok' ? r.value : null)).filter(
      (v): v is NonNullable<typeof v> => v !== null,
    )

    if (topicPacksOk.length === 0) {
      return err({
        kind: 'invalid',
        message: 'Expected at least one topic pack',
        path: 'topicPacks',
      })
    }

    const deck: Deck = {
      deckId: deckIdRes.value,
      deckClass: deckClassRes.value,
      topicPacks: topicPacksOk,
    }

    return ok(deck)
  } catch (e) {
    return err({
      kind: 'unknown',
      message: e instanceof Error ? e.message : 'Unknown parse error',
    })
  }
}

