# Query #01 — Dev → Designer

| Field | Value |
|---|---|
| From | Developer + QA (Claude Code) |
| To | Designer (Claude Design) |
| Date | 2026-05-31 |
| Routed by | CPO (Nattapon) |
| Re | Phase 2 (Walking Skeleton) is blocked — I can't find your Phase 1 deliverables |

---

## TL;DR

I've picked up the Phase 2 baton to build the Eat vertical slice. My brief says to **lift tokens verbatim from `styles.css`** and **match the hi-fi in `MiNom Design — Phase 1.html`**, implementing the behaviors shown in **section 05**. But none of those files are in the `MiNom/` folder (I searched the whole Desktop + Downloads), and there's no `Designer — Phase 1 complete` entry in `JOURNAL.md` yet. I think your deliverables are still in your thread and haven't been dropped into the shared folder. Can you export them?

## What I need from you (in priority order)

1. **The design source files**, dropped into `MiNom/design/`:
   - `MiNom Design — Phase 1.html`
   - `styles.css` (or wherever the tokens live — if styles are inline in the HTML, that's fine, just say so)
   - Any assets the HTML references (fonts, icons, SVGs).
   - I read the raw source directly and lift tokens from it — **no need to re-export or simplify.** Give me exactly what you built.

2. **Confirmation that these specific things are in there**, since my Done criteria depend on them:
   - Color tokens for **both light and dark** themes
   - Type scale + font family/weights, spacing scale, radius/elevation tokens
   - Hi-fi for **Home** and **Quick-Log: Eat**, both themes
   - The **section 05** live behaviors I'm told to implement: optimistic write + 5s undo, skeleton loading, offline Queued→Synced pills, real-time row arrival, concurrency soft-prompt (dismissible sheet, not a screen), inline validation, delete confirm.

   If any of these isn't actually in your Phase 1 output, tell me which — I'll either build to a spec you describe, or we flag it to PM/CPO rather than me inventing it.

## Small clarifications (only if quick — don't let these block the file drop)

- **Nav:** I'm using "Family" as the nav label (settled call from CPO). Does your Timeline design already label it that way, or do I override your file?
- **Timeline attribution:** avatar vs initials for "who logged it" — which did you land on?
- **Skeleton loading:** how many placeholder rows / what shape? (I can infer from the HTML if it's in there.)

## What I'm NOT asking for

I don't need new design work — Phase 1 is supposedly done. This is purely "please put the finished files where I can read them." If it's already routed and I just can't see it, point me at the path.

## Why this matters

My way-of-work commits me to matching your spec, not improvising it. Building the slice with invented tokens would diverge from what you shipped and force a Phase 2 redo. A few-minute file drop saves that.

**Handoff → Designer (Claude Design):** please drop the files into `MiNom/design/` (or tell me where they are), confirm the checklist in §2, and answer the three quick clarifications if easy. Then `Handoff → Dev` and I'll start building immediately.
