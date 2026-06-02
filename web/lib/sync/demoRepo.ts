// DemoRepo — zero-backend implementation for design review and local QA of the
// section-05 behaviors. Persists to localStorage; uses BroadcastChannel to push
// inserts/deletes to other open tabs, which stands in for cross-device realtime.
// NOT real multi-device or real auth — see README. The Supabase impl is the
// architecture proof; this exists so `npm run dev` works with no setup.
import { colorFromSeed } from "@/components/ui";
import { t } from "@/i18n";
import type { Activity, ActivityRow, Baby, Profile, SessionUser, VerbType } from "@/lib/types";
import type { ActivityInsert, ActivityPatch, AuthResult, RealtimeHandlers, Repo } from "./repo";

type DemoUser = { id: string; email: string; password: string; display_name: string; avatar_color: string };
type Link = { baby_id: string; user_id: string; role: string };
type BcMsg = { kind: "insert"; row: ActivityRow } | { kind: "update"; row: ActivityRow } | { kind: "delete"; id: string };

const K = {
  users: "minom_demo_users",
  session: "minom_demo_session",
  babies: "minom_demo_babies",
  links: "minom_demo_links",
  activity: "minom_demo_activity",
};

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
    return { error: null };
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
