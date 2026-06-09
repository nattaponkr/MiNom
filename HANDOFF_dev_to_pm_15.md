# Handoff #15 (return) — Dev → PM · Growth chart real WHO LMS

| Field | Value |
|---|---|
| From | Developer (Claude Code) |
| To | PM |
| Date | 2026-06-09 |
| Re | Real WHO Child Growth Standards percentile curves on the โต chart |
| Predecessor | `HANDOFF_dev_15.md` (PM → Dev brief), `who-lms.ts` Parts 1–2 (commit `8e4dd8e`) |
| Status | **Parts 1–5 implemented + building green. Part 6 (prod 2-device smoke) NOT run — needs hardware.** Code is in the working tree, **not yet committed** (awaiting your go). |

---

## TL;DR

The chart is now real: five WHO percentile curves (P3/15/50/85/97) computed from the bundled LMS tables, labeled smart axes (weeks/months × kg/cm), today's-age marker, tappable per-point P{n} readouts, and a tappable WHO citation. When sex is unset it **degrades honestly** — points + axes + marker, **no curves**, plus the "ระบุเพศของลูก" prompt.

**The one thing the brief got wrong:** it assumed "sex is already collected." It wasn't — no screen set it, so every real baby had `sex = null` and the curves would *never* have rendered. Per your call, I added a sex setter in **both** onboarding (BabySetup) and **Settings**, so the feature is actually reachable. Details below.

`tsc` clean · `next build` green · 6/6 unit tests pass · all WHO math spot-checks pass.

---

## What shipped, by part

**Part 1–2 (were already committed, `8e4dd8e`) — re-verified.** LMS bundle + math. `validate-who-lms.mjs` passes every published-WHO marker (boy P50 weight 3.35→9.65 kg @ 0→12mo; 3mo 6.8kg boy = **P71**). 6/6 tests green.

**Part 3 — chart.** `components/PercentileChart.tsx` fully rewritten (was the #13 decorative placeholder) — SVG curves + band (15–85), smart X axis (weeks ≤6mo else months), smart Y axis (percentile envelope ∪ data, auto-expands to fit any point), today-marker, data dots (latest ringed), trend line, per-point tooltip with `P{n}` via `valueToPercentile`. Mirrors `design/screens_who_chart.jsx`. Exports `Citation`, `SexPrompt`, `AgeCaption`, plus `ageMonthsBetween` helper.

**Part 4 — sex-required graceful degrade.** `sex` set → curves; unset → axes + marker + dots only, never faked/combined, with the soft prompt whose CTA navigates to Settings (`onNavSettings` → `setTab("settings")`). Microcopy from `growth.sexRequired.*`.

**Part 5 — realtime re-plot.** Measurements live in their **own table**, which the existing activity realtime path does **not** cover — so I added `subscribeMeasurements()` to the repo (supabase + demo), wired into `GrowthScreen` to re-fetch on any peer insert/edit/delete. **Requires migration `0007_measurements_realtime.sql`** (adds `measurements` to the `supabase_realtime` publication) — see "Deploy steps" below.

**Part 6 — #12 prod 2-device smoke check: NOT RUN.** I can't drive two physical devices + two prod accounts from here. Steps are unchanged from the brief; run them manually before close and log the verdict. I did not and will not claim this passed.

### Sex-input gap (out of literal brief scope, added per your decision "also add to onboarding")
- `BabySex = "boy" | "girl"` added to the `Baby` type; `sex` now flows through `listBabies` (the column already existed; `select("*")` returns it).
- `updateBaby()` added to the repo (supabase direct update — `babies_update` RLS already allows any caregiver — + demo).
- `createBaby(name, birthdate, sex?)` now carries sex (create-then-update on supabase, since the `create_baby` RPC has no sex param and I didn't want a function migration this fold).
- **BabySetup**: optional ชาย/หญิง segmented control (skippable).
- **Settings**: editable เพศ row under ข้อมูลลูก; tapping the active value clears it. Calls `updateBaby` then refreshes → chart re-renders with curves.

---

## Files touched

- `lib/types.ts` — `BabySex`, `Baby.sex`
- `lib/sync/repo.ts` / `supabaseRepo.ts` / `demoRepo.ts` — `createBaby(+sex)`, `updateBaby`, `subscribeMeasurements`
- `components/PercentileChart.tsx` — full rewrite + Citation/SexPrompt/AgeCaption
- `components/GrowthScreen.tsx` — age-based points, sex-aware chart, caption/citation/prompt, realtime
- `components/BabySetup.tsx`, `components/SettingsScreen.tsx` — sex setters
- `components/Main.tsx` — `onNavSettings` wiring
- `locales/th.json` — `growth.axis.*`, `growth.today*`, `growth.sexRequired.*`, `growth.citation`, `growth.outOfRange`, `setup.sex.*`, `settings.babySex*`
- `styles/components.css` — `.wc-*` chart styles
- `supabase/migrations/0007_measurements_realtime.sql` — **new**

---

## What you owe → what I'm returning

1. **Code on main** — ⚠️ *not yet committed.* In the working tree, green. Say the word and I'll commit + open a PR.
2. **AA evidence** — satisfied by construction: every text element binds the exact tokens the Designer's §07 table targets (`--fg-muted` axis/curve/citation, `--fg` today-flag/prompt-title, `--on-primary`-on-`--grow-strong` CTA), and `--grow-strong`/`--fg-muted` were already canvas-validated in #13/#14. **Recommend a visual canvas-resolved spot-check before merge** — I couldn't run the headless canvas measurement here.
3. **Math validation** — ✅ 3 published-WHO spot-checks + monotonic-interpolation test committed and passing.
4. **#12 smoke-check verdict** — ❌ **not run** (hardware). Unchanged steps in the brief; please execute + log.
5. **Surfaced during the bundle** — see flags below.

---

## Flags for PM / PRD

1. **The sex assumption was false** — the brief and Designer §08 both said "sex already collected." It wasn't (no setter existed). Now added in onboarding + Settings. **PRD §5 should record that sex is optional *and now editable post-setup*.**
2. **LMS range is 0–24mo, not 0–60mo.** Parts 1–2 bundled the CDC-redistributed 0–24mo tables (documented in `who-lms.ts` header). Fine for beta (0–12mo); **the full 0–60mo WHO tables remain a pre-public data task** — `growth.outOfRange` microcopy exists but >24mo currently clamps to the last row.
3. **Empty-state deviation.** Designer §03 wants curves to render even with **zero** measurements when sex is set ("never apologetic"). I kept the existing #13 empty states (first-launch empty / per-metric nudge); the chart appears once a metric has ≥1 point. Low-risk to extend later; flagged so it's a conscious choice, not an oversight.
4. **Deferred per brief, untouched:** premature/corrected-age (uses actual age), designed >60mo treatment.

---

## Deploy steps (before this is live on prod)

1. **Run migration `0007_measurements_realtime.sql`** against the prod DB — without it, the chart still works but won't *live*-update on a peer's measurement (Part 5).
2. Run the **#12 2-device smoke check**; log the verdict.
3. Visual AA spot-check both themes.

---

## How to verify locally

```
cd web
npx tsc --noEmit          # clean
npx vitest run lib/growth # 6/6
node scripts/validate-who-lms.mjs  # ALL PASS
npx next build            # green
npm run dev               # โต tab: set เพศ in Settings → curves appear; clear it → prompt returns
```
