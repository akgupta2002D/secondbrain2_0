type Props = {
  onRefresh: () => void
  onDismiss: () => void
}

export function UpdatePrompt({ onRefresh, onDismiss }: Props) {
  return (
    <div className="updatePrompt" role="alertdialog" aria-live="polite">
      <div className="updatePromptInner">
        <div className="updatePromptText">
          <p className="updatePromptTitle">Update available</p>
          <p className="updatePromptBody">Tap refresh to get the latest version.</p>
        </div>
        <div className="updatePromptActions">
          <button className="updatePromptButton" onClick={onRefresh}>
            Refresh
          </button>
          <button className="updatePromptDismiss" onClick={onDismiss}>
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
