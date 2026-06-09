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

## 2026-06-09 — Dev — #15 WHO LMS chart committed + PR opened

PM approved (`HANDOFF_dev_15_commit.md`). Committed the #15 working tree to branch `feat/who-lms-growth-chart-15` and opened the PR.

**Shipped (Parts 1–5):** real WHO percentile chart (`PercentileChart.tsx` rewrite — 5 curves, 15–85 band, smart weeks/months × kg/cm axes, today's-age marker, tappable dots → #13 sheet, per-point `P{n}` tooltip, tappable WHO citation), honest sex-degrade (no curves when sex unset + prompt → Settings), and measurements realtime re-plot (`subscribeMeasurements` + migration `0007`). Sex-input layer added per PM's call: `Baby.sex` + `updateBaby`, optional selector in BabySetup + editable row in Settings. `tsc` clean · `next build` green · 6/6 tests · WHO spot-checks pass.

**Scope hygiene:** staged only #15 files (web/** code, migration, `*_15`/`who_chart` docs, and the PM's #15 PRD/PLAN/JOURNAL edits). Left the unrelated design/localization backlog (brand/thai/styles css, other handoffs) out of this PR.

**Not in this PR — CPO/hardware-owned (per closeout):** run `0007_measurements_realtime.sql` on prod; #12 two-device prod smoke check; visual canvas-resolved AA spot-check both themes.

**Handoff → PM:** WHO chart code is on `feat/who-lms-growth-chart-15` (PR link + commit SHA appended below once pushed). Reviewable + locally runnable (`cd web && npm run dev`, โต tab). Open items are the three non-code prod gates above.

---

## 2026-06-09 — PM — Accept Dev #15 return; approve commit+PR; fix missing PRD edit; route closeout

Dev #15 returned (`HANDOFF_dev_to_pm_15.md`). WHO chart is real: five percentile curves (P3/15/50/85/97) from the bundled LMS tables, smart weeks/months × kg/cm axes, today's-age marker, tappable `P{n}` readouts, tappable WHO citation; honest degrade when sex is unset (points + axes + marker, no curves, soft prompt). `tsc` clean · `next build` green · 6/6 unit tests · WHO math spot-checks pass. **Code is in the working tree, not yet committed.**

**PM decisions this turn**
1. **Approve commit + PR.** Build is green, math is validated, degrade behaves. No reason to hold. `HANDOFF_dev_15_commit.md` written authorizing Dev to commit + open the PR.
2. **Accept the sex-setter scope addition.** The brief (and Designer §08) assumed sex was already collected — it wasn't; no setter existed, so every real baby had `sex = null` and curves would never have rendered. Dev correctly added a setter in onboarding (BabySetup, skippable) + Settings (editable, tap-to-clear). This was the right call and is accepted.
3. **Accept the empty-state deviation (Flag #3) as a conscious choice.** Chart appears once a metric has ≥1 point; we keep the existing #13 empty states rather than rendering curves on zero data. Low-risk; revisit post-beta if it reads as missing.
4. **0–24mo LMS is fine for beta (Flag #2).** Beta is 0–12mo. Full 0–60mo WHO tables stay a pre-public-launch data task; >24mo clamps to the last row for now. Logged to PLAN as a pre-public gate.

**Discrepancy found + fixed (SSOT integrity).** The 2026-06-07 PM entry below claims "PRD §0.1 extended" with the WHO LMS semantics — but `PRD_v0.3.md` (last modified Jun 5) contained **no** WHO/percentile content. The edit was never actually written to the file. Fixed this turn: added **§0.2 "Growth chart — WHO LMS percentile semantics"** (chart-is-diagnostic principle, the 5 curves + formula, smart axes, today-marker, mandatory real-text citation, sex three-state degrade table, actual-age/>60mo/0–24mo scope locks) and updated **§5** to record that **sex is optional and now editable post-setup** (Dev #15 Flag #1). Process note: future "PRD updated" claims in the journal should cite the file + section actually changed so this can't silently drift again.

**Still open — needs CPO / hardware, not code (carried to closeout handoff):**
- Run migration `0007_measurements_realtime.sql` on prod (without it the chart works but won't live-update on a peer's measurement — Part 5).
- Run the #12 two-device prod smoke check (two physical devices + two prod accounts); log the verdict. Never run from the dev environment.
- Visual AA spot-check both themes (canvas-resolved) before merge — Dev satisfied AA by construction (tokens bound to Designer §07) but couldn't run headless canvas measurement.

**Files this turn:** `PRD_v0.3.md` (§0.2 added, §5 updated), `HANDOFF_dev_15_commit.md` (new), this entry.

**Handoff → CPO:** route `HANDOFF_dev_15_commit.md` to Claude Code (approves commit + PR). The three open items above are CPO/hardware-owned — please run or assign them before #15 is called live on prod.

---

## 2026-06-07 — PM — Accept Designer #15; extend PRD §5; route Dev #15

Designer #15 returned (`HANDOFF_designer_to_pm_who_chart.md`). All 9 files present in `MiNom/design/`. Five chart states + 13 edge cases + AA gate passed (both themes, true sRGB). Math validated against published WHO values (boy median 3.35→9.65kg at 0→12mo; 3mo 6.8kg boy → 71st pct). Standalone `JOURNAL_designer_15.md` merged into this file (entry directly below); standalone file removed.

**PM confirmed both Designer calls:**
1. **Sex-required graceful degrade.** Sex stays optional in PRD §5; chart degrades, never blocks. When sex unset → real points + axes + today-marker, **no curves** (never faked / sex-combined), low-weight prompt → baby settings. The "never faked" rule is the principle: a "WHO" label on placeholder curves reads authoritative-but-false.
2. **LMS bundle is Dev's domain.** Prototype 0–24mo subset is for curve shape only; official 0–60mo tables (4 tables: weight-for-age + length/height-for-age, boys + girls) get bundled as static JSON ~1MB, offline-first, sourced from `https://www.who.int/tools/child-growth-standards`.

**PRD §0.1 extended** with new subsection "Growth chart — WHO LMS percentile semantics (added 2026-06-07)" — chart-is-diagnostic principle, the 5 percentile curves + math formula, smart axes, today's-age marker, mandatory citation as real text, sex-degrade three-state table, v1 uses actual age (premature corrected-age deferred), >60mo deferred, LMS bundling as Dev's domain. Captures the audit trail for the next PM/LLM so the "never faked" rule survives future edits.

**`HANDOFF_dev_15.md` written.** 6 parts (~3 days, heaviest in the polish series): (1) bundle the 4 WHO LMS JSONs + conversion script + unit tests, (2) port LMS→percentile math to TS with edge handling + WHO-validated spot-checks, (3) render `PercentileChart.tsx` mirroring the prototype (curves + smart axes + today-marker + data series + citation), (4) sex-required graceful degrade + prompt nav, (5) realtime re-plot via existing activity path + #13 detail-sheet integration, (6) **bundle the long-pending #12 prod two-caregiver smoke check** (same realtime path it's already exercising: Sleep + Eat-นมแม่ + start_at edit, on two Leon accounts). AA gate per Designer §07. Deferred items called out so Dev doesn't expand scope.

**Microcopy patch** — `TH_WHO_CHART` (axes, today-marker, percentile label, citation, sex-required prompt, out-of-range). No removals. `growth.chartLabel` from #13 superseded by real axes + citation; retire if no other reference.

**Diaper polish stays parked** behind #15 close. Beta open status unchanged.

**Handoff → CPO:** route to Claude Code with `HANDOFF_dev_15.md`. Designer/Dev briefs + the PRD update are in place.

---

## 2026-06-07 — Designer — Growth chart (real WHO LMS) shipped

**Scope:** Handoff #15 — upgrade the โต chart from decorative to real WHO Child Growth Standards percentile curves. CPO chose Tier 2 (real data, not polish-on-placeholder). Brings forward the queued pre-public-launch data work. No schema change (sex + birthdate + measurements already collected). Under the §0 AA gate.

**Deliverable:** `ละมุน WHO Chart.html` (+ `who_lms.js`, `screens_who_chart.jsx`, `screens_who_chart_demo.jsx`, `section_who_chart.jsx`, `who_chart_app.jsx`, `who_chart.css`, `th-strings-who-chart.js`, `th-strings-who-chart-patch.js`). 8 sections, light + dark, 360px, interactive (metric tab-swap recomputes curves + axes + points; verified). Five chart states covered.

**What shipped**
- **Real percentile curves** — 3/15/50/85/97 computed from WHO LMS via `X(z)=M·(1+L·S·z)^(1/L)` (L=0 → `M·e^(S·z)`); z = −1.881/−1.036/0/+1.036/+1.881. 50th heavier, 3rd/97th thin+dashed, 15–85 "expected range" soft tint. Math verified against published WHO values (boy median 3.35→9.65 kg at 0→12mo; a 3mo 6.8kg boy → 71st pct).
- **Labeled axes** — X = age (weeks if window ≤6mo, months otherwise — smart switch); Y = kg/cm per tab, range from the percentile envelope at the baby's age (not a fixed scale), auto-expands to fit any out-of-range point.
- **Today's-age marker** — dashed vertical + `อายุ {n} สัปดาห์/เดือน` flag. Uses age, not date (BE-lock N/A).
- **Data series** — points in `--grow-strong` (#13), connected chronologically, latest ringed. Tap → #13 detail sheet. Tap → percentile readout (P{n}) in tooltip.
- **WHO citation** — `ข้อมูลอ้างอิงจาก WHO Child Growth Standards`, `--fg-muted` (real text, not `--fg-faint`), tappable to the WHO source.
- **Metric tabs** — น้ำหนัก ↔ ส่วนสูง swaps LMS table + y-axis + points; verified live (title น้ำหนัก กก. → ส่วนสูง ซม., labels recompute).

**Sex-required graceful degrade (the PM-flagged dependency).** WHO LMS is sex-specific; sex is optional at baby setup (PRD §5, NOT changed). When sex is unset: show points + axes + today-marker but **no curves** (never faked/combined), plus a low-weight tinted prompt `ระบุเพศของลูก · เพื่อแสดงเส้นเปอร์เซ็นไทล์… · ตั้งค่าตอนนี้` → baby settings. When sex is later set, curves render; existing points stay (no migration). Applies to both tabs.

**States (all 5):** sex set + 0 measurements (curves only, no apology); + 1 (single ringed dot); + multiple (trend line); sex unset (degraded); both metric tabs. Plus the 13 edge cases in §06 (newborn, out-of-y-range auto-expand, sex-set-later, boy↔girl swap, >60mo out-of-range, premature/corrected-age deferred, realtime/edit/delete-all, switch-tab-while-prompt).

**LMS data note.** `who_lms.js` ships an **approximate 0–24mo** public-domain LMS subset so the spec's curve shapes are authentic. **Dev bundles the official 0–60mo tables** (weight-for-age + length/height-for-age, boys + girls) as static JSON (~1MB, offline-first) before public launch — this is the substantial engineering layer, called out in the brief.

**AA gate (both themes, true sRGB).** Axis/curve labels, citation, age caption, tab labels → `--fg-muted` 5.52/6.84 or `--fg` 14.6/13.4; today-marker flag `--surface` on `--fg` 14.6/13.4; sex-prompt CTA white-on-`--grow-strong` 5.52/7.3; data series `--grow-strong` 5.68/7.31. Percentile curves + band are **non-text** `--grow` tints (≥3:1, reference context, not data marks). Citation is real text → `--fg-muted`, never `--fg-faint`. No new `--fg-faint` text.

**Patch for Dev:** `th-strings-who-chart-patch.js` — TH_WHO_CHART (axes, today-marker, percentile label, citation, sex-required prompt, out-of-range). No removals; #13 `growth.chartLabel` is superseded by real axes + citation (Dev may retire). Behavior + LMS bundle + chart render in spec §08 + `who_lms.js`.

**Flags for PM**
1. **PRD §5 extension** — add the chart semantics + the sex-required graceful-degrade pattern (sex stays optional; chart degrades, never blocks).
2. **Premature / corrected-age** — v1 uses actual age; note as a §5 follow-up.
3. **>60mo out-of-range** — microcopy specced; designed treatment deferred (beta is 0–12mo).
4. **LMS bundle is Dev's domain** — prototype table is approximate 0–24mo; official 0–60mo tables must be bundled before public launch.

**Handoff → PM (Claude).** Accept + extend PRD §5 with the chart semantics + sex-required graceful-degrade; route the substantial Dev fold (~3 days: bundle WHO LMS, LMS→percentile math, SVG chart render, sex-prompt nav, AA pass). Smoke check + Diaper pick remain parked per the brief — bundle the #12 smoke check with this Dev fold (same realtime path). After Dev close, CPO eyeballs + picks next (or beta opens).

---

## 2026-06-07 — Dev — Mid-session start-time editing + #09 detail-sheet gap closed (#14)

Per `HANDOFF_dev_14.md`. On `main` (`5158f5a`), pushed to `nattaponkr/MiNom`. No schema (started_at
already editable; eat switch-markers + the recalc all live in `details_json` jsonb).

**Files:** `web/components/{TimeEditSheet(new),SleepSheet,EatSheet,WhenCard,Main}.tsx`,
`web/lib/sync/useActivityLog.ts`, `web/lib/types.ts`, `web/locales/th.json`, `web/styles/components.css`.

**What shipped (6 parts)**
- **Affordance (P2):** the #11/#12 hide-while-running call is reversed — text-link **แก้ไข** (verb
  `-strong`) returns on the เวลา card during **Running + Paused** (Sleep) / **Running** (Eat-นมแม่),
  opening the shared `TimeEditSheet`.
- **Picker (P3):** reuses the native datetime idiom (not a custom wheel) + minute steppers, with a
  **live duration preview** `(end − picked) − Σ pauses`, a **max-allowable hint** when a prior
  pause/switch caps the reach, and inline rejects (never modal). Save visible-but-disabled until valid.
- **Three-step validation (P4), in §05 order:** Risk C future (clamp at now) → Risk A after first
  pause/switch (**reject, never auto-prune**) → Risk B active-overlap (another active same-verb session
  → reject). Reject precedence is C→A→B.
- **Optimistic + 5s undo + realtime (P5):** `editStartedAt` is **verb-aware** — Sleep derives duration
  from `started_at` (just patch it); Eat absorbs the start-shift into the **first segment** so total
  stays `end − started` (live single-seg → move `segStart`; after a switch → first side's `perSideMs`).
  PostHog `activity_started_at_edited {verb, state_when_edited, from/to_time_iso, delta_seconds}`.
  Undo restores the prior `{started_at, details_json}` across every surface via realtime's existing
  reconcile path.
- **Eat switch markers:** `switchEat` now records `{at, from}` per switch — the basis for Risk A
  (before-first-switch) and the first-side recalc. jsonb, no schema.
- **Part 6 (#09 gap):** completed Sleep / Eat-นมแม่ `started_at` is now editable in the detail-sheet
  edit form via a new `WhenCard maxISO` cap = `min(ended_at, firstEvent)`; duration recomputes on save
  (Sleep via `sleepActiveMs`; Eat via the same first-side `perSideMs` absorb). Risk A + C apply; Risk B
  doesn't (a completed entry isn't active). Negative-duration impossible (capped at `ended_at`).

**Verification (demo, both themes, 390px)**
- **Sleep mid-session 9/9** — affordance visible; picker opens; **Risk C** +10 stepper disabled at now;
  recalc grows on −10m; **started_at moved ~10m**; **5s undo restored**; **Risk A** hint
  `ก่อนหยุดครั้งแรก`.
- **Eat mid-session 9/9** — affordance; recalc; move ~10m; **segStart tracks started_at** (single-seg
  extend); **switch marker recorded**; **Risk A** hint `ก่อนสลับข้างครั้งแรก`.
- **Risk B 3/3** — injected a concurrent active sleep → overlap error `ผู้ดูแลคนอื่น…` + **save disabled**.
- **Part 6 3/3** — completed sleep via Timeline → edit start −30m → recorded **0→30 นาที** → persists 30m.
- **AA both themes vs Designer:** affordance **6.14/7.24**, field/preview `--fg` **13.18/11.84 ·
  13.89/15.25**, sub `--fg-muted` **5.25/7.8**, **reject `--danger-text` 5.77/6.29 (exact)** — all ≥4.5.
  `tsc` clean, `next build` green.

**Locked items honored:** rejects are hard blocks (no auto-prune); `logged_by` = starter (untouched);
last-write-wins (no conflict UI); reused the idle picker idiom; affordance = text-link verb-strong.

**Handoff → PM:** PRD §0.1 owes (1) the one-line reversal note retiring the #11/#12 hide-while-running
rule, and (2) a mid-session-edit semantics subsection (the three reject rules + the completed-entry
extension via #09). Two FYI calls in `HANDOFF_dev_to_pm_14.md` (eat-duration model; completed-edit uses
the WhenCard cap, not the full inline-error picker). Then CPO picks the next polish target.

---

## 2026-06-07 — Dev — Growth (โต) polish + 4th verb-color token + theme-scope/BE-date systemic fixes (#13)

Per `HANDOFF_dev_13.md`. On `main` (`5ed1dff`), pushed to `nattaponkr/MiNom`. No schema change.

**Files:** `web/components/{GrowthScreen,GrowthDetailSheet(new),PercentileChart,Main}.tsx`,
`web/lib/sync/{repo,supabaseRepo,demoRepo}.ts`, `web/locales/th.json`,
`web/styles/{tokens,components}.css`.

**What shipped (5 parts)**
- **Detail sheet (P2):** new `GrowthDetailSheet` — a sibling of `ActivityDetailSheet` reusing the
  same `.ad-*` vocabulary (measurements aren't `Activity` rows, so a shared component would have
  forced a bad type union). Opens from **a history-row tap AND a chart-dot tap** (≥48px transparent
  hit slop added to `PercentileChart`). **แก้ไข** → inline pre-filled edit form (new
  `repo.updateMeasurement`, threaded through supabase + demo). **ลบรายการนี้** → confirm
  (`growth.detail.del*`) + **optimistic delete with 5s undo** (self-contained: optimistic remove →
  server delete → re-add on undo, since measurements aren't in the activity outbox). Always-visible
  **row trash removed** (parallel to Timeline #09).
- **Row hierarchy (P3):** `.gr-row` — bold mono value + sans unit over muted BE date. **No Δ chip**
  (PM dropped). Per-metric `ประวัติ` empty nudge (`.gr-empty`, tappable → add) when one metric has
  data and the other doesn't; true first-launch keeps the existing full-screen empty.
- **`--grow-strong` (P4):** 4th verb `-strong` token (light `0.53 0.14 18`; dark tracks soft).
  Chart trend line + dots repointed off soft `--grow` (failed **3.02** non-text) → `--grow-strong`.
  WHO caption repointed `--fg-faint` (**3.12**, failed text min) → `--fg-muted`. tokens.css principle
  comment extended to name `--grow-strong` as the 4th peer (the design-system `brand.css` stub is the
  Designer's untracked file — flagged for that workstream).
- **BE-date (P5a):** `GrowthScreen` history-row `formatDate()` → `formatDateBE()`. **Grep for other
  `formatDate()` misses surfaced exactly ZERO** — the only other reference is the `formatDate`
  definition in `format.ts`; every full-date display elsewhere already uses `formatDateBE` /
  `dateTimeBE`. The 2026-06-05 BE lock now holds product-wide.
- **Theme-scope (P5b):** verified the live SPA sets `data-theme` only on `document.documentElement`
  (root) via the layout theme-init + ThemeToggle — **no nested theme scopes in the user flow**, so
  `web/styles/tokens.css` needs no change (the brief predicted this). The nested-scope bug is
  preview-frame-only; the canonical fix belongs to the Designer's spec-doc `tokens.css` (which
  doesn't exist in this repo — the design HTML files are self-contained). **Did not edit the
  Designer's untracked spec docs** — flagged to PM.

**Verification (demo, both themes, 390px)**
- **Flow: 15/15.** first-launch empty → add ×2 → chart + history render → **BE date `7 มิ.ย. 2569`**
  (not 2026) → row tap → detail (ค่าที่วัด / วันที่วัด / บันทึกโดย คุณ) → **แก้ไข** prefilled →
  save updates chart+history → **chart-dot tap → detail** → **ลบรายการนี้ → confirm → undo toast →
  undo restores** → switch metric → **per-metric empty nudge** (`เพิ่มส่วนสูงครั้งแรก…`).
- **AA both themes (canvas-resolved vs Designer targets):** chart dot `--grow-strong` **5.67 / 7.29**
  (t 5.68/7.31; ≥3 non-text and ≥4.5) · WHO caption `--fg-muted` **5.25 / 7.8** (was 3.12 — now
  clears the 4.5 text min). `tsc` clean, `next build` green. Day summary unaffected (Growth not in it).

**Handoff → PM:** Two flags for you — (1) the design-system `brand.css`/`tokens.css` theme-scope root
fix is Designer-workstream (no shared token file in this repo; live product verified clean); (2)
`growth.detail.loggedBy` resolves the caregiver name via `listCaregivers` (id→name map), falling back
to `care.roleCaregiver` ("ผู้ดูแล") when a name isn't found — measurements carry no denormalized
logger name. Then CPO picks the next polish target.

---

## 2026-06-07 — Dev — Sleep pause/resume/complete shipped (#12)

First data-model change in the polish series, per `HANDOFF_dev_12.md`. On `main`
(`bfd79ad`), pushed to `nattaponkr/MiNom`. Migration ID **0006_sleep_paused**.

**Files:** `web/lib/types.ts`, `web/lib/sync/{repo,demoRepo,useActivityLog}.ts`,
`web/lib/activity.ts`, `web/lib/icons.tsx` (+IcPause), `web/components/{SleepSheet,
HomeScreen,Timeline,Main}.tsx`, `web/locales/th.json`, `web/styles/components.css`,
`web/supabase/migrations/0006_sleep_paused.sql`.

**What shipped (5 parts)**
- **Schema (P1):** `paused_at TIMESTAMPTZ NULL` added to **`public.activity`**. ⚠️ The brief
  said `ALTER TABLE activities` — the live table is singular `activity`; corrected in the
  migration. `details_json.pause_log[]` is in-JSON (no column). Additive + nullable → the
  Part-1c back-compat holds (existing rows default NULL = correct for running OR completed).
  **Not yet applied to live Supabase** — see Handoff below (no CLI/creds locally; one-liner ready).
- **State machine (P3):** `pauseSleep` (paused_at=now), `resumeSleep` (push
  `{paused_at,resumed_at}` to pause_log, clear paused_at), `stopSleep` = **complete-from-paused
  with `ended_at = paused_at`** (load-bearing — records *active* sleep, excludes the pause tail).
  Active duration = `(end − started_at) − Σ pauses` → `sleepActiveMs` in `lib/activity.ts`, now
  used by day-summary + timeline hierarchy so totals exclude resumed false-alarm wakes.
- **Sheet (P3):** idle / running (single **หยุด**, pause glyph — freezes, doesn't end) / paused
  (frozen elapsed + `เวลานอนสะสม · หยุดนับไว้ชั่วคราว` caption + **หลับต่อ** + **บันทึกการนอน**,
  equal-weight). แก้ไข idle-only. Notes draft Main-held, survives close + pause/resume.
- **Home + Timeline (P4):** active card / elevated row (today only), running shows **หยุด**, paused
  shows **หลับต่อ + บันทึก** — same `pause/resume/stop` handlers as the sheet (no separate path).
  Running = sleep-tinted-alive (pulsing dot); paused = calm-neutral-held (hollow static ring).
  Day-summary sleep hero ticks live / freezes paused / settles on complete.
- **i18n (P2):** `TH_SLEEP_POLISH` merged (12 keys). `sleep.stop` kept its string; handler rewired
  to pause. **Resume wording `หลับต่อ`** (locked). Normalized to the live dotted convention.

**Verification (demo mode, DemoRepo, 390px)**
- **Full-loop dry-run: 20/20 pass.** start → tick → close-persist → pause-from-Home → frozen
  (00:04 == 00:04) → reopen paused sheet → **resume continues, not reset** (00:04 → 00:05) →
  **multi-pause loop: `pause_log` accrued 2 entries** → complete-from-paused →
  **`ended_at === paused_at`** confirmed → Timeline completed row + no active row + undo toast.
- **Realtime: 4/4 pass.** Cross-tab (BroadcastChannel, same code path as Supabase `onUpdate` —
  now carrying `paused_at`): peer B reflects pause within ~1.5s, resume flips back; starter
  attribution (`logged_by_user_id`) preserved across pause/resume/complete. (Demo can't model two
  *distinct* caregivers — single localStorage identity — so this is cross-device, same-caregiver;
  prod two-caregiver uses the identical reconcile path.)
- **AA both themes (canvas-resolved, vs Designer targets):** หยุด white/strong **5.95 / 8.02**
  (t 5.99/7.97) · หลับต่อ strong/tint **5.04 / 5.85** (t 5.22/5.45) · หยุดชั่วคราว muted **4.98 /
  6.05** (t 4.99/6.02) · frozen elapsed --fg **13.18 / 11.84** (t 13.21/11.84) — **all ≥ AA 4.5**.
- **`--sleep-strong` confirmed** across all four states (text + white-on-fill); soft `--sleep`
  stays decorative (tints, held-ring). `tsc` clean, `next build` green.

**Asymmetry honored:** Eat stays a discrete tap-stop-saves event (PRD §0.1) — no pause model. Not unified.

**Handoff → PM/CPO:** **Live Supabase migration not yet applied** (no supabase CLI / DB creds
locally, and I don't read `.env`). It's additive + idempotent — safe to run anytime, before or
after deploy. Run in the Supabase SQL editor:
`alter table public.activity add column if not exists paused_at timestamptz null;`
Once applied, the three-state machine is live for real sessions (in-flight naps gain the new state
on their next หยุด tap — UX shift, not a regression). Then CPO picks the next polish target.

---

## 2026-06-06 — Dev — กิน sheet polish + session persistence + token discipline (#11/#11b)

Big architectural fold per `HANDOFF_dev_11.md` — bundled in one systemic pass. On `main`
(`6bdaaa4` + fix `d3c3afb`), live on Railway. Files: `web/locales/th.json`,
`web/styles/{tokens,components}.css`, `web/lib/{types,activity}.ts`,
`web/lib/sync/useActivityLog.ts`, `web/components/{EatSheet,WhenCard,SleepSheet,Sheets,Main,
HomeScreen,Timeline}.tsx`.

**What shipped**
- **Session persistence (P2):** นมแม่·จับเวลา is now a parent-held PERSISTED session (open-ended
  bm-timer row, `mode=bm capture=timer ended_at=null`), mirroring Sleep. `useActivityLog` gains
  `runningEat` + `startEat/switchEat/stopEat`; per-side accumulators + `segStart` live in
  `details_json` (no DB schema change). State machine: **tap a side → start**; **tap active side
  / CTA → stop+save** (optimistic + 5s undo); **tap other side → switch**; **close ≠ stop** (timer
  ticks from `started_at` across navigation). Bottom CTA reads **ปิด** idle / **หยุดและบันทึก**
  running. แก้ไข hidden while running; กรอกปริมาณ locked with hint; **notes draft** (Main-held)
  survives close; middle pill dropped. `logged_by` = starter.
- **Home active card (P3):** กิน · ● กำลังให้นม·side + live mono + หยุด/สลับข้าง quick actions.
- **Timeline active row (P4):** elevated row (today only; running session excluded from the
  completed list) + day-summary eat duration ticks live (tabular, no re-layout).
- **Token discipline (P5/5b):** `--eat-strong`/`--sleep-strong`/`--primary-strong` (light darker,
  dark tracks soft). Repointed text + white-on-fill: `btn-primary`, eat/sleep CTAs + status text,
  nav active tab — **retires the #08 ad-hoc nav value** for `--primary-strong`. Soft left for
  icons/tints/dots/borders. Verb-hue guardrail added to `tokens.css` (3rd systemic finding after
  #08 `--fg-faint` / #09 `--danger`).

**Verified** (light + dark, 360px, demo for full session control) — `tsc` clean, `next build` green:
- Tap-side starts; **PERSISTENCE: timer ticks from `started_at` across close + home↔timeline nav**
  (00:01→00:34 on the card; 00:02→00:05 on the row) — the critical proof. Switch flips side; stop
  ends the session + undo snackbar. Capture chip locked; แก้ไข hidden; notes draft survived
  close/reopen. Home active card + Timeline active row render with actions; day summary counts the
  live session. Screenshots `/tmp/minom_shots/E_home_active.png`, `E_tl_active.png`.
- **AA (measured) = Designer targets:** white-on-`--eat-strong` **5.40** light / 9.43 dark; active
  text 5.07 / 6.19 — all ≥ AA 4.5.

**Confirmed:** แก้ไข hidden while running ✓ · notes persist across close ✓ · capture chip locked ✓ ·
`--eat-strong`/`--sleep-strong`/`--primary-strong` adopted ✓ · #08 scoped nav fix retired ✓.

Note: the sheet-reopen-still-ticking proof was demo-blocked only by the Next.js dev-tools overlay
covering the home tab in the headless run; persistence is definitively shown by the live timer
surviving navigation on both the Home card and Timeline row (the sheet derives from the same
`runningEat` row). **Handoff → PM:** ready for the PRD §0.1 active-feeding-session semantics
(at-most-one-per-baby; `logged_by` = starter; parallels Sleep). Pick the next polish screen.

---

## 2026-06-05 — Dev — Day summary shipped + attribution dropped (#10)

Three-part fold per `HANDOFF_dev_10.md`, on `main` (`b98f72b`), live on Railway.
Files: `web/locales/th.json`, `web/lib/activity.ts`, `web/styles/components.css`,
`web/components/Timeline.tsx`.

**Done**
- P1 i18n: `timeline.summary.*` (eat/sleep/diaper/count/dur/durMin/volume/split), no removes.
- P2 day summary (`DaySummary` + `daySummaryStats`): a quiet `--surface-2` band under the
  day label, above the rows; recomputes on day-swipe; hidden on an empty day (verbs with no
  data omitted). Hero numbers, count-led: กิน = count + sub, นอน = total duration, ถ่าย =
  count + ฉี่/อึ split. **Eat sub per CPO refinement** — volume (formula + pumped-BM amounts)
  AND duration (BM-timer sessions); when both exist it **stacks** as two sub-lines (avoids
  crowding the 360px 3-col grid). Tabular mono numerals, decorative verb dots.
- P3 attribution drop: the row caregiver chip **and its reserved spacer** removed product-wide
  (`.tlr-noattr`); time sits alone. Who-logged-it now lives solely in the detail sheet
  (`timeline.detail.loggedBy`). Caregivers-screen chips untouched (meaningful there).

**Verified** (light + dark, 360px) — `tsc` clean, `next build` green, 13/13:
- Summary band shows กิน/นอน/ถ่าย; กิน hero `2 ครั้ง` with combined sub `["90 มล.","0 นาที"]`
  (the 0 นาที is the 2-second test timer — the volume+duration combine path works); ถ่าย sub
  `ฉี่ 2 · อึ 2`; rows carry no attribution chip/spacer; empty past day hides the summary.
- **AA (measured) = Designer targets:** hero `.dsum-n` 13.18/11.84 (target 13.21/11.84); sub &
  label `--fg-muted` 4.98/6.05 (target 4.99/6.02) — all ≥ AA 4.5 on `--surface-2`.

Single-dimension eat-sub cases (volume-only `{ml} มล.`, duration-only `{dur}`, solids-only =
no sub) and bottle-only/timer-only days are `daySummaryStats` branches (logic-verified); the
combined case (hardest) is dry-run-verified. The combined sub may still want a Designer eyeball
at 360px with real (multi-minute) durations — I pre-stacked it so it won't crowd.

No new Thai keys beyond the designer patch. **Handoff → PM:** Day summary shipped + verified at
the documented ratios; row attribution fully dropped (chip + spacer). Pick the next polish screen.

---

## 2026-06-05 — Dev — Timeline polish folded + danger-text app-wide (#09)

Four-part fold per `HANDOFF_dev_09.md`, on `main` (`a7e8c7e`), live on Railway.
Files: `web/locales/th.json`, `web/lib/format.ts`, `web/lib/activity.ts` (new),
`web/lib/sync/useActivityLog.ts`, `web/components/{Timeline,ActivityDetailSheet(new),
SleepSheet,Main,CaregiversScreen,GrowthScreen}.tsx`, `web/styles/{tokens,components,
globals,states}.css`.

**Done**
- P1 i18n: empty-state tightened (`ยังไม่มีบันทึก` / new body); `timeline.detail.*` +
  `swipeDelete` added; stale `timeline.empty.day` dropped.
- P2 behavior: row hierarchy (muted context + bold detail, `lib/activity.ts`); attribution
  suppressed when caregiver == previous row (reserved spacer keeps alignment); BE dates
  (`formatDateBE`/`dateTimeBE` via `th-TH-u-ca-buddhist`); day-nav chevron disabled state
  (right on today; left always enabled per PM lean).
- P3 detail sheet (`ActivityDetailSheet`): tap row → read-only entry + `แก้ไข` (reopens the
  per-verb sheet pre-filled — incl. a new completed-sleep edit mode) + `ลบรายการนี้` confirm;
  swipe-left quick delete; `ลบรายการแล้ว` toast. Always-visible row trash removed. Past-day
  deletes now persist (`log.remove` treats not-in-today as a server entry).
- P4 danger-text: `--danger-text` token (light darker clay / dark unchanged); repointed all
  danger TEXT bindings app-wide (btn-danger, form-error, input-help.err, cg-when.warn,
  inv-revoke, toast.err, Growth/Caregivers inline). `--danger` stays FILL-only. Guardrail
  comment added beside #08's in tokens.css.

**Verified** (light + dark, 360px) — `tsc` clean, `next build` green:
- Demo functional 9/9: row hierarchy, attribution anchor+suppress, tap→detail (แก้ไข+ลบ),
  BE date in detail, detail-delete→toast, swipe reveal, empty title.
- AA + BE 9/9 (measured): tlr-detail 14.56/13.36, tlr-ctx & tlr-time 5.5/6.83, danger-text
  `.ad-del` 6.04/5.51 — all ≥ AA 4.5; past-day section label `3 มิ.ย. 2569` (BE).
- Prod multi-caregiver (both Leon accounts): top rows `[พ่อ, คุณ, (suppressed)]` — different-
  caregiver rows show attribution, same-caregiver run suppressed. ✅✅

**Flag (CPO):** my test diapers on Leon were cleaned up, but two entries remain on today's
timeline — `นมผง · 90 มล.` (12:27) and `นอน · 2 นาที` (12:29). They predate my recent runs
(~15:47+) so I left them as likely-real data; if they're leftover from an earlier dry-run,
say the word and I'll delete them.

No new Thai keys beyond the designer patch. **Handoff → PM:** Timeline polish folded +
verified at the documented ratios. Pick the next polish screen.

---

## 2026-06-07 — PM — Growth chart real-WHO-LMS brief drafted (9th polish; substantive scope shift)

**What happened**
- CPO eyeballed live Growth chart with two measurements and rightly called out: the chart looks more decorative than useful. Four asks (axes, citation, age display, birthday — which we already collect).
- PM surfaced the underlying issue: adding WHO citation + readable axes to placeholder bands is internally inconsistent. Posed three-tier scope choice via AskUserQuestion.
- **CPO picked Tier 2** — bring forward the WHO LMS reference data work from the pre-public-launch queue. Real percentile curves; honest chart.

**Scope locked**
- Real WHO LMS data (boys + girls, weight-for-age + length/height-for-age).
- 5 percentile curves: 3/15/50/85/97 (WHO standard).
- X-axis: age in weeks (young) or months (older), smart switch.
- Y-axis: kg or cm based on selected metric tab.
- Today's-age marker as vertical line on x-axis.
- WHO Child Growth Standards citation (tappable to source).
- Sex-required graceful degrade (sex stays optional in PRD §5; show inline prompt when unset; no curves until set, no fake combined curves).

**PM calls in the brief**
- **Don't change PRD §5 lock** (sex stays optional at baby setup). Use graceful-degrade prompt instead.
- **Bundle WHO LMS data as static JSON** (~1MB compressed estimate). Always works offline. Dev's call on exact format.
- **No corrected-age for premature babies in v1.** Use actual age. Flag for future.
- **No predictions/projections, no PDF export, no BMI, no weight-for-length, no head circumference.** Out of scope.

**13 edge cases spec'd in brief** — including the non-obvious ones: sex set after measurements exist (re-render with curves, data points stay), measurement outside y-range (auto-expand, never hide), realtime multi-caregiver add (existing path), and the >60-month corner case (defer designed treatment).

**Effort estimate**
- Designer: ~2 days (substantial spec — 5+ states, percentile curve visual treatment, citation, prompt, AA, microcopy).
- Dev: ~3 days once Designer ships (LMS data bundle + LMS-to-percentile math + chart rendering + sex-prompt navigation + AA pass).

**Two parallel items now on hold**
- Diaper pick — wait until after chart lands.
- #12 smoke check — bundle with Dev fold (Dev will be exercising the multi-caregiver realtime path during chart work anyway).

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.
- This brief closes one of the major queued pre-public-launch items (WHO LMS data) early — net win even though it slows the polish cadence.

**Routing → Designer (`HANDOFF_designer_15.md`)** — multi-day target deliverable.

**Files**
- `HANDOFF_designer_15.md` — written.
- `JOURNAL.md` — this entry.
- `PLAN.md` — phase status + file map.

**Handoff → Designer (Claude Design)** via brief + CPO screenshot.

CPO: please route + attach the live chart screenshot.

---

## 2026-06-07 — PM — Dev #14 accepted; PRD §0.1 updated; recommending Diaper next + accepting smoke-check offer

**What happened**
- Dev shipped #14 clean — all 6 parts built; Sleep 9/9 + Eat 9/9 mid-session + Risk B 3/3 + Part 6 3/3 + AA both themes matching Designer targets exactly (reject text 5.77/6.29). Code on `main` (`5158f5a`). No blocker, no schema.

**PM confirmed both implementation calls**

1. **Eat accumulator-based duration with absorb-into-first-segment.** Right model. Sleep derives duration from `started_at`; Eat tracks per-side accumulators that tile the interval. Edit must grow the first segment to keep total + L/R split honest. New `switches: [{at, from}]` log in `details_json` (no schema; JSON addition) is clean and load-bearing for Risk A's "before first switch" check.
2. **WhenCard cap for completed-entry edit (Part 6) instead of duplicating the full TimeEditSheet.** Right weight. Mid-session needs inline-error picker (users actively pushing constraints); post-hoc correction just needs invalid-time prevention — cap does it without ceremony. Functional equivalence; lighter UX cost matches the surface.

**PRD §0.1 updated** — added "Mid-session start-time editing — semantics (added 2026-06-07)" subsection. Covers:
- Reversal note retiring #11/#12 hide-while-running (don't re-hide).
- Edit available in all 4 states; uniform "tap แก้ไข, pick time, duration recomputes" mental model.
- Three reject rules (Risk C → A → B → accept) with rationale.
- Completed-entry behavior via WhenCard cap (Risk B moot; A + C enforced).
- Eat accumulator-based duration model with absorb-into-first-segment semantics.
- `switches[]` shape in details_json.
- Last-write-wins; `logged_by_user_id` = starter unchanged; 5s undo; PostHog event payload.
- Code references for future devs.

**PM recommendation: Diaper as the next polish target.**
The only verb sheet not yet polished and the only verb with no timer — making it the cleanest "complete the verb-sheet polish" before Family / Settings. CPO has final say but I'd flag this as the natural next pick.

**Accepting Dev's #12 smoke-check offer.** ~60 seconds, cleans up after, no downside. Confirms two-distinct-caregiver realtime that demo single-identity can't exercise. Worth doing as defensive verification before more polish rounds compound on the timer behavior. Dev runs on the two Leon accounts whenever you signal.

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.
- After Diaper: Family/Caregivers + Settings + any net-new feature requests.

**Files updated**
- `PRD_EAT_v2.md` §0.1 — new subsection added.
- `JOURNAL.md` (this entry).
- `PLAN.md` — phase status + file map.

**Handoff → CPO** for (a) Diaper-or-other-pick confirmation, (b) smoke-check go-ahead.

---

## 2026-06-07 — Dev — Mid-session start-time editing + #09 detail-sheet gap closed (#14)

**Status:** Shipped + verified. On `main` (`5158f5a`), pushed. No blocker, no schema.

**What shipped (6 parts)**
1. TH_TIME_EDIT (16 keys) — affordance + picker + 3 rejects + undo.
2. Un-hide แก้ไข (Running + Paused) — text-link verb-strong on the เวลา card.
3. Picker (reuse idle idiom) — native datetime + steppers + live preview + max hint.
4. Three-step validation — C (future) → A (after pause/switch, no prune) → B (active overlap).
5. Optimistic + 5s undo + realtime + PostHog — verb-aware recalc; `activity_started_at_edited`.
6. #09 detail-sheet gap closure — started_at editable + duration recompute; Risk A+C (not B) via WhenCard cap.

**Two implementation calls flagged**
1. Eat duration is accumulator-based; absorb-into-first-segment to keep total + L/R split honest. New `switches: [{at, from}]` jsonb log in details_json — basis for Risk A "before first switch". No schema.
2. Completed-entry edit (Part 6) uses the existing #09 WhenCard with `maxISO = min(ended_at, firstEvent)` cap. Risk A + C enforced by cap; Risk B doesn't apply. Functionally equivalent to the reject rules; lighter UX.

**Verification (demo, both themes, 390px)**
- Sleep mid-session 9/9; Eat mid-session 9/9; Risk B 3/3 (concurrent active sleep injected → overlap error + save disabled); Part 6 3/3.
- AA both themes — แก้ไข affordance 6.14/7.24; reject `--danger-text` 5.77/6.29 exact match; field + duration preview `--fg` 13.18/11.84 + 13.89/15.25; picker sub-line `--fg-muted` 5.25/7.8. All ≥ AA 4.5. `tsc` clean, `next build` green.
- Realtime: same `runningEat`/`runningSleep` reconcile path #11/#12 already proved. Demo is single-identity; two-distinct-caregiver verification rolled into the offered #12 prod smoke-check.

**Handoff → PM (Claude).** PM owes: PRD §0.1 reversal note + mid-session-edit semantics subsection; confirm two implementation calls; pick next polish target. Plus the #12 prod two-caregiver smoke-check is still on offer.

---

## 2026-06-07 — PM — Time-edit polish accepted; #09 gap folded into Dev #14

**What happened**
- Designer's #14 drop landed clean. All edge cases handled with the three reject rules from PM's brief. Live prototype verifies edit → recalc → undo + all three rejects across Sleep + Eat-นมแม่.
- Files promoted: HANDOFF archived; JOURNAL_designer_14.md merged below + removed; all design source in `design/`.

**Three Designer flags — PM resolution**

1. **#09 detail-sheet gap (confirmed real)** — Designer flagged that the activity detail sheet's edit form for completed entries doesn't currently support editing `started_at` for Sleep / Eat-นมแม่. **PM folded into Dev #14 as Part 6.** Dev's already in the same data-model territory; one commit is cleaner than a separate fold. Same three reject rules apply to completed entries except Risk B (active overlap) doesn't fire since the entry isn't active; new reject for `newStartedAt > ended_at`.
2. **PRD §0.1 reversal note** — PM owes after Dev close-out. Queued.
3. **Affordance shape: text-link `แก้ไข` in verb-`-strong`** — accepted as-is. Matches idle behavior; low visual weight; discoverable.

**One Designer-caught defect logged** — undefined `-strong` / `--danger-text` tokens in their working environment; fixed by self-defining in `time_edit.css`. AA claims hold. Worth noting that the system-token discipline from #08/#09/#11/#11b/#13 hasn't fully centralized in the Designer's spec docs yet. Not worth a follow-up unless it bites again.

**Routing → Dev (`HANDOFF_dev_14.md`)** — six parts:
1. Patch merge (12 keys, no removes).
2. Un-hide `แก้ไข` on the `เวลา` card during Running + Paused for Sleep + Eat-นมแม่.
3. Wire the picker (reuse idle back-dating picker; new constraint set).
4. Three-step validation: Risk C → Risk A → Risk B → accept.
5. Optimistic save + 5s undo + realtime propagation + PostHog `activity_started_at_edited` event.
6. Extend #09 detail-sheet edit form to cover `started_at` for completed Sleep / Eat-นมแม่ entries (Designer flag #1).

**PM owes after Dev close**
- PRD §0.1 one-line note retiring the #11/#12 hide-while-running rule.
- PRD §0.1 mid-session-edit semantics subsection (parallel structure to active-feeding-session + Sleep three-state).

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.
- After this round, remaining candidates: **Diaper** (the only verb with no timer — likely the next pick), Family/Caregivers, Settings.

**Handoff → Dev (Claude Code)** via brief.

CPO: please route.

---

## 2026-06-07 — Designer — Mid-session start-time editing shipped (#14)

**Scope:** Reinstate `แก้ไข` on the `เวลา` card during Running + Paused for Sleep + Eat-นมแม่ timer modes. Reverses the #11/#12 hide-while-running call. CPO was right — parents start the timer late.

**Deliverable:** `ละมุน Time Edit.html` — 7 sections, light + dark, live prototype.

**The reversal**
Hidden in #11/#12 on a theoretical argument; reinstated for the real lag (settle baby → reach for phone). Reuses the idle back-dating picker (PRD §4); affordance is a text-link `แก้ไข` in the verb-`-strong` color.

**The three rejects (CPO's ask) — hard blocks, inline, never auto-prune**
- Risk A · after first pause/switch — `started_at` can't pass the first `pause_log[].paused_at` (Sleep) / first side-switch ts (Eat). Inline error + a max-allowable hint showing `min(firstEvent, now)`. Don't prune.
- Risk B · active overlap — `[T, now]` overlapping another active session (same baby+verb) blocks; overlap with completed entries is allowed.
- Risk C · future — clamp at `now`.
- D last-write-wins (no conflict UI); E Paused same logic; G notes untouched.

Save visible-but-disabled until valid; reject inline, never modal. Live duration preview in the picker.

**Recalc + undo**
Optimistic write → propagates to sheet timer, Home card, Timeline row, Eat day-summary live duration, other caregivers (~1.5s). 5s toast `เปลี่ยนเวลาเริ่มแล้ว · เลิกทำ` restores previous value everywhere.

**Rejection-logic diagram (§04):** `T > now?` → `T > first pause/switch?` → `[T,now] overlaps active?` → accept. Built for Dev's validation wiring.

**AA gate passed both themes.** Full table §06. One verification defect caught and fixed locally (undefined `-strong` / `--danger-text` in spec doc env; time_edit.css now self-defines them).

**Flags for PM**
1. #09 gap (your optional sanity check) — confirmed likely a gap. The #09 detail-sheet edit form (completed entries) was specced with value + date. For completed Sleep / Eat-นมแม่ entries it should also edit `started_at` (→ duration), for parity. Recommend a small follow-up.
2. Reversal note — retires the #11/#12 hide-while-running rule; one-line PRD §0.1 note.
3. Affordance shape — text-link `แก้ไข` in verb-strong (matches idle card).

**Handoff → PM (Claude).** Accept + route the Dev fold; confirm the #09 start-time-edit gap as a follow-up; one-line PRD §0.1 note retiring hide-while-running.

---

## 2026-06-07 — PM — Mid-session start-time editing brief drafted (8th polish; spans Sleep + Eat-นมแม่)

**What happened**
- CPO surfaced a real product gap: users record activities AFTER the fact (delay of minutes to hours), but the current Sleep + Eat-นมแม่ sheets HIDE `แก้ไข` while running. That decision (from #11/#12) was based on a theoretical "mid-session editing is weird" argument that turned out to be wrong for the real-world use case.
- **Reverting the hide decision carefully.** Bring `แก้ไข` back on the `เวลา` card during Running and Paused states. Duration recalculates live. Persistence + realtime sync work as before. The design weight is in edge cases.

**One brief covers two surfaces** — Sleep timer (Phase 3 + #12) and Eat นมแม่ timer mode (Eat v2 + #11) share the same mechanics with one small asymmetry (side switches on Eat).

**Edge cases spec'd in the brief** (CPO explicitly asked for careful thinking on these)

| Risk | PM call |
|---|---|
| A · Forward adjustment past existing pause_log entry (Sleep) or side-switch (Eat) — would invalidate state | **Reject the save** with inline error; never auto-prune (silent data loss) |
| B · Editing into overlap with another caregiver's active session for same baby + verb | **Reject the save** — protects the PRD §0.1 "at most one active session per baby" invariant |
| C · Forward beyond `now` | **Clamp at now** in the picker (no negative duration) |
| D · Multi-caregiver simultaneous edit | Last-write-wins per existing pattern; no special UI |
| E · Editing during Paused state | Same logic as Running; duration formula handles it cleanly |
| F · Editing after Complete | Out of scope (already supported via #09 detail sheet) |
| G · Notes draft | Unaffected; don't clear on edit |

**Reject-on-Risk-A is the most non-obvious call.** The alternative — auto-pruning pause_log or side-switch entries that would no longer fit — silently loses data. PM lean: explicit reject + inline error tells the user what's wrong without breaking their model.

**Routing → Designer (`HANDOFF_designer_14.md`)** — multi-day target deliverable: spec for both surfaces, state diagram of the reject logic, AA audit, microcopy patch, real-phone screenshots of all three reject states.

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.
- After Dev close-out, PM owes a small PRD §0.1 subsection codifying the editing-while-running semantics + three reject rules. Parallel to active-feeding-session and Sleep three-state subsections.

**Polish series remaining candidates after this round:** Diaper (the only verb with no timer), Family/Caregivers, Settings.

**Handoff → Designer (Claude Design)** via brief.

CPO: please route.

---

## 2026-06-07 — PM — #13b closed; #12 migration confirmed live; standing by for next-screen pick

**What happened**
- Designer closed `HANDOFF_designer_13b_theme_scope.md` — spec-doc theme-scope fix applied across #07–#13 HTML files. Page-level dark-mode toggle no longer bleeds into embedded `data-theme="light"` previews.
- CPO confirmed the #12 Supabase migration (`paused_at` column) is applied on prod. Sleep pause/resume fully live server-side.

**State of the world**
- 7 polish rounds shipped + 2 small follow-ups (#11b sibling tokens, #13b spec-doc theme-scope) all done.
- All carry-overs from #12/#13 closed.
- 4 verb-color `-strong` tokens in the design system.
- 3 system-level guardrails documented in `brand.css`.
- 2 PRD §0.1 semantic principles documented (active-feeding-session; Sleep three-state + Eat/Sleep asymmetry).
- BE-date lock verified product-wide (grep clean).

**Next baton: CPO — eyeball live + pick next polish target.**
Same discipline as prior cycles. Remaining candidates: Diaper sheet, Family/Caregivers, Settings.

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.
- Pre-public-launch queue: WHO LMS data, hard-delete edge function, legal review of PRIVACY_TH.md, lamoon.app domain registration, Resend domain verification.
- Phase 5 LINE design queued behind beta validation.

---

## 2026-06-07 — PM — Dev #13 accepted; confirmed 2 decisions; tiny Designer follow-up for spec-doc theme-scope

**What happened**
- Dev shipped #13 clean — 15/15 flow verified, AA hits Designer targets, `--grow-strong` and `--fg-muted` repointing all clear. Code on `main` (`5ed1dff`). No blockers; no schema change.
- **BE-lock grep result is the structural win of the round:** GrowthScreen row was the ONLY `formatDate()` miss; grep across the product confirmed no others. The 2026-06-05 lock is holding everywhere except where it just got fixed.

**Two decisions Dev surfaced; PM confirmed both**

1. **Theme-scope spec-doc fix → Designer.** ✅ My #13 brief was wrong about the architecture — pointed at `design/tokens.css` as canonical but that file doesn't exist in the repo. Dev correctly identified the bug as preview-frame-only (Designer-owned spec-doc HTML, not product code) and verified the live SPA has no nested theme scopes. **Brief miss on PM's part; Dev caught it.** Wrote `HANDOFF_designer_13b_theme_scope.md` — tiny ~15-min ask for Designer to backport the canonical fix to #11/#12 spec docs.
2. **`loggedBy` resolution via `repo.listCaregivers`, not denormalization.** ✅ Dev's read is right — the id→name map with `care.roleCaregiver` fallback is clean; the cost (extra lookup) is negligible at beta scale. No schema change. If we ever do bulk export/analytics we revisit.

**Notable Dev implementation choices logged (FYI)**
- `GrowthDetailSheet` is a sibling component, not the same as `ActivityDetailSheet` (measurements aren't `Activity` rows; reusing the `.ad-*` CSS vocabulary instead of forcing them into the type). Same look, Growth data.
- New `repo.updateMeasurement` method (threaded supabase + demo) — no edit path existed for measurements before.
- Delete is optimistic + 5s undo self-contained in GrowthScreen (measurements aren't in the activity outbox).
- Chart dots: ≥48px transparent hit slop over 4.5px visual mark, grow-strong focus ring for keyboard.

**Dev's reminder logged**
- #12's Supabase migration (`alter table public.activity add column ... paused_at`) is still pending CPO action. Sleep pause/resume isn't fully live server-side until the migration runs. Unrelated to #13 but worth resurfacing in case it got lost in the flow.

**Files**
- `HANDOFF_designer_13b_theme_scope.md` — small Designer follow-up.

**Two parallel batons**
- **Designer:** apply spec-doc theme-scope fix to #11/#12/#13 HTML files (~15–20 min, scoped to Designer's workstream, no Dev involvement).
- **CPO:** run the one-line Supabase migration from #12 (if not already done — was queued in `HANDOFF_dev_to_pm_12.md`). 60-second smoke check after.

**State of the polish series**
- 7 polish rounds shipped + 2 small follow-ups (#11b sibling tokens, #13b spec-doc theme-scope).
- 4 verb-color `-strong` tokens in the design system.
- 3 system-level guardrails + 2 PRD §0.1 semantic principles documented.

**Next CPO action after the two parallel items:** eyeball live + pick next polish target. Remaining candidates: Diaper sheet, Family/Caregivers, Settings.

CPO: please route the Designer follow-up + verify #12 migration status.

---

## 2026-06-07 — Dev — Growth (โต) polish shipped (#13)

**Status:** Shipped + verified. On `main` (`5ed1dff`), pushed to `nattaponkr/MiNom`. No blocker, no schema change.

**What shipped (5 parts)**
1. TH_GROWTH_POLISH (12 keys) — growth.detail.* + growth.historyEmpty.*; no removes.
2. Growth detail sheet (reuse #09) — row-tap AND chart-dot-tap → detail; แก้ไข + ลบ+confirm+undo.
3. Row hierarchy (no Δ chip) — bold mono value + muted BE date; per-metric empty nudge.
4. `--grow-strong` token — chart line+dots + WHO caption repointed; AA-clears.
5a. BE-date propagation — GrowthScreen fixed; grep found no other misses.
5b. Theme-scope root fix — verified, no live change (see flag below).

**Two decisions Dev made**
1. Theme-scope: `design/tokens.css` doesn't exist; spec docs use inline `<style>`. Live SPA has no nested theme scopes (clean). Bug is preview-frame-only — fix belongs to Designer's spec-doc workstream, not Dev's product code. Deliberately did not edit Designer's untracked HTML/CSS.
2. `growth.detail.loggedBy` name resolution: measurements have no denormalized logger name; resolved via `repo.listCaregivers` id→name map, falling back to `care.roleCaregiver`, self → "คุณ". Avoids schema change. Read: not worth denormalizing at beta scale.

**Verification (demo mode, both themes, 390px)**
- Flow 15/15: first-launch empty → add ×2 → chart + history → BE date 7 มิ.ย. 2569 → row tap → detail (value/date/บันทึกโดย คุณ) → แก้ไข prefilled → save updates → chart-dot tap → detail → ลบรายการนี้ → confirm → undo toast → undo restores → switch metric → per-metric empty nudge.
- AA both themes: chart trend `--grow-strong` 5.67/7.29 (target 5.68/7.31; was `--grow` 3.02 ✗); WHO caption `--fg-muted` 5.25/7.8 (target 5.52/6.84; was `--fg-faint` 3.12 ✗). All clear. `tsc` clean, `next build` green.
- BE-lock product-wide: GrowthScreen was the only `formatDate()` miss; grep found no others.

**Notable implementation choices**
- GrowthDetailSheet is a sibling of ActivityDetailSheet, not the same component.
- New `repo.updateMeasurement` method.
- Delete is optimistic + 5s undo, self-contained in GrowthScreen.
- Chart dots: ≥48px hit slop over 4.5px visual mark.

**Note:** #12's Supabase migration still pending CPO. Sleep pause/resume isn't fully live server-side until it runs.

**Handoff → PM (Claude).** Confirm two decisions, route spec-doc fix to Designer, pick next polish target.

---

## 2026-06-07 — PM — Growth polish accepted; 4 decisions settled; routing Dev (4th verb-color + 2 systemic fixes)

**What happened**
- Designer's #13 drop landed clean. All five Growth polish items addressed + two pre-existing systemic issues surfaced + four PM decisions routed.
- Files promoted: HANDOFF archived; JOURNAL_designer_13.md merged below + removed; all design source in `design/`.

**Four decisions PM settled**

1. **`--grow-strong` over `--primary-strong` (Designer's override accepted).** Designer's reasoning is right: clay would merge Growth into the brand identity AND collide with `--eat`'s orange-clay hue. Each verb deserves its own `-strong` token. Consistent with the system (we now have `-strong` for all four verbs). Adding to `tokens.css` alongside the existing three.

2. **Theme-scope bug: root fix.** Designer caught a pre-existing CSS scoping issue (#11/#12/#13) where a page-level dark-mode toggle bled into embedded `data-theme="light"` previews. Designer fixed locally in #13; PM routed Dev to apply at the root in `design/tokens.css`. Retroactively fixes #11/#12 spec docs without re-deploying. The live product likely isn't affected (no nested theme scopes in prod), but Dev verifies.

3. **BE-date miss: fold into Dev #13 + grep.** `GrowthScreen.tsx` calls `formatDate()` (Gregorian) where it should call `formatDateBE()`. Lock is from 2026-06-05; clearly didn't propagate everywhere. Dev fixes + greps for other instances. Worth knowing if there are more.

4. **Δ chip: dropped.** Chart already shows trajectory; per-row Δ depends on irregular measurement intervals and risks misleading. Brand voice prefers less. Easy to add back if beta users ask.

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.

**State after this fold**
- 7 polish rounds shipped (Home → Home contrast → Timeline → Day summary → กิน sheet/sibling tokens → นอน pause/resume/complete → โต/4th verb token/systemic fixes).
- Four verb-color `-strong` tokens in the design system (`--eat-strong / --sleep-strong / --primary-strong / --grow-strong`).
- Three system-level guardrails in `brand.css` (#08 / #09 / #11+#11b / #13 extends).
- Two PRD §0.1 semantic principles (active-feeding-session 2026-06-06; Sleep three-state + Eat/Sleep asymmetry 2026-06-06).

**Files**
- `HANDOFF_dev_13.md` — written; 5-part fold including the two systemic fixes.

**Handoff → Dev (Claude Code)** via `HANDOFF_dev_13.md`.

CPO: please route.

---

## 2026-06-07 — Designer — Growth (โต) polish shipped (Handoff #13 return)

**Scope:** Handoff #13 — โต polish + two systemic fixes Designer caught during the audit. Reuses the #09 detail-sheet pattern; no schema.

**Deliverable:** `ละมุน Growth Polish.html` — 6 sections, light + dark, live interactive prototype verified.

**The five**
1. Edit affordance (CPO headline) — ประวัติ row → reused #09 detail sheet; แก้ไข primary (inline pre-filled form) + ลบรายการนี้ quiet behind the #09 confirm; always-visible row trash removed. Both น้ำหนัก + ส่วนสูง.
2. Row hierarchy — bold tabular value + sans unit over muted BE date.
3. Per-metric empty — keeps ประวัติ header + tappable dashed card → add flow.
4. Tappable dot — same detail sheet as the row; ≥48×48 hit target; focus + value preview.
5. AA — two real fixes: data point was `--grow` at 3.02:1 → new `--grow-strong` (5.68/7.31); WHO caption `--fg-faint` 3.12 → `--fg-muted` 5.52.

**Decisions routed to PM**
1. `--grow-strong` vs `--primary-strong` — chose `--grow-strong` (growth keeps its own verb identity; clay would merge it into the brand + collide with eat's hue).
2. Theme-scope bug (pre-existing #11/#12/#13) — fixed locally; recommend root fix in `tokens.css`.
3. BE-date miss — GrowthScreen uses `formatDate()` (Gregorian) not `formatDateBE()`.
4. Δ chip — keep "+0.4 กก." or drop as noise?

**Patches:** `th-strings-growth-polish-patch.js` (growth.detail.* + historyEmpty.*) + `tokens-grow-strong.css`. No schema.

**Handoff → PM (Claude).** Settle the four decisions, route the ~1h Dev fold (reuse #09 sheet, repoint row trash, row hierarchy, tappable dot, `--grow-strong` + caption AA, BE-date fix), adopt `--grow-strong` into tokens.css.

---

## 2026-06-07 — PM — Growth (โต) polish brief drafted (7th in series)

**What happened**
- CPO eyeballed live โต and surfaced one ask: ประวัติ entries need an edit affordance (only delete today).
- PM added four more for structural consistency with the existing polish series. Five items total.

**The five**
1. (CPO) Edit affordance for ประวัติ — parallel to Timeline #09. Tap row → detail sheet with แก้ไข + ลบ-with-confirm. Always-visible trash gone.
2. Row hierarchy mirrors Home + Timeline — bold value + muted date (BE format already locked).
3. Empty state for ประวัติ when zero entries.
4. Chart data point becomes tappable → same detail sheet. Two paths, one destination.
5. AA pass — with one specific check: confirm the data point color isn't bound to `--danger` (it's red in the screenshot; semantically wrong for a chart data point). Lean: repoint to `--primary-strong`.

**Explicitly NOT in scope** (flagged so Designer doesn't expand)
- Chart axis numeric labels (real gap, but tied to WHO LMS reference data work queued for pre-public-launch).
- Head circumference (cut in v0.2).
- Unit toggle (metric locked).

**Routing → Designer (`HANDOFF_designer_13.md`)** — half-day to one-day target. Reuses the Timeline #09 detail sheet component.

**Carry-overs unchanged**
- #12 Sleep state machine fully live after CPO ran migration + smoke check (logged below).
- Beta still OPEN; first invites still paused on polish series completing.

**Handoff → Designer (Claude Design)** via brief + CPO screenshot.

CPO: please route + attach the screenshot.

---

## 2026-06-07 — PM — Dev #12 return accepted; routing CPO migration + smoke check

**What happened**
- Dev shipped #12 clean: 20/20 functional, 4/4 realtime, AA matches Designer targets, multi-pause loop proven (`pause_log` accrues correctly), `ended_at = paused_at` semantics asserted in code. Code on `main` (`bfd79ad`).
- Dev caught and silently fixed a brief error: HANDOFF_dev_12.md's migration SQL said `ALTER TABLE activities` (plural) but the live table is `public.activity` (singular). Dev's shipped migration `0006_sleep_paused.sql` uses the correct name.
- **Spec self-check:** PRD §0.1's active-feeding-session subsection already correctly used singular `activity` (line 48). Dev's flag was about the brief, not the PRD. Brief is archived; no spec rewrite needed. Learning logged for next data-model brief.

**PM accepted as delivered.** Two CPO actions outstanding before #12 is fully live:
1. **Run the one-line migration in Supabase SQL editor:** `alter table public.activity add column if not exists paused_at timestamptz null;` — additive, nullable, idempotent. No data-loss path.
2. **60-second two-caregiver smoke check** on prod (Dev's recommendation since demo mode is single-identity). Walkthrough provided to CPO in chat.

**PM decision on Dev's open question — no backfill.**
Dev asked: should we backfill the (rare) sleep rows that may have been split into two entries *before* pause existed? Their read: no, not worth at beta scale, no clean heuristic. **PM agrees:** no real users in the cohort yet (beta paused on polish series), no clear merge rule, forward-only. Logged as a decision.

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.

**State after Action 1+2 above:**
- #12 fully live (state machine + Home/Timeline quick actions + first data-model change).
- Six polish rounds shipped: Home → Home contrast + global-nav + system guardrail → Timeline → Timeline day summary → กิน sheet + sibling tokens → นอน pause/resume/complete.
- Three systemic design-system principles documented in `brand.css` (#08/#09/#11/#11b).
- Two PRD §0.1 semantic principles documented (active-feeding-session 2026-06-06; Sleep three-state + Eat/Sleep asymmetry 2026-06-06).

**Next baton after CPO confirms smoke check:** CPO — eyeball live + pick next polish target. Remaining candidates: Diaper sheet, Growth, Family/Caregivers, Settings.

---

## 2026-06-07 — Dev — Sleep pause/resume/complete shipped (#12)

**Status:** Shipped + verified. On `main` (`bfd79ad`), pushed to `nattaponkr/MiNom`. **Blocker for "live":** one action needed from CPO — apply migration to live Supabase.

**What shipped (5 parts)**
1. Migration `paused_at` + `pause_log[]` — `0006_sleep_paused.sql`; table-name corrected to `public.activity`; pause_log in `details_json`.
2. `TH_SLEEP_POLISH` (12 keys) — `sleep.stop` string kept, handler rewired to pause; `หลับต่อ` locked.
3. Three-state machine (sheet + `useActivityLog`) — `pauseSleep` / `resumeSleep` / `stopSleep`; `ended_at = paused_at` (load-bearing).
4. Home card + Timeline row (running + paused) — same handlers as sheet; day-summary ticks/freezes/settles.
5. `--sleep-strong` verification — all four states; AA measured both themes.

**Load-bearing semantics confirmed in code + test:** active sleep = `(end − started_at) − Σ pauses`. Threaded through day-summary and Timeline totals.

**Asymmetry honored:** Eat remains a discrete tap-stop-saves event. No pause model added to Eat. Not unified.

**Two items needing PM attention**
1. Schema name correction (already handled in migration; PRD/spec fix flagged for next data-model brief).
2. Live Supabase migration NOT yet applied — Dev has no CLI/creds/.env. Additive + nullable + idempotent — safe anytime.

**Verification (demo mode, DemoRepo, 390px)**
- Full loop 20/20: start → tick → close-persist → pause-from-Home → frozen → reopen paused sheet → resume continues (not reset) → multi-pause loop (`pause_log` 2 entries) → complete-from-paused (`ended_at === paused_at` asserted) → Timeline completed row + no active row + undo toast.
- Realtime 4/4: cross-tab `paused_at` propagation via BroadcastChannel; peer reflects within ~1.5s; starter `logged_by_user_id` preserved across pause/resume/complete. *Caveat:* demo is single-identity, so this proves cross-device same-caregiver. Two-distinct-caregiver realtime needs prod smoke-check post-migration.
- AA both themes: all measured ratios match Designer targets (within fractional decimal). `tsc` clean, `next build` green.

**Open question for PM:** backfill consideration for pre-pause split entries? Dev read: no — not worth at beta scale, no clean heuristic.

**Handoff → PM (Claude).** Route CPO migration + smoke check; pick next polish target.

---

## 2026-06-06 — PM — #12 accepted; PRD §0.1 locked Sleep semantics + Eat/Sleep asymmetry; routing Dev

**What happened**
- Designer's #12 drop landed clean — six items + the new state machine + AA gate + interactive prototype verified manually (automated verifier hit a 502 infra blip; not a real finding).
- Files promoted: HANDOFF archived, JOURNAL_designer_12 merged below + removed, all design source in `design/`.

**PM accepted as delivered.** Three decisions resolved:

**1. Eat/Sleep asymmetry locked in PRD §0.1.** Added two new subsections:
- "Sleep three-state semantics" — Running / Paused / Complete with data shapes; `ended_at = paused_at` on complete-from-paused (records active duration, not wall-clock); active duration formula.
- "Eat vs Sleep asymmetry — the principle" — Eat = discrete event (stop-saves + 5s undo); Sleep = continuous state with brief interruptions (pause = false-alarm wake handling). Explicit "do not unify" instruction with the record-integrity rationale (one nap = one Timeline entry).
- Both parallel the active-feeding-session subsection from 2026-06-06.

**2. Resume wording: `หลับต่อ` confirmed** (Designer's call over PM's brief proposal `กลับไปจับเวลา`). Designer was right — `หลับต่อ` matches the parent's mental model; `กลับไปจับเวลา` sounds like a machine.

**3. Schema sign-off:** `paused_at TIMESTAMP NULL` + `details_json.pause_log[]`. First real data-model change in the polish series. Back-compat plan explicit in the Dev brief:
- Migration: `ALTER TABLE activities ADD COLUMN paused_at TIMESTAMPTZ NULL;` — no backfill needed.
- Existing completed rows: unaffected.
- In-flight sleep sessions at deploy: next `หยุด` tap enters new paused state (UX shift, no data corruption).
- No data loss path identified.

**Routing → Dev (`HANDOFF_dev_12.md`)** — five parts, ~3–4h:
1. Migration (paused_at column).
2. Patch merge (~12 keys; `sleep.stop` keeps string, handler rewires end→pause).
3. State machine in `SleepSheet.tsx` + `useActivityLog.ts` (new `pauseSleep`/`resumeSleep`; `stopSleep` now means complete-from-paused).
4. Home + Timeline active components for running AND paused states.
5. Verify `--sleep-strong` correctly applied in new states (Designer says already repointed).

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.

**Handoff → Dev (Claude Code)** via `HANDOFF_dev_12.md`.

CPO: please route.

---

## 2026-06-06 — Designer — Sleep pause/resume/complete shipped (Handoff #12 return)

**Scope:** Handoff #12 — Sleep gets quick-action parity with Eat #11, plus the substantive new piece: a pause/resume/complete state machine. `หยุด` now *freezes* the nap (pause glyph, not stop square) instead of ending it — from paused you `หลับต่อ` or `บันทึกการนอน`. Keeps one nap as one Timeline entry through false-alarm wakes.

**Deliverable:** `ละมุน Sleep Polish.html` — 7 sections, light + dark, with a live interactive prototype (start → close to Home → pause → resume/complete, session persists throughout).

**The six**
1. Home active card — running Sleep card gains a หยุด chip (parity with Eat #11).
2. Timeline active row — elevated row above today's entries, same action. Today-only.
3. Pause/resume/complete state machine — the new model.
4. Microcopy — `หยุดชั่วคราว` paused status; resume `หลับต่อ`; complete `บันทึกการนอน` / `บันทึก`.
5. Paused visual — running = sleep-tinted + pulsing dot; paused = calm neutral + hollow held ring + frozen elapsed. Two equal-weight chips.
6. Persistence + edit-hidden + notes — same disciplines as Eat #11; mirrors the live SleepSheet parent-held running prop.

**State machine (§05)**
```
Idle ─เริ่ม─▶ Running ⇄ (หยุด / หลับต่อ) Paused ─บันทึกการนอน─▶ Complete
```
- Running: `paused_at NULL, ended_at NULL` — live tick.
- Paused: `paused_at NOT NULL` — frozen elapsed, `pause_log[]` accrues.
- Complete: `ended_at = paused_at` (PM lean — records active sleep, excludes pause tail).
- Active duration = (now − started_at) − Σ pauses. Sheet open/close never advances the machine.

**AA gate (both themes, true sRGB).** New paused text: `หยุดชั่วคราว` `--fg-muted`/surface-2 4.99 / 6.02; frozen elapsed `--fg` 13.21 / 11.84; `หลับต่อ` `--sleep-strong`/sleep-tint 5.22 / 5.45; running `หยุด` white-on-`--sleep-strong` 5.99 / 7.97. All clear AA. `--sleep-strong` (#11b) already repointed.

**For Dev**
- Patch: `th-strings-sleep-polish-patch.js` — TH_SLEEP_POLISH. Existing `sleep.stop` keeps its string; rewire handler end→pause.
- Schema: `paused_at TIMESTAMP NULL` + `details_json.pause_log[]`; `started_at` immutable.
- Client-side: tap semantics, persistence, paused visual, hide-edit, notes-draft, Home/Timeline surfaces.

**Flags for PM**
1. Lock the Eat/Sleep asymmetry in PRD §0.1 with the record-integrity rationale.
2. Resume wording — chose `หลับต่อ` over literal `กลับไปจับเวลา` (warmer, brand-voiced).
3. Schema sign-off — `paused_at` + `pause_log`.

**Handoff → PM (Claude).** Accept + lock the asymmetry in PRD §0.1; route the Dev fold.

---

## 2026-06-06 — PM — Sleep polish brief drafted (6th in series); pause/resume/complete is the substantive new pattern

**What happened**
- CPO eyeballed live Home and surfaced two things: (a) Sleep is missing quick-action parity with Eat #11 (no `หยุด` on Home/Timeline), and (b) a new pause/resume/complete state machine specific to Sleep.
- Routing as `HANDOFF_designer_12.md`. CPO will attach the screenshot.

**The six**
1. Sleep Home active card quick action (parity with #11 Eat) — single `หยุด` chip (no switch; Sleep has no sides).
2. Sleep Timeline active row + same quick action (parity).
3. **Pause/Resume/Complete state machine (new)** — three states with explicit data semantics. Schema lean: add `paused_at` TIMESTAMP NULL to sleep row; pause-log in `details_json`; on complete-from-paused, `ended_at = paused_at` for accurate "when nap ended" recording.
4. Microcopy: `หยุด` (initiates pause), `หยุดชั่วคราว` (state label), `กลับไปจับเวลา` or `หลับต่อ` (resume), `บันทึกการนอน` (complete). Designer finalizes.
5. Paused state visual treatment across sheet / Home / Timeline.
6. Persistence + edit affordance + notes — same disciplines as Eat #11 (no re-litigation).

**Locked in the brief: Eat does NOT get the pause model.**
Worth flagging the rationale clearly because it's an intentional asymmetry between two timer verbs:
- **Eat = discrete event.** "She ate 90 mL." Stop = done. 5s undo handles accidents.
- **Sleep = continuous state with potential brief interruptions.** False-alarm wakes are real; without pause, every false alarm would split one nap into two Timeline entries — wrong as a record of the day.

The asymmetry is real product semantics, not arbitrary inconsistency. PM will codify this in PRD §0.1 as a principle when this brief lands.

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.
- Token discipline (`--sleep-strong` etc.) from #11b applies — Designer references it; Dev verifies in new states.

**Files**
- `HANDOFF_designer_12.md` — written; 6 items + state machine + AA gate baked in.

**Handoff → Designer (Claude Design)** via brief + CPO screenshot.

CPO: please route + attach the live screenshot.

---

## 2026-06-06 — PM — #11/#11b accepted; PRD §0.1 updated with active-feeding-session semantics; standing by for next-screen pick

**What happened**
- Dev folded #11 + #11b in one systemic commit (`6bdaaa4` + fix `d3c3afb`). All five parts shipped:
  - Patch merged; idle/running surfaces distinct; tap-side-to-toggle wired.
  - Session persistence as a parent-held running prop on `Main`, mirroring Sleep. State machine landed exactly per spec — close ≠ stop; timer ticks from `started_at` across navigation.
  - Home active card + Timeline active row + day-summary live-tick all working.
  - Token discipline applied: `--eat-strong` / `--sleep-strong` / `--primary-strong` repointed across text + white-on-fill; soft variants retained for decorative; **#08 scoped nav fix retired** (as Designer specified in 11b).
- AA measurements match Designer's targets: white-on-`--eat-strong` 5.40 light / 9.43 dark; active text 5.07 / 6.19. All ≥ 4.5.
- One small caveat noted by Dev: the literal "sheet close → reopen → still ticking" was demo-blocked by Next.js dev-tools overlay in headless run. Persistence is definitively proven by the live timer surviving navigation on the Home card and Timeline row (the sheet derives from the same `runningEat` row). PM accepts the proof.

**PM accepted as delivered.**

**PRD §0.1 updated** — added "Active feeding session — semantics (added 2026-06-06)" subsection codifying:
- Definition (open-ended `bm`+`timer` row; sheet UI is a view, not the source of truth).
- State derives from `started_at` (no separate running flag).
- At most one active session per baby; concurrency soft-prompt handles two-caregiver races.
- Attribution: `logged_by_user_id` = the starter, regardless of who stops.
- Per-side log lives in `details_json` (no DB schema change).
- Notes draft persists across sheet close; saves on stop.
- Capture chip lock semantics.
- Home + Timeline quick-action surfaces.
- Realtime sync mirrors Sleep.
- Code reference pointers for future LLMs/devs.

**State of the polish series**
- Five screens polished: Home → Home contrast + global-nav + system guardrail → Timeline → Timeline day summary → กิน sheet + persistence + sibling tokens.
- Three systemic discoveries codified in the design-system principle (`brand.css`): #08 `--fg-faint` non-text only; #09 `--danger` darker text in light; #11/#11b soft verb hues decorative-only.
- AA gate process correction from #08 now has a documented principle behind it, not just patches.

**Next baton: CPO — eyeball live + pick next polish target.**
Same discipline: open `minom-production.up.railway.app` on a real phone in both themes, find what bugs you next, tell me. Remaining candidates: Sleep sheet, Diaper sheet, Growth, Family/Caregivers, Settings.

**Carry-overs unchanged**
- Beta still OPEN; first invites still paused on polish series completing.
- All other carry-overs queued (Resend domain, `lamoon.app` registration, Phase 5 LINE, WHO LMS data, hard-delete, legal review).

---

## 2026-06-06 — PM — 11b landed; Dev brief touched up; sending updated prompt to Dev

**What happened**
- Designer's 11b drop is in: `design/tokens-strong.css` (three `-strong` tokens with measured ratios + binding guide) + `design/brand.css` updated with the cumulative system principle stub (#08 / #09 / #11 / #11b).
- Files promoted; Designer journal entry merged below; `JOURNAL_designer_11b.md` removed.

**Designer 11b deliverables (PM accepted)**
- `--eat-strong`: oklch(0.53 0.135 50) light — already shipped in #11.
- `--sleep-strong`: oklch(0.50 0.11 277) light — text/white 6.16; white-on-fill 5.99.
- `--primary-strong`: oklch(0.53 0.135 48) light — text/white 5.57; white-on-fill 5.41. **Supersedes the #08 scoped active-nav fix** (Designer confirmed).
- Dark mode: `-strong` tracks soft (dark soft already clears 7+), so binding `-strong` unconditionally resolves correctly per theme.
- Design-system principle stub now in `brand.css`: soft hues decorative-only; `-strong` for text + white-on-fill in light.

**Brief touch-ups (small)**
- `HANDOFF_dev_11.md` — added "11b LANDED" status line at the top; rewrote Part 5b with actual values + the explicit "supersedes #08 scoped nav fix" lock; rewrote Part 5d from "wait or fold-later" to "bundle now."
- Brief structure unchanged. Audit trail intact.

**Dev brief is ready to route.** Updated copy-paste prompt provided to CPO this turn (the only change from the prior prompt is the wait-for-11b → 11b-is-here paragraph).

**Carry-overs unchanged**
- PRD §0.1 active-feeding-session semantics update is mine after Dev close-out.
- Beta still OPEN; first invites paused on polish series completing.

**Handoff → Dev (Claude Code)** via `HANDOFF_dev_11.md`.

---

## 2026-06-06 — Designer — Sibling -strong tokens + system stub

**Scope:** Handoff #11b — the small token follow-up offered in the #11 return. Completes the systemic AA fix opened by `--eat-strong` (#11) across Sleep and the primary clay, and codifies the pattern as a design-system principle. ~30 min, no schema, no Eat rework.

**Deliverables (3)**
1. `--sleep-strong` (light): `oklch(0.50 0.11 277)` — text/white 6.16, white-on-fill 5.99, on sleep-tint 5.22. (soft `--sleep` was 3.15 / 3.06 — fail.)
2. `--primary-strong` (light): `oklch(0.53 0.135 48)` — text/white 5.57, white-on-fill 5.41, on primary-tint 4.64. (soft `--primary` was 3.24 / 3.15 — fail.) Mirrors `--eat-strong`, as the warm-clay family should. **Supersedes the #08 scoped active-nav fix** — `--primary-strong` (0.53) is darker than that ad-hoc value, so it consolidates it.
3. System principle stub — comment block added to `brand.css` (top), alongside the #08 `--fg-faint` guardrail and #09 `--danger` note. States the rule: soft hues are decorative-only; `-strong` for text + white-on-fill in light; the #11 running-state text discipline generalizes it.

**Measured both themes.** Dark soft values already clear AA as text (7.1–8.2) and dark-ink-on-fill (7.8+), so `-strong` == soft in dark — components bind `-strong` unconditionally and get the right result per theme.

**Binding guide** (light = what changes), in `tokens-strong.css`:
- `--primary-strong`: primary CTA fills w/ white text (หยุดและบันทึก, เริ่ม, Save), `--primary` used as text, active nav tab (consolidates #08). Wordmark clay fill uses `-strong`; white-on-clay (`.on-clay`) unchanged.
- `--sleep-strong`: sleep CTA / กำลังนอน status text, white-on-sleep fills, sleep text labels. Running text → `--fg`/`--fg-muted`, hue on dots/fills only.
- Leave soft (do not repoint): icon chips, `--*-tint` surfaces, dots, borders, soft clay app-icon surface, wordmark dot glow.

**Handoff → PM (Claude).** Signal Dev that 11b has landed — fold everything in the one waits-and-bundle commit: eat polish + `--eat-strong` + `--sleep-strong` + `--primary-strong` + the comment block. No further Designer action; CPO then picks the next screen.

---

## 2026-06-05 — PM — Eat polish accepted; routing Dev + small Designer follow-up for sibling tokens

**What happened**
- Designer's #11 drop landed clean. All six items from the brief plus the systemic AA finding addressed.
- Files promoted: `HANDOFF_designer_to_pm_eat_polish.md` → archive; `JOURNAL_designer_11.md` merged below + removed; all design source in `design/`.

**PM accepted as delivered.** The persistence model mirrors Sleep correctly; the patch is tight (10 keys, no removes); the AA finding is rigorous; the live prototype proves the persistence loop.

**Two PM decisions**

**1. Adopt `--eat-strong` app-wide + greenlight Designer to spec siblings.**
The AA finding is genuinely systemic — `--eat` soft hue fails as text/fill in light theme; Designer notes the same shortfall applies to `--sleep` and `--primary`. **This is the third systemic discovery of the same shape**:
- #08: `--fg-faint` is non-text only; text uses `--fg-muted`+
- #09: `--danger` as text uses darker variant in light
- #11: Soft verb hues fail as text/fill in light; need `-strong` variants

That's a pattern worth documenting as a principle, not just patching. Wrote `HANDOFF_designer_11b_tokens.md` asking Designer to:
- Spec `--sleep-strong` + `--primary-strong` concretely (they offered: "I can spec the sibling tokens concretely on your go").
- Add a comment block to the design-system stub capturing the principle alongside #08's `--fg-faint` guardrail.

Dev will bundle `--eat-strong` + Designer's siblings in one commit when 11b lands. PM lean per Dev brief: wait + bundle for one clean systemic commit.

**2. PRD §0.1 update for active-feeding-session semantics — mine, after Dev folds.**
Same shape as the existing Sleep active-session pattern. Will write on Dev close-out, not now.

**Routing**
- **Designer (small) — `HANDOFF_designer_11b_tokens.md`**: spec `--sleep-strong` + `--primary-strong` + add the system-stub principle comment. ~30 min.
- **Dev — `HANDOFF_dev_11.md`**: 5 parts — patch merge + session persistence + Home active card + Timeline active row + token adoption. Dev waits-and-bundles or ships eat-polish-only and folds siblings later, their call.

**Note on the #08 nav-active fix interaction**
- The #08 nav-active fix scoped a darker clay for the nav tab in light mode. Once `--primary-strong` lands, that scoped fix can probably be retired in favor of the standard token. Flagged for Dev in #11 to confirm/consolidate.

**Carry-overs unchanged**
- Beta still OPEN; first invites paused on polish series completing.

**Files produced this turn**
- `HANDOFF_designer_11b_tokens.md` — small Designer follow-up.
- `HANDOFF_dev_11.md` — main Dev fold.

**Handoff → Designer (small, 11b) + Dev (main, 11)**.

CPO: please route both — Designer's small follow-up first (or in parallel; Dev brief tells them to wait-and-bundle).

---

## 2026-06-05 — Designer — กิน sheet polish shipped (Handoff #11 return)

**Scope:** Handoff #11 — Eat v2 polish (นมแม่·จับเวลา timer): tap-to-start/stop, dropped middle pill, session persistence + Home/Timeline quick actions, idle≠running surfaces, hide แก้ไข while running, notes persist. Plus a systemic AA finding fixed. AA gate §0 honored.

**Deliverable:** `ละมุน Eat Polish.html` (+ `screens_eat_polish.jsx`, `screens_eat_polish_demo.jsx`, `section_eat_polish.jsx`, `eat_polish_app.jsx`, `eat_polish.css`, `th-strings-eat-polish-patch.js`). 7 sections, light + dark, with a **live interactive prototype** that proves persistence across sheet close.

**The six**
1. Tap-to-start / tap-to-stop — side button is start; tap active to stop+save; tap other to switch. Bottom หยุดและบันทึก stays as formal path (PM lean).
2. Dropped the middle pill — big mono = session total; per-side cumulative in the side buttons.
3. Session persistence + quick actions — active feed = eat row where `mode=bm & capture=timer & ended_at=null`, derived from `started_at`. Mirrors SleepSheet's parent-held running prop. Home card goes live; Timeline gets an elevated active row (today only). Same two actions on both.
4. Idle ≠ running — distinct surfaces: idle invites the side tap (CTA ปิด); running fills the active side, lights the status, dims mode chips (CTA หยุดและบันทึก).
5. Hide แก้ไข while running — start-time edit idle-only; post-save edits via the #09 detail sheet.
6. Notes persistence + AA — note draft persists on the session, saves on stop, clears on cancel.

**Locked items honored**
- Capture toggle stays visible while running; inactive chip disabled with hint "หยุดเพื่อสลับโหมด" (PM lean).
- One active session per baby; concurrency soft-prompt unchanged. Session ticks live in the #10 day summary (tabular numerals, no re-layout).

**State machine** (Deliverable §5): Idle →(tap side)→ Running →(tap active / หยุด)→ Saved, with the switch self-loop and the **close-sheet ≠ stop · session persists** edge.

**AA gate — the finding (both themes, true sRGB).** Systemic, not a near-miss. Light-theme soft `--eat` (0.70) fails as text/fill: running status 2.73, active side label 2.32, white-on-eat stop chip 2.66. Dark passes.
- Fix: `--eat-strong: oklch(0.53 0.135 50)` (light) — text/white 5.56, text/eat-tint 4.71, white-on-fill 5.40; dark keeps its lighter value. Plus the #10 discipline — running-state text binds `--fg`/`--fg-muted`; eat hue lives only on non-text (dots/fills/borders).

**Flags for PM**
- Adopt `--eat-strong` app-wide. Sleep & primary clay share the same light-theme shortfall. Recommend `--eat-strong` / `--sleep-strong` / `--primary-strong` in tokens.css. Same shape as #09's danger-text flag.
- PRD §0.1 — after Dev folds, document active-feeding-session semantics (at-most-one-per-baby; `logged_by` = starter even if another caregiver stops).

**For Dev**
- Patch: `th-strings-eat-polish-patch.js` — TH_EAT_POLISH (idle/stop/switch hints, capture-lock hint, idle CTA, Home/Timeline active strings). No removals.
- Client-side (spec §07, no schema): session object + tap semantics, drop-pill, hide-แก้ไข, capture-lock, notes-draft, Home/Timeline active surfaces, attribution-to-starter. Reuse the SleepSheet parent-held pattern in Main.tsx.

**Handoff → PM (Claude).** Accept + route the Dev fold (session object mirroring Sleep + tap semantics + Home/Timeline active components); adopt `--eat-strong` app-wide; update PRD §0.1. Then CPO picks the next screen in the polish series.

---

## 2026-06-05 — PM — กิน sheet polish brief drafted (5th in screen-by-screen series)

**What happened**
- CPO eyeballed the live กิน sheet in นมแม่ timer mode (light + dark) and surfaced three substantive issues. PM added three more from the same screenshots.
- Routing as `HANDOFF_designer_11.md`. CPO will attach the two screenshots.

**The six**

1. **Tap-side-to-toggle (CPO)** — tap a side to start; tap active side again to stop. Switch sides already works (#09 removed the separate switch button). PM kept the bottom `หยุดและบันทึก` as belt+suspenders.
2. **Drop the middle small timer pill (CPO)** — redundant; per-side cumulative already lives in the buttons. Keep big total + per-side in buttons.
3. **Session persistence + Home/Timeline quick actions (CPO)** — the biggest item. Turns active feeding into a first-class persistent object (same pattern as Sleep timer from Phase 3). Home Eat card + Timeline get live state + quick `หยุด` and `สลับข้าง` affordances.
4. **Idle vs running states clearly different (PM)** — supports the new tap-to-start discoverability.
5. **Hide `แก้ไข` time edit during running (PM)** — odd mid-session; detail sheet from #09 handles post-save edits properly.
6. **Notes persistence + AA pass (PM)** — note survives close+reopen; AA gate per §0 standard.

**Two things I called out as locked**
- The capture toggle (จับเวลา / กรอกปริมาณ) stays. PM lean for the edge case: disable the other capture chip while a timer is running, with a tiny "หยุดเพื่อสลับโหมด" hint on tap.
- 2-tap log path preserved — now tap-side-to-start is the 1st tap, save-by-stopping is the 2nd. Net faster than before.

**One PRD update PM owes after Designer/Dev ship**
- PRD §0.1 needs the active-feeding-session semantics added (parallel to the existing Sleep active-session pattern from Phase 3). I'll do that on Dev close-out, not now.

**Routing → Designer (`HANDOFF_designer_11.md`)** — multi-day target deliverable: idle/running state spec + Home + Timeline quick-action treatments + state machine + AA audit + microcopy patch.

**Carry-overs unchanged**
- Beta still OPEN; first invites paused on polish series completing.
- Sleep + Diaper sheets, Growth, Family, Settings still in the queue for later polish rounds.

**Handoff → Designer (Claude Design)** via brief + CPO screenshots.

CPO: please route + attach the two screenshots.

---

## 2026-06-05 — PM — Day summary + attribution drop accepted; standing by for next-screen pick

**What happened**
- Dev confirmed #10 shipped and verified at the documented ratios. Row attribution fully dropped product-wide. Day summary built per CPO's locked Hero density + refinement (eat sub-line carries volume + duration when both exist).
- Polish series sequence so far: Home → Home contrast + global-nav + system guardrail → Timeline → Timeline day summary.

**State at this checkpoint**
- Timeline screen is now fully polished including the day summary.
- The activity detail sheet (#9 deliverable) is the canonical home for who-logged-it.
- The AA gate process correction from #08 has held across two consecutive polish rounds (#09 Timeline + #10 day summary).
- Three screens remain candidates for the polish series: Eat sheet, Sleep sheet, Diaper sheet, Growth, Family/Caregivers, Settings. Activity detail sheet probably fine as just shipped.

**Next baton: CPO — eyeball live + pick next polish target.**
Per the discipline established earlier: CPO eyeballs the live result on a real phone (both themes), then tells PM which screen bugs them next. Don't pre-route; let the visual judgment drive sequencing.

**Carry-overs unchanged**
- Beta still OPEN; first invites paused on polish series completing.
- Resend domain + `lamoon.app` registration + Phase 5 LINE design + WHO LMS data + hard-delete + legal review all queued.

---

## 2026-06-05 — PM — Day summary accepted; Hero density + CPO refinement; routing Dev #10

**What happened**
- Designer's re-drop landed cleanly: `HANDOFF_designer_to_pm_summary.md` + `JOURNAL_designer_10.md` + `design/ละมุน Day Summary.html` + `design/th-strings-timeline-patch-2.js` + JSX/CSS sources.
- Surfaced the one open decision (content density: Hero / Counts / Amounts) to CPO via AskUserQuestion with Designer's recommendation marked.

**CPO's call — Hero density with a refinement**
- Locked: **Hero** (Designer + PM recommendation).
- Refinement: *"add กิน นมแม่ that also as a timing mode — use the duration for that one. Therefore the กิน would look like 5 ครั้ง, 450 มล, 2 ชม. 41 นาที (Feel free to tweak as you see fit to make it easy to understand)."*
- Implication: the eat sub-line now carries TWO dimensions when both exist — volume (from นมผง + นมแม่-amount) AND duration (from นมแม่-timer). Designer's original Hero spec had volume only; CPO's refinement closes a real gap for mixed-mode and exclusively-breastfeeding families.

**Aggregation logic locked in Dev brief**
- `count` = total eat entries.
- `volume` = sum of `amountMl` where `mode ∈ {formula}` OR `(mode == bm AND capture == amount)`.
- `duration` = sum of timer-session durations where `mode == bm AND capture == timer`.
- Sub-line composition:
  - Both > 0 → `{volume} มล. · {duration}` (inline; stack as two sub-lines if 360px crowds).
  - Volume only → `{volume} มล.`
  - Duration only → `{duration}`
  - Both 0 (e.g., solids-only day) → no sub-line.

**Why this works with the locked principle**
- CPO's earlier "BM is BM regardless of delivery" principle from 2026-06-03 is exactly what makes this clean. The capture toggle on นมแม่ is now load-bearing for the summary — timer entries contribute to duration, amount entries contribute to volume. The summary respects the principle rather than collapsing one capture mode away.

**File placement**
- Designer's handoff archived as `HANDOFF_designer_to_pm_summary_archive.md`.
- Designer's journal entry merged below (Designer's own JOURNAL.md overwrite was avoided per #08-pattern; `JOURNAL_designer_10.md` removed after merge).
- All design files in `design/`.

**Routing → Dev (`HANDOFF_dev_10.md`)**
~1–2h, three pieces:
1. Merge `design/th-strings-timeline-patch-2.js` (6 keys, no removes).
2. Build summary component below day label, above row list. Per-verb aggregation logic in §2b of the Dev brief. AA pass against Designer's measured ratios.
3. Confirm row attribution chip + spacer removal product-wide (consistency with the #09 trim).

If Dev is still mid-flight on #09, bundle into the same commit. Otherwise small standalone pass.

**Flags I'm watching**
- Designer's width-critical observation: "4 ชม. 32 นาที" alone is already tight at 360px. Combined sub-line may crowd — Dev brief calls out the stacked-fallback layout if it does. Designer may need to iterate after seeing the live build.

**Carry-overs unchanged**
- Beta still OPEN; first invites paused on polish series completing.
- Dev #09 still folding; this bundles in if timing aligns.
- All other carry-overs queued.

**Handoff → Dev (Claude Code)** via `HANDOFF_dev_10.md`.

CPO: please route.

---

## 2026-06-05 — Designer — Day summary shipped (Timeline addendum)

**Scope:** Handoff #10 — Part A (attribution-drop consistency) + Part B (day-summary design). Timeline polish addendum. One new element; no schema; client-side logic only. Carries the standing AA gate (§0).

**Deliverable:** `ละมุน Day Summary.html` (+ `screens_timeline_summary.jsx`, `section_timeline_summary.jsx`, `summary_app.jsx`, `summary.css`, `th-strings-timeline-patch-2.js`). 6 sections, light + dark, 360px: the decision, in-place full state, partial + empty states, attribution drop, AA audit, spec.

**Part B — day summary**
- Hero numbers, count-led: hero = count for กิน & ถ่าย, duration for นอน. Second dimension (volume / ฉี่·อึ split) is a muted sub-line. Chosen over counts-only (ambiguous) and counts+amounts (crowds 360px).
- Same hierarchy as Home + Timeline row — muted label over bold detail, tabular mono numerals, sans labels. One pattern across the product.
- Placement: below the header, under the load-bearing day label, above the row list. Recomputes on day-swipe.
- Partial: verbs with no data omitted (no 0-state). Empty: summary hidden — #9.7 empty state stands alone.
- Brand voice held: no celebration copy, no comparison, no charts.

**Part A — attribution drop (consistency)**
The #09 speak-on-change caregiver chip is removed from rows entirely, including its reserved spacer — rows tighten. "Who" now lives only in the detail sheet's `บันทึกโดย {name} · {time}` line. Matches the client-side trim from mid-#09; spec synced.

**AA gate — measured both themes, true sRGB.** Summary sits on `--surface-2`:
- Hero numeral (`--fg`): 13.21 / 11.84 ✓✓
- Label / unit / sub (`--fg-muted`): 4.99 / 6.02 ✓
- Verb dot decorative → exempt from text minimum.

**Flags for PM**
- Layout watch: นอน duration "4 ชม. 32 นาที" is width-critical at 360px. Re-check if duration format ever lengthens.
- No new app-wide flags.

**Open decision for CPO**: Content density — Hero / Counts / Amounts. Hero recommended; shipped a Tweak for side-by-side comparison.

**Patch for Dev:** `th-strings-timeline-patch-2.js`. Aggregation + count-led hero + omit/hide rules + attribution removal are client-side, no schema. Bundles with Dev #09 if timing aligns.

**Handoff → PM (Claude).** Merge the patch; build the summary; remove the row attribution chip + spacer product-wide. Surface the density decision to CPO. Then CPO picks the next screen in the polish series.

---

## 2026-06-05 — PM — Designer #10 return missing files; re-drop requested

**What happened**
- Designer sent the #10 return note describing a complete deliverable (density-Tweak comparison + Open decision for CPO + microcopy patch + journal entry). **None of the named files reached the shared workspace.** Checked root, `design/`, recent-touched within the hour — only PM edits visible.
- Same drop-path glitch seen on prior returns. Not a content issue; a delivery issue.

**Action**
- Wrote `HANDOFF_designer_10_redrop.md` listing exactly which files are missing, target placement convention, and a stopgap (paste the three highest-leverage artifacts into chat if the file-sync issue persists).
- Held the baton on PM side. **Not routing Dev** against a spec I can't see — same discipline as #08 (verified Designer's diff before routing).

**Files updated**
- `HANDOFF_designer_10_redrop.md` — small re-drop request.

**No change to Dev #09** — still folding with the updated Item 2b. Independent of #10.

**Handoff → Designer (Claude Design)** via `HANDOFF_designer_10_redrop.md`.

CPO: please route the re-drop request.

---

## 2026-06-05 — PM — Timeline addendum: drop row attribution + design day summary

**What happened**
- CPO saw the live Timeline polish (Dev mid-fold on #09) and surfaced two changes:
  1. Drop attribution from rows entirely. Reasoning: "User can see who created when click to see detail anyway." The detail sheet is the canonical home for who-logged-it; the list is for *what happened today*, not *who*.
  2. Add a day-summary element to the Timeline page.

**PM accepted both**
- **Attribution drop** — cleaner ladder (list = what, detail = full info). Removes ~70% of list noise. Updated Dev #09 mid-flight to trim the suppression-on-change rule from Item 5; render no attribution chip on rows. The detail-sheet `loggedBy` line stays.
- **Day summary** — real new element worth designing carefully. Brand goal: earn its weight. Avoid calorie-counter vibes. Routed as Designer #10 with three open questions (what to show / where / empty states) and PM leans documented.

**Files updated**
- `HANDOFF_dev_09.md` Item 2b — replaced suppression rule with "drop attribution entirely." Dev catches the update next time they read the file.
- `HANDOFF_designer_10.md` — written; covers Part A (attribution consistency note for Designer's spec doc) + Part B (the real design work on the summary).

**On the day summary — PM leans (Designer can override within framing)**
- **What to show:** hero numbers — `450 มล. · 4 ชม. 32 นาที · 6 ครั้ง` with muted context labels. Mirrors the Home card + Timeline row hierarchy (muted context + bold detail). One typographic pattern across the product.
- **Where:** top of page, below the header, above the row list. Most natural "here's what today looks like" position.
- **Empty/partial:** hide entirely when day is empty (existing empty state still applies); show only verbs with data otherwise. No "0 ครั้ง · 0 มล." — that's sad.

**AA gate** applies under the §0 standard from #08/#09 — both themes, documented ratios, real-scale screenshots.

**Routing**
- **Designer** active baton via `HANDOFF_designer_10.md`.
- **Dev** still folding #09 (with the updated Item 2b). Probably won't bundle with Designer #10 unless timing aligns; otherwise small Dev #10 follow-up.

**Carry-overs unchanged.**

CPO: please route the Designer brief.

---

## 2026-06-05 — PM — Timeline polish accepted; routing Dev (#09) + app-wide danger-text

**What happened**
- Designer returned the Timeline polish — all seven items addressed, activity-detail sheet specced, AA gate passed both themes, two near-misses caught and fixed (`ลบ` 4.43→5.77 with darker danger-text; chevron disabled glyph 2.97→3.77).
- Designer dropped at root again; files promoted to proper locations: `th-strings-timeline-patch.js` + `th-strings-timeline.js` → `design/`; Designer's handoff archived as `HANDOFF_designer_to_pm_timeline_archive.md`.

**PM accepted as delivered.** Two structural wins:
- Timeline rows now speak the same visual language as Home cards (muted context + bold detail). Product feels like one product.
- Destruction left the default vocabulary — delete moves into the detail sheet (with confirm) and a swipe-left power-user gesture. The always-visible red trash on every row is gone.

**Designer's two flags for PM**
1. **Apply darker danger-text app-wide** — `--danger` as TEXT was 4.43 in light (hair under 4.5). Scoped a darker variant for Timeline; folded into Dev brief #09 as Part 4 (same shape as #08's global-nav fix). Danger *fills* unaffected; only TEXT-on-surface bindings change.
2. **Lock BE dates in PRD §11.1** — **already done last turn** per CPO's 2026-06-05 confirmation. No PM action needed; Dev just renders BE for all full-date displays via `Intl.DateTimeFormat('th-TH-u-ca-buddhist', ...)`.

**AA gate held up on its first real outing.** Designer measured ratios, documented in a table, caught two near-misses, fixed them in-flight. Process correction from #08 is working as designed.

**Routing → Dev (`HANDOFF_dev_09.md`)** — four pieces, ~1–2h:
1. Merge `design/th-strings-timeline-patch.js` (~15 keys + 3 removes).
2. Behavior rules client-side: row hierarchy, attribution-on-change-only, BE date format, chevron disabled state.
3. Build activity-detail sheet (new small component) — read-only entry + `แก้ไข` primary + `ลบรายการนี้` with confirm.
4. Apply darker danger-text app-wide; add the danger text-vs-fill comment block in central token CSS next to #08's `--fg-faint` guardrail.

**Carry-overs unchanged.**

**Handoff → Dev (Claude Code)** via `HANDOFF_dev_09.md`.

CPO: please route.

---

## 2026-06-05 — Designer — Timeline polish shipped

**Scope:** Handoff #09 — second screen in the polish series. Seven tightenings + a new activity-detail sheet. First brief under the standing AA gate (§0). Microcopy + treatment + tap-to-edit; no schema.

**Deliverable:** `ละมุน Timeline Polish.html` (+ `screens_timeline.jsx`, `screens_timeline_detail.jsx`, `section_timeline.jsx`, `section_timeline_spec.jsx`, `timeline.css`, `th-strings-timeline.js`). 6 sections, light + dark, 360px: before/after, the seven, activity detail sheet, empty state, AA audit, spec.

**The seven**
1. Header subtitle วันนี้ dropped — section label is the single load-bearing source of "which day."
2. Tap-to-edit → activity detail sheet (the new affordance).
3. Row hierarchy now mirrors Home: muted context (verb) over bold detail (mode-encoded). Fallback: no detail → bold = verb, context omitted.
4. Always-visible red trash removed; delete lives in the detail sheet (confirmed) + a swipe-left reveal. Destruction left the default vocabulary.
5. Attribution suppressed when logger == previous row (first row anchors); the different-caregiver row now carries the signal. Space reserved so rows stay aligned.
6. Disabled day-nav chevron reads as disabled (faint glyph) and clears 3:1 — the live ghost was ~0.08 (invisible).
7. Empty state: 7a title → ยังไม่มีบันทึก (was hardcoded "วันนี้" on a past day); 7b BE date (2 มิ.ย. 2569) confirmed default for full dates; 7c generic list icon dropped; 7d body tightened.

**Activity detail sheet (#2/#4):** read-only entry (time, type/amount, note, logged-by as calm meta) with แก้ไข primary + ลบรายการนี้ quiet; delete confirms.

**AA gate — measured both themes, true sRGB.** All text --fg-muted+ (≥4.98 light / ≥6.05 dark). The gate caught two light near-misses, both fixed:
- Delete action ลบ (--danger): 4.43 → darker danger-text in light → **5.77** (dark 6.29).
- Disabled chevron glyph: 2.97 → darker faint in light → **3.77** (dark 4.17, non-text 3:1 min).
Guardrail (#08) held: the only faint-glyph consumer is the disabled chevron (non-text).

**Notes for PM**
- `--danger` as TEXT is 4.43 in light (hair under 4.5) — scoped a darker danger-text here; **flag: same applies to any danger-text app-wide** (same shape as the #08 global-nav flag). Fills (white-on-danger) are unaffected.
- BE date format (§7b) — recommend PRD §11.1 lock BE as default for all full-date displays.

**Patch for Dev:** `th-strings-timeline-patch.js` — TH_PATCH (empty-state + detail-sheet + swipe keys) + TH_REMOVE (subtitle, old empty title, joined row template). Behavior rules documented in §06; no schema, ~1–2h fold.

**Handoff → PM (Claude).** Merge the patch; build the row hierarchy + attribution-suppression + tap-to-edit detail sheet; apply the darker danger-text app-wide. Then next screen in the series.

---

## 2026-06-05 — Designer — Home contrast fix + AA audit shipped

**Scope:** Handoff #08 — diagnose/fix the dark-mode "ฉี่" contrast failure + full WCAG 2.1 AA audit of Home, both themes. Method: measured true sRGB of every text element against its actually-rendered surface and computed contrast ratios (the `design:accessibility-review` skill isn't in my toolset, so I ran the audit math directly — same substance).

**Part A — diagnosis: Case 1 (wrong token), not Case 2 (token value).**
Token contrast on the card surface (light / dark):
- `--fg` (primary): **14.56 / 13.36** ✓✓ — dark values are healthy.
- `--fg-muted`: 5.5 / 6.83 ✓✓
- `--fg-faint`: 3.12 / 3.66 ✗✗ — fails text in BOTH themes.

Because `--fg` passes in dark, the dark token *values* are fine. The "ฉี่" hero was bound to the **faint** token (3.66 dark / 3.12 light) — it only "looked fine" in light because dark text on a light field reads forgivingly. **Fix = bind the mode-encoded hero detail to `--fg` on all verb cards.** No token-table change.

**Part B — full audit caught 3 more fails (all fixed):**
| Element | Before (L/D) | After (L/D) |
|---|---|---|
| Hero detail (ฉี่) | 3.12 / 3.66 ✗✗ | **14.56 / 13.36** ✓✓ (→ --fg) |
| Timestamp …ที่แล้ว | 3.12 / 3.66 ✗✗ | 5.5 / 6.83 ✓✓ (→ --fg-muted) |
| Repeat bar ทำซ้ำ… | 2.48 / 7.1 ✗✓ | 4.98 / 6.05 ✓✓ (--eat→--fg-muted) |
| Nav inactive [global] | 2.97 / 4.17 ✗✗ | 5.43 / 7.16 ✓✓ (→ --fg-muted) |
| Nav active [global] | 3.08 / 8.13 ✗✓ | 6.24 / 7.46 ✓✓ (dark clay L / primary D) |

Passing, unchanged: empty stat (5.5/6.83), verb label (5.5/6.83), baby name (13.9/15.3), family hint (13.5/12.1), chevron non-text glyph (3.12/3.66, clears the 3:1 min).

**System guardrail added:** `--fg-faint` is **non-text/glyph only** (clears 3:1, not 4.5:1). Any text must use `--fg-muted` or stronger. On Home the chevron is its only legitimate consumer.

**Deliverable:** `ละมุน Home Polish.html` now has a **§05 · AA audit** (diagnosis callout + before→after table, all green). Files: `home.css` (token-mapping fixes), `section_home.jsx` (audit section), `home-contrast-diff.js` (Dev diff — NOT a microcopy patch; no new th.json keys).

**Notes for PM**
- The bottom **nav is global** — nav fixes are scoped to Home in the demo for the audit; apply app-wide as its own small change.
- No token *values* moved — only token *mappings* (which token is bound to which text). Microscopic Dev fold.
- Process correction (Part C) acknowledged: AA verification + documented ratios + both-theme proof will be a top-line gate on every subsequent polish brief.

**Handoff → PM (Claude).** Merge the token-mapping diff (Home), schedule the global-nav fix, fold the `--fg-faint` guardrail into the design-system stub. Then next screen in the series with the AA gate from the start.

---

## 2026-06-05 — Designer — Home polish shipped

**Scope:** Handoff #07 — first in the screen-by-screen polish series. Home only. Microcopy + visual treatment; no schema, no new Dev logic. Worked from CPO's live light/dark screenshots.

**Deliverable:** `ละมุน Home Polish.html` (+ `screens_home.jsx`, `screens_home_live.jsx`, `section_home.jsx`, `home.css`, `th-strings-home.js`). 4 sections, light + dark, 360px: before/after, the five tightenings annotated, the empty/partial/full **height matrix**, and the spec.

**The five (all PM observations addressed)**
1. **Repeat-last hidden when empty** + **named** when shown (`ทำซ้ำ {summary}`, e.g. ทำซ้ำ นมแม่ · 90 มล.). Verified: removing it from the empty Eat card is what makes heights even.
2. **Empty stat collapsed** to `แตะเพื่อเริ่ม` alone (was `ยังไม่มีบันทึก · แตะเพื่อเริ่ม`). Same key across all three verbs.
3. **Family hint** — dropped the `เคล็ดลับ:` prefix, made the **whole card tap through to Family** (users icon + chevron), and made it **conditional** (render only when caregiverCount < 1). Added a quiet dismiss option in spec.
4. **Card heights even** — measured matrix: empty = [91,91,91]; partial = [133,91,91] (only the content+repeat Eat card grows); full = [133,91,91]. Before/live measured [146,102,91] (the bug). 
5. **Header age line softened** — weekday lighter weight, fainter middle dot, nowrap + breathing room (also fixed a real wrap bug where "3 สัปดาห์" broke to two lines).

**Self-spotted (net addition)**
- **Chevron de-weighted** — removed the filled circle (redundant since the whole card taps); borderless faint chevron keeps the affordance without competing with the verb icon. Tweak toggle (soft/circle) included to compare.

**Patch for Dev:** `th-strings-home-patch.js` — `TH_PATCH` (5 keys: 3× empty, repeatNamed, familyHint) + `TH_REMOVE` (4: eatEmptyStat, eatEmptyUnit, tip, repeatLast). Visibility rules (repeat-last gate, family-hint gate, chevron style) documented in §04 — all client-side, no schema.

**Notes for PM**
- Theme toggle left in the header (your lean + mine — dark/light at 3am earns prime real estate).
- Two reach items you parked: chevron → I de-weighted it (recommend shipping soft); theme toggle → left as-is.
- Still open from #05 (non-blocking): the นมแม่ capture-toggle keep/collapse call.

**Handoff → PM (Claude).** Merge the patch, apply the visibility rules + chevron treatment. Ready for the ~1h Dev fold. Pick the next screen in the series when ready.

---

## 2026-06-04 — Designer — Invite-link UX shipped

**Scope:** Handoff #06 — fix the "lost invite link" UX bug + voice-review two Dev-surfaced strings.

**The bug fixed (design):** the invite link was shown once and unrecoverable on exit, so the only recovery was revoke & re-invite. Now **pending invites are persistent, first-class rows** on the Caregivers screen, each opening a detail sheet that is the canonical home for that invite.

**Deliverable:** `ละมุน Invite-link UX.html` (+ `screens_invite.jsx`, `section_invite.jsx`, `invite.css`, `icons_invite.jsx`). Four sections, light + dark, 360px:
1. **The fix** — Caregivers screen with active / pending / expired rows (sent + expiry, ≤3-day warning treatment) + an empty state that nudges the multi-caregiver wedge.
2. **Invite detail sheet** — primary **แชร์คำเชิญ** (`navigator.share` → LINE/Messages/Email/Copy), a visible+copyable link (reveal-in-sheet, not on the parent screen — it's an unauth token), a **QR** behind an expander for in-person handoffs, quiet sent-meta, and a low-emphasis **revoke**.
3. **Fallbacks & transitions** — desktop / no-Web-Share fallback (copy-first, URL visible), revoke confirm, and the expired→**ส่งคำเชิญใหม่** path (fresh 14-day token; never auto-pruned).
4. **Spec & voice** — new keys + the Part B review.

**Decisions I owned**
- Included the **QR behind an expander** (PM lean) — in-person handoffs (grandma at the house) are real.
- **Link posture:** reveal-on-tap inside the sheet, never a default-visible bold URL on the parent screen (over-the-shoulder leak risk for an unauth token).
- Expired rows **persist** with a resend affordance rather than disappearing.

**Part B — voice review**
- `care.inviteHelper` → **rewritten**: was an auto-email promise; now sets the real expectation ("we'll make a link for you to send — via LINE, Messages, or email; valid 14 days"), matching the link-is-delivery reality until Resend domain is verified.
- `home.sleep.justWoke` "เพิ่งตื่น" → **confirmed as-is** (natural, warm, child's-eye).

**Patch for Dev:** `th-strings-invite-patch.js` (`window.TH_PATCH`, ~40 keys; `TH_REMOVE` empty — the old one-time-link surface is a code flow Dev retires, no stale th.json keys). Reference object: `th-strings-invite.js`.

**Files**
- `ละมุน Invite-link UX.html`, `screens_invite.jsx`, `section_invite.jsx`, `invite.css`, `icons_invite.jsx`
- `th-strings-invite-patch.js` (Dev merge), `th-strings-invite.js` (reference)

**Note for Dev:** Web Share API detection is yours to wire — spec'd both states (supported = share-first; unsupported/desktop = copy-first with URL visible). QR shown is a styled placeholder; generate a real QR from the invite URL at build.

**Handoff → PM (Claude).** Route to Dev to fold into the beta-open cycle (merge patch, build persistent pending-invite UX + detail sheet). Open, non-blocking: the นมแม่ capture-toggle question from #05 is still pending your call.

---

## 2026-06-04 — Designer — Eat v2 propagation complete

**Scope:** Handoff #05b — make the static spec (not the prototype HTML) the source of truth Dev builds from. No new design decisions.

**Findings / what shipped**
- The **static deliverable was already in sync** with the prototype (propagated in the #05 round): `MiNom Design - Eat v2.html` + `section_eat2.jsx` + `screens_eat2.jsx` already show the baby-centric model — กิน category, นมแม่/นมผง/อาหารแข็ง modes, the นมแม่ จับเวลา/กรอกปริมาณ capture toggle, no "switch side" button, the redesigned Home card hierarchy, and the repeat-last + แก้ไข/เลิกทำ toast. Verified renders clean (light+dark).
- **New drop-in patch for Dev: `th-strings-eat2-patch.js`** (`window.TH_PATCH` + `window.TH_REMOVE`, same convention as the earlier polish patches). 58 patch keys + 20 removals. Covers:
  - Verb rename: `home.eatName` ให้นม→**กิน**, `home.sleepName` การนอน→**นอน**, `home.diaperName` ผ้าอ้อม→**ถ่าย**, plus `eat.title/sleep.title/diaper.title`.
  - Templated verb strings updated: `feedback.caregiverAdded`, `del.body`.
  - Full Eat v2 model: `eat.mode.*`, `eat.amount.*`, `eat.bm.*`, `eat.breast.*`, `eat.formula.save`, `eat.solids.*`, notes (incl. solids placeholder).
  - Home/Timeline mode-encoded stat-lines, `home.eat.repeatLast`, named feedback (`feedback.savedNamed/repeatedNamed/edit`).
  - Mode-aware Eat concurrency namespaced to `concurrency.eat.*` (amount vs timer).
  - REMOVES the old flat single-form keys (`eat.source*`, `eat.what*`, `eat.amountLabel`, `eat.save`, old `timeline.eat*`, `feedback.eatLogged`, flat `concurrency.*`).
- **Consistency fix:** renamed `TH2.concurrency.bodyBottle/bodyBreast` → `bodyAmount/bodyTimer` (the word "bottle" was the how-naming we removed) and updated the consumer in `section_eat2.jsx`.

**Files**
- Patch: `th-strings-eat2-patch.js`
- Reference object (source of truth for new keys): `th-strings-eat2.js`
- Static deliverable: `MiNom Design - Eat v2.html` (+ `section_eat2.jsx`, `screens_eat2.jsx`, `eat2.css`, `icons_eat2.jsx`)
- Interactive prototype (for feel/QA reference): `ละมุน Eat v2 — Prototype.html`

**Notes for PM**
- **grow verb left unchanged** (`home.growName` "การเติบโต"). The กิน/นอน/ถ่าย set is now 3 short + 1 long on Home. Recommend renaming grow → **โต** for parallelism, but it's out of this handoff's scope and Growth isn't in the build path yet — your call whether to fold it into a later pass.
- Open question still standing from #05: keep the นมแม่ จับเวลา/กรอกปริมาณ capture toggle, or collapse นมแม่ to timer-only. Built to collapse in minutes if you decide against pumped-bottle support.

**Handoff → PM (Claude).** Patch + synced static spec are ready. Route to Dev: merge `th-strings-eat2-patch.js` into `web/locales/th.json` (apply `TH_REMOVE`), then build Eat v2 against the static deliverable.

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
- **"Family" vs "Caregivers" label** — used "Family" in the bottom nav for warmth; screen still does everything §5a/#7 specifies (invite/remove/transfer, owner badge, pending, cap of 10). Flagging as a copy proposal, not a model change — happy to revert to "Caregivers" if preferred.
- **Soft concurrency prompt** (§5a) — designed as a non-blocking, dismissible sheet rather than its own screen; will detail it in the Sleep/Eat build specs. No PRD change implied.
- No contradictions to PRD v0.2 otherwise. Q2 (units) handled via a unit-toggle in Settings + metric-default inputs; Q3 positioning ("the simplest baby tracker") carried through the visual tone.

**Handoff → PM (Claude)**
- Review the 4 hi-fi screens + component stub against the success criteria (esp. "Dev shouldn't have to ask what a state looks like").
- Confirm/decide the two flags above (the "Family" label, concurrency-prompt-as-sheet) so I can lock copy.
- If accepted, route the baton to Dev with the component stub as the build reference for the Walking Skeleton (Eat vertical slice).

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
