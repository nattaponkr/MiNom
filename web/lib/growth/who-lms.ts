// who-lms.ts — WHO Child Growth Standards · LMS → percentile math (#15).
//
// Bundled offline-first: the four official LMS tables (weight/height × boy/girl,
// 0–24mo, from web/lib/growth/who-lms-data/, provenance in each JSON) are imported
// at build time — the chart renders with zero network. LMS model:
//   X(z) = M·(1 + L·S·z)^(1/L)   [L ≠ 0]
//   X(z) = M·exp(S·z)            [L = 0]   (length-for-age uses L = 1, but the
//                                           general form covers it)
// NOTE (data range): CDC redistributes WHO LMS for 0–24mo; the full WHO reference
// runs to 60mo (who.int Excel). Beta is 0–12mo, so 0–24mo is ample; ages beyond the
// bundled max clamp to the last row + report out-of-range (see isOutOfRange).
import wfaBoys from "./who-lms-data/weight-for-age-boys.json";
import wfaGirls from "./who-lms-data/weight-for-age-girls.json";
import hfaBoys from "./who-lms-data/height-for-age-boys.json";
import hfaGirls from "./who-lms-data/height-for-age-girls.json";

export type GrowthMetric = "weight" | "height";
export type Sex = "boy" | "girl";
export type LMS = { L: number; M: number; S: number };
type Row = { age_months: number; L: number; M: number; S: number };
type Table = { metric: GrowthMetric; sex: Sex; unit: string; range_months: number[]; lms: Row[] };

const TABLES: Record<GrowthMetric, Record<Sex, Table>> = {
  weight: { boy: wfaBoys as Table, girl: wfaGirls as Table },
  height: { boy: hfaBoys as Table, girl: hfaGirls as Table },
};

// The five standard percentile curves and their z-scores (Φ⁻¹).
export const PERCENTILES = [3, 15, 50, 85, 97] as const;
export const PCT_Z: Record<number, number> = { 3: -1.88079, 15: -1.03643, 50: 0, 85: 1.03643, 97: 1.88079 };

// Bundled reference ceiling (max age present across the tables).
export const WHO_MAX_MONTHS = TABLES.weight.boy.lms[TABLES.weight.boy.lms.length - 1].age_months;
export const WHO_MIN_MONTHS = TABLES.weight.boy.lms[0].age_months;
export function isOutOfRange(ageMonths: number): boolean {
  return ageMonths > WHO_MAX_MONTHS;
}
export function unitFor(metric: GrowthMetric): string {
  return TABLES[metric].boy.unit;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// LMS at an age via linear interpolation between bracketing reference rows.
// Ages outside [min, max] clamp to the nearest row (curve continuity).
export function lmsForAge(metric: GrowthMetric, sex: Sex, ageMonths: number): LMS {
  const rows = TABLES[metric][sex].lms;
  const a = Math.max(rows[0].age_months, Math.min(ageMonths, rows[rows.length - 1].age_months));
  if (a <= rows[0].age_months) return { L: rows[0].L, M: rows[0].M, S: rows[0].S };
  if (a >= rows[rows.length - 1].age_months) { const r = rows[rows.length - 1]; return { L: r.L, M: r.M, S: r.S }; }
  let loIdx = 0;
  for (let i = 0; i < rows.length; i++) if (rows[i].age_months <= a) loIdx = i;
  const lo = rows[loIdx];
  const hi = rows[loIdx + 1];
  const t = (a - lo.age_months) / (hi.age_months - lo.age_months);
  return { L: lerp(lo.L, hi.L, t), M: lerp(lo.M, hi.M, t), S: lerp(lo.S, hi.S, t) };
}

// Reference value at a z-score (the percentile curve point).
export function percentileValue(lms: LMS, z: number): number {
  return lms.L === 0 ? lms.M * Math.exp(lms.S * z) : lms.M * Math.pow(1 + lms.L * lms.S * z, 1 / lms.L);
}

// z-score of a real measurement under the LMS distribution.
export function valueToZ(lms: LMS, x: number): number {
  return lms.L === 0 ? Math.log(x / lms.M) / lms.S : (Math.pow(x / lms.M, lms.L) - 1) / (lms.L * lms.S);
}

// Standard-normal CDF (Abramowitz & Stegun 26.2.17) → percentile rank, clamped to
// [0.1, 99.9] so the tooltip never reads a meaningless "P0"/"P100".
export function zToPercentile(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  p = z > 0 ? 1 - p : p;
  return Math.max(0.1, Math.min(99.9, p * 100));
}
export function valueToPercentile(lms: LMS, x: number): number {
  return zToPercentile(valueToZ(lms, x));
}

// Sample one percentile curve across [ageFrom, ageTo] (months) → screen-ready points.
export function sampleCurve(metric: GrowthMetric, sex: Sex, pct: number, ageFrom: number, ageTo: number, stepMo = 0.5): { age: number; value: number }[] {
  const z = PCT_Z[pct];
  const pts: { age: number; value: number }[] = [];
  const to = Math.min(ageTo, WHO_MAX_MONTHS);
  for (let a = Math.max(0, ageFrom); a <= to + 1e-6; a += stepMo) {
    pts.push({ age: a, value: percentileValue(lmsForAge(metric, sex, a), z) });
  }
  return pts;
}
