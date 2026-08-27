import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { fetchBiography } from '../data/fetchBiography'
import type { BiographyRecord } from '../model/types'

type ChatItem =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'loading' }
  | { id: string; role: 'reply'; record: BiographyRecord }
  | { id: string; role: 'error'; message: string }

function ReplyCard({ record }: { record: BiographyRecord }) {
  return (
    <article className="biographyCard">
      <h2 className="biographyCardName">{record.name}</h2>
      {record.summary ? (
        <p className="biographyCardSummary">{record.summary}</p>
      ) : null}
      {record.facts.length > 0 ? (
        <dl className="biographyFacts">
          {record.facts.map((fact) => (
            <div key={fact.label} className="biographyFact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  )
}

export function BiographyScreen() {
  const inputId = useId()
  const [draft, setDraft] = useState('')
  const [items, setItems] = useState<ChatItem[]>([])
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bottomRef.current
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'end' })
    }
  }, [items])

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const name = draft.trim()
    if (!name || busy) return

    const userId = `${Date.now()}-u`
    const pendingId = `${Date.now()}-p`
    setDraft('')
    setBusy(true)
    setItems((prev) => [
      ...prev,
      { id: userId, role: 'user', text: name },
      { id: pendingId, role: 'loading' },
    ])

    const result = await fetchBiography(name)
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== pendingId) return item
        if (result.kind === 'ok') {
          return { id: pendingId, role: 'reply', record: result.record }
        }
        return { id: pendingId, role: 'error', message: result.message }
      }),
    )
    setBusy(false)
  }

  return (
    <main className="screen biographyScreen" aria-label="Biography">
      <div className="biographyThread">
        {items.length === 0 ? (
          <p className="biographyEmpty">
            Ask for someone by name. A short life, then the facts that stay with
            you.
          </p>
        ) : null}
        {items.map((item) => {
          if (item.role === 'user') {
            return (
              <p key={item.id} className="biographyBubble biographyBubbleUser">
                {item.text}
              </p>
            )
          }
          if (item.role === 'loading') {
            return (
              <p key={item.id} className="biographyBubble biographyBubbleBot">
                Looking that up…
              </p>
            )
          }
          if (item.role === 'error') {
            return (
              <p key={item.id} className="biographyBubble biographyBubbleError">
                {item.message}
              </p>
            )
          }
          return <ReplyCard key={item.id} record={item.record} />
        })}
        <div ref={bottomRef} />
      </div>

      <form className="biographyComposer" onSubmit={(e) => void onSubmit(e)}>
        <label className="notesSrOnly" htmlFor={inputId}>
          Person’s name
        </label>
        <input
          id={inputId}
          className="biographyInput"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Name of a person"
          autoComplete="off"
          enterKeyHint="send"
          disabled={busy}
        />
        <button
          type="submit"
          className="biographySend"
          disabled={busy}
          aria-label="Send"
        >
          Send
        </button>
      </form>
    </main>
  )
}
