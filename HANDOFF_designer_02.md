# Handoff #02 — PM → Designer

| Field | Value |
|---|---|
| From | PM (Claude) |
| To | Designer (Claude Design) |
| Date | 2026-06-01 |
| Routed by | CPO (Nattapon) |
| Stage gate | Localization rework — runs alongside Phase 2 wrap-up, before Phase 3 |
| Updated | 2026-06-01 — added rebrand (app: **ละมุน** / Lamoon) |

---

## TL;DR

Three things to address in one pass:
1. **Rebrand.** App is now **ละมุน** (Lamoon, pronounced *lah-MOON* — means soft/gentle/tender). Old name MiNom is retired user-facing; folder/repo stay MiNom internally. Wordmark, app title, splash, signup, footer — everywhere users see a name — should read ละมุน.
2. **Thai-first rework.** MVP ships Thai-only. Pick Thai typography, rewrite microcopy in native Thai, sanity-check the four hi-fi screens with real Thai strings.
3. **Five clarifications Dev asked for** at end of Phase 2. Resolve so Phase 3 (copy-paste Eat → Sleep/Diaper) starts unblocked.

Read `PRD_v0.3.md` first (now includes §0 Brand identity). Then `JOURNAL.md` for the latest two entries from Dev.

---

## Part 0 — Brand identity (new)

### What you're working with
- **App name:** ละมุน (Lamoon)
- **Meaning:** soft / gentle / tender. Compound ละมุนละไม = "exquisitely gentle."
- **Brand thesis:** The name names the *feeling*. Every interaction (visual, copy, motion) should leave a *ละมุน* feeling behind. If something feels harsh, loud, or busy, it's not on-brand. Use this as your design filter.
- **Internal vs external:** Users see "ละมุน." Code/folder stay MiNom. Repo rename is a later task.

### Deliverables for Part 0

1. **Wordmark.** A Thai-script wordmark for **ละมุน**. Calm, modern, soft curves. Should sit comfortably at small sizes (24px logo lockup) and large (splash screen). Light + dark.
2. **Latin lockup** (secondary). "Lamoon" wordmark for footer/legal/social handles. Same family as the Thai wordmark or paired type. The Thai is primary — Latin is the alternate, never the headliner.
3. **App icon** placeholder for staging (final by Phase 4 beta). Square, works at 48px and 1024px.
4. **Tagline.** Pick one (or propose a better one):
   - "ดูแลลูกอย่างละมุนละไม"
   - "ทุกบันทึกของลูก ในแบบที่ละมุนที่สุด"
   - Your call. Plain, warm, declarative — never advertising-loud.
5. **Brand voice note in the component stub.** One paragraph naming the tone for every future copy decision: warm, plain Thai, ละมุน. Concrete examples of "on-brand" vs "off-brand" microcopy.

### Constraints
- The Thai script of ละมุน has a balanced horizontal rhythm (no tall ascenders/descenders) — lend itself to logotype work; designer's call on weight/case.
- Logo must coexist with the Thai-capable typeface you pick in Part A — don't double-up on type personalities.

---

## Part A — Thai-first rework

### Why the change
CPO direction: target audience is Thai parents; product should feel native, not translated. PRD v0.3 §11 codifies the localization strategy. The decisions worth re-reading:

- Thai-only MVP. No EN switcher yet.
- Voice: warm, plain-spoken Thai. Not stiff/academic, not baby-talk.
- Arabic numerals (1/2/3), Gregorian calendar for now, 24-hour time, Thai locale formatting via `Intl.*` (Dev will wire).

### Deliverables

**1. Typography pick.**
Recommend a primary Thai typeface (and optionally a backup). Candidates worth evaluating — designer's call:
- IBM Plex Sans Thai
- Anuphan (Cadson Demak)
- Noto Sans Thai

The mono face (Spline Sans Mono) can stay — only Latin numerals/timestamps use it. Validate that the chosen Thai face renders cleanly at 12px caption and 14/16px body in both light + dark.

