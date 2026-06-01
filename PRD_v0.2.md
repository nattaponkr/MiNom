# MiNom — PRD v0.2 (Baby-Centric Simplification)

| Field | Value |
|---|---|
| Owner | PM (Claude) |
| Status | Draft — pending CPO review |
| Date | 2026-05-29 (updated same day) |
| Supersedes | PRD_v0.1.md |
| Change driver | CPO direction: "Be baby-centric." + "Allow multiple people to manage one baby." |

---

## 1. The reframe

v0.1 inherited Baby Daybook's parent-centric model: breast vs bottle vs formula vs pump vs solids, naps vs night sleep, wet vs dirty diapers. That's how parents *talk* about baby care, but it's not how the baby experiences it. From the baby's side there are only four things:

> **Eat. Sleep. Diaper. Grow.**

We design around those four verbs. Anything more granular is parent metadata — useful, but optional and hidden until the parent asks for it.

## 2. Vision

MiNom is the simplest baby tracker that still works. One screen, three big buttons. Designed so a parent can log in two seconds with one thumb, in the dark. Web-first so there's no install. Real-time shared between caregivers.

## 3. The four verbs

### Eat
- One activity. Not "feed type" — just "eat".
- Default log: timestamp = now, duration optional, that's it.
- "Details" expander (collapsed by default) for parents who want to record: amount, what (milk / food), source (breast L/R / bottle / pump / solid), notes. All optional. All in one screen, not separate tabs.
- Last-eat indicator on home: "Ate 1h 12m ago".

### Sleep
- One activity. Not "nap" vs "night sleep" — just "sleep".
- Start/stop timer. Manual time entry as fallback.
- Optional notes only.
- Indicator: "Sleeping — 22m" or "Awake 1h 40m".

### Diaper
- One activity. One tap to open, pick wet / dirty / both, save.
- Wet/dirty distinction kept because it's the baby's state, not parent metadata (hydration, digestion are clinically relevant).
- Indicator: "Last diaper 2h ago".

### Grow
- Separate screen (not on quick-log). Manual entry for weight and height plotted on WHO percentile curves.
- That's it.

## 4. What I cut from v0.1 (and why)

| Removed | Why |
|---|---|
| Feeding sub-tabs (breast / bottle / pump / solids) | Baby just ate. Type is parent metadata → optional "Details" expander. |
| Pumping as a separate activity | Pumping isn't a baby activity at all. Move to phase 2 as a parent-side tool. |
| Left / right breast required field | Optional in "Details". |
| Amount required field (ml/oz) | Optional. Most logs are timer-only anyway. |
| Solids as separate tracker | Folded into Eat (Details → "what": food). |
| Nap vs night sleep distinction | A sleep is a sleep. App can infer day/night from timestamp if we ever need it. |
| Sleep "location" field | Pure parent metadata. Cut. |
| Head circumference in Growth | Measured by pediatrician, not at home. Cut. |
| Sex + birth weight + birth length at setup | Optional, not required. Only name + birthdate to start. |
| Google sign-in | One auth method (email + password) for MVP. |
| Live caregiver banner ("Partner started a feed") | Nice but not core. Push to v0.2. |
| Concurrent-timer conflict warning | Last-write-wins is fine for MVP. |
| 7-day rollup stats on each tracker | Push to v0.2. The "last X ago" indicator is the stat that matters now. |
| Timeline date picker | Just today by default; swipe left for past days. |

What remains is roughly half the surface area of v0.1.

## 5. MVP feature list (final)

1. **Account.** Email + password. Forgot-password flow.
2. **Baby.** Single baby. Required: name + birthdate. Optional: photo, sex, birth weight/length.
3. **Share with caregivers** — see §5a below.
4. **Home.** Three cards (Eat / Sleep / Diaper) showing "last X ago". Tap to log. Plus a small link to Growth, Timeline, Settings.
5. **Quick-log sheets.** One per verb. Optimized for one-handed, minimal fields, big primary button.
6. **Activity detail.** View / edit / delete a single entry.
7. **Timeline.** Today by default; swipe left for past days. Chronological list. Real-time updates from other caregivers within 5 seconds.
8. **Growth.** Add weight and height entries. View on WHO percentile curve. Edit / delete history.
9. **Settings.** Units (kg/cm vs lb/in), sign out, delete account, export my data (JSON download).
10. **Real-time sync.** Updates from any caregiver appear on others' devices within 5 seconds. Offline-safe: writes queue locally and sync when connection returns.

## 5a. Multi-caregiver model (detailed)

A baby is shared, not owned-exclusively. Two parents, a grandparent, a nanny, a night-nurse — any of them can log, see history, and contribute. This is the wedge against Baby Daybook (which gates sharing behind premium) and it has to work cleanly on day one.

