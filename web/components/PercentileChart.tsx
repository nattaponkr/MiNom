"use client";
// Ported from the design (ui.jsx PercentileChart). Decorative WHO percentile
// bands + the baby's actual plotted points (normalized to the data range so the
// trend is legible). NOTE: exact WHO LMS reference curves need the reference
// dataset — flagged for a data task; bands here are representative placeholders.
export default function PercentileChart({ values, accent = "var(--grow)" }: { values: number[]; accent?: string }) {
  const W = 320;
  const H = 188;
  const pad = { l: 12, r: 12, t: 12, b: 16 };
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const span = max - min || 1;
  const n = values.length;
  const px = (i: number) => pad.l + (n <= 1 ? 0.5 : i / (n - 1)) * (W - pad.l - pad.r);
  const py = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");

  return (
    <div className="chart-ph">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="growth chart">
        {[40, 80, 120, 160, 200, 240, 280].map((x) => (
          <line key={x} x1={x} y1="8" x2={x} y2="172" stroke="var(--border)" strokeWidth="1" />
        ))}
        {/* representative percentile bands (decorative) */}
        {[
          [150, 0],
          [124, 1],
          [98, 2],
          [74, 3],
          [50, 4],
          [30, 5],
        ].map(([y, i]) => (
          <path
            key={i}
            d={`M8 ${y + 22} C 90 ${y + 12}, 200 ${y + 2}, 312 ${y - 8}`}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={i === 4 ? 2 : 1.3}
            strokeDasharray={i === 4 ? "0" : "4 5"}
            opacity={i === 4 ? 0.9 : 0.55}
          />
        ))}
        {/* baby's real points */}
        {n > 0 && <path d={line} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        {values.map((v, i) => (
          <circle key={i} cx={px(i)} cy={py(v)} r="4.5" fill={accent} stroke="var(--surface)" strokeWidth="2.5" />
        ))}
      </svg>
    </div>
  );
}
