export type AppTab = 'home' | 'engine' | 'modules'

export type ModulesPane = 'list' | 'remember' | 'thoughts' | 'identity'

export type ShellNav = {
  tab: AppTab
  modulesPane: ModulesPane
  notesOpen: boolean
}

export function isAppTab(value: unknown): value is AppTab {
  return value === 'home' || value === 'engine' || value === 'modules'
}

export function isModulesPane(value: unknown): value is ModulesPane {
  return (
    value === 'list' ||
    value === 'remember' ||
    value === 'thoughts' ||
    value === 'identity'
  )
}
