// who-lms.test.ts — WHO LMS math + bundled-data acceptance (#15).
// NOTE: no test runner is wired into the repo yet (no vitest/jest dep). This file is
// committed for when one lands; the same assertions run today via
//   node web/scripts/validate-who-lms.mjs
// which is the executable proof referenced in the #15 journal entry.
import { describe, it, expect } from "vitest";
import { lmsForAge, percentileValue, valueToPercentile, sampleCurve } from "../who-lms";

const P50 = (m: "weight" | "height", s: "boy" | "girl", age: number) => percentileValue(lmsForAge(m, s, age), 0);

describe("WHO LMS — published median spot-checks", () => {
  it("boy weight-for-age P50", () => {
    expect(P50("weight", "boy", 0)).toBeCloseTo(3.35, 2);
    expect(P50("weight", "boy", 12)).toBeCloseTo(9.65, 2);
  });
  it("girl weight-for-age P50", () => {
    expect(P50("weight", "girl", 0)).toBeCloseTo(3.23, 2);
    expect(P50("weight", "girl", 12)).toBeCloseTo(8.95, 2);
  });
  it("height-for-age P50 (boy + girl)", () => {
    expect(P50("height", "boy", 0)).toBeCloseTo(49.9, 1);
    expect(P50("height", "girl", 0)).toBeCloseTo(49.1, 1);
  });
});

describe("WHO LMS — percentile rank", () => {
  it("3-month-old boy at 6.8 kg ≈ 71st percentile", () => {
    expect(valueToPercentile(lmsForAge("weight", "boy", 3), 6.8)).toBeCloseTo(71, 0);
  });
});

describe("WHO LMS — interpolation", () => {
  it("P50 weight is monotonic over 0–24 months", () => {
    let prev = -Infinity;
    for (let a = 0; a <= 24; a += 0.5) {
      const v = P50("weight", "boy", a);
      expect(v).toBeGreaterThan(prev);
      prev = v;
    }
  });
  it("sampled curve spans the requested window", () => {
    const c = sampleCurve("weight", "boy", 50, 0, 12, 1);
    expect(c[0].age).toBe(0);
    expect(c[c.length - 1].age).toBeCloseTo(12, 5);
    expect(c.every((p) => p.value > 0)).toBe(true);
  });
});
