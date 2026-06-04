// Domain types shared across the app.

export type VerbType = "eat" | "sleep" | "diaper";

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  avatar_color: string;
};

export type Baby = {
  id: string;
  name: string;
  birthdate: string; // ISO date
  owner_id: string;
};

// Eat v2 — baby-centric model: WHAT the baby consumed (PRD §0.1 / §11).
// Strict discriminated union by `mode` (PM rec, PRD §11 Q6). Stored in
// activity.details_json (jsonb) — no migration; v1 rows simply lack `mode`.
export type EatMode = "bm" | "formula" | "solids";
export type EatCapture = "timer" | "amount";
export type Side = "L" | "R";
export type Portion = "S" | "M" | "L";

export type EatDetails =
  // นมแม่ — breast milk, nursed (timer): per-side durations + ending side.
  | { mode: "bm"; capture: "timer"; side?: Side; perSideMs?: { L?: number; R?: number }; endingSide?: Side; notes?: string }
  // นมแม่ — breast milk, pumped (amount): bottle volume.
  | { mode: "bm"; capture: "amount"; amountMl: number; notes?: string }
  // นมผง — formula: always an amount.
  | { mode: "formula"; amountMl: number; notes?: string }
  // อาหารแข็ง — solids: food name + portion + first-time (allergen) flag.
  | { mode: "solids"; food?: string; portion: Portion; firstTime?: boolean; notes?: string };

// v1 rows logged before Eat v2 carry no `mode`; render helpers fall back to
// whatever fields exist (lib/eat.ts) and show a plain "กิน" when unknown.
export type LegacyEatDetails = {
  amount_ml?: number;
  what?: "milk" | "food";
  source?: "breast_l" | "breast_r" | "bottle" | "solid";
  notes?: string;
};

export type DiaperKind = "wet" | "dirty" | "both";
export type DiaperDetails = { kind: DiaperKind };

// As stored / returned by the backend.
export type ActivityRow = {
  id: string;
  baby_id: string;
  type: VerbType;
  started_at: string;
  ended_at: string | null;
  details_json: Record<string, unknown>;
  logged_by_user_id: string;
  created_at: string;
  updated_at: string;
};

// Client-side sync state layered on top of a row. Drives the Queued→Synced
// pill and arrival animation; never persisted to the server.
export type SyncStatus = "queued" | "synced";

export type Activity = ActivityRow & {
  // Denormalized logger identity for Timeline attribution (display_name + color).
  logged_by_name: string;
  logged_by_color: string | null;
  // Local-only fields:
  _sync: SyncStatus;
  _fresh?: boolean; // just arrived via realtime — animate in
  _mine?: boolean; // logged by the current user on this device
};

export type SessionUser = { id: string; email: string };

export type GrowthKind = "weight" | "height";
export type Measurement = {
  id: string;
  baby_id: string;
  kind: GrowthKind;
  value: number;
  measured_at: string;
  logged_by_user_id: string;
  created_at: string;
};

export type Invite = { id: string; email: string; status: string; expires_at: string };

// A caregiver of a baby (roster row joined with profile).
export type CaregiverRole = "owner" | "caregiver";
export type Caregiver = {
  user_id: string;
  role: CaregiverRole;
  joined_at: string;
  display_name: string;
  avatar_color: string | null;
  email: string | null; // visible to owner only in practice
};
