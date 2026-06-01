# Handoff #02 — PM/Designer → Dev

| Field | Value |
|---|---|
| From | Designer (Claude Design), on behalf of PM |
| To | Developer + QA (Claude Code) |
| Date | 2026-05-31 |
| Routed by | CPO (Nattapon) |
| Stage gate | Phase 2 — Walking Skeleton |

---

## Read first

1. `PRD_v0.2.md` — current spec. Especially §3 (four verbs), §5 (MVP features), §5a (multi-caregiver), §6 (screens), §10 (real-time + offline).
2. `JOURNAL.md` — decision log. The `2026-05-31 — Designer — Phase 1 complete` entry lists every design call + two open copy flags.
3. `PLAN.md` §3 — Phase 2 goal, deliverables, and exit criteria. **This brief expands PLAN, it does not replace it.**
4. **The design deliverable** — `MiNom Design — Phase 1.html` (open in a browser). It is the build reference. Tokens live in `styles.css`; component CSS in `app.css` / `states.css`; behavior is demonstrated live in section **05 · States, feedback & motion**.

## The product in one sentence

The simplest baby tracker — four verbs (**Eat, Sleep, Diaper, Grow**), logged in two taps with one thumb in the dark, shared in real time between caregivers.

## Goal of this phase

The **smallest end-to-end slice that proves the architecture**. Depth over breadth. Prove auth + storage + real-time sync + offline on **one vertical (Eat)** before duplicating it to Sleep/Diaper in Phase 3.

> North-star test, unchanged: *sleep-deprived parent, one thumb, dark room, two seconds.*

---

## Deliverables

### 1. Stack + infra
- Pick the stack (PM recommendation: **Next.js + Supabase** for auth/Postgres/Realtime, or equivalent — your call; justify in the journal).
- Repo, hosting, CI/CD. Deployed to a **staging URL the CPO can hit**.
- Decide the open infra questions you own: auth provider specifics (Q5), data residency posture (Q4, GDPR-ready region tagging from day one per PM rec).

### 2. The Eat vertical slice (end to end)
Build exactly these screens, no more:

| Screen | Design ref | Notes |
|---|---|---|
| Sign in / up | Wireframes §Supporting; states §Validation | Email + password only. Forgot-password can stub to Phase 3. |
| Baby setup | Wireframes §Supporting | Required: **name + birthdate only**. Everything else optional/skippable. |
| Home / Today | Hi-fi §Home (light+dark) | Render all three cards, but only **Eat** is live; Sleep/Diaper cards can route to a "Coming soon" stub. |
| Quick-Log: Eat | Hi-fi §Eat (light+dark) | Defaults to "now"; Save with zero other input. Details expander optional. |
| Timeline | Wireframes §Timeline; states §Sync arrival | Today only is fine for the skeleton. Each row shows who logged it. |

Plus **Accept invite** if it's cheap; otherwise Phase 3.

### 3. Real-time + offline (non-negotiable — this is the whole point)
- An Eat logged on device A appears on device B **within 5s** (PRD §10).
- Writes are **offline-safe**: queue locally, flush on reconnect (see live demo `DemoOffline`). Logging must never block on the network.

### 4. Data model (from PRD §5a)
```
users (id, email, display_name, avatar_color, created_at)
babies (id, name, birthdate, photo_url?, sex?, birth_weight?, birth_length?, owner_id)
baby_caregivers (baby_id, user_id, role['owner'|'caregiver'], joined_at)   -- many-to-many
activity (id, baby_id, type['eat'|'sleep'|'diaper'], started_at, ended_at?,
          details_json, logged_by_user_id, created_at, updated_at)
```
Build the schema to support N caregivers and all four verb types now, even though only Eat is wired this phase. `activity.logged_by_user_id` drives Timeline attribution.

---

## Build from the design — specifics

### Tokens (lift verbatim from `styles.css`)
- **Color**: CSS custom properties, full light + dark sets under `:root` / `[data-theme="dark"]`. Use the tokens, don't re-pick colors. Verb hues: `--eat --sleep --diaper --grow` (+ `-tint` surfaces).
- **Type**: Hanken Grotesk (UI) + Spline Sans Mono (all times/durations/amounts, tabular). Scale tokens `--t-*`.
- **Spacing** `--s1..--s10` (4px base), **radii** `--r-*`, **shadows** `--shadow-*`, **motion** `--ease-* / --dur-*`.

### States you must implement (don't ship only the happy path)
All demonstrated live in section 05:
- **Optimistic write + 5s undo** on Eat log — no spinner on the happy path.
- **Skeleton loading** on cold load (not spinners); warm nav uses cached + optimistic.
- **Offline** banner + per-row Queued→Synced pills.
- **Real-time arrival** — new rows slide in with a quiet toast; never steal focus.
- **Concurrency soft-prompt** — if two start an Eat timer within 60s, show the non-blocking sheet (`DemoConcurrency`). Last-write-wins underneath.
- **Inline validation** — validate on blur, disabled CTA until valid, error is icon+text (not color alone).
- **Destructive confirm** — delete asks once via the confirm sheet.

### Accessibility (gate, not nice-to-have)
- WCAG 2.1 AA contrast in **both** themes (tokens already meet it — keep it).
- Tap targets **≥48×48px** (buttons are 52px, icon buttons 40px → bump to 48 for primary actions).
- Color never the sole state indicator (icon + label everywhere).
- Honor `prefers-reduced-motion` (kill the slide/pop animations, keep instant state).
- Text scales; nothing breaks at 200% zoom / large font settings.

### Performance
- Quick-log action <500ms on mid-range Android over 4G (PRD §7). The optimistic pattern is how you hit this — commit to UI first, sync after.

---

## Open items from Design (please resolve in journal, don't silently pick)
1. **"Family" vs "Caregivers"** nav label — Design used "Family". Confirm or revert.
2. **Concurrency prompt** is a dismissible sheet, not a screen. Confirm that's the intended interaction before wiring.
3. PM open questions still on the board: **Q4 (data residency)** and **Q5 (auth provider)** are yours to recommend this phase.

## Out of scope this phase (resist the urge)
Sleep + Diaper logging end-to-end, Growth, Caregivers management UI, Settings beyond sign-out, swipe-to-past-days, push notifications, multi-baby selector. All Phase 3.

## Exit criteria (from PLAN §3, made concrete)
1. Two people sign into the **staging URL** on different devices, share one baby, and see each other's **Eat** entries in Timeline within **5 seconds**.
2. Logging an Eat works **offline** and syncs on reconnect.
3. The Eat slice visually matches the hi-fi (light + dark) and implements the states above — QA can check each against section 05.
4. No P0 bugs; auth + data isolation verified (a caregiver only sees babies they're linked to).

## When you're done
Write a journal entry `## 2026-XX-XX — Dev — Phase 2 complete`:
- Stack chosen + why; staging URL; repo link.
- Q4/Q5 recommendations.
- Anything the design under-specified (so Design can fill gaps before Phase 3).
- End with a `Handoff → PM` line for acceptance, then PM routes Phase 3.
