# Handoff #15 (closeout) — PM → Dev · Approve commit + PR for WHO chart

| Field | Value |
|---|---|
| From | PM (Claude) |
| To | Developer (Claude Code) |
| Date | 2026-06-09 |
| Re | Approval to commit + open PR for the real WHO LMS growth chart (#15) |
| Predecessor | `HANDOFF_dev_to_pm_15.md` (Dev → PM return) |
| Status | **Approved. Commit + open the PR.** Three non-code items remain CPO/hardware-owned (below). |

---

## Decision: ship it

Build is green (`tsc` clean, `next build` green), 6/6 unit tests pass, WHO math spot-checks pass, and the sex-degrade behaves honestly. **Commit the working tree and open the PR.** No further code changes requested from me before commit.

## Accepted, explicitly

1. **Sex setter scope addition.** The brief and Designer §08 wrongly assumed sex was already collected. It wasn't — no setter existed, so curves would never have rendered on real babies. Adding the setter in onboarding (BabySetup, skippable) + Settings (editable, tap-to-clear) was the correct call. Accepted, no rework.
2. **Empty-state deviation (your Flag #3).** Chart appears once a metric has ≥1 point; existing #13 empty states stay. Accepted as a conscious choice, not an oversight. We may extend to zero-data curves post-beta.
3. **0–24mo LMS bundle (your Flag #2).** Fine for the 0–12mo beta. Full 0–60mo WHO tables remain a pre-public-launch data task; >24mo clamping to the last row is acceptable for now.

## PRD is now updated (so the spec matches what you shipped)

- **§5** records sex is optional **and now editable post-setup** (your Flag #1).
- **§0.2** (new) captures the WHO chart semantics: chart-is-diagnostic principle, the five curves + LMS formula, smart axes, today-marker, mandatory real-text citation, the sex three-state degrade table, and the actual-age / >60mo / 0–24mo scope locks.
- Note: the 2026-06-07 journal claimed this PRD edit was already done, but it had never been written to the file. Fixed now. Going forward I'll cite the exact file+section in journal "PRD updated" notes.

## Not code — owned by CPO / hardware, before this is live on prod

These are **not** blockers to your commit/PR, but they gate the production release. Listed so the verdicts get logged:

1. **Run migration `0007_measurements_realtime.sql`** on the prod DB (adds `measurements` to the `supabase_realtime` publication). Without it the chart works but won't live-update on a peer's measurement (Part 5).
2. **#12 two-device prod smoke check** — two physical devices + two prod accounts. Never run from your environment; steps unchanged from the original brief. CPO to run/assign and log the verdict.
3. **Visual AA spot-check, both themes** (canvas-resolved). You satisfied AA by construction (tokens bound to Designer §07); we just want one headless/visual confirmation before merge.

## Return to PM

When committed, drop the commit SHA + PR link in the journal and hand back. If the visual AA spot-check or migration surfaces anything, flag it the same way.

**Handoff → CPO:** route this to Claude Code. Then please run or assign the three items above.
