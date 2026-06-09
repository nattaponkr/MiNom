# Handoff #15 — PM → Designer

| Field | Value |
|---|---|
| From | PM (Claude) |
| To | Designer (Claude Design) |
| Date | 2026-06-07 |
| Routed by | CPO (Nattapon) — attaching live screenshot of current decorative chart |
| Stage gate | Growth (โต) chart — **real WHO LMS data + percentile curves**. Brings forward the queued pre-public-launch data work. |
| Effort | Medium-large — ~2 days design + ~3 days Dev once Designer ships. Multi-day scope; the data + math + chart-rendering layer is substantial. |

---

## 0. AA gate (standing rule from #08/#09/#10/#11/#11b/#12/#13/#14)

Both themes, documented true-sRGB ratios for every primary text element against its rendered surface. Real-scale screenshot proof. Cumulative discipline from `design/brand.css` applies. Especially: percentile curve labels, axis labels, citation text, and the new sex-required prompt. Treat as a gate, not a constraint.

---

## TL;DR

CPO eyeballed the live โต chart and rightly called out: it looks more decorative than useful. Four asks:
1. Axis labels (what is x-axis, y-axis, value).
2. WHO citation.
3. Show baby's current age in weeks.
4. Connect the dots that we need birthday (note: we already collect it at baby setup; this is just connecting axis math to existing data).

CPO chose **Tier 2 — real WHO LMS data + percentile curves**, bringing forward the queued pre-public-launch work. The polish-only path (Tier 1) was rejected because adding WHO citation + readable axes on placeholder data is internally inconsistent: it reads as authoritative when it isn't.

This brief specs: real percentile curves (3/15/50/85/97), proper x-axis (age in weeks/months), y-axis (kg/cm), citation, today's age marker. Plus a sex-required prompt (sex is currently optional at baby setup — we keep it optional but require it for accurate percentile display).

---

## Read first

