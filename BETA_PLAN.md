# ละมุน — Phase 4 Beta Plan

| Field | Value |
|---|---|
| Owner | PM (Claude), then CPO |
| Status | Draft — pending CPO review |
| Date | 2026-06-02 |
| Target window | Beta open: ~2 weeks from now (after the Phase 3.x prep below). Beta length: 4–6 weeks (minimum to read D30 retention). |

---

## 1. Why a beta (not a public launch)

Phase 3 closed with a feature-complete app live in Thai, end-to-end verified on a real backend. The unknowns now are not technical — they're behavioural:

- Do real Thai parents actually open the app at 3am? (Time-to-log target: <3s)
- Do families actually invite each other? (Invite rate target: 40%)
- Does anyone use it after a week? (D7 target: 50%) After a month? (D30 target: 35%)
- What surfaces drive churn that we can't see from our seats?

Beta is the only way to answer these honestly before spending on public launch.

## 2. Goals (in priority order)

1. **Validate the success metrics** in PRD §8 — measured, not guessed.
2. **Find the usability blockers** that aren't visible from inside the team.
3. **Get qualitative read** on whether the product "feels ละมุน" to real Thai parents — the brand promise gets tested for real.
4. **Stress-test multi-caregiver** with actual families, not test accounts. This is our wedge; it has to work.
5. **De-risk the public launch** decision with real D7/D30 data.

## 3. Cohort

**Target size:** 10–20 households (households, not individuals — a household is a baby + its caregivers).

**Selection criteria**
- Baby aged 0–12 months (PRD primary persona window).
- Based in Thailand; using Thai as primary language.
- Mix of: first-time vs. experienced parents, solo vs. multi-caregiver setups, Bangkok vs. upcountry, iOS-leaning vs. Android-leaning.
- Comfortable using web/mobile apps; doesn't need to be technical.

**Recruitment channels (CPO leads)**
- CPO's own network (parents-of-newborns).
- Targeted asks in TH parenting Facebook groups (admins permitting).
- LINE OpenChats for new parents.
- One pediatric clinic relationship if available (warm intro to families post-checkup).
- Snowball: each accepted household can refer 1–2 more.

**What we ask of beta users (clearly stated up front)**
- Use the app for a minimum of 4 weeks.
- Fill in a short weekly survey (≤5 min).
- Be willing to do one 20-min interview at week 2 and week 6.
- Report bugs via the in-app feedback affordance.
- Understand this is a pre-launch product and data is treated under the beta privacy notice.

**What they get**
- Free product (and free for life as a beta-cohort "thank you" — TBD with CPO).
- Direct line to the team in a dedicated LINE group.
- First look at new features.
- A real "you helped build this" sticker / thank-you.

## 4. Pre-beta gates (must close before invites go out)

Owned by Dev unless noted. Tracked in the next dev handoff.

### Blockers (no beta without these)
- **Self-serve signup works for non-pre-confirmed users.** Decision: **turn email confirmations OFF in Supabase for the beta window** (PRD says enable before *public* launch; off-for-beta is consistent). Wire a real email sender (Resend recommended) as a separate task before public launch.
- **New-user caregiver invites work end-to-end.** Phase 3 ships with existing-user invites working; new-user invites need the invite-token + email pattern. Many beta families will want to add a grandparent/nanny who doesn't have an account — this can't be a blocker mid-beta.
- **Analytics instrumented** to capture the success metrics: activation (≥3 activities in first 24h), invite rate, D7/D30 retention, median time-to-log, crash-free sessions. Recommended: **PostHog** (PDPA-friendly, EU/SG hosting available, self-host option, generous free tier) over Mixpanel/GA.
- **Privacy policy live** at `/privacy` with the Thai text drafted in `PRIVACY_TH.md`. CPO fills in legal entity name + address.
- **In-app feedback affordance** — a low-friction "ส่งฟีดแบ็ค" button in Settings that opens an email or a simple form, so users can report friction without leaving the app.

### Strongly preferred (would punt to mid-beta only if time-critical)
- **Designer Thai-copy review** of the Dev-added keys + sleep-timer concurrency copy decision.
- **Crash/error tracking** (Sentry or PostHog) wired so we don't miss P0s.

### Not needed for beta start
- Hard-delete edge function (30-day grace UI is enough).
- Exact WHO LMS growth-curve data (caption the chart as "ค่าประมาณการณ์ — รอข้อมูล WHO ฉบับเต็ม").
- EN locale.
- Push notifications.

## 5. Instrumentation (what we measure)

