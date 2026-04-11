import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

function resolvePublishableKey(): string | undefined {
  const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()
  const legacyAnon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return publishable || legacyAnon
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = resolvePublishableKey()
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig()
  if (!cfg) return null
  if (!cached) {
    cached = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return cached
}
