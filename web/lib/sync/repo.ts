// The data-access contract. Two implementations satisfy it:
//   - supabaseRepo: real auth + Postgres + RLS + Realtime (the architecture).
//   - demoRepo:     localStorage + BroadcastChannel (zero-backend UX demo).
// The factory picks one based on whether Supabase env vars are present, so the
// entire UI/sync layer above this line is identical in both modes.
import type { Activity, ActivityRow, Baby, Caregiver, EatDetails, GrowthKind, Invite, Measurement, Profile, SessionUser, VerbType } from "@/lib/types";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/client";

export type ActivityInsert = {
  id: string; // client-generated uuid so optimistic row and realtime echo dedupe
  baby_id: string;
  type: VerbType;
  started_at: string;
  ended_at?: string | null;
  details_json: EatDetails | Record<string, unknown>;
};

export type ActivityPatch = {
  started_at?: string;
  ended_at?: string | null;
  details_json?: Record<string, unknown>;
};

export type RealtimeHandlers = {
  onInsert: (row: ActivityRow & { logged_by_name: string; logged_by_color: string | null }) => void;
  onUpdate: (row: ActivityRow & { logged_by_name: string; logged_by_color: string | null }) => void;
  onDelete: (id: string) => void;
};

export type AuthResult = { error: string | null; needsConfirmation?: boolean };
export type InvitePreview = { email: string; inviter: string; baby: string };

export interface Repo {
  readonly isDemo: boolean;

  // auth
  getSession(): Promise<SessionUser | null>;
  onAuthChange(cb: (user: SessionUser | null) => void): () => void;
  signUp(email: string, password: string, displayName: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  resendConfirmation(email: string): Promise<{ error: string | null }>;
  signOut(): Promise<void>;
  getProfile(): Promise<Profile | null>;
  updateProfile(patch: { display_name?: string }): Promise<void>;
  exportMyData(): Promise<Record<string, unknown>>; // PDPA data export
  deleteAccount(): Promise<void>; // PDPA deletion (30-day grace per §5a)

  // babies
  listBabies(): Promise<Baby[]>;
  createBaby(name: string, birthdate: string): Promise<Baby>;

  // activity
  listToday(babyId: string): Promise<Activity[]>;
  listRange(babyId: string, fromISO: string, toISO: string): Promise<Activity[]>; // past-day history (read-only)
  insertActivity(a: ActivityInsert): Promise<Activity>; // rejects when offline
  updateActivity(id: string, patch: ActivityPatch): Promise<Activity>; // e.g. stop a sleep timer
  deleteActivity(id: string): Promise<void>;
  // returns the most recent in-progress/just-started activity of a type within
  // `withinSec` seconds, by another caregiver — drives the concurrency prompt.
  recentByOther(babyId: string, type: VerbType, withinSec: number): Promise<Activity | null>;
  // most recent N eat rows (any day, any caregiver) — drives Eat v2 smart
  // defaults (last mode/capture/amount/side/portion + past-food autocomplete).
  recentEats(babyId: string, limit?: number): Promise<Activity[]>;

  // growth
  listMeasurements(babyId: string): Promise<Measurement[]>;
  addMeasurement(m: { id: string; baby_id: string; kind: GrowthKind; value: number; measured_at: string }): Promise<Measurement>;
  deleteMeasurement(id: string): Promise<void>;

  // caregivers (PRD §5a)
  listCaregivers(babyId: string): Promise<Caregiver[]>;
  addCaregiverByEmail(babyId: string, email: string): Promise<{ error: string | null }>;
  removeCaregiver(babyId: string, userId: string): Promise<void>;
  transferOwnership(babyId: string, userId: string): Promise<void>;
  // invites by email (token flow)
  createInvite(babyId: string, email: string): Promise<{ token: string | null; error: string | null }>;
  listInvites(babyId: string): Promise<Invite[]>; // pending only
  revokeInvite(inviteId: string): Promise<void>;
  acceptInvite(token: string): Promise<{ babyId: string | null; error: string | null }>;
  getInvitePreview(token: string): Promise<InvitePreview | null>;

  // realtime
  subscribe(babyId: string, handlers: RealtimeHandlers): () => void;
}

let _repo: Repo | null = null;

export async function getRepo(): Promise<Repo> {
  if (_repo) return _repo;
  if (SUPABASE_CONFIGURED) {
    const { SupabaseRepo } = await import("./supabaseRepo");
    _repo = new SupabaseRepo();
  } else {
    const { DemoRepo } = await import("./demoRepo");
    _repo = new DemoRepo();
  }
  return _repo;
}
