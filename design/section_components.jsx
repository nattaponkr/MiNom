// section_components.jsx — v1 design-system stub for dev handoff
function Card({ title, desc, children, wide }) {
  return (
    <div className={'spec-card' + (wide ? ' wide' : '')}>
      <div className="gal-h">{title}</div>
      {desc && <div className="gal-d">{desc}</div>}
      {children}
    </div>
  );
}

function TypeScale() {
  const rows = [
    ['Display / 36 · 800', 'var(--t-display)', 800, 'Mina'],
    ['H1 / 28 · 800', 'var(--t-h1)', 800, 'Today'],
    ['H2 / 22 · 700', 'var(--t-h2)', 700, 'Add caregiver'],
    ['Body / 16 · 400', 'var(--t-body)', 400, 'Tap a card to log an activity.'],
    ['Small / 14 · 600', 'var(--t-sm)', 600, 'Logged by Dad · 9:41 PM'],
    ['Caption / 12 · 700', 'var(--t-cap)', 700, 'LAST FED'],
  ];
  return (
    <Card title="Type scale" desc="Hanken Grotesk for everything; Spline Sans Mono for times, durations & amounts (tabular)." wide>
      {rows.map(([spec, size, w, sample]) => (
        <div className="type-row" key={spec}>
          <span className="spec">{spec}</span>
          <span style={{ fontSize: size, fontWeight: w, letterSpacing: '-0.01em' }}>{sample}</span>
        </div>
      ))}
      <div className="type-row"><span className="spec">Numerals / mono</span><span className="mono" style={{ fontSize: 30, fontWeight: 600 }}>1h 12m · 00:22:14 · 120 ml</span></div>
    </Card>
  );
}

function Swatch({ name, varname }) {
  return (
    <div className="sw">
      <div className="chip" style={{ background: `var(${varname})` }} />
      <div className="lab"><span className="n">{name}</span><span className="v">{varname}</span></div>
    </div>
  );
}

function ColorTokens() {
  const ThemeCol = ({ theme, label, icon }) => (
    <div className="theme-box" data-theme={theme} style={{ background: 'var(--bg)' }}>
      <div className="th-cap" style={{ color: 'var(--fg)' }}>{icon} {label}</div>
      <div className="sw-grid">
        <Swatch name="bg" varname="--bg" /><Swatch name="surface" varname="--surface" />
        <Swatch name="fg" varname="--fg" /><Swatch name="muted" varname="--fg-muted" />
        <Swatch name="primary" varname="--primary" /><Swatch name="border" varname="--border" />
        <Swatch name="eat" varname="--eat" /><Swatch name="sleep" varname="--sleep" />
        <Swatch name="diaper" varname="--diaper" /><Swatch name="grow" varname="--grow" />
        <Swatch name="good" varname="--good" /><Swatch name="danger" varname="--danger" />
      </div>
    </div>
  );
  return (
    <Card title="Color tokens — light + dark" desc="Warm neutrals, one clay primary, four soft verb hues (same lightness/chroma, hue varies). Every token has a dark counterpart; contrast meets AA in both." wide>
      <div className="theme-cols">
        <ThemeCol theme={undefined} label="Light" icon={<IcSun size={16} />} />
        <ThemeCol theme="dark" label="Dark" icon={<IcMoon size={16} />} />
      </div>
    </Card>
  );
}

function SpacingScale() {
  const steps = [['s1', 4], ['s2', 8], ['s3', 12], ['s4', 16], ['s5', 20], ['s6', 24], ['s7', 32], ['s8', 40], ['s9', 48], ['s10', 64]];
  return (
    <Card title="Spacing — 4px base" desc="Multiples of 4. s4 (16) is the default gutter.">
      {steps.map(([n, px]) => (
        <div className="space-row" key={n}><span className="lab">{n} · {px}px</span><span className="bar" style={{ width: px }} /></div>
      ))}
    </Card>
  );
}

function RadiiShadow() {
  return (
    <Card title="Radii & elevation">
      <div className="state-lab" style={{ marginBottom: 8 }}>RADIUS</div>
      <div className="tile-row" style={{ marginBottom: 18 }}>
        {[['sm', 8], ['md', 12], ['lg', 16], ['xl', 22], ['pill', 999]].map(([n, r]) => (
          <div className="tile" key={n}><div className="box" style={{ borderRadius: r }} /><div className="cap">{n}</div></div>
        ))}
      </div>
      <div className="state-lab" style={{ marginBottom: 8 }}>SHADOW</div>
      <div className="tile-row">
        {[['sm', 'var(--shadow-sm)'], ['md', 'var(--shadow-md)'], ['lg', 'var(--shadow-lg)']].map(([n, s]) => (
          <div className="tile" key={n}><div className="box sh" style={{ borderRadius: 12, boxShadow: s }} /><div className="cap">{n}</div></div>
        ))}
      </div>
    </Card>
  );
}

