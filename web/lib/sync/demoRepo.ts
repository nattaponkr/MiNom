// DemoRepo — zero-backend implementation for design review and local QA of the
// section-05 behaviors. Persists to localStorage; uses BroadcastChannel to push
// inserts/deletes to other open tabs, which stands in for cross-device realtime.
// NOT real multi-device or real auth — see README. The Supabase impl is the
// architecture proof; this exists so `npm run dev` works with no setup.
import { colorFromSeed } from "@/components/ui";
import { t } from "@/i18n";
import type { Activity, ActivityRow, Baby, Caregiver, GrowthKind, Invite, Measurement, Profile, SessionUser, VerbType } from "@/lib/types";
import type { ActivityInsert, ActivityPatch, AuthResult, InvitePreview, RealtimeHandlers, Repo } from "./repo";

type DemoUser = { id: string; email: string; password: string; display_name: string; avatar_color: string };
type Link = { baby_id: string; user_id: string; role: string };
type BcMsg = { kind: "insert"; row: ActivityRow } | { kind: "update"; row: ActivityRow } | { kind: "delete"; id: string };

const K = {
  users: "minom_demo_users",
  session: "minom_demo_session",
  babies: "minom_demo_babies",
  links: "minom_demo_links",
  activity: "minom_demo_activity",
  measurements: "minom_demo_measurements",
  invites: "minom_demo_invites",
};

