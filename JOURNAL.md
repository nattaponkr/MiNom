# ละมุน (Lamoon) — Project Journal

> **App name:** ละมุน (Lamoon, *lah-MOON*) — chosen 2026-06-01. Project/folder/repo name MiNom unchanged internally.

> **Single source of truth.** All decisions, completions, and handoff notes live here.
> Newest entries on top. Format: `## YYYY-MM-DD — [Role] — Topic`.

**Team**
- CPO: Nattapon
- PM: Claude (this thread)
- Designer: Claude Design (separate workstream)
- Developer / QA: Claude Code (separate workstream)

**Workflow**
- Single work stream at a time.
- Every handoff ends with a `Handoff →` line naming the next owner and what they need.
- Decisions are logged with rationale so context survives the handoff.

---

## 2026-06-03 — Dev — Invited on-ramp VERIFIED LIVE (4/4 on production); beta can open invite-only → Handoff → PM

After CPO set the **correct** `service_role` key (first attempt was the anon key — diagnosed via a temporary keyKind probe, since removed) and ran migration **0005**, the caregiver invite path is **verified end-to-end on production**:

- ✅ Owner (pre-confirmed account) creates an invite → copyable link + email.
- ✅ Invite landing renders (inviter + baby), email **locked** to the invited address.
- ✅ **Auto-confirm: a brand-new user signs up via the link → lands signed-in on the shared baby with NO confirmation email** (criterion #3). Server admin-creates the account (service-role), links, marks accepted.
- ✅ **Cross-device realtime owner→invited in ~1.2s** (criterion #4, <5s).

This is the **beta on-ramp** and it's GO — fully independent of the Auth SMTP, so the self-serve SMTP issue below does not block an invite-only beta.

**Still open (CPO; only needed for self-serve, not invite-only beta):**
- 🔴 Self-serve signup still returns "Error sending confirmation email" — Supabase Auth SMTP (Resend) misconfig; fix in the Supabase dashboard (Auth → SMTP / verified sender). The "เช็คอีเมลของคุณ" screen handles the state once it sends.
- Human-only dry-run steps: eyeball the real invite/confirmation email Thai content, watch PostHog Live events across the loop, real-cellular two-device pass. (App behaviors verified; email content + analytics dashboard are CPO's to confirm.)

**Net:** Dev side of #04 complete; the invite-only beta path is live-verified. New Thai keys (below) await Designer review.

**Handoff → PM (Claude):** open beta **invite-only** now — invited on-ramp proven on production. Self-serve waits on the CPO SMTP fix (separate, non-blocking). CPO to sign off PostHog live events + email content.

---

## 2026-06-03 — Dev — Phase 3.5 #04 code complete; dry-run found a self-serve-email P0 (code-side handled; CPO config + keys to close) → Handoff → PM

**Work item 1 — done (code), verified in demo + build.**
- **"เช็คอีเมลของคุณ" screen** for self-serve signup: with confirmations ON, `signUp` returns no session → AuthScreen now shows a Thai check-inbox screen with resend, instead of silently bouncing to the form (which is what the *old* live build did — a real bug).
- **Auto-confirm-on-invite, reworked to the correct design:** `/api/invite/confirm` (service-role, server-only, rate-limited) **admin-creates** the invited account with `email_confirm: true` — so it sends **no** confirmation email at all (criterion #3) and is **independent of the Auth SMTP**. Then it links the user + marks the invite accepted (single-use); the client signs in. Invite landing shows inviter+baby, email locked to the invited address. `invite_preview` RPC (migration **0005**) backs the landing page. (Also fixed a real bug: an inner `Shell` component was remounting the form on every keystroke.)

**Live dry-run — NOT 7/7; it caught a P0.**
- 🔴 **P0 (config, not code): self-serve signup fails live** — `signUp` returns **"Error sending confirmation email."** Supabase Auth's custom SMTP (Resend) isn't actually sending. Blocks criteria #1 and self-serve onboarding. **Code side is handled** (check-inbox screen renders the state gracefully; invited path is now SMTP-independent), but the **send itself is a CPO infra fix**: Supabase → Authentication → Emails/SMTP — re-check the Resend SMTP host/port/user/pass + verified sender. I can't fix dashboard SMTP.
- ✅ **#6 Privacy** — full 12-section policy renders with §1 (Nattapon Kraisingkorn) filled; internal note + placeholders do not leak (verified locally; live after redeploy).
- ⏳ **#2/#3 invite email + invited auto-confirm**, **#4 PostHog events live**, **#5/#7 cross-device + offline on real cellular** — all need CPO execution (real inboxes A/B, PostHog Live view, two devices) and the keys below. Invited auto-confirm also needs the **service-role key** set.
- Verified by me (automated): demo invited signup → linked → shared baby; 35/35 headless Thai QA; tsc + build green.

**CPO dependencies to close the dry-run (PM to route)**
1. 🔴 **Fix Supabase Auth SMTP** so confirmation emails send (unblocks self-serve). Test: sign up on the live form → email should arrive.
2. **Set `SUPABASE_SERVICE_ROLE_KEY`** in Railway (Supabase → Settings → API → service_role) — required for invited auto-confirm (the no-second-email beta on-ramp). Server-only; never NEXT_PUBLIC.
3. **Run migration `web/supabase/migrations/0005_invite_preview.sql`** (0004 already run).
4. Then run the full `HANDOFF_dev_04` §2 dry-run with two real inboxes + PostHog Live; bookmark the PostHog project dashboard (eu.posthog.com → MiNom beta) for PM.

> Note: for an **invite-only beta**, the invited on-ramp (server admin-create, no email) sidesteps the SMTP P0 entirely — set the service-role key (#2) and invited families work even before SMTP is fixed. Self-serve signup still needs #1.

**New Thai keys for Designer review (Phase-3.5 process note):**
`auth.signup.checkInbox.title/body/resend/resent/inviteFallback`, `auth.invite.signup.title/sub/cta`, `auth.invite.haveAccount`, `care.error.notReady`.

**Handoff → PM (Claude)**
- Code for both work items is shipped + locally verified. To declare the dry-run 7/7 and open beta, the **CPO checklist above** must land (fix SMTP, set service-role key, run 0005). I'll re-run the automatable live checks the moment the service-role key is set, and support CPO through the inbox/PostHog steps.
- Recommend beta opens on the **invited on-ramp first** (SMTP-independent) while self-serve SMTP is sorted.
- CPO: please route to PM.

---

## 2026-06-03 — PM — LINE setup fully closed (Premium ID `@lamoonapp` claimed; OA published)

**What happened**
- CPO closed all 4 LINE pending items in one pass:
  1. ✅ Greeting self-test — greeting fires correctly.
  2. ✅ Custom Thai auto-reply written (CPO edited PM's draft to remove the support-email line — keeps it shorter, less commitment).
  3. ✅ **Premium ID claimed: `@lamoonapp`** (`@lamoon` presumably taken). Nice incidental alignment with `lamoon.app` if/when we register the domain.
  4. ✅ OA published / searchable.

**Implications**
- The OA is now a real, searchable surface. Anyone who searches `@lamoonapp` in LINE can follow → greeting fires → tagline + web URL in front of them.
- The `@lamoonapp` handle becomes the canonical LINE identity. Any future copy that references the OA should use `@lamoonapp` (not the random auto-generated handle, which is now retired).
- Phase 5 carries forward: rich menu, LINE Login channel, LIFF/Mini App, webhook + bot, broadcast templates, OA verification (the green shield, requires business registration).

**Files updated**
- `LINE_BACKLOG.md` — recorded `@lamoonapp`, Public/Searchable status, and the auto-reply edit.

**Status of overall workstream**
- All defensive LINE prep is done. CPO has been productive for two sessions while Dev's baton runs.
- Active baton remains Dev (`HANDOFF_dev_04.md`) — auto-confirm-on-invite + 7-scenario dry-run.
- Next concrete move on this project: **Dev → PM** with dry-run results. Then beta invites.

---

## 2026-06-03 — PM — Designer LINE OA assets accepted; routing upload to CPO

**What happened**
- Designer shipped the LINE OA asset pack per `HANDOFF_designer_04.md`. Three files in `design/line_oa/` — two for upload, one for reference.
- Reviewed `preview_in_context.png`: profile glyph holds at 56px chat-list size, cover composition sits cleanly in the safe area with the watermark bleeding lower-right as intended. Accepting as delivered.

**Decisions Designer owned (logged, no PM override)**
- Monogram (not full wordmark) on the profile photo — the word blurs at 56px.
- Cover motif: single faint watermark + soft blobs. No illustrations, no people, no emoji.
- Exact-token colors: clay `#cb7b52`, cream `#fefbf7`. Anuphan Medium 500. One face throughout.

**For CPO — upload (~5 min)**
- Two upload notes from Designer:
  - Keep as PNG. JPG re-encoding introduces banding on the cream-on-clay surface.
  - Don't recenter the cover watermark — the lower-right bleed is intentional.
- Upload steps in chat below.

**Carry-overs to Phase 5 (unchanged)**
Rich menu, LINE Login artwork, LIFF assets, broadcast templates, Premium ID claim.

**Status**
- Dev baton (`HANDOFF_dev_04.md`) remains active — auto-confirm + dry-run, no impact.
- Designer's small ask is closed. Designer free.

---

## 2026-06-03 — Designer — LINE OA assets shipped

**What happened**
Shipped the two LINE OA images per `HANDOFF_designer_04.md`, plus a context proof.

**Delivered (in `design/line_oa/`)**
- `oa_profile.png` (640×640) — ล monogram in cream on warm clay with the soft top-left light. Holds as a clean single mark down to 56px chat-list size.
- `oa_cover.png` (1080×878) — wordmark ละมุน + tagline "ดูแลลูกอย่างละมุนละไม". Single faint ล watermark bleeding off lower-right as the only motif. Centered in safe area.
- `preview_in_context.png` — circular-crop checks at LINE sizes + cover safe-area verification. Reference proof, not for upload.

**Decisions I owned**
- Monogram on the avatar (not full wordmark) — the word blurs at 56px chat-list size.
- Cover motif: single faint watermark + soft blobs. No illustrations, no people, no emoji.
- Exact-token colors only: clay `#cb7b52`, cream `#fefbf7`. Anuphan Medium 500. One face throughout.

**Notes for CPO before upload**
- Keep them as PNG — JPG compression introduces banding on the cream-on-clay surface.
- Don't recenter the cover watermark — it's meant to bleed off lower-right.

**Out of scope (Phase 5 backlog)**
Rich menu, LINE Login artwork, LIFF assets, broadcast templates, Premium ID claim.

**Handoff → PM (Claude)**
Files in `design/line_oa/`. Nothing blocked on Dev. PM routes the upload to CPO.

---

## 2026-06-02 — PM — Routing small Designer ask: LINE OA profile assets

**What happened**
- CPO promoted the LINE asset asks from `LINE_BACKLOG.md` ("queued for next Designer baton") to a proper handoff so they don't sit in the backlog.
- Wrote `HANDOFF_designer_04.md` — small, focused: two PNG files (profile photo `oa_profile.png` 640×640, cover photo `oa_cover.png` 1080×878) for the ละมุน Official Account, delivered to `design/line_oa/`.

**Why this isn't a workstream violation**
- Dev's baton (`HANDOFF_dev_04.md`) is the active product workstream — auto-confirm + dry-run.
- This Designer ask is a discrete asset pack, not a phase. Designer can run it in parallel without competing with Dev's product work. Like requesting a logo PNG, not initiating a design phase.
- If a real conflict surfaces (Designer's brand decision affects something Dev's mid-implementing), PM intervenes.

**Scope deliberately tight**
- Only the two LINE OA images. Rich menu icons, LIFF assets, broadcast templates, Premium ID claim → all saved for Phase 5 when the LINE product surface is being designed for real.

**Handoff → Designer (Claude Design)**
- Brief: `HANDOFF_designer_04.md`. References `design/brand.jsx`, `brand.css`, PRD v0.3 §0.
- Brand voice rule still applies (no babies-as-cartoon, no off-brand emoji, restraint over fullness).
- When done: write a journal entry with file paths; `Handoff → PM`; PM tells CPO to upload via OA Manager (~5 min of clicks).

CPO: please route `HANDOFF_designer_04.md` to Claude Design.

---

## 2026-06-02 — PM — LINE account scaffolding done (Phase 5 prep)

**What happened**
- While Dev's baton is in flight (`HANDOFF_dev_04.md`), CPO and PM walked through LINE account setup as defensive brand + Phase 5 prep.
- 4 steps completed end-to-end: LINE Business ID → Official Account `ละมุน` (with Thai greeting + bio) → response settings → Developers provider + Messaging API channel.
- **One LINE flow correction logged:** Messaging API channels can no longer be created directly from Developers Console (LINE changed it). Correct path is OA Manager → Settings → Messaging API → Enable → channel auto-creates in Developers Console. Worth remembering for any future LINE onboarding.

**Foundation now in place**
- Official Account `ละมุน` (privately unpublished; auto-generated free `@handle` saved by CPO; Premium ID deferred).
- Developers provider + Messaging API channel, linked to the OA.
- Three credentials saved by CPO (treated as secrets): `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`. Ready to drop into Railway env vars when Phase 5 starts.
- Auto-reply currently **on** with LINE's stock default (CPO's call — fine while there are no users). Phase 5 replaces with proper bot logic and switches webhook on.

**Designer asset asks queued**
- Added to `LINE_BACKLOG.md` → "Designer asset asks": OA profile photo (640×640 PNG of the `ล` mark) + cover photo (1080×878 with wordmark + tagline). Pull-based — Designer picks up on next baton; not a formal handoff.

**Status of overall workstream**
- Dev baton (`HANDOFF_dev_04.md`) is still queued: auto-confirm-on-invite + 7-scenario live dry-run.
- PM has now landed all sensible pre-beta and pre-Phase-5 prep work that doesn't require Dev. Next concrete move is on Dev → PM, then beta opens.

---

## 2026-06-02 — PM — Phase 5 queued: ละมุน on LINE

**What happened**
- Support email pivot committed + pushed by CPO. Privacy page + feedback button now route to `nattaponkraisingkorn@gmail.com`; will go live on next Railway redeploy (~2 min).
- **CPO direction shift:** instead of creating a LINE OpenChat for the beta community (the original task #3), CPO proposed **bringing ละมุน itself into LINE as a primary interface.** This is a meaningful product surface change, not a small enhancement.
- CPO explicitly queued the work: "Wait after dev complete this phase and we will move to this LINE ticket next."

**Strategic note**
- Thailand is a LINE-first market (~50M+ MAU). Multi-generational adoption (grandmas, nannies) is one of our biggest activation risks — they already live in LINE and won't install another app. Putting ละมุน inside LINE removes that barrier.
- This affects identity (LINE Login), invites (LINE share), notifications, and possibly the primary UI surface. Treated as a Phase 5 candidate, not a Phase 4 enhancement.

**Decisions made by PM (flag to override)**
1. **Phase 4 (web beta) still proceeds as planned.** Don't pause/cancel. The web beta gives us product-loop signal that informs the LINE design. Sunk cost is small relative to learning value.
2. **The original "create beta LINE OpenChat" task is replaced.** Community/support during web beta will happen via LINE 1:1 chats with the cohort + the in-app feedback button, not a group chat. If CPO wants a group chat later, easy to add.
3. **LINE work begins after current Dev baton (`HANDOFF_dev_04.md`) closes.** Sequence preserved; no parallel workstreams.

**Files produced this turn**
- `LINE_BACKLOG.md` — initial framing for the Phase 5 ticket: surface options (LIFF / Mini App / Bot / hybrid), 6 open questions for CPO to mull on, sequencing notes, follow-ups.
- `PLAN.md` updated: cleaned a duplicate Phase 4 entry, added Phase 5 placeholder, added BETA_RECRUITMENT.md and LINE_BACKLOG.md to file map.

**Open questions for CPO** (no rush — these inform the Phase 5 PRD when we start it)
- Does the web app survive after LINE launches (fallback) or get sunset?
- LINE Login only, or LINE-Login-OR-email?
- Family invites via LINE share or keep email path?
- Notifications via LINE messages?
- Should we pre-claim the LINE Official Account name "ละมุน" now (separate from technical integration)?

**No handoff this turn** — workstream stays with PM (waiting on Dev's `HANDOFF_dev_04.md` return). Dev's baton is unchanged.

---

## 2026-06-02 — PM — Pre-beta CPO tasks: §12 sign-offs locked, recruitment tracker shipped, LINE group plan, support email pivoted

**What happened**
- Walked CPO through all 4 parallel-safe pre-beta tasks (sign-offs, recruitment, LINE group, support email).

**Locked decisions**
1. `BETA_PLAN.md` §12 — all 5 items now ✅ locked: lifetime-free beta cohort, PostHog as analytics, Resend pulled forward to Phase 3.5, cohort target 15–20 (recruit ~25), Q1 monetization = free in v1.
2. **Support email pivoted to `nattaponkraisingkorn@gmail.com` for the beta window.** `support@lamoon.app` was on every user-facing surface (privacy policy, feedback button, invite email, privacy page contact line) but the lamoon.app domain isn't registered yet — dead address would have bounced. CPO chose to use personal Gmail "for now" rather than register the domain this session.
3. **`lamoon.app` domain registration** stays on the PM TODO list — to be done before public launch (or sooner if CPO wants). When done, swap-back is a simple find-and-replace across the same 5 files.

**Files updated this turn**
- `BETA_PLAN.md` §12 — 3 remaining sign-offs locked.
- `PRIVACY_TH.md` + `web/content/privacy_th.md` — email pivoted (6 references each).
- `web/components/SettingsScreen.tsx` — feedback button mailto pivoted.
- `web/app/privacy/page.tsx` — privacy page contact line pivoted.
- `BETA_COMMS.md` — invite email template + week-6 interview frame pivoted.
- New: `BETA_RECRUITMENT.md` — 25-row tracker template + coverage check + workflow notes.

**Internal docs** (`JOURNAL`, `PLAN`, `HANDOFF_dev_*`, `CPO_PROVISIONING_CHECKLIST`) still reference `support@lamoon.app` as historically accurate descriptions of the long-term plan. Not changed; revisit at domain registration.

**Still on CPO** (today/this week, parallel-safe):
- Commit + push the 5-file pivot via Terminal (instructions delivered in chat).
- Create the private LINE OpenChat per the walkthrough; save the invite link.
- Start filling `BETA_RECRUITMENT.md` — aim 25 warm intros over the next week or two, watching the coverage table at the top.

**Note on signature style for outbound**
- `BETA_COMMS.md` and the Supabase email templates currently sign as **"ทีมละมุน"** (generic). CPO can switch to named at any time; not blocking.

**Status of overall workstream**
- Dev baton (`HANDOFF_dev_04.md`) is still queued: auto-confirm-on-invite + 7-scenario live dry-run. PM is now free to start finalizing beta comms timing and bookmarking the PostHog dashboard once Dev finishes.

---

## 2026-06-02 — PM — CPO provisioning complete; routing to Dev for auto-confirm + dry-run

**What happened**
- Walked CPO through the 6-step `CPO_PROVISIONING_CHECKLIST.md` interactively over chat. All 6 steps done: migration 0004 ran, Resend account + API key set up, Supabase custom SMTP wired to Resend with Thai-language email templates (confirmation, password reset, change email), PostHog EU project + key, all 6 env vars in Railway with redeploy, Privacy §1 entity info filled in.
- **CPO override mid-flight (worth noting): "Let's do a proper signup / invitation system, not just for beta users."** Original plan was to turn email confirmations OFF as a beta shortcut. Instead we kept confirmations ON and pulled forward the "wire Resend as Supabase's SMTP + Thai email templates" work that was originally queued for pre-public. Net effect: no rework before public launch.

**Decisions logged from this turn**
1. **Email confirmations stay ON** for both beta and public. (Was: off for beta.)
2. **Supabase custom SMTP via Resend** is live, sending in Thai for confirmation, password reset, change email. (Was: pre-public task.)
3. **Latin sender "ละมุน"** in all outbound; signature style across email + LINE = generic **"ทีมละมุน"** — CPO can switch to named later if preferred (re-flagged for sign-off).
4. **Auto-confirm-on-invite** must be added so invited users don't deal with two emails (the invite + a Supabase confirmation). The invite token proves they own the email; we can skip confirmation safely for that path. Small Dev addition; queued in Handoff #04.

**Files produced this turn**
- `HANDOFF_dev_04.md` — auto-confirm-on-invite implementation + signup UX + full live beta dry-run protocol (7-scenario, 7-pass-criteria).
- Updated PLAN + this entry.

**Routing to Dev (next baton): `HANDOFF_dev_04.md`**
Two work items:
1. **Auto-confirm-on-invite** — server endpoint that admin-confirms a user when they sign up via a valid invite token. Anti-abuse: email field is pre-filled and locked to the invite address. Plus the "check your inbox" screen for self-serve signups (new Thai keys to flag for Designer review per Phase-3.5 process note).
2. **Live beta dry-run** — full 7-scenario protocol covering real-email signup + invite + cross-device + offline + privacy + feedback, all against real Resend + PostHog + Supabase. Must pass 7/7 before beta invites go out.

**Carry-overs for CPO (parallel-safe; don't block Dev)**
- Sign-offs on `BETA_PLAN.md` §12 (3 items left): lifetime-free for beta cohort, cohort target 15–20, Q1 monetization.
- Recruitment list (~25 households) per `BETA_COMMS.md` §1.
- Create the beta LINE OpenChat (private; PM + CPO co-admin).
- Confirm `support@lamoon.app` forwards to CPO inbox.

CPO: please route `HANDOFF_dev_04.md` to Claude Code. Dev runs the dry-run; on clean pass, baton returns to PM and we open beta.

---

## 2026-06-02 — PM — Phase 3.5 engineering accepted; CPO checklist + beta comms drafted

**What happened**
- Reviewed Dev's Phase 3.5 close-out. Five items shipped, 5/7 success criteria verified by construction (Thai copy patch + Sleep concurrency + Privacy page + Feedback button + Invite seeded test). The remaining 2 (live PostHog dashboard, real email over network) are gated on CPO secrets — they'll be confirmed in the live dry-run, not in code review.
- **Phase 3.5 engineering accepted.** Operationally pending the CPO provisioning checklist below.

**This PM turn (no code work — prep for beta open)**
Produced two deliverables so that the moment provisioning lands, we open beta with no further drafting needed.

**1. `CPO_PROVISIONING_CHECKLIST.md` — single actionable doc for CPO**
Six steps, ~45–60 min total, ordered with dependencies:
1. Run `web/supabase/migrations/0004_invites.sql` in Supabase SQL editor.
2. Turn email confirmations OFF in Supabase Auth.
3. Create Resend account; generate `RESEND_API_KEY` (recommend onboarding domain for beta; domain verification deferred to pre-public).
4. Create PostHog **EU** project; capture `NEXT_PUBLIC_POSTHOG_KEY` + host.
5. Set four env vars in Railway (`RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`) + trigger redeploy (we know `NEXT_PUBLIC_*` only bakes in on fresh build, per Phase 3 deploy notes).
6. Fill in `PRIVACY_TH.md` §1 entity placeholders (unlocks the full policy page).

Each step has a "verify done" check and a "if it fails" fallback so CPO doesn't get stuck.

**2. `BETA_COMMS.md` — finalizes BETA_PLAN §6 + §11**
All in Thai, all passing the brand voice filter (`ละมุน` feeling — warm, plain, not transactional, no internal jargon):
- Recruitment warm-intro template (CPO uses for the ~25 warm intros).
- Beta invite email (the one Resend actually sends).
- LINE OpenChat welcome (when each household joins).
- Weekly survey (5 questions; the Sean Ellis PMF question first).
- Week 2 interview guide (first-week friction; invite-flow probe).
- Week 6 interview guide ("would you miss it?" — the success criterion).
- Monday weekly digest template.
- End-of-beta message (two variants: public launch / fix cycle).
- Beta agreement (short, symmetric "ของเรา / ของคุณ").
- Operating cadence summary (daily/weekly/per-household).

**Decisions made by PM this turn**
- **Recruitment list size: 25 to land 15–20 active.** Don't overcrowd.
- **Resend onboarding domain for beta** — cleanest path to a live invite email today; migrate to `noreply@lamoon.app` once the domain is registered (separate PM TODO).
- **PostHog EU host** by default — PDPA-friendly, and if EU latency is a complaint we swap to self-host (not US — never US host for TH user data without a real reason).
- **Privacy §1 unlock = single source of truth** (`PRIVACY_TH.md` itself, not an env var). Simpler for CPO to edit; one place to look. Confirmed Dev's "sync to `content/privacy_th.md` at build time" pattern is fine.
- **"ของเรา / ของคุณ" framing in the beta agreement** rather than "terms" / "obligations" — symmetric, sets the tone.

**Carry-overs still on PM's list (not blocking provisioning)**
- Domain `lamoon.app` (or `.co` / `.in.th`) — research availability, recommend, secure. Doesn't block beta; needed before public launch.
- Legal review of `PRIVACY_TH.md` — needed before public launch, not beta.
- Hard-delete edge function — build when first user actually requests deletion.

**Handoff → CPO (Nattapon)**
This baton is unusual — going to CPO directly rather than Designer/Dev. Brief: `CPO_PROVISIONING_CHECKLIST.md`. Six steps, sequenced, ~45–60 min.

In parallel:
- Sign off on `BETA_PLAN.md` §12 (5 items — recommendations attached).
- Build the recruitment list per `BETA_COMMS.md` §1 (CPO's network).
- Confirm: signature style on outbound — generic "ทีมละมุน" or named "จาก [your name]"? (Question in BETA_COMMS.md §11.)
- Create the beta LINE OpenChat (private; PM + CPO co-admin).
- Get `support@lamoon.app` forwarding to your inbox.

When you message "provisioning done," the next baton goes to **Dev** (Claude Code) for the live beta dry-run — invite a fresh email → sign up via the link → verify shared baby + PostHog events firing + real invite email arriving. On a clean dry-run, PM opens beta invites per `BETA_COMMS.md`.

---

## 2026-06-02 — Dev — Pre-beta enablement complete (Phase 3.5) → Handoff → PM

All five items from `HANDOFF_dev_03.md` are built, on `main`, and verified to the extent possible without CPO secrets. Migration to run: **`0004_invites.sql`** (0001–0003 already live).

**Shipped (commits on `main`)**
1. **Thai copy patch** — applied all `TH_PATCH` keys; killed 3 internal-jargon leaks (เฟส 3 / ทีม PM / eng-narrative); softened error copy; removed `phase3.soon`.
2. **Sleep-timer concurrency** (option A) — peer timer within 60s → non-blocking sheet, default "open the running timer" (seeds the sheet with the peer's activity), alt "start new". `concurrency.sleep.*`.
3. **Caregiver invites by email** (beta blocker) — `caregiver_invites` + RLS + RPCs (create/accept/revoke, owner-check, 10-cap, 14-day expiry); `/api/invite` Resend sender (Thai template) that degrades to a copyable link without a key; `/invite/[token]` accept page (signup/signin → auto-link); Caregivers UI shows pending invites + revoke.
4. **PostHog analytics** — privacy-first wrapper (UUID-only identify, no autocapture, masked inputs, EU host), no-ops without a key. All **12 BETA_PLAN §5 events** wired, no PII.
5. **Privacy page + feedback** — `/privacy` parses `content/privacy_th.md` (single source, synced from root `PRIVACY_TH.md`) → summary card + sticky TOC + sections via react-markdown; strips the internal note; **blocks the full policy while §1 entity placeholders are unfilled**. Feedback row in Settings → mailto with user/route context (no content captured).

**Verification vs the 7 success criteria**
1. ✅ TH_PATCH applied, no `phase3.soon`, **35/35 headless Thai QA** green.
2. ✅ Sleep concurrency soft-prompt wired (mirrors the verified Eat pattern; a real 2-caregiver collision is exercised live once the cohort exists).
3. ⏳ Invite→signup-via-link→accept→**shared baby verified** (seeded headless run links the new user and lands them on the owner's baby). The literal "**real email to a fresh address over the network**" needs `RESEND_API_KEY` + email-confirmations-off — **CPO deps**.
4. ⏳ 12 events wired, no PII (verified by construction; `track()` no-ops without a key). Live dashboard needs `NEXT_PUBLIC_POSTHOG_KEY` — **CPO dep**.
5. ✅ `/privacy` renders summary+TOC+sections; internal note and §1 placeholders do **not** leak; full sections unlock once §1 is filled.
6. ✅ Feedback button opens a mail draft to support@lamoon.app.
7. ⏳ Full beta dry-run on staging — gated on the CPO items below.

**Decisions I own (logged)**
- Invites route **all** new emails through the token+link flow (existing-user instant-link kept in the repo but unused by the UI) — one model, works for a grandma/nanny without an account.
- `caregiver_invited` channel logged as `email-new`; `activity_edited` mapped to **sleep-stop** (the only edit surface); `sync_failed` fires only on a failure while believed-online (not on normal offline).

**CPO dependencies (PM to route; none are code)**
- **Run `web/supabase/migrations/0004_invites.sql`** in the Supabase SQL editor.
- **Email confirmations OFF** for the beta window (self-serve signup); until then dashboard-pre-confirm works.
- **Resend**: account + verified sender (or onboarding domain for beta) → set `RESEND_API_KEY` (+ optional `RESEND_FROM`) in Railway; also set **`NEXT_PUBLIC_APP_URL`** = staging URL so invite links resolve.
- **PostHog**: EU project → `NEXT_PUBLIC_POSTHOG_KEY` (+ `NEXT_PUBLIC_POSTHOG_HOST`) in Railway.
- **Privacy §1**: legal entity name + address → unlocks the full policy page.

**Deferred (logged, not beta blockers):** account hard-delete edge function; WHO LMS reference data; re-enable email confirmation before *public* launch; EN locale; push; LINE login.

**Handoff → PM (Claude)**
- Pre-beta engineering is done; flipping the beta live now hinges on the **CPO provisioning checklist above** (run 0004, confirmations-off, Resend + PostHog keys + `APP_URL`, privacy §1). Once those land I'll run the live beta dry-run (criteria #3/#4/#7) and post results.
- Suggest PM finalize the cohort + comms (`BETA_PLAN` §6/§11) in parallel.
- CPO: please route to PM.

---

## 2026-06-02 — PM — Designer polish accepted; routing to Dev for beta enablement

**What happened**
- Designer returned a focused pre-beta copy polish (no canonical journal entry from Designer this round — recording the result here so the audit trail stays clean). Deliverables in `design/`: `th-strings-patch.js` (the diff), `section_polish.jsx` (rendered diff + Sleep concurrency mock + privacy layout mock), updated `MiNom Design — Thai Localization.html`, `thai.css`, `thai_app.jsx`.
- Reviewed the diff + both mocks. Quality is high — and **caught three real bugs that would have shipped to beta**, not just polish:
  1. `comingSoon.title` had "เฟส 3" (internal phase name) leaking to users.
  2. `comingSoon.body` told an engineering narrative ("sync proven first, then copy the pattern") to parents.
  3. `privacy.body` referenced "ทีม PM" (internal role) in user copy.
- Plus voice improvements on errors (softer cadence with "นะ"; offering the next step instead of dead-ending), Settings clarity (`settings.baby` → "ข้อมูลลูก"), and complete SR sentences for a11y.

**Decisions accepted**
1. **Sleep-timer concurrency = A.** Designer added `concurrency.sleep.{title,body,view,logAnyway}` mirroring the Eat pattern. Primary action = open the running timer (safest default; no duplicate timers). Confirmed.
2. **Privacy page layout = approved.** Summary card at top, sticky TOC for the 12 sections, plain-Thai section bodies. Mocked in `section_polish.jsx` → `PrivacyLayoutMock`. Confirmed.
3. **All `TH_PATCH` keys accepted, `phase3.soon` removed.**

**Reflection (worth logging)**
- The three "internal jargon leak" bugs got past Phase 3 QA because Dev wrote the strings to avoid English leaks, not against the voice filter. The filter only existed *for* Designer-written copy. Going forward: any Dev-written user-facing string passes through Designer voice review before merge — bake it into the next cycle's definition-of-done. Not pointing fingers; it's a process gap, fix it once.

**Routing to Dev (next baton): `HANDOFF_dev_03.md`**
Five work items, in order:
1. **Merge the copy patch** (small) — apply `TH_PATCH`, remove `phase3.soon`, regression QA in Thai.
2. **Wire Sleep concurrency** (small) — mirror the Eat soft-prompt with the new keys.
3. **Invite tokens + email for new-user caregivers** ⚠️ **beta blocker** — `caregiver_invites` table, owner invite flow, email send (Resend wired), token-based signup/auto-link, 14-day expiration, owner revoke.
4. **PostHog analytics** ⚠️ **beta blocker** — all 12 events from `BETA_PLAN.md` §5, EU region, no PII in payloads, masked autocapture.
5. **Privacy page + in-app feedback** (medium) — wire full `PRIVACY_TH.md` into `/privacy` per Designer's layout; "ส่งฟีดแบ็ค" row in Settings opens a mailto draft.

**Deferred (recorded for the future)**
- Hard-delete edge function — build when first user actually requests.
- WHO LMS data — chart captioned as estimates during beta; data work before public.
- Re-enabling Supabase email confirmations — do before public launch, not before beta.

**Process note for Dev**
- The "definition of done" for Phase 3.5 includes a Thai-copy review by Designer for any new user-facing string (lesson from the polish bugs above). Any new keys you add to `th.json` during this phase should be flagged in your close-out entry so Designer can vet before they ship.

**CPO-side asks (parallel-safe, won't block Dev from starting)**
- `BETA_PLAN.md` §12 sign-offs (5 items) — still pending.
- `PRIVACY_TH.md` §1: legal entity name + address.
- Supabase: flip email confirmations **OFF** (small dashboard toggle).
- **Resend account** + domain verification for `noreply@lamoon.app` (or use Resend's onboarding domain temporarily and migrate once `lamoon.app` is registered).
- **PostHog account** + project key.
- Start informal beta recruitment from your network.

CPO: please route `HANDOFF_dev_03.md` to Claude Code.

---

## 2026-06-02 — PM — Phase 3 accepted; opening Phase 4 (Beta); routing to Designer

**What happened**
- Reviewed Dev's Phase 3 close-out: 8/8 live verification on real Supabase; 0.6s cross-device realtime (target <5s); RLS isolation proven across two real accounts. Full new-parent loop works in Thai end-to-end on staging.
- **Phase 3 accepted.** Closes Phase 2's long-standing two-device + RLS carry-over and PRD-v0.3 in Thai is now a real, live thing.

**Calls I made on Dev's 5 follow-ups (flag to override)**
1. **Self-serve signup for beta** → **Turn email confirmations OFF in Supabase for the beta window.** PRD says enable confirmation before *public* launch; off-for-beta is consistent. Wire a real email sender (Resend recommended) as a separate task before public launch. Beta is invite-only; bot signups are not a real risk at this scale.
2. **Privacy policy full text** → drafted as `PRIVACY_TH.md`. Comprehensive PDPA-aligned Thai policy, flagged "draft pending legal review before public launch." CPO needs to fill in legal entity name + address (§1) and arrange Thai-lawyer review before going public; beta is OK with this draft.
3. **Designer routing** → next baton (see `HANDOFF_designer_03.md`). Small, focused: review Dev-added Thai keys + decide Sleep-concurrency copy.
4. **Phase-3.x backlog triage:**
   - **New-user caregiver email invites** → **blocks beta.** Many families will add grandma/nanny who don't have accounts yet. Sequenced into the next Dev handoff.
   - **Account hard-delete edge function** → **not blocking.** 30-day grace UI is enough; build when first user actually requests deletion.
   - **WHO LMS reference data** → **not blocking beta.** Caption the chart "ค่าประมาณการณ์ — รอข้อมูล WHO ฉบับเต็ม" during beta; do the data work before public.
5. **Phase 4 open** → wrote `BETA_PLAN.md`: cohort sizing (15–20 households), recruitment channels, pre-beta gates, PostHog instrumentation, feedback loops, the "go public?" criteria.

**Pre-beta gates (sequenced for Dev's next baton)**
- Merge Designer's Thai-copy patch (after Designer returns).
- Turn Supabase email confirmations OFF.
- Implement invite tokens + email for new-user caregiver invites. **(Blocker.)**
- Wire **PostHog** analytics for the success metrics (PRD §8).
- Wire full `PRIVACY_TH.md` into `/privacy`.
- Add in-app feedback button in Settings.

**Open questions for CPO**
- BETA_PLAN.md §12 has 5 sign-off items: (1) lifetime-free for beta cohort, (2) PostHog as analytics, (3) Resend deferred to pre-public, (4) cohort target 15–20, (5) Q1 monetization still open. PM recommendations attached; will proceed on those unless flagged.
- Legal: who's the registered entity for ละมุน? Needed in `PRIVACY_TH.md` §1 before any user sees it on the live site.

**Files produced this turn**
- `PRIVACY_TH.md` — Thai privacy policy draft (PDPA-aligned, ~12 sections + internal team notes).
- `BETA_PLAN.md` — Phase 4 plan (goals, cohort, gates, metrics, cadence, success criteria).
- `HANDOFF_designer_03.md` — small focused brief.
- PLAN.md updated.

**Handoff → Designer (Claude Design)**
- Brief: `HANDOFF_designer_03.md`. Short pass — Dev-added Thai key polish + Sleep-concurrency decision + optional privacy-page layout note.
- After Designer returns, PM writes `HANDOFF_dev_03.md` for the pre-beta enablement work above. Then beta opens.

CPO: please route to Claude Design. While that's in flight, **two parallel-safe asks**: (a) decide BETA_PLAN.md §12 sign-offs at your convenience, (b) tell PM the registered entity name + address for the privacy policy.

---

## 2026-06-02 — Dev — 2.8 VERIFIED on live Supabase → Phase 3 COMPLETE → Handoff → PM

**The last gate is closed.** Real Supabase backend is provisioned (CPO) and the literal two-device + RLS exit criteria now pass against it. **Phase 3 is done and live-verified.**

**Provisioning (CPO did this; recorded for the team)**
- Supabase project live, region **Singapore (ap-southeast-1)**; migrations `0001`–`0003` run; `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (new `sb_publishable_` key, works with our supabase-js 2.106) set in Railway. App is on the real backend at https://minom-production.up.railway.app

**Live verification — 8/8 (automated headless against production)**
- ✅ Real auth (sign-in) on the real backend.
- ✅ Real storage: baby + Eat persisted in Postgres; a fresh 2nd session sees them.
- ✅ **REALTIME: an Eat on device A appeared on device A2 in ~0.6s** (criterion: <5s).
- ✅ **RLS isolation**: account 2 cannot see account 1's baby (lands on setup, sees only its own); account 1 stays isolated from account 2. Data isolation enforced by the RLS policies in 0001.

This closes **Phase 2 exit criterion #4** (the long-standing carry-over) and the real-backend halves of **Phase 3 #4/#5**.

**Deploy gotchas hit + fixed (for the record)**
- Railway: app subdir → Root Directory `/web`; HIGH-CVE gate → Next 14→15; PORT 8080 → domain target 8080.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL` must be the **base host** (`https://<ref>.supabase.co`) — a copied `/rest/v1/` endpoint caused "Invalid path"; `NEXT_PUBLIC_*` only bakes in on a **fresh build**.
- Email confirmations are **ON** in this project; for the 2.8 test we used **pre-confirmed accounts** (dashboard-created, auto-confirm) and signed in. (Supabase rejects `@test.com` as an invalid email domain — used `@gmail.com`.)

**Small follow-ups (non-blocking; PM to schedule — none gate Phase 3)**
- **Self-serve signup for beta**: either turn email confirmations OFF (toggle relocated in this Supabase version — find together) or wire an email sender. Today's flow needs users pre-confirmed or confirmations off. PRD already says "enable confirmation before *public* launch", so off-for-beta is consistent.
- **New-user email invites** (Caregivers) → invite-token + email (Phase 3.x); existing-user invites work now.
- **Account hard-delete** → Supabase edge function (auth admin); UI + 30-day-grace messaging in place.
- **Privacy policy full legal text** (PM); **WHO LMS reference data** for exact growth curves (data task).

**Handoff → PM (Claude)**
- **Phase 3 is complete and verified live** — every dev ticket from `HANDOFF_dev_02.md` done in Thai on the real backend; the full new-parent loop works on staging (signup/sign-in → baby → log all three verbs incl. back-dated → growth → caregivers → timeline history → settings → PDPA), with cross-device realtime <5s and RLS isolation proven.
- **Recommend PM open Phase 4 (Beta & Launch)** per PLAN §3: recruit 10–20 households, instrument the success metrics, decide the email-confirmation-vs-sender call for self-serve signup, and line up the Phase-3.x follow-ups above.
- Please route the Thai-copy review (Dev-added keys) + the `concurrency.sleep` copy question to Designer, and own the privacy-policy text.
- CPO: please route to PM. Dev baton is free.

---

## 2026-06-02 — Dev — Phase 3 feature-complete (demo-verified); only live Supabase verification remains → Handoff → PM

**Summary:** Every Phase-3 dev ticket that doesn't require the live backend is **built, in Thai, on the proven architecture, and verified**. The one item I can't self-serve — **#2.8 the literal two-device + RLS test on a real Supabase** — is built in code (incl. migrations) but **gated on CPO provisioning**. All on `main`; Railway live (demo mode): https://minom-production.up.railway.app

**Shipped this phase (commits on `main`)**
- **i18n + rebrand to ละมุน** — Thai throughout, Anuphan via next/font, `Intl('th-TH')`, brand marks + tagline; internal MiNom unchanged.
- **Three verbs** — Eat, Sleep (live start/stop timer), Diaper (ฉี่/อึ/ทั้งคู่), all with optimistic write + 5s undo + offline outbox (now insert/update/delete ops) + realtime + attribution.
- **Back-dating** (PRD §4) — shared WhenCard, capped not-in-future, on all logs.
- **Timeline history** — swipe / chevrons to past days; today live, past read-only.
- **Growth** — weight/height entry, history (delete), WHO percentile chart (bands are representative placeholders — exact WHO LMS dataset is a flagged data task), 0002 migration.
- **Settings** — display-name edit, notification opt-in toggle (off by default; no delivery in v1), data export (JSON), delete account (30-day-grace messaging), sign out.
- **PDPA** — 4-line Thai consent on signup + `/privacy` policy page (PM to supply full legal text).
- **Caregivers** — roster + owner badge, invite-by-email (cap 10), remove/transfer/leave; 0003 migration with SECURITY DEFINER RPCs.
- **Accessibility** — live-regions (offline/sync/sleep status), roles (switch/radiogroup/tabs), aria-labels on icon buttons, reduced-motion, ≥48px primary targets, icon+label state cues, labeled inputs.

**Verification**
- `tsc` + production build green throughout (Next 15.5.18).
- **35/35 headless-Chrome QA in Thai** covering: signup+consent → setup → all three verbs (incl. sleep start→running→stop→duration + offline cycle) → back-dating (capped) → timeline yesterday↔today → growth add→chart→history → caregivers owner view + invite error → settings export → privacy page → optimistic+undo, offline→รอซิงค์→flush, cross-tab realtime, attribution, theme.
- Screenshots match the Thai hi-fi + brand (Home/Eat/Sleep/Timeline/Auth/Caregivers/Settings, light + dark).
- DB migrations ready to run: `web/supabase/migrations/0001_init.sql` (schema + RLS + realtime + auth trigger), `0002_growth.sql`, `0003_caregivers.sql`.

**Decisions I own (logged; PM/Designer flag if you disagree)**
- i18n = minimal flat-key `t()` (next-intl can't model the flat th.json with collisions); swap when EN lands.
- Concurrency soft-prompt = **Eat only** (th.json copy is feed-specific). Sleep-timer concurrency needs `concurrency.sleep.*` copy from Designer.
- Diaper has no concurrency prompt (distinct events, not a clash).
- Sleep manual entry = back-date the start (covers "forgot to start"); full start+end manual entry deferred unless wanted.
- Added many Thai keys (growth.*, care.*, settings.*, privacy.*, age.*, a11y.*, auth.error.*) to avoid English leaks — **please have Designer review the Thai copy**; these cover surfaces the Designer's table didn't include.

**What's gated (cannot self-serve — needs CPO)**
- **#2.8 live two-device + RLS** and the brief's success criteria #4/#5 (real second caregiver, cross-device ≤5s on staging): need a **Supabase project (region ap-southeast-1) + the two `NEXT_PUBLIC_SUPABASE_*` env vars in Railway + run migrations 0001–0003**. ~30–45 min. Then I'll run the live verification and close those criteria.
- **New-user email invites** (Caregivers) need an invite-token table + email delivery (Phase 3.x); demo links existing accounts.
- **Account hard-delete** needs a Supabase edge function (auth admin); UI + grace messaging are in place.
- **Privacy policy full text** (PM) and **WHO LMS reference data** (data task) — flagged.

**Handoff → PM (Claude)**
- Phase 3 is **feature-complete and demo-verifiable live** — review the rebranded Thai app at the URL; do the full new-parent loop in demo mode.
- To formally close Phase 3 exit criteria #4/#5, **CPO needs to provision Supabase** (the long-pole, tracked since Phase 2). Once env vars + migrations land, I'll run the two-device/RLS pass and post the result.
- Please route the **Thai-copy review of Dev-added keys** + the **concurrency.sleep copy** question to Designer, and the **privacy policy full text** to yourself.
- CPO: please route to PM. Suggest PM begins Phase 4 (beta) prep in parallel; the only blocker to a real-backend beta is Supabase provisioning.

---

## 2026-06-02 — Dev — Phase 3 progress: three verbs + back-dating + timeline history (checkpoint; Dev continues)

**Status:** Part 2 (Phase 3) underway. The **core product loop is done in Thai**: log all three verbs (with back-dating) + view history. Still on the Dev baton; remaining Phase 3 surfaces below. All pushed to `main`; Railway auto-redeploys https://minom-production.up.railway.app (demo mode).

**Shipped since the Part 1 checkpoint**
- **Back-dating (PRD §4)** — shared `WhenCard` with a แก้ไข affordance → native datetime input, **capped not-in-future**. On Eat, Diaper, and Sleep (manual start). 2-tap path preserved when "now" is right.
- **Diaper vertical** — wet/dirty/both (ฉี่/อึ/ทั้งคู่), instant log reusing the proven Eat insert/offline/optimistic/undo path. Home card live; Timeline summarizes kind.
- **Sleep vertical (timer)** — start/stop with a live mono elapsed timer, กำลังหลับ/awake states, peer-update reconciliation. Required an architecture extension: the **offline outbox is now ops (insert | update | delete)** so a sleep-stop is offline-safe and flushes in order; added `updateActivity` + realtime `onUpdate` to both repos. Home sleep card live with pulse; Timeline shows sleep duration.
- **Timeline history** — swipe (or ←/→ chevrons) to past days; today stays live/editable, past days read-only. วันนี้/เมื่อวาน/date via Intl. No date picker.

**Decisions I own (logged)**
- **Concurrency soft-prompt stays Eat-only** for now: the th.json `concurrency.*` copy is feed-specific ("บันทึกการให้นม"). Diaper events aren't a clash; a Sleep-timer clash would need its own Thai copy. **Designer: if you want sleep-timer concurrency, please add `concurrency.sleep.*` copy** and I'll wire it.
- **Sleep manual entry** = back-date the start via WhenCard (covers "forgot to start the timer"). A full manual completed-sleep entry (separate start+end pickers) is deferred unless you want it — flag.
- Removed the Phase-2 "coming soon" stub (all three verbs now live).

**Verification**
- `tsc` + production build green throughout (Next 15.5.18).
- **25/25 headless-Chrome QA in Thai**, incrementally extended: 3-verb logging, back-dating input (capped), Sleep start→running→stop→duration + an offline start/stop cycle, Diaper kinds, Timeline yesterday↔today, plus all Phase-2 checks (optimistic+undo, offline→รอซิงค์→flush, cross-tab realtime, attribution). Screenshots match the Thai Eat/Sleep/Home hi-fi (light + dark).
- Three commits on `main` (2.1a, 2.1b, 2.2).

**Remaining Phase 3 (Dev continues; sequence)**
3. **Growth** — weight + height entry, WHO percentile curves, history (edit/delete).
4. **Settings** — export JSON, delete account (PDPA grace), notif opt-in toggles, display name/avatar.
5. **PDPA** — signup consent (4 lines from `consent.*`) + privacy policy page (PM drafts full text).
6. **Accessibility pass** — SR labels, aria-live on toasts, reduced-motion audit, 48px/AA both themes across the new screens.
7. **Caregivers** — invite/roles/transfer; UI buildable on demo, true multi-user verify needs live Supabase.
8. **Supabase live + two-device + RLS** — gated on CPO provisioning (carry-over).

**Dependency:** Supabase provisioning (CPO) still gates the literal two-device/RLS close-out and full Caregivers verification. Everything else proceeds on demo mode.

Will write `## — Dev — Phase 3 complete` with the full verification log + `Handoff → PM` when the remaining surfaces land.

---

## 2026-06-02 — Dev — Part 1 complete: i18n wiring + rebrand to ละมุน (checkpoint; Dev continues to Phase 3)

**Status:** Handoff #02 has two parts. **Part 1 (i18n + rebrand) is done, verified, and pushed.** I still hold the Dev baton and continue to **Part 2 (Phase 3 features)** next — this is a progress checkpoint for PM/CPO visibility, not a baton return.

**What shipped (Part 1)**
- **Thai everywhere.** Every UI string + screen-reader label now resolves through `t()` against `web/locales/th.json`. `<html lang="th">`. No English leaks (verified). The dev-facing demo/skeleton notes and the manual offline toggle are gated behind a debug flag so the product UX is clean Thai.
- **Typography.** Anuphan + Spline Sans Mono via **next/font** (subset + preload for the §11.6 first-paint budget; replaces the old render-blocking Latin `@import`). `thai.css` `[lang="th"]` line-heights 1.45 body / 1.35 titles, letter-spacing/caps neutralized. Spline mono kept for Latin numerals only.
- **Formatting.** All dates/times/numbers via `Intl.*('th-TH')` — 24-hour, Arabic numerals. Baby age, weekday, clock, amounts all localized.
- **Rebrand (user-facing only).** `LamoonWordmark` + `LamoonIcon` (Anuphan, clay dot) on auth + loading; `brand.css`; `<title>`/meta/OG → **ละมุน** + tagline "ดูแลลูกอย่างละมุนละไม". **Internal MiNom unchanged** (repo, folder, package, Railway service, env).

**Decisions I own (logged, not silent)**
1. **i18n: minimal flat-key `t()` instead of next-intl.** The Designer's `th.json` uses flat dotted keys with intentional collisions (`auth.toSignUp` is a string AND `auth.toSignUp.cta` exists) — next-intl's nested-namespace model can't represent both. For a single locale, a tiny resolver over the flat dict is the correct "equivalent" the brief allows, and matches the th.json shape exactly. When EN lands, swap for a locale-selecting provider (en.json stub already in place). **PM: flag if you'd rather I force next-intl (would require restructuring th.json keys).**
2. **Clarification #5 implemented as specced:** manual offline toggle → dev/QA-only behind `?debug=1`; production shows only the automatic read-only offline banner.

**Keys I added to th.json (please have Designer review the Thai — I wrote these to avoid English leaks, not as final copy):**
`age.days/weeks/months/years`, `settings.signOut`, `settings.baby`, `phase3.soon`, `setup.createError`, `auth.error.exists`, `auth.error.badCredentials`, `a11y.themeToggle`, `a11y.primaryNav`, `a11y.deleteEntry`. No keys from the Designer's set were missing for the existing screens — these cover surfaces the Designer's table didn't include (errors, a11y labels, settings stub, age strings).

**Verification (Part 1)**
- `tsc` + production build green on Next 15.5.18.
- **13/13 headless-Chrome QA in Thai**: signup→setup→Home→Eat→Timeline; optimistic + undo; offline → **รอซิงค์** → reconnect → flush; cross-tab realtime arrival; attribution (**คุณ**); `lang=th`; age via Intl.
- Screenshots checked vs the Thai hi-fi + brand: Anuphan renders cleanly (no tofu) in light + dark; wordmark matches `brand.jsx`.
- Pushed to `main`; Railway auto-redeploys https://minom-production.up.railway.app (still demo-mode).

**Part 2 — Phase 3 plan + sequence (Dev continues)**
1. **Back-dating affordance** on Eat (the new shared pattern) → then **Sleep** + **Diaper** quick-logs (copy the Eat vertical: sync/offline/optimistic/undo/concurrency/attribution).
2. **Timeline** swipe-left to past days.
3. **Growth** (weight + height, WHO percentile curves, history edit/delete).
4. **Settings** (export JSON, delete account w/ PDPA grace, notif opt-in toggles, display name/avatar).
5. **PDPA** signup consent (4 lines from `consent.*`) + privacy policy page (PM drafts full text).
6. **Accessibility pass** (SR labels, aria-live on toasts, reduced-motion, 48px, AA both themes).
7. **Caregivers** (invite/roles/transfer) — **needs real Supabase** for true multi-user; build UI on demo, verify on live.
8. **Supabase live + two-device + RLS** — gated on CPO provisioning (carry-over).

**Dependencies/risks**
- **Supabase provisioning** (CPO) is still the long-pole — blocks the literal two-device/RLS close-out and full Caregivers verification. I'll build everything else against demo mode and flip to live when env vars land.

**Status → Dev continues to Part 2.** Will write `## — Dev — Phase 3 complete` with the full verification log + `Handoff → PM` when the whole surface is done. CPO/PM: the live URL now shows the rebranded Thai app for review; flag the i18n-library decision (#1) and route the added-key list to Designer if you want the Thai polished.

---

## 2026-06-01 — PM — Phase 2.5 accepted; routing to Dev for i18n + Phase 3

**What happened**
- Reviewed the Designer's Rebrand + Localization deliverable. Read `th.json` (microcopy keyed to existing string IDs, intent-driven Thai, kid-words ฉี่/อึ, ให้นม, ครอบครัว) and `brand.jsx` (wordmark, icon, voice filter with on-brand/off-brand examples). Hi-fi screens checked at 360px light+dark. PDPA 4-line signup consent in place.
- **Phase 2.5 accepted.** Designer's work is high-craft: brand thesis (the name names the feeling, so it's a design filter), typography (Anuphan with one personality for logo + UI), microcopy from intent not translation, and concrete voice examples that future copy can be tested against.

**Pending decisions — both confirmed**
1. **Tagline: "ดูแลลูกอย่างละมุนละไม"** → ✅ **Locked.** Echoes the brand word's compound form; the line reinforces the name. Warm, declarative, not advertising-loud. The two alts stay on file in `design/brand.jsx` for splash/store-listing length needs.
2. **Clarification #4 — back-dating Eat via `แก้ไข`** → ✅ **Approved as a scope addition.** Reasoning: parents log retrospectively all the time ("she ate 20 min ago, just now writing it down"); without back-dating, the timeline drifts from reality. Adds a tiny edit affordance to the quick-log; the 2-tap path is preserved when "now" is correct. Matters most for Diaper (often logged minutes-hours after the fact). Pattern carries to Sleep and Diaper in Phase 3.

**Files promoted**
- `lamoon_drop/design/*` → `MiNom/design/` (Phase-1 EN reference kept intact; Thai files alongside).
- `lamoon_drop/web/locales/th.json` → `web/locales/th.json` (Dev drop-in).
- `lamoon_drop/` to be removed; the Designer's journal entry below is now folded into the canonical `JOURNAL.md`.

**PRD updates**
- `PRD_v0.3.md` §0 — locked tagline + positioning + brand voice rule.
- `PRD_v0.3.md` §4 — added back-dating (the new pattern).

**Handoff → Dev (Claude Code)**
- Brief: `HANDOFF_dev_02.md`. Two work batons bundled:
  - **Part 1 — i18n wiring + rebrand swap.** Wire next-intl with `web/locales/th.json`; set `<html lang="th">`; load Anuphan (subset + preload); `Intl.*('th-TH')` for dates/numbers; swap user-facing brand to ละมุน via `design/brand.jsx`. Internal MiNom unchanged.
  - **Part 2 — Phase 3 (Complete MVP).** Copy Eat vertical to Sleep + Diaper (with back-dating); build Growth (WHO weight+height), Caregivers (per §5a), Timeline (swipe-left for past days), Settings, PDPA signup consent (lines in `th.json` already), accessibility pass.
- Read order: `PRD_v0.3.md` → this `JOURNAL.md` (the Designer entry below) → `HANDOFF_dev_02.md` → design deliverables.
- Exit criteria spelled out in the brief. North-star QA loop: a CPO can complete the full new-parent loop on staging in Thai.

**Carry-over: Supabase provisioning**
- Still the long-pole risk for closing Phase 2's literal exit criteria (two-device + RLS). CPO action; Dev can proceed in parallel using demo mode and flip to live the moment env vars land.

CPO: please route `HANDOFF_dev_02.md` to Claude Code. Q1 (monetization) remains the only open PRD question; doesn't block.

---

## 2026-06-01 — Designer — Rebrand + Localization rework complete

**What happened**
- Delivered the **rebrand to ละมุน (Lamoon)**, the Thai-first rework, and answers to Dev's five Phase-2 clarifications — in one pass. Built as a **companion deliverable** so the Phase-1 English system stays intact as the reference; only the name, typography and words change (per the brief's "don't redo what works").

**Part 0 — Brand identity (ละมุน / Lamoon)**
- **Wordmark:** ละมุน set in **Anuphan Medium (500)** with the warm-clay dot carried over from v0.2 — logo and UI share one type personality. Shown large→small, light + dark.
- **App icon:** ล monogram (first letter) in cream on warm clay, validated 1024→48px. Placeholder for staging; final at Phase-4 beta.
- **Tagline (picked):** **"ดูแลลูกอย่างละมุนละไม"** — *care for your baby, exquisitely gently* — echoes the ละมุนละไม compound so the line reinforces the name. Two alts documented.
- **Brand voice filter:** one rule — *warm, plain Thai that leaves a ละมุน feeling* — with concrete on-brand vs off-brand Thai examples for every future copy decision.
- **Rebrand propagated** to wordmark, hero, signup, footer, and `brand.*` strings. Per PRD §0, **internal code/folder/repo stay "MiNom"** — only user-facing surfaces changed.

**Part A — Thai-first rework + deliverables (file paths — in `design/`)**
- `MiNom Design — Thai Localization.html` — the deliverable. Five sections:
  1. **Typography** — recommended **Anuphan** (Cadson Demak) primary; **IBM Plex Sans Thai** backup; **Noto Sans Thai** fallback. Validated 12→32px; line-height raised to 1.45 body / 1.35 titles for stacked Thai tone marks. Spline Sans Mono retained for Latin numerals only.
  2. **Hi-fi in Thai** — Home, Eat, Sleep, Diaper in light+dark with native Thai copy, checked at 360px (no clipping; Thai runs shorter than EN). Plus ghost first-run Home + Timeline.
  3. **Microcopy** — keyed reference table, written from intent.
  4. **Clarifications** — Dev's five, resolved.
  5. **PDPA** — 4-line plain-Thai signup consent + Thai positioning line.
- `locales/th.json` — complete drop-in, keyed to Dev's exact component string IDs.
- Source: `thai.css`, `th-strings.js`, `screens_th.jsx`, `section_thai_a.jsx`, `section_thai_b.jsx`, `thai_app.jsx`.

**Five clarifications resolved**
1. **Concurrency copy (instant-log Eat)** — shape confirmed; final Thai. Trigger: a peer Eat within 60s shows the sheet *before* commit (avoid duplicate); 3 outcomes (view theirs / log another / scrim-cancel). Non-blocking.
2. **"Synced" pill** — confirmed: queued shows a persistent pill; on sync, flash "ซิงค์แล้ว" 2.2s then remove. No always-on badge.
3. **First-run Home** — **changed**: Phase 3 uses the dashed-ghost treatment (zero activity → all three ghost cards). Dev's hint-in-card was a fine Phase-2 interim.
4. **Eat time-edit** — **changed**: allow back-dating in v1 via an "แก้ไข" affordance (native time input, default now, capped not-in-future); 2-tap path untouched. *(Flagged to PM as a small scope addition — veto-able.)*
5. **Online/Offline chip** — **split**: ship an auto, read-only status indicator (only visible when offline/syncing); demote the manual toggle to dev/QA-only behind a debug flag.

**Decisions I own (logged, not silently overridden)**
- Diaper uses child-words **ฉี่ / อึ** (not clinical ปัสสาวะ/อุจจาระ); Eat is **ให้นม** (not literal กิน). Intent rewrites — please don't "correct" to dictionary translations.
- "Family" → **ครอบครัว** (carries the earlier label call).
- Positioning line (Q3): **"แอปบันทึกการดูแลลูก ที่ทำเพื่อครอบครัวไทย."**

**For PM (scope note)**
- Only clarification #4 (back-dating Eat) extends beyond Dev's Phase-2 deferral. Everything else confirms or refines existing behavior. Confirm #4 before Phase 3 copies the pattern to Sleep/Diaper (where manual entry matters more).

**Handoff → PM (Claude)**
- Review the rebrand + Thai deliverable + the five resolutions; confirm/veto #4 (back-dating) and the tagline pick ("ดูแลลูกอย่างละมุนละไม").
- For Dev: `locales/th.json` is drop-in (now includes `brand.*`); set `<html lang="th">`, wire next-intl, render dates/numbers via `Intl.*('th-TH')`. Load Anuphan (subset + preload per PRD §11.6). Swap user-facing wordmark to ละมุน; keep code identifiers as MiNom.
- Then route to Dev for i18n wiring + Phase 3.

---

## 2026-06-01 — PM — App rebrand: MiNom → ละมุน (Lamoon)

**What happened**
- CPO flagged "MiNom" reads as unintentionally sexual in Thai (นม colloquially = breasts). Asked for a name that pulls new parents emotionally.
- PM presented a wide field organized by emotional driver (love / memory / pride / connection / calm). CPO selected **ละมุน** — "soft, gentle, tender" — a feeling-word as the brand.
- Updated `PRD_v0.3.md` (added §0 Brand identity), `HANDOFF_designer_02.md` (added Part 0 — Brand identity deliverables to existing rework brief), `PLAN.md` and this `JOURNAL.md` (headers).

**Why ละมุน is a good fit**
- The name names the *feeling* we want every interaction to leave behind. It's a built-in design filter: if it isn't ละมุน, redo it.
- Tonal anchor for all microcopy the Designer is about to write — they have a single word to align against.
- Compound ละมุนละไม (= "exquisitely gentle") opens natural tagline territory.
- No NSFW or awkward connotations. No religious/political associations.
- Thai-distinctive; doesn't read as a translated foreign brand.

**Calls I made (flag to override)**
1. **Internal vs external naming split.** Users see ละมุน everywhere. Code/repo/folder/Railway URL stay MiNom for now — renaming the codebase costs more than it earns mid-build. Schedule the internal rename for after Phase 3 (or skip if low value).
2. **Latin spelling: Lamoon** (not "Lamun" / "La-moon" / "La-mun"). Reads phonetically *lah-MOON* in English; the double-o disambiguates from "lah-mun."
3. **Thai script is primary** in all user-facing surfaces; "Lamoon" Latin is secondary, only used where Thai script can't render or once EN locale ships.
4. **Bundled the rebrand into the Designer's already-active Handoff #02** as a new Part 0 rather than creating a separate brief. Single workstream preserved; Designer gets one consolidated package.

**New Designer deliverables (added to Handoff #02)**
- Thai wordmark for ละมุน (light + dark, scales 24px–1024px).
- Latin lockup "Lamoon" as secondary.
- App icon placeholder (final by beta).
- Tagline pick — PM proposed two starters; Designer picks/rewrites.
- Brand voice paragraph in the component stub.

**Open brand TODOs (PM tracks)**
- Domain: research `lamoon.app` / `lamoon.co` / `lamoon.in.th` availability; recommend and secure.
- Social handles (bundled with domain decision).
- Trademark search (Thailand DIP) — defer until after beta unless red flags appear.
- Internal repo rename — schedule post-Phase 3 if value emerges.

**Handoff → Designer (Claude Design)**
- Already holds Handoff #02. The brief now has a new **Part 0 — Brand identity** at the top. Read it, then continue into Part A (Thai rework) and Part B (5 Dev clarifications) as before.
- Close-out journal entry should ideally include: wordmark files, tagline pick, voice note. Microcopy and 5 clarifications still apply.

CPO: nothing new to route — the Designer baton was already with you. This is an in-flight scope addition to the same handoff.

---

## 2026-06-01 — PM — Thai-first reframe (PRD v0.3) + handoff to Designer

**What happened**
- CPO direction: "We target Thai parents — better to have a native Thai version."
- Wrote `PRD_v0.3.md` (supersedes v0.2; Thailand-only market, Thai-only MVP, native Thai voice — not translation).
- Wrote `HANDOFF_designer_02.md` bundling the Thai rework with the 5 Dev clarifications from Dev's Phase 2 entry below.
- Updated `PLAN.md`: Phase 1 closed, Phase 2 marked code-complete + demo-live, added Phase 2.5 "Localization rework," refreshed open-Q tracker and risks.

**Decisions made by PM (flagging for CPO override)**
1. **Thai-only MVP, no EN switcher.** Reading of "native Thai version": ship a Thai-built product, add EN later as second locale. Architecture must be i18n-ready from day one. Tighter voice, simpler launch.
2. **No machine-translation of existing English copy.** Designer writes Thai from intent. Translating English microcopy will feel foreign and undercut "native."
3. **Typography decision is Designer's** (recommended candidates: IBM Plex Sans Thai, Anuphan, Noto Sans Thai). Mono face (Spline Sans Mono) stays — only Latin numerals.
4. **Gregorian calendar, Arabic numerals, 24-hour time, `th-TH` `Intl.*` for all formatting.** Buddhist Era display flagged for designer to consider on growth chart axes; not default.
5. **PDPA compliance is a Phase 3 deliverable, not Phase 4.** Consent, deletion, export, plain-Thai privacy notice all in MVP surface.
6. **Bundled the Dev clarifications into the same designer handoff** rather than routing two batons. Single workstream rule preserved.

**Open questions resolved**
- Q2 (market + units) → **Closed.** Thailand; metric.
- Q3 (brand positioning) → **Closed.** "Simple baby tracker for Thai families." Designer to finalize the Thai positioning line.
- Q4 (data residency) → **Closed.** Singapore (`ap-southeast-1`), per Dev's Phase 2 rec. (PM's earlier "GDPR region-tagging from day one" call dropped as YAGNI per Dev's flag.)
- Q5 (auth) → **Closed.** Supabase Auth, email + password. Email confirmation to be enabled before public launch.
- Q1 (monetization) → **Still open.** Doesn't block. PM rec: free during validation.

**Phase 2 status (separate baton on PM's plate)**
- Code-complete, demo-mode live on Railway. The literal two-device + RLS verification needs CPO to provision a Supabase project (~30 min once credentials exist). PM will hand this to CPO as a side baton; doesn't block the design rework.

**Files produced this turn**
- `PRD_v0.3.md` — current PRD
- `HANDOFF_designer_02.md` — Thai rework + 5 clarifications
- `PLAN.md` updated

**Handoff → Designer (Claude Design)**
- Read `PRD_v0.3.md` first (supersedes v0.2 — same product, Thailand-only market). Then `HANDOFF_designer_02.md`.
- Two-part brief: (A) Thai typography + Thai microcopy + layout pass on 4 hi-fi screens + signup/consent copy; (B) answer the 5 clarifications you owe Dev.
- North-star UX test unchanged: "Sleep-deprived parent, one thumb, dark room, two seconds" — now also "feels Thai-built, not translated."
- When done: `## YYYY-MM-DD — Designer — Localization rework complete` with `Handoff → PM`.

CPO: please route this to Claude Design. The Supabase provisioning is a separate task you can pick up any time before Phase 3 — happy to draft the steps if useful.

---

## 2026-06-01 — Dev — Phase 2 deployed to Railway (staging live)

**What happened**
The Phase 2 skeleton is now **live on a public URL** the team can hit:

> **https://minom-production.up.railway.app** — running in **demo mode** (no backend yet): create an account (stored in your own browser), add a baby, log an Eat. Open a **second tab** to see real-time sync; use the **Online/Offline** chip in the header to try the offline queue.

CPO drove the Railway dashboard (I can't touch the Railway account); I fixed the code-side blockers and guided the config. Verified live: HTTP 200, app renders.

**Three deploy blockers hit + fixed (notes for whoever deploys next)**
1. **Repo not visible in Railway** → Railway's GitHub App didn't have access to the new `MiNom` repo. Fixed via *Configure GitHub App* → grant access.
2. **Build failed (no app at root)** → the app lives in `web/`, so Railway's **Root Directory** must be **`/web`**. Without it the builder scans the repo root (just docs) and exits.
3. **Build blocked on security CVEs** → Railway refuses HIGH-severity dependency advisories. `next@14.2.15` carried several (DoS, SSRF, proxy bypass) only patched at `≥15.5.x`. **Bumped Next 14.2.15 → 15.5.18** (kept React 18; App Router SPA needed no code changes; typecheck + build + serve all green). 0 high/critical remain.
4. **502 after build** → app bound to Railway's injected `PORT=8080` (via custom start `next start -p $PORT`) but the public domain was routed to `3000`. Fixed by pointing the domain at **8080**.

**Railway config of record (for Phase 3 / redeploys)**
- Root Directory: `/web` · Custom Start Command: `next start -p $PORT` · Public domain → port **8080** · Region: Southeast Asia (matches my Q4 rec).

**What this does / doesn't change for the exit criteria**
- ✅ There is now a **live staging URL** (was the main gap). The full UX + all section-05 behaviors are clickable in demo mode, cross-tab sync included.
- ⏳ Still pending: the literal **two real devices over the network within 5s** + **RLS data-isolation across two real accounts**. Demo mode is per-browser (localStorage), so it can't prove cross-device or auth isolation. That needs the **real Supabase** wiring — create project, run `web/supabase/migrations/0001_init.sql`, set the two `NEXT_PUBLIC_SUPABASE_*` vars in Railway. Same code path; ~30 min.

**Handoff → PM (Claude)**
- Phase 2 is now **deployed + demo-verifiable live**; share the URL with anyone who wants to click the product.
- The one remaining step to fully close the Phase 2 exit criteria is **provisioning Supabase** (CPO decision/credentials) so I can flip it from demo to real and run the two-device + RLS verification. Until then: *live, but demo-backed.*
- **For Designer (please route):** the 5 design-clarification items in my "Phase 2 complete" entry below still stand (concurrency copy for instant-log Eat, Synced-pill persistence, first-run Home treatment, Eat time-edit affordance, and the Online/Offline QA chip that's currently mine, not in the design) — worth resolving before Phase 3 copies Eat to Sleep/Diaper.
- README updated: deploy section now documents Railway (Root Dir `/web`, start command, port 8080) instead of Vercel.
- CPO: please route this to PM, and the design items to Designer.

---

## 2026-06-01 — Dev — Phase 2 complete: Eat vertical walking skeleton

**What shipped**
The smallest end-to-end slice that proves the architecture, on the **Eat** verb only — built from the Phase 1 design (tokens lifted verbatim; Home + Eat hi-fi matched in light + dark). Code is on `main`.

- **Repo:** https://github.com/nattaponkr/MiNom — app in [`web/`](web/), run/deploy/QA in [`web/README.md`](web/README.md).
- **Screens (exactly the brief, no more):** Sign in/up → Baby setup (name + birthdate only) → Home (all three cards; only Eat live, Sleep/Diaper route to a "coming soon" stub) → Quick-Log Eat (defaults to "now", one-tap save, optional inline Details) → Timeline (today, with who-logged-it attribution).
- **Section-05 behaviors, all implemented:** optimistic write + 5s undo · skeleton cold-load · offline banner + per-row Queued→Synced pills · realtime arrival w/ quiet toast (never steals focus) · concurrency soft-prompt (dismissible sheet) · inline validation (on blur, disabled CTA, icon+text errors) · delete confirm.
- **Gates:** AA tokens kept; tap targets ≥48px (icon buttons bumped); `prefers-reduced-motion` kills motion; zoom not blocked; quick-log is optimistic (no network on the happy path).

**Stack chosen + why**
**Next.js 14 (App Router) + TypeScript + Supabase** (PM rec, taken). One deploy target, mobile-web first, and Supabase bundles the four things this phase must prove — Auth, Postgres, Realtime, and **Row-Level Security** (RLS is what enforces caregiver data isolation). No CSS framework: the design's own token/component CSS is used directly so the build can't drift from the hi-fi.

**Architecture note (my call):** the data layer is one interface with two implementations — real **Supabase** (the architecture proof, incl. RLS + the realtime publication) and a zero-backend **demo** store (localStorage + BroadcastChannel) that activates when no env vars are set. Same UI/sync code both ways. This lets the app run and demo with **zero setup**, and let me QA the behaviors locally without Docker/cloud. Auth is client-side (supabase-js session in localStorage) rather than SSR cookies — simpler for an SPA and identical across modes; SSR cookie hardening noted for later if we add server-protected routes.

**Q4 (data residency) — recommendation:** single region **`ap-southeast-1` (Singapore)** — lowest latency for a Thai-first audience; baby data is health-adjacent so keep it in one region, encrypted at rest (Supabase default) + RLS. Do **not** build multi-region / GDPR region-tagging yet (no EU/US cohort) — revisit when one appears. (Defers the PM's "region tag from day one" rec as YAGNI; flagging so PM/CPO can overrule.)

**Q5 (auth provider) — recommendation:** **Supabase Auth, email + password.** It's bundled with the DB we're already on, integrates with RLS via `auth.uid()`, no extra vendor/cost, and gives us password-reset + OAuth for free later. For production: **enable email confirmation** (off in the skeleton for convenience) and add the password-reset screen in Phase 3 (currently stubbed).

**QA — verified vs pending (honest split)**
- ✅ **Verified now** (automated headless-Chrome run against demo mode, **15/15 passing**, plus `tsc` + prod build green, plus light/dark screenshots checked against the hi-fi): signup→setup→Home→Eat→Timeline; optimistic + 5s undo; offline → **Queued** → reconnect → **flush/Synced** (survives reload while queued); **cross-tab realtime arrival** (B's entry lands in A within ~1s); second-tab session restore; attribution; theme toggle; visual match in both themes.
- ⏳ **Pending cloud provisioning** (I can't self-serve — needs a Supabase project + Vercel, i.e. CPO accounts/secrets; I don't touch `.env`): the literal exit-criteria of **two real devices over the network within 5s** and **RLS data-isolation across two real accounts**, and the email auth flows. These run the *same* UI/sync code the demo exercises; the Supabase impl + RLS policies + realtime publication are written and in the migration, but **not yet exercised against a live DB**. Step-by-step to light this up (create project → run `0001_init.sql` → set 2 env vars → deploy, Root Directory `web`) is in `web/README.md`. ~30–45 min of provisioning.

**Design under-specified (for Designer before Phase 3 copies this to Sleep/Diaper)**
1. Concurrency prompt: the design demo is timer-framed (Sleep). Eat is an instant log, so I adapted the copy ("X logged a feed Ns ago — view theirs / log another"). Please confirm the instant-log variant.
2. "Synced" pill: I flash it ~2.2s after a queued row syncs, then hide. Confirm desired persistence.
3. First-run Home: I used the normal Eat card with a "No feeds yet — tap to log" hint rather than the dashed ghost `EmptyHome`. Confirm which you want.
4. Eat "When": design shows an **Edit** affordance; I defaulted to "now" and deferred time-editing to Phase 3. Confirm.
5. The Online/Offline chip in the Home header is **mine** (a QA/demo affordance, not in the design) — formalize or remove for production.

**Housekeeping**
- Reconciled `JOURNAL.md` into one canonical file (my onboarding/blocked entries + the Designer/PM entries had diverged across threads).
- The CPO's `handoff_drop/` inbox is **git-ignored, not committed** — it held a *duplicate* `JOURNAL.md` that would have created a second source of truth. The unique brief (`HANDOFF_dev_01.md`) was promoted to repo root with the other handoffs. Safe to delete `handoff_drop/` whenever.

**Handoff → PM (Claude)**
- Review against the exit criteria. Everything front-end/sync is verified in demo mode + screenshots; the only gap to "Done" is lighting up cloud Supabase for the literal two-device/RLS test.
- **Decision needed from CPO (via PM):** provision Supabase + Vercel (or authorize me with the keys) so I can finish the live two-device + RLS verification and hand you a staging URL. Until then Phase 2 is **code-complete + locally verified**, not **live-verified**.
- Please also route the 5 design-clarification items above to the Designer so Phase 3 (Sleep/Diaper copy-paste) starts unblocked.
- CPO: please route this to PM.

---

## 2026-05-31 — PM — Phase 1 accepted, routing to Dev

**What happened**
- Reviewed the Designer's Phase 1 package (`MiNom Design — Phase 1.html`). IA reads clearly, the 4 hi-fi screens match the vision, and the new states/motion section closes the "what does this state look like?" gap that was a stage-1 success criterion. **Phase 1 accepted.**
- Wrote `HANDOFF_dev_01.md` — the Phase 2 (Walking Skeleton) brief for Dev.

**Decisions on the Designer's open flags**
1. **"Family" label** — keep it. Warmer, still unambiguous. (Revisit only if beta users are confused.)
2. **Concurrency prompt as a dismissible sheet** — approved as designed. Non-blocking is the right call.

**Phase 2 scope reminder (in the brief)**
- Eat vertical slice only, end-to-end: auth → baby setup → Home → log Eat → Timeline → real-time sync across two devices, offline-safe. Sleep/Diaper/Growth/Caregivers deferred to Phase 3.
- Dev owns Q4 (data residency) and Q5 (auth provider) recommendations this phase.

**Handoff → Dev (Claude Code)**
- Read `PRD_v0.2.md`, this `JOURNAL.md`, `PLAN.md` §3, then `HANDOFF_dev_01.md`.
- Build reference is the design deliverable; lift tokens from `styles.css`, match hi-fi light+dark, implement the states shown in section 05.
- Exit: two devices see each other's Eat entries on the staging URL within 5s; logging works offline. Close with a `## — Dev — Phase 2 complete` entry ending in `Handoff → PM`.
- CPO: please route to Claude Code when ready.

---

## 2026-05-31 — Designer — Phase 1 complete

**What happened**
- Delivered the full Phase 1 design package as a single interactive HTML document. North-star test ("sleep-deprived parent, one thumb, dark room, two seconds") drove every call.

**Deliverables (file paths)**
- `MiNom Design — Phase 1.html` — the deliverable. Five sections, in order:
  1. **IA / sitemap** — 8 screens as tiers; the ~90% hot path (Home → tap verb → Save → done) is visually highlighted and called out as a 2-tap loop.
  2. **Lo-fi wireframes** — all 8 core screens + supporting flows (Sign in/up, Baby setup, Accept invite). Clean grayscale, numbered annotations, thumb-zone overlay on Home.
  3. **Hi-fi mockups** — Home, Eat, Sleep, Diaper, each in **light + dark**. Sleep shown idle→running; Diaper wet→both.
  4. **Visual direction** — "Warm & Soft" mood, both modes (incl. a note on why dark is first-class, not an inversion).
  5. **Component stub** — type scale, light+dark color tokens, spacing, radii/shadow, button + input states, the "last X ago" card, activity row w/ attribution, percentile-chart placeholder.
  6. **States, feedback & motion** — empty/first-run states (Home, Timeline, Growth) + 8 *live* interaction demos (optimistic log + undo, save loop, real-time sync arrival, offline queue, concurrency soft-prompt, delete confirm, inline validation, skeleton loading) + motion spec (durations/easing), feedback escalation catalog, and a microcopy table. Added so a frontend dev has behavior, timing and words — not just layout.
- Supporting source files: `styles.css` (tokens), `app.css`, `wf.css`, `sections.css`, and `*.jsx` components.
- **Tweaks panel** (toolbar): dark mode, icon style (line/filled), Home layout (cards/thumb-trio), Eat details (inline/sheet), wireframe annotations on/off — so PM/CPO can A/B the open layout calls live.

**Decisions made under "own them"**
1. **Iconography** — one soft line set, 1.9px rounded stroke; filled variant available via tweak. Calm, not cute.
2. **Type pairing** — Hanken Grotesk (warm humanist sans) + Spline Sans Mono (tabular) for all times/durations/amounts.
3. **Home layout** — default is **three stacked status cards** where the *whole card* is the tap target (keeps the 2-tap log). A bottom-thumb "big trio" alternative is provided as a tweak.
4. **Eat "Details"** — **inline expander** by default (one screen, no extra navigation), collapsible; a separate-sheet variant is provided as a tweak.
5. **Empty states / microcopy** — gentle, plain-spoken ("Tap start when she drifts off", "Anything to remember…"). No baby-talk.
6. **Color system** — four verb hues share one lightness/chroma, hue-only variation; color is always paired with icon + label (AA, color-not-sole-indicator).

**PRD notes for PM (no silent overrides)**
- **"Family" vs "Caregivers" label** — used "Family" in the bottom nav for warmth; screen still does everything §5a/#7 specifies. Flagging as a copy proposal, not a model change.
- **Soft concurrency prompt** (§5a) — designed as a non-blocking, dismissible sheet rather than its own screen.
- No contradictions to PRD v0.2 otherwise. Q2 (units) handled via a unit-toggle in Settings + metric-default inputs; Q3 positioning carried through the visual tone.

**Handoff → PM (Claude)** — review hi-fi + component stub; confirm the two flags; route to Dev for the Walking Skeleton.

> _Note (Dev, on reconcile): the two entries above were completed in the Designer/PM threads and dropped into the shared `JOURNAL.md` after my "blocked" entry below — their arrival is exactly what unblocked Phase 2._

---

## 2026-05-31 — Dev — Phase 2 baton received, but blocked: design files missing → query to Designer

**What happened**
- CPO handed me the Phase 2 (Walking Skeleton) baton: build the **Eat vertical only**, end-to-end, proving auth + storage + real-time sync + offline on one verb. Specific screens, gates, and Done criteria all noted.
- The brief instructs me to **lift tokens verbatim from `styles.css`** and **match the hi-fi in `MiNom Design — Phase 1.html`**, implementing the **section 05** behaviors. I went to read those files to start — **they don't exist** in `MiNom/` (searched the whole Desktop + Downloads). `HANDOFF_dev_01.md` (the "full detail" brief) is also missing.
- There is also **no `Designer — Phase 1 complete` entry** in this journal. So the design baton was never formally closed into the shared folder; the deliverables appear to still live in the Designer's thread.

**Decision (per my way-of-work): flag, don't invent.**
- Half the Phase 2 Done criteria are visual ("visuals match the hi-fi") and the interaction spec lives in section 05. Building with fabricated tokens/components would diverge from what the Designer shipped and force a Phase 2 redo. So I'm not writing code against an invented design.
- CPO directive: work as one team — send the Designer a question rather than guessing. Done: wrote `HANDOFF_dev_to_designer_01.md` (a precise, routable request).

**What I'm asking the Designer for** (full detail in the query file)
1. Drop the design source into `MiNom/design/`: the Phase 1 HTML, `styles.css`/inline tokens, and referenced assets. Raw source — no re-export needed.
2. Confirm the file contains: light+dark color tokens, type/spacing/radius scales, Home + Eat hi-fi (both themes), and the seven section-05 behaviors.
3. Three quick clarifications (nav label "Family", attribution avatar-vs-initials, skeleton row shape) — non-blocking.

**Also needed (secondary, from PM):** `HANDOFF_dev_01.md`. I have the core of it from the CPO's message, so this isn't the hard blocker — the design files are.

**Status:** Phase 2 is **open but blocked on the design drop.** As soon as the files land and the checklist is confirmed, I start building immediately — stack will be Next.js + Supabase per PM rec (I'll record final Q4/Q5 data-residency + auth-provider recommendations in the journal when I begin the build).

**Files produced**
- `HANDOFF_dev_to_designer_01.md`

**Handoff → Designer (Claude Design).** Please route `HANDOFF_dev_to_designer_01.md` to the Designer's thread. I'll pick the baton back up the moment the design files are in `MiNom/design/`.

---

## 2026-05-31 — Dev — Onboarded; wrote my way-of-work guideline

**What happened**
- CPO brought me (Claude Code) onto MiNom as Developer + QA and shared the PM's way-of-work guideline. Asked me to derive my own version and save it in the project.
- Read `JOURNAL.md`, `PLAN.md`, `HANDOFF_designer_01.md` to learn the conventions (single workstream, journal-as-truth, `Handoff →` protocol, CPO at arm's length).
- Wrote `WAY_OF_WORK_dev.md` — my operating guideline: ownership/escalation rules, journal discipline, handoff protocol, definition-of-done, QA discipline (I wear both hats), and engineering principles for this app.

**Status**
- I am **not** taking a baton. The current workstream is still Phase 1 — Design (owner: Designer). I'm only onboarded and standing by.
- When the design baton eventually routes through PM to Dev, I'll pick up Phase 2 (Walking Skeleton) per `PLAN.md` §3.

**Files produced**
- `WAY_OF_WORK_dev.md`

**Handoff → none (no baton in hand).** Design phase continues. I'll wait for `Handoff → Dev`.

---

## 2026-05-29 — PM — Project kickoff: plan + first handoff to Designer

**What happened**
- CPO asked to organize the project. Wrote `PLAN.md` (workflow, roles, phases, risks, open-Q tracker) and `HANDOFF_designer_01.md` (the first baton brief).
- Phase 1 (Design) is now open. PM phase 0 (Discovery + PRD) is closed.

**Workflow we agreed on (codified in PLAN.md §1)**
- Single workstream. One baton at a time. Order: PM → Designer → PM → Dev → PM.
- Journal is the single source of truth. Every stage closes with a journal entry ending in a `Handoff →` line.
- Substantive briefs live as separate `HANDOFF_*.md` files; journal entries link to them.
- CPO routes batons, answers blockers, otherwise stays at arm's length.

**Phase plan (PLAN.md §3)**
- Phase 0 — PRD ✅
- Phase 1 — Design 🟢 (current; owner: Designer)
- Phase 2 — Walking Skeleton (Dev: smallest end-to-end slice; auth → create baby → Home → log Eat → real-time sync)
- Phase 3 — Complete MVP (Dev: fill out the rest of PRD v0.2)
- Phase 4 — Beta + launch

**Decisions made by PM (flagging for CPO to override if wanted)**
1. Walking Skeleton scope: **only the "Eat" verb gets implemented end-to-end first.** Sleep and Diaper come in Phase 3. Reason: prove the architecture (auth + sync + offline + storage) on one vertical slice before duplicating it three times.
2. Tech stack: leaving the call to Dev in Phase 2; PM recommendation is a managed BaaS (Supabase / Firebase) to ship faster, but Dev gets to pick.
3. Default brand positioning while we wait on CPO: **"The simplest baby tracker."** Calm/modern/not-infantilizing. Designer can run with this; if you want different, say so.
4. Default unit/market posture: **metric default + imperial toggle, EN now, TH-ready.** Designer should design unit-toggleable inputs regardless; choosing the default doesn't block design.

**Open questions still on the board (PLAN.md §4)**
- Q1 Monetization (free in v1?)
- Q2 Market + units default
- Q3 Brand positioning
- Q4 Data residency
- Q5 Auth provider

None block design. Q2 and Q3 should resolve before designer finalizes hi-fi.

**Files produced this turn**
- `PLAN.md` — project roadmap
- `HANDOFF_designer_01.md` — designer brief

**Handoff → Designer (Claude Design)**
- Read PRD v0.2, JOURNAL, PLAN — in that order.
- Then read `HANDOFF_designer_01.md` for deliverables, constraints, and how to close out the phase.
- North-star UX test: "Sleep-deprived parent, one thumb, dark room, two seconds."
- When done: write `## YYYY-MM-DD — Designer — Phase 1 complete` here in JOURNAL, ending with `Handoff → PM`.

CPO: please route this to Claude Design when ready.

---

## 2026-05-29 — PM — v0.2 update: multi-caregiver model expanded

**What happened**
- CPO direction: "Allow multiple people to manage one baby."
- Edited `PRD_v0.2.md` in place. Added a dedicated §5a "Multi-caregiver model" and a new Caregivers screen (#7).

**Key decisions (and why)**
1. **N caregivers per baby, capped at 10.** Two parents + grandma + nanny is realistic; 10 covers it with headroom. Hard cap prevents abuse.
2. **One Owner + N equal Caregivers.** Owner can invite/remove/transfer ownership; otherwise everyone has identical logging permissions. No read-only role in MVP — keep the model flat.
3. **Activity attribution.** Every entry shows who logged it (small/secondary). Solves the "did you already feed her?" problem without nagging.
4. **A user can be on multiple babies.** Required for nannies and grandparents. Baby selector only appears when N > 1.
5. **Soft concurrency warning restored.** I'd cut it in v0.2, but with N caregivers two people starting the same timer becomes likely enough that the prompt is worth keeping. Non-blocking.
6. **Notifications opt-in only.** Default-off. Notification fatigue is the #1 reason parents abandon tracking apps; we don't want to ship the problem in v1.
7. **Account deletion grace period: 30 days.** Owner deletion auto-transfers to longest-tenured caregiver; if none, baby + data deleted after 30 days.

**Data model**
- `baby ⇄ caregiver`: many-to-many via `baby_caregivers (baby_id, user_id, role, joined_at)`.
- `activity` carries `logged_by_user_id`.

**New success metrics added**
- % of babies with ≥2 active caregivers (target 35%).
- Median caregivers per active baby (target ≥2).

**Handoff → Designer (Claude Design)**
- v0.2 is updated; please re-read §5a and §6 specifically.
- New screen to design: **Caregivers** (list + invite + manage + transfer).
- Timeline rows need an actor indicator (avatar or initials). Keep it secondary so it doesn't compete with the activity itself.
- All other handoff notes from the prior entry still stand.

---

## 2026-05-29 — PM — v0.2 PRD: baby-centric simplification

**What happened**
- CPO direction: "Be baby-centric. From the baby's perspective, all food is food — don't split into breast/bottle/etc. Look at other things to minimize."
- Rewrote PRD as `PRD_v0.2.md`. Reframed the product around four verbs from the baby's POV: **Eat, Sleep, Diaper, Grow**.

**Key decisions (and why)**
1. **One "Eat" activity, not four sub-types.** Breast/bottle/pump/solids collapse into a single Eat log. Type/amount/side move to an optional, collapsed "Details" expander. Reason: parent metadata shouldn't gate the core loop.
2. **One "Sleep" activity, not nap-vs-night.** Same logic — the timestamp tells us when it was.
3. **Pumping removed from MVP.** It's a parent-side workflow, not a baby activity. Phase 2.
4. **Growth simplified to weight + height.** Head circumference cut (pediatrician-measured, not home).
5. **Baby setup minimized to name + birthdate.** Sex, birth weight, birth length, photo all optional.
6. **One auth method (email + password).** Google sign-in deferred.
7. **Statistics cut from MVP.** "Last X ago" indicator is the only stat that matters in v1.
8. **Live caregiver banner + concurrent-timer warning cut.** Last-write-wins is enough.
9. **Timeline date picker cut.** Today by default, swipe back for previous days.

**Surface area reduction**
- Screens: 12 → 7
- Required fields in quick-log: ~5 → 1 (just the verb)
- MVP feature lines: ~30 → 10

**Open questions for CPO (carried from v0.1, still need answers)**
- Q1: Confirm "no monetization in MVP"?
- Q2: Target geography / language / unit default?
- Q3: Brand positioning — is "the simplest baby tracker" the pitch?
- Q4: Data residency requirements?
- Q5: Auth provider — build vs managed?

**Handoff → Designer (Claude Design)**
- Read `PRD_v0.2.md` (supersedes v0.1).
- Deliverables requested: (a) IA / sitemap for the 7 screens, (b) wireframes — prioritize **Home/Today** and the three **Quick-Log sheets** (Eat, Sleep, Diaper) since they are 90% of the app, (c) one-handed thumb-zone analysis, (d) dark mode is mandatory, design in both modes from the start.
- North-star UX test: "Can a sleep-deprived parent log an activity in two seconds with one thumb in the dark?"

---

## 2026-05-29 — PM — v0.1 PRD drafted, ready for design

**What happened**
- Researched Baby Daybook (babydaybook.app, premium page, feeding tracker page) to inventory features, IA, and monetization.
- Aligned with CPO on scope: **MVP only, straight clone, web + mobile-friendly web**.
- Wrote `PRD_v0.1.md` covering vision, personas, MVP feature list, user stories, non-functional requirements, success metrics, and out-of-scope items.

**Key decisions (and why)**
1. **MVP scope = 4 trackers + timeline + multi-caregiver sync.** Feeding (breast/bottle/pump/solids), Sleep, Diaper, Growth. These are the "why parents open the app" loops. Everything else (sleep predictions, health log, teeth, milestones, widgets, PDF export, reminders) goes to phase 2+.
2. **Web-first, responsive (mobile web).** Faster to ship than native, lets us validate before investing in iOS/Android. Trade-off: no widgets, no background notifications, no offline-first parity with native — accepted for v1.
3. **Real-time multi-caregiver sync is in MVP, not premium.** Baby Daybook gates this behind premium; we treat it as a wedge feature because new parents tag-team care from day one. Monetization model deferred to phase 2.
4. **One baby profile per account in MVP.** Multi-baby (twins) deferred. Most users have one baby; the data model will allow N from day one but UI surfaces only one.
5. **Manual logging only.** No predictions, no AI, no wearable integrations. Keep the loop tight: tap → log → done in <5 seconds.

**Open questions for CPO**
- Q1: Confirm "no monetization in MVP" — i.e. free during validation phase?
- Q2: Target geography / language for v1? (Affects growth chart standard: WHO vs CDC, and units: metric vs imperial.)
- Q3: Any specific differentiator we should bake into MVP copy / brand, or is "Baby Daybook on the web" the honest pitch?

**Handoff → Designer (Claude Design)**
- Read `PRD_v0.1.md`.
- Deliverables requested: (a) IA / sitemap, (b) wireframes for the 5 core screens listed in PRD §7 (Home/Today, Quick-Log, Activity Detail, Timeline, Growth), (c) a lightweight visual direction (1–2 mood options) suitable for sleep-deprived parents at 3am (dark mode parity required).
- Constraints: mobile-web first, thumb-reachable primary actions, minimum 48×48px tap targets, must work one-handed.
- When done, log a "Designer → PM" entry below with links/screenshots and any PRD changes needed.

---
