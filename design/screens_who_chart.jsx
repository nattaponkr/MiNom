// screens_who_chart.jsx — ละมุน Growth chart · WHO LMS percentile curves (Handoff #15)
// PercentileChart (real curves + axes + today marker + data dots), SexPrompt,
// Citation, metric tabs. Consumes window.WHO_LMS. AA: text → --fg/--fg-muted;
// data series → --grow-strong; curves → --grow tints (non-text).
const { useState: wcU } = React;
const WC = () => window.WHO_CHART;
const wcNum = (n, d = 1) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: d }).format(n);

// local icons not in the shared set
const IcInfo = ({ size = 14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" /></svg>);
const IcExternal = ({ size = 12 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" /></svg>);
const IcSparkle = ({ size = 20 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5Z" /></svg>);

// age helpers
const weeksOf = (mo) => Math.round(mo * 4.345);
function ageLabel(mo) {
  const T = WC();
  if (mo < 6) return T.todayWeeks.replace('{n}', String(weeksOf(mo)));
  return T.todayMonths.replace('{n}', String(Math.round(mo)));
}

// ---- the chart ----
// props: metric 'weight'|'height', sex 'boy'|'girl'|null, ageMo (today),
// points [{ageMo, value, dateBE}], onPick(i), onSetSex()
function PercentileChart({ metric, sex, ageMo, points = [], onPick }) {
  const [tip, setTip] = wcU(null);
  const L = window.WHO_LMS;
  const T = WC();
  const unit = metric === 'weight' ? T.kg : T.cm;

  // geometry
  const W = 340, H = 230;
  const pad = { l: 30, r: 14, t: 14, b: 30 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;

  // x-domain: 0 → today + ~2mo lookahead, capped at 60
  const ageMax = Math.min(L.MAX_AGE_MO, Math.max(3, Math.ceil((ageMo + 2) / 3) * 3));
  const youngScale = ageMax <= 6; // x in weeks if window is small
  const xOf = (mo) => pad.l + (mo / ageMax) * plotW;

  // y-domain from the visible percentile envelope (3rd..97th across the window) + data
  const showCurves = !!sex;
  let yMin = Infinity, yMax = -Infinity;
  let curves = [];
  if (showCurves) {
    [3, 15, 50, 85, 97].forEach((p) => {
      const pts = L.curve(metric, sex, p, 0, ageMax, ageMax > 12 ? 1 : 0.5);
      curves.push({ p, pts });
      pts.forEach((pt) => { if (pt.value < yMin) yMin = pt.value; if (pt.value > yMax) yMax = pt.value; });
    });
  }
  points.forEach((d) => { if (d.value < yMin) yMin = d.value; if (d.value > yMax) yMax = d.value; });
  if (!isFinite(yMin)) { yMin = metric === 'weight' ? 2 : 45; yMax = metric === 'weight' ? 12 : 90; }
  // pad y by ~8%
  const yPad = (yMax - yMin) * 0.08 || 1; yMin -= yPad; yMax += yPad;
  const ySpan = yMax - yMin;
  const yOf = (v) => pad.t + (1 - (v - yMin) / ySpan) * plotH;

  const pathOf = (pts) => pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${xOf(pt.age).toFixed(1)} ${yOf(pt.value).toFixed(1)}`).join(' ');

  // band between 15 & 85
  let bandPath = '';
  if (showCurves) {
    const c15 = curves.find((c) => c.p === 15).pts, c85 = curves.find((c) => c.p === 85).pts;
    bandPath = pathOf(c15) + ' ' + c85.slice().reverse().map((pt) => `L${xOf(pt.age).toFixed(1)} ${yOf(pt.value).toFixed(1)}`).join(' ') + ' Z';
  }

  // x ticks
  const xTicks = [];
  if (youngScale) { for (let w = 0; w <= ageMax * 4.345; w += 4) xTicks.push({ x: xOf(w / 4.345), label: String(w) }); }
  else { const stepM = ageMax > 24 ? 6 : (ageMax > 12 ? 3 : 2); for (let m = 0; m <= ageMax; m += stepM) xTicks.push({ x: xOf(m), label: String(m) }); }
  // y ticks (~5)
  const yTicks = [];
  const yStep = niceStep(ySpan / 4);
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push({ y: yOf(v), label: wcNum(v, metric === 'weight' ? 1 : 0) });

  const xToday = xOf(ageMo);

  return (
    <div className="wc-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${T.chartAria} · ${ageLabel(ageMo)}`}>
        {/* y grid + ticks */}
        {yTicks.map((t, i) => (
          <g key={'y' + i}>
            <line className="wc-grid" x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} />
            <text className="wc-axis-lbl" x={pad.l - 5} y={t.y + 3} textAnchor="end">{t.label}</text>
          </g>
        ))}
        {/* percentile band + curves */}
        {showCurves && <path className="wc-band" d={bandPath} />}
        {showCurves && curves.map(({ p, pts }) => (
          <g key={'c' + p}>
            <path className={'wc-curve' + (p === 50 ? ' median' : (p === 3 || p === 97 ? ' outer' : ''))} d={pathOf(pts)} />
            <text className="wc-curve-lbl" x={W - pad.r + 1} y={yOf(pts[pts.length - 1].value) + 3} textAnchor="start">{p}</text>
          </g>
        ))}
        {/* x axis */}
        <line className="wc-axis" x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} />
        {xTicks.map((t, i) => (
          <g key={'x' + i}>
            <line className="wc-axis-tick" x1={t.x} y1={H - pad.b} x2={t.x} y2={H - pad.b + 4} />
            <text className="wc-axis-lbl" x={t.x} y={H - pad.b + 14} textAnchor="middle">{t.label}</text>
          </g>
        ))}
        {/* axis titles */}
        <text className="wc-axis-title" x={(pad.l + W - pad.r) / 2} y={H - 2} textAnchor="middle">{T.ageAxis} ({youngScale ? T.weeks : T.months})</text>
        <text className="wc-axis-title" transform={`translate(9 ${(pad.t + H - pad.b) / 2}) rotate(-90)`} textAnchor="middle">{metric === 'weight' ? T.weightAxis : T.heightAxis} ({unit})</text>

        {/* today marker */}
        {ageMo <= ageMax && (
          <g>
            <line className="wc-today" x1={xToday} y1={pad.t} x2={xToday} y2={H - pad.b} />
            <g transform={`translate(${Math.min(xToday, W - pad.r - 44)} ${pad.t})`}>
              <rect className="wc-today-flag" x="0" y="-1" width={ageLabel(ageMo).length * 5.4 + 12} height="15" rx="4" />
              <text className="wc-today-flag-tx" x="6" y="10">{ageLabel(ageMo)}</text>
            </g>
          </g>
        )}

        {/* data series */}
        {points.length > 1 && <path className="wc-trend" d={points.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(d.ageMo).toFixed(1)} ${yOf(d.value).toFixed(1)}`).join(' ')} />}
        {points.map((d, i) => {
          const latest = i === points.length - 1;
          return (
            <g key={i}>
              {latest && <circle className="wc-dot-ring" cx={xOf(d.ageMo)} cy={yOf(d.value)} r="9" />}
              <circle className={'wc-dot' + (latest ? ' latest' : '') + (tip === i ? ' active' : '')} cx={xOf(d.ageMo)} cy={yOf(d.value)} r={latest ? 5.5 : 4.5} />
              <circle className="wc-hit" cx={xOf(d.ageMo)} cy={yOf(d.value)} r="22" tabIndex={0} role="button"
                aria-label={`${wcNum(d.value)} ${unit} · ${d.dateBE}`}
                onClick={() => onPick && onPick(i)} onMouseEnter={() => setTip(i)} onMouseLeave={() => setTip(null)}
                onFocus={() => setTip(i)} onBlur={() => setTip(null)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick && onPick(i); } }} />
            </g>
          );
        })}
      </svg>

      {tip != null && points[tip] && (
        <div className="wc-tip" style={{ left: `${(xOf(points[tip].ageMo) / W) * 100}%`, top: `${(yOf(points[tip].value) / H) * 100}%` }}>
          {wcNum(points[tip].value)} {unit}
          {sex && <span className="pct">P{Math.round(window.WHO_LMS.pctRank(window.WHO_LMS.zScore(metric, sex, points[tip].ageMo, points[tip].value)))}</span>}
          <span className="d">{points[tip].dateBE}</span>
        </div>
      )}
    </div>
  );
}

function niceStep(raw) {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const s = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return s * pow;
}

// ---- metric tabs ----
function MetricTabs({ metric, onChange }) {
  const T = WC();
  return (
    <div className="wc-tabs" role="tablist" lang="th">
      <button className={'wc-tab' + (metric === 'weight' ? ' on' : '')} role="tab" aria-selected={metric === 'weight'} onClick={() => onChange('weight')} type="button"><IcGrow size={16} /> {T.weight}</button>
      <button className={'wc-tab' + (metric === 'height' ? ' on' : '')} role="tab" aria-selected={metric === 'height'} onClick={() => onChange('height')} type="button"><IcGrow size={16} /> {T.height}</button>
    </div>
  );
}

// ---- WHO citation ----
function Citation() {
  const T = WC();
  return (
    <div className="wc-cite" lang="th">
      <IcInfo size={13} />
      <a href="https://www.who.int/tools/child-growth-standards" target="_blank" rel="noopener noreferrer">{T.citation} <IcExternal size={11} /></a>
    </div>
  );
}

// ---- sex-required prompt (graceful degrade) ----
function SexPrompt({ onSetSex }) {
  const T = WC();
  return (
    <div className="wc-sexreq" lang="th" role="status">
      <span className="wc-sexreq-ic"><IcSparkle size={20} /></span>
      <span className="wc-sexreq-meta">
        <span className="wc-sexreq-t">{T.sexTitle}</span>
        <span className="wc-sexreq-b">{T.sexBody}</span>
      </span>
      <button className="wc-sexreq-cta" type="button" onClick={onSetSex}>{T.sexCta}</button>
    </div>
  );
}

// age caption under chart
function AgeCaption({ ageMo }) {
  const T = WC();
  const w = weeksOf(ageMo);
  return <div className="wc-agecap" lang="th">{T.ageCap} <b>{ageLabel(ageMo)}</b>{ageMo >= 6 ? <span style={{ color: 'var(--fg-faint)', fontWeight: 600 }}> · {w} {T.weeks}</span> : null}</div>;
}

Object.assign(window, { PercentileChart, MetricTabs, Citation, SexPrompt, AgeCaption, wcAgeLabel: ageLabel, wcWeeksOf: weeksOf, wcNum });
