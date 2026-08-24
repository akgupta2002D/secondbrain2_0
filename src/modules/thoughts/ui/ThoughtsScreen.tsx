import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabaseClient, getSupabaseConfig } from '../../../lib/supabaseClient'
import { BackIcon } from '../../../shell/BackIcon'
import { PadSkeleton } from '../../../shell/PadSkeleton'
import { createSupabaseThoughtsRepository } from '../data/supabaseThoughtsRepository'
import { filterThoughts } from '../lib/filterThoughts'
import {
  readThoughtsListCache,
  writeThoughtsListCache,
} from '../lib/thoughtsListCache'
import type { Thought } from '../model/types'
import type { ThoughtsRepository } from '../model/thoughtsRepository'
import { ThoughtEditor } from './ThoughtEditor'
import { ThoughtsDrawer } from './ThoughtsDrawer'

function commitThoughts(thoughts: Thought[]): Thought[] {
  writeThoughtsListCache(thoughts)
  return thoughts
}

type Props = {
  onBack: () => void
}

export function ThoughtsScreen({ onBack }: Props) {
  const configured = getSupabaseConfig() !== null
  const supabase = getSupabaseClient()

  const cachedThoughts = readThoughtsListCache()
  const [thoughts, setThoughts] = useState<Thought[]>(() => cachedThoughts ?? [])
  const [listLoading, setListLoading] = useState(
    () => cachedThoughts == null || cachedThoughts.length === 0,
  )
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(
    () => cachedThoughts?.[0]?.id ?? null,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const menuRef = useRef<HTMLButtonElement>(null)

  const repo: ThoughtsRepository | null = useMemo(() => {
    if (!supabase) return null
    return createSupabaseThoughtsRepository(supabase)
  }, [supabase])

  const filteredThoughts = useMemo(
    () => filterThoughts(thoughts, searchQuery),
    [thoughts, searchQuery],
  )

  const loadThoughts = useCallback(async (): Promise<void> => {
    if (!repo) return
    const stale = readThoughtsListCache()
    if (stale == null || stale.length === 0) setListLoading(true)
    setListError(null)
    try {
      let rows = await repo.list()
      if (rows.length === 0) {
        const created = await repo.create({ body: '' })
        rows = [created]
      }
      setThoughts(commitThoughts(rows))
      setSelectedId((prev) => {
        if (prev && rows.some((r) => r.id === prev)) return prev
        return rows[0]?.id ?? null
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load thoughts'
      setListError(msg)
    } finally {
      setListLoading(false)
    }
  }, [repo])

  useEffect(() => {
    if (!repo) return
    void loadThoughts()
  }, [repo, loadThoughts])

  useEffect(() => {
    if (!supabase || !repo) return

    const channel = supabase
      .channel('thoughts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'thoughts' },
        () => {
          void loadThoughts()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, repo, loadThoughts])

  const selectedThought = useMemo(() => {
    if (!selectedId) return null
    return thoughts.find((t) => t.id === selectedId) ?? null
  }, [thoughts, selectedId])

  const onNewThought = async (): Promise<void> => {
    if (!repo) return
    setListError(null)
    try {
      const t = await repo.create({ body: '' })
      setThoughts((prev) => commitThoughts([t, ...prev]))
      setSelectedId(t.id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create'
      setListError(msg)
      throw e
    }
  }

  const onSaveBody = async (body: string): Promise<void> => {
    if (!repo || !selectedId) return
    const firstLine = body.trim().split(/\r?\n/)[0]?.slice(0, 200) ?? null
    const title = firstLine && firstLine.length > 0 ? firstLine : null
    const updated = await repo.update(selectedId, { body, title })
    setThoughts((prev) =>
      commitThoughts(prev.map((t) => (t.id === updated.id ? updated : t))),
    )
  }

  if (!configured || !supabase) {
    return (
      <main className="screen thoughtsScreen" aria-label="Thoughts setup">
        <button type="button" className="backButton" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <div className="thoughtsConfigHint">
          <p className="thoughtsConfigTitle">Supabase not configured</p>
          <p className="thoughtsConfigBody">
            Add <code className="thoughtsCode">VITE_SUPABASE_URL</code> and{' '}
            <code className="thoughtsCode">VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>{' '}
            (or <code className="thoughtsCode">VITE_SUPABASE_ANON_KEY</code>) to your environment,
            run the SQL in <code className="thoughtsCode">supabase/migrations</code>
            (including <code className="thoughtsCode">004_restore_auth_rls.sql</code>),
            then restart the dev server.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="screen thoughtsScreen thoughtsMain" aria-label="Thoughts">
      <header className="thoughtsHeader">
        <div className="thoughtsHeaderLeft">
          <button
            ref={menuRef}
            type="button"
            className="thoughtsMenuButton"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="thoughts-notes-drawer"
          >
            <span className="thoughtsMenuIcon" aria-hidden>☰</span>
            <span className="thoughtsMenuLabel">Notes</span>
          </button>
          <button type="button" className="backButton" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
        </div>
        <h1 className="thoughtsTitle">Thoughts</h1>
        <span className="thoughtsHeaderSpacer" aria-hidden />
      </header>

      {listError ? (
        <p className="thoughtsError" role="alert">
          {listError}
        </p>
      ) : null}

      <div className="thoughtsPad">
        {listLoading && !selectedThought ? (
          <PadSkeleton label="Loading thoughts" />
        ) : null}

        {selectedThought ? (
          <ThoughtEditor
            key={selectedThought.id}
            thought={selectedThought}
            onSave={onSaveBody}
            disabled={listLoading}
          />
        ) : null}
      </div>

      <ThoughtsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        thoughts={filteredThoughts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={onNewThought}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        disabled={listLoading}
        returnFocusRef={menuRef}
      />
    </main>
  )
}
