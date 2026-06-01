# Handoff #01 — PM → Designer

| Field | Value |
|---|---|
| From | PM (Claude) |
| To | Designer (Claude Design) |
| Date | 2026-05-29 |
| Routed by | CPO (Nattapon) |
| Stage gate | Phase 1 — Design |

---

## Read first

1. `PRD_v0.2.md` — the current product spec. Especially §3 (the four verbs), §5 (MVP features), §5a (multi-caregiver model), §6 (core screens).
2. `JOURNAL.md` — decision log. Don't repeat decisions already made; if you disagree, propose a change rather than re-litigating.
3. `PLAN.md` — workflow rules and what "done for this phase" looks like.

## The product in one sentence

The simplest baby tracker. From the baby's perspective there are four verbs — **Eat, Sleep, Diaper, Grow** — and anything beyond that is parent metadata, hidden by default.

## Deliverables

### 1. Information architecture
A sitemap of the 8 MVP screens and how a parent moves between them. Highlight the most-traveled paths — almost every session is "open app → log something → done."

### 2. Lo-fi wireframes — all 8 screens
- Home / Today
- Quick-Log: Eat
- Quick-Log: Sleep
- Quick-Log: Diaper
- Timeline
- Growth
- Caregivers
- Settings

Plus supporting flows (light-touch): Sign in/up, Baby setup, Accept invite.

Mobile-first canvases (360–430px wide). Annotate the thumb zone on Home — the three big quick-log buttons must sit in the natural thumb arc.

### 3. Hi-fi mockups — 4 priority screens
- **Home / Today**
- **Quick-Log: Eat**
- **Quick-Log: Sleep**
- **Quick-Log: Diaper**

These four are 90% of the app. Get them right; the rest can follow the same system.

### 4. Visual direction
1–2 mood options. Each shown in **both light and dark mode** — dark is mandatory because parents use this in dark rooms at night and it's a documented churn risk on bright UIs.

Tone to aim for: calm, modern, competent. Not infantilizing (no rattles or pastel clouds as primary motif). Designed for sleep-deprived adults, not for nurseries.

### 5. Component / design-system stub
Enough that a developer can build without re-deciding: type scale, color tokens (light + dark), spacing scale, button states (default/active/disabled/loading), input states, the "last X ago" card, the activity row, the percentile chart placeholder.

This is a v1 system, not a definitive one. Capture what you used; we'll harden it later.

## Constraints (non-negotiable)

- **Mobile web first.** Designs must work in a 360px viewport. Scale up gracefully to tablet and desktop.
- **One-handed thumb operation.** Primary actions reachable without re-gripping. Document the thumb zone.
- **Dark mode mandatory.** Every screen designed in both. Same hierarchy, equivalent contrast, AA-compliant in both.
- **WCAG 2.1 AA.** Tap targets ≥48×48px. Color is not the only indicator of state. Text scales.
- **Two-second log.** A user opening Home and logging an Eat must be able to do it in 2 taps and <2 seconds. If a design choice slows that down, redesign.
- **Activity attribution shown but quiet.** Every Timeline row shows who logged it (avatar or initials). Secondary, not noisy.

## Success criteria for this stage

Designer's work is "accepted" when:
1. PM can read the IA and instantly understand where everything lives.
2. CPO can see the 4 hi-fi screens and feel confident the product matches the vision.
3. A developer (Claude Code) can look at the design + component stub and not have to ask "what does this state look like?" for any primary flow.

## Open questions you can resolve yourself (own them)

- Iconography style (line vs filled, weight, set choice)
- Type pairing
- Empty state copy and illustration approach
- Microcopy on the quick-log sheets
- Whether Home shows 3 cards stacked or a different layout entirely
- Whether the Eat "Details" expander is inline or a separate sheet

If you make a call that contradicts the PRD, write a journal entry proposing the change. Don't silently override.

## Open questions for CPO (don't block on these)

- Q2 (units) and Q3 (brand positioning) are pending. Default to: bilingual EN+TH-ready, metric default with imperial toggle, "the simplest baby tracker" as the positioning. PM will confirm or correct via journal.

## When you're done

Write a journal entry: `## 2026-XX-XX — Designer — Phase 1 complete`. Include:
- Links / file paths to all deliverables
- Any PRD changes proposed
- Any decisions made under "own them" above
- A `Handoff → PM (Claude)` line so PM can review, then route the baton to Dev

## A note on craft

The benchmark (Baby Daybook) is functional but feature-overloaded. Our advantage is restraint. If something feels like it doesn't need to be on screen, it probably doesn't. The best version of this product is the one that fades into the background of a parent's day.
