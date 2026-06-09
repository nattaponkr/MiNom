"use client";
// PercentileChart — real WHO Child Growth Standards percentile curves (#15).
// Mirrors design/screens_who_chart.jsx, backed by lib/growth/who-lms.ts (the
// committed LMS math, Parts 1–2). Replaces the #13 decorative bands.
//
//   • Curves (P3/15/50/85/97) render only when `sex` is set — never faked or
//     sex-combined (Part 4 "degrade honestly"). Sex unset → axes + today-marker
//     + data points only; the SexPrompt sits below the chart (in GrowthScreen).
//   • Smart X axis: weeks when the window ≤6mo, else months. Smart Y axis: the
//     percentile envelope at the baby's age, auto-expanding to fit any point.
//   • Today's-age marker, tappable dots → #13 detail sheet, per-point P{n} tip.
//
// AA: chart text → --fg/--fg-muted; data series → --grow-strong; curves + band
// → --grow tints (non-text). See styles/components.css (.wc-*).
import { useState } from "react";
import { PERCENTILES, sampleCurve, lmsForAge, valueToPercentile, WHO_MAX_MONTHS, type GrowthMetric, type Sex } from "@/lib/growth/who-lms";
import { num } from "@/lib/format";
import { t } from "@/i18n";

export type ChartPoint = { ageMo: number; value: number; dateBE: string };

const AVG_MONTH_DAYS = 30.4375; // 365.25 / 12
export const ageMonthsBetween = (birthdateISO: string, atISO: string): number =>
  Math.max(0, (new Date(atISO).getTime() - new Date(birthdateISO).getTime()) / (1000 * 60 * 60 * 24) / AVG_MONTH_DAYS);

const weeksOf = (mo: number) => Math.round(mo * 4.345);
export function ageLabel(mo: number): string {
  return mo < 6 ? t("growth.todayWeeks", { n: weeksOf(mo) }) : t("growth.todayMonths", { n: Math.round(mo) });
}

function niceStep(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const s = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return s * pow;
}