| Event | Captured | Used for |
|---|---|---|
| signup_complete | timestamp, source (organic/invited) | activation funnel |
| consent_accepted | timestamp | PDPA audit |
| baby_created | timestamp | activation funnel |
| caregiver_invited | timestamp, channel | invite rate |
| caregiver_accepted | timestamp, days_to_accept | invite funnel |
| activity_logged | type (eat/sleep/diaper/grow), seconds_to_log (open→save), was_backdated | activation, time-to-log, behavioural |
| activity_edited | type, hours_after_create | rough fidelity signal |
| activity_deleted | type | error / regret signal |
| sync_failed | type | reliability |
| app_opened | timestamp, days_since_signup | retention (DAU, D1/D7/D30) |
| feedback_sent | length | qualitative volume |
| error | error_id, route, anonymized | crash rate |

Identify by **opaque user ID** only (UUID from Supabase auth). No PII in event payloads. PostHog config: EU/SG region, no auto-capture of user inputs, mask sensitive form fields.

## 6. Feedback loops

- **Dedicated LINE OpenChat** with the cohort. Team checks ≥1×/day.
- **Weekly survey** (Google Forms, in Thai, ≤5 minutes): NPS-style "would you be sad if this went away?" + 1 open-ended.
- **Week 2 interview** (20 min, voluntary, LINE call): focus on first-week friction.
- **Week 6 interview** (20 min, voluntary): focus on whether the loop stuck.
- **In-app feedback button** (Settings): zero-friction route to the team's inbox.

## 7. Operating cadence during beta

- **Daily** (PM): scan LINE, triage feedback into Linear-style backlog (or, in our case, journal/backlog markdown).
- **Weekly Monday** (whole team): 30-min sync on metrics dashboard + feedback themes + this-week priorities.
- **Bi-weekly Wednesday** (PM + Designer): UX-friction review based on the week's interviews + observed event funnels.
- **Patch cadence**: ship fixes daily if needed; bigger changes weekly. Beta cohort gets notified in LINE before any change that might be visible.

## 8. Success criteria (the "go public?" decision)

We go public if **all** of these hold at end of beta:

- D7 retention ≥ 40% (PRD target: 50% — accept 40% for the small cohort).
- D30 retention ≥ 25% (PRD target: 35% — same allowance).
- Caregiver invite rate ≥ 30% (PRD target: 40%).
- Median time-to-log < 4 seconds (PRD: <3s; small variance OK).
- Crash-free sessions ≥ 99% (PRD: 99.5%; allow slack on small N).
- Qualitative signal: ≥60% of week-6 survey says "I'd be sad if this went away."
- No P0 bugs open.

If we miss ≥2, we **don't launch publicly yet** — we run a Phase 4.5 (focused fix cycle) and re-run a smaller cohort.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| 3 households sign up; 17 ghost | Personal CPO follow-up week 1; have a backup recruitment list ready. |
| Realtime sync breaks under real-world network conditions (poor 4G upcountry) | Already designed for offline + queue; instrument `sync_failed` events to catch any silent failures. |
| Privacy concerns from a parent | The PDPA policy is comprehensive; brand voice is non-extractive; we have data export + delete. Respond personally to any concern. |
| Email confirmations off creates bot signups in beta | Beta is invite-only, not public — bots aren't a real risk. |
| Grandmother / nanny finds the app confusing | This is exactly what we want to learn — instrument time-to-first-log per caregiver. |
| Negative beta NPS public-leaks before launch | Beta agreement asks for confidentiality; honest feedback isn't a leak risk. |
| Supabase quota hit during beta | 10–20 households is tiny; free tier handles it; monitor weekly. |

## 10. After-beta options (decided at end of week 6)

- **Public launch as-is** (all criteria met).
- **Public launch with caveats** (most criteria met, fix obvious blockers in a 2-week cycle, then launch).
- **Phase 4.5 fix cycle** (multiple misses; another 4-week beta with a fresh cohort).
- **Rethink** (deep misses, e.g. retention <15%; revisit PRD assumptions before continuing).

## 11. Comms plan

- **Beta invite email/LINE message** (PM drafts, CPO sends). Thai. Short. Frames the ask honestly, sets expectations, links to PDPA.
- **Onboarding LINE message** when they accept. Thai. Welcome + how to add caregivers + how to give feedback + LINE group link.
- **Weekly digest** in the LINE group every Monday: "this week we shipped X, next week we're working on Y, here's the metrics so far (anonymized)."
- **Goodbye / launch message** at end of beta. Thanks, what we learned, what's next, lifetime-free confirmation.

## 12. Decisions log

1. **Lifetime-free for beta cohort** → ✅ Locked 2026-06-02.
2. **PostHog as analytics tool** → ✅ Locked 2026-06-02 (EU host).
3. **Email sender for production** → ✅ Locked 2026-06-02: Resend pulled forward into Phase 3.5 (became Supabase's SMTP); email confirmations stay ON.
4. **Beta cohort target — 15–20 households** → ✅ Locked 2026-06-02 (recruit ~25 to land 15–20 active).
5. **Q1 monetization** → ✅ Locked 2026-06-02: free in v1; revisit at 1k DAU. Beta cohort lifetime-free regardless.
