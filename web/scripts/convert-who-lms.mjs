// convert-who-lms.mjs — deterministic WHO LMS CSV → JSON converter (#15, Part 1).
//
// Source: WHO Child Growth Standards LMS tables, as redistributed by the U.S. CDC
// (NCHS) at ftp.cdc.gov. Birth–24 months, monthly. The CDC files carry the official
// WHO L/M/S parameters verbatim (CDC uses WHO standards for <24mo). Downloaded
// 2026-06-08. Provenance (source URL + download date + sha256 of the exact source
// file) is embedded in each emitted JSON so the data is auditable.
//
// Run:  node web/scripts/convert-who-lms.mjs   (from repo root)
// Re-run is deterministic: same source bytes → identical JSON.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "who-lms-source");
const OUT = join(here, "..", "lib", "growth", "who-lms-data");
const DOWNLOADED = "2026-06-08";

const FILES = [
  { csv: "who-boys-weight-for-age.csv", out: "weight-for-age-boys.json", metric: "weight", sex: "boy", unit: "kg",
    url: "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.csv" },
  { csv: "who-girls-weight-for-age.csv", out: "weight-for-age-girls.json", metric: "weight", sex: "girl", unit: "kg",
    url: "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.csv" },
  { csv: "who-boys-length-for-age.csv", out: "height-for-age-boys.json", metric: "height", sex: "boy", unit: "cm",
    url: "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Length-for-age-Percentiles.csv" },
  { csv: "who-girls-length-for-age.csv", out: "height-for-age-girls.json", metric: "height", sex: "girl", unit: "cm",
    url: "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Length-for-age-Percentiles.csv" },
];

function parseLMS(text) {
  const lines = text.replace(/^﻿/, "").trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const iAge = header.findIndex((h) => h === "month" || h === "agemos" || h.startsWith("age"));
  const iL = header.indexOf("l");
  const iM = header.indexOf("m");
  const iS = header.indexOf("s");
  if (iAge < 0 || iL < 0 || iM < 0 || iS < 0) throw new Error("missing L/M/S/age columns");
  return lines.slice(1).map((ln) => {
    const c = ln.split(",");
    return { age_months: Number(c[iAge]), L: Number(c[iL]), M: Number(c[iM]), S: Number(c[iS]) };
  });
}

for (const f of FILES) {
  const raw = readFileSync(join(SRC, f.csv));
  const sha256 = createHash("sha256").update(raw).digest("hex");
  const lms = parseLMS(raw.toString("utf8"));
  // integrity: ascending ages, finite LMS
  for (let i = 1; i < lms.length; i++) if (lms[i].age_months <= lms[i - 1].age_months) throw new Error(`${f.csv}: non-monotonic age at row ${i}`);
  for (const r of lms) if (![r.L, r.M, r.S].every(Number.isFinite)) throw new Error(`${f.csv}: non-finite LMS at age ${r.age_months}`);
  const json = {
    indicator: `${f.metric}-for-age`,
    metric: f.metric,
    sex: f.sex,
    unit: f.unit,
    age_unit: "months",
    range_months: [lms[0].age_months, lms[lms.length - 1].age_months],
    source: "WHO Child Growth Standards (via U.S. CDC/NCHS redistribution)",
    source_url: f.url,
    downloaded: DOWNLOADED,
    source_sha256: sha256,
    lms,
  };
  writeFileSync(join(OUT, f.out), JSON.stringify(json, null, 2) + "\n");
  console.log(`${f.out}: ${lms.length} rows (${json.range_months[0]}–${json.range_months[1]}mo) · M[0]=${lms[0].M} · sha256=${sha256.slice(0, 12)}`);
}
console.log("done.");