**Roles**
- **Owner** — the user who created the baby profile. Can invite, remove, and transfer ownership. Cannot be removed by other caregivers.
- **Caregiver** — anyone invited and accepted. Equal logging permissions (create/edit/delete any activity, view all history, edit baby profile). Cannot manage other caregivers.
- No further role hierarchy in MVP. "Read-only" / "view-only" access deferred to phase 2.

**Capacity**
- Up to **10 caregivers per baby** (including owner). Hard limit to prevent abuse; revisit based on data.
- A user can be a caregiver on **multiple babies** (e.g. a nanny working two families, a grandparent with multiple grandchildren). Baby selector appears in the nav only when N > 1.

**Invite flow**
- Owner taps "Add caregiver" → enters email.
- If email is already a MiNom user: they get an in-app notification + email; one tap to accept.
- If not: they get an email with a signup link tied to the invite token; on signup they're auto-linked to the baby.
- Invites expire after 14 days.
- Owner sees pending invites and can revoke before acceptance.

**Activity attribution**
- Every logged activity records `logged_by_user_id`.
- Timeline shows the actor's name (or avatar) next to each entry — small, secondary, never noisy.
- This makes "Did you already feed her?" obvious without asking.

**Removal & ownership**
- Owner can remove any caregiver at any time → that caregiver immediately loses access; their past log entries remain attributed to them.
- Any caregiver (non-owner) can remove themselves.
- Owner can **transfer ownership** to another caregiver.
- If owner deletes their account: ownership auto-transfers to the longest-tenured remaining caregiver. If none exists, the baby and all its data are deleted after a 30-day grace period.

**Privacy**
- A caregiver sees all data for babies they have access to — nothing less, nothing more.
- A caregiver does **not** see other caregivers' personal info beyond display name + avatar.
- Removing a caregiver does **not** retroactively delete the entries they logged (those stay attributed and visible).

**Concurrency**
- Last-write-wins on edits (already in v0.2).
- If two caregivers start a Sleep or Eat timer for the same baby within 60 seconds of each other, the second one sees a soft prompt: "Someone else just started a sleep timer. Open theirs or start a new one?" — non-blocking, dismissible. (Restored from earlier cut — became important with N caregivers.)

**Notifications (MVP minimum)**
- In-app real-time updates (already in §10).
- Email or push notifications on activity events: **opt-in, off by default**, to avoid notification fatigue. Configured in Settings → Caregivers.
- Push for web (Web Push API) acceptable; native push deferred.

**Data model implication**
- `baby ⇄ caregiver` is a many-to-many through `baby_caregivers (baby_id, user_id, role, joined_at)`.
- `activity (id, baby_id, type, started_at, ended_at, details_json, logged_by_user_id, created_at, updated_at)`.

## 6. Core screens (for design)

1. **Home / Today** — three big cards, three buttons.
2. **Quick-Log: Eat** — primary button (Start/Stop timer or "Save"), optional details expander.
3. **Quick-Log: Sleep** — primary button.
4. **Quick-Log: Diaper** — wet / dirty / both toggle, save.
5. **Timeline** — list of today's activities, each row showing who logged it.
6. **Growth** — chart + entry list.
7. **Caregivers** — list of current caregivers, pending invites, add/remove, transfer ownership.
8. **Settings**, **Sign in/up**, **Baby setup**, **Accept invite** — supporting flows.

Eight screens total (added Caregivers as its own screen given the strengthened multi-caregiver spec).

## 7. Non-functional (unchanged from v0.1, summarized)

- Mobile-first responsive (360–1280+px).
- Dark mode mandatory.
- WCAG 2.1 AA. Tap targets ≥48px.
- Quick-log action <500ms on mid-range Android over 4G.
- Encrypted in transit + at rest. Account deletion + data export available.
- English only in v1; i18n-ready.

## 8. Success metrics (unchanged)

| Metric | Target (90 days) |
|---|---|
| Activation: ≥3 activities logged in first 24h | 60% |
| % of accounts that invite ≥1 caregiver | 40% |
| % of babies with ≥2 active caregivers | 35% |
| Median caregivers per active baby | ≥2 |
| D7 / D30 retention | 50% / 35% |
| Median time-to-log | <3 sec |
| Crash-free sessions | ≥99.5% |

## 9. Open questions (still need CPO answer)

1. **Monetization** — confirm v1 is free.
2. **Geography / units** — primary market? Default metric or imperial?
3. **Brand positioning** — "the simplest baby tracker" as the pitch, or sharper?
4. **Data residency** — any region-locked storage needed?
5. **Auth provider** — build vs managed (Auth0 / Firebase / Supabase)?

## 10. Phase 2+ roadmap (informational)

Restored capabilities: feeding sub-types as required fields if data shows parents want them; pumping tool; sleep predictions; health log; teething; milestones; photos; PDF export; reminders; multi-baby; native apps + widgets; premium tier.
