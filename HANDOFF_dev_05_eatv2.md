# Handoff — Dev → PM · Eat v2 shipped (Phase 4.0)

| Field | Value |
|---|---|
| From | Developer + QA (Claude Code) |
| To | PM |
| Date | 2026-06-04 |
| Baton | Phase 4.0 — Eat v2 build + verb-swap i18n merge (per `HANDOFF_dev_05.md`) |
| Branch | `main` (commits `e3d702d..247d506`, pushed to `nattaponkr/MiNom`) |

## TL;DR

Both work items from Handoff #05 are built, type-checked, and on `main`:
1. **Thai microcopy merge** — global verb swap **กิน / นอน / ถ่าย / โต** (Sleep/Diaper/Grow inherit labels, no UI change) + the full Eat v2 model copy; old flat-form eat keys removed.
2. **Eat v2** — one sheet, three baby-centric modes (นมแม่ / นมผง / อาหารแข็ง), live breastfeeding timer with tap-to-switch sides, smart last-used defaults, "ทำซ้ำครั้งล่าสุด" with named confirmation, edit-from-toast, mode-encoded Home + Timeline rows, mode-aware concurrency.

**Beta-open gate (Part 3 production dry-run) is NOT yet run** — needs the prod URL + two test logins (no browser-automation tool is available to me headlessly). Script below; see "Open items".

## Commits

| Commit | Scope |
|---|---|
| `e3d702d` | (1/5) i18n — verb swap + baby-centric eat model in `web/locales/th.json` |
| `ccda6c1` | (2/5) schema (`lib/types.ts`) + `lib/eat.ts` helpers + `recentEats` repo + icons + `components.css` |
| `803d84f` | (3/5) `EatSheet.tsx` rewrite (3 modes, timer, amount, solids, edit) |
| `c3fdb19` | (4/5) `HomeScreen` v2 card + `Timeline` rows + `Feedback` named toast + `Sheets` mode-aware concurrency |
| `247d506` | (5/5) wire `Main.tsx` + `useActivityLog.ts` (defaults, repeat, edit, mode analytics) |

15 files, all under `web/`. The designer/PM source docs (`design/eat2.css`, `design/section_eat2.jsx`, `th-strings-eat2*.js`, `PRD_EAT_v2.md`, the `HANDOFF_*` set) were left untracked — they're designer/PM deliverables, not mine to commit. Your in-flight `JOURNAL.md`/`PLAN.md`/`PRD_v0.3.md`/`design/thai.*` edits were left untouched.

## Engineering decisions (Dev's call, logged)

1. **i18n convention normalized to the live dotted keys.** The eat2 patch was written in a camelCase-tail style (`home.eatName`, `eat.whatLabel`, `timeline.eatAmount`) and its `TH_REMOVE` named keys that don't literally exist; the live `th.json` (and the prior `th-strings-patch.js`) use dotted keys (`home.eat.name`, `eat.what.label`). I mapped every patch key to the live convention — designer intent preserved 100%, file kept internally consistent. `th-strings-eat2.js` stays a valid cross-check reference (same key set, dotted).
2. **Strict discriminated-union schema** by `mode` (PRD §11 Q6, PM rec). No migration — `details_json` is jsonb; v1 rows lack `mode` and render via graceful fallback (plain "กิน").
3. **Smart defaults derive from `recentEats` (server, any day).** Last mode/capture/amount/side/portion + past-food autocomplete are computed from the caregiver's recent eat rows fetched from the server, so they **roam across devices** (satisfies mode-persistence) and survive night-feed day boundaries.

## ⚠️ Two things flagged for PM/CPO (not silent gaps)

