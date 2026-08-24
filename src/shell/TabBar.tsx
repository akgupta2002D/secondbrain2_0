import type { AppTab } from './types'

type Props = {
  tab: AppTab
  onSelect: (tab: AppTab) => void
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'notes', label: 'Notes' },
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

  if (id === 'notes') {
    return (
      <svg className="appTabIcon" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M6 3h9l5 5v13H6V3zm8.2 1.8V9H19l-4.8-4.2zM8 12h8v1.6H8V12zm0 3.2h8V17H8v-1.8z"
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
