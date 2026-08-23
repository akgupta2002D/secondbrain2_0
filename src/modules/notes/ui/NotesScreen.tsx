import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabaseClient, getSupabaseConfig } from '../../../lib/supabaseClient'
import { createSupabaseNotesRepository } from '../data/supabaseNotesRepository'
import type { NotesRepository } from '../model/notesRepository'
import type { Note } from '../model/types'
import { NotesDrawer } from './NotesDrawer'
import { NotePad, type NotePadHandle } from './NotePad'

type Props = {
  onBack: () => void
}

export function NotesScreen({ onBack }: Props) {
  const configured = getSupabaseConfig() !== null
  const supabase = getSupabaseClient()

  const [notes, setNotes] = useState<Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const menuRef = useRef<HTMLButtonElement>(null)
  const padRef = useRef<NotePadHandle>(null)

  const repo: NotesRepository | null = useMemo(() => {
    if (!supabase) return null
    return createSupabaseNotesRepository(supabase)
  }, [supabase])

  const selectedNote = useMemo(() => {
    if (!selectedId) return null
    return notes.find((n) => n.id === selectedId) ?? null
  }, [notes, selectedId])

  useEffect(() => {
    if (!repo) return

    let cancelled = false
    setBusy(true)
    setLoadError(null)

    void (async () => {
      try {
        const existing = await repo.list()
        const created = await repo.create({ text: '' })
        if (cancelled) return
        setNotes([created, ...existing])
        setSelectedId(created.id)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : 'Could not load notes'
        setLoadError(msg)
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [repo])

  const onSaveText = useCallback(
    async (text: string): Promise<void> => {
      if (!repo || !selectedId) return
      const updated = await repo.update(selectedId, { text })
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    },
    [repo, selectedId],
  )

  const onSelectNote = async (id: string): Promise<void> => {
    await padRef.current?.flush()
    setSelectedId(id)
    setDrawerOpen(false)
  }

  const onNewNote = async (): Promise<void> => {
    if (!repo) return
    setLoadError(null)
    try {
      await padRef.current?.flush()
      const created = await repo.create({ text: '' })
      setNotes((prev) => [created, ...prev])
      setSelectedId(created.id)
      setDrawerOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create note'
      setLoadError(msg)
    }
  }

  if (!configured || !supabase) {
    return (
      <main className="screen notesScreen" aria-label="Notes setup">
        <button type="button" className="backButton" onClick={onBack} aria-label="Back">
          Back
        </button>
        <div className="notesConfigHint">
          <p className="notesConfigTitle">Supabase not configured</p>
          <p className="notesConfigBody">
            Add <code className="notesCode">VITE_SUPABASE_URL</code> and{' '}
            <code className="notesCode">VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>{' '}
            (or <code className="notesCode">VITE_SUPABASE_ANON_KEY</code>) to your environment,
            run the SQL in <code className="notesCode">supabase/migrations</code>
            (including <code className="notesCode">003_remove_auth.sql</code>),
            then restart the dev server.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="screen notesScreen notesMain" aria-label="Notes">
      {loadError ? (
        <p className="notesError" role="alert">
          {loadError}
        </p>
      ) : null}

      {busy && !selectedNote ? (
        <>
          <button type="button" className="backButton" onClick={onBack} aria-label="Back">
            Back
          </button>
          <p className="notesMuted">Loading…</p>
        </>
      ) : null}

      {selectedNote ? (
        <NotePad
          key={selectedNote.id}
          ref={padRef}
          note={selectedNote}
          onSave={onSaveText}
          onBack={onBack}
          onOpenList={() => setDrawerOpen(true)}
          listOpen={drawerOpen}
          disabled={busy}
          menuRef={menuRef}
        />
      ) : null}

      {selectedNote ? (
        <button
          type="button"
          className="notesNewFab"
          onClick={() => void onNewNote()}
          aria-label="New note"
          disabled={busy}
        >
          +
        </button>
      ) : null}

      <NotesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notes={notes}
        selectedId={selectedId}
        onSelect={(id) => void onSelectNote(id)}
        disabled={busy}
        returnFocusRef={menuRef}
      />
    </main>
  )
}
