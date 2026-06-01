# MiNom — PRD v0.1 (First Draft)

| Field | Value |
|---|---|
| Owner | PM (Claude) |
| Status | Draft — pending CPO review |
| Date | 2026-05-29 |
| Audience | CPO, Designer, Developer |
| Reference benchmark | Baby Daybook (babydaybook.app) |

---

## 1. Vision

MiNom helps new parents track their newborn's daily activities — feeding, sleep, diapers, growth — without breaking the rhythm of caring for the baby. The defining experience is **log in under five seconds, even with one hand at 3am**. v1 is a responsive web app so parents can use it on phone, tablet, or desktop with no install.

## 2. Problem

The first year is a blur. Parents forget when the baby last ate, how long the last nap was, which breast was used, when the last diaper was wet. They tag-team with partners, nannies, and grandparents but communicate via memory and text messages, leading to over- or under-feeding, missed nap windows, and confused pediatrician visits.

Pen-and-paper trackers fail in the dark, mid-feed, one-handed. Existing apps (Baby Daybook, Huckleberry, Glow Baby) are good but native-only and many gate basic features (multi-caregiver sync, full history) behind premium subscriptions.

## 3. Goals & Non-Goals

**Goals (v1)**
- Make logging the four core activities feel effortless.
- Let two or more caregivers share one baby's log in real time, for free.
- Give parents a clean daily timeline and basic growth charts to bring to pediatrician visits.

**Non-Goals (v1)**
- Sleep predictions / AI insights.
- Native iOS / Android apps (revisit phase 2).
- Health log, medication log, vaccinations, teething, milestones.
- Pumping inventory management.
- PDF export, advanced statistics, custom reminders.
- Monetization. v1 is free during validation.
- Multi-baby (twins) UI. Data model supports it; UI surfaces one.

## 4. Target users

**Primary persona — "Fresh Parent Fai"**
- 28–38, first-time parent, baby aged 0–6 months.
- Phone-first. Logs activities while feeding or rocking.
- Pain: cognitive overload, sleep deprivation, anxiety about whether baby is "normal."
- Wins when: she can answer "when did the baby last eat?" in 2 taps.

**Secondary persona — "Tag-Team Tan"**
- The other caregiver (partner, grandparent, nanny).
- Needs to see what's happened without asking.
- Wins when: she opens the app, sees the last feed was 90 min ago, and starts prep without a text exchange.

## 5. Competitive context

Baby Daybook is the benchmark — high quality, 4.8 stars, 2M+ downloads, "Best Apps 2024" on Google Play. Its full feature surface (informing our roadmap, not our MVP):

| Category | Baby Daybook feature | MiNom MVP | MiNom phase 2+ |
|---|---|---|---|
| Feeding | Breastfeeding (timer, side), bottle, pumping, solids | Yes (all four) | — |
| Sleep | Sleep log, daily/weekly view | Yes (log + day view) | Sleep predictions |
| Sleep | Sleep predictions (premium) | No | Phase 2 |
| Diaper | Wet/dirty one-tap log | Yes | Potty training |
| Growth | Weight/height/head, WHO+CDC percentile charts | Yes (WHO only, weight+height+head) | CDC toggle |
| Health | Symptoms, meds, vaccines, doctor visits | No | Phase 2 |
| Teeth | Eruption/shedding tracker | No | Phase 3 |
| Caregiver | Real-time family sync (premium) | **Yes — free** | — |
| Profiles | Multiple baby profiles | No (1 baby) | Phase 2 |
| Timeline | Daily timeline view | Yes | Search/filter |
| Stats | Charts by period (premium) | Basic 7-day | Advanced (phase 2) |
| Reminders | Custom reminders (premium) | No | Phase 2 |
| Photos | Photo attachments | No | Phase 2 |
| Export | PDF export (premium) | No | Phase 2 |
| Widgets | iOS / Android / WearOS / Apple Watch | No (web only) | When native ships |
| Custom | User-defined activity types | No | Phase 2 |

**Our wedge in MVP:** free multi-caregiver sync + zero install (open in a browser, add to home screen).

## 6. MVP feature requirements

### 6.1 Account & baby setup
- Email + password signup; Google sign-in (deferred OK if tight).
- Create one baby profile: name, birthdate, sex (optional), birth weight/length (optional).
- Invite caregivers by email; invitee creates an account and is auto-linked to the baby.
- Caregiver roles in MVP: all caregivers have equal permissions. Role-based access deferred.

### 6.2 Feeding tracker
- **Breastfeeding:** start/stop timer, left/right side toggle, switch sides mid-session. Manual time entry as fallback. Notes field.
- **Bottle:** type (breast milk / formula), amount in ml or oz (user unit pref), time, notes.
- **Pumping:** side(s), duration, amount, time, notes. No inventory tracking.
- **Solids:** food name (free text), amount (small/medium/large or grams), time, notes.
- Last-feed indicator on Home: "Last feed: 1h 12m ago — left breast, 18 min".

