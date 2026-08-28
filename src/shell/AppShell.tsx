import { useCallback, useEffect, useState } from 'react'
import { EngineScreen } from '../modules/engine'
import { IdentityScreen } from '../modules/identity'
import { NotesScreen } from '../modules/notes'
import { RememberScreen } from '../modules/remember'
import { ThoughtsScreen } from '../modules/thoughts'
import { BiographyScreen } from '../modules/biography'
import { HomeScreen } from './HomeScreen'
import { ModulesList } from './ModulesList'
import { TabBar } from './TabBar'
import { UpdatePrompt } from './UpdatePrompt'
import {
  isAppTab,
  isModulesPane,
  type AppTab,
  type ModulesPane,
  type ShellNav,
} from './types'

type Props = {
  appVersion: string
  onHardUpdate: () => void
  onSignOut: () => void
  showRefreshPrompt: boolean
  onRefresh: () => void
  onDismissRefresh: () => void
}

const INITIAL_NAV: ShellNav = { tab: 'home', modulesPane: 'list', notesOpen: false }

function readHistoryNav(state: unknown): ShellNav | null {
  if (!state || typeof state !== 'object' || !('sb' in state)) return null
  const sb = (state as { sb?: unknown }).sb
  if (!sb || typeof sb !== 'object') return null
  const rawTab = 'tab' in sb ? (sb as { tab?: unknown }).tab : null
  const modulesPane =
    'modulesPane' in sb ? (sb as { modulesPane?: unknown }).modulesPane : null
  if (!isModulesPane(modulesPane)) return null

  const notesOpen =
    rawTab === 'notes' ||
    ('notesOpen' in sb && (sb as { notesOpen?: unknown }).notesOpen === true)

  if (rawTab === 'notes') {
    return { tab: 'home', modulesPane, notesOpen: true }
  }
  if (!isAppTab(rawTab)) return null
  return { tab: rawTab, modulesPane, notesOpen }
}

