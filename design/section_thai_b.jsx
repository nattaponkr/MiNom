// section_thai_b.jsx — Microcopy reference, Dev clarifications, consent
function MicrocopyTable() {
  // [group, [ [key, thai, english-intent], ... ] ]
  const groups = [
    ['Brand', [
      ['brand.tagline', TH.brand.tagline, 'the simplest baby tracker'],
      ['brand.positioning', TH.brand.positioning, 'simple baby tracker, made for Thai families'],
    ]],
    ['Auth & setup', [
      ['auth.signIn', TH.auth.signIn, 'Sign in'],
      ['auth.createAccount', TH.auth.createAccount, 'Create account'],
      ['auth.email.error', TH.auth.emailError, 'Enter a valid email'],
      ['setup.title', TH.setup.title, 'Add your baby'],
      ['setup.name.placeholder', TH.setup.namePlaceholder, 'e.g. Mina'],
      ['setup.continue', TH.setup.continue, 'Continue'],
    ]],
    ['Home', [
      ['home.eat.name', TH.home.eatName, 'Eat'],
      ['home.sleep.name', TH.home.sleepName, 'Sleep'],
      ['home.diaper.name', TH.home.diaperName, 'Diaper'],
      ['home.eat.empty', TH.home.eatEmptyStat + ' · ' + TH.home.eatEmptyUnit, 'No feeds yet · tap to log'],
      ['home.by', TH.home.by, 'by {name}'],
      ['home.ago', TH.home.ago, 'ago'],
    ]],
    ['Eat sheet', [
      ['eat.when.now', TH.eat.whenNow, 'Now · {time}'],
      ['eat.details.toggle', TH.eat.detailsToggle, 'Details · optional'],
      ['eat.what.milk / food', TH.eat.whatMilk + ' / ' + TH.eat.whatFood, 'Milk / Food'],
      ['eat.source.breast_l/r', TH.eat.sourceBreastL + ' / ' + TH.eat.sourceBreastR, 'Breast L / R'],
      ['eat.notes.placeholder', TH.eat.notesPlaceholder, 'Anything to remember…'],
      ['eat.cta.save', TH.eat.save, 'Save feed'],
    ]],
    ['Sleep & Diaper', [
      ['sleep.start', TH.sleep.start, 'Start sleep'],
      ['sleep.manual', TH.sleep.manual, 'Enter time manually'],
      ['diaper.wet', TH.diaper.wet, 'Wet (child-word, not clinical)'],
      ['diaper.dirty', TH.diaper.dirty, 'Dirty (child-word, not clinical)'],
      ['diaper.both', TH.diaper.both, 'Both'],
      ['diaper.cta.save', TH.diaper.save, 'Save diaper'],
    ]],
    ['Timeline & sync', [
      ['timeline.empty.title', TH.timeline.emptyTitle, 'Nothing logged today'],
      ['sync.queued', TH.sync.queued, 'Queued'],
      ['sync.synced', TH.sync.synced, 'Synced'],
      ['sync.offline.banner', TH.sync.offlineBanner, 'Offline · changes saved on this device'],
    ]],
    ['Feedback & sheets', [
      ['feedback.eatLogged', TH.feedback.eatLogged, 'Eat logged'],
      ['feedback.undo', TH.feedback.undo, 'UNDO'],
      ['feedback.saveError', TH.feedback.saveError, "Couldn't save — retrying…"],
      ['concurrency.title', TH.concurrency.title, "Someone's already on it"],
      ['concurrency.body', TH.concurrency.body, '{name} logged a feed {dur} ago. View it, or log another?'],
      ['del.title', TH.del.title, 'Delete this entry?'],
      ['del.confirm', TH.del.confirm, 'Delete entry'],
    ]],
    ['Tabs', [
      ['tab.home / timeline', TH.tab.home + ' / ' + TH.tab.timeline, 'Home / Timeline'],
      ['tab.grow / care / settings', TH.tab.grow + ' / ' + TH.tab.care + ' / ' + TH.tab.settings, 'Growth / Family / Settings'],
    ]],
  ];
  return (
    <div className="mc-wrap">
      {groups.map(([g, rows]) => (
        <React.Fragment key={g}>
          <div className="mc-group-h">{g}</div>
          <table className="mc-tbl"><tbody>
            {rows.map(([k, thv, env]) => (
              <tr key={k}><td className="key">{k}</td><td><span className="th-val" lang="th">{thv}</span><span className="en-val">{env}</span></td></tr>
            ))}
          </tbody></table>
        </React.Fragment>
      ))}
    </div>
  );
}

