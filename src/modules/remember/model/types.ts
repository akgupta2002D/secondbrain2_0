export type Deck = {
  deckId: string
  deckClass: string
  topicPacks: TopicPack[]
}

export type TopicPack = {
  topicId: string
  title: string
  chapter: string
  cards: Flashcard[]
}

export type Flashcard = {
  cardId: string
  term: string
  definition: string
}

// JSON input shape (kept explicit so the parser can validate boundaries defensively)
export type FlashcardsJsonV1 = {
  version: 1
  deckId: string
  class: string
  topicPacks: Array<{
    topicId: string
    title: string
    chapter: string
    cards: Array<{
      cardId: string
      term: string
      definition: string
    }>
  }>
}

