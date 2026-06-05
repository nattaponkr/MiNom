// Activity presentation helpers (Timeline #09) — the muted-context + bold-detail
// hierarchy (mirrors Home cards) and the detail-sheet field rows. Pure + framework-free.
import { t } from "@/i18n";
import { duration, num } from "@/lib/format";
import { eatSummary, isEatV2 } from "@/lib/eat";
import type { Activity } from "@/lib/types";

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
