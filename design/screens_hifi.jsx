// screens_hifi.jsx — the four priority hi-fi screens (Home, Eat, Sleep, Diaper)
// Props carry tweak state: filled (icon style), homeLayout, eatDetails, annotate.
const { useState: useStateH } = React;

function TabBar({ active = 'home' }) {
  const tabs = [
    ['home', 'Home', IcEat], ['timeline', 'Timeline', IcList],
    ['grow', 'Growth', IcGrow], ['care', 'Family', IcUsers], ['settings', 'Settings', IcGear],
  ];
  return (
    <div className="tabbar">
      {tabs.map(([id, label, Ic]) => (
        <button key={id} className={'tab' + (id === active ? ' on' : '')}>
          <Ic size={22} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function CareStack() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {['Mom', 'Dad', 'Nanny'].map((n, i) => (
        <span key={n} style={{ marginLeft: i ? -8 : 0, border: '2px solid var(--bg)', borderRadius: '50%', display: 'inline-flex' }}>
          <Avatar name={n} size="lg" />
        </span>
      ))}
    </div>
  );
}

// ---------------- HOME ----------------
function HomeScreen({ filled, homeLayout = 'cards', live = true }) {
  const VC = ({ verb, name, stat, unit, isLive, by }) => {
    const Ic = VERB_ICON[verb];
    return (
      <button className={'verb-card' + (isLive ? ' live' : '')}>
        <span className={'verb-ic ' + verb}><Ic size={28} filled={filled} /></span>
        <span className="verb-meta">
          <span className="verb-name">{name}</span>
          <span className="verb-stat" style={{ display: 'block' }}>
            {isLive && <span className="pulse-dot" />}{stat} <span className="u">{unit}</span>
          </span>
          {by && <span className="who"><Avatar name={by} /><span className="nm">by {by}</span></span>}
        </span>
        <span className="verb-go"><IcChevR size={18} /></span>
      </button>
    );
  };

  if (homeLayout === 'thumb') {
    return (
      <>
        <div className="screen-body">
          <div className="appbar">
            <span><span className="ttl">Mina</span><span className="sub">4 months · today</span></span>
            <span className="spacer" />
            <CareStack />
          </div>
          <div className="hero" style={{ marginBottom: 14 }}>
            <span className="k">Last fed</span>
            <div className="big">1h 12m<span style={{ fontSize: 18, color: 'var(--fg-muted)' }}> ago</span></div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Asleep now · 22m · Diaper 2h ago</div>
          </div>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 2px 10px' }}>Quick log</div>
          <div className="thumb-trio">
            {[['eat', 'Eat'], ['sleep', 'Sleep'], ['diaper', 'Diaper']].map(([v, n]) => {
              const Ic = VERB_ICON[v];
              return <button key={v} className="thumb-btn"><span className={'tb-ic ' + v}><Ic size={26} filled={filled} /></span><span className="tb-name">{n}</span></button>;
            })}
          </div>
        </div>
        <TabBar active="home" />
      </>
    );
  }

  // default: stacked cards
  return (
    <>
      <div className="screen-body">
        <div className="appbar">
          <span><span className="ttl">Mina</span><span className="sub">4 months · Saturday</span></span>
          <span className="spacer" />
          <CareStack />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <VC verb="eat" name="Eat" stat="1h 12m" unit="ago" by="Dad" />
          <VC verb="sleep" name="Sleep" stat="22m" unit="asleep" isLive={live} />
          <VC verb="diaper" name="Diaper" stat="2h 04m" unit="ago" by="Nanny" />
        </div>
      </div>
      <TabBar active="home" />
    </>
  );
}

// ---------------- EAT ----------------
function EatScreen({ filled, eatDetails = 'inline' }) {
  const Details = (
    <>
      <div className="field">
        <label>Amount <span style={{ fontWeight: 500, color: 'var(--fg-faint)' }}>· optional</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="iconbtn" style={{ background: 'var(--surface-2)', width: 48, height: 48 }}><IcChevL size={18} /></button>
          <span className="mono" style={{ fontSize: 26, fontWeight: 600, minWidth: 92, textAlign: 'center' }}>120 <span style={{ fontSize: 15, color: 'var(--fg-muted)' }}>ml</span></span>
          <button className="iconbtn" style={{ background: 'var(--surface-2)', width: 48, height: 48 }}><IcPlus size={18} /></button>
        </div>
      </div>
      <div className="field">
        <label>What</label>
        <div className="chiprow"><span className="chip on">Milk</span><span className="chip">Food</span></div>
      </div>
      <div className="field">
        <label>Source</label>
        <div className="chiprow"><span className="chip">Breast L</span><span className="chip on">Breast R</span><span className="chip">Bottle</span><span className="chip">Solid</span></div>
      </div>
      <div className="field" style={{ marginBottom: 4 }}>
        <label>Notes</label>
        <input className="input" placeholder="Anything to remember…" />
      </div>
    </>
  );
  return (
    <>
      <div className="sheet-handle" />
      <div className="screen-body" style={{ paddingTop: 2 }}>
        <div className="appbar" style={{ paddingBottom: 6 }}>
          <span className="verb-ic eat" style={{ width: 40, height: 40, borderRadius: 13 }}><IcEat size={22} filled={filled} /></span>
          <span className="ttl">Eat</span>
          <span className="spacer" />
          <button className="iconbtn"><IcX size={22} /></button>
        </div>
        <button style={{ width: '100%', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span className="verb-go" style={{ background: 'var(--eat-tint)', color: 'var(--eat)' }}><IcClock size={20} /></span>
          <span><span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>When</span><span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>Now · 9:41 PM</span></span>
          <span className="spacer" />
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>Edit</span>
        </button>

        {eatDetails === 'inline'
          ? <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '2px 16px 6px' }}>
              <Expander label="Details" open={true}>{Details}</Expander>
            </div>
          : <button className="verb-card" style={{ minHeight: 0, padding: '15px 16px', marginBottom: 4 }}>
              <span className="verb-meta"><span className="verb-name" style={{ textTransform: 'none', fontSize: 15, color: 'var(--fg)' }}>Add details</span><span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg-muted)' }}>Amount, milk or food, source, notes</span></span>
              <span className="verb-go"><IcChevR size={18} /></span>
            </button>}

        <div style={{ height: 12 }} />
        <Button kind="primary" size="lg" icon={<IcCheck size={20} />}>Save feed</Button>
        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

// ---------------- SLEEP ----------------
function SleepScreen({ filled, running = false }) {
  return (
    <>
      <div className="sheet-handle" />
      <div className="screen-body" style={{ paddingTop: 2 }}>
        <div className="appbar" style={{ paddingBottom: 6 }}>
          <span className="verb-ic sleep" style={{ width: 40, height: 40, borderRadius: 13 }}><IcSleep size={22} filled={filled} /></span>
          <span className="ttl">Sleep</span>
          <span className="spacer" />
          <button className="iconbtn"><IcX size={22} /></button>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '30px 20px 26px', textAlign: 'center', marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>
          {running ? (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sleep)', textTransform: 'uppercase', letterSpacing: '0.1em' }}><span className="pulse-dot" />Sleeping</div>
              <div className="mono" style={{ fontSize: 46, fontWeight: 600, letterSpacing: '-0.03em', margin: '8px 0 4px' }}>00:22:14</div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Started 9:19 PM by Mom</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Awake 1h 40m</div>
              <div className="mono" style={{ fontSize: 46, fontWeight: 600, letterSpacing: '-0.03em', margin: '8px 0 4px', color: 'var(--fg-faint)' }}>00:00:00</div>
              <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Tap start when she drifts off</div>
            </>
          )}
        </div>

        {running
          ? <Button kind="primary" size="lg" icon={<IcStop size={20} />} style={{ background: 'var(--sleep)' }}>Stop sleep</Button>
          : <Button kind="primary" size="lg" icon={<IcPlay size={18} />} style={{ background: 'var(--sleep)' }}>Start sleep</Button>}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', fontWeight: 700, fontSize: 14 }}>Enter time manually</button>
        </div>
      </div>
    </>
  );
}

// ---------------- DIAPER ----------------
function DiaperScreen({ filled, sel = 'wet' }) {
  const opts = [['wet', 'Wet', IcDrop], ['dirty', 'Dirty', IcLeaf], ['both', 'Both', null]];
  return (
    <>
      <div className="sheet-handle" />
      <div className="screen-body" style={{ paddingTop: 2 }}>
        <div className="appbar" style={{ paddingBottom: 10 }}>
          <span className="verb-ic diaper" style={{ width: 40, height: 40, borderRadius: 13 }}><IcDiaper size={22} filled={filled} /></span>
          <span className="ttl">Diaper</span>
          <span className="spacer" />
          <button className="iconbtn"><IcX size={22} /></button>
        </div>

        <div className="seg" style={{ marginBottom: 14 }}>
          {opts.map(([id, label, Ic]) => (
            <button key={id} className={'seg-opt' + (id === sel ? ' on diaper' : '')}>
              <span className="si">{Ic ? <Ic size={24} filled={id === sel} /> : <span style={{ display: 'flex', gap: 2 }}><IcDrop size={18} filled={id === sel} /><IcLeaf size={18} filled={id === sel} /></span>}</span>
              {label}
            </button>
          ))}
        </div>

        <button style={{ width: '100%', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span className="verb-go" style={{ background: 'var(--diaper-tint)', color: 'var(--diaper)' }}><IcClock size={20} /></span>
          <span><span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>When</span><span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>Now · 9:41 PM</span></span>
          <span className="spacer" />
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>Edit</span>
        </button>

        <Button kind="primary" size="lg" icon={<IcCheck size={20} />}>Save diaper</Button>
        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

Object.assign(window, { TabBar, HomeScreen, EatScreen, SleepScreen, DiaperScreen, CareStack });