type DemoInvite = { id: string; baby_id: string; email: string; token: string; status: string; expires_at: string; invited_by: string };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
}
function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export class DemoRepo implements Repo {
  readonly isDemo = true;
  private authCbs = new Set<(u: SessionUser | null) => void>();

  private users() {
    return read<DemoUser[]>(K.users, []);
  }
  private links() {
    return read<Link[]>(K.links, []);
  }
  private acts() {
    return read<ActivityRow[]>(K.activity, []);
  }
  private myId(): string | null {
    return read<string | null>(K.session, null);
  }
  private me(): DemoUser | null {
    const id = this.myId();
    return this.users().find((u) => u.id === id) ?? null;
  }
  private userById(id: string) {
    return this.users().find((u) => u.id === id) ?? null;
  }

  private map(row: ActivityRow): Activity {
    const u = this.userById(row.logged_by_user_id);
    return {
      ...row,
      logged_by_name: u?.display_name ?? "Caregiver",
      logged_by_color: u?.avatar_color ?? null,
      _sync: "synced",
      _mine: row.logged_by_user_id === this.myId(),
    };
  }

  private emitAuth() {
    const u = this.me();
    const s = u ? { id: u.id, email: u.email } : null;
    this.authCbs.forEach((cb) => cb(s));
  }

  async getSession(): Promise<SessionUser | null> {
    const u = this.me();
    return u ? { id: u.id, email: u.email } : null;
  }

  onAuthChange(cb: (u: SessionUser | null) => void): () => void {
    this.authCbs.add(cb);
    return () => this.authCbs.delete(cb);
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    email = email.trim().toLowerCase();
    const users = this.users();
    if (users.some((u) => u.email === email)) return { error: t("auth.error.exists") };
    const user: DemoUser = {
      id: crypto.randomUUID(),
      email,
      password,
      display_name: displayName.trim() || email.split("@")[0],
      avatar_color: colorFromSeed(email),
    };
    write(K.users, [...users, user]);
    write(K.session, user.id);
    this.emitAuth();
    return { error: null, needsConfirmation: false }; // demo logs in immediately
  }

  async resendConfirmation(): Promise<{ error: string | null }> {
    return { error: null }; // no email in demo
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    email = email.trim().toLowerCase();
    const user = this.users().find((u) => u.email === email);
    if (!user || user.password !== password) return { error: t("auth.error.badCredentials") };
    write(K.session, user.id);
    this.emitAuth();
    return { error: null };
  }

  async signOut(): Promise<void> {
    write<string | null>(K.session, null);
    this.emitAuth();
  }

  async getProfile(): Promise<Profile | null> {
    const u = this.me();
    return u ? { id: u.id, email: u.email, display_name: u.display_name, avatar_color: u.avatar_color } : null;
  }

  async updateProfile(patch: { display_name?: string }): Promise<void> {
    const id = this.myId();
    if (!id) return;
    const users = this.users().map((u) => (u.id === id ? { ...u, ...(patch.display_name ? { display_name: patch.display_name.trim() } : {}) } : u));
    write(K.users, users);
    this.emitAuth();
  }

  async exportMyData(): Promise<Record<string, unknown>> {
    const id = this.myId();
    const babies = await this.listBabies();
    const babyIds = new Set(babies.map((b) => b.id));
    return {
      exported_at: new Date().toISOString(),
      profile: await this.getProfile(),
      babies,
      activities: this.acts().filter((a) => babyIds.has(a.baby_id)),
      measurements: read<Measurement[]>(K.measurements, []).filter((m) => babyIds.has(m.baby_id)),
      caregivers: this.links().filter((l) => babyIds.has(l.baby_id)),
      _note: id ? "demo export" : "no session",
    };
  }

  async deleteAccount(): Promise<void> {
    const id = this.myId();
    if (!id) return;
    // Demo: remove the user + babies they own + dependent data (real flow uses a
    // 30-day grace + ownership auto-transfer per PRD §5a).
    const ownedBabyIds = new Set(read<Baby[]>(K.babies, []).filter((b) => b.owner_id === id).map((b) => b.id));
    write(K.babies, read<Baby[]>(K.babies, []).filter((b) => b.owner_id !== id));
    write(K.links, this.links().filter((l) => l.user_id !== id && !ownedBabyIds.has(l.baby_id)));
    write(K.activity, this.acts().filter((a) => !ownedBabyIds.has(a.baby_id)));
    write(K.measurements, read<Measurement[]>(K.measurements, []).filter((m) => !ownedBabyIds.has(m.baby_id)));
    write(K.users, this.users().filter((u) => u.id !== id));
    write<string | null>(K.session, null);
    this.emitAuth();
  }

  async listBabies(): Promise<Baby[]> {
    const id = this.myId();
    if (!id) return [];
    const mine = new Set(this.links().filter((l) => l.user_id === id).map((l) => l.baby_id));
    return read<Baby[]>(K.babies, []).filter((b) => mine.has(b.id));
  }

  async createBaby(name: string, birthdate: string): Promise<Baby> {
    const id = this.myId();
    if (!id) throw new Error("Not authenticated");
    const baby: Baby = { id: crypto.randomUUID(), name: name.trim(), birthdate, owner_id: id };
    write(K.babies, [...read<Baby[]>(K.babies, []), baby]);
    write(K.links, [...this.links(), { baby_id: baby.id, user_id: id, role: "owner" }]);
    return baby;
  }

  async listToday(babyId: string): Promise<Activity[]> {
    const since = startOfTodayISO();
    return this.acts()
      .filter((a) => a.baby_id === babyId && a.started_at >= since)
      .sort((x, y) => (x.started_at < y.started_at ? 1 : -1))
      .map((a) => this.map(a));
  }

  async listRange(babyId: string, fromISO: string, toISO: string): Promise<Activity[]> {
    return this.acts()
      .filter((a) => a.baby_id === babyId && a.started_at >= fromISO && a.started_at < toISO)
      .sort((x, y) => (x.started_at < y.started_at ? 1 : -1))
      .map((a) => this.map(a));
  }

  async insertActivity(a: ActivityInsert): Promise<Activity> {
    const id = this.myId();
    if (!id) throw new Error("Not authenticated");
    const now = new Date().toISOString();
    const row: ActivityRow = {
      id: a.id,
      baby_id: a.baby_id,
      type: a.type,
      started_at: a.started_at,
      ended_at: a.ended_at ?? null,
      details_json: a.details_json as Record<string, unknown>,
      logged_by_user_id: id,
      created_at: now,
      updated_at: now,
    };
    const all = this.acts();
    if (!all.some((x) => x.id === row.id)) write(K.activity, [row, ...all]);
    this.broadcast({ kind: "insert", row });
    return this.map(row);
  }

  async updateActivity(id: string, patch: ActivityPatch): Promise<Activity> {
    const all = this.acts();
    const idx = all.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error("not found");
    const row: ActivityRow = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
    all[idx] = row;
    write(K.activity, all);
    this.broadcast({ kind: "update", row });
    return this.map(row);
  }

  async deleteActivity(id: string): Promise<void> {
    write(K.activity, this.acts().filter((a) => a.id !== id));
    this.broadcast({ kind: "delete", id });
  }

  async recentByOther(babyId: string, type: VerbType, withinSec: number): Promise<Activity | null> {
    const mine = this.myId();
    const since = new Date(Date.now() - withinSec * 1000).toISOString();
    const hit = this.acts().find(
      (a) => a.baby_id === babyId && a.type === type && a.started_at >= since && a.logged_by_user_id !== mine,
    );
    return hit ? this.map(hit) : null;
  }

  async recentEats(babyId: string, limit = 20): Promise<Activity[]> {
    return this.acts()
      .filter((a) => a.baby_id === babyId && a.type === "eat")
      .sort((x, y) => (x.started_at < y.started_at ? 1 : -1))
      .slice(0, limit)
      .map((a) => this.map(a));
  }

  // ---- growth ----
  async listMeasurements(babyId: string): Promise<Measurement[]> {
    return read<Measurement[]>(K.measurements, [])
      .filter((m) => m.baby_id === babyId)
      .sort((x, y) => (x.measured_at < y.measured_at ? 1 : -1));
  }
  async addMeasurement(m: { id: string; baby_id: string; kind: GrowthKind; value: number; measured_at: string }): Promise<Measurement> {
    const id = this.myId();
    if (!id) throw new Error("Not authenticated");
    const row: Measurement = { ...m, logged_by_user_id: id, created_at: new Date().toISOString() };
    write(K.measurements, [row, ...read<Measurement[]>(K.measurements, [])]);
    return row;
  }
  async deleteMeasurement(id: string): Promise<void> {
    write(K.measurements, read<Measurement[]>(K.measurements, []).filter((m) => m.id !== id));
  }

  // ---- caregivers ----
  async listCaregivers(babyId: string): Promise<Caregiver[]> {
    return this.links()
      .filter((l) => l.baby_id === babyId)
      .map((l) => {
        const u = this.userById(l.user_id);
        return {
          user_id: l.user_id,
          role: l.role as Caregiver["role"],
          joined_at: (l as Link & { joined_at?: string }).joined_at ?? new Date().toISOString(),
          display_name: u?.display_name ?? "Caregiver",
          avatar_color: u?.avatar_color ?? null,
          email: u?.email ?? null,
        };
      })
      .sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0));
  }
  // Returns an i18n key on failure (UI t()'s it), or null on success.
  async addCaregiverByEmail(babyId: string, email: string): Promise<{ error: string | null }> {
    const me = this.myId();
    if (!me) return { error: "care.error.generic" };
    const links = this.links();
    if (links.filter((l) => l.baby_id === babyId).length >= 10) return { error: "care.error.full" };
    const target = this.users().find((u) => u.email === email.trim().toLowerCase());
    // In demo there is no email delivery: only existing demo users can be linked.
    if (!target) return { error: "care.error.noUser" };
    if (links.some((l) => l.baby_id === babyId && l.user_id === target.id)) return { error: "care.error.already" };
    write(K.links, [...links, { baby_id: babyId, user_id: target.id, role: "caregiver" }]);
    return { error: null };
  }
  async removeCaregiver(babyId: string, userId: string): Promise<void> {
    write(K.links, this.links().filter((l) => !(l.baby_id === babyId && l.user_id === userId)));
  }
  async transferOwnership(babyId: string, userId: string): Promise<void> {
    const me = this.myId();
    const links = this.links().map((l) => {
      if (l.baby_id !== babyId) return l;
      if (l.user_id === userId) return { ...l, role: "owner" };
      if (l.user_id === me) return { ...l, role: "caregiver" };
      return l;
    });
    write(K.links, links);
    const babies = read<Baby[]>(K.babies, []).map((b) => (b.id === babyId ? { ...b, owner_id: userId } : b));
    write(K.babies, babies);
  }

  // ---- invites (token flow) ----
  private invites() {
    return read<DemoInvite[]>(K.invites, []);
  }
  private isOwner(babyId: string) {
    return this.links().some((l) => l.baby_id === babyId && l.user_id === this.myId() && l.role === "owner");
  }
  async createInvite(babyId: string, email: string): Promise<{ token: string | null; error: string | null }> {
    if (!this.isOwner(babyId)) return { token: null, error: "care.error.notOwner" };
    const em = email.trim().toLowerCase();
    const invites = this.invites();
    const pending = invites.filter((i) => i.baby_id === babyId && i.status === "pending");
    if (this.links().filter((l) => l.baby_id === babyId).length + pending.length >= 10) return { token: null, error: "care.error.full" };
    const already = this.links().some((l) => l.baby_id === babyId && this.userById(l.user_id)?.email === em);
    if (already) return { token: null, error: "care.error.already" };
    const existing = pending.find((i) => i.email === em);
    if (existing) return { token: existing.token, error: null };
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const inv: DemoInvite = {
      id: crypto.randomUUID(),
      baby_id: babyId,
      email: em,
      token,
      status: "pending",
      expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      invited_by: this.myId() ?? "",
    };
    write(K.invites, [...invites, inv]);
    return { token, error: null };
  }
  async listInvites(babyId: string): Promise<Invite[]> {
    return this.invites()
      .filter((i) => i.baby_id === babyId && i.status === "pending")
      .map((i) => ({ id: i.id, email: i.email, status: i.status, expires_at: i.expires_at }));
  }
  async revokeInvite(inviteId: string): Promise<void> {
    write(K.invites, this.invites().map((i) => (i.id === inviteId ? { ...i, status: "revoked" } : i)));
  }
  async acceptInvite(token: string): Promise<{ babyId: string | null; error: string | null }> {
    const me = this.myId();
    if (!me) return { babyId: null, error: "care.error.generic" };
    const invites = this.invites();
    const inv = invites.find((i) => i.token === token);
    if (!inv || inv.status !== "pending" || inv.expires_at < new Date().toISOString()) return { babyId: null, error: "care.error.invalidInvite" };
    if (!this.links().some((l) => l.baby_id === inv.baby_id && l.user_id === me)) {
      write(K.links, [...this.links(), { baby_id: inv.baby_id, user_id: me, role: "caregiver" }]);
    }
    write(K.invites, invites.map((i) => (i.id === inv.id ? { ...i, status: "accepted" } : i)));
    return { babyId: inv.baby_id, error: null };
  }
  async getInvitePreview(token: string): Promise<InvitePreview | null> {
    const inv = this.invites().find((i) => i.token === token && i.status === "pending" && i.expires_at > new Date().toISOString());
    if (!inv) return null;
    const inviter = this.userById(inv.invited_by)?.display_name ?? "ครอบครัว";
    const baby = read<Baby[]>(K.babies, []).find((b) => b.id === inv.baby_id)?.name ?? "ลูก";
    return { email: inv.email, inviter, baby };
  }

  // ---- cross-tab "realtime" via BroadcastChannel ----
  private bc(): BroadcastChannel | null {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
    return new BroadcastChannel("minom_demo");
  }
  private broadcast(msg: BcMsg) {
    const ch = this.bc();
    if (ch) {
      ch.postMessage(msg);
      ch.close();
    }
  }

  subscribe(babyId: string, handlers: RealtimeHandlers): () => void {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return () => {};
    const ch = new BroadcastChannel("minom_demo");
    ch.onmessage = (e) => {
      const msg = e.data as BcMsg;
      if ((msg.kind === "insert" || msg.kind === "update") && msg.row.baby_id === babyId) {
        const u = this.userById(msg.row.logged_by_user_id);
        const enriched = { ...msg.row, logged_by_name: u?.display_name ?? "Caregiver", logged_by_color: u?.avatar_color ?? null };
        if (msg.kind === "insert") handlers.onInsert(enriched);
        else handlers.onUpdate(enriched);
      } else if (msg.kind === "delete") {
        handlers.onDelete(msg.id);
      }
    };
    return () => ch.close();
  }
}