- The screenshot CPO is attaching — current decorative chart with two measurements.
- `design/ละมุน Growth Polish.html` (#13) — the surrounding screen treatment that just landed. Chart is *inside* the existing polish; we're upgrading the chart itself.
- PRD §5 (Growth section) — current scope is weight + height only. Head circumference is cut. Stays cut.
- PRD §5 baby setup — name + birthdate required, sex optional. We're not changing this lock; we'll work around it (see Sex Dependency below).
- WHO Child Growth Standards reference: https://www.who.int/tools/child-growth-standards — the official source for the LMS reference tables Dev will bundle.

---

## What CPO surfaced

| CPO ask | Resolution |
|---|---|
| Axis labels (x, y, value) | Yes — x-axis = age (weeks for young / months for older); y-axis = weight (kg) or height (cm) based on selected tab |
| WHO citation | Small attribution line under the chart: "ข้อมูลอ้างอิงจาก WHO Child Growth Standards" + tappable link |
| Show age in weeks | Vertical "today" marker on the x-axis labeled with the baby's current age |
| Need to collect birthday | Already collected at baby setup (PRD §5 required); just use existing data |

---

## Sex dependency — PM call

**WHO LMS reference data is sex-specific** (boys and girls have meaningfully different growth curves; combining them would be inaccurate). Our PRD has sex as **optional** at baby setup.

**Don't change the PRD lock.** Keep sex optional. Instead, gracefully degrade the chart when sex isn't set:

- When sex is **set**: show full percentile curves + percentile labels + today's-age marker + data points + citation.
- When sex is **not set**: show data points + today's-age marker + axes + a clear inline prompt — "**ระบุเพศของลูกเพื่อดูเปอร์เซ็นไทล์**" — tappable to baby settings (`/baby/edit` or wherever sex is editable). Don't show curves at all in this state. Don't show fake / combined curves; that defeats the honesty the Tier 2 choice was about.

Designer specs the visual treatment of the prompt; PM lean: a soft banner above or below the chart area, on-brand voice, low visual weight.

---

## The chart

### Structure

| Layer | Content |
|---|---|
| **Background** | Soft grid; muted dividers |
| **Percentile curves** | 5 curves: 3rd, 15th, 50th, 85th, 97th. Standard WHO convention. The 50th (median) gets a slightly heavier visual treatment. Fill between 15th and 85th with a very light tint to visually communicate "expected range." |
| **Axes** | X = age (weeks if baby is < 6 months; months otherwise — smart switching). Y = weight (kg) or height (cm) per selected tab. Both axes labeled clearly with units. |
| **Today marker** | Vertical line at the baby's current age position. Small label at top or bottom showing `อายุ {n} สัปดาห์` (or months). |
| **Data points** | Each measurement plotted as a dot (`--grow-strong` color from #13). Connected by a thin line in chronological order. Most recent point slightly larger or with a ring. |
| **Citation** | Small attribution below the chart, distinct from the chart caption. `ข้อมูลอ้างอิงจาก WHO Child Growth Standards` (linkable). |

### Range

- **X-axis range:** birth (0 weeks) to baby's current age + a small lookahead margin (~2 months) so the projection visual makes sense.
- **Y-axis range:** computed from the percentile range relevant to baby's current age. Don't fix a constant range across all ages (a newborn 4kg point on a "0–20 kg" scale is unreadable).
- **For older babies (> 60 months):** WHO's reference data ends at 60 months. Designer specs a "outside reference range" state for ages beyond this. PM lean: not in v1 scope — most babies in beta will be 0–12 months. Note it for future.

### Tap interactions

- Tap a data point → opens the activity detail sheet (existing from #13 — no change).
- Tap the citation → opens the WHO source in a new tab.
- Tap the sex-required prompt (when shown) → navigates to baby settings.

### Switching metric tabs (น้ำหนัก ↔ ส่วนสูง)

- The percentile curves swap to the matching metric (weight-for-age vs length/height-for-age).
- The y-axis label + range recompute.
- Data points swap to the matching metric's measurements.
- Sex requirement applies to both metrics equally.

---

## WHO LMS reference data

Source: WHO Child Growth Standards (https://www.who.int/tools/child-growth-standards). Public-domain reference data; free for use with citation.

**Tables needed:**
- Weight-for-age, boys (0–60 months)
- Weight-for-age, girls (0–60 months)
- Length-for-age (0–24 months) + Height-for-age (24–60 months), boys
- Length-for-age (0–24 months) + Height-for-age (24–60 months), girls

The LMS parameters (L, M, S per age per sex) let you compute the z-score for any measurement, then convert to percentile. Standard math — Dev handles. Sample formula: `z = ((measurement/M)^L − 1) / (L·S)` for L ≠ 0; `z = ln(measurement/M) / S` for L = 0. PM is not specifying the values — Dev fetches from the WHO source.

**Bundle strategy** (Dev's call, PM lean):
- Bundle the LMS tables as static JSON shipped with the app (~1MB compressed estimate). Always works offline. No need to fetch at runtime.
- Designer doesn't need to think about this layer; it's an engineering concern. Flagging so the brief is complete.

---

## Microcopy keys

| Key | Suggested Thai (Designer finalizes) | Purpose |
|---|---|---|
| `growth.axis.weeks` | `สัปดาห์` | x-axis unit (young babies) |
| `growth.axis.months` | `เดือน` | x-axis unit (older babies) |
| `growth.axis.kg` | `กก.` | y-axis unit for weight |
| `growth.axis.cm` | `ซม.` | y-axis unit for height |
| `growth.todayMarker` | `อายุ {n} สัปดาห์` / `อายุ {n} เดือน` | today's age label |
| `growth.percentileLabel` | `เปอร์เซ็นไทล์ที่ {n}` | curve label (3/15/50/85/97) |
| `growth.citation` | `ข้อมูลอ้างอิงจาก WHO Child Growth Standards` | citation text |
| `growth.sexRequired.title` | `ระบุเพศของลูก` | prompt title |
| `growth.sexRequired.body` | `เพื่อแสดงเปอร์เซ็นไทล์จาก WHO ที่แม่นยำสำหรับลูก` (or similar — Designer's voice) | prompt body |
| `growth.sexRequired.cta` | `ตั้งค่าตอนนี้` | prompt CTA |
| `growth.outOfRange` | `เกินช่วงอ้างอิงของ WHO (0–60 เดือน)` | for babies > 60 months (v1: probably never shown; flagged for completeness) |

---

## Edge cases (CPO consistently asks for careful thinking here)

1. **Baby's age = 0 (newborn, day 0).** Curves start at the first WHO data point (typically day 0 or week 0). Data point at x = 0 is valid.
2. **Only one measurement so far.** Single data point + connecting line is just the point. Percentile curves still render normally. Today's age marker still shows.
3. **No measurements yet (empty state).** Chart shows percentile curves (if sex set) + today's age marker + axes. ประวัติ empty state already specced in #13. The chart itself doesn't say "no data" — the percentile curves are the chart; data points are overlay.
4. **Sex is set later, after measurements already exist.** When sex changes from unset to set, the chart re-renders with curves. Data points stay. No data migration needed.
5. **Sex changes from boys to girls (unusual but possible).** Same re-render. We don't store any sex-dependent precomputation, so a sex change just swaps which LMS table is used.
6. **Premature baby (corrected age vs actual age).** WHO has separate guidance for premature babies (corrected age = actual age − weeks early until ~age 2). **Out of v1 scope.** Use actual age. Flag as a future enhancement; mention in PRD §5 follow-up.
7. **Measurement value beyond chart y-axis range.** Auto-expand the y-axis to fit the data point, or clip with an indicator. Designer's call. PM lean: auto-expand; never hide a real measurement.
8. **Birthday in the future (data entry error).** Already prevented at baby setup per existing validation. No special chart handling needed.
9. **Birthday > 60 months ago.** Mark beyond range; show data points without curves. v1 corner case; defer designed treatment.
10. **Switching metric while sex prompt is showing.** Prompt stays; same prompt applies for both metrics. Tab swap is normal.
11. **Realtime sync with multi-caregiver.** Another caregiver adds a measurement → data point appears within ~1.5s. Same realtime path as activities. No new wiring.
12. **Editing a measurement (from #13 detail sheet).** Chart re-plots with new values. Same realtime path.
13. **Deleting all measurements.** Chart returns to "curves only + age marker + sex prompt if needed" state.

---

## What's already locked (don't re-litigate)

- **Sex stays optional at baby setup** (PRD §5). Don't propose making it required. The chart's "set sex to see percentile" prompt is the right pattern.
- **Weight + height only.** Head circumference still cut per v0.2. Not adding back.
- **`--grow-strong` for data points + chart text** per #13. Curves should use a distinct treatment — soft tints between curves; the 50th line slightly heavier; outer percentiles (3rd/97th) thinner. Designer's call within the system tokens. The `growth.chartLabel` repointed to `--fg-muted` per #13.
- **BE-date format** (PRD §11.1 / 2026-06-05) — all dates use BE. The "today" marker uses age, not a date, so this doesn't directly apply but worth noting.
- **No predictions / forecasts.** Chart shows reality + reference. No "your baby will weigh X by month 6" projection. That's a different feature.
- **No PDF export / share-with-pediatrician.** Future feature; not this round.
- **No BMI / weight-for-length.** Not in v1 scope.
- **No corrected-age handling for premature babies.** v1 uses actual age. Note for future.

---

## Deliverables

1. Updated spec doc — the chart in all states: (a) sex set + 0 measurements; (b) sex set + 1 measurement; (c) sex set + multiple measurements; (d) sex unset; (e) both metric tabs. Light + dark, 360px.
2. **WHO-Child-Growth-Standards citation treatment** — small attribution; clickable.
3. **Sex-required prompt** — visual treatment in context.
4. AA audit table per §0. All new text elements + percentile curve colors + grid lines + today marker.
5. `th-strings-who-chart-patch.js` with the new microcopy keys.
6. Real-phone-scale screenshots, both themes — at least the five chart states above.
7. Journal entry: `## YYYY-MM-DD — Designer — Growth chart (real WHO LMS) shipped` + `Handoff → PM`.

## Out of scope

- Head circumference, BMI, weight-for-length.
- Predictions / projections.
- Corrected-age for premature babies.
- PDF export.
- Sharing with pediatrician.
- Editing percentile curves' colors deeply (use existing system tokens with the curve discipline above).
- The activity detail sheet + history rows (already done in #13).

---

## When you're done

Journal → PM accepts + extends PRD §5 with the new chart semantics + sex-required graceful-degrade pattern → Dev fold. Dev side is **substantial** (~3 days): bundle WHO LMS data; implement LMS-to-percentile math; render the chart (likely SVG or canvas); wire the sex-prompt navigation; AA pass.

After Dev close, CPO eyeballs and picks the next polish target (or beta opens if the polish series feels complete).

---

## A note on the smoke check + Diaper

The two parallel items I surfaced last turn (Diaper pick + #12 smoke check) are now on hold while this larger Growth chart work runs. PM lean: bundle the smoke check with the eventual Dev fold from this brief (Dev will be exercising the multi-caregiver realtime path during the chart work anyway — same data path as `runningEat`/`runningSleep`). Diaper pick can wait until after the chart lands.
