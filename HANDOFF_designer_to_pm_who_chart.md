# Handoff — Designer → PM · Growth chart · real WHO LMS (Handoff #15 return)

| Field | Value |
|---|---|
| From | Designer (Claude Design) |
| To | PM (Claude) |
| Date | 2026-06-07 |
| Re | โต chart upgraded to real WHO Child Growth Standards percentile curves |
| Routed by | returns to PM → extend PRD §5 + substantial Dev fold (~3 days) |
| Status | Shipped — 8 sections, 5 chart states, sex-degrade, AA gate passed. Interactive verified. |

---

## TL;DR

The โต chart goes decorative → diagnostic: real WHO LMS percentile curves (3/15/50/85/97), labeled age + weight/height axes, a today's-age marker, tappable percentile readouts, and a WHO citation. When sex isn't set the chart **degrades honestly** — real points + axes, no faked curves — and prompts to set it. The honesty is the point: a "WHO" label on placeholder data would read authoritative-but-false, which is why Tier 2 (real data) was the right call over Tier 1 (polish).

**Deliverable:** `ละมุน WHO Chart.html` — 8 sections, light + dark, live (metric tab-swap recomputes curves/axes/points).

## What shipped
- **Real curves** — computed from WHO LMS (`X(z)=M·(1+L·S·z)^(1/L)`). 50th heavier; 3rd/97th thin+dashed; 15–85 soft-tinted "expected range". Math validated vs published WHO values.
- **Smart axes** — X = age (weeks ≤6mo, months otherwise); Y = kg/cm per tab, range from the percentile envelope (not a fixed scale), auto-expands to fit any point.
- **Today's-age marker** — dashed vertical + `อายุ {n} สัปดาห์/เดือน`. Age, not date (BE-lock N/A).
- **Data series** — `--grow-strong` dots, chronological trend line, latest ringed; tap → #13 detail sheet; tap → P{n} percentile readout.
- **Citation** — `ข้อมูลอ้างอิงจาก WHO Child Growth Standards`, tappable, `--fg-muted` (real text).
- **Metric tabs** — น้ำหนัก ↔ ส่วนสูง swaps table + axis + points (verified live).

## Sex dependency — your call, implemented
Sex stays **optional** (PRD §5, untouched). Sex set → full curves + dot percentiles. Sex unset → points + axes + marker + a low-weight prompt `ระบุเพศของลูก · ตั้งค่าตอนนี้` → baby settings; **no curves, never combined/faked**. Set later → curves render, points stay, no migration. Both tabs.

## States + edges
Five states (sex set + 0/1/multiple; sex unset; both tabs) in §02–04. The 13 edge cases in §06 — newborn, out-of-y-range auto-expand, sex-set-later, boy↔girl swap, >60mo, premature (deferred), realtime/edit/delete-all, switch-tab-while-prompt.

## AA (both themes, true sRGB)
Axis/curve/citation/tab text `--fg-muted` 5.52/6.84 or `--fg` 14.6/13.4; today-flag 14.6/13.4; sex CTA white-on-`--grow-strong` 5.52/7.3; data series `--grow-strong` 5.68/7.31. Curves + band are non-text `--grow` tints (≥3:1, reference context). Citation real text → never `--fg-faint`. Full table §07.

## For Dev (substantial — ~3 days)
- Patch: `th-strings-who-chart-patch.js` (TH_WHO_CHART). No removals; #13 `growth.chartLabel` superseded.
- `who_lms.js` — the LMS math + an **approximate 0–24mo** sample table (authentic curve shape). **Bundle the official 0–60mo tables** (weight-for-age + length/height-for-age, boys + girls) as static JSON (~1MB, offline-first).
- Render: SVG chart as prototyped — curves, band, axes, marker, dots, tooltips. Sex-prompt nav. Realtime re-plot via the existing activity path. AA pass.

## Flags for PM
1. **Extend PRD §5** — chart semantics + sex-required graceful-degrade (sex stays optional; chart degrades, never blocks).
2. **Premature/corrected-age** — v1 uses actual age; §5 follow-up.
3. **>60mo out-of-range** — microcopy specced, designed treatment deferred (beta 0–12mo).
4. **LMS bundle is Dev's domain** — prototype table is approximate; official 0–60mo tables required before public launch.

## File placement (merge, don't nest)
- `JOURNAL_designer_15.md` → prepend to `MiNom/JOURNAL.md`
- `HANDOFF_designer_to_pm_who_chart.md` → `MiNom/` root
- `who_lms.js`, `who_chart.css`, `screens_who_chart.jsx`, `screens_who_chart_demo.jsx`, `section_who_chart.jsx`, `who_chart_app.jsx`, `th-strings-who-chart.js`, `th-strings-who-chart-patch.js`, `ละมุน WHO Chart.html` → `MiNom/design/`

## Parked (per the brief)
Diaper pick + #12 multi-caregiver smoke check stay on hold; bundle the smoke check with this Dev fold (same realtime path it'll already be exercising).

## Handoff → PM (Claude)
Accept + extend PRD §5; route the substantial Dev fold; bundle the #12 smoke check with it. After Dev close, CPO eyeballs + picks next (or beta opens if the polish series feels complete).
