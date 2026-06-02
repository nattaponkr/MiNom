# ละมุน (Lamoon) — Project Plan

> App name: **ละมุน** (Lamoon). Project/folder/repo name: MiNom (unchanged, internal).

| Field | Value |
|---|---|
| Owner | PM (Claude) |
| Status | Active |
| Date | 2026-05-29 |
| Current phase | **i18n wiring + Phase 3 — Complete MVP (in Thai)** |
| Current baton | **Dev (Claude Code)** — see `HANDOFF_dev_02.md` |

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

### Phase 3 — i18n wiring + Complete MVP 🟢 (current baton)
**Owner:** Developer
**Goal:** Wire i18n + rebrand, then ship the full v0.3 PRD surface in Thai.
**Deliverables (Part 1 — i18n + rebrand):** next-intl wiring with `web/locales/th.json`, `<html lang="th">`, Anuphan load (subset + preload), `Intl.*('th-TH')` for dates/numbers, user-facing rebrand to ละมุน (wordmark/icon/tagline/title/meta).
**Deliverables (Part 2 — Phase 3 MVP):** Sleep + Diaper quick-logs (copy Eat pattern, with back-dating), Growth (WHO weight+height), Caregivers (per §5a), Timeline swipe-left, Settings, PDPA signup consent + full policy page, accessibility pass. Plus Supabase provisioning carry-over to close Phase 2 exit criteria (two-device + RLS).
**Brief:** `HANDOFF_dev_02.md`.
**Exit criteria:** CPO can complete the full new-parent loop on staging in Thai (signup → consent → baby setup → invite caregiver → log all three verbs incl. back-dated → growth entry → see attribution → switch caregiver → see everything). Two-device + RLS verified once Supabase is live.
**Rough effort:** ~3–4 weeks.

### Phase 4 — Beta & Launch 🔜
**Owner:** PM, then CPO
**Goal:** Validate with real parents before public launch.
**Deliverables:** Beta cohort recruited (target: 10–20 households), feedback loop set up, instrumentation for the success metrics in PRD §8, public landing page, launch plan.
**Exit criteria:** D7 retention from beta cohort ≥40%; no P0 bugs open.

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
├── HANDOFF_designer_02.md     ← active brief (Thai rework)
├── HANDOFF_dev_01.md          ← archived (Phase 2)
├── HANDOFF_dev_to_designer_01.md ← archived (Phase 2 blocker, resolved)
├── WAY_OF_WORK_dev.md
├── design/                    ← Designer's deliverables
└── web/                       ← Dev's code (Next.js + Supabase, deployed to Railway)
```

---

## 7. Next baton

**Dev (Claude Code).** Brief is `HANDOFF_dev_02.md`. CPO: please route to Claude Code.

Parallel-safe CPO task:
- **Provision Supabase** (region: `ap-southeast-1` Singapore) and surface the two `NEXT_PUBLIC_SUPABASE_*` env vars to Railway. Steps in `web/README.md`. Unblocks Phase 2's literal two-device + RLS exit criteria and lets Phase 3 verify against a real backend instead of demo mode. ~30 min. Doesn't gate Dev from starting Phase 3 build.
