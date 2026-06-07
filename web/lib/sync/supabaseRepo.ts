import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { colorFromSeed } from "@/components/ui";
import type { Activity, ActivityRow, Baby, Caregiver, GrowthKind, Invite, Measurement, Profile, SessionUser, VerbType } from "@/lib/types";
import type { ActivityInsert, ActivityPatch, AuthResult, InvitePreview, RealtimeHandlers, Repo } from "./repo";

const SELECT_WITH_LOGGER = "*, logged_by:logged_by_user_id (display_name, avatar_color)";

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export class SupabaseRepo implements Repo {
  readonly isDemo = false;
  private sb: SupabaseClient = getSupabase();
  private myId: string | null = null;
  private profileCache = new Map<string, { display_name: string; avatar_color: string | null }>();

  private map(row: ActivityRow & { logged_by?: { display_name: string; avatar_color: string | null } | null }): Activity {
    const logger = row.logged_by ?? null;
    return {
      ...row,
      logged_by_name: logger?.display_name ?? "Caregiver",
      logged_by_color: logger?.avatar_color ?? null,
      _sync: "synced",
      _mine: row.logged_by_user_id === this.myId,
    };
  }

  async getSession(): Promise<SessionUser | null> {
    const { data } = await this.sb.auth.getSession();
    const u = data.session?.user;
    this.myId = u?.id ?? null;
    return u ? { id: u.id, email: u.email ?? "" } : null;
  }

  onAuthChange(cb: (user: SessionUser | null) => void): () => void {
    const { data } = this.sb.auth.onAuthStateChange((_e, session) => {
      this.myId = session?.user?.id ?? null;
      cb(session?.user ? { id: session.user.id, email: session.user.email ?? "" } : null);
    });
    return () => data.subscription.unsubscribe();
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    const { data, error } = await this.sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, avatar_color: colorFromSeed(email) } },
    });
    // Confirmations ON → user created but no session until they confirm.
    return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.sb.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async resendConfirmation(email: string): Promise<{ error: string | null }> {
    const { error } = await this.sb.auth.resend({ type: "signup", email });
    return { error: error?.message ?? null };
  }

  async signOut(): Promise<void> {
    await this.sb.auth.signOut();
  }

  async getProfile(): Promise<Profile | null> {
    const session = await this.getSession();
    if (!session) return null;
    const { data } = await this.sb.from("users").select("*").eq("id", session.id).single();
    return (data as Profile) ?? null;
  }

  async updateProfile(patch: { display_name?: string }): Promise<void> {
    const session = await this.getSession();
    if (!session || !patch.display_name) return;
    const { error } = await this.sb.from("users").update({ display_name: patch.display_name.trim() }).eq("id", session.id);
    if (error) throw error;
  }

  async exportMyData(): Promise<Record<string, unknown>> {
    const babies = await this.listBabies();
    const ids = babies.map((b) => b.id);
    const [acts, meas] = await Promise.all([
      ids.length ? this.sb.from("activity").select("*").in("baby_id", ids) : Promise.resolve({ data: [] }),
      ids.length ? this.sb.from("measurements").select("*").in("baby_id", ids) : Promise.resolve({ data: [] }),
    ]);
    return {
      exported_at: new Date().toISOString(),
      profile: await this.getProfile(),
      babies,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activities: (acts as any).data ?? [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      measurements: (meas as any).data ?? [],
    };
  }

  async deleteAccount(): Promise<void> {
    // Deleting the auth user (and cascading data) requires elevated privileges —
    // a server-side edge function with the service role. That isn't provisioned
    // yet, so here we sign out; the UI presents the 30-day-grace messaging.
    // TODO(Phase 3.x): edge function `request_account_deletion` (auth admin + grace).
    await this.sb.auth.signOut();
  }

  async listBabies(): Promise<Baby[]> {
    const { data, error } = await this.sb.from("babies").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return (data as Baby[]) ?? [];
  }

  async createBaby(name: string, birthdate: string): Promise<Baby> {
    const { data, error } = await this.sb.rpc("create_baby", { p_name: name, p_birthdate: birthdate });
    if (error) throw error;
    return data as Baby;
  }

  async listToday(babyId: string): Promise<Activity[]> {
    await this.getSession();
    const { data, error } = await this.sb
      .from("activity")
      .select(SELECT_WITH_LOGGER)
      .eq("baby_id", babyId)
      .gte("started_at", startOfTodayISO())
      .order("started_at", { ascending: false });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data as any[]) ?? []).map((r) => this.map(r));
  }

  async listRange(babyId: string, fromISO: string, toISO: string): Promise<Activity[]> {
    await this.getSession();
    const { data, error } = await this.sb
      .from("activity")
      .select(SELECT_WITH_LOGGER)
      .eq("baby_id", babyId)
      .gte("started_at", fromISO)
      .lt("started_at", toISO)
      .order("started_at", { ascending: false });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data as any[]) ?? []).map((r) => this.map(r));
  }

  async insertActivity(a: ActivityInsert): Promise<Activity> {
    const session = await this.getSession();
    if (!session) throw new Error("Not authenticated");
    const { data, error } = await this.sb
      .from("activity")
      .insert({
        id: a.id,
        baby_id: a.baby_id,
        type: a.type,
        started_at: a.started_at,
        ended_at: a.ended_at ?? null,
        details_json: a.details_json,
        logged_by_user_id: session.id,
      })
      .select(SELECT_WITH_LOGGER)
      .single();
    if (error) throw error; // network/offline or RLS rejection → caller keeps it queued
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.map(data as any);
  }

  async updateActivity(id: string, patch: ActivityPatch): Promise<Activity> {
    const { data, error } = await this.sb.from("activity").update(patch).eq("id", id).select(SELECT_WITH_LOGGER).single();
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.map(data as any);
  }

  async deleteActivity(id: string): Promise<void> {
    const { error } = await this.sb.from("activity").delete().eq("id", id);
    if (error) throw error;
  }

  async recentByOther(babyId: string, type: VerbType, withinSec: number): Promise<Activity | null> {
    const session = await this.getSession();
    if (!session) return null;
    const since = new Date(Date.now() - withinSec * 1000).toISOString();
    const { data } = await this.sb
      .from("activity")
      .select(SELECT_WITH_LOGGER)
      .eq("baby_id", babyId)
      .eq("type", type)
      .gte("started_at", since)
      .neq("logged_by_user_id", session.id)
      .order("started_at", { ascending: false })
      .limit(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data as any[]) ?? [];
    return rows.length ? this.map(rows[0]) : null;
  }

  async recentEats(babyId: string, limit = 20): Promise<Activity[]> {
    await this.getSession();
    const { data, error } = await this.sb
      .from("activity")
      .select(SELECT_WITH_LOGGER)
      .eq("baby_id", babyId)
      .eq("type", "eat")
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data as any[]) ?? []).map((r) => this.map(r));
  }

  private async profileFor(userId: string) {
    if (this.profileCache.has(userId)) return this.profileCache.get(userId)!;
    const { data } = await this.sb.from("users").select("display_name, avatar_color").eq("id", userId).single();
    const p = { display_name: data?.display_name ?? "Caregiver", avatar_color: data?.avatar_color ?? null };
    this.profileCache.set(userId, p);
    return p;
  }

  async listMeasurements(babyId: string): Promise<Measurement[]> {
    await this.getSession();
    const { data, error } = await this.sb.from("measurements").select("*").eq("baby_id", babyId).order("measured_at", { ascending: false });
    if (error) throw error;
    return (data as Measurement[]) ?? [];
  }
  async addMeasurement(m: { id: string; baby_id: string; kind: GrowthKind; value: number; measured_at: string }): Promise<Measurement> {
    const session = await this.getSession();
    if (!session) throw new Error("Not authenticated");
    const { data, error } = await this.sb.from("measurements").insert({ ...m, logged_by_user_id: session.id }).select("*").single();
    if (error) throw error;
    return data as Measurement;
  }
  async updateMeasurement(id: string, patch: { value?: number; measured_at?: string }): Promise<Measurement> {
    const { data, error } = await this.sb.from("measurements").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data as Measurement;
  }
  async deleteMeasurement(id: string): Promise<void> {
    const { error } = await this.sb.from("measurements").delete().eq("id", id);
    if (error) throw error;
  }

  async listCaregivers(babyId: string): Promise<Caregiver[]> {
    const { data, error } = await this.sb
      .from("baby_caregivers")
      .select("user_id, role, joined_at, users:user_id (display_name, avatar_color, email)")
      .eq("baby_id", babyId);
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data as any[]) ?? []).map((r) => ({
      user_id: r.user_id,
      role: r.role,
      joined_at: r.joined_at,
      display_name: r.users?.display_name ?? "Caregiver",
      avatar_color: r.users?.avatar_color ?? null,
      email: r.users?.email ?? null,
    }));
  }
  async addCaregiverByEmail(babyId: string, email: string): Promise<{ error: string | null }> {
    const { data, error } = await this.sb.rpc("add_caregiver_by_email", { p_baby: babyId, p_email: email.trim().toLowerCase() });
    if (error) return { error: error.message };
    return { error: (data as string | null) ?? null }; // RPC returns null on success or a message key
  }
  async removeCaregiver(babyId: string, userId: string): Promise<void> {
    const { error } = await this.sb.rpc("remove_caregiver", { p_baby: babyId, p_user: userId });
    if (error) throw error;
  }
  async transferOwnership(babyId: string, userId: string): Promise<void> {
    const { error } = await this.sb.rpc("transfer_ownership", { p_baby: babyId, p_user: userId });
    if (error) throw error;
  }

  async createInvite(babyId: string, email: string): Promise<{ token: string | null; error: string | null }> {
    const { data, error } = await this.sb.rpc("create_caregiver_invite", { p_baby: babyId, p_email: email });
    if (error) return { token: null, error: error.message };
    const res = (data as string | null) ?? "";
    return res.startsWith("care.error") ? { token: null, error: res } : { token: res, error: null };
  }
  async listInvites(babyId: string): Promise<Invite[]> {
    const { data, error } = await this.sb
      .from("caregiver_invites")
      .select("id, email, status, token, created_at, expires_at, inviter:invited_by_user_id (display_name)")
      .eq("baby_id", babyId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data as any[]) ?? []).map((r) => ({
      id: r.id,
      email: r.email,
      status: r.status,
      token: r.token,
      created_at: r.created_at,
      expires_at: r.expires_at,
      inviter: r.inviter?.display_name ?? "",
    }));
  }
  async revokeInvite(inviteId: string): Promise<void> {
    const { error } = await this.sb.rpc("revoke_caregiver_invite", { p_invite: inviteId });
    if (error) throw error;
  }
  async acceptInvite(token: string): Promise<{ babyId: string | null; error: string | null }> {
    const { data, error } = await this.sb.rpc("accept_caregiver_invite", { p_token: token });
    if (error) return { babyId: null, error: error.message };
    const res = (data as string | null) ?? "";
    return res.startsWith("care.error") ? { babyId: null, error: res } : { babyId: res, error: null };
  }
  async getInvitePreview(token: string): Promise<InvitePreview | null> {
    const { data } = await this.sb.rpc("invite_preview", { p_token: token });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = Array.isArray(data) && data[0] ? (data[0] as any) : null;
    return row ? { email: row.email, inviter: row.inviter, baby: row.baby } : null;
  }

  subscribe(babyId: string, handlers: RealtimeHandlers): () => void {
    const channel = this.sb
      .channel(`activity:${babyId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity", filter: `baby_id=eq.${babyId}` },
        async (payload) => {
          const row = payload.new as ActivityRow;
          const p = await this.profileFor(row.logged_by_user_id);
          handlers.onInsert({ ...row, logged_by_name: p.display_name, logged_by_color: p.avatar_color });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "activity", filter: `baby_id=eq.${babyId}` },
        async (payload) => {
          const row = payload.new as ActivityRow;
          const p = await this.profileFor(row.logged_by_user_id);
          handlers.onUpdate({ ...row, logged_by_name: p.display_name, logged_by_color: p.avatar_color });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "activity", filter: `baby_id=eq.${babyId}` },
        (payload) => handlers.onDelete((payload.old as { id: string }).id),
      )
      .subscribe();
    return () => {
      this.sb.removeChannel(channel);
    };
  }
}
