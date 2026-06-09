# ละมุน (Lamoon) — Project Plan

> App name: **ละมุน** (Lamoon). Project/folder/repo name: MiNom (unchanged, internal).

| Field | Value |
|---|---|
| Owner | PM (Claude) |
| Status | Active |
| Date | 2026-05-29 |
| Current phase | **Phase 4 — Beta OPEN** 🟢 (9th brief Dev fold: real WHO LMS Growth chart + the long-pending #12 two-caregiver smoke check; ~3 days) |
| Current baton | **Developer + QA (Claude Code)** — see `HANDOFF_dev_15.md` |

---

## 1. How we work

**Single workstream.** One baton at a time. PM → Designer → PM → Dev → PM. Two tracks never run in parallel; this is by CPO design to keep handoffs simple.

**Journal is the single source of truth.** `JOURNAL.md` records every decision, completion, and handoff. Roles read it before acting; roles write to it when their stage ends.

**Handoff protocol.**
1. The owner of the current baton finishes their work.
2. They write a journal entry: `## YYYY-MM-DD — [Role] — Topic`, ending with a `Handoff →` line that names the next owner, the deliverables expected, and any open questions.
3. They flag CPO (Nattapon), who routes the handoff to the next role.
4. Substantive briefs go into separate files (`HANDOFF_*.md`); the journal entry links to them.

**CPO involvement.** Arm's length by design. CPO routes batons and answers blocking open questions. The team makes decisions; CPO can override but isn't asked to micro-manage.

---

## 2. Roles

| Role | Responsibility | First-pass deliverable |
|---|---|---|
| CPO (Nattapon) | Direction, routing, escalations | Answers to open questions when asked |
| PM (Claude) | PRD, planning, briefs, acceptance | PRD v0.2, PLAN, Designer brief |
| Designer (Claude Design) | IA, wireframes, visual direction, design system, dev handoff specs | See `HANDOFF_designer_01.md` |
| Developer + QA (Claude Code) | Stack choice, scaffolding, implementation, tests, deploy | See `HANDOFF_dev_01.md` (TBD after design) |

---

## 3. Phases

### Phase 0 — Discovery & PRD ✅
- Researched Baby Daybook
- Wrote PRD v0.1 → reframed to v0.2 (baby-centric, multi-caregiver) → reframed to v0.3 (Thai-first)
- Set up journal + project plan

### Phase 1 — Design ✅
**Closed.** Designer shipped the Phase 1 package (IA, lo-fi all 8 screens, hi-fi Home + 3 quick-logs in light+dark, component stub, motion/states spec). PM accepted 2026-05-31.

### Phase 2 — Walking Skeleton 🟡 (code-complete, pending live verification)
**Owner:** Developer
**Goal:** Smallest possible end-to-end slice that proves the architecture.
**Status:** Code shipped; deployed to `https://minom-production.up.railway.app` in **demo mode** (localStorage + BroadcastChannel, no backend). All UX + sync behaviors clickable cross-tab. 15/15 headless tests passing.
**Outstanding to fully close:** provision Supabase project, run `web/supabase/migrations/0001_init.sql`, set `NEXT_PUBLIC_SUPABASE_*` env vars in Railway → enables the literal two-device + RLS isolation tests. ~30 min, blocked on CPO provisioning.
**Stack chosen:** Next.js 15 (App Router) + TypeScript + Supabase (Auth + Postgres + Realtime + RLS). Singapore region.

### Phase 2.5 — Localization rework + Rebrand ✅
**Closed 2026-06-01.** Designer shipped: Anuphan typography pick, full Thai microcopy (`web/locales/th.json`, intent-driven not translated), hi-fi Home/Eat/Sleep/Diaper in Thai (light+dark, verified 360px), brand identity (ละมุน wordmark + ล icon + voice filter), tagline "ดูแลลูกอย่างละมุนละไม", PDPA 4-line consent. Dev's 5 Phase-2 clarifications resolved. PM accepted, locked tagline and back-dating decision.

### Phase 3 — i18n wiring + Complete MVP ✅
**Closed 2026-06-02.** Dev shipped: i18n + ละมุน rebrand, all three verbs in Thai with back-dating, Timeline history, Growth (WHO chart with placeholder bands), Caregivers, Settings, PDPA consent, accessibility pass. Real Supabase backend live; 8/8 verification including 0.6s cross-device realtime and RLS isolation across two real accounts. Closes Phase 2's two-device + RLS carry-over.

### Phase 3.5 — Pre-beta enablement ✅
**Closed 2026-06-03.** Engineering + provisioning + dry-run all green. Both on-ramps live-verified: self-serve signup (confirmations OFF per PRD) + invited caregiver (SMTP-independent server admin-create, realtime ~1.2s). New Thai keys await Designer voice review (pull-based).
**Reality check logged:** the "proper signup with confirmations ON" path is gated on owning a verified sender domain (Resend's onboarding domain failed the Auth SMTP dry-run). `lamoon.app` registration becomes load-bearing for pre-public-launch.

### Phase 4 — Beta & Launch 🟢 (PM prep done; opens on dry-run pass)
**PM prep complete** 2026-06-02 — `BETA_PLAN.md` (cohort, gates, success criteria) + `BETA_COMMS.md` (all Thai templates: recruitment, invite email, LINE welcome, weekly survey, week-2 & week-6 interview guides, weekly digest, end-of-beta message, beta agreement, operating cadence) ready to send.
**Goal:** Validate PRD §8 metrics with 15–20 Thai households over 4–6 weeks; decide go/no-go for public launch.
**Exit criteria:** D7 ≥40%, D30 ≥25%, invite rate ≥30%, time-to-log <4s, crash-free ≥99%, ≥60% "I'd be sad if this went away."

### Phase 4.0 — Eat v2 + UI parity + invite-link UX ✅
**Closed 2026-06-04.** Shipped: full Eat v2 (3 content-modes นมแม่/นมผง/อาหารแข็ง, capture toggle, smart defaults, named repeat-last, mode-encoded home + timeline, mode-aware concurrency), Sleep + Diaper UI parity (Home hierarchy + textareas + Diaper [แก้ไข] toast), persistent invite-link UX (share/copy/QR/revoke/resend) fixing the link-disappears-on-exit bug, global verb swap (กิน/นอน/ถ่าย/โต). Auto-email stays off (link-only delivery) until CPO domain-verifies Resend — non-blocking.

### Phase 4 — Beta & Launch 🟢 (OPEN 2026-06-04)
**Owner:** CPO drives launch + cohort relationships; PM supports + monitors + reads metrics + drafts comms.
**Plans:** `BETA_PLAN.md` (locked), `BETA_COMMS.md` (Thai templates), `BETA_RECRUITMENT.md` (CPO's tracker).
**Goal:** Validate PRD §8 metrics with 15–20 Thai households over 4–6 weeks on Eat v2; decide go/no-go for public web launch.
**Cadence:** daily PostHog skim + 1:1 LINE replies + in-app feedback triage; Monday team sync; Week-2 + Week-6 interviews per household.
**Exit criteria:** D7 ≥40%, D30 ≥25%, invite rate ≥30%, time-to-log <4s, crash-free ≥99%, ≥60% "I'd be sad if this went away."

### Phase 5 — ละมุน on LINE 🔮 (queued — design starts after current Dev baton closes)
**Owner:** PM (design), then Designer, then Dev.
**Backlog:** `LINE_BACKLOG.md` — initial framing, surface options (LIFF / Mini App / Bot / hybrid), 6 open questions for CPO, sequencing notes.
**Driver:** CPO direction (2026-06-02) — Thailand is a LINE-first market; bringing ละมุน into LINE removes the largest barrier to multi-generational adoption (grandmas already live in LINE, don't want to install another app).
**Not happening before:** Phase 3.5 dry-run + Phase 4 web beta launch. The web beta gives us product-loop signal that informs LINE design.
**Effort estimate:** ~6–10 weeks once started (hybrid LIFF + Bot).
**Goal:** TBD until PM writes PRD v0.4. Provisional: LINE-native primary surface with web as fallback; LINE Login for identity; LINE share for family invites.

---

## 4. Open questions tracker

Carried from PRD §9. None of these block design work; some block Phase 2.

| # | Question | Status |
|---|---|---|
| Q1 | Monetization in v1? | ⏳ Open. PM rec: free during validation; revisit at 1k DAU. |
| Q2 | Primary market + units? | ✅ Closed (2026-06-01): **Thailand only, metric.** |
| Q3 | Brand positioning? | ✅ Closed (2026-06-01): "Simple baby tracker for Thai families." Designer to finalize Thai positioning line. |
| Q4 | Data residency? | ✅ Closed (2026-06-01): Singapore (`ap-southeast-1`). |
| Q5 | Auth provider? | ✅ Closed (2026-06-01): Supabase Auth, email + password. Enable email confirmation before public launch. |

PM will resurface these at the bottom of each phase entry until resolved.

---

## 5. Risks & how we'll handle them

| Risk | Trigger | Mitigation |
|---|---|---|
| Thai copy reads as translated | English-first then auto-translate | Designer writes Thai from intent, not from EN. PM/CPO review for "feels Thai-built." |
| Thai font payload slows first paint | Loading full character set | Subset + preload chosen face. Designer specifies in component stub. |
| Layout breaks at 360px under Thai script | Tall ascenders/descenders, no inter-word spaces | Designer re-renders the 4 hi-fi screens at 360px with real Thai copy before Dev wires i18n. |
| Phase 2 staging stays in demo mode | Supabase not provisioned | PM tracks as a separate baton; needs CPO account/secrets to unblock. |
| Multi-caregiver edge cases miss QA | Treated as edge case | Add explicit test cases in QA checklist (Phase 3). |
| Scope creep | Anyone suggests new features mid-build | Any new ask routes through PM → PRD update → conscious defer/in-scope. |
| PDPA gaps surface at launch | Treated as launch-day task | PDPA-required surfaces (consent, deletion, export, notice) are Phase 3 deliverables, not Phase 4. |

---

## 6. File map

```
MiNom/
├── PLAN.md                    ← this file
├── JOURNAL.md                 ← single source of truth
├── PRD_v0.3.md                ← current PRD (Thai-first)
├── PRD_v0.2.md                ← archived
├── PRD_v0.1.md                ← archived
├── HANDOFF_designer_01.md     ← archived (Phase 1)
├── HANDOFF_designer_02.md     ← archived (Phase 2.5)
├── HANDOFF_designer_03.md     ← active brief (pre-beta copy polish)
├── HANDOFF_dev_01.md          ← archived (Phase 2)
├── HANDOFF_dev_02.md          ← archived (Phase 3)
├── HANDOFF_designer_04.md     ← archived (LINE OA assets shipped)
├── HANDOFF_designer_05.md     ← archived (Eat v2 design shipped)
├── HANDOFF_designer_05_propagation.md ← archived (propagation pass)
├── HANDOFF_dev_05.md          ← in-flight (built + prod-verified except 2 cross-caregiver checks)
├── HANDOFF_designer_06.md     ← archived (invite-link UX shipped)
├── HANDOFF_designer_to_pm_invite_archive.md ← archived (Designer return)
├── HANDOFF_dev_06.md          ← archived (Phase 4.0 closed)
├── HANDOFF_designer_07.md     ← archived (Home polish shipped)
├── HANDOFF_designer_to_pm_home_archive.md ← Designer's return doc
├── HANDOFF_dev_07.md          ← archived (Home polish folded)
├── HANDOFF_designer_08.md     ← archived (Home contrast fix shipped)
├── HANDOFF_designer_to_pm_home_contrast_archive.md ← Designer's return doc
├── HANDOFF_dev_08.md          ← in-flight (contrast fold)
├── HANDOFF_designer_09.md     ← archived (Timeline polish shipped)
├── HANDOFF_designer_to_pm_timeline_archive.md ← Designer's return doc
├── HANDOFF_dev_09.md          ← active (in-flight; Item 2b updated 2026-06-05 to drop attribution)
├── HANDOFF_designer_10.md     ← archived (day summary shipped)
├── HANDOFF_designer_10_redrop.md ← archived (re-drop worked second time)
├── HANDOFF_designer_to_pm_summary_archive.md ← Designer's return doc
├── HANDOFF_dev_10.md          ← archived (day summary shipped)
├── HANDOFF_designer_11.md     ← archived (กิน sheet polish shipped)
├── HANDOFF_designer_11b_tokens.md ← archived (sibling tokens shipped)
├── HANDOFF_designer_to_pm_tokens_11b_archive.md ← Designer's return doc
├── HANDOFF_designer_to_pm_eat_polish_archive.md ← Designer's return doc
├── HANDOFF_dev_11.md          ← archived (#11/#11b folded; nav fix retired)
├── HANDOFF_designer_12.md     ← archived (Sleep polish shipped)
├── HANDOFF_designer_to_pm_sleep_polish_archive.md ← Designer's return doc
├── HANDOFF_dev_12.md          ← archived (state machine + first schema change live)
├── HANDOFF_dev_to_pm_12.md    ← Dev's return doc (#12 close-out)
├── HANDOFF_designer_13.md     ← archived (Growth polish shipped)
├── HANDOFF_designer_to_pm_growth_polish_archive.md ← Designer's return doc
├── HANDOFF_dev_13.md          ← archived (Growth + 4th verb token + BE-date fix shipped)
├── HANDOFF_dev_to_pm_13.md    ← Dev's return doc (#13 close-out)
├── HANDOFF_designer_13b_theme_scope.md ← archived (spec-doc fix backported)
├── HANDOFF_designer_14.md     ← archived (time-edit polish shipped)
├── HANDOFF_designer_to_pm_time_edit_archive.md ← Designer's return doc
├── HANDOFF_dev_14.md          ← archived (#14 + #09 gap closure shipped)
├── HANDOFF_dev_to_pm_14.md    ← Dev's return doc (#14 close-out)
├── HANDOFF_designer_15.md     ← active brief (Growth chart real WHO LMS; 9th in series — substantive scope)
├── HANDOFF_dev_03.md          ← archived (Phase 3.5)
├── HANDOFF_dev_to_designer_01.md ← archived (Phase 2 blocker, resolved)
├── CPO_PROVISIONING_CHECKLIST.md ← active brief (6 provisioning steps)
├── PRD_EAT_v2.md              ← Eat surface revision PRD (Phase 4.0; decisions locked)
├── BETA_PLAN.md               ← Phase 4 plan (paused behind Phase 4.0)
├── BETA_COMMS.md              ← Phase 4 messaging (Thai templates)
├── BETA_RECRUITMENT.md        ← Phase 4 recruitment tracker (CPO; can grow informally during 4.0)
├── LINE_BACKLOG.md            ← Phase 5 placeholder (queued; design after web beta launches)
├── PRIVACY_TH.md              ← Thai privacy policy draft (PDPA-aligned, pending legal review)
├── WAY_OF_WORK_dev.md
├── design/                    ← Designer's deliverables
└── web/                       ← Dev's code (Next.js + Supabase, live on Railway against real Supabase)
```

---

## 7. Next baton

**Dev (Claude Code).** Brief is `HANDOFF_dev_05.md` — two parts: (1) merge the Eat v2 propagation patch + the grow-verb mini-addendum into `web/locales/th.json` (Sleep + Diaper inherit the verb swap for free); (2) build Eat v2 against the static spec (`design/MiNom Design - Eat v2.html`) — 3 modes, นมแม่ capture toggle, smart defaults, named repeat-last, mode-encoded home + timeline rows, mode-aware concurrency. Closes with a fresh 7-scenario dry-run + 3 Eat-v2-specific checks on production.

After Dev: beta opens on Eat v2 per `BETA_COMMS.md`.

Parallel-safe for CPO during the wait:
- **Grow `BETA_RECRUITMENT.md` informally** — keep warm-introducing households (don't send actual invites until v2 ships).
