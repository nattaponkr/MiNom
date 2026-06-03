import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Auto-confirm-on-invite (HANDOFF_dev_04 #1). An invite token proves the user
// owns the email it was sent to, so we skip the second (Supabase) confirmation
// email: validate the token, admin-confirm that exact email, link the user, and
// mark the invite accepted (single-use). SERVICE-ROLE — server only.
// No-ops (not_configured) without the key so the client falls back to the
// normal email-confirmation path.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// crude per-IP limiter to deter token guessing (single-instance; fine for beta)
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 10;
}
const json = (body: object, status = 200) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  if (!URL || !SERVICE) return json({ ok: false, reason: "not_configured" });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, reason: "rate_limited" }, 429);

  let body: { token?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, reason: "bad_request" }, 400);
  }
  const token = body.token;
  const email = (body.email ?? "").trim().toLowerCase();
  if (!token || !email) return json({ ok: false, reason: "missing_fields" }, 400);

  const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1. validate invite (pending, unexpired)
  const { data: inv } = await admin.from("caregiver_invites").select("*").eq("token", token).maybeSingle();
  if (!inv || inv.status !== "pending" || new Date(inv.expires_at) < new Date()) return json({ ok: false, reason: "invalid_invite" }, 400);
  // 2. token may only auto-confirm the exact email it was issued to (anti-abuse)
  if (String(inv.email).trim().toLowerCase() !== email) return json({ ok: false, reason: "email_mismatch" }, 403);

  // 3. find the just-created user (public.users mirrors auth.users via trigger)
  const { data: u } = await admin.from("users").select("id").eq("email", email).maybeSingle();
  if (!u) return json({ ok: false, reason: "no_user" }, 404); // signup row not propagated yet

  // 4. confirm the email
  const { error: cErr } = await admin.auth.admin.updateUserById(u.id as string, { email_confirm: true });
  if (cErr) return json({ ok: false, reason: "confirm_failed", detail: cErr.message }, 502);

  // 5. link as caregiver (idempotent) + mark invite accepted (single-use)
  await admin.from("baby_caregivers").upsert({ baby_id: inv.baby_id, user_id: u.id, role: "caregiver" }, { onConflict: "baby_id,user_id" });
  await admin.from("caregiver_invites").update({ status: "accepted", accepted_by_user_id: u.id }).eq("id", inv.id);

  return json({ ok: true, babyId: inv.baby_id });
}
