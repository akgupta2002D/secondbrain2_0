import { useState, type FormEvent } from 'react'
import { getSupabaseClient, getSupabaseConfig } from '../../lib/supabaseClient'

function isValidEmail(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

function userSafeError(_error: unknown, fallback: string): string {
  return fallback
}

export function LoginScreen() {
  const configured = getSupabaseConfig() !== null
  const client = getSupabaseClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  if (!configured || !client) {
    return (
      <main className="screen loginScreen" aria-label="Sign in">
        <h1 className="title">Second Brain</h1>
        <div className="loginConfigHint">
          <p className="loginConfigTitle">Supabase not configured</p>
          <p className="loginConfigBody">
            Add <code className="loginCode">VITE_SUPABASE_URL</code> and{' '}
            <code className="loginCode">VITE_SUPABASE_PUBLISHABLE_KEY</code>{' '}
            (or <code className="loginCode">VITE_SUPABASE_ANON_KEY</code>) to your environment,
            run the SQL in <code className="loginCode">supabase/migrations</code>
            (including <code className="loginCode">004_restore_auth_rls.sql</code>),
            then restart the dev server.
          </p>
        </div>
      </main>
    )
  }

  const normalizedEmail = (): string | null => {
    const trimmed = email.trim()
    if (!isValidEmail(trimmed)) return null
    return trimmed
  }

  const onSendLink = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const nextEmail = normalizedEmail()
    if (!nextEmail) {
      setError('Enter a valid email.')
      setInfo(null)
      return
    }
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      const { error: authError } = await client.auth.signInWithOtp({
        email: nextEmail,
        options: { emailRedirectTo: window.location.origin },
      })
      if (authError) {
        setError(userSafeError(authError, 'Could not send email.'))
        return
      }
      setInfo('Check your email for a sign-in link.')
    } catch (e) {
      setError(userSafeError(e, 'Could not send email.'))
    } finally {
      setBusy(false)
    }
  }

  const onSignIn = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const nextEmail = normalizedEmail()
    if (!nextEmail) {
      setError('Enter a valid email.')
      setInfo(null)
      return
    }
    if (password.length === 0) {
      setError('Enter a password.')
      setInfo(null)
      return
    }
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      const { error: authError } = await client.auth.signInWithPassword({
        email: nextEmail,
        password,
      })
      if (authError) {
        setError(userSafeError(authError, 'Could not sign in.'))
      }
    } catch (e) {
      setError(userSafeError(e, 'Could not sign in.'))
    } finally {
      setBusy(false)
    }
  }

  const onCreateAccount = async (): Promise<void> => {
    const nextEmail = normalizedEmail()
    if (!nextEmail) {
      setError('Enter a valid email.')
      setInfo(null)
      return
    }
    if (password.length === 0) {
      setError('Enter a password.')
      setInfo(null)
      return
    }
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      const { data, error: authError } = await client.auth.signUp({
        email: nextEmail,
        password,
      })
      if (authError) {
        setError(userSafeError(authError, 'Could not create account.'))
        return
      }
      if (!data.session) {
        setInfo('Check your email to confirm your account.')
      }
    } catch (e) {
      setError(userSafeError(e, 'Could not create account.'))
    } finally {
      setBusy(false)
    }
  }

  const renderEmailField = (fieldId: string) => (
    <label className="loginLabel" htmlFor={fieldId}>
      Email
      <input
        id={fieldId}
        className="loginInput"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
        required
      />
    </label>
  )

  return (
    <main className="screen loginScreen" aria-label="Sign in">
      <h1 className="title">Second Brain</h1>
      <p className="loginKicker">Sign in once. This device will remember you.</p>

      <form className="loginForm" onSubmit={(e) => void onSendLink(e)}>
        <p className="loginSectionTitle">Email a sign-in link</p>
        {renderEmailField('login-link-email')}
        <button type="submit" className="modulesButton" disabled={busy}>
          Send a link
        </button>
      </form>

      <div className="loginDivider" role="separator" />

      <form className="loginForm" onSubmit={(e) => void onSignIn(e)}>
        <p className="loginSectionTitle">Sign in / create account with email and password</p>
        {renderEmailField('login-password-email')}
        <label className="loginLabel">
          Password
          <input
            className="loginInput"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </label>
        <div className="loginActions">
          <button type="submit" className="modulesButton" disabled={busy}>
            Sign in
          </button>
          <button
            type="button"
            className="loginSecondaryButton"
            onClick={() => void onCreateAccount()}
            disabled={busy}
          >
            Create account
          </button>
        </div>
      </form>

      {error ? (
        <p className="loginError" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="loginInfo" role="status">
          {info}
        </p>
      ) : null}
    </main>
  )
}
