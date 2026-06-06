// Activity presentation helpers (Timeline #09) — the muted-context + bold-detail
// hierarchy (mirrors Home cards) and the detail-sheet field rows. Pure + framework-free.
import { t } from "@/i18n";
import { duration, num } from "@/lib/format";
import { eatSummary, isEatV2 } from "@/lib/eat";
import type { Activity, VerbType } from "@/lib/types";

// Split into a muted context line + a bold detail line. Fallback (no mode detail):
// context empty, detail = the verb itself (rendered solo/bold).
export function activityHierarchy(a: Activity): { context: string; detail: string } {
  if (a.type === "eat") {
    const s = eatSummary(a.details_json, "timeline"); // "นมผง · 90 มล." | "อาหารแข็ง"
    const i = s.indexOf(" · ");
    return i >= 0 ? { context: s.slice(0, i), detail: s.slice(i + 3) } : { context: "", detail: s };
  }
  if (a.type === "diaper") {
    const k = (a.details_json as { kind?: string }).kind;
    return k ? { context: t("verb.diaper"), detail: t(`diaper.${k}`) } : { context: "", detail: t("verb.diaper") };
  }
  if (a.type === "sleep") {
    if (!a.ended_at) return { context: t("verb.sleep"), detail: t("sleep.sleeping") };
    return { context: t("verb.sleep"), detail: duration(new Date(a.ended_at).getTime() - new Date(a.started_at).getTime()) };
  }
  return { context: "", detail: t(`verb.${a.type}`) };
}

// One-line summary for delete-confirm copy / toasts ("นมผง · 90 มล.").
export function activitySummary(a: Activity): string {
  const { context, detail } = activityHierarchy(a);
  return context ? `${context} · ${detail}` : detail;
}

// Detail-sheet field rows (the sheet renders time + logged-by itself).
export function activityFields(a: Activity): [string, string][] {
  const rows: [string, string][] = [];
  const d = a.details_json as Record<string, unknown>;
  const { context } = activityHierarchy(a);
  if (context) rows.push([t("timeline.detail.fieldType"), context]);
  if (a.type === "eat" && isEatV2(d) && ((d.mode === "bm" && (d as { capture?: string }).capture === "amount") || d.mode === "formula")) {
    rows.push([t("timeline.detail.fieldAmount"), `${num((d as { amountMl: number }).amountMl)} ${t("eat.amount.unit")}`]);
  }
  const note = (d as { notes?: string }).notes;
  if (note) rows.push([t("timeline.detail.fieldNote"), note]);
  return rows;
}

// ---- Day summary (Timeline #10) — count-led hero numbers per verb ----
// กิน/ถ่าย hero = count; นอน hero = total sleep duration. Eat sub combines volume
// (formula + pumped-BM amounts) and duration (BM-timer sessions) per CPO's refinement;
// when both exist it stacks (avoids crowding the 360px 3-column grid). Verbs with no
// data are omitted; an empty day yields [] (summary hidden, empty state stands alone).
export type SummaryToken = { n: string; u: string };
export type DaySummaryStat = { verb: VerbType; label: string; value: SummaryToken[]; sub?: string | string[] };

function durTokens(ms: number): SummaryToken[] {
  const min = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return m > 0 ? [{ n: num(h), u: t("units.h") }, { n: num(m), u: t("units.m") }] : [{ n: num(h), u: t("units.h") }];
  return [{ n: num(min), u: t("units.m") }];
}

export function daySummaryStats(activities: Activity[], now = Date.now()): DaySummaryStat[] {
  const countUnit = t("timeline.summary.count", { n: "" }).trim(); // "ครั้ง"
  const stats: DaySummaryStat[] = [];

  const eats = activities.filter((a) => a.type === "eat");
  if (eats.length) {
    let volume = 0;
    let durMs = 0;
    for (const a of eats) {
      const d = a.details_json as Record<string, unknown>;
      if (isEatV2(d)) {
        if (d.mode === "formula" || (d.mode === "bm" && (d as { capture?: string }).capture === "amount")) volume += (d as { amountMl?: number }).amountMl ?? 0;
        if (d.mode === "bm" && (d as { capture?: string }).capture === "timer") {
          const per = (d as { perSideMs?: { L?: number; R?: number } }).perSideMs;
          durMs += (per?.L ?? 0) + (per?.R ?? 0);
          // live current segment of an in-progress session (ticks the hero while running)
          const seg = (d as { segStart?: string }).segStart;
          if (!a.ended_at && seg) durMs += now - new Date(seg).getTime();
        }
      } else if (typeof (d as { amount_ml?: number }).amount_ml === "number") {
        volume += (d as { amount_ml: number }).amount_ml; // legacy v1 amounts → volume
      }
    }
    const volStr = t("timeline.summary.volume", { ml: num(volume) });
    const durStr = duration(durMs);
    const sub = volume > 0 && durMs > 0 ? [volStr, durStr] : volume > 0 ? volStr : durMs > 0 ? durStr : undefined;
    stats.push({ verb: "eat", label: t("timeline.summary.eat"), value: [{ n: num(eats.length), u: countUnit }], sub });
  }

  const sleeps = activities.filter((a) => a.type === "sleep");
  if (sleeps.length) {
    let ms = 0;
    for (const a of sleeps) if (a.ended_at) ms += new Date(a.ended_at).getTime() - new Date(a.started_at).getTime();
    stats.push({ verb: "sleep", label: t("timeline.summary.sleep"), value: durTokens(ms) });
  }

  const diapers = activities.filter((a) => a.type === "diaper");
  if (diapers.length) {
    let wet = 0;
    let dirty = 0;
    for (const a of diapers) {
      const k = (a.details_json as { kind?: string }).kind;
      if (k === "wet" || k === "both") wet++;
      if (k === "dirty" || k === "both") dirty++;
    }
    stats.push({ verb: "diaper", label: t("timeline.summary.diaper"), value: [{ n: num(diapers.length), u: countUnit }], sub: t("timeline.summary.split", { wet: num(wet), dirty: num(dirty) }) });
  }

  return stats;
}
