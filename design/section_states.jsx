// section_states.jsx — "States, feedback & motion"
function MotionSpec() {
  const rows = [
    ['Card press', '120ms', 'ease-out', 'scale 0.985'],
    ['Sheet slide-up', '320ms', 'ease-out', 'translateY 100%→0'],
    ['Snackbar in', '320ms', 'ease-out', 'rise + fade'],
    ['Toast in', '200ms', 'ease-out', 'drop + fade'],
    ['Sync row arrival', '320ms', 'ease-out', 'tint → settle'],
    ['Success pop', '320ms', 'spring', 'scale 0.6→1'],
    ['Presence bump', '200ms', 'spring', 'scale 1→1.18→1'],
  ];
  return (
    <div className="spec-card">
      <div className="gal-h">Motion</div>
      <div className="gal-d">Quick and calm. Nothing on the log path waits on animation. Respects <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>prefers-reduced-motion</code>.</div>
      {rows.map(([n, d, e, what]) => (
        <div className="motion-row" key={n}>
          <span className="motion-dot" />
          <span className="m-name">{n}</span>
          <span className="m-spec">{d} · {e}</span>
        </div>
      ))}
    </div>
  );
}

function ToastCatalog() {
  return (
    <div className="spec-card">
      <div className="gal-h">Feedback channels</div>
      <div className="gal-d">Three weights of feedback, matched to stakes.</div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="toast ok" style={{ position: 'static' }}><IcCheck size={15} /> Saved · low stakes, auto-dismiss 2.5s</div>
        <div className="toast info" style={{ position: 'static' }}><Avatar name="Dad" /> Dad added a feed · presence/sync news</div>
        <div className="toast err" style={{ position: 'static' }}><IcX size={15} /> Couldn’t save — retrying… · errors persist + retry</div>
        <div className="snackbar" style={{ position: 'static' }}><IcCheck size={16} /> Action + undo<button className="undo">UNDO</button></div>
      </div>
      <div className="gal-d" style={{ marginTop: 12, marginBottom: 0 }}>Order of escalation: silent optimistic → snackbar w/ undo → toast → blocking sheet (only for destructive/irreversible).</div>
    </div>
  );
}

function Microcopy() {
  const rows = [
    ['Home, no data yet', 'No feeds yet — tap to log'],
    ['Sleep idle hint', 'Tap start when she drifts off'],
    ['Eat notes placeholder', 'Anything to remember…'],
    ['Empty timeline', 'Nothing logged today'],
    ['Offline banner', 'Offline · changes saved on this device'],
    ['Concurrency prompt', 'Someone’s already on it'],
    ['Delete confirm', 'Delete this entry? It can’t be undone.'],
    ['Invite helper', 'We’ll email an invite link, valid for 14 days.'],
    ['Save success', 'Saved'],
    ['Save error', 'Couldn’t save — retrying…'],
  ];
  return (
    <div className="spec-card wide">
      <div className="gal-h">Microcopy</div>
      <div className="gal-d">Plain, warm, never baby-talk. Says what to do; owns errors without blame.</div>
      <table className="copytbl">
        <thead><tr><th>Context</th><th>Copy</th></tr></thead>
        <tbody>{rows.map(([c, q]) => <tr key={c}><td className="ctx">{c}</td><td><span className="q">“{q}”</span></td></tr>)}</tbody>
      </table>
    </div>
  );
}

function SectionStates({ filled }) {
  return (
    <section className="section" id="states">
      <div className="wrap">
        <p className="eyebrow">05 · States, feedback &amp; motion</p>
        <h2 className="section-title">The parts a screenshot can’t show</h2>
        <p className="section-desc">Everything a developer needs to build the <b>behavior</b>, not just the layout: loading, empty, optimistic writes, real-time sync, offline, concurrency, destructive confirms, validation, motion and microcopy. <b>The demos below are live</b> — tap them.</p>

        <div className="subhead">Empty &amp; first-run</div>
        <div className="phones">
          <div className="phone-cell"><PhoneFrame theme="light"><EmptyHome filled={filled} /></PhoneFrame><span className="phone-cap"><span className="t">Home · first run</span><span className="d">Dashed cards invite the first log; no fake data.</span></span></div>
          <div className="phone-cell"><PhoneFrame theme="dark"><EmptyTimeline /></PhoneFrame><span className="phone-cap"><span className="t">Timeline · empty</span><span className="d">Explains what will appear, in dark.</span></span></div>
          <div className="phone-cell"><PhoneFrame theme="light"><EmptyGrowth /></PhoneFrame><span className="phone-cap"><span className="t">Growth · empty</span><span className="d">Single clear CTA to the first measurement.</span></span></div>
        </div>

        <div className="subhead">Live interaction demos</div>
        <div className="gal">
          <DemoOptimisticUndo />
          <DemoSaveButton />
          <DemoSync />
          <DemoOffline />
          <DemoConcurrency />
          <DemoDelete />
          <DemoValidation />
          <DemoSkeleton />
        </div>

        <div className="subhead">Motion, feedback &amp; words</div>
        <div className="gal">
          <MotionSpec />
          <ToastCatalog />
          <Microcopy />
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionStates, MotionSpec, ToastCatalog, Microcopy });
