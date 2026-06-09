# Handoff #15 — PM → Dev · Growth chart real WHO LMS · ~3 days

| Field | Value |
|---|---|
| From | PM (Claude) |
| To | Developer + QA (Claude Code) |
| Date | 2026-06-07 |
| Re | Upgrade โต chart from decorative bands → real WHO Child Growth Standards percentile curves |
| Predecessor | `HANDOFF_designer_to_pm_who_chart.md` (Designer #15, accepted), `JOURNAL.md` (#15 entry merged), PRD §0.1 "Growth chart — WHO LMS percentile semantics" |
| Substance | Heaviest brief in the polish series. New offline-first LMS bundle (~1MB), real percentile math, SVG render. No schema change. |
| Routing | CPO routes Designer → Dev. After Dev close, CPO eyeballs + picks next (or beta opens if the polish series feels complete). |

---

## TL;DR

Replace the placeholder WHO bands with real percentile curves computed from official WHO LMS reference tables. Five curves (P3 / P15 / P50 / P85 / P97), smart axes, today's-age marker, tappable percentile readouts, WHO citation. Sex-required graceful degrade: sex stays optional in PRD §5; when unset, chart shows real points + axes + marker but **no curves** and a low-weight prompt to set it. Realtime re-plot via the existing activity path. Bundle the long-pending **#12 prod two-caregiver smoke check** with this fold — same realtime path.

Designer's deliverables are in `MiNom/design/`. The prototype LMS subset (`who_lms.js`) is approximate 0–24mo for authentic curve shape only — you'll replace it with the official 0–60mo tables.

---

## Inputs you'll work from

- `design/ละมุน WHO Chart.html` — 8 sections, light + dark, 360px, interactive (metric tab-swap recomputes curves + axes + points). Five chart states. 13 edge cases in §06. AA table in §07. Behavior + render spec in §08.
- `design/who_lms.js` — LMS math (`X(z) = M·(1+L·S·z)^(1/L)`, L=0 → `M·e^(S·z)`) + approximate 0–24mo sample. **Math is correct; tables are placeholder.**
- `design/{screens_who_chart,screens_who_chart_demo,section_who_chart,who_chart_app}.jsx` — render prototype to mirror in `PercentileChart.tsx`.
- `design/who_chart.css` — token-bound styles.
- `design/th-strings-who-chart-patch.js` — `TH_WHO_CHART` (axes, today-marker, percentile label, citation, sex-required prompt, out-of-range). **No removals.** #13 `growth.chartLabel` is superseded by the real axes + citation; retire if no other reference.
- PRD `§0.1 "Growth chart — WHO LMS percentile semantics"` — the spec authority for the chart's behavior.

---

## What to build (6 parts)

### Part 1 — Bundle the official WHO LMS tables (the engineering layer)

**Source.** `https://www.who.int/tools/child-growth-standards` → "Standards" → download the LMS tables.

**Four tables required**, each 0–60 months:
1. Weight-for-age — boys
2. Weight-for-age — girls
3. Length/height-for-age — boys
4. Length/height-for-age — girls

**Bundle shape.** Static JSON, imported at build time. Offline-first — chart must render without network. Total payload ≈ 1MB; fine for offline (no separate fetch).

```
web/lib/growth/who-lms-data/
  weight-for-age-boys.json     // [{ age_months, L, M, S }, ...]
  weight-for-age-girls.json
  height-for-age-boys.json     // length 0–24mo + height 24–60mo per WHO convention
  height-for-age-girls.json
web/lib/growth/who-lms.ts      // loader + LMS→percentile math (see Part 2)
```

**Data integrity note.** WHO ships these as Excel + text tables. Convert to JSON deterministically (one-off script in `web/scripts/`, committed alongside the JSON) so the provenance is auditable. Keep the source URL + download date + checksum in a header comment at the top of each JSON.

**Acceptance.** Math validates against published WHO values: boy median (P50) weight-for-age = **3.35 kg → 9.65 kg at 0 → 12 months**; a 3-month-old boy at 6.8 kg ≈ **71st percentile**. Designer's prototype already validates against these markers; reuse the same spot-checks as a unit test.

### Part 2 — LMS → percentile math (port + harden)

The math in `design/who_lms.js` is correct. Port to TypeScript in `web/lib/growth/who-lms.ts`:

```ts
// X(z) = M · (1 + L·S·z)^(1/L)   if L ≠ 0
// X(z) = M · exp(S·z)            if L == 0
// z-scores for P3/P15/P50/P85/P97: −1.881, −1.036, 0, +1.036, +1.881
export function percentileValue(lms: {L:number;M:number;S:number}, z: number): number
export function valueToPercentile(lms: {L:number;M:number;S:number}, x: number): number  // for the P{n} tooltip
export function lmsForAge(metric: 'weight'|'height', sex: 'boy'|'girl', ageMonths: number): {L:number;M:number;S:number}  // linear interpolation between bracketing rows
```

**Edge handling.**
- Age < 0 (newborn pre-birthdate, shouldn't happen): clamp to 0.
- Age > 60mo: return the 60mo LMS for curve continuity, mark out-of-range (Part 4 microcopy).
- Sex unset: callers don't reach the math (Part 4 degrade rule).

**Unit tests** (`web/lib/growth/__tests__/who-lms.test.ts`):
- WHO published P50 at 0, 6, 12 months (boy + girl, both metrics) within 0.01 kg / 0.1 cm.
- The 3mo 6.8kg boy ≈ 71st percentile case.
- Interpolation between LMS rows is monotonic.

### Part 3 — Render the chart (mirror the prototype)

New component `web/components/PercentileChart.tsx`, replacing the placeholder bands in the current `GrowthScreen.tsx`. SVG render, mirroring `design/section_who_chart.jsx`:

- **Curves.** P3 + P97 thin + dashed; P50 heavier solid; P15 + P85 solid (curve color `--grow`, P50 stronger). P15–P85 fill is a soft `--grow` tint (non-text, ≥3:1 reference context per Designer §07).
- **Smart X axis.** Window ≤ 6 months → unit = สัปดาห์ (weeks); otherwise เดือน (months). Auto-switch.
- **Smart Y axis.** Range = percentile envelope at the baby's current age (not a fixed scale). Auto-expand to fit any out-of-envelope point. Units = `กก.` (น้ำหนัก) or `ซม.` (ส่วนสูง).
- **Today's-age marker.** Dashed vertical at current age + flag `อายุ {n} สัปดาห์` / `อายุ {n} เดือน` (matches X unit).
- **Data series.** Dots in `--grow-strong` (#13 token), connected chronologically, latest ringed. Tap a point → opens the #13 detail sheet; tooltip shows `P{n}` percentile readout computed via `valueToPercentile`.
- **Citation.** `ข้อมูลอ้างอิงจาก WHO Child Growth Standards`, `--fg-muted`, real text, tappable to the WHO source URL.
- **Metric tabs.** น้ำหนัก ↔ ส่วนสูง — full swap (table + axis unit + Y range + points). Tab toggle is part of the chart screen, not the chart itself.

**Token discipline.** All text → `--fg` / `--fg-muted`. Verb fill → `--grow-strong`. Curves + band → `--grow` (non-text). **Never `--fg-faint` for text.** Citation is real text → `--fg-muted`. Matches the #08/#09/#11/#11b principle.

### Part 4 — Sex-required graceful degrade

PRD §5 stays untouched — sex remains optional at baby setup. Chart degrades, never blocks.

```
sex set      → full curves + data + per-point P{n} tooltip
sex unset    → axes + today-marker + data series only
                no curves (NEVER faked or sex-combined)
                low-weight tinted prompt:
                  ระบุเพศของลูก
                  เพื่อแสดงเส้นเปอร์เซ็นไทล์จาก WHO ที่แม่นยำสำหรับลูก
                  [ ตั้งค่าตอนนี้ ] ← white-on-`--grow-strong`, 5.52/7.3
                CTA navigates to baby settings (existing route)
sex set later → curves render going forward
                existing points stay (no migration)
                both tabs
```

The "never faked" rule is load-bearing: a "WHO" labelled chart with averaged-sex placeholder curves is worse than no curves because it reads authoritative but isn't. Degrade honestly.

Use `TH_WHO_CHART.growth.sexRequired.*` keys for microcopy.

### Part 5 — Realtime re-plot + #13 detail-sheet integration

The chart re-plots from the activity log via the existing realtime path Sleep + Eat already use. New measurements, edits via #13 detail sheet, deletes — all propagate to the chart within ~1s.

**Integration points.**
- `GrowthScreen.tsx` subscribes to growth-activity changes (same channel as #13).
- Point taps open the existing `GrowthDetailSheet.tsx` (#13, untouched in this brief).
- Tab swap re-reads the latest activity log on the new metric.

### Part 6 — Bundle the #12 prod two-caregiver smoke check

Long-pending from #12 + carried forward in #14's return. Run during this fold (same realtime path it's already exercising):

1. Two Leon test accounts on two devices.
2. Sleep flow: A starts → B sees Running → A pauses → B sees Paused → B resumes → A completes. Confirm attribution stays with A (the starter).
3. Eat-นมแม่ flow: A starts → B sees Running → A side-switches → B sees switch → A stops. Confirm `switches[]` log is correct + attribution = A.
4. Start-time edit flow (from #14): A starts Sleep → A edits started_at −10m → B sees the new started_at within ~1s; recalc consistent on both sides.
5. Clean up the test rows.

Log the result inline in the return handoff. If anything's off, separate the smoke-check delta from the #15 work in the return so we can route fixes cleanly.

---

## AA gate (Designer §07 — true sRGB)

Mirror these targets. Verify via canvas-resolved measurement (the #14 pattern):

| Element | Token | Target L / D |
|---|---|---|
| Axis labels, curve labels, citation, age caption, tab labels | `--fg-muted` | 5.52 / 6.84 |
| Today-marker flag text | `--fg` | 14.6 / 13.4 |
| Sex-prompt CTA (white-on-fill) | `--grow-strong` bg | 5.52 / 7.3 |
| Data series dots | `--grow-strong` | 5.68 / 7.31 |
| Curves + band (non-text reference) | `--grow` tints | ≥ 3:1 |

All text ≥ AA 4.5. No new `--fg-faint` text. `tsc` clean, `next build` green.

---

## Microcopy patch — drop in by key

From `design/th-strings-who-chart-patch.js` (`window.TH_WHO_CHART`). Merge into `web/locales/th.json`:

- `growth.axis.age` · `growth.axis.weeks` · `growth.axis.months` · `growth.axis.weight` · `growth.axis.height` · `growth.axis.kg` · `growth.axis.cm`
- `growth.todayWeeks` · `growth.todayMonths` · `growth.ageCaption`
- `growth.percentileLabel` · `growth.chartAria` · `growth.citation`
- `growth.sexRequired.title` · `growth.sexRequired.body` · `growth.sexRequired.cta`
- `growth.outOfRange`

No removals. `growth.chartLabel` from #13 is superseded by the real axes + citation; retire only if no other code references it.

---

## Deferred (do NOT build in this fold)

These are PRD §5 follow-ups, not scope for #15:

1. **Premature / corrected-age.** v1 uses actual age. Adding "weeks early" to the baby record + a corrected-age toggle is a separate brief.
2. **Designed >60mo treatment.** Microcopy is specced (`growth.outOfRange`); the designed surface is deferred. Beta is 0–12mo so this is rare; if it happens, render points against the 60mo envelope and stop curves at 60mo.

If you hit either during implementation, flag in the return — don't expand scope unilaterally.

---

## Estimate + sequencing

Designer estimated **~3 days**. PM agrees. Suggested sequencing:
1. **Day 1** — bundle the four WHO LMS JSONs + the conversion script + unit tests (Part 1 + Part 2).
2. **Day 2** — port + verify the math, ship `PercentileChart.tsx` (Part 3) + sex-degrade (Part 4).
3. **Day 3** — realtime/#13 integration (Part 5), AA pass, **#12 smoke check (Part 6)**, return brief.

---

## Handoff → PM (what you owe on close)

1. Code on `main` with the bundle + math + render + degrade + realtime + smoke-check result.
2. AA evidence (canvas-resolved L/D for each element, matching Designer §07 targets).
3. Math validation (the three published-WHO spot-checks pass; unit tests committed).
4. **#12 smoke-check verdict** — pass/fail per step + any deltas observed.
5. Anything that surfaced during the bundle (e.g., a row in WHO Excel that interpolates oddly, a license note on the data, etc.) flagged in the return so PM can fold into PRD §0.1 or §13.

Then PM picks the next baton — either Diaper polish or beta-opens-fully if CPO feels the polish series is complete.
