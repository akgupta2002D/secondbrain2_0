import { useCallback, useEffect, useState } from 'react'
import { IdentityScreen } from '../modules/identity'
import { NotesScreen } from '../modules/notes'
import { RememberScreen } from '../modules/remember'
import { ThoughtsScreen } from '../modules/thoughts'
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

const INITIAL_NAV: ShellNav = { tab: 'home', modulesPane: 'list' }

function readHistoryNav(state: unknown): ShellNav | null {
  if (!state || typeof state !== 'object' || !('sb' in state)) return null
  const sb = (state as { sb?: unknown }).sb
  if (!sb || typeof sb !== 'object') return null
  const tab = 'tab' in sb ? (sb as { tab?: unknown }).tab : null
  const modulesPane =
    'modulesPane' in sb ? (sb as { modulesPane?: unknown }).modulesPane : null
  if (!isAppTab(tab) || !isModulesPane(modulesPane)) return null
  return { tab, modulesPane }
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
  const [notesVisited, setNotesVisited] = useState(false)
  const [rememberVisited, setRememberVisited] = useState(false)
  const [thoughtsVisited, setThoughtsVisited] = useState(false)
  const [identityVisited, setIdentityVisited] = useState(false)

  const applyNav = useCallback((next: ShellNav): void => {
    setTab(next.tab)
    setModulesPane(next.modulesPane)
    if (next.tab === 'notes') setNotesVisited(true)
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
    if (next === 'modules' && tab === 'modules' && modulesPane !== 'list') {
      navigate({ tab: 'modules', modulesPane: 'list' })
      return
    }
    if (next === tab) return
    navigate({ tab: next, modulesPane })
  }

  const goHome = (): void => navigate({ tab: 'home', modulesPane })
  const goModulesList = (): void => navigate({ tab: 'modules', modulesPane: 'list' })
  const openRemember = (): void =>
    navigate({ tab: 'modules', modulesPane: 'remember' })
  const openThoughts = (): void =>
    navigate({ tab: 'modules', modulesPane: 'thoughts' })
  const openIdentity = (): void =>
    navigate({ tab: 'modules', modulesPane: 'identity' })

  return (
    <div className="appShell">
      <div className="appShellPanes">
        <div
          className="appShellPane"
          hidden={tab !== 'home'}
          inert={tab !== 'home' ? true : undefined}
        >
          <HomeScreen
            appVersion={appVersion}
            onHardUpdate={onHardUpdate}
            onSignOut={onSignOut}
          />
        </div>

        <div
          className="appShellPane"
          hidden={tab !== 'notes'}
          inert={tab !== 'notes' ? true : undefined}
        >
          {notesVisited ? <NotesScreen onBack={goHome} /> : null}
        </div>

        <div
          className="appShellPane"
          hidden={tab !== 'modules'}
          inert={tab !== 'modules' ? true : undefined}
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

      <TabBar tab={tab} onSelect={onSelectTab} />

      {showRefreshPrompt ? (
        <UpdatePrompt onRefresh={onRefresh} onDismiss={onDismissRefresh} />
      ) : null}
    </div>
  )
}
