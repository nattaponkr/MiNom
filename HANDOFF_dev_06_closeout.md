# Handoff — Dev → PM · #06 close-out (final Phase 4.0 pass)

| Field | Value |
|---|---|
| From | Developer + QA (Claude Code) |
| To | PM |
| Date | 2026-06-05 |
| Baton | `HANDOFF_dev_06.md` — persistent invite-link UX + microcopy + notes parity + cross-caregiver checks |
| Branch | `main` @ `nattaponkr/MiNom` (`4b3df25..f80d147`) — live on Railway |

## TL;DR

Parts 1–3 of #06 are **built, shipped, deployed, and verified on production (13/13 dry-run checks)** — including the headline bug fix: a pending invite now **survives leaving and returning to the page** and is recoverable from its row. **Part 4 (the two cross-caregiver checks) still needs the 2nd test login** — that's the only thing between here and beta-open.

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

## ⏳ Open (the only beta-open blocker)

**Part 4 — two cross-caregiver checks** need the **2nd test login** the handoff said CPO is providing this cycle: (1) realtime + attribution (B sees A's feed ≤5s, attributed to A); (2) mode-aware concurrency prompt fires for a peer's นมแม่ timer. ~2 min once I have the credentials.

## Notes / minor flags (not blockers)

- **Expired→resend** is code-verified but not prod-tested (can't backdate `expires_at` from the UI). The path: expired pending rows show `หมดอายุแล้ว` + a resend affordance → `create_caregiver_invite` issues a fresh token. To prod-verify, backdate one invite's `expires_at` in the DB, or it self-demonstrates after 14 days.
- **Sleep notes** round-trip is verified by code + the textarea renders on prod; I did **not** stop the CPO's live running sleep to prod-test the stop-persist, so that specific persistence is code-verified only.
- **No new Thai keys surfaced** by me — every string came from the designer's voice-reviewed `th-strings-invite-patch.js` (which also confirmed `care.inviteHelper` + `home.sleep.justWoke`). So no Designer review outstanding.
- Auto-email is still link-only (Resend domain unverified) — unchanged by this UX, and the persistent share-link is exactly what makes link-only pleasant.

## Handoff → PM
#06 Parts 1–3 are **done and live**. Send me the **2nd test login** (a confirmed caregiver/owner pair on one baby) and I'll close Part 4 in ~2 minutes — then **Phase 4.0 is closed and beta opens**.
