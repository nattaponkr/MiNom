import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Auto-confirm-on-invite (HANDOFF_dev_04 #1). The invite token proves the user
// owns the invited email, so we create their account SERVER-SIDE via the admin
// API with email already confirmed — which sends NO confirmation email
// (criterion #3) and doesn't depend on the Auth SMTP working at all. Then we
// link them to the baby and mark the invite accepted (single-use).
// SERVICE-ROLE — server only. No-ops (not_configured) without the key.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 10;
}
const json = (body: object, status = 200) => NextResponse.json(body, { status });
// Non-sensitive hint about the configured key's shape (never the key itself).
function keyKind(k?: string): string {
  if (!k) return "none";
  if (k.startsWith("sb_secret_")) return "sb_secret";
  if (k.startsWith("sb_publishable_")) return "sb_publishable";
  if (k.startsWith("eyJ")) {
    try {
      return "jwt:" + (JSON.parse(Buffer.from(k.split(".")[1], "base64").toString()).role ?? "?");
    } catch {
      return "jwt:?";
    }
  }
  return "other";
}
function colorFromSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `oklch(0.58 0.11 ${h})`;
}

export async function POST(req: Request) {
  if (!URL || !SERVICE) return json({ ok: false, reason: "not_configured" });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, reason: "rate_limited" }, 429);

  let body: { token?: string; email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, reason: "bad_request" }, 400);
  }
  const token = body.token;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim() || email.split("@")[0];
  if (!token || !email || password.length < 6) return json({ ok: false, reason: "missing_fields" }, 400);

  const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1. validate invite (pending, unexpired) + token may only be used for its own email
  const { data: inv, error: invErr } = await admin.from("caregiver_invites").select("*").eq("token", token).maybeSingle();
  if (!inv || inv.status !== "pending" || new Date(inv.expires_at) < new Date())
    return json({ ok: false, reason: "invalid_invite", keyKind: keyKind(SERVICE), found: Boolean(inv), dbError: invErr?.message ?? null }, 400);
  if (String(inv.email).trim().toLowerCase() !== email) return json({ ok: false, reason: "email_mismatch" }, 403);

  // 2. resolve the user: create (confirmed, no email) if new; if they already
  //    have an account, tell the client to sign in instead.
  let userId: string | null = null;
  const { data: existing } = await admin.from("users").select("id").eq("email", email).maybeSingle();
  if (existing) {
    userId = existing.id as string;
    await admin.auth.admin.updateUserById(userId, { email_confirm: true }); // in case it was unconfirmed
    // can't verify their password here — client will sign in with what they typed
    // (if wrong, sign-in fails and we guide them). Flag exists so the client expects that.
  } else {
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // no confirmation email is sent
      user_metadata: { display_name: name, avatar_color: colorFromSeed(email) },
    });
    if (cErr || !created.user) return json({ ok: false, reason: "create_failed", detail: cErr?.message }, 502);
    userId = created.user.id;
  }

  // 3. link as caregiver (idempotent) + mark invite accepted (single-use)
  await admin.from("baby_caregivers").upsert({ baby_id: inv.baby_id, user_id: userId, role: "caregiver" }, { onConflict: "baby_id,user_id" });
  await admin.from("caregiver_invites").update({ status: "accepted", accepted_by_user_id: userId }).eq("id", inv.id);

  return json({ ok: true, babyId: inv.baby_id, existed: Boolean(existing) });
}
