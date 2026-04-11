import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseClient, getSupabaseConfig } from '../../../lib/supabaseClient'
import { createSupabaseThoughtsRepository } from '../data/supabaseThoughtsRepository'
import { filterThoughts } from '../lib/filterThoughts'
import type { Thought } from '../model/types'
import type { ThoughtsRepository } from '../model/thoughtsRepository'
import { ThoughtEditor } from './ThoughtEditor'
import { ThoughtsDrawer } from './ThoughtsDrawer'

type Props = {
  onBack: () => void
}

export function ThoughtsScreen({ onBack }: Props) {
  const configured = getSupabaseConfig() !== null
  const supabase = getSupabaseClient()

  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    let cancelled = false

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  const loadThoughts = useCallback(async (): Promise<void> => {
    if (!repo) return
    setListLoading(true)
    setListError(null)
    try {
      let rows = await repo.list()
      if (rows.length === 0) {
        const created = await repo.create({ body: '' })
        rows = [created]
      }
      setThoughts(rows)
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
    if (!session || !repo) return
    void loadThoughts()
  }, [session, repo, loadThoughts])

  useEffect(() => {
    if (!supabase || !session) return

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
  }, [supabase, session, loadThoughts])

  const selectedThought = useMemo(() => {
    if (!selectedId) return null
    return thoughts.find((t) => t.id === selectedId) ?? null
  }, [thoughts, selectedId])

  const onSendMagicLink = async (): Promise<void> => {
    if (!supabase) return
    const trimmed = email.trim()
    if (!trimmed) {
      setAuthMessage('Enter your email.')
      return
    }
    setAuthBusy(true)
    setAuthMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
      setAuthMessage('Check your email for the sign-in link.')
    } catch (e) {
      setAuthMessage(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setAuthBusy(false)
    }
  }

  const onSignOut = async (): Promise<void> => {
    if (!supabase) return
    setAuthBusy(true)
    try {
      await supabase.auth.signOut()
      setThoughts([])
      setSelectedId(null)
      setDrawerOpen(false)
      setSearchQuery('')
    } finally {
      setAuthBusy(false)
    }
  }

  const onNewThought = async (): Promise<void> => {
    if (!repo) return
    setListError(null)
    try {
      const t = await repo.create({ body: '' })
      setThoughts((prev) => [t, ...prev])
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
      prev.map((t) => (t.id === updated.id ? updated : t)),
    )
  }

  if (!configured || !supabase) {
    return (
      <main className="screen thoughtsScreen" aria-label="Thoughts setup">
        <button type="button" className="backButton" onClick={onBack} aria-label="Back">
          Back
        </button>
        <div className="thoughtsConfigHint">
          <p className="thoughtsConfigTitle">Supabase not configured</p>
          <p className="thoughtsConfigBody">
            Add <code className="thoughtsCode">VITE_SUPABASE_URL</code> and{' '}
            <code className="thoughtsCode">VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>{' '}
            (or <code className="thoughtsCode">VITE_SUPABASE_ANON_KEY</code>) to your environment,
            run the SQL in <code className="thoughtsCode">supabase/migrations/001_thoughts.sql</code>,
            then restart the dev server.
          </p>
        </div>
      </main>
    )
  }

  if (authLoading) {
    return (
      <main className="screen thoughtsScreen" aria-label="Thoughts">
        <button type="button" className="backButton" onClick={onBack} aria-label="Back">
          Back
        </button>
        <p className="thoughtsMuted">Loading…</p>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="screen thoughtsScreen thoughtsAuth" aria-label="Sign in">
        <button type="button" className="backButton" onClick={onBack} aria-label="Back">
          Back
        </button>
        <div className="thoughtsAuthCard">
          <h1 className="thoughtsAuthTitle">Thoughts</h1>
          <p className="thoughtsAuthSubtitle">Email yourself a magic link — no password.</p>
          <label className="thoughtsFieldLabel" htmlFor="thoughts-email">
            Email
          </label>
          <input
            id="thoughts-email"
            className="thoughtsInput"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={authBusy}
            placeholder="you@example.com"
          />
          {authMessage ? (
            <p className="thoughtsAuthMessage" role="status">
              {authMessage}
            </p>
          ) : null}
          <button
            type="button"
            className="thoughtsPrimaryButton"
            onClick={() => void onSendMagicLink()}
            disabled={authBusy}
          >
            {authBusy ? 'Sending…' : 'Send link'}
          </button>
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
            Back
          </button>
        </div>
        <h1 className="thoughtsTitle">Thoughts</h1>
        <button
          type="button"
          className="thoughtsSignOut"
          onClick={() => void onSignOut()}
          disabled={authBusy}
        >
          Sign out
        </button>
      </header>

      {listError ? (
        <p className="thoughtsError" role="alert">
          {listError}
        </p>
      ) : null}

      <div className="thoughtsPad">
        {listLoading && !selectedThought ? (
          <p className="thoughtsMuted thoughtsPadLoading">Loading…</p>
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
