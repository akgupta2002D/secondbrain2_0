type Props = {
  appVersion: string
  onHardUpdate: () => void
  onSignOut: () => void
}

export function HomeScreen({ appVersion, onHardUpdate, onSignOut }: Props) {
  return (
    <main className="screen homeScreen" aria-label="Home">
      <h1 className="title">Second Brain</h1>

      <span className="bottomUpdateVersion" aria-label={`Version ${appVersion}`}>
        <button
          type="button"
          className="updateLinkSmall"
          onClick={onHardUpdate}
          aria-label="Update PWA"
        >
          Update
        </button>
        <span className="versionText">{appVersion}</span>
        <button
          type="button"
          className="updateLinkSmall"
          onClick={onSignOut}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </span>
    </main>
  )
}
