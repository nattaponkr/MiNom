// validate-who-lms.mjs — runnable acceptance checks for the bundled WHO LMS data +
// math (#15, Part 2). No test runner is configured, so this is an executable proof:
// it imports the emitted JSON and the LMS formula and asserts the published WHO
// spot-checks. Exits non-zero on any failure.
//   Run:  node web/scripts/validate-who-lms.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, "..", "lib", "growth", "who-lms-data");
const load = (f) => JSON.parse(readFileSync(join(DATA, f), "utf8")).lms;
const T = {
  weight: { boy: load("weight-for-age-boys.json"), girl: load("weight-for-age-girls.json") },
  height: { boy: load("height-for-age-boys.json"), girl: load("height-for-age-girls.json") },
};
const lerp = (a, b, t) => a + (b - a) * t;
function lmsForAge(rows, a) {
  a = Math.max(rows[0].age_months, Math.min(a, rows[rows.length - 1].age_months));
  let lo = 0; for (let i = 0; i < rows.length; i++) if (rows[i].age_months <= a) lo = i;
  if (lo === rows.length - 1) { const r = rows[lo]; return { L: r.L, M: r.M, S: r.S }; }
  const A = rows[lo], B = rows[lo + 1], t = (a - A.age_months) / (B.age_months - A.age_months);
  return { L: lerp(A.L, B.L, t), M: lerp(A.M, B.M, t), S: lerp(A.S, B.S, t) };
}
const pctVal = ({ L, M, S }, z) => (L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L));
const valToZ = ({ L, M, S }, x) => (L === 0 ? Math.log(x / M) / S : (Math.pow(x / M, L) - 1) / (L * S));
function zToPct(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); p = z > 0 ? 1 - p : p; return p * 100; }

let fails = 0;
const approx = (name, got, want, tol) => { const ok = Math.abs(got - want) <= tol; console.log(`${ok ? "✅" : "❌"} ${name}: ${got.toFixed(4)} (want ${want} ±${tol})`); if (!ok) fails++; };
const P50 = (metric, sex, age) => pctVal(lmsForAge(T[metric][sex], age), 0);

// 1 · Published WHO P50 (median) spot-checks, 0.01 kg / 0.1 cm
approx("boy P50 weight @0mo", P50("weight", "boy", 0), 3.35, 0.01);
approx("boy P50 weight @6mo", P50("weight", "boy", 6), 7.93, 0.01);
approx("boy P50 weight @12mo", P50("weight", "boy", 12), 9.65, 0.01);
approx("girl P50 weight @0mo", P50("weight", "girl", 0), 3.23, 0.01);
approx("girl P50 weight @12mo", P50("weight", "girl", 12), 8.95, 0.01);
approx("boy P50 height @0mo", P50("height", "boy", 0), 49.9, 0.1);
approx("boy P50 height @12mo", P50("height", "boy", 12), 75.7, 0.1);
approx("girl P50 height @0mo", P50("height", "girl", 0), 49.1, 0.1);

// 2 · The brief's percentile-rank case: 3-month-old boy at 6.8 kg ≈ 71st percentile
approx("3mo boy 6.8kg percentile", zToPct(valToZ(lmsForAge(T.weight.boy, 3), 6.8)), 71, 2);

// 3 · Interpolation monotonicity (P50 weight strictly increases over 0–24mo)
let mono = true, prev = -Infinity;
for (let a = 0; a <= 24; a += 0.5) { const v = P50("weight", "boy", a); if (v <= prev) mono = false; prev = v; }
console.log(`${mono ? "✅" : "❌"} interpolated P50 weight monotonic over 0–24mo`); if (!mono) fails++;

console.log(fails ? `\n${fails} FAILED` : "\nALL PASS");
process.exit(fails ? 1 : 0);
