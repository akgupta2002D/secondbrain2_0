/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string
  readonly VITE_SUPABASE_URL?: string
  /** New Supabase dashboard name for the public client key */
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string
  /** Legacy name; still supported */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

declare const __APP_VERSION__: string