export function AppShell({
  appVersion,
  onHardUpdate,
  onSignOut,
  showRefreshPrompt,
  onRefresh,
  onDismissRefresh,
}: Props) {
  const [tab, setTab] = useState<AppTab>(INITIAL_NAV.tab)
  const [modulesPane, setModulesPane] = useState<ModulesPane>(INITIAL_NAV.modulesPane)
  const [notesOpen, setNotesOpen] = useState(INITIAL_NAV.notesOpen)
  const [notesVisited, setNotesVisited] = useState(false)
  const [newNoteNonce, setNewNoteNonce] = useState(0)
  const [rememberVisited, setRememberVisited] = useState(false)
  const [thoughtsVisited, setThoughtsVisited] = useState(false)
  const [identityVisited, setIdentityVisited] = useState(false)

  const applyNav = useCallback((next: ShellNav): void => {
    setTab(next.tab)
    setModulesPane(next.modulesPane)
    setNotesOpen(next.notesOpen)
    if (next.notesOpen) setNotesVisited(true)
    if (next.tab === 'modules' && next.modulesPane === 'remember') {
      setRememberVisited(true)
    }
    if (next.tab === 'modules' && next.modulesPane === 'thoughts') {
      setThoughtsVisited(true)
    }
    if (next.tab === 'modules' && next.modulesPane === 'identity') {
      setIdentityVisited(true)
    }
  }, [])

  const navigate = useCallback(
    (next: ShellNav): void => {
      applyNav(next)
      window.history.pushState({ sb: next }, '', window.location.href)
    },
    [applyNav],
  )

  useEffect(() => {
    window.history.replaceState({ sb: INITIAL_NAV }, '', window.location.href)
  }, [])

  useEffect(() => {
    const onPopState = (event: PopStateEvent): void => {
      applyNav(readHistoryNav(event.state) ?? INITIAL_NAV)
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [applyNav])

  const onSelectTab = (next: AppTab): void => {
    if (notesOpen) {
      if (next === 'modules' && tab === 'modules' && modulesPane !== 'list') {
        navigate({ tab: 'modules', modulesPane: 'list', notesOpen: false })
        return
      }
      navigate({ tab: next, modulesPane, notesOpen: false })
      return
    }
    if (next === 'modules' && tab === 'modules' && modulesPane !== 'list') {
      navigate({ tab: 'modules', modulesPane: 'list', notesOpen: false })
      return
    }
    if (next === tab) return
    navigate({ tab: next, modulesPane, notesOpen: false })
  }

  const closeNotes = (): void => navigate({ tab, modulesPane, notesOpen: false })
  const goHome = (): void => navigate({ tab: 'home', modulesPane, notesOpen: false })
  const goModulesList = (): void =>
    navigate({ tab: 'modules', modulesPane: 'list', notesOpen: false })
  const openRemember = (): void =>
    navigate({ tab: 'modules', modulesPane: 'remember', notesOpen: false })
  const openThoughts = (): void =>
    navigate({ tab: 'modules', modulesPane: 'thoughts', notesOpen: false })
  const openIdentity = (): void =>
    navigate({ tab: 'modules', modulesPane: 'identity', notesOpen: false })

  const onNotesFab = (): void => {
    setNotesVisited(true)
    setNewNoteNonce((n) => n + 1)
    if (!notesOpen) {
      navigate({ tab, modulesPane, notesOpen: true })
    }
  }

  return (
    <div className="appShell">
      <div className="appShellPanes">
        <div
          className="appShellPane appShellPane--locked"
          hidden={notesOpen || tab !== 'home'}
          inert={notesOpen || tab !== 'home' ? true : undefined}
        >
          <HomeScreen
            appVersion={appVersion}
            onHardUpdate={onHardUpdate}
            onSignOut={onSignOut}
          />
        </div>

        <div
          className="appShellPane"
          hidden={notesOpen || tab !== 'engine'}
          inert={notesOpen || tab !== 'engine' ? true : undefined}
        >
          <EngineScreen />
        </div>

        <div
          className="appShellPane appShellPane--chat"
          hidden={notesOpen || tab !== 'biography'}
          inert={notesOpen || tab !== 'biography' ? true : undefined}
        >
          <BiographyScreen />
        </div>

        <div
          className="appShellPane"
          hidden={!notesOpen}
          inert={!notesOpen ? true : undefined}
        >
          {notesVisited ? (
            <NotesScreen onBack={closeNotes} newNoteNonce={newNoteNonce} />
          ) : null}
        </div>

        <div
          className="appShellPane"
          hidden={notesOpen || tab !== 'modules'}
          inert={notesOpen || tab !== 'modules' ? true : undefined}
        >
          <div
            className="appShellSubpane"
            hidden={modulesPane !== 'list'}
            inert={modulesPane !== 'list' ? true : undefined}
          >
            <ModulesList
              onBack={goHome}
              onRemember={openRemember}
              onThoughts={openThoughts}
              onIdentity={openIdentity}
            />
          </div>

          {rememberVisited ? (
            <div
              className="appShellSubpane"
              hidden={modulesPane !== 'remember'}
              inert={modulesPane !== 'remember' ? true : undefined}
            >
              <RememberScreen onBack={goModulesList} />
            </div>
          ) : null}

          {thoughtsVisited ? (
            <div
              className="appShellSubpane"
              hidden={modulesPane !== 'thoughts'}
              inert={modulesPane !== 'thoughts' ? true : undefined}
            >
              <ThoughtsScreen onBack={goModulesList} />
            </div>
          ) : null}

          {identityVisited ? (
            <div
              className="appShellSubpane"
              hidden={modulesPane !== 'identity'}
              inert={modulesPane !== 'identity' ? true : undefined}
            >
              <IdentityScreen onBack={goModulesList} />
            </div>
          ) : null}
        </div>
      </div>

      {notesOpen || tab === 'home' ? (
        <button
          type="button"
          className="notesNewFab"
          onClick={onNotesFab}
          aria-label="New note"
        >
          +
        </button>
      ) : null}

      <TabBar tab={tab} onSelect={onSelectTab} />

      {showRefreshPrompt ? (
        <UpdatePrompt onRefresh={onRefresh} onDismiss={onDismissRefresh} />
      ) : null}
    </div>
  )
}
