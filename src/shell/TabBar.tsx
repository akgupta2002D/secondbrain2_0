import type { AppTab } from './types'

type Props = {
  tab: AppTab
  onSelect: (tab: AppTab) => void
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'engine', label: 'Engine' },
  { id: 'finance', label: 'Finance' },
  { id: 'modules', label: 'Modules' },
]

function TabIcon({ id }: { id: AppTab }) {
  if (id === 'home') {
    return (
      <svg className="appTabIcon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M12 3.2 4 10v10h5.5v-6h5V20H20V10l-8-6.8z"
        />
      </svg>
    )
  }

  if (id === 'engine') {
    return (
      <svg className="appTabIcon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M9 2h2v2h2V2h2v2h1.2c.9 0 1.8.7 1.8 1.6V7h2v2h-2v2h2v2h-2v2h2v2h-2v1.4c0 .9-.8 1.6-1.8 1.6H15v2h-2v-2h-2v2H9v-2H7.8c-1 0-1.8-.7-1.8-1.6V17H4v-2h2v-2H4v-2h2V9H4V7h2V5.6C6 4.7 6.8 4 7.8 4H9V2zm1 6.5v7h1.4V8.5H10zm2.6 2.2v4.8h1.4v-4.8h-1.4zM16 8.5v7h1.4v-7H16z"
        />
      </svg>
    )
  }

  if (id === 'finance') {
    return (
      <svg className="appTabIcon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.8 15.7v1.3h-1.6v-1.3c-1.7-.2-3.1-1.1-3.3-2.7h1.7c.2.8.9 1.3 2 1.3 1.1 0 1.8-.5 1.8-1.3 0-.8-.5-1.1-2.1-1.5-2-.5-3.4-1.2-3.4-3.1 0-1.5 1.1-2.5 2.9-2.8V6h1.6v1.2c1.5.2 2.7 1.1 2.9 2.5h-1.7c-.2-.7-.8-1.2-1.7-1.2-1 0-1.6.5-1.6 1.2 0 .7.5 1.1 2.1 1.5 2.1.5 3.4 1.3 3.4 3.2 0 1.6-1.2 2.6-3.2 2.9z"
        />
      </svg>
    )
  }

  return (
    <svg className="appTabIcon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
      />
    </svg>
  )
}

export function TabBar({ tab, onSelect }: Props) {
  return (
    <nav className="appTabBar" aria-label="Main">
      {TABS.map((item) => {
        const selected = item.id === tab
        return (
          <button
            key={item.id}
            type="button"
            className="appTabButton"
            onClick={() => onSelect(item.id)}
            aria-current={selected ? 'page' : undefined}
            aria-label={item.label}
          >
            <TabIcon id={item.id} />
            <span className="appTabLabel">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