### 6.3 Sleep tracker
- Start/stop nap or night sleep. Manual time entry fallback.
- Location (optional free text: crib, stroller, mum's arms…).
- Notes.
- Last-sleep indicator on Home: "Awake for 1h 40m" or "Sleeping — 22 min so far".

### 6.4 Diaper tracker
- One-tap log: wet, dirty, mixed.
- Time defaults to now; editable.
- Optional notes (color/consistency picker deferred to phase 2).
- Last-diaper indicator on Home.

### 6.5 Growth tracker
- Manual entry: weight, height, head circumference. User unit pref (kg/lb, cm/in).
- Chart: per metric, plotted against WHO percentile curves for baby's age and sex.
- List view of all historical entries; edit/delete.

### 6.6 Daily timeline
- Single chronological view of all activities for a chosen day.
- Default date = today; date picker for past days.
- Activity rows expandable to show details; edit/delete from row.
- Pull to refresh; updates from other caregivers visible within 5 seconds.

### 6.7 Home / Today
- "Last X ago" cards for feed, sleep, diaper.
- Big quick-log buttons: Feed, Sleep, Diaper.
- Banner: who else is logging right now (e.g. "Partner started a feed 30s ago").

### 6.8 Multi-caregiver sync
- Real-time data sync (websocket or equivalent) so updates from any caregiver appear on others' devices within 5 seconds.
- Conflict handling: last-write-wins on edits; concurrent timers from two devices show a soft warning ("Partner already started a feed — open it or start a new one?").

### 6.9 Basic statistics (lightweight)
- 7-day rollup on each tracker's screen: total feeds/day, total sleep/day, diaper counts/day.
- No premium gate. No long-range history charts in MVP.

## 7. Core screens (for design)

1. **Home / Today** — last-X cards, big quick-log buttons, live caregiver banner.
2. **Quick-Log sheets** — Feed (with sub-tabs: breast/bottle/pump/solids), Sleep, Diaper. Optimized for one-handed use.
3. **Activity Detail** — view/edit a single logged item.
4. **Timeline** — chronological day view, date picker.
5. **Growth** — chart + entry list per metric (weight / height / head).

Supporting screens: Sign in/up, Baby setup, Caregiver invite, Settings (units, account, sign out).

## 8. Non-functional requirements

- **Performance:** Quick-log action completes (button → confirmation) in <500ms on mid-range Android over 4G.
- **Reliability:** Logging works offline; queued writes sync when reconnected. Real-time sync is best-effort but never loses data.
- **Responsive:** Designed mobile-first (360–430px), works through tablet to desktop (1280px+).
- **Accessibility:** WCAG 2.1 AA. Tap targets ≥48×48px. Dark mode mandatory (used in dark rooms at night).
- **Privacy:** Baby data is personal. End-to-end encryption is a phase 2 goal; v1 must at minimum encrypt in transit and at rest, isolate accounts, and provide data export + account deletion.
- **Localization:** v1 ships in English. Architecture supports i18n from day one. (See Open Q2.)
- **Browsers:** Latest Safari iOS, Chrome Android, Chrome / Safari / Firefox desktop.

## 9. Success metrics

| Metric | Target (90 days post-launch) |
|---|---|
| Activation: % of signups that log ≥3 activities in first 24h | 60% |
| Caregiver invite rate: % of accounts that invite ≥1 caregiver | 40% |
| D7 retention | 50% |
| D30 retention | 35% |
| Median time-to-log (button tap → confirmation) | <3 sec |
| Crash-free sessions | ≥99.5% |

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Web app lacks "always there" feel vs native | PWA install prompt; home-screen icon; push via Web Push API |
| Real-time sync is expensive to build right | Start with polling fallback; upgrade to websockets after first usable build |
| Pediatric data accuracy / liability | Clear disclaimer: not medical advice; WHO data sourced from public references and cited in-app |
| Logging fatigue | Aggressive defaults (time = now, last-used values pre-filled); no required fields beyond minimum |

## 11. Open questions

1. **Monetization** — confirm "free in v1." When do we revisit? (Suggested: after 1k DAU.)
2. **Geography / units** — primary market language and metric vs imperial default? Affects copy and chart references.
3. **Brand positioning** — is "fast, free, shared baby tracker on the web" the v1 pitch, or do we want a sharper differentiator in copy?
4. **Data residency** — any regions where we need region-locked storage (EU GDPR, others)?
5. **Auth provider** — build our own, or use a managed service (Auth0, Firebase Auth, Supabase Auth)?

## 12. Phase 2+ roadmap (informational)

To set expectations, the following are explicitly out of v1 but on the roadmap:

- Sleep predictions and "wake window" suggestions.
- Health log: symptoms, medications, doctor visits, vaccination schedule.
- Custom reminders.
- Photo attachments and activity album.
- Milestones and teething tracker.
- Multi-baby profiles (twins).
- PDF export for pediatrician.
- Advanced statistics, unlimited history.
- Native iOS / Android apps with widgets + Apple Watch / Wear OS.
- Premium tier (monetization).

## 13. Appendix — Sources

- Baby Daybook homepage: https://babydaybook.app/
- Baby Daybook premium: https://babydaybook.app/premium/
- Baby Daybook feeding tracker: https://babydaybook.app/feeding-tracker/
- App Store listing: https://apps.apple.com/us/app/baby-daybook-newborn-tracker/id1446283219
- Google Play listing: https://play.google.com/store/apps/details?id=com.drillyapps.babydaybook
