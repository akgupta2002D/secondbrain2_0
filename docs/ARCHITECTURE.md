# Architecture — Second Brain `0.0.37`

For what exists **right now** and why (tabs, auth, product rules), start with [`current-state.md`](current-state.md). This file is a structural snapshot. Version is the home-screen string from `vite.config.ts` (`__APP_VERSION__`).

## Infra

```mermaid
flowchart TB
  device[iPhone_PWA]
  vercel[Vercel]
  github[GitHub_main]
  vite[Vite_React_TS]
  sw[Service_Worker]
  supabase[Supabase]
  auth[Auth_email]
  db[(Postgres)]

  device -->|HTTPS| vercel
  github -->|deploy| vercel
  vercel --> vite
  vite --> sw
  device -->|anon_key_plus_JWT| supabase
  supabase --> auth
  supabase --> db
```

- **Client**: Vite + React + TypeScript PWA (`vite-plugin-pwa`), session in `localStorage`.
- **Host**: Vercel from `main`.
- **Backend**: Supabase Auth (magic link, email+password) and Postgres (`notes`, `thoughts`) with RLS. Remember and Identity stay on-device (bundled JSON; Remember scores in `localStorage`).

## How things connect

```mermaid
flowchart LR
  subgraph shell [App_shell]
    app[App.tsx]
    authHook[useAuthSession]
    login[LoginScreen]
  end

  subgraph mods [Modules]
    notes[notes]
    engine[engine]
    biography[biography]
    thoughts[thoughts]
    remember[remember]
    identity[identity]
  end

  client[supabaseClient]
  sb[Supabase]
  json[Bundled_JSON]
  ls[localStorage]

  app --> authHook
  app --> login
  app --> notes
  app --> engine
  app --> biography
  app --> thoughts
  app --> remember
  app --> identity
  authHook --> client
  login --> client
  notes --> client
  thoughts --> client
  client --> sb
  remember --> json
  remember --> ls
  identity --> json
```

- Shell owns view state and auth. Modules do not import each other. Engine has no backend yet (placeholder UI). Biography fetches a public name lookup API.
- Notes and Thoughts talk to Supabase only through `getSupabaseClient()` and their own repository.
- Remember: `definitions306.json`, `spanishexam5.json`, memory scores in `localStorage`.
- Identity: `goalsGraph.json`.

## UX

```mermaid
flowchart LR
  boot[Loading]
  signin[Sign_in]
  home[Home]
  engine[Engine]
  biography[Biography]
  modules[Modules]
  notes[Notes]
  remember[Remember]
  thoughts[Thoughts]
  identity[Identity]

  boot --> signin
  boot --> home
  signin -->|session| home
  home -->|Sign_out| signin
  home -->|Engine| engine
  home -->|Biography| biography
  home -->|Modules| modules
  home -->|plus| notes
  notes -->|Back| lastTab
  modules -->|Back| home
  modules --> remember
  modules --> thoughts
  modules --> identity
  remember -->|Back| modules
  thoughts -->|Back| modules
  identity -->|Back| modules
```

## Modules

### Auth (shell)

Enter: no session. Exit: session present (or Sign out from Home).

```mermaid
stateDiagram-v2
  [*] --> booting
  booting --> signedOut
  booting --> signedIn
  signedOut --> signedIn
  signedIn --> signedOut
```

### Notes

Enter: shell `+`. Exit: Back → previous tab.

```mermaid
stateDiagram-v2
  [*] --> draftPad
  draftPad --> savedPad
  savedPad --> draftPad
  draftPad --> listOpen
  savedPad --> listOpen
  listOpen --> draftPad
  listOpen --> savedPad
  draftPad --> [*]
  savedPad --> [*]
```

### Engine

Enter: Engine tab. Exit: other tab. Placeholder only; no stats API yet. See [`engine.md`](engine.md).

```mermaid
stateDiagram-v2
  [*] --> placeholder
  placeholder --> [*]
```

### Biography

Enter: Biography tab. Exit: other tab. Type a name, send, read summary + quick facts in the thread.

```mermaid
stateDiagram-v2
  [*] --> empty
  empty --> lookingUp
  lookingUp --> reply
  lookingUp --> softError
  reply --> lookingUp
  softError --> lookingUp
  empty --> [*]
  reply --> [*]
  softError --> [*]
```

### Thoughts

Enter: Modules → Thoughts. Exit: Back → Modules.

```mermaid
stateDiagram-v2
  [*] --> editor
  editor --> listOpen
  listOpen --> editor
  editor --> [*]
```

### Remember

Enter: Modules → Remember. Exit: Back → Modules.

```mermaid
stateDiagram-v2
  [*] --> cardFront
  cardFront --> cardBack
  cardBack --> cardFront
  cardFront --> topics
  cardBack --> topics
  topics --> cardFront
  topics --> cardBack
  cardFront --> [*]
  cardBack --> [*]
```

### Identity

Enter: Modules → Identity. Exit: Back → Modules.

```mermaid
stateDiagram-v2
  [*] --> graph
  graph --> nodeSelected
  nodeSelected --> graph
  graph --> [*]
  nodeSelected --> [*]
```
