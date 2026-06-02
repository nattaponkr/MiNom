import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { colorFromSeed } from "@/components/ui";
import type { Activity, ActivityRow, Baby, Profile, SessionUser, VerbType } from "@/lib/types";
import type { ActivityInsert, ActivityPatch, AuthResult, RealtimeHandlers, Repo } from "./repo";

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
    const { error } = await this.sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, avatar_color: colorFromSeed(email) } },
    });
    return { error: error?.message ?? null };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.sb.auth.signInWithPassword({ email, password });
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

  private async profileFor(userId: string) {
    if (this.profileCache.has(userId)) return this.profileCache.get(userId)!;
    const { data } = await this.sb.from("users").select("display_name, avatar_color").eq("id", userId).single();
    const p = { display_name: data?.display_name ?? "Caregiver", avatar_color: data?.avatar_color ?? null };
    this.profileCache.set(userId, p);
    return p;
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