function ButtonStates() {
  return (
    <Card title="Button — states" desc="Primary CTA. Min height 52px (≥48px tap target). Loading keeps width to avoid layout shift.">
      <div className="state-grid">
        <div className="state-cell"><span className="state-lab">default</span><Button kind="primary">Save feed</Button></div>
        <div className="state-cell"><span className="state-lab">active / press</span><Button kind="primary" style={{ background: 'var(--primary-press)', transform: 'scale(0.98)' }}>Save feed</Button></div>
        <div className="state-cell"><span className="state-lab">loading</span><Button kind="primary" loading>Saving</Button></div>
        <div className="state-cell"><span className="state-lab">disabled</span><Button kind="primary" disabled>Save feed</Button></div>
      </div>
      <div className="state-grid" style={{ marginTop: 14 }}>
        <div className="state-cell"><span className="state-lab">secondary</span><Button kind="ghost">Cancel</Button></div>
        <div className="state-cell"><span className="state-lab">danger</span><Button kind="danger" icon={<IcTrash size={18} />}>Delete</Button></div>
      </div>
    </Card>
  );
}

function InputStates() {
  return (
    <Card title="Input — states">
      <div className="field"><label>Default</label><input className="input" placeholder="baby@email.com" /></div>
      <div className="field"><label>Focused</label><input className="input" defaultValue="anna@email.com" style={{ borderColor: 'var(--primary)', boxShadow: '0 0 0 4px color-mix(in oklch, var(--primary) 18%, transparent)' }} /></div>
      <div className="field" style={{ marginBottom: 0 }}><label>Error</label><input className="input err" defaultValue="anna@email" /><span className="input-help err"><IcX size={13} /> Enter a valid email address</span></div>
    </Card>
  );
}

function LastXCard() {
  return (
    <Card title="“Last X ago” card" desc="The core status object on Home. Whole card is the tap target → opens the log sheet.">
      <button className="verb-card" style={{ maxWidth: 320 }}>
        <span className="verb-ic eat"><IcEat size={28} /></span>
        <span className="verb-meta">
          <span className="verb-name">Eat</span>
          <span className="verb-stat" style={{ display: 'block' }}>1h 12m <span className="u">ago</span></span>
          <span className="who"><Avatar name="Dad" /><span className="nm">by Dad</span></span>
        </span>
        <span className="verb-go"><IcChevR size={18} /></span>
      </button>
      <div style={{ height: 10 }} />
      <button className="verb-card live" style={{ maxWidth: 320 }}>
        <span className="verb-ic sleep"><IcSleep size={28} /></span>
        <span className="verb-meta"><span className="verb-name">Sleep</span><span className="verb-stat" style={{ display: 'block' }}><span className="pulse-dot" />22m <span className="u">asleep</span></span></span>
        <span className="verb-go"><IcChevR size={18} /></span>
      </button>
    </Card>
  );
}

function ActivityRowSpec() {
  const Row = ({ verb, title, sub, who, time }) => {
    const Ic = VERB_ICON[verb];
    return (
      <div className="act-row">
        <span className={'act-ic ' + verb}><Ic size={22} /></span>
        <span className="act-main"><span className="act-title">{title}</span><span className="act-sub">{sub}</span>
          <span className="who"><Avatar name={who} /><span className="nm">{who}</span></span></span>
        <span className="act-time">{time}</span>
      </div>
    );
  };
  return (
    <Card title="Activity row + attribution" desc="Timeline unit. Actor avatar/initials are present but quiet — never competes with the activity." wide>
      <div style={{ maxWidth: 520 }}>
        <Row verb="sleep" title="Sleep · 1h 32m" sub="Ended 9:05 PM" who="Mom" time="7:33 PM" />
        <Row verb="eat" title="Eat · 120 ml, breast R" sub="" who="Dad" time="8:21 PM" />
        <Row verb="diaper" title="Diaper · wet" sub="" who="Nanny" time="8:40 PM" />
      </div>
    </Card>
  );
}

function ChartSpec() {
  return (
    <Card title="Percentile chart placeholder" desc="WHO weight/height curves. Dashed = percentile bands; solid clay = this baby. Real chart lib in dev.">
      <PercentileChart accent="var(--grow)" />
    </Card>
  );
}

function SectionComponents() {
  return (
    <section className="section" id="components">
      <div className="wrap">
        <p className="eyebrow">06 · Component stub</p>
        <h2 className="section-title">A v1 system to build from</h2>
        <p className="section-desc">Enough that a developer doesn’t have to re-decide. Tokens, type, spacing, and every primary-flow component with its states. <b>Not definitive</b> — we’ll harden it after the build proves it out.</p>
        <div style={{ height: 26 }} />
        <div className="gal">
          <TypeScale />
          <ColorTokens />
          <SpacingScale />
          <RadiiShadow />
          <ButtonStates />
          <InputStates />
          <LastXCard />
          <ActivityRowSpec />
          <ChartSpec />
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionComponents });
