import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { createDebouncedCallback } from '../lib/autoSave'
import { formatNoteDate } from '../lib/formatNoteDate'
import type { Note, NoteSaveState } from '../model/types'

const DEBOUNCE_MS = 650

type Props = {
  note: Note
  onSave: (text: string) => Promise<void>
  onBack: () => void
  onOpenList: () => void
  onDelete: () => void
  listOpen?: boolean
  disabled?: boolean
  menuRef?: RefObject<HTMLButtonElement | null>
}

export type NotePadHandle = {
  flush: () => Promise<void>
}

export const NotePad = forwardRef<NotePadHandle, Props>(function NotePad(
  { note, onSave, onBack, onOpenList, onDelete, listOpen, disabled, menuRef },
  ref,
) {
  const [text, setText] = useState(note.text)
  const [saveState, setSaveState] = useState<NoteSaveState>('saved')
  const [lastError, setLastError] = useState<string | null>(null)

  const textRef = useRef(text)
  const saveRef = useRef(onSave)
  const debouncedRef = useRef<ReturnType<typeof createDebouncedCallback> | null>(
    null,
  )

  useEffect(() => {
    textRef.current = text
  }, [text])

  useEffect(() => {
    saveRef.current = onSave
  }, [onSave])

  const persist = useCallback(async (): Promise<void> => {
    if (disabled) return
    const current = textRef.current
    if (current === note.text) {
      setSaveState('saved')
      return
    }
    if (note.text.trim().length === 0 && current.trim().length === 0) {
      setSaveState('saved')
      return
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSaveState('offline')
      return
    }
    setSaveState('saving')
    setLastError(null)
    try {
      await saveRef.current(current)
      setSaveState('saved')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setLastError(msg)
      setSaveState('error')
    }
  }, [note.text, disabled])

  useLayoutEffect(() => {
    const d = createDebouncedCallback(() => persist(), DEBOUNCE_MS)
    debouncedRef.current = d
    return () => {
      d.cancel()
    }
  }, [persist])

  useImperativeHandle(ref, () => ({
    flush: async () => {
      await debouncedRef.current?.flush()
    },
  }))

  const onChange = (next: string): void => {
    setText(next)
    if (next === note.text) {
      setSaveState('saved')
      debouncedRef.current?.cancel()
      return
    }
    setSaveState('idle')
    debouncedRef.current?.schedule()
  }

  useEffect(() => {
    const onHidden = (): void => {
      if (document.visibilityState === 'hidden') {
        void debouncedRef.current?.flush()
      }
    }
    document.addEventListener('visibilitychange', onHidden)
    const onOnline = (): void => {
      void debouncedRef.current?.flush()
    }
    window.addEventListener('online', onOnline)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  useEffect(() => {
    const onBeforeUnload = (): void => {
      void debouncedRef.current?.flush()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const onBackClick = async (): Promise<void> => {
    await debouncedRef.current?.flush()
    onBack()
  }

  const onDeleteClick = (): void => {
    if (disabled) return
    debouncedRef.current?.cancel()
    onDelete()
  }

  const statusLabel =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'saved'
        ? 'Saved'
        : saveState === 'offline'
          ? 'Offline — will sync when online'
          : saveState === 'error'
            ? lastError ?? 'Error'
            : 'Unsaved'

  return (
    <div className="notesPad">
      <header className="notesHeader">
        <div className="notesHeaderLeft">
          <button
            type="button"
            className="notesIconButton"
            onClick={() => void onBackClick()}
            aria-label="Back"
          >
            <svg className="notesIconGlyph" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M15.5 4.5 7 12l8.5 7.5 1.4-1.6L10.2 12l6.7-5.9z"
              />
            </svg>
          </button>
          <button
            ref={menuRef}
            type="button"
            className="notesIconButton"
            onClick={onOpenList}
            aria-label="Open notes list"
            aria-expanded={listOpen}
            aria-controls="notes-list-drawer"
          >
            <span className="notesMenuIcon" aria-hidden>
              ☰
            </span>
          </button>
        </div>
        <button
          type="button"
          className="notesIconButton notesDeleteIconButton"
          onClick={onDeleteClick}
          disabled={disabled}
          aria-label="Delete note"
        >
          <svg className="notesIconGlyph" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM8 9h2v9H8V9zM6 21h12V8H6v13z"
            />
          </svg>
        </button>
      </header>

      <label className="notesSrOnly" htmlFor="note-text">
        Note
      </label>
      <textarea
        id="note-text"
        className="notesTextarea"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Start typing…"
        autoComplete="off"
        spellCheck
      />
      <div className="notesFooter" aria-live="polite">
        <p className="notesDate">{formatNoteDate(note.date)}</p>
        <span className="notesSaveStatus" data-state={saveState}>
          {statusLabel}
        </span>
        {saveState === 'error' ? (
          <button
            type="button"
            className="notesRetryButton"
            onClick={() => void persist()}
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  )
})
