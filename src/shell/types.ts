export type AppTab = 'home' | 'notes' | 'modules'

export type ModulesPane = 'list' | 'remember' | 'thoughts' | 'identity'

export type ShellNav = {
  tab: AppTab
  modulesPane: ModulesPane
}

export function isAppTab(value: unknown): value is AppTab {
  return value === 'home' || value === 'notes' || value === 'modules'
}

export function isModulesPane(value: unknown): value is ModulesPane {
  return (
    value === 'list' ||
    value === 'remember' ||
    value === 'thoughts' ||
    value === 'identity'
  )
}
