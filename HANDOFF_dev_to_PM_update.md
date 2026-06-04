# Dev → PM — Phase 4.0 status update (relay via CPO)

**Date:** 2026-06-04 · **From:** Developer + QA (Claude Code) · **Re:** `HANDOFF_dev_05.md`
**Branch:** `main` @ `nattaponkr/MiNom` (commits `e3d702d..07a6b86`) — live on Railway.
Detailed briefs: `HANDOFF_dev_05_eatv2.md` (Parts 1–3) · `HANDOFF_dev_to_PM_part4.md` (Part 4).

## TL;DR

Eat v2 + the Sleep/Diaper parity pass are **built, shipped to `main`, deployed, and verified on production**. The beta-open gate is **one check away**: two cross-caregiver checks need a second test account. Separately, I diagnosed the **invite-email** problem (Resend domain, not code) — beta runs link-only per CPO. Three small product decisions are waiting on you (below); none block beta.

## ✅ Shipped + prod-verified

**Part 1 — i18n.** Global verb swap **กิน / นอน / ถ่าย / โต** (Sleep/Diaper/Grow inherit labels); full Eat v2 model copy; old flat-form keys removed. Normalized to the live dotted key convention (precedent).

**Part 2 — Eat v2.** Three modes (นมแม่ / นมผง / อาหารแข็ง); นมแม่ capture toggle (จับเวลา timer w/ tap-to-switch sides · กรอกปริมาณ amount); smart last-used defaults that roam cross-device; "ทำซ้ำครั้งล่าสุด" named confirmation + card flash; `[แก้ไข]` save-toast; mode-encoded Home + Timeline; mode-aware concurrency; strict mode-discriminated schema (legacy rows → plain กิน). `activity_logged` gained a `mode` sub-field (only PostHog delta).

**Part 4 — Sleep/Diaper parity.** Sleep + Diaper Home cards now share the Eat card's muted-context + bold-detail hierarchy (verb-tinted icons; sleep shows a live mm:ss timer). Diaper save toast gained `[แก้ไข]` → reopens seeded.

**Production dry-run (Playwright, live prod):**
- Eat v2: **14/15** single-account checks pass (the one "fail" was a test-timing flake — flash re-confirmed). All test data cleaned up.
- Part 4: **8/8** — light + dark visual parity, diaper edit-toast, all verified.
- `tsc` clean, `next build` green. CPO's account used; timeline left clean; CPO's running sleep preserved.

## ⏳ Beta-open gate — one item left

**Two cross-caregiver checks need a second confirmed account on the same baby:** (1) realtime + attribution (B sees A's feed ≤5s, attributed to A), and (2) the mode-aware concurrency prompt. They can't run on one login (concurrency excludes your own logs by design). Realtime/attribution already passed the *prior* dry-run at 0.6s and only the eat-row rendering changed (verified) — so residual risk is low. Give CPO a 2nd test login and I close these in ~2 min.

## 📨 Invite email — diagnosed (Resend domain, not code)

CPO reported invite emails not arriving. Root cause (confirmed by live probe): **Resend has no verified sending domain**, so it's in test mode (`from: onboarding@resend.dev`) and only delivers to the account owner's own address — every invite to a real caregiver gets a `403`. This is the *"blocked on lamoon.app domain"* item, a provisioning gap. **CPO chose link-only for beta** — the app already falls back to a copyable invite link, so caregiver onboarding works today (share the link via LINE/chat). Re-enabling auto-email later = verify a domain in Resend + set `RESEND_FROM` (CPO task; I have the steps ready). I softened `care.inviteHelper` so it no longer promises an email that won't arrive.

## ❓ Decisions for PM (none block beta)

1. **Part 4 · notes → textarea.** Sleep + Diaper have **no notes field today**, so there's nothing to "convert." Add a new optional notes textarea to both (true parity, mild new field) — or skip? *Dev rec: add if you want the multi-line round-trip check to be real; ~30 min.*
2. **Part 4 · Sleep `[แก้ไข]` toast.** Sleep is a start/stop timer with **no save-toast moment**. Shipped default = Sleep parity is home-card-only; `[แก้ไข]` applies to Diaper only. Fuller symmetry (toast-on-stop + edit a finished sleep) is new UX. *Dev rec: keep home-card-only for beta; revisit post-beta. (Flagging: the dry-run's "[แก้ไข] on Sleep toast" check can't pass without this — not a silent miss.)*
3. **Designer voice ticks** on two strings I surfaced (both PM/spec-derived, likely rubber-stamps): `home.sleep.justWoke` = "เพิ่งตื่น" and the revised `care.inviteHelper` = "สร้างลิงก์คำเชิญเพื่อส่งให้ผู้ดูแล ใช้ได้ 14 วัน".

## Handoff → PM
Phase 4.0 is **done and live** except the two cross-caregiver checks (need a 2nd account) and your one-line on decisions 1–2. Once those clear, **beta is GO** (link-only invites). Reply with: a 2nd test login (to close the gate), notes-field yes/no, sleep-toast keep-as-is or expand, and the Designer ticks.
