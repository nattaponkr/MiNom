# MiNom — web app

**Phase 2 — Walking Skeleton.** The smallest end-to-end slice that proves the
architecture: **auth + storage + real-time sync + offline**, wired on the
**Eat** verb only. Sleep / Diaper / Growth / Family are Phase 3 (the UI shows
them, but they route to a "coming soon" stub).

Built from the Phase 1 design: tokens are lifted verbatim into
[`styles/`](styles/), and the screens match the Home + Eat hi-fi in light and
dark. Behaviors follow section 05 of the design (optimistic write + 5s undo,
skeleton loading, offline Queued→Synced pills, real-time arrival, concurrency
soft-prompt, inline validation, delete confirm).

## Stack & why

- **Next.js 14 (App Router) + TypeScript + React 18** — mobile-web first, one deploy target (Vercel), no install.
- **Supabase** — Postgres + Auth (email/password) + Realtime + Row-Level Security in one managed service. RLS is what enforces "a caregiver only sees babies they're linked to."
- **No CSS framework** — the design's own tokens/components CSS is used directly, so the build can't drift from the hi-fi.

The data layer is a single interface ([`lib/sync/repo.ts`](lib/sync/repo.ts)) with two implementations, so the entire UI/sync layer is identical in both modes:

| Mode | When | Backed by |
|---|---|---|
| **Demo** | no Supabase env vars | `localStorage` + `BroadcastChannel` (cross-*tab* sync) |
| **Real** | env vars present | Supabase auth + Postgres + Realtime + RLS |

## Quick start (demo mode — zero setup)

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

No backend needed. Create an account (stored only in this browser), add a baby,
log an Eat. **Open a second tab** signed into the same account to watch
real-time arrival and the concurrency prompt. Use the **Online/Offline** chip in
the Home header to exercise the offline outbox without DevTools.

> Demo mode is for design review and UX/QA of the section-05 behaviors. It is
> not real auth or real multi-device. The Supabase path below is the
> architecture proof.

## Real mode (Supabase)

1. **Create a Supabase project** → [supabase.com](https://supabase.com) (region: see Q4 in the journal — recommend Singapore/`ap-southeast-1`).
2. **Run the migration**: open the project's **SQL Editor**, paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), run it. (Creates tables, RLS policies, the auth→profile trigger, and adds `activity` to the realtime publication.)
3. **Auth settings** → Authentication → Providers → Email: enable. For the skeleton you can turn **off** "Confirm email" so sign-up logs in immediately.
4. **Env**: copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co   # BASE HOST ONLY — not the
                                                        # /rest/v1 endpoint (that → "Invalid path")
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...                    # Settings → API Keys → Publishable
                                                        # key (sb_publishable_…), or Legacy anon
   ```
   On Railway these are build-time vars — changing them requires a **fresh rebuild**, not just a restart.
   Email confirmations are ON by default: either turn them off, or pre-confirm test users in
   Authentication → Users (Add user → Auto Confirm), to let sign-up log in immediately.
5. `npm run dev` — now using real Supabase. Sign up on two **devices**, share the baby (Phase 3 adds the invite UI; for now both can sign in to the same account), and confirm Eat entries cross within 5s.

### Deploy to Railway (current staging: https://minom-production.up.railway.app)
- New Project → Deploy from GitHub repo → `nattaponkr/MiNom`. If the repo isn't listed, **Configure GitHub App** and grant access to it.
- **Settings → Root Directory = `/web`** (required — the app isn't at the repo root).
- **Settings → Deploy → Custom Start Command = `next start -p $PORT`** (Railway injects `PORT`, default `8080`).
- **Settings → Networking → Generate Domain**, and set the domain's target **port to `8080`** (must match what the app binds to — see deploy logs `- Local: http://localhost:8080`).
- For real (non-demo) mode, add the two `NEXT_PUBLIC_SUPABASE_*` variables. Without them it runs in demo mode.

> Builds are blocked on HIGH-severity dependency CVEs — keep `next` patched (currently `^15.5.16`).

## QA checklist (maps to Phase 2 exit criteria)

- [ ] **Cross-device sync < 5s** — log Eat on device/tab A, see it on B (real mode; demo mode = two tabs).
- [ ] **Offline-safe** — toggle offline, log Eat → row shows **Queued**; reconnect → flips to **Synced** and persists (survives reload while queued).
- [ ] **Optimistic + undo** — Save feed commits instantly; 5s **UNDO** snackbar reverses it (deletes server-side if it already synced).
- [ ] **Skeleton** on cold load (clear site data first); warm nav uses cache.
- [ ] **Concurrency** — another caregiver logs an Eat within 60s → soft, dismissible sheet (not a block).
- [ ] **Validation** — sign-up/baby-setup validate on blur; CTA disabled until valid; errors are icon+text.
- [ ] **Delete confirm** — trash on a Timeline row asks once.
- [ ] **A11y** — both themes AA; tap targets ≥48px; `prefers-reduced-motion` kills animations; 200% zoom doesn't break.
- [ ] **Data isolation** — a user only sees babies they're a caregiver of (RLS).

## Scripts
`npm run dev` · `npm run build` · `npm run start` · `npm run typecheck`