// props: metric, sex (null → no curves), ageMo (today), points (chronological), onPick(chronoIndex)
export default function PercentileChart({
  metric,
  sex,
  ageMo,
  points = [],
  onPick,
}: {
  metric: GrowthMetric;
  sex: Sex | null;
  ageMo: number;
  points?: ChartPoint[];
  onPick?: (chronoIndex: number) => void;
}) {
  const [tip, setTip] = useState<number | null>(null);
  const unit = metric === "weight" ? t("growth.axis.kg") : t("growth.axis.cm");

  // geometry
  const W = 340,
    H = 230;
  const pad = { l: 30, r: 16, t: 14, b: 30 };
  const plotW = W - pad.l - pad.r,
    plotH = H - pad.t - pad.b;

  // x-domain: 0 → today + ~2mo lookahead (rounded to a clean 3mo step), capped at the WHO max.
  const ageMax = Math.min(WHO_MAX_MONTHS, Math.max(3, Math.ceil((ageMo + 2) / 3) * 3));
  const youngScale = ageMax <= 6; // x in weeks when the window is small
  const xOf = (mo: number) => pad.l + (mo / ageMax) * plotW;

  // y-domain from the visible percentile envelope (3rd..97th across the window) ∪ data.
  const showCurves = !!sex;
  let yMin = Infinity,
    yMax = -Infinity;
  const curves: { p: number; pts: { age: number; value: number }[] }[] = [];
  if (showCurves && sex) {
    for (const p of PERCENTILES) {
      const pts = sampleCurve(metric, sex, p, 0, ageMax, ageMax > 12 ? 1 : 0.5);
      curves.push({ p, pts });
      for (const pt of pts) {
        if (pt.value < yMin) yMin = pt.value;
        if (pt.value > yMax) yMax = pt.value;
      }
    }
  }
  for (const d of points) {
    if (d.value < yMin) yMin = d.value;
    if (d.value > yMax) yMax = d.value;
  }
  if (!isFinite(yMin)) {
    yMin = metric === "weight" ? 2 : 45;
    yMax = metric === "weight" ? 12 : 90;
  }
  const yPad = (yMax - yMin) * 0.08 || 1;
  yMin -= yPad;
  yMax += yPad;
  const ySpan = yMax - yMin;
  const yOf = (v: number) => pad.t + (1 - (v - yMin) / ySpan) * plotH;

  const pathOf = (pts: { age: number; value: number }[]) => pts.map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.age).toFixed(1)} ${yOf(pt.value).toFixed(1)}`).join(" ");

  // band between the 15th & 85th ("expected range")
  let bandPath = "";
  if (showCurves) {
    const c15 = curves.find((c) => c.p === 15)!.pts;
    const c85 = curves.find((c) => c.p === 85)!.pts;
    bandPath = pathOf(c15) + " " + c85.slice().reverse().map((pt) => `L${xOf(pt.age).toFixed(1)} ${yOf(pt.value).toFixed(1)}`).join(" ") + " Z";
  }

  // x ticks
  const xTicks: { x: number; label: string }[] = [];
  if (youngScale) {
    for (let w = 0; w <= ageMax * 4.345; w += 4) xTicks.push({ x: xOf(w / 4.345), label: String(w) });
  } else {
    const stepM = ageMax > 24 ? 6 : ageMax > 12 ? 3 : 2;
    for (let m = 0; m <= ageMax; m += stepM) xTicks.push({ x: xOf(m), label: String(m) });
  }
  // y ticks (~5)
  const yTicks: { y: number; label: string }[] = [];
  const yStep = niceStep(ySpan / 4);
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push({ y: yOf(v), label: num(v) });

  const xToday = xOf(ageMo);
  const flagW = ageLabel(ageMo).length * 5.4 + 12;

  return (
    <div className="wc-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t("growth.chartAria")} · ${ageLabel(ageMo)}`}>
        {/* y grid + ticks */}
        {yTicks.map((tk, i) => (
          <g key={"y" + i}>
            <line className="wc-grid" x1={pad.l} y1={tk.y} x2={W - pad.r} y2={tk.y} />
            <text className="wc-axis-lbl" x={pad.l - 5} y={tk.y + 3} textAnchor="end">
              {tk.label}
            </text>
          </g>
        ))}

        {/* percentile band + curves (sex set only) */}
        {showCurves && <path className="wc-band" d={bandPath} />}
        {showCurves &&
          curves.map(({ p, pts }) => (
            <g key={"c" + p}>
              <path className={"wc-curve" + (p === 50 ? " median" : p === 3 || p === 97 ? " outer" : "")} d={pathOf(pts)} />
              <text className="wc-curve-lbl" x={W - pad.r + 1} y={yOf(pts[pts.length - 1].value) + 3} textAnchor="start">
                {p}
              </text>
            </g>
          ))}

        {/* x axis */}
        <line className="wc-axis" x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} />
        {xTicks.map((tk, i) => (
          <g key={"x" + i}>
            <line className="wc-axis-tick" x1={tk.x} y1={H - pad.b} x2={tk.x} y2={H - pad.b + 4} />
            <text className="wc-axis-lbl" x={tk.x} y={H - pad.b + 14} textAnchor="middle">
              {tk.label}
            </text>
          </g>
        ))}

        {/* axis titles */}
        <text className="wc-axis-title" x={(pad.l + W - pad.r) / 2} y={H - 2} textAnchor="middle">
          {t("growth.axis.age")} ({youngScale ? t("growth.axis.weeks") : t("growth.axis.months")})
        </text>
        <text className="wc-axis-title" transform={`translate(9 ${(pad.t + H - pad.b) / 2}) rotate(-90)`} textAnchor="middle">
          {metric === "weight" ? t("growth.axis.weight") : t("growth.axis.height")} ({unit})
        </text>

        {/* today's-age marker */}
        {ageMo <= ageMax && (
          <g>
            <line className="wc-today" x1={xToday} y1={pad.t} x2={xToday} y2={H - pad.b} />
            <g transform={`translate(${Math.min(xToday, W - pad.r - flagW)} ${pad.t})`}>
              <rect className="wc-today-flag" x="0" y="-1" width={flagW} height="15" rx="4" />
              <text className="wc-today-flag-tx" x="6" y="10">
                {ageLabel(ageMo)}
              </text>
            </g>
          </g>
        )}

        {/* data series */}
        {points.length > 1 && <path className="wc-trend" d={points.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(d.ageMo).toFixed(1)} ${yOf(d.value).toFixed(1)}`).join(" ")} />}
        {points.map((d, i) => {
          const latest = i === points.length - 1;
          return (
            <g key={i}>
              {latest && <circle className="wc-dot-ring" cx={xOf(d.ageMo)} cy={yOf(d.value)} r="9" />}
              <circle className={"wc-dot" + (latest ? " latest" : "") + (tip === i ? " active" : "")} cx={xOf(d.ageMo)} cy={yOf(d.value)} r={latest ? 5.5 : 4.5} />
              <circle
                className="wc-hit"
                cx={xOf(d.ageMo)}
                cy={yOf(d.value)}
                r="22"
                tabIndex={0}
                role="button"
                aria-label={`${num(d.value)} ${unit} · ${d.dateBE}`}
                onClick={() => onPick?.(i)}
                onMouseEnter={() => setTip(i)}
                onMouseLeave={() => setTip(null)}
                onFocus={() => setTip(i)}
                onBlur={() => setTip(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPick?.(i);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>

      {tip != null && points[tip] && (
        <div className="wc-tip" style={{ left: `${(xOf(points[tip].ageMo) / W) * 100}%`, top: `${(yOf(points[tip].value) / H) * 100}%` }}>
          {num(points[tip].value)} {unit}
          {sex && <span className="pct">P{Math.round(valueToPercentile(lmsForAge(metric, sex, points[tip].ageMo), points[tip].value))}</span>}
          <span className="d">{points[tip].dateBE}</span>
        </div>
      )}
    </div>
  );
}

// ---- chart-adjacent pieces (mirror design/screens_who_chart.jsx) ----

const IcInfo = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5v.5" />
  </svg>
);
const IcExternal = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 5h5v5M19 5l-8 8M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
  </svg>
);
const IcSparkle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5Z" />
  </svg>
);

const WHO_SOURCE_URL = "https://www.who.int/tools/child-growth-standards";

// Tappable WHO attribution — real text (--fg-muted), opens the source in a new tab.
export function Citation() {
  return (
    <div className="wc-cite" lang="th">
      <IcInfo size={13} />
      <a href={WHO_SOURCE_URL} target="_blank" rel="noopener noreferrer">
        {t("growth.citation")} <IcExternal size={11} />
      </a>
    </div>
  );
}

// Graceful-degrade prompt shown when sex is unset (Part 4). CTA → baby settings.
export function SexPrompt({ onSetSex }: { onSetSex: () => void }) {
  return (
    <div className="wc-sexreq" lang="th" role="status">
      <span className="wc-sexreq-ic">
        <IcSparkle size={20} />
      </span>
      <span className="wc-sexreq-meta">
        <span className="wc-sexreq-t">{t("growth.sexRequired.title")}</span>
        <span className="wc-sexreq-b">{t("growth.sexRequired.body")}</span>
      </span>
      <button className="wc-sexreq-cta" type="button" onClick={onSetSex}>
        {t("growth.sexRequired.cta")}
      </button>
    </div>
  );
}

// "วันนี้ลูก อายุ N สัปดาห์/เดือน" caption under the chart.
export function AgeCaption({ ageMo }: { ageMo: number }) {
  const w = weeksOf(ageMo);
  return (
    <div className="wc-agecap" lang="th">
      {t("growth.ageCaption")} <b>{ageLabel(ageMo)}</b>
      {ageMo >= 6 ? (
        <span style={{ color: "var(--fg-faint)", fontWeight: 600 }}>
          {" · "}
          {w} {t("growth.axis.weeks")}
        </span>
      ) : null}
    </div>
  );
}
