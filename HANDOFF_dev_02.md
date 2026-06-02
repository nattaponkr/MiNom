# Handoff #02 — PM → Dev (Claude Code)

| Field | Value |
|---|---|
| From | PM (Claude) |
| To | Developer + QA (Claude Code) |
| Date | 2026-06-01 |
| Routed by | CPO (Nattapon) |
| Stage gate | i18n wiring + rebrand → Phase 3 (Complete MVP) |

---

## TL;DR

Designer's localization rework + rebrand is accepted. PM confirmed both pending decisions (tagline = "ดูแลลูกอย่างละมุนละไม"; back-dating = approved, ship with `แก้ไข` time affordance). Two work batons in one handoff:

1. **i18n wiring + rebrand swap.** Wire `web/locales/th.json` through next-intl, set `<html lang="th">`, load Anuphan, swap all user-facing brand to **ละมุน**. User-facing only — code/folder/repo stay MiNom.
2. **Phase 3 — Complete MVP.** Copy the Eat vertical to Sleep + Diaper (with back-dating); build Growth, Caregivers, Timeline (today + swipe back), Settings, PDPA consent flow, accessibility pass.

Read in this order: `PRD_v0.3.md` (with §0 brand and §4 back-dating update), the latest **Designer — Rebrand + Localization rework complete** entry in `JOURNAL.md`, then the design deliverables in `design/`.

---

## What's already done for you

- `web/locales/th.json` — drop-in. Keyed to your existing component string IDs (Designer confirmed). Includes `brand.*`.
- `design/MiNom Design — Thai Localization.html` — the deliverable; five sections covering typography, hi-fi in Thai (light+dark, 360px verified), microcopy, clarifications, PDPA consent.
- `design/brand.jsx` + `design/brand.css` — wordmark, app icon, voice filter.
- `design/screens_th.jsx`, `design/section_thai_a.jsx`, `design/section_thai_b.jsx`, `design/thai_app.jsx`, `design/thai.css`, `design/th-strings.js` — source for the Thai rework.
- `design/MiNom Design — Phase 1.html` and Phase-1 source — the English reference, intact.

---

## Part 1 — i18n wiring + rebrand (do first)

### i18n
- Wire **next-intl** (or equivalent) into the App Router.
- Set `<html lang="th">` at root.
- Load `web/locales/th.json` as the active locale. No language switcher — single-locale UI for v1. Keep an empty `en.json` stub for later.
- Replace **every** hardcoded UI string in the codebase with a `t('key')` call. Cross-reference against `th.json`; if any key is missing, flag in your journal entry — Designer can add it.
- Date and time: **`Intl.DateTimeFormat('th-TH', …)`** for every date/time render. Time = 24-hour. Don't hand-build strings.
- Numbers: **`Intl.NumberFormat('th-TH', …)`** for amounts, durations, percentile values. Arabic numerals (default), not Thai numerals.

### Typography
- Load **Anuphan** (Cadson Demak, weights 400 + 500 minimum; 600/700 if used). Subset to Thai + Latin + numerals. **Preload** the primary face per PRD §11.6 — Thai fonts are heavier than Latin-only; first-paint budget matters on mobile 4G.
- Backup: **IBM Plex Sans Thai**. Fallback: **Noto Sans Thai** (system fallback).
- Keep **Spline Sans Mono** for Latin numerals only (times, durations, amounts).
- Adjust line-height per Designer: **1.45 body / 1.35 titles** to accommodate stacked Thai tone marks.

### Rebrand swap (user-facing only)
- App title, splash, signup hero, footer, browser `<title>`, meta tags, OG tags → **ละมุน**.
- Latin "Lamoon" only where Thai script can't render or for legal/footer.
- Replace the existing wordmark component with `LamoonWordmark` from `design/brand.jsx`; replace icon with `LamoonIcon`.
- Tagline string (`brand.tagline` in `th.json`) on signup and any hero placement.
- **Do not rename:** repo, folder, npm package name, code identifiers, Railway service name, environment variables, Supabase project labels. Internal "MiNom" stays.

### Verification (i18n + rebrand stage)
- Every page renders Thai end-to-end; no English strings leak through.
- All dates/times render via `Intl.*('th-TH')`.
- Wordmark + icon match Designer's `brand.jsx`/`brand.css` in light and dark.
- Lighthouse mobile run: first paint impact from Anuphan ≤200ms over throttled 4G.
- WCAG AA contrast preserved with the new face.

---

## Part 2 — Phase 3 (Complete MVP in Thai)

Goal: ship the rest of the PRD surface — in Thai, on the same architecture proven by Phase 2.

