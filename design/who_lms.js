// who_lms.js — WHO Child Growth Standards · LMS reference + percentile math (Handoff #15)
// PROTOTYPE DATA: approximate public-domain LMS values (monthly, 0–24 mo) for the
// four tables the chart needs. Dev bundles the FULL official tables (0–60 mo,
// per-month) from https://www.who.int/tools/child-growth-standards — this file
// exists so the spec's curves have authentic SHAPE, not to be the source of truth.
// Math is the standard LMS model: X(z) = M·(1+L·S·z)^(1/L)  [L≠0] · M·e^(S·z) [L=0].
(function () {
  const WT_BOY = {
    0:[0.3487,3.3464,0.14602],1:[0.2297,4.4709,0.13395],2:[0.1970,5.5675,0.12385],3:[0.1738,6.3762,0.11727],
    4:[0.1553,7.0023,0.11316],5:[0.1395,7.5105,0.11080],6:[0.1257,7.9340,0.10958],7:[0.1134,8.2970,0.10902],
    8:[0.1021,8.6151,0.10882],9:[0.0917,8.9014,0.10881],10:[0.0820,9.1649,0.10891],11:[0.0730,9.4122,0.10906],
    12:[0.0644,9.6479,0.10925],15:[0.0408,10.3108,0.10995],18:[0.0198,10.9385,0.11080],21:[0.0006,11.5392,0.11167],24:[-0.0170,12.1515,0.11250]
  };
  const WT_GIRL = {
    0:[0.3809,3.2322,0.14171],1:[0.1714,4.1873,0.13724],2:[0.0962,5.1282,0.13000],3:[0.0402,5.8458,0.12619],
    4:[-0.0050,6.4237,0.12402],5:[-0.0430,6.8985,0.12274],6:[-0.0756,7.2970,0.12204],7:[-0.1039,7.6422,0.12178],
    8:[-0.1287,7.9487,0.12181],9:[-0.1507,8.2254,0.12199],10:[-0.1707,8.4800,0.12235],11:[-0.1889,8.7192,0.12283],
    12:[-0.2024,8.9462,0.12273],15:[-0.2389,9.6008,0.12404],18:[-0.2541,10.2315,0.12477],21:[-0.2721,10.8534,0.12550],24:[-0.2855,11.4775,0.12660]
  };
  const LEN_BOY = {
    0:[1,49.8842,0.03795],1:[1,54.7244,0.03557],2:[1,58.4249,0.03424],3:[1,61.4292,0.03328],
    4:[1,63.8861,0.03257],6:[1,67.6236,0.03165],9:[1,72.0001,0.03075],12:[1,75.7488,0.03020],
    15:[1,79.1458,0.02989],18:[1,82.2587,0.02976],24:[1,87.8161,0.02976]
  };
  const LEN_GIRL = {
    0:[1,49.1477,0.03790],1:[1,53.6872,0.03640],2:[1,57.0673,0.03513],3:[1,59.8029,0.03421],
    4:[1,62.0899,0.03352],6:[1,65.7311,0.03257],9:[1,70.1435,0.03171],12:[1,74.0150,0.03140],
    15:[1,77.5099,0.03136],18:[1,80.7079,0.03150],24:[1,86.4153,0.03224]
  };
  const TABLES = {
    weight: { boy: WT_BOY, girl: WT_GIRL },
    height: { boy: LEN_BOY, girl: LEN_GIRL },
  };
  // z for the 5 standard percentiles
  const PCTZ = { 3: -1.88079, 15: -1.03643, 50: 0, 85: 1.03643, 97: 1.88079 };
  const MAX_AGE_MO = 60; // WHO reference ends here (out-of-range state beyond)

  function lmsVal(L, M, S, z) { return L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L); }
  function interp(tbl, ageMo) {
    const ks = Object.keys(tbl).map(Number).sort((a, b) => a - b);
    if (ageMo <= ks[0]) return tbl[ks[0]];
    if (ageMo >= ks[ks.length - 1]) return tbl[ks[ks.length - 1]];
    let lo = ks[0]; for (const k of ks) { if (k <= ageMo) lo = k; }
    const hi = ks[ks.indexOf(lo) + 1];
    const t = (ageMo - lo) / (hi - lo);
    return [0, 1, 2].map((i) => tbl[lo][i] + (tbl[hi][i] - tbl[lo][i]) * t);
  }
  // sample a percentile curve across an age range → [{age, value}]
  function curve(metric, sex, pct, ageFrom, ageTo, stepMo = 0.5) {
    const tbl = TABLES[metric][sex];
    const z = PCTZ[pct];
    const pts = [];
    for (let a = ageFrom; a <= ageTo + 1e-6; a += stepMo) {
      const [L, M, S] = interp(tbl, Math.min(a, MAX_AGE_MO));
      pts.push({ age: a, value: lmsVal(L, M, S, z) });
    }
    return pts;
  }
  // z-score + percentile rank of a real measurement (for the dot readout)
  function zScore(metric, sex, ageMo, value) {
    const [L, M, S] = interp(TABLES[metric][sex], Math.min(ageMo, MAX_AGE_MO));
    return L === 0 ? Math.log(value / M) / S : (Math.pow(value / M, L) - 1) / (L * S);
  }
  function pctRank(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    p = z > 0 ? 1 - p : p;
    return Math.max(0.1, Math.min(99.9, p * 100));
  }

  window.WHO_LMS = { TABLES, PCTZ, MAX_AGE_MO, lmsVal, interp, curve, zScore, pctRank };
})();
