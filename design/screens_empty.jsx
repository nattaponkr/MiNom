// screens_empty.jsx — empty & first-run states for Home, Timeline, Growth
function EmptyState({ icon, title, body, cta }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, padding: '30px 18px' }}>
      <span style={{ width: 68, height: 68, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: 'var(--fg-faint)' }}>{icon}</span>
      <div style={{ fontWeight: 800, fontSize: 17 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.5, maxWidth: 240 }}>{body}</div>
      {cta && <div style={{ marginTop: 6 }}>{cta}</div>}
    </div>
  );
}

function EmptyHome({ filled }) {
  const Ghost = ({ verb, name, hint }) => {
    const Ic = VERB_ICON[verb];
    return (
      <button className="verb-card" style={{ borderStyle: 'dashed', background: 'transparent' }}>
        <span className={'verb-ic ' + verb} style={{ opacity: 0.55 }}><Ic size={28} filled={filled} /></span>
        <span className="verb-meta"><span className="verb-name">{name}</span><span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg-faint)' }}>{hint}</span></span>
        <span className="verb-go" style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}><IcPlus size={18} /></span>
      </button>
    );
  };
  return (
    <>
      <div className="screen-body">
        <div className="appbar"><span><span className="ttl">Mina</span><span className="sub">Welcome — let’s log a first moment</span></span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Ghost verb="eat" name="Eat" hint="No feeds yet — tap to log" />
          <Ghost verb="sleep" name="Sleep" hint="Start a sleep timer" />
          <Ghost verb="diaper" name="Diaper" hint="Log the first change" />
        </div>
        <div className="note" style={{ marginTop: 16, fontSize: 12.5 }}><b>Tip:</b> invite a partner or nanny from Family so you’re both tracking the same baby.</div>
      </div>
      <TabBar active="home" />
    </>
  );
}

function EmptyTimeline() {
  return (
    <>
      <div className="screen-body">
        <div className="appbar"><span><span className="ttl">Timeline</span><span className="sub">Today</span></span></div>
        <EmptyState icon={<IcList size={30} />} title="Nothing logged today" body="Activities you and other caregivers log will appear here, newest first." />
      </div>
      <TabBar active="timeline" />
    </>
  );
}

function EmptyGrowth() {
  return (
    <>
      <div className="screen-body">
        <div className="appbar"><span className="ttl">Growth</span><span className="spacer" /><button className="iconbtn"><IcPlus size={22} /></button></div>
        <EmptyState icon={<IcGrow size={30} />} title="No measurements yet"
          body="Add Mina’s weight and height to plot them on the WHO percentile curve."
          cta={<Button kind="primary" icon={<IcPlus size={18} />}>Add first measurement</Button>} />
      </div>
      <TabBar active="grow" />
    </>
  );
}

Object.assign(window, { EmptyState, EmptyHome, EmptyTimeline, EmptyGrowth });
