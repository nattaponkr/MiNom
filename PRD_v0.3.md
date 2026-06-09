# ละมุน (Lamoon) — PRD v0.3 (Thai-First)

| Field | Value |
|---|---|
| App name | **ละมุน** (Lamoon) — chosen 2026-06-01 |
| Project name (internal) | MiNom (unchanged — folder, repo, current Railway URL) |
| Owner | PM (Claude) |
| Status | Draft — pending CPO review |
| Date | 2026-06-01 (updated same day for rebrand) |
| Supersedes | PRD_v0.2.md |
| Change driver | CPO direction: "We target Thai parents — better to have a native Thai version." + name change: MiNom had unintended sexual connotation in Thai (นม) → renamed to ละมุน. |

---

## 0. Brand identity

**Name:** ละมุน
**Latin spelling:** Lamoon (pronounced *lah-MOON*)
**Meaning:** soft, gentle, tender, smooth. Common compound: ละมุนละไม (exquisitely gentle).
**Why this name:** It names the *feeling* we want every interaction to leave behind — a gentleness in how the app speaks, how it looks at 3am, how it carries the weight of a tired parent. Choosing a feeling-word as the brand sets the bar for every design and copy decision downstream: if it isn't ละมุน, redo it.
**Internal vs external:**
- External (user-facing, marketing, app title, splash, signup): **ละมุน** primary, "Lamoon" Latin used only when Thai script can't render or when EN copy is added later.
- Internal (repo, folder name, code identifiers, Railway URL, dev docs): MiNom unchanged. Renaming the codebase is a Phase 3.5+ task; not worth churn now.

**Tagline (locked 2026-06-01):**
- **"ดูแลลูกอย่างละมุนละไม"** — *care for your baby, exquisitely gently*. Echoes the ละมุนละไม compound so the line reinforces the name. Used for hero, signup, and the auth tagline string.
- Alts kept on file in `design/brand.jsx` if a longer line is needed for splash/store listings.

**Positioning line (locked 2026-06-01):**
- **"แอปบันทึกการดูแลลูก ที่ทำเพื่อครอบครัวไทย"** — a baby-care log, built for Thai families. Resolves Q3.

