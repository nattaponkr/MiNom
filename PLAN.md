# MiNom — Project Plan

| Field | Value |
|---|---|
| Owner | PM (Claude) |
| Status | Active |
| Date | 2026-05-29 |
| Current phase | **Phase 1 — Design** |
| Current baton | **Designer (Claude Design)** — see `HANDOFF_designer_01.md` |

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
- Wrote PRD v0.1 → reframed to v0.2 (baby-centric, multi-caregiver)
- Set up journal + project plan

### Phase 1 — Design 🟢 (current)
**Owner:** Designer
**Goal:** Make the PRD visual. Produce enough that a developer could start building tomorrow.
**Deliverables** (full brief in `HANDOFF_designer_01.md`):
1. IA / sitemap of the 8 MVP screens
2. Lo-fi wireframes for all 8 screens
3. Hi-fi mockups for the 4 highest-traffic screens (Home, Eat, Sleep, Diaper)
4. Visual direction: 1–2 mood options, both with light + dark mode
5. Component-level spec sheet for handoff to dev
**Exit criteria:** Mockups + spec accepted by PM/CPO; Dev has enough to start scaffolding.
**Rough effort:** ~1–2 design cycles.

### Phase 2 — Walking Skeleton 🔜
**Owner:** Developer
**Goal:** Smallest possible end-to-end slice that proves the architecture. Prefer depth over breadth.
**Deliverables:**
1. Tech stack chosen (recommendation: Next.js + Supabase for auth/DB/realtime, or equivalent — Dev decides)
2. Repo, hosting, CI/CD set up
3. Sign-up → create baby → Home screen → log one Eat → see it in Timeline → real-time sync to a second device
4. Deployed to a staging URL CPO can hit
**Exit criteria:** Two of us can log into the staging URL on different devices and see each other's Eat entries in <5s.
**Rough effort:** ~1–2 weeks once design lands.

### Phase 3 — Complete MVP 🔜
**Owner:** Developer
**Goal:** Ship the full v0.2 PRD surface.
**Deliverables:** Sleep + Diaper quick-logs, Growth (weight + height + WHO curves), Caregivers screen (invite/remove/transfer), Timeline (today + swipe back), Settings (units, sign out, export, delete account), offline queueing, accessibility audit, polish.
**Exit criteria:** Feature-complete against PRD v0.2; passes designer review; passes accessibility audit.
**Rough effort:** ~3–4 weeks.

### Phase 4 — Beta & Launch 🔜
**Owner:** PM, then CPO
**Goal:** Validate with real parents before public launch.
**Deliverables:** Beta cohort recruited (target: 10–20 households), feedback loop set up, instrumentation for the success metrics in PRD §8, public landing page, launch plan.
**Exit criteria:** D7 retention from beta cohort ≥40%; no P0 bugs open.

---

## 4. Open questions tracker

Carried from PRD §9. None of these block design work; some block Phase 2.

| # | Question | Blocks | PM recommendation | Status |
|---|---|---|---|---|
| Q1 | Monetization in v1? | Phase 4 | Free during validation; revisit at 1k DAU. | ⏳ CPO to confirm |
| Q2 | Primary market + units? | Phase 2 (defaults) | Bilingual EN+TH, metric default, imperial toggle. Designer should design unit-toggleable inputs regardless. | ⏳ CPO to decide |
| Q3 | Brand positioning? | Phase 1 (copy/visual tone) | "The simplest baby tracker." Calm, modern, not infantilizing. | ⏳ CPO to confirm; Designer can run with this as default |
| Q4 | Data residency? | Phase 2 (infra) | US/Asia start; GDPR-ready architecture from day one (region tagging on accounts). | ⏳ CPO to confirm |
| Q5 | Auth provider? | Phase 2 (stack) | Managed (Supabase or Firebase) to ship faster; Dev to recommend specifically. | ⏳ Dev to decide in Phase 2 |

PM will resurface these at the bottom of each phase entry until resolved.

---

## 5. Risks & how we'll handle them

| Risk | Trigger | Mitigation |
|---|---|---|
| Design over-builds for v1 | Hi-fi for all 8 screens instead of just the 4 priority ones | PM reviews IA + lo-fi before hi-fi starts |
| Walking skeleton skips real-time sync | Dev defers it as "later" | Real-time is in the exit criteria; non-negotiable |
| Notification fatigue ships by default | Push enabled out of the box | PRD §5a is explicit: opt-in only |
| Multi-caregiver edge cases (owner deletes account, etc.) miss the QA pass | Treated as edge case | Add explicit test cases in QA checklist (TBD in Phase 3) |
| Scope creep from "while we're here..." | Anyone suggests v0.3 features mid-build | Any new ask routes through PM → PRD update → conscious decision to defer or in-scope |

---

## 6. File map

```
MiNom/
├── PLAN.md                    ← this file
├── JOURNAL.md                 ← single source of truth
├── PRD_v0.2.md                ← current PRD
├── PRD_v0.1.md                ← archived
├── HANDOFF_designer_01.md     ← active brief
└── (design/ and dev/ folders will be created by their owners)
```

---

## 7. Next baton

**Designer.** Brief is `HANDOFF_designer_01.md`. CPO: please route to Claude Design.
