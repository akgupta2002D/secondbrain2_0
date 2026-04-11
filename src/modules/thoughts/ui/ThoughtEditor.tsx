import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Thought, ThoughtSaveState } from '../model/types'
import { createDebouncedCallback } from '../lib/autoSave'
import {
  clearDraftBackup,
  loadDraftBackup,
  saveDraftBackup,
} from '../lib/draftBackup'

const DEBOUNCE_MS = 650

type Props = {
  thought: Thought
  onSave: (body: string) => Promise<void>
  disabled?: boolean
}

export function ThoughtEditor({ thought, onSave, disabled }: Props) {
  const backup = loadDraftBackup(thought.id)
  const initial =
    backup !== null && backup !== thought.body ? backup : thought.body

  const [body, setBody] = useState(initial)
  const [saveState, setSaveState] = useState<ThoughtSaveState>('saved')
  const [lastError, setLastError] = useState<string | null>(null)

  const bodyRef = useRef(body)
  const saveRef = useRef(onSave)
  const debouncedRef = useRef<ReturnType<typeof createDebouncedCallback> | null>(
    null,
  )

  useEffect(() => {
    bodyRef.current = body
  }, [body])

  useEffect(() => {
    saveRef.current = onSave
  }, [onSave])

  const persist = useCallback(async (): Promise<void> => {
    if (disabled) return
    const current = bodyRef.current
    if (current === thought.body) {
      setSaveState('saved')
      return
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSaveState('offline')
      saveDraftBackup(thought.id, current)
      return
    }
    setSaveState('saving')
    setLastError(null)
    try {
      await saveRef.current(current)
      clearDraftBackup(thought.id)
      setSaveState('saved')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setLastError(msg)
      setSaveState('error')
      saveDraftBackup(thought.id, current)
    }
  }, [thought.id, thought.body, disabled])

  useLayoutEffect(() => {
    const d = createDebouncedCallback(() => persist(), DEBOUNCE_MS)
    debouncedRef.current = d
    return () => {
      d.cancel()
    }
  }, [persist])

  const onChange = (next: string): void => {
    setBody(next)
    saveDraftBackup(thought.id, next)
    if (next === thought.body) {
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
    <div className="thoughtsEditor thoughtsEditorSolo">
      <label className="thoughtsSrOnly" htmlFor="thought-body">
        Note
      </label>
      <textarea
        id="thought-body"
        className="thoughtsTextarea"
        value={body}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Start typing…"
        autoComplete="off"
        spellCheck
      />
      <div className="thoughtsEditorFooter" aria-live="polite">
        <span className="thoughtsSaveStatus" data-state={saveState}>
          {statusLabel}
        </span>
        {saveState === 'error' ? (
          <button
            type="button"
            className="thoughtsRetryButton"
            onClick={() => void persist()}
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  )
}
