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

// Optional metadata captured behind the Eat "Details" expander.
export type EatDetails = {
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
