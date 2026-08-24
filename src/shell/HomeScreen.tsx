type Props = {
  appVersion: string
  onHardUpdate: () => void
  onSignOut: () => void
}

function SignOutIcon() {
  return (
    <svg className="homeIconGlyph" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M10 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21H10v-2H6.5a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5H10V3zm5.2 4.3 1.4-1.5L22 12l-5.4 6.2-1.4-1.5 3.2-3.7H9v-2h9.4l-3.2-3.7z"
      />
    </svg>
  )
}

function UpdateIcon() {
  return (
    <svg className="homeIconGlyph" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 5V2L7.5 6.5 12 11V8a4 4 0 1 1-3.5 5.9l-1.8.9A6 6 0 1 0 12 6z"
      />
    </svg>
  )
}

export function HomeScreen({ appVersion, onHardUpdate, onSignOut }: Props) {
  return (
    <main className="screen homeScreen" aria-label="Home">
      <div className="homeTopActions">
        <button
          type="button"
          className="homeIconButton"
          onClick={onSignOut}
          aria-label="Sign out"
        >
          <SignOutIcon />
        </button>
        <button
          type="button"
          className="homeIconButton"
          onClick={onHardUpdate}
          aria-label="Update PWA"
        >
          <UpdateIcon />
        </button>
      </div>

      <h1 className="title">Second Brain</h1>

      <span className="bottomUpdateVersion" aria-label={`Version ${appVersion}`}>
        <span className="versionText">{appVersion}</span>
      </span>
    </main>
  )
}