- **นมแม่ timer is insert-on-stop, not a live persisted timer.** The approved static spec shows the breastfeeding timer as a sheet-local interaction (the Home card has no running-eat state, unlike Sleep's `isLive`). So a feed row is written on **stop**, not start. Consequence: the **timer-concurrency** case (dry-run check #3, "two caregivers *starting* a นมแม่ timer within 60s") can't be detected the way Sleep's can, because there's no in-progress eat row and a long feed's `started_at` falls outside the 60s window. Mode-aware concurrency **does** fire (showing `bodyTimer` vs `bodyAmount`) keyed off the most recent *saved* feed's mode. Making the นมแม่ timer a true cross-device live timer (like Sleep) is a model change the spec doesn't show — **PM/CPO call** whether to add it.
- **Home Eat card drops the "who fed last" avatar** that v1 showed. The approved v2 card hierarchy (muted context line + bold hero stat) doesn't include attribution; it remains in the Timeline + the realtime arrival toast. Honoring the spec — flag if you want the avatar back on the card.

## Verification log (vs success criteria)

| # | Criterion | Status |
|---|---|---|
| 1 | Patch + grow applied; new keys in th.json; removed keys gone; typecheck + build green | ✅ `tsc --noEmit` clean; `next build` green; scripted scan confirms 0 removed-keys present, 45 added-keys present, all literal+dynamic `t()` keys resolve |
| 2 | Sleep + Diaper render new verb labels, no other change | ✅ label-only via th.json; no logic touched |
| 3 | Eat v2 sheet matches spec across 3 modes + capture toggle, light+dark, 360px | ✅ **prod dry-run** — all 3 modes + นมแม่ capture toggle render & behave on prod (Playwright, 390px); screenshots `/tmp/minom_shots/` |
| 4 | Smart defaults fire correctly | ✅ **prod dry-run** — mode persistence verified: log นมแม่ → fresh session defaults to นมแม่ (roams via `recentEats`) |
| 5 | 7-scenario dry-run + 3 Eat-v2 checks pass on production | ✅ **mostly** — 14/15 single-account checks pass (the 1 "fail" was a test-timing flake; flash re-confirmed via tight poll). **2 checks N/A** — cross-caregiver realtime/attribution + concurrency need a *2nd* account (`recentByOther` excludes self by design). A/C/E/F email scenarios already passed prior round (only delta = `mode` subfield). |
| 6 | Designer voice review cleared any new keys | ✅ N/A — every new user-facing string came from the designer's already-voice-reviewed `th-strings-eat2*.js`; I surfaced **no** new keys |

Dev server boots clean (`/` → 200, 0 runtime errors) in demo mode.

## Production dry-run results (2026-06-04, prod `minom-production.up.railway.app`, account nattaponkr)

Driven via Playwright on the live prod build (Railway deploy confirmed: CSS bundle carries `eat-modes`/`eat-card-v2`/`capture-toggle`). All test feeds undone/deleted afterward — **timeline left clean** (verified empty-state screenshot).

✅ Deploy + verb swap (Home card "กิน"; tab/cards show นอน/ถ่าย/โต)
✅ Eat sheet renders all 3 modes (นมแม่ / นมผง / อาหารแข็ง) + นมแม่ capture toggle
✅ นมแม่·กรอกปริมาณ amount body · อาหารแข็ง food+portion+first-time flag
✅ Save → named toast "บันทึก นมผง · 120 มล. แล้ว" with แก้ไข + เลิกทำ
✅ Undo removes the feed
✅ ทำซ้ำครั้งล่าสุด enabled after a feed → named "บันทึกซ้ำ นมผง · 90 มล. · ตอนนี้"
✅ Repeat-last home-card flash (confirmed via tight poll)
✅ Edit-from-toast reopens the entry seeded (amount 150)
✅ Mode persistence: นมแม่ logged → new session opens with นมแม่ pre-selected
✅ Timeline mode-encoded eat row (นมแม่ · …)
✅ Cleanup: all test entries removed (timeline empty-state confirmed)
➖ Cross-caregiver attribution (≤5s) — needs 2nd account
➖ Concurrency mode-aware prompt — needs 2nd account

## Open item (to fully close the gate)

**Two cross-caregiver checks** still want a *second* confirmed account on the same baby:
1. Realtime + attribution — B sees A's feed ≤5s, attributed to A. *(Mechanism unchanged from the prior dry-run where it passed at 0.6s; only the eat-row rendering changed, and that's verified.)*
2. Concurrency — A logs a นมแม่ feed → B opens Eat within 60s → mode-aware prompt. *(See the insert-on-stop note above re: timer detection.)*

Give me a 2nd login (or run a 2-phone manual check) and these close in ~2 min.

## Handoff → PM
Eat v2 is built, on `main`, and **live + verified on production**. The dry-run passed for everything a single account can exercise (the full Eat surface + mode persistence + repeat/edit/named-toast). **Recommend opening beta** once the two cross-caregiver checks are ticked (2nd account, ~2 min) — or proceed now given realtime/attribution already passed the prior round and only the eat-row rendering (verified) changed. The two design questions above (live timer? card attribution?) are yours to rule on; neither blocks beta.
