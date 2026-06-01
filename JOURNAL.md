# MiNom — Project Journal

> **Single source of truth.** All decisions, completions, and handoff notes live here.
> Newest entries on top. Format: `## YYYY-MM-DD — [Role] — Topic`.

**Team**
- CPO: Nattapon
- PM: Claude (this thread)
- Designer: Claude Design (separate workstream)
- Developer / QA: Claude Code (separate workstream)

**Workflow**
- Single work stream at a time.
- Every handoff ends with a `Handoff →` line naming the next owner and what they need.
- Decisions are logged with rationale so context survives the handoff.

---

## 2026-06-01 — Dev — Phase 2 deployed to Railway (staging live)

**What happened**
The Phase 2 skeleton is now **live on a public URL** the team can hit:

> **https://minom-production.up.railway.app** — running in **demo mode** (no backend yet): create an account (stored in your own browser), add a baby, log an Eat. Open a **second tab** to see real-time sync; use the **Online/Offline** chip in the header to try the offline queue.

CPO drove the Railway dashboard (I can't touch the Railway account); I fixed the code-side blockers and guided the config. Verified live: HTTP 200, app renders.

**Three deploy blockers hit + fixed (notes for whoever deploys next)**
1. **Repo not visible in Railway** → Railway's GitHub App didn't have access to the new `MiNom` repo. Fixed via *Configure GitHub App* → grant access.
2. **Build failed (no app at root)** → the app lives in `web/`, so Railway's **Root Directory** must be **`/web`**. Without it the builder scans the repo root (just docs) and exits.
3. **Build blocked on security CVEs** → Railway refuses HIGH-severity dependency advisories. `next@14.2.15` carried several (DoS, SSRF, proxy bypass) only patched at `≥15.5.x`. **Bumped Next 14.2.15 → 15.5.18** (kept React 18; App Router SPA needed no code changes; typecheck + build + serve all green). 0 high/critical remain.
4. **502 after build** → app bound to Railway's injected `PORT=8080` (via custom start `next start -p $PORT`) but the public domain was routed to `3000`. Fixed by pointing the domain at **8080**.

**Railway config of record (for Phase 3 / redeploys)**
- Root Directory: `/web` · Custom Start Command: `next start -p $PORT` · Public domain → port **8080** · Region: Southeast Asia (matches my Q4 rec).

**What this does / doesn't change for the exit criteria**
- ✅ There is now a **live staging URL** (was the main gap). The full UX + all section-05 behaviors are clickable in demo mode, cross-tab sync included.
- ⏳ Still pending: the literal **two real devices over the network within 5s** + **RLS data-isolation across two real accounts**. Demo mode is per-browser (localStorage), so it can't prove cross-device or auth isolation. That needs the **real Supabase** wiring — create project, run `web/supabase/migrations/0001_init.sql`, set the two `NEXT_PUBLIC_SUPABASE_*` vars in Railway. Same code path; ~30 min.

**Handoff → PM (Claude)**
- Phase 2 is now **deployed + demo-verifiable live**; share the URL with anyone who wants to click the product.
- The one remaining step to fully close the Phase 2 exit criteria is **provisioning Supabase** (CPO decision/credentials) so I can flip it from demo to real and run the two-device + RLS verification. Until then: *live, but demo-backed.*
- **For Designer (please route):** the 5 design-clarification items in my "Phase 2 complete" entry below still stand (concurrency copy for instant-log Eat, Synced-pill persistence, first-run Home treatment, Eat time-edit affordance, and the Online/Offline QA chip that's currently mine, not in the design) — worth resolving before Phase 3 copies Eat to Sleep/Diaper.
- README updated: deploy section now documents Railway (Root Dir `/web`, start command, port 8080) instead of Vercel.
- CPO: please route this to PM, and the design items to Designer.

---

## 2026-06-01 — Dev — Phase 2 complete: Eat vertical walking skeleton

**What shipped**
The smallest end-to-end slice that proves the architecture, on the **Eat** verb only — built from the Phase 1 design (tokens lifted verbatim; Home + Eat hi-fi matched in light + dark). Code is on `main`.

- **Repo:** https://github.com/nattaponkr/MiNom — app in [`web/`](web/), run/deploy/QA in [`web/README.md`](web/README.md).
- **Screens (exactly the brief, no more):** Sign in/up → Baby setup (name + birthdate only) → Home (all three cards; only Eat live, Sleep/Diaper route to a "coming soon" stub) → Quick-Log Eat (defaults to "now", one-tap save, optional inline Details) → Timeline (today, with who-logged-it attribution).
- **Section-05 behaviors, all implemented:** optimistic write + 5s undo · skeleton cold-load · offline banner + per-row Queued→Synced pills · realtime arrival w/ quiet toast (never steals focus) · concurrency soft-prompt (dismissible sheet) · inline validation (on blur, disabled CTA, icon+text errors) · delete confirm.
- **Gates:** AA tokens kept; tap targets ≥48px (icon buttons bumped); `prefers-reduced-motion` kills motion; zoom not blocked; quick-log is optimistic (no network on the happy path).

**Stack chosen + why**
**Next.js 14 (App Router) + TypeScript + Supabase** (PM rec, taken). One deploy target, mobile-web first, and Supabase bundles the four things this phase must prove — Auth, Postgres, Realtime, and **Row-Level Security** (RLS is what enforces caregiver data isolation). No CSS framework: the design's own token/component CSS is used directly so the build can't drift from the hi-fi.

**Architecture note (my call):** the data layer is one interface with two implementations — real **Supabase** (the architecture proof, incl. RLS + the realtime publication) and a zero-backend **demo** store (localStorage + BroadcastChannel) that activates when no env vars are set. Same UI/sync code both ways. This lets the app run and demo with **zero setup**, and let me QA the behaviors locally without Docker/cloud. Auth is client-side (supabase-js session in localStorage) rather than SSR cookies — simpler for an SPA and identical across modes; SSR cookie hardening noted for later if we add server-protected routes.

**Q4 (data residency) — recommendation:** single region **`ap-southeast-1` (Singapore)** — lowest latency for a Thai-first audience; baby data is health-adjacent so keep it in one region, encrypted at rest (Supabase default) + RLS. Do **not** build multi-region / GDPR region-tagging yet (no EU/US cohort) — revisit when one appears. (Defers the PM's "region tag from day one" rec as YAGNI; flagging so PM/CPO can overrule.)

**Q5 (auth provider) — recommendation:** **Supabase Auth, email + password.** It's bundled with the DB we're already on, integrates with RLS via `auth.uid()`, no extra vendor/cost, and gives us password-reset + OAuth for free later. For production: **enable email confirmation** (off in the skeleton for convenience) and add the password-reset screen in Phase 3 (currently stubbed).

**QA — verified vs pending (honest split)**
- ✅ **Verified now** (automated headless-Chrome run against demo mode, **15/15 passing**, plus `tsc` + prod build green, plus light/dark screenshots checked against the hi-fi): signup→setup→Home→Eat→Timeline; optimistic + 5s undo; offline → **Queued** → reconnect → **flush/Synced** (survives reload while queued); **cross-tab realtime arrival** (B's entry lands in A within ~1s); second-tab session restore; attribution; theme toggle; visual match in both themes.
- ⏳ **Pending cloud provisioning** (I can't self-serve — needs a Supabase project + Vercel, i.e. CPO accounts/secrets; I don't touch `.env`): the literal exit-criteria of **two real devices over the network within 5s** and **RLS data-isolation across two real accounts**, and the email auth flows. These run the *same* UI/sync code the demo exercises; the Supabase impl + RLS policies + realtime publication are written and in the migration, but **not yet exercised against a live DB**. Step-by-step to light this up (create project → run `0001_init.sql` → set 2 env vars → deploy, Root Directory `web`) is in `web/README.md`. ~30–45 min of provisioning.

**Design under-specified (for Designer before Phase 3 copies this to Sleep/Diaper)**
1. Concurrency prompt: the design demo is timer-framed (Sleep). Eat is an instant log, so I adapted the copy ("X logged a feed Ns ago — view theirs / log another"). Please confirm the instant-log variant.
2. "Synced" pill: I flash it ~2.2s after a queued row syncs, then hide. Confirm desired persistence.
3. First-run Home: I used the normal Eat card with a "No feeds yet — tap to log" hint rather than the dashed ghost `EmptyHome`. Confirm which you want.
4. Eat "When": design shows an **Edit** affordance; I defaulted to "now" and deferred time-editing to Phase 3. Confirm.
5. The Online/Offline chip in the Home header is **mine** (a QA/demo affordance, not in the design) — formalize or remove for production.

**Housekeeping**
- Reconciled `JOURNAL.md` into one canonical file (my onboarding/blocked entries + the Designer/PM entries had diverged across threads).
- The CPO's `handoff_drop/` inbox is **git-ignored, not committed** — it held a *duplicate* `JOURNAL.md` that would have created a second source of truth. The unique brief (`HANDOFF_dev_01.md`) was promoted to repo root with the other handoffs. Safe to delete `handoff_drop/` whenever.

**Handoff → PM (Claude)**
- Review against the exit criteria. Everything front-end/sync is verified in demo mode + screenshots; the only gap to "Done" is lighting up cloud Supabase for the literal two-device/RLS test.
- **Decision needed from CPO (via PM):** provision Supabase + Vercel (or authorize me with the keys) so I can finish the live two-device + RLS verification and hand you a staging URL. Until then Phase 2 is **code-complete + locally verified**, not **live-verified**.
- Please also route the 5 design-clarification items above to the Designer so Phase 3 (Sleep/Diaper copy-paste) starts unblocked.
- CPO: please route this to PM.

---

## 2026-05-31 — PM — Phase 1 accepted, routing to Dev

**What happened**
- Reviewed the Designer's Phase 1 package (`MiNom Design — Phase 1.html`). IA reads clearly, the 4 hi-fi screens match the vision, and the new states/motion section closes the "what does this state look like?" gap that was a stage-1 success criterion. **Phase 1 accepted.**
- Wrote `HANDOFF_dev_01.md` — the Phase 2 (Walking Skeleton) brief for Dev.

**Decisions on the Designer's open flags**
1. **"Family" label** — keep it. Warmer, still unambiguous. (Revisit only if beta users are confused.)
2. **Concurrency prompt as a dismissible sheet** — approved as designed. Non-blocking is the right call.

**Phase 2 scope reminder (in the brief)**
- Eat vertical slice only, end-to-end: auth → baby setup → Home → log Eat → Timeline → real-time sync across two devices, offline-safe. Sleep/Diaper/Growth/Caregivers deferred to Phase 3.
- Dev owns Q4 (data residency) and Q5 (auth provider) recommendations this phase.

**Handoff → Dev (Claude Code)**
- Read `PRD_v0.2.md`, this `JOURNAL.md`, `PLAN.md` §3, then `HANDOFF_dev_01.md`.
- Build reference is the design deliverable; lift tokens from `styles.css`, match hi-fi light+dark, implement the states shown in section 05.
- Exit: two devices see each other's Eat entries on the staging URL within 5s; logging works offline. Close with a `## — Dev — Phase 2 complete` entry ending in `Handoff → PM`.
- CPO: please route to Claude Code when ready.

---

## 2026-05-31 — Designer — Phase 1 complete

**What happened**
- Delivered the full Phase 1 design package as a single interactive HTML document. North-star test ("sleep-deprived parent, one thumb, dark room, two seconds") drove every call.

**Deliverables (file paths)**
- `MiNom Design — Phase 1.html` — the deliverable. Five sections, in order:
  1. **IA / sitemap** — 8 screens as tiers; the ~90% hot path (Home → tap verb → Save → done) is visually highlighted and called out as a 2-tap loop.
  2. **Lo-fi wireframes** — all 8 core screens + supporting flows (Sign in/up, Baby setup, Accept invite). Clean grayscale, numbered annotations, thumb-zone overlay on Home.
  3. **Hi-fi mockups** — Home, Eat, Sleep, Diaper, each in **light + dark**. Sleep shown idle→running; Diaper wet→both.
  4. **Visual direction** — "Warm & Soft" mood, both modes (incl. a note on why dark is first-class, not an inversion).
  5. **Component stub** — type scale, light+dark color tokens, spacing, radii/shadow, button + input states, the "last X ago" card, activity row w/ attribution, percentile-chart placeholder.
  6. **States, feedback & motion** — empty/first-run states (Home, Timeline, Growth) + 8 *live* interaction demos (optimistic log + undo, save loop, real-time sync arrival, offline queue, concurrency soft-prompt, delete confirm, inline validation, skeleton loading) + motion spec (durations/easing), feedback escalation catalog, and a microcopy table. Added so a frontend dev has behavior, timing and words — not just layout.
- Supporting source files: `styles.css` (tokens), `app.css`, `wf.css`, `sections.css`, and `*.jsx` components.
- **Tweaks panel** (toolbar): dark mode, icon style (line/filled), Home layout (cards/thumb-trio), Eat details (inline/sheet), wireframe annotations on/off — so PM/CPO can A/B the open layout calls live.

**Decisions made under "own them"**
1. **Iconography** — one soft line set, 1.9px rounded stroke; filled variant available via tweak. Calm, not cute.
2. **Type pairing** — Hanken Grotesk (warm humanist sans) + Spline Sans Mono (tabular) for all times/durations/amounts.
3. **Home layout** — default is **three stacked status cards** where the *whole card* is the tap target (keeps the 2-tap log). A bottom-thumb "big trio" alternative is provided as a tweak.
4. **Eat "Details"** — **inline expander** by default (one screen, no extra navigation), collapsible; a separate-sheet variant is provided as a tweak.
5. **Empty states / microcopy** — gentle, plain-spoken ("Tap start when she drifts off", "Anything to remember…"). No baby-talk.
6. **Color system** — four verb hues share one lightness/chroma, hue-only variation; color is always paired with icon + label (AA, color-not-sole-indicator).

**PRD notes for PM (no silent overrides)**
- **"Family" vs "Caregivers" label** — used "Family" in the bottom nav for warmth; screen still does everything §5a/#7 specifies. Flagging as a copy proposal, not a model change.
- **Soft concurrency prompt** (§5a) — designed as a non-blocking, dismissible sheet rather than its own screen.
- No contradictions to PRD v0.2 otherwise. Q2 (units) handled via a unit-toggle in Settings + metric-default inputs; Q3 positioning carried through the visual tone.

**Handoff → PM (Claude)** — review hi-fi + component stub; confirm the two flags; route to Dev for the Walking Skeleton.

> _Note (Dev, on reconcile): the two entries above were completed in the Designer/PM threads and dropped into the shared `JOURNAL.md` after my "blocked" entry below — their arrival is exactly what unblocked Phase 2._

---

## 2026-05-31 — Dev — Phase 2 baton received, but blocked: design files missing → query to Designer

**What happened**
- CPO handed me the Phase 2 (Walking Skeleton) baton: build the **Eat vertical only**, end-to-end, proving auth + storage + real-time sync + offline on one verb. Specific screens, gates, and Done criteria all noted.
- The brief instructs me to **lift tokens verbatim from `styles.css`** and **match the hi-fi in `MiNom Design — Phase 1.html`**, implementing the **section 05** behaviors. I went to read those files to start — **they don't exist** in `MiNom/` (searched the whole Desktop + Downloads). `HANDOFF_dev_01.md` (the "full detail" brief) is also missing.
- There is also **no `Designer — Phase 1 complete` entry** in this journal. So the design baton was never formally closed into the shared folder; the deliverables appear to still live in the Designer's thread.

**Decision (per my way-of-work): flag, don't invent.**
- Half the Phase 2 Done criteria are visual ("visuals match the hi-fi") and the interaction spec lives in section 05. Building with fabricated tokens/components would diverge from what the Designer shipped and force a Phase 2 redo. So I'm not writing code against an invented design.
- CPO directive: work as one team — send the Designer a question rather than guessing. Done: wrote `HANDOFF_dev_to_designer_01.md` (a precise, routable request).

**What I'm asking the Designer for** (full detail in the query file)
1. Drop the design source into `MiNom/design/`: the Phase 1 HTML, `styles.css`/inline tokens, and referenced assets. Raw source — no re-export needed.
2. Confirm the file contains: light+dark color tokens, type/spacing/radius scales, Home + Eat hi-fi (both themes), and the seven section-05 behaviors.
3. Three quick clarifications (nav label "Family", attribution avatar-vs-initials, skeleton row shape) — non-blocking.

**Also needed (secondary, from PM):** `HANDOFF_dev_01.md`. I have the core of it from the CPO's message, so this isn't the hard blocker — the design files are.

**Status:** Phase 2 is **open but blocked on the design drop.** As soon as the files land and the checklist is confirmed, I start building immediately — stack will be Next.js + Supabase per PM rec (I'll record final Q4/Q5 data-residency + auth-provider recommendations in the journal when I begin the build).

**Files produced**
- `HANDOFF_dev_to_designer_01.md`

**Handoff → Designer (Claude Design).** Please route `HANDOFF_dev_to_designer_01.md` to the Designer's thread. I'll pick the baton back up the moment the design files are in `MiNom/design/`.

---

## 2026-05-31 — Dev — Onboarded; wrote my way-of-work guideline

**What happened**
- CPO brought me (Claude Code) onto MiNom as Developer + QA and shared the PM's way-of-work guideline. Asked me to derive my own version and save it in the project.
- Read `JOURNAL.md`, `PLAN.md`, `HANDOFF_designer_01.md` to learn the conventions (single workstream, journal-as-truth, `Handoff →` protocol, CPO at arm's length).
- Wrote `WAY_OF_WORK_dev.md` — my operating guideline: ownership/escalation rules, journal discipline, handoff protocol, definition-of-done, QA discipline (I wear both hats), and engineering principles for this app.

**Status**
- I am **not** taking a baton. The current workstream is still Phase 1 — Design (owner: Designer). I'm only onboarded and standing by.
- When the design baton eventually routes through PM to Dev, I'll pick up Phase 2 (Walking Skeleton) per `PLAN.md` §3.

**Files produced**
- `WAY_OF_WORK_dev.md`

**Handoff → none (no baton in hand).** Design phase continues. I'll wait for `Handoff → Dev`.

---

## 2026-05-29 — PM — Project kickoff: plan + first handoff to Designer

**What happened**
- CPO asked to organize the project. Wrote `PLAN.md` (workflow, roles, phases, risks, open-Q tracker) and `HANDOFF_designer_01.md` (the first baton brief).
- Phase 1 (Design) is now open. PM phase 0 (Discovery + PRD) is closed.

**Workflow we agreed on (codified in PLAN.md §1)**
- Single workstream. One baton at a time. Order: PM → Designer → PM → Dev → PM.
- Journal is the single source of truth. Every stage closes with a journal entry ending in a `Handoff →` line.
- Substantive briefs live as separate `HANDOFF_*.md` files; journal entries link to them.
- CPO routes batons, answers blockers, otherwise stays at arm's length.

**Phase plan (PLAN.md §3)**
- Phase 0 — PRD ✅
- Phase 1 — Design 🟢 (current; owner: Designer)
- Phase 2 — Walking Skeleton (Dev: smallest end-to-end slice; auth → create baby → Home → log Eat → real-time sync)
- Phase 3 — Complete MVP (Dev: fill out the rest of PRD v0.2)
- Phase 4 — Beta + launch

**Decisions made by PM (flagging for CPO to override if wanted)**
1. Walking Skeleton scope: **only the "Eat" verb gets implemented end-to-end first.** Sleep and Diaper come in Phase 3. Reason: prove the architecture (auth + sync + offline + storage) on one vertical slice before duplicating it three times.
2. Tech stack: leaving the call to Dev in Phase 2; PM recommendation is a managed BaaS (Supabase / Firebase) to ship faster, but Dev gets to pick.
3. Default brand positioning while we wait on CPO: **"The simplest baby tracker."** Calm/modern/not-infantilizing. Designer can run with this; if you want different, say so.
4. Default unit/market posture: **metric default + imperial toggle, EN now, TH-ready.** Designer should design unit-toggleable inputs regardless; choosing the default doesn't block design.

**Open questions still on the board (PLAN.md §4)**
- Q1 Monetization (free in v1?)
- Q2 Market + units default
- Q3 Brand positioning
- Q4 Data residency
- Q5 Auth provider

None block design. Q2 and Q3 should resolve before designer finalizes hi-fi.

**Files produced this turn**
- `PLAN.md` — project roadmap
- `HANDOFF_designer_01.md` — designer brief

**Handoff → Designer (Claude Design)**
- Read PRD v0.2, JOURNAL, PLAN — in that order.
- Then read `HANDOFF_designer_01.md` for deliverables, constraints, and how to close out the phase.
- North-star UX test: "Sleep-deprived parent, one thumb, dark room, two seconds."
- When done: write `## YYYY-MM-DD — Designer — Phase 1 complete` here in JOURNAL, ending with `Handoff → PM`.

CPO: please route this to Claude Design when ready.

---

## 2026-05-29 — PM — v0.2 update: multi-caregiver model expanded

**What happened**
- CPO direction: "Allow multiple people to manage one baby."
- Edited `PRD_v0.2.md` in place. Added a dedicated §5a "Multi-caregiver model" and a new Caregivers screen (#7).

**Key decisions (and why)**
1. **N caregivers per baby, capped at 10.** Two parents + grandma + nanny is realistic; 10 covers it with headroom. Hard cap prevents abuse.
2. **One Owner + N equal Caregivers.** Owner can invite/remove/transfer ownership; otherwise everyone has identical logging permissions. No read-only role in MVP — keep the model flat.
3. **Activity attribution.** Every entry shows who logged it (small/secondary). Solves the "did you already feed her?" problem without nagging.
4. **A user can be on multiple babies.** Required for nannies and grandparents. Baby selector only appears when N > 1.
5. **Soft concurrency warning restored.** I'd cut it in v0.2, but with N caregivers two people starting the same timer becomes likely enough that the prompt is worth keeping. Non-blocking.
6. **Notifications opt-in only.** Default-off. Notification fatigue is the #1 reason parents abandon tracking apps; we don't want to ship the problem in v1.
7. **Account deletion grace period: 30 days.** Owner deletion auto-transfers to longest-tenured caregiver; if none, baby + data deleted after 30 days.

**Data model**
- `baby ⇄ caregiver`: many-to-many via `baby_caregivers (baby_id, user_id, role, joined_at)`.
- `activity` carries `logged_by_user_id`.

**New success metrics added**
- % of babies with ≥2 active caregivers (target 35%).
- Median caregivers per active baby (target ≥2).

**Handoff → Designer (Claude Design)**
- v0.2 is updated; please re-read §5a and §6 specifically.
- New screen to design: **Caregivers** (list + invite + manage + transfer).
- Timeline rows need an actor indicator (avatar or initials). Keep it secondary so it doesn't compete with the activity itself.
- All other handoff notes from the prior entry still stand.

---

## 2026-05-29 — PM — v0.2 PRD: baby-centric simplification

**What happened**
- CPO direction: "Be baby-centric. From the baby's perspective, all food is food — don't split into breast/bottle/etc. Look at other things to minimize."
- Rewrote PRD as `PRD_v0.2.md`. Reframed the product around four verbs from the baby's POV: **Eat, Sleep, Diaper, Grow**.

**Key decisions (and why)**
1. **One "Eat" activity, not four sub-types.** Breast/bottle/pump/solids collapse into a single Eat log. Type/amount/side move to an optional, collapsed "Details" expander. Reason: parent metadata shouldn't gate the core loop.
2. **One "Sleep" activity, not nap-vs-night.** Same logic — the timestamp tells us when it was.
3. **Pumping removed from MVP.** It's a parent-side workflow, not a baby activity. Phase 2.
4. **Growth simplified to weight + height.** Head circumference cut (pediatrician-measured, not home).
5. **Baby setup minimized to name + birthdate.** Sex, birth weight, birth length, photo all optional.
6. **One auth method (email + password).** Google sign-in deferred.
7. **Statistics cut from MVP.** "Last X ago" indicator is the only stat that matters in v1.
8. **Live caregiver banner + concurrent-timer warning cut.** Last-write-wins is enough.
9. **Timeline date picker cut.** Today by default, swipe back for previous days.

**Surface area reduction**
- Screens: 12 → 7
- Required fields in quick-log: ~5 → 1 (just the verb)
- MVP feature lines: ~30 → 10

**Open questions for CPO (carried from v0.1, still need answers)**
- Q1: Confirm "no monetization in MVP"?
- Q2: Target geography / language / unit default?
- Q3: Brand positioning — is "the simplest baby tracker" the pitch?
- Q4: Data residency requirements?
- Q5: Auth provider — build vs managed?

**Handoff → Designer (Claude Design)**
- Read `PRD_v0.2.md` (supersedes v0.1).
- Deliverables requested: (a) IA / sitemap for the 7 screens, (b) wireframes — prioritize **Home/Today** and the three **Quick-Log sheets** (Eat, Sleep, Diaper) since they are 90% of the app, (c) one-handed thumb-zone analysis, (d) dark mode is mandatory, design in both modes from the start.
- North-star UX test: "Can a sleep-deprived parent log an activity in two seconds with one thumb in the dark?"

---

## 2026-05-29 — PM — v0.1 PRD drafted, ready for design

**What happened**
- Researched Baby Daybook (babydaybook.app, premium page, feeding tracker page) to inventory features, IA, and monetization.
- Aligned with CPO on scope: **MVP only, straight clone, web + mobile-friendly web**.
- Wrote `PRD_v0.1.md` covering vision, personas, MVP feature list, user stories, non-functional requirements, success metrics, and out-of-scope items.

**Key decisions (and why)**
1. **MVP scope = 4 trackers + timeline + multi-caregiver sync.** Feeding (breast/bottle/pump/solids), Sleep, Diaper, Growth. These are the "why parents open the app" loops. Everything else (sleep predictions, health log, teeth, milestones, widgets, PDF export, reminders) goes to phase 2+.
2. **Web-first, responsive (mobile web).** Faster to ship than native, lets us validate before investing in iOS/Android. Trade-off: no widgets, no background notifications, no offline-first parity with native — accepted for v1.
3. **Real-time multi-caregiver sync is in MVP, not premium.** Baby Daybook gates this behind premium; we treat it as a wedge feature because new parents tag-team care from day one. Monetization model deferred to phase 2.
4. **One baby profile per account in MVP.** Multi-baby (twins) deferred. Most users have one baby; the data model will allow N from day one but UI surfaces only one.
5. **Manual logging only.** No predictions, no AI, no wearable integrations. Keep the loop tight: tap → log → done in <5 seconds.

**Open questions for CPO**
- Q1: Confirm "no monetization in MVP" — i.e. free during validation phase?
- Q2: Target geography / language for v1? (Affects growth chart standard: WHO vs CDC, and units: metric vs imperial.)
- Q3: Any specific differentiator we should bake into MVP copy / brand, or is "Baby Daybook on the web" the honest pitch?

**Handoff → Designer (Claude Design)**
- Read `PRD_v0.1.md`.
- Deliverables requested: (a) IA / sitemap, (b) wireframes for the 5 core screens listed in PRD §7 (Home/Today, Quick-Log, Activity Detail, Timeline, Growth), (c) a lightweight visual direction (1–2 mood options) suitable for sleep-deprived parents at 3am (dark mode parity required).
- Constraints: mobile-web first, thumb-reachable primary actions, minimum 48×48px tap targets, must work one-handed.
- When done, log a "Designer → PM" entry below with links/screenshots and any PRD changes needed.

---
