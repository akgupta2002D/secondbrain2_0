import { useEffect, useId, type RefObject } from 'react'
import { BackIcon } from '../../../shell/BackIcon'
import { formatNoteDate } from '../lib/formatNoteDate'
import type { Note } from '../model/types'

type Props = {
  open: boolean
  onClose: () => void
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  disabled?: boolean
  returnFocusRef?: RefObject<HTMLButtonElement | null>
}

function previewLine(text: string): string {
  const line = text.trim().split(/\r?\n/)[0] ?? ''
  if (line.length === 0) return 'New Note'
  if (line.length <= 72) return line
  return `${line.slice(0, 72)}…`
}

export function NotesDrawer({
  open,
  onClose,
  notes,
  selectedId,
  onSelect,
  disabled,
  returnFocusRef,
}: Props) {
  const drawerId = useId()
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
    if (disabled) return
    onSelect(id)
    onClose()
  }

  return (
    <div
      id="notes-list-drawer"
      className={`notesDrawerRoot ${open ? 'isOpen' : ''}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="notesDrawerBackdrop"
        aria-label="Close notes list"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div
        className="notesDrawerPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notesDrawerSafeArea">
          <header className="notesDrawerHeader">
            <button
              type="button"
              className="notesDrawerBack"
              onClick={onClose}
              aria-label="Back to note"
            >
              <BackIcon />
            </button>
            <h2 id={titleId} className="notesDrawerTitle">
              Notes
            </h2>
            <span className="notesDrawerHeaderSpacer" aria-hidden />
          </header>

          <ul className="notesDrawerList" aria-label="Note list">
            {notes.length === 0 ? (
              <li className="notesDrawerEmpty">No notes yet.</li>
            ) : (
              notes.map((n) => {
                const active = n.id === selectedId
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`notesDrawerItem ${active ? 'isActive' : ''}`}
                      onClick={() => onPick(n.id)}
                      aria-current={active ? 'true' : undefined}
                      disabled={disabled}
                    >
                      <span className="notesDrawerItemPreview">{previewLine(n.text)}</span>
                      <span className="notesDrawerItemMeta">{formatNoteDate(n.date)}</span>
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
