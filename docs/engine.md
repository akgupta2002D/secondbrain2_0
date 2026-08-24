# Engine — systems stats (plan)

Status: **placeholder UI only** (`src/modules/engine/`). The PWA does not call a stats API yet.

Engine will show live health of the systems this personal stack runs on. The phone app is a dashboard. A small **microservice** owns collection. The PWA never SSHs into a host and never uses a Supabase service-role key.

## Why a microservice

Host metrics and vendor admin APIs need credentials that must not ship in the Vercel JS bundle. A service on the Ubuntu box (or next to it) can:

- Read local CPU, memory, disk, load, and uptime
- Probe Supabase (project URL, Auth, Postgres) with a server-side key or a locked-down database role
- Later: Vercel deploy health, DNS, backups — same pattern

The PWA only does authenticated `GET` of a small JSON snapshot.

## Intended topology

```
iPhone PWA  --HTTPS GET /stats-->  Engine service (Ubuntu)
                                      ├── host: cpu / mem / disk / load / uptime
                                      ├── supabase: API up, Auth up, DB size / connections
                                      └── later: other boxes we add
```

One service, one read model, many collectors behind it. Do not add a collector per vendor inside the React app.

## Stats to show (v1 sketch)

**Ubuntu server**

- CPU: percent used, load averages (1/5/15)
- Memory: used / total
- Disk: used / total on the data volume
- Uptime
- Optional: whether the Engine process itself is fresh (collector timestamp)

**Supabase**

- Project API reachable (Auth + PostgREST or a cheap SQL `select 1`)
- Database size and connection count if a monitoring role exists
- Auth healthy enough to sign in (no user PII)

Exact fields are the service’s contract. The PWA should render unknown/missing keys as “—” rather than inventing numbers.

## PWA contract (not built)

- Tab **Engine** stays mounted after first visit (same keep-alive as other panes).
- Poll on an interval while the tab is visible; do not poll while hidden.
- Display stale time (“updated 12s ago”). If the service is down, keep last snapshot and show an error — no fake zeros.
- Auth: a personal token or the existing Supabase JWT, checked by the service. No anon public stats.

Env (later, not in this change): something like `VITE_ENGINE_STATS_URL`. Never a machine SSH key.

## Out of scope until a follow-up task

- Implementing the Ubuntu service
- New Postgres tables in this repo
- Edge Functions
- Alerting / push
- Changing Notes, Thoughts, Remember, Identity, or Auth