function SectionMicrocopy() {
  return (
    <section className="section" id="microcopy">
      <div className="wrap">
        <p className="eyebrow">03 · Microcopy</p>
        <h2 className="section-title">Every string, written from intent</h2>
        <p className="section-desc">A keyed sheet of all UI copy — <b>written in Thai, not translated</b> — matching the string IDs in Dev’s components so it drops straight into <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>locales/th.json</code> (full file delivered separately). English shown only as intent reference. A representative slice:</p>
        <div style={{ height: 22 }} />
        <MicrocopyTable />
        <div className="note" style={{ marginTop: 20, maxWidth: 680 }}>
          <span className="tag">Two ideas changed, not translated</span>
          <b>Diaper</b> uses ‘ฉี่ / อึ’ — the warm child-words Thai families use — instead of clinical ‘ปัสสาวะ / อุจจาระ’. <b>Eat</b> is ‘ให้นม’ (to feed), the natural Thai for a 0–6mo baby, rather than a literal ‘กิน’. Both are intent rewrites; flagging so they aren’t “corrected” back to dictionary translations.
        </div>
      </div>
    </section>
  );
}

// ---- Part B: the five clarifications ----
function Clar({ n, q, dev, verdict, verdictText, children }) {
  return (
    <div className="clar">
      <div className="clar-head">
        <span className="clar-num">{n}</span>
        <span><span className="q" style={{ display: 'block' }}>{q}</span><span className="askedby">Dev built: {dev}</span></span>
      </div>
      <div className="clar-body">
        <div><span className={'clar-verdict ' + verdict}>{verdict === 'keep' ? <IcCheck size={14} /> : <IcEdit size={13} />}{verdictText}</span></div>
        {children}
      </div>
    </div>
  );
}
const Spec = ({ children }) => <div className="spec">{children}</div>;
const ThaiQuote = ({ th, en }) => <div className="thai-quote" lang="th">{th}<span className="en">{en}</span></div>;