**2. Thai microcopy.**
Rewrite every piece of UI copy from the v0.2 hi-fi in native Thai. Not translations of the English — rewrites driven by intent. Includes:
- Screen titles & section headers
- Button labels (primary/secondary, all states)
- Empty states (Home, Timeline, Growth)
- Inline validation messages
- Soft concurrency prompt (currently English in Dev's Eat implementation)
- Real-time toast & undo banner copy
- Microcopy table from your Phase 1 section 06

Deliverable form: a Thai microcopy sheet (table or JSON-shaped) keyed by string ID, so Dev can drop straight into `locales/th.json`. Suggested format:

```
home.lastEat.label          "ให้นมล่าสุด"
home.lastEat.empty          "ยังไม่มีบันทึก แตะเพื่อเริ่ม"
eat.cta.save                "บันทึก"
eat.cta.saving              "กำลังบันทึก…"
eat.concurrency.title       "{name} เพิ่งบันทึกการให้นมไป {seconds} วินาที"
eat.concurrency.action.view "ดูของ {name}"
eat.concurrency.action.new  "บันทึกใหม่"
…
```

Tone notes:
- Use natural, polite Thai. "บันทึก" is fine for "save"; "เพิ่ม" for "add". Avoid stilted/academic translations.
- Pet names in examples: น้องฟ้า, น้องเทียน — same Thai names already in PRD personas, so the voice is consistent across product surfaces.
- Caregiver words: ใช้คำว่า "ครอบครัว" สำหรับ section heading (Designer's earlier call to use "Family" over "Caregivers" still stands — translates as ครอบครัว). For individual role: คุณพ่อ/คุณแม่/คุณยาย/คุณย่า/พี่เลี้ยง depending on actor — but in MVP we only need a generic "ผู้ดูแล" label.

**3. Layout pass on the 4 hi-fi screens.**
Re-render Home + Eat + Sleep + Diaper in light + dark with the new Thai copy in the actual chosen typeface. Verify:
- No clipped or wrapped lines on 360px viewport.
- Thai's tall ascenders/descenders don't collide with line-height — adjust spacing tokens if needed.
- Optical balance of icons + Thai labels (sometimes icons need slight repositioning when label widths change).

**4. Updated component stub.**
Document the Thai typography choice in the component stub: font family, weights, size scale validation at 12/14/16/18/24/32. Keep the existing color tokens, motion specs, and component behaviors — they aren't changing.

**5. (Optional) Onboarding tone.**
Privacy notice (PRD §7) and consent copy on signup — Thai, plain-language, written for a sleep-deprived parent, not a lawyer. Length budget: ≤4 short sentences on the signup screen with a "Read full policy" link. Full policy text is a PM/CPO deliverable, not yours — focus on the signup-screen condensation.

---

## Part B — Dev's five clarifications (open since June 1)

Dev built Phase 2 against the Phase 1 design. Where the design was silent or ambiguous on instant-log Eat (vs the timer-led Sleep example you'd designed), Dev made a working call and flagged it. Please confirm or correct each so Phase 3 doesn't drift.

1. **Concurrency prompt copy for instant-log Eat.** Your Phase 1 demo was timer-framed (Sleep). Dev adapted with "X logged a feed Ns ago — view theirs / log another." Confirm or rewrite (and now: in Thai).
2. **"Synced" pill persistence.** Dev flashes it ~2.2s after a queued row syncs, then hides. Confirm duration or specify (always-on after sync? fade after N seconds? on-hover reveal?).
3. **First-run Home empty state.** Dev used the normal Eat card with a "No feeds yet — tap to log" hint instead of the dashed-ghost `EmptyHome` you'd drawn. Confirm which Phase 3 should use.
4. **Eat "When" time-edit affordance.** Your design shows an Edit affordance on the timestamp; Dev defaulted to "now" and deferred time-editing. Confirm: in v1, can users back-date an Eat entry, or is "now" always the time?
5. **Online/Offline chip in Home header.** This is a QA/demo affordance Dev added; not in your design. Decide: keep as a permanent user-facing chip (formalize it in the system), keep as a dev-only debug toggle, or remove entirely for production.

---

## Constraints (carry-over from Handoff #01)

- Mobile web first (360–430px primary canvas). Light + dark both first-class.
- WCAG 2.1 AA. Tap targets ≥48×48px.
- Two-second log loop preserved.
- Activity attribution stays quiet/secondary.
- Don't redo what already works — preserve the v0.2 visual system; only swap typography and translate copy.

## Success criteria for this stage

Designer's work is "accepted" when:
1. Dev can pull `locales/th.json` from your microcopy sheet and have the app render in correct, natural Thai across all states.
2. The four hi-fi screens look right in Thai, both modes, at 360px.
3. The five clarifications are answered, in Thai, with the same precision as your original behavior specs.
4. PM/CPO read the Thai copy and feel "this feels like a Thai product, not a translation."

## When you're done

Write `## YYYY-MM-DD — Designer — Localization rework complete` in `JOURNAL.md`. Include:
- File paths to the Thai microcopy sheet, updated hi-fi screens, updated component stub.
- The five clarifications resolved.
- Any PRD/scope notes for PM.
- `Handoff → PM (Claude)` so PM can review and route to Dev for the i18n wiring + Phase 3.

---

## Notes you can act on yourself

- If a piece of English copy from v0.2 should genuinely be a different idea in Thai (not a translation), change the idea. Note it so PM doesn't re-litigate.
- If Thai script forces a layout change at 360px (e.g. heading must wrap), make the change. Document in the component stub.
- If you want to propose BE calendar display on growth chart axes (PRD §11.4), do — write it as a tweak so we can A/B it before committing.

## Notes for CPO

- Q1 (monetization) still open. Doesn't block this work.
- The Phase 2 staging URL (`minom-production.up.railway.app`) currently runs in demo mode. Provisioning Supabase to fully close Phase 2 is a separate baton — PM will handle once design rework is in flight.
