import { useEffect, useId, useRef, type RefObject } from 'react'
import type { Thought } from '../model/types'

type Props = {
  open: boolean
  onClose: () => void
  thoughts: Thought[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void | Promise<void>
  searchQuery: string
  onSearchChange: (q: string) => void
  disabled?: boolean
  returnFocusRef?: RefObject<HTMLButtonElement | null>
}

function previewLine(body: string): string {
  const line = body.trim().split(/\r?\n/)[0] ?? ''
  if (line.length <= 72) return line || 'Empty'
  return `${line.slice(0, 72)}…`
}

export function ThoughtsDrawer({
  open,
  onClose,
  thoughts,
  selectedId,
  onSelect,
  onNew,
  searchQuery,
  onSearchChange,
  disabled,
  returnFocusRef,
}: Props) {
  const drawerId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const titleId = `${drawerId}-title`

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => {
      searchRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) return
    const el = returnFocusRef?.current
    if (!el) return
    requestAnimationFrame(() => el.focus())
  }, [open, returnFocusRef])

  const onPick = (id: string): void => {
    onSelect(id)
    onClose()
  }

  const onNewClick = (): void => {
    void (async () => {
      try {
        await Promise.resolve(onNew())
        onClose()
      } catch {
        // Parent surfaces errors (e.g. listError).
      }
    })()
  }

  return (
    <div
      id="thoughts-notes-drawer"
      className={`thoughtsDrawerRoot ${open ? 'isOpen' : ''}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="thoughtsDrawerBackdrop"
        aria-label="Close notes"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div
        className="thoughtsDrawerPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="thoughtsDrawerSafeArea">
          <header className="thoughtsDrawerHeader">
            <button
              type="button"
              className="thoughtsDrawerBack"
              onClick={onClose}
              aria-label="Back to note"
            >
              Back
            </button>
            <h2 id={titleId} className="thoughtsDrawerTitle">
              Notes
            </h2>
            <button
              type="button"
              className="thoughtsDrawerNew"
              onClick={onNewClick}
              disabled={disabled}
            >
              New
            </button>
          </header>

          <div className="thoughtsDrawerSearchWrap">
            <label htmlFor={`${drawerId}-search`} className="thoughtsSrOnly">
              Search notes
            </label>
            <input
              id={`${drawerId}-search`}
              ref={searchRef}
              type="search"
              className="thoughtsDrawerSearch"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
          </div>

          <ul className="thoughtsDrawerList" aria-label="Note list">
            {thoughts.length === 0 ? (
              <li className="thoughtsDrawerEmpty">No notes match.</li>
            ) : (
              thoughts.map((t) => {
                const active = t.id === selectedId
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={`thoughtsDrawerItem ${active ? 'isActive' : ''}`}
                      onClick={() => onPick(t.id)}
                      aria-current={active ? 'true' : undefined}
                    >
                      <span className="thoughtsDrawerItemPreview">{previewLine(t.body)}</span>
                      <span className="thoughtsDrawerItemMeta">
                        {new Date(t.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
