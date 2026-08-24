import { BackIcon } from './BackIcon'

type Props = {
  onBack: () => void
  onRemember: () => void
  onThoughts: () => void
  onIdentity: () => void
}

export function ModulesList({
  onBack,
  onRemember,
  onThoughts,
  onIdentity,
}: Props) {
  return (
    <main className="screen modulesScreen" aria-label="Modules">
      <button type="button" className="backButton" onClick={onBack} aria-label="Back">
        <BackIcon />
      </button>

      <button type="button" role="menuitem" className="moduleMenuItem" onClick={onRemember}>
        Remember
      </button>

      <button type="button" role="menuitem" className="moduleMenuItem" onClick={onThoughts}>
        Thoughts
      </button>

      <button type="button" role="menuitem" className="moduleMenuItem" onClick={onIdentity}>
        Identity
      </button>
    </main>
  )
}
