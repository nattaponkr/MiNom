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
| 3 | Eat v2 sheet matches spec across 3 modes + capture toggle, light+dark, 360px | ⏳ static/build verified; **interactive pass pending** (local browser smoke + prod dry-run) |
| 4 | Smart defaults fire correctly | ✅ logic verified (`eatDefaults` over `recentEats`); ⏳ live confirmation pending dry-run |
| 5 | 7-scenario dry-run + 3 Eat-v2 checks pass on production | ❌ **not yet run** — needs prod URL + 2 logins (see Open items) |
| 6 | Designer voice review cleared any new keys | ✅ N/A — every new user-facing string came from the designer's already-voice-reviewed `th-strings-eat2*.js`; I surfaced **no** new keys |

Dev server boots clean (`/` → 200, 0 runtime errors) in demo mode.

## Open items (block beta-open)

**Production dry-run** — I need from CPO: (a) the deployed prod URL, (b) two test logins on the same baby. Then I run:

*7-scenario protocol* (`HANDOFF_dev_04.md` §"Live beta dry-run") against the rebuilt Eat surface, **plus**:
1. **Mode persistence:** device A logs in นมแม่ mode → device B opens Eat sheet pre-selected to นมแม่ (last-used roams via `recentEats`).
2. **Repeat-last:** "ทำซ้ำครั้งล่าสุด" fires the named toast ("บันทึกซ้ำ …"), the Home card flashes, and [แก้ไข] opens the correct entry.
3. **Concurrency:** caregiver A logs a นมแม่ feed → within 60s caregiver B opens Eat → sees the mode-aware prompt (`bodyTimer` for a timer feed). *(Subject to the timer-detection note above.)*

`activity_logged` now carries a `mode` sub-field (the only PostHog delta) — CPO's eyeball pass can be a quick re-check.

## Handoff → PM
Eat v2 is built and on `main`. **Do not open beta invites yet** — the production dry-run is the gate and is pending the prod URL + two test logins. Once CPO provides those and the dry-run passes, beta is GO. Two design questions above (live timer? card attribution?) are yours to rule on; neither blocks the dry-run.
