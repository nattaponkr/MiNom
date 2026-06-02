import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Sends a caregiver-invite email via Resend. The token is created client-side
// via the create_caregiver_invite RPC; this route only delivers the link.
// No-ops gracefully (sent:false) when RESEND_API_KEY is absent so the UI can
// fall back to a copyable link (demo / pre-provisioning).
export async function POST(req: Request) {
  const KEY = process.env.RESEND_API_KEY;
  let body: { token?: string; to?: string; inviterName?: string; babyName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ sent: false, reason: "bad_request" }, { status: 400 });
  }
  const { token, to, inviterName = "ครอบครัว", babyName = "ลูก" } = body;
  if (!token || !to) return NextResponse.json({ sent: false, reason: "missing_fields" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const link = `${appUrl}/invite/${encodeURIComponent(token)}`;

  if (!KEY) return NextResponse.json({ sent: false, reason: "email_not_configured", link });

  const from = process.env.RESEND_FROM || "ละมุน <onboarding@resend.dev>";
  const subject = `${inviterName}ชวนคุณมาดูแล${babyName}ด้วยกันบนละมุน`;
  const html = `
    <div style="font-family:'Hanken Grotesk',sans-serif;max-width:480px;margin:0 auto;color:#2b2622">
      <h2 style="font-weight:800">ละมุน</h2>
      <p style="font-size:15px;line-height:1.7"><b>${inviterName}</b> ชวนคุณมาช่วยดูแล <b>${babyName}</b> ด้วยกันบนละมุน —
      แอปบันทึกการกินนอนของลูกที่ครอบครัวใช้ร่วมกัน</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#c2693f;color:#fff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;display:inline-block">รับคำเชิญ</a>
      </p>
      <p style="font-size:12.5px;color:#8a8079">ลิงก์นี้ใช้ได้ 14 วัน · ถ้าปุ่มกดไม่ได้ ใช้ลิงก์นี้: <br>${link}</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ sent: false, reason: "resend_error", detail, link }, { status: 502 });
    }
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ sent: false, reason: "network", link }, { status: 502 });
  }
}
