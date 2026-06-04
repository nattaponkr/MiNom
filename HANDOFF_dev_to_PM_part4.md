# Dev → PM (relay via CPO) — Part 4 parity: done + 2 decisions needed

**Date:** 2026-06-04 · **Re:** `HANDOFF_dev_05.md` Part 4 (UI parity for นอน + ถ่าย)

## Shipped + verified on prod (no decision needed)

1. **Home-card hierarchy parity** — Sleep + Diaper now use the same muted-context + bold-detail shell as the Eat v2 card (verb-tinted icon, no modes/repeat-bar).
   - Sleep: running → `นอน · กำลังหลับ` + bold live mm:ss timer; just woke → `นอน · เพิ่งตื่น` + bold time-ago; empty pattern matches Eat.
   - Diaper: `ถ่าย · {time-ago}` + bold kind (ฉี่ / อึ / ทั้งคู่); empty pattern.
   - Verified on production, light **and** dark — the three cards read as one family.
2. **Diaper `[แก้ไข]` toast** — the Diaper save toast names what was logged and offers แก้ไข, which reopens the entry pre-filled (kind + time). Verified on prod: save อึ → แก้ไข → sheet reopens with อึ selected.

Commit `a37ef41` on `main`, live on Railway.

## ⚠️ Decision 1 — new Thai string surfaced (Designer voice review)

The "just woke" muted line needed a string that didn't exist. I used the copy you specified in the brief:
- **`home.sleep.justWoke` = "เพิ่งตื่น"**

It's already merged so the build is green, but per the Phase-3.5 rule it should get a **Designer voice-review tick** (it's your copy, so likely a rubber-stamp). Flag if Designer wants a different word.

## ⚠️ Decision 2 — two Part-4 items don't fit the current code; need your call

The brief assumes Sleep + Diaper already have a notes input and a save toast. **They don't** — so these two items would each require *new* substrate, which sits in tension with Part 4's "visual/consistency only — no new logic." I did **not** guess; routing to you:

**(a) Notes → textarea.** Neither Sleep nor Diaper has a notes field today (Diaper = kind + when; Sleep = timer + when). "Convert input → textarea" has nothing to convert.
- *Option A (Dev-feasible, low-risk):* add a new **optional** notes textarea to both, stored in `details_json.notes`, round-trips via edit. True parity with Eat. It's a new optional field (mild "new logic").
- *Option B:* skip notes on Sleep/Diaper — nothing to convert; stay strictly within "no new logic."
- **Dev recommendation:** A if you want the multi-line-notes parity check to be real; B if "no new logic" is firm. Either is ~30 min.

**(b) Sleep `[แก้ไข]` toast.** Sleep is a start/stop **timer** with no save-toast moment (Diaper is an instant log, so it already has one). A parity edit-toast on Sleep means new UX.
- *Option A:* show a named save toast when a sleep **completes** (on stop), with แก้ไข that reopens the finished sleep to adjust start/end — new toast + a new "edit a completed sleep" flow.
- *Option B (shipped default):* Sleep parity = **home-card only**; the `[แก้ไข]` edit-toast applies to Diaper only. Sleep's timer UX is untouched. Least new logic.
- **Dev recommendation:** B for the beta gate (it's what I shipped); revisit A post-beta if you want full symmetry. The Part-4 dry-run check "[แก้ไข] on Sleep toast" can't pass under B because Sleep has no save toast — calling that out so it's not read as a silent miss.

## What I need back
One line each on (a) and (b), and a Designer tick on "เพิ่งตื่น". If you pick A on either, I'll implement + re-verify in the next pass. If B/B, Part 4 is **done as shipped** and the only open dry-run item remains the two cross-caregiver checks (need a 2nd account).
