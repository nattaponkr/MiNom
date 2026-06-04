// Eat v2 helpers — the single source of truth for the mode-encoded stat-line
// (Home card, Timeline row, save/repeat toast) and the smart last-used defaults.
// Kept pure + framework-free so it's trivially testable and reused everywhere.
import { t } from "@/i18n";
import { num } from "@/lib/format";
import type { Activity, EatCapture, EatDetails, EatMode, Portion, Side } from "@/lib/types";

type BmTimer = Extract<EatDetails, { mode: "bm"; capture: "timer" }>;
type BmAmount = Extract<EatDetails, { mode: "bm"; capture: "amount" }>;
type Formula = Extract<EatDetails, { mode: "formula" }>;
type Solids = Extract<EatDetails, { mode: "solids" }>;

// A row is Eat v2 iff it carries a known `mode`. Everything else is a v1 row.
export function isEatV2(d: Record<string, unknown> | EatDetails): d is EatDetails {
  const m = (d as { mode?: unknown }).mode;
  return m === "bm" || m === "formula" || m === "solids";
}

const totalMs = (per?: { L?: number; R?: number }) => (per?.L ?? 0) + (per?.R ?? 0);
const minutesLabel = (ms: number) => `${Math.max(1, Math.round(ms / 60000))} ${t("units.m")}`;
const sideLabel = (s?: Side) => (s === "R" ? t("eat.breast.right") : t("eat.breast.left"));

// The inner "{detail}" of a นมแม่ stat: "ซ้าย 12 นาที" (timer) or "90 มล." (amount).
export function bmDetail(d: Extract<EatDetails, { mode: "bm" }>): string {
  if (d.capture === "timer") return `${sideLabel(d.endingSide ?? d.side)} ${minutesLabel(totalMs(d.perSideMs))}`;
  return `${num(d.amountMl)} ${t("eat.amount.unit")}`;
}

// Mode-encoded one-liner. `surface` selects the Home/toast vs Timeline template
// (they differ only for solids: Home appends an optional food, Timeline prefixes
// "· {food}"). Legacy v1 rows fall back to whatever fields exist (plain "กิน").
export function eatSummary(details: Record<string, unknown>, surface: "home" | "timeline" = "home"): string {
  if (isEatV2(details)) {
    if (details.mode === "bm") return t(surface === "timeline" ? "timeline.statBm" : "home.eat.statBm", { detail: bmDetail(details) });
    if (details.mode === "formula") return t(surface === "timeline" ? "timeline.statFormula" : "home.eat.statFormula", { amt: num((details as Formula).amountMl) });
    const s = details as Solids;
    if (s.food) return surface === "timeline" ? t("timeline.statSolids", { food: s.food }) : t("home.eat.statSolids", { food: ` · ${s.food}` });
    return surface === "timeline" ? t("eat.mode.solids") : t("home.eat.statSolids", { food: "" });
  }
  const l = details as { amount_ml?: number; what?: string };
  if (typeof l.amount_ml === "number") return `${t("eat.title")} · ${num(l.amount_ml)} ${t("eat.amount.unit")}`;
  if (l.what === "food") return t("eat.mode.solids");
  return t("eat.title");
}

// True first-time-food solids row (drives the Timeline "ครั้งแรก" tag).
export function isFirstTimeFood(details: Record<string, unknown>): boolean {
  return isEatV2(details) && details.mode === "solids" && details.firstTime === true;
}

// ---- smart defaults (PRD §0.1 / handoff "Smart defaults" table) ----

export type EatDefaults = {
  mode: EatMode;
  capture: EatCapture;
  bmAmount: number;
  formulaAmount: number;
  startingSide: Side; // opposite of last session's ending side
  portion: Portion;
  pastFoods: string[]; // distinct, recency-sorted — autocomplete source
};

export const DEFAULT_EAT: EatDefaults = {
  mode: "bm",
  capture: "timer",
  bmAmount: 90,
  formulaAmount: 120,
  startingSide: "L",
  portion: "M",
  pastFoods: [],
};

// Derive defaults from the caregiver's most recent eat rows (newest-first).
// Mode/capture prefer this caregiver's own history (roams across devices via
// the server); amounts/portion/foods are baby-wide.
export function eatDefaults(recent: Activity[], myId: string | null): EatDefaults {
  const all = recent.map((a) => a.details_json).filter(isEatV2);
  const mine = recent.filter((a) => a._mine || a.logged_by_user_id === myId).map((a) => a.details_json).filter(isEatV2);

  const mode = (mine.find((d) => d.mode)?.mode ?? all.find((d) => d.mode)?.mode ?? DEFAULT_EAT.mode) as EatMode;
  const capture = (
    (mine.find((d): d is BmTimer | BmAmount => d.mode === "bm")?.capture ??
      all.find((d): d is BmTimer | BmAmount => d.mode === "bm")?.capture ??
      DEFAULT_EAT.capture) as EatCapture
  );
  const bmAmount = all.find((d): d is BmAmount => d.mode === "bm" && d.capture === "amount")?.amountMl ?? DEFAULT_EAT.bmAmount;
  const formulaAmount = all.find((d): d is Formula => d.mode === "formula")?.amountMl ?? DEFAULT_EAT.formulaAmount;

  const lastTimer = all.find((d): d is BmTimer => d.mode === "bm" && d.capture === "timer");
  const lastEnding = lastTimer?.endingSide ?? lastTimer?.side;
  const startingSide: Side = lastEnding === "L" ? "R" : lastEnding === "R" ? "L" : DEFAULT_EAT.startingSide;

  const portion = all.find((d): d is Solids => d.mode === "solids")?.portion ?? DEFAULT_EAT.portion;

  const pastFoods: string[] = [];
  for (const d of all) if (d.mode === "solids" && d.food && !pastFoods.includes(d.food)) pastFoods.push(d.food);

  return { mode, capture, bmAmount, formulaAmount, startingSide, portion, pastFoods };
}