function SectionClarifications() {
  return (
    <section className="section" id="clarifications">
      <div className="wrap">
        <p className="eyebrow">04 · Dev clarifications</p>
        <h2 className="section-title">The five questions, resolved</h2>
        <p className="section-desc">Each of Dev’s Phase-2 calls confirmed or corrected with the same precision as the original behavior specs — and now in Thai, so Phase 3 (copying Eat → Sleep/Diaper) starts unambiguous.</p>
        <div style={{ height: 26 }} />
        <div style={{ display: 'grid', gap: 18 }}>

          <Clar n="1" q="Concurrency prompt copy for instant-log Eat" dev='"X logged a feed Ns ago — view theirs / log another"' verdict="keep" verdictText="Shape confirmed · final Thai below">
            <Spec><b>Trigger:</b> when saving an Eat, if a <i>different</i> caregiver logged an Eat within the last <b>60s</b> (known from realtime), show this sheet <b>before</b> committing — so we don’t create an accidental duplicate. If offline (can’t know), just commit; reconcile on sync.</Spec>
            <Spec><b>Three outcomes:</b> ‘ดูรายการนั้น’ opens the existing entry, writes nothing (default, safest). ‘บันทึกเพิ่มอีกรายการ’ commits a second entry. Tap-scrim = cancel, no write. Non-blocking, dismissible — never an error.</Spec>
            <ThaiQuote th={'หัวเรื่อง: “มีคนบันทึกไปแล้ว”  ·  เนื้อหา: “คุณแม่ เพิ่งบันทึกการให้นมไปเมื่อ 40 วินาที ที่แล้ว จะดูรายการนั้น หรือบันทึกเพิ่ม?”'} en={'Title + body, parameterised by {name} and {dur}.'} />
            <ThaiQuote th={'ปุ่มหลัก: “ดูรายการนั้น”   ·   ปุ่มรอง: “บันทึกเพิ่มอีกรายการ”'} en={'Primary: View theirs · Secondary: Log another anyway'} />
          </Clar>

          <Clar n="2" q="“Synced” pill persistence" dev="flashes ~2.2s after a queued row syncs, then hides" verdict="keep" verdictText="Confirmed — 2.2s flash, then gone">
            <Spec><b>Rule:</b> ‘synced’ is the expected state, so it needs <i>no</i> permanent chrome. Only the exception — <b>‘รอซิงค์’ (queued)</b> — shows a persistent pill with a spinner. On queued→synced, show ‘ซิงค์แล้ว’ ✓ for <b>2.2s (ease-out), then remove</b>. No on-hover reveal; no always-on badge. Keeps the timeline quiet.</Spec>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="queued-pill" lang="th"><span className="spin-sm" /> {TH.sync.queued}</span>
              <span className="queued-pill synced-pill" lang="th"><IcCheck size={11} /> {TH.sync.synced}</span>
              <span style={{ fontSize: 12.5, color: 'var(--fg-muted)', alignSelf: 'center' }}>→ then nothing (steady state)</span>
            </div>
          </Clar>

          <Clar n="3" q="First-run Home empty state" dev="normal Eat card with a “No feeds yet” hint" verdict="change" verdictText="Phase 3 → use the dashed-ghost treatment">
            <Spec><b>Decision:</b> when the baby has <b>zero</b> activity of any kind, Home shows the <b>dashed ghost cards</b> (all three verbs, muted icon, ‘+’ affordance) — it reads as “these are all tappable, start here.” The moment any entry exists, switch to the normal populated cards. Dev’s single-card-with-hint was a fine Phase-2 interim (only Eat existed); Phase 3 has all three, so the ghost treatment is canonical.</Spec>
            <ThaiQuote th={'ให้นม → “ยังไม่มีบันทึก — แตะเพื่อบันทึก”   ·   การนอน → “เริ่มจับเวลานอน”   ·   ผ้าอ้อม → “บันทึกการเปลี่ยนครั้งแรก”'} en={'Ghost-card hints per verb (see Home · first run above).'} />
          </Clar>

          <Clar n="4" q="Eat “When” time-edit affordance" dev='defaulted to "now"; deferred time-editing' verdict="change" verdictText="v1 should allow back-dating">
            <Spec><b>Decision:</b> <b>yes — allow editing the time in v1.</b> In a Thai multi-caregiver household, grandparents and nannies routinely log <i>after</i> the fact (“fed her 30 min ago, forgot to tap”). Without back-dating, the timeline drifts from reality and trust erodes.</Spec>
            <Spec><b>How, without slowing the 2-tap path:</b> the ‘เวลา’ row keeps an ‘แก้ไข’ affordance → opens a native time/date input, <b>default = now</b>, <b>capped at not-in-future</b>. Happy path is untouched (don’t tap it = ‘ตอนนี้’). This applies to Eat now and becomes essential when Phase 3 adds Sleep/Diaper manual entry.</Spec>
            <Spec style={{ color: 'var(--fg-muted)' }}><b>⚑ Scope note for PM:</b> this is a small addition beyond Dev’s Phase-2 deferral — logged as a proposal, not a silent override.</Spec>
          </Clar>

          <Clar n="5" q="Online/Offline chip in Home header" dev="manual QA toggle, not in the design" verdict="change" verdictText="Split: auto status (ship) vs manual toggle (dev-only)">
            <Spec><b>Decision:</b> separate the two things the chip currently conflates. <b>Ship</b> an automatic, read-only <b>status indicator</b> that appears <i>only</i> when actually offline or syncing — a quiet ‘ออฟไลน์ · บันทึกในเครื่อง’ banner. When online &amp; synced, show nothing (no header noise). <b>Demote</b> the manual force-offline switch to a <b>dev/QA-only</b> tool behind a debug flag — it never ships to parents.</Spec>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="netbar off" lang="th" style={{ fontSize: 12 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />{TH.sync.offlineBanner}</span>
              <span style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>online state → no indicator</span>
            </div>
          </Clar>

        </div>
      </div>
    </section>
  );
}

function SectionConsent() {
  const c = TH.consent;
  return (
    <section className="section" id="consent">
      <div className="wrap">
        <p className="eyebrow">05 · PDPA &amp; onboarding</p>
        <h2 className="section-title">Consent, in plain Thai</h2>
        <p className="section-desc">Thailand’s PDPA requires a privacy notice + explicit consent at signup. Written for a sleep-deprived parent, not a lawyer — four short sentences, with a link to the full policy (PM/CPO own the full text).</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,360px) 1fr', gap: 32, alignItems: 'start', marginTop: 24 }}>
          <PhoneFrame theme="light">
            <div className="screen-body" lang="th" style={{ paddingTop: 12 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <LamoonWordmark size={26} />
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 6 }} lang="th">{TH.auth.tagline}</div>
              </div>
              <div className="field"><label>{TH.auth.nameLabel}</label><input className="input" placeholder={TH.auth.namePlaceholder} /></div>
              <div className="field"><label>{TH.auth.emailLabel}</label><input className="input" placeholder={TH.auth.emailPlaceholder} /></div>
              <Button kind="primary" size="lg" block>{TH.auth.createAccount}</Button>
              <div className="consent" style={{ marginTop: 14 }}>
                <div className="ct">{c.line1} {c.line2} {c.line3} {c.line4} <a href="#consent">{c.readFull}</a></div>
              </div>
            </div>
          </PhoneFrame>
          <div>
            <div className="subhead" style={{ marginTop: 0 }}>The four lines</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[[c.line1, 'Data is for your family only; we don’t sell it.'], [c.line2, 'Encrypted, stored securely in Singapore.'], [c.line3, 'View, export, or delete anytime.'], [c.line4, 'Creating an account = accepting the privacy policy.']].map(([th, en], i) => (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                  <div lang="th" style={{ fontFamily: "'Anuphan',sans-serif", fontSize: 14.5 }}>{th}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>{en}</div>
                </div>
              ))}
            </div>
            <div className="note" style={{ marginTop: 16 }}><span className="tag">Positioning line (Q3)</span><span lang="th" style={{ fontFamily: "'Anuphan',sans-serif", fontSize: 15 }}>{TH.brand.positioning}</span> — <span style={{ color: 'var(--fg-muted)' }}>“simple baby tracker, made for Thai families.”</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionMicrocopy, SectionClarifications, SectionConsent });
