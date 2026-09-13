import { BackIcon } from './BackIcon'

type Props = {
  onBack: () => void
  onRemember: () => void
  onThoughts: () => void
  onIdentity: () => void
  onBiography: () => void
}

type ModuleApp = {
  id: string
  label: string
  onOpen: () => void
  icon: 'remember' | 'thoughts' | 'identity' | 'biography'
}

function ModuleAppIcon({ icon }: { icon: ModuleApp['icon'] }) {
  if (icon === 'remember') {
    return (
      <svg className="moduleAppIconSvg" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M4 4h11a2 2 0 0 1 2 2v13l-4-2.2L9 19V6H4V4zm13 2h3v15l-3-1.7V6z"
        />
      </svg>
    )
  }
  if (icon === 'thoughts') {
    return (
      <svg className="moduleAppIconSvg" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M4 4h16v11H8.5L4 19.2V4zm3 4v2h10V8H7zm0 4v2h7v-2H7z"
        />
      </svg>
    )
  }
  if (icon === 'identity') {
    return (
      <svg className="moduleAppIconSvg" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M12 3.5 4 7v5.5c0 4.6 3.2 8.8 8 9.9 4.8-1.1 8-5.3 8-9.9V7l-8-3.5zM12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zm0 1.5c2.1 0 4.2 1 4.8 2.7-.9 1.9-2.7 3.3-4.8 3.8-2.1-.5-3.9-1.9-4.8-3.8.6-1.7 2.7-2.7 4.8-2.7z"
        />
      </svg>
    )
  }
  return (
    <svg className="moduleAppIconSvg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M6 3h9.5A2.5 2.5 0 0 1 18 5.5V21H7.5A1.5 1.5 0 0 1 6 19.5V3zm2 2v14h8V5.5a.5.5 0 0 0-.5-.5H8zm1.5 3h5v2h-5V8zm0 3.5h5V13h-5v-1.5z"
      />
    </svg>
  )
}

export function ModulesList({
  onBack,
  onRemember,
  onThoughts,
  onIdentity,
  onBiography,
}: Props) {
  const apps: ModuleApp[] = [
    { id: 'remember', label: 'Remember', onOpen: onRemember, icon: 'remember' },
    { id: 'thoughts', label: 'Thoughts', onOpen: onThoughts, icon: 'thoughts' },
    { id: 'identity', label: 'Identity', onOpen: onIdentity, icon: 'identity' },
    { id: 'biography', label: 'Biography', onOpen: onBiography, icon: 'biography' },
  ]

  return (
    <main className="screen modulesScreen" aria-label="Modules">
      <button type="button" className="backButton" onClick={onBack} aria-label="Back">
        <BackIcon />
      </button>

      <div className="modulesAppGrid" role="menu" aria-label="Apps">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            role="menuitem"
            className="moduleApp"
            onClick={app.onOpen}
            aria-label={app.label}
          >
            <span className={`moduleAppIcon moduleAppIcon--${app.icon}`} aria-hidden>
              <ModuleAppIcon icon={app.icon} />
            </span>
            <span className="moduleAppLabel">{app.label}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
