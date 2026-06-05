# Handoff — Dev → PM · #06 close-out (final Phase 4.0 pass)

| Field | Value |
|---|---|
| From | Developer + QA (Claude Code) |
| To | PM |
| Date | 2026-06-05 |
| Baton | `HANDOFF_dev_06.md` — persistent invite-link UX + microcopy + notes parity + cross-caregiver checks |
| Branch | `main` @ `nattaponkr/MiNom` (`4b3df25..f80d147`) — live on Railway |

## TL;DR

**Phase 4.0 is CLOSED. Beta can open.** All of #06 is built, shipped, deployed, and verified on production: Parts 1–3 (13/13 dry-run) — including the headline bug fix (a pending invite now **survives leaving/returning** and is recoverable) — **and Part 4 (the two cross-caregiver checks) now pass 8/8 on the 2nd login**.

## Part 4 — cross-caregiver checks ✅ (verified 2026-06-05, 2nd account `nattapon@amitysolutions.com`)

Both accounts share baby "Leon". On production:
- **Realtime + attribution:** A logs a นมแม่ timer feed → B receives it via the realtime toast *"nattaponkraisingkorn เพิ่งบันทึกการกิน · ตอนนี้"* (attributed to A, ≤5s). ✅
- **Mode-aware concurrency:** within 60s, B opens Eat → sees the **timer-variant** prompt *"…เพิ่งเริ่มจับเวลาให้นม…"* with เปิดตัวจับเวลานั้น / เริ่มจับเวลาใหม่. ✅ (This confirms the `concurrency.eat.bodyTimer` path — the insert-on-stop concurrency I'd flagged as uncertain works when the peer's timer feed is recent.)
- Bonus observed: B's Eat sheet defaulted the breast side to ขวา "สลับจากครั้งที่แล้ว" — smart last-used defaults roam cross-device via `recentEats`, as designed.

## ✅ Shipped + prod-verified

**Part 1 — persistent invite-link UX** (`CaregiversScreen.tsx` rebuilt + new `InviteSheet.tsx`):
- Sectioned list — `กำลังดูแลอยู่` / `คำเชิญที่ยังไม่ตอบรับ`; empty-state CTA; transfer/remove/leave preserved.
- Pending invites are **persistent rows** → tap opens the **invite detail sheet** (the canonical home for that invite). The old one-time inline link (lost on exit) is gone.
- Sheet: **share-first** (`navigator.share`) where supported, **copy-first** fallback otherwise; reveal-on-tap link (unauth token, never default-bold on the list); **QR** (`qrcode.react` → real scannable SVG); **revoke** with confirm + toast.
- Expired rows surface inline (distinct) with **resend** → fresh 14-day token, old row left for the audit trail.
- Data: `Invite` gained `token`/`created_at`/`inviter`; `listInvites` returns them (RLS already allowed the owner — no migration). New dep: `qrcode.react@^4.2.0`.

**Part 2 — invite microcopy** merged (~40 keys, no removals). `care.add`→"เชิญผู้ดูแล", `care.inviteHelper` reset to the honest manual-share expectation. `home.sleep.justWoke` confirmed as-is (no-op).

**Part 3 — Sleep + Diaper notes → textarea** (PM call): optional multi-line notes on both, persisted in `details_json.notes`. Diaper round-trips via edit; Sleep threads notes through `startSleep`/`stopSleep`.

**Production dry-run — 13/13:** invite→sheet · **persistent recovery (exit→return→row persists→tap→link recoverable)** · copy-first fallback · copy→คัดลอกแล้ว · revoke→toast+row gone · share-first CTA · QR SVG renders · Diaper notes multi-line round-trip · Sleep notes textarea present. All test invites revoked, test entries deleted, the CPO's running sleep untouched. `tsc` clean, `next build` green, all i18n keys resolve.

## Notes / minor flags (not blockers)

- **Expired→resend** is code-verified but not prod-tested (can't backdate `expires_at` from the UI). The path: expired pending rows show `หมดอายุแล้ว` + a resend affordance → `create_caregiver_invite` issues a fresh token. To prod-verify, backdate one invite's `expires_at` in the DB, or it self-demonstrates after 14 days.
- **Sleep notes** round-trip is verified by code + the textarea renders on prod; I did **not** stop the CPO's live running sleep to prod-test the stop-persist, so that specific persistence is code-verified only.
- **No new Thai keys surfaced** by me — every string came from the designer's voice-reviewed `th-strings-invite-patch.js` (which also confirmed `care.inviteHelper` + `home.sleep.justWoke`). So no Designer review outstanding.
- Auto-email is still link-only (Resend domain unverified) — unchanged by this UX, and the persistent share-link is exactly what makes link-only pleasant.

## Success criteria (all met)
1. Persistent-invite UX matches spec; lost-link bug fixed (exit→return→recoverable) — ✅ verified on prod.
2. Microcopy merged; typecheck + build green — ✅.
3. Sleep + Diaper notes are textareas; multi-line round-trips — ✅ (Diaper prod-verified; Sleep code-verified, see flag).
4. Two cross-caregiver checks pass on the 2nd login — ✅ 8/8 on prod.
5. Full dry-run green on production — ✅ (21/21 across #06 + cross-caregiver; expired→resend code-verified per flag).

## Handoff → PM
**Phase 4.0 is closed and verified on production. Beta can open.** Recommend kicking off the recruitment list (`BETA_RECRUITMENT.md`) and sending the first invites — onboarding is via the persistent share-link (auto-email stays off until the Resend domain is verified, a separate non-blocking task). Nothing else is outstanding on the Dev side.