**Brand voice — the one rule (per Designer's voice filter):**
- **Warm, plain Thai that leaves a ละมุน feeling.** Speak like a calm friend who's done this before — never a manual, never baby-talk, never a marketer. Own mistakes softly; never blame the parent. Concrete on-brand vs off-brand examples live in `design/brand.jsx` → `voice-grid` section.

**Open brand TODOs (PM tracks):**
- Domain: `lamoon.app` / `lamoon.co` / `lamoon.in.th` — research availability, recommend, secure. **Now load-bearing for re-enabling email confirmations** — Supabase Auth SMTP via Resend requires a verified sender domain to relay reliably. Resend's onboarding domain failed the dry-run for confirmation emails. Pre-public-launch blocker.
- Logo design — Designer brief covered separately when typography lock-in is done.
- App icon — placeholder OK for staging; final for beta.
- Social handles — bundled with domain decision.

---

## 0.1. What changed from v0.2 (TL;DR)

Same product, narrower target. Thailand is now the **only** market for v1, and the app ships in **Thai only**. Everything visible to the user — copy, typography, examples, currency-adjacent values — is built for a Thai parent, not translated from English.

Resolves Q2 (market = Thailand, units = metric), Q3 (positioning anchored in Thai context), and Q4 (residency = Singapore, per Dev rec). Q1 (monetization) and Q5 (auth provider — Supabase, per Dev rec) recommended for confirmation.

This is a re-targeting, not a re-scoping. The four verbs, multi-caregiver model, screens, and exit criteria are unchanged.

---

## 0.2. Growth chart — WHO LMS percentile semantics (added 2026-06-07; restored 2026-06-09)

*Restoration note (2026-06-09): the 2026-06-07 journal entry recorded this subsection as added, but the edit was never written to the PRD file. Restored here, faithful to the agreed Designer #15 / Dev #15 semantics, with the editable-sex update from Dev #15's return folded in.*

**Principle — the chart is diagnostic, never decorative.** A "WHO" label on placeholder or sex-combined curves reads authoritative-but-false. We never fake data. The chart shows only what is real for this baby.

**The five percentile curves.** P3 / P15 / P50 / P85 / P97, computed from the bundled WHO Child Growth Standards LMS tables via `X(z) = M·(1+L·S·z)^(1/L)` (and `M·e^(S·z)` when L=0); z = −1.881 / −1.036 / 0 / +1.036 / +1.881. P50 is weighted heavier; P3/P97 are thin + dashed; the P15–P85 band is a soft "expected range" tint. Per-point readout exposes the exact `P{n}` via `valueToPercentile`.

**Axes & marker.** X = age (weeks if window ≤6mo, else months — smart switch); Y = kg or cm per metric tab, ranged from the percentile envelope at the baby's age and auto-expanding to fit any out-of-range point. A dashed "today's-age" vertical marker uses actual age (not date; BE-lock N/A to age axes).

**Mandatory citation.** `ข้อมูลอ้างอิงจาก WHO Child Growth Standards` rendered as real text (`--fg-muted`, never `--fg-faint`), tappable to the WHO source.

**Sex is required for curves, and degrades honestly (three states):**

| `sex` state | What the chart shows |
|---|---|
| set (boy/girl) | full sex-specific curves + band + axes + today-marker + data points |
| unset | axes + today-marker + data points only — **no curves**, never faked or sex-combined — plus a low-weight prompt `ระบุเพศของลูก` whose CTA navigates to Settings |
| set later | curves render; existing points stay (no migration) |

**Sex is optional at setup and now editable post-setup (updated 2026-06-09, per Dev #15).** See §5.

**Scope locks.** v1 uses actual age (premature corrected-age deferred). >60mo deferred. The bundled LMS data currently covers **0–24mo**; the full official 0–60mo WHO tables (weight-for-age + length/height-for-age, boys + girls) remain a pre-public-launch data task — `growth.outOfRange` microcopy exists, and >24mo currently clamps to the last row. Fine for the 0–12mo beta.

---

## 1. The reframe (unchanged)

From the baby's POV there are four things:

> **Eat. Sleep. Diaper. Grow.**

We design around those four verbs. Anything more granular is parent metadata — useful, but optional and hidden until the parent asks for it.

## 2. Vision

**ละมุน** (Lamoon) is the simplest baby tracker, built for Thai parents and their families. One screen, three big buttons. Designed so a parent can log in two seconds with one thumb, in the dark. Web-first so there's no install. Real-time shared between everyone helping care for the baby. Every interaction — visual, copy, motion — should leave a *ละมุน* feeling: soft, tender, unhurried.

## 3. Target users (Thai context)

**Primary persona — "แม่ใหม่ ฟ้า" (Fai, the new mom)**
- 28–38, Bangkok or upcountry urban, first-time parent, baby aged 0–6 months.
- Smartphone-first (Android majority in Thailand; iOS strong in metro).
- Often returning to work at month 3; baby cared for by grandparent or พี่เลี้ยง (nanny) during the day.
- Pain: cognitive overload, sleep deprivation, anxiety about whether baby is "ปกติไหม" (normal?).

**Secondary persona — "คุณยาย / พี่เลี้ยง" (Grandmother / Nanny)**
- The hand-off caregiver. Often older, less app-fluent, often *the* primary daytime caregiver in Thai families.
- Needs to know what happened overnight; needs to record what happened during the day so the parent sees on return.
- Wins when: she opens the app, sees one screen, three buttons in Thai, gets it instantly.

**Why this matters for design**
Thai families are routinely multigenerational and tag-team care. The multi-caregiver feature isn't a "nice to have" — it's how childcare actually works here. This strengthens our wedge.

## 4. The four verbs (updated 2026-06-01: back-dating allowed)

Eat / Sleep / Diaper / Grow. Content from v0.2 §3 stands, with one addition:

**Back-dating any quick-log (locked 2026-06-01).** Every quick-log defaults its time to "ตอนนี้" (now). A small **แก้ไข** affordance opens a native time input, capped not-in-future. The 2-tap path is preserved when "now" is correct. Reason: parents routinely log retrospectively ("she ate 20 minutes ago, I'm just now writing it down"); without back-dating, the timeline drifts from reality. Matters more for Sleep and Diaper than Eat — the Eat pattern is established in Phase 2, Sleep/Diaper copy it in Phase 3.

## 5. MVP feature list (unchanged from v0.2)

Same ten items. See v0.2 §5.

**Baby profile — sex field (updated 2026-06-09, per Dev #15).** Baby setup stays minimized to name + birthdate; **sex (ชาย/หญิง) is optional**. As of Dev #15 it is **settable at onboarding (BabySetup, skippable) and editable post-setup in Settings** (tapping the active value clears it). This is required for the WHO growth chart: the chart needs sex to draw percentile curves and degrades honestly without it (see §0.2). The earlier assumption that "sex is already collected" was false — no setter existed before #15, so without this every real baby had `sex = null` and curves would never have rendered.

## 5a. Multi-caregiver model (unchanged from v0.2)

Up to 10 caregivers per baby; one Owner + N equals; activity attribution on every entry; full spec in v0.2 §5a.

## 6. Core screens (unchanged from v0.2)

Eight screens. See v0.2 §6.

## 7. Non-functional requirements (updated)

- Mobile-first responsive (360–1280+px).
- Dark mode mandatory.
- WCAG 2.1 AA. Tap targets ≥48px.
- Quick-log action <500ms on mid-range Android over 4G.
- Encrypted in transit + at rest. Account deletion + data export available.
- **Language: Thai only in v1.** Architected for i18n so EN can be added post-launch without rewrite — all UI strings extracted to a locale file from day one.
- **Typography: must support Thai script.** Tone targets calm/modern; designer chooses a Thai-first pair (see §11).
- **Date/time formatting:** **Buddhist Era (พ.ศ.) for full-date displays** (locked 2026-06-05 per CPO via Timeline empty-state polish — reads more Thai-first than Gregorian). Thai locale (`th-TH`) underlying formatting; year display is BE. Relative durations on Home like "3 สัปดาห์" are unaffected (not full dates). Applies consistently across all surfaces where a full date appears (Timeline header, future Growth chart axes, exports, etc.).
- **Region & residency:** Single region `ap-southeast-1` (Singapore), per Dev's Phase 2 recommendation. Lowest latency for Thai users; baby data kept in one region; encrypted at rest + RLS.
- **PDPA (พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล) compliance.** Thailand's data-protection law applies. Required surface in MVP:
  - Plain-Thai privacy notice on signup.
  - Explicit consent for data collection.
  - User-visible data export (already in §9 settings).
  - User-visible account & data deletion (already in §9).
  - Data subject access request channel (email to support is acceptable for MVP).
  - We are the data controller; Supabase is the processor (DPA to be on file before public launch).

## 8. Success metrics (Thailand-scoped)

Same five metrics, scoped to Thai users. Targets unchanged from v0.2 §8. Add one:

| New metric | Target (90 days) |
|---|---|
| % of accounts logging in Thai (UI language) | 100% (MVP is Thai-only) |
| % of activities with notes written in Thai script | Tracking signal, no target — used to validate copy/font rendering in real usage |

## 9. Open questions (status)

| # | Question | Status (post-v0.3) |
|---|---|---|
| Q1 | Monetization in v1? | **Open.** PM rec: free during validation. Awaiting CPO. |
| Q2 | Market + units? | **Closed.** Thailand; metric. |
| Q3 | Brand positioning? | **Closed.** "Simple baby tracker, made for Thai families." Designer to finalize the Thai positioning line. |
| Q4 | Data residency? | **Closed.** Singapore (`ap-southeast-1`). |
| Q5 | Auth provider? | **Closed.** Supabase Auth (email + password); enable email confirmation before public launch. |

One open question remains (Q1).

## 10. Phase 2+ roadmap (informational, unchanged)

See v0.2 §10. Plus: post-MVP, **English locale** is the natural first expansion when we widen the market.

## 11. Localization strategy (new section)

### 11.1 Decision
- **MVP ships Thai-only.** EN added later as a second locale.
- Reason: "native Thai" means the copy, examples, and visual rhythm feel Thai-built, not translated. One language lets us tighten the voice; adding EN later is straightforward.

### 11.2 What "native Thai" means concretely
- All UI strings written in Thai by the designer (or with native review), not machine-translated from the existing English mockups.
- Voice: warm, plain-spoken Thai. Polite but not overly formal (avoid stiff โบราณ / academic register). Match the calm tone the visual system already targets.
- Examples in copy use Thai names (น้องฟ้า, etc.) and Thai contexts (พี่เลี้ยง, คุณยาย).
- Numerals: Arabic numerals (1, 2, 3) — what Thai users already use in digital contexts. Thai numerals (๑, ๒, ๓) are a no.
- Date format: `d MMM yyyy` Thai locale, **Buddhist Era year** (e.g. "1 มิ.ย. 2569"). Locked 2026-06-05.
- Time: 24-hour. Common in TH contexts and avoids AM/PM translation friction.

### 11.3 Typography requirements
- Latin-only typefaces from the v0.2 design (Hanken Grotesk + Spline Sans Mono) **must be replaced or paired** with Thai-capable equivalents. Designer selects.
- Candidate Thai pairings to evaluate (designer's call):
  - **IBM Plex Sans Thai** — modern, neutral, free, pairs cleanly with Plex Sans Latin if EN is added later.
  - **Anuphan** (Cadson Demak) — warm, contemporary, designed for UI.
  - **Noto Sans Thai** — utilitarian fallback, broad coverage.
- The mono face (for times / durations / amounts) needs only Latin coverage — Spline Sans Mono can stay.
- Designer must verify rendering at the smallest UI sizes (caption 12px, body 14–16px) — Thai script has tall ascenders/descenders that can collide with tight line heights.

### 11.4 Layout impact
- Thai script has no inter-word spaces. Line-break logic must use the browser's `lang="th"` attribute so word-break heuristics fire correctly.
- Button labels: Thai equivalents are often **shorter** than English; rarely longer. Containers should hug content with sensible min widths so single short Thai words don't sit awkwardly in too-wide buttons.
- Headings: occasionally longer (e.g. "การให้นมและขวด" vs "Feeding & Bottles"). Designer should re-check the four hi-fi screens with real Thai copy in place.

### 11.5 Engineering implications (for Dev)
- Wire **next-intl** (or equivalent) into the Next.js app. Extract every UI string from JSX into `/locales/th.json`. Add `en.json` as an empty stub for later — no UI switcher yet.
- Set `<html lang="th">`.
- Use `Intl.DateTimeFormat('th-TH', …)` and `Intl.NumberFormat('th-TH', …)` for all date/number rendering — not custom string concatenation.
- Plurals in Thai are simpler than English (no singular/plural inflection) but still go through the locale file for hygiene.

### 11.6 Risks
- Auto-translation of the existing English copy will feel foreign and undercut the "native" promise. Don't do it. Designer writes Thai copy from intent, not by translation.
- Font loading: Thai fonts are larger than Latin-only. Subset + preload the chosen face to keep first-paint within mobile-4G budget.

---

## 12. What we're not doing in v1 (Thailand-specific)

- Multiple languages / language switcher.
- ~~Buddhist Era (พ.ศ.) calendar~~ — **adopted 2026-06-05; moved out of "not doing" section.** See §7 + §11.1.
- LINE login or LINE notifications (popular in TH; deferred to phase 2 — would compete with our "opt-in only" notification stance and add OAuth complexity).
- PromptPay / payment integration (no monetization in v1).
- Thai-specific health log content (Thai vaccination schedule, etc.) — relevant when Health Log ships post-MVP.