### 2.1 Sleep + Diaper quick-logs
- Copy the Eat vertical pattern (data layer + sync + offline queue + optimistic + 5s undo + concurrency soft-prompt + activity attribution).
- **Back-dating affordance** is now in the pattern (PRD §4 update, locked 2026-06-01). Implement once in Eat first if not already, then carry to Sleep + Diaper.
- Sleep: start/stop timer; manual entry via the same `แก้ไข` affordance. Awake/sleeping indicator on Home.
- Diaper: one-tap open → wet (ฉี่) / dirty (อึ) / both (ทั้งคู่) → save. Microcopy is in `th.json`; do not "correct" the kid-words to clinical terms (Designer's call, owned).
- Concurrency soft-prompt copy: per `th.json` `concurrency.*` keys; Designer confirmed the Eat shape applies (peer activity within 60s → sheet with view / log another / cancel, non-blocking).

### 2.2 Timeline
- Already exists for today. Add swipe-left to past days. No date picker.
- Each row shows actor attribution (small, secondary). Already wired in Phase 2.
- Empty state copy in `th.json` `timeline.empty.*`.

### 2.3 Growth
- Weight + height entries (no head circumference — cut in v0.2).
- Plot on **WHO** percentile curves (TH market follows WHO).
- List view of historical entries; edit/delete.
- Empty state copy in `th.json` `growth.empty.*`.

### 2.4 Caregivers (per PRD §5a)
- Owner + N equal caregivers, capped at 10.
- Invite by email → if existing user, one-tap accept; if new, signup link tied to invite token; expire after 14 days.
- Owner can remove caregivers, transfer ownership.
- Any caregiver can remove themselves.
- Owner account deletion: 30-day grace, auto-transfer to longest-tenured caregiver, or delete data if none.
- Notifications **opt-in, off by default** (PRD §5a).

### 2.5 Settings
- Sign out.
- Export my data (JSON download).
- Delete account (with PDPA-compliant grace + confirmation).
- Notification preferences (opt-in toggles).
- Display name / avatar (used in attribution).
- No language switcher (Thai-only v1).

### 2.6 PDPA surface (required for launch)
- Signup consent: 4-line plain-Thai notice from `th.json` `consent.line1–4` + link to full policy.
- Full privacy policy page: Thai, plain language. (PM will draft the full text; Designer's 4-line condensation is the signup version.)
- Data export + account deletion already in §2.5.
- "Contact us" mailto for data subject access requests.

### 2.7 Accessibility pass
- WCAG 2.1 AA on every screen, light + dark.
- Tap targets ≥48×48px.
- Color is not the only state indicator (Diaper, validation, etc.).
- `prefers-reduced-motion` honored across motion specs.
- Screen reader pass on Home + the three quick-logs (label every icon button; aria-live for sync/realtime toasts).

### 2.8 Two-device + RLS verification (Phase 2 carry-over)
- Once CPO provisions Supabase, light it up: run `web/supabase/migrations/0001_init.sql`, set the two `NEXT_PUBLIC_SUPABASE_*` env vars in Railway.
- Run the literal two-device test (two real browsers across the network, ≤5s realtime).
- Run RLS isolation: caregiver A on baby X cannot see baby Y data.
- Close out the original Phase 2 exit criteria in the journal once these pass.

---

## Constraints & non-negotiables

- **Don't redo what works.** Phase 2's data layer, sync, offline queue, optimistic-write, undo are correct. i18n is a string-replacement + format-replacement layer over what exists.
- **Match Designer's hi-fi exactly.** Same tokens (`thai.css`/`brand.css` may override Phase 1 type only), same component shapes. If a Phase 3 screen needs a new component, propose first.
- **No machine translation** of any string. Designer's `th.json` is the source of truth for Thai copy. If a key is missing, add it in `th.json` (Designer reviews) — do not write Thai on the fly.
- **Internal naming unchanged.** Folder, repo, package, env vars, service name = MiNom.
- **Back-dating capped not-in-future.** Enforce client-side and reject at the data layer.
- **Notifications opt-in, off by default.** No exceptions in v1.

## Success criteria

Phase 3 is "done" when:
1. Every screen in the app renders in Thai end-to-end, on Anuphan, with `lang="th"` and `Intl.*('th-TH')` formatting.
2. Sleep, Diaper, Growth, Caregivers, Timeline (with swipe), Settings, PDPA consent all match Designer's hi-fi/microcopy and pass functional + a11y QA.
3. Back-dating works on Eat, Sleep, Diaper.
4. Real Supabase backend running on staging; two devices verified ≤5s realtime; RLS verified.
5. CPO can do a full new-parent loop on staging in Thai: sign up → consent → create baby → invite a caregiver → log all three verbs (including back-dated) → add a growth entry → see attribution → log out → log in as the second caregiver → see everything.

## Open questions / dependencies

- **Supabase provisioning** is the long-pole risk. CPO needs to create the project (region: ap-southeast-1) and surface the two env vars. PM is tracking this on CPO's side; Dev can proceed on the i18n + Phase 3 build using demo mode, and switch to live the moment env vars land.
- **Q1 monetization** still open (free in v1 is PM rec). Doesn't block.

## When you're done

Write `## YYYY-MM-DD — Dev — Phase 3 complete` in `JOURNAL.md`. Include:
- What shipped (file paths, deployed URL).
- Verification log: every screen rendered in Thai; two-device + RLS verified (or what's still gated on Supabase).
- Any clarifications you needed from Designer (route through PM if substantive).
- A `Handoff → PM` so PM can prep Phase 4 (beta + launch).
