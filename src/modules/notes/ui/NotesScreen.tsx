import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabaseClient, getSupabaseConfig } from '../../../lib/supabaseClient'
import { BackIcon } from '../../../shell/BackIcon'
import { PadSkeleton } from '../../../shell/PadSkeleton'
import { createSupabaseNotesRepository } from '../data/supabaseNotesRepository'
import {
  readNotesListCache,
  writeNotesListCache,
} from '../lib/notesListCache'
import type { NotesRepository } from '../model/notesRepository'
import type { Note } from '../model/types'
import { NotesDrawer } from './NotesDrawer'
import { NotePad, type NotePadHandle } from './NotePad'

const DRAFT_ID = '__draft__'

function makeDraftNote(): Note {
  return { id: DRAFT_ID, text: '', date: new Date().toISOString() }
}

function hasNoteBody(text: string): boolean {
  return text.trim().length > 0
}

function commitNotes(notes: Note[]): Note[] {
  writeNotesListCache(notes)
  return notes
}

type Props = {
  onBack: () => void
  newNoteNonce?: number
}

export function NotesScreen({ onBack, newNoteNonce = 0 }: Props) {
  const configured = getSupabaseConfig() !== null
  const supabase = getSupabaseClient()

  const [notes, setNotes] = useState<Note[]>(() => readNotesListCache() ?? [])
  const [draft, setDraft] = useState<Note | null>(() => makeDraftNote())
  const [selectedId, setSelectedId] = useState<string | null>(DRAFT_ID)
  const [padEpoch, setPadEpoch] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(() => readNotesListCache() == null)
  const [deleting, setDeleting] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const menuRef = useRef<HTMLButtonElement>(null)
  const padRef = useRef<NotePadHandle>(null)
  const persistedIdRef = useRef<string | null>(null)
  const createInFlightRef = useRef<Promise<Note> | null>(null)

  const repo: NotesRepository | null = useMemo(() => {
    if (!supabase) return null
    return createSupabaseNotesRepository(supabase)
  }, [supabase])

  const selectedNote = useMemo(() => {
    if (selectedId === DRAFT_ID) return draft
    if (!selectedId) return null
    return notes.find((n) => n.id === selectedId) ?? null
  }, [draft, notes, selectedId])

  const startDraft = useCallback((): void => {
    persistedIdRef.current = null
    createInFlightRef.current = null
    const next = makeDraftNote()
    setDraft(next)
    setSelectedId(DRAFT_ID)
    setPadEpoch((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!repo) return

    let cancelled = false
    setListLoading(readNotesListCache() == null)
    setLoadError(null)

    void (async () => {
      try {
        const existing = await repo.list()
        if (cancelled) return
        setNotes(commitNotes(existing))
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : 'Could not load notes'
        setLoadError(msg)
      } finally {
        if (!cancelled) setListLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [repo])

  const onSaveText = useCallback(
    async (text: string): Promise<void> => {
      if (!repo) return

      if (!persistedIdRef.current) {
        if (!hasNoteBody(text)) return

        if (!createInFlightRef.current) {
          createInFlightRef.current = repo.create({ text })
        }
        const created = await createInFlightRef.current
        createInFlightRef.current = null
        const saved =
          text !== created.text
            ? await repo.update(created.id, { text })
            : created
        persistedIdRef.current = saved.id
        setDraft(null)
        setSelectedId(saved.id)
        setNotes((prev) => commitNotes([saved, ...prev.filter((n) => n.id !== saved.id)]))
        return
      }

      const updated = await repo.update(persistedIdRef.current, { text })
      setNotes((prev) =>
        commitNotes(prev.map((n) => (n.id === updated.id ? updated : n))),
      )
    },
    [repo],
  )

  const onSelectNote = async (id: string): Promise<void> => {
    await padRef.current?.flush()
    persistedIdRef.current = id
    createInFlightRef.current = null
    setDraft(null)
    setSelectedId(id)
    setDrawerOpen(false)
  }

  const onNewNote = async (): Promise<void> => {
    setLoadError(null)
    try {
      await padRef.current?.flush()
      startDraft()
      setDrawerOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create note'
      setLoadError(msg)
    }
  }

  const onNewNoteRef = useRef(onNewNote)
  onNewNoteRef.current = onNewNote

  useEffect(() => {
    if (!newNoteNonce) return
    void onNewNoteRef.current()
  }, [newNoteNonce])

  const onDeleteNote = async (): Promise<void> => {
    if (!repo) return
    if (!window.confirm('Delete this note?')) return

    setLoadError(null)
    setDeleting(true)
    try {
      const inFlight = createInFlightRef.current
      let id = persistedIdRef.current
      if (!id && inFlight) {
        const created = await inFlight
        id = created.id
      }
      createInFlightRef.current = null
      if (id) {
        await repo.remove(id)
        setNotes((prev) => commitNotes(prev.filter((n) => n.id !== id)))
      }
      startDraft()
      setDrawerOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not delete note'
      setLoadError(msg)
    } finally {
      setDeleting(false)
    }
  }

  if (!configured || !supabase) {
    return (
      <main className="screen notesScreen" aria-label="Notes setup">
        <button type="button" className="backButton" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <div className="notesConfigHint">
          <p className="notesConfigTitle">Supabase not configured</p>
          <p className="notesConfigBody">
            Add <code className="notesCode">VITE_SUPABASE_URL</code> and{' '}
            <code className="notesCode">VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>{' '}
            (or <code className="notesCode">VITE_SUPABASE_ANON_KEY</code>) to your environment,
            run the SQL in <code className="notesCode">supabase/migrations</code>
            (including <code className="notesCode">004_restore_auth_rls.sql</code>),
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

      {listLoading && !selectedNote ? (
        <>
          <button type="button" className="backButton" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
          <PadSkeleton label="Loading notes" />
        </>
      ) : null}

      {selectedNote ? (
        <NotePad
          key={`${selectedNote.id}-${padEpoch}`}
          ref={padRef}
          note={selectedNote}
          onSave={onSaveText}
          onBack={onBack}
          onOpenList={() => setDrawerOpen(true)}
          onDelete={() => void onDeleteNote()}
          listOpen={drawerOpen}
          disabled={deleting}
          menuRef={menuRef}
        />
      ) : null}

      <NotesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notes={notes}
        selectedId={selectedId}
        onSelect={(id) => void onSelectNote(id)}
        disabled={deleting}
        returnFocusRef={menuRef}
      />
    </main>
  )
}
