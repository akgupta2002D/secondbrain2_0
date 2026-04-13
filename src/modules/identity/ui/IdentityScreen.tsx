import { useMemo, useState } from 'react'
import goalsGraphJson from '../data/goalsGraph.json'
import { parseGoalsGraph } from '../lib/parseGoalsGraph'
import { IdentityGraph } from './IdentityGraph'

type Props = {
  onBack: () => void
}

export function IdentityScreen({ onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const parsed = useMemo(() => parseGoalsGraph(goalsGraphJson), [])
  const selected = useMemo(() => {
    if (!parsed.ok || !selectedId) return null
    return parsed.data.nodes.find((n) => n.id === selectedId) ?? null
  }, [parsed, selectedId])

  if (!parsed.ok) {
    return (
      <main className="screen identityScreen" aria-label="Identity graph error">
        <div className="identityTopBar">
          <button type="button" className="backButton" onClick={onBack} aria-label="Back">
            Back
          </button>
        </div>
        <div className="identityBody">
          <div className="identityShell">
            <div className="identityError">
              <p className="identityErrorTitle">Could not load goals graph</p>
              <p className="identityErrorBody">{parsed.message}</p>
              <p className="identityErrorHint">
                Edit <code className="identityCode">src/modules/identity/data/goalsGraph.json</code>{' '}
                and refresh.
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen identityScreen" aria-label="Identity goals">
      <div className="identityTopBar">
        <button type="button" className="backButton" onClick={onBack} aria-label="Back">
          Back
        </button>
      </div>

      <div className="identityBody">
        <div className="identityShell">
        <h1 className="identityTitle">Identity</h1>
        <p className="identitySubtitle">Tap a goal or the center. Edit nodes in goalsGraph.json.</p>

        <div className="identityGraphWrap">
          <IdentityGraph
            data={parsed.data}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {selected ? (
          <div className="identityDetail" role="region" aria-label="Selected goal">
            <p className="identityDetailLabel">{selected.label}</p>
            {selected.detail ? (
              <p className="identityDetailBody">{selected.detail}</p>
            ) : (
              <p className="identityDetailMuted">No extra detail in JSON for this node.</p>
            )}
          </div>
        ) : null}
        </div>
      </div>
    </main>
  )
}
