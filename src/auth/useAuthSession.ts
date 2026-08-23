import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabaseClient'

export type AuthSessionState =
  | { kind: 'booting' }
  | { kind: 'signedOut' }
  | { kind: 'signedIn' }

function claimUnownedRows(): void {
  const client = getSupabaseClient()
  if (!client) return
  void client.rpc('claim_unowned_personal_rows').then(
    () => undefined,
    () => undefined,
  )
}

export function useAuthSession(): AuthSessionState {
  const [state, setState] = useState<AuthSessionState>({ kind: 'booting' })

  useEffect(() => {
    const client = getSupabaseClient()
    if (!client) {
      setState({ kind: 'signedOut' })
      return
    }

    let cancelled = false
    let claimed = false

    const maybeClaim = (): void => {
      if (claimed) return
      claimed = true
      claimUnownedRows()
    }

    void client.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session) {
        setState({ kind: 'signedIn' })
        maybeClaim()
        return
      }
      setState({ kind: 'signedOut' })
    })

    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (session) {
        setState({ kind: 'signedIn' })
        if (event === 'SIGNED_IN') {
          maybeClaim()
        }
        return
      }
      claimed = false
      setState({ kind: 'signedOut' })
    })

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  return state
}
