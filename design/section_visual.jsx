// section_visual.jsx — visual direction (Warm & Soft, light + dark)
function Principle({ t, d }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontWeight: 800, fontSize: 15 }}>{t}</div>
      <div style={{ fontSize: 13.5, color: 'var(--fg-muted)', marginTop: 3, lineHeight: 1.5 }}>{d}</div>
    </div>
  );
}

function SectionVisual({ filled, homeLayout }) {
  return (
    <section className="section" id="visual">
      <div className="wrap">
        <p className="eyebrow">04 · Visual direction</p>
        <h2 className="section-title">Warm &amp; Soft</h2>
        <p className="section-desc">Designed for a tired adult at 3am, not for a nursery wall. <b>Warm paper neutrals, one clay primary, four gentle verb hues.</b> Calm, modern, competent — no rattles, no pastel clouds. We explored a cooler “clinical” direction and set it aside: it read efficient but cold, and this app lives in soft moments.</p>

        <div className="note" style={{ margin: '20px 0 30px', maxWidth: 660 }}>
          <span className="tag">Why dark is non-negotiable</span>
          Parents use this in dark rooms, mid-night, one eye open. A bright white screen is a documented churn risk — so dark mode is a first-class design, not an inversion. Equivalent hierarchy, AA contrast, warm (not blue-black) darks that don’t jar at 3am.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 40, alignItems: 'start' }}>
          <div className="mode-pair">
            <div className="phone-cell">
              <PhoneFrame theme="light"><HomeScreen filled={filled} homeLayout={homeLayout} /></PhoneFrame>
              <span className="phone-cap"><span className="d" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IcSun size={14} /> Light · warm paper</span></span>
            </div>
            <div className="phone-cell">
              <PhoneFrame theme="dark"><HomeScreen filled={filled} homeLayout={homeLayout} /></PhoneFrame>
              <span className="phone-cap"><span className="d" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IcMoon size={14} /> Dark · warm charcoal</span></span>
            </div>
          </div>

          <div>
            <div className="subhead" style={{ marginTop: 0 }}>The palette</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              {[['Clay', 'var(--primary)'], ['Eat', 'var(--eat)'], ['Sleep', 'var(--sleep)'], ['Diaper', 'var(--diaper)'], ['Grow', 'var(--grow)']].map(([n, c]) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: c, boxShadow: 'var(--shadow-sm)' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: 'var(--page-fg)' }}>{n}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>Verb hues share one lightness &amp; chroma, varying only in hue — so they read as a calm family, never a circus. Color is always paired with an icon and a label.</p>

            <div className="subhead">Type</div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--page-fg)' }}>Hanken Grotesk</div>
            <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>Warm humanist sans — friendly without being childish. Paired with</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: 'var(--page-fg)' }}>Spline Sans Mono · 1h 12m</div>
            <div style={{ fontSize: 14, color: 'var(--fg-muted)' }}>for times, durations and amounts — tabular, glanceable, never reflowing.</div>

            <div className="subhead">Principles</div>
            <Principle t="Restraint is the feature" d="If an element doesn’t earn its place, it’s gone. The best version fades into the background of a parent’s day." />
            <Principle t="One thumb, two seconds" d="Primary actions live in the lower screen; targets are ≥48px; nothing on the hot path needs a re-grip." />
            <Principle t="Quiet attribution" d="You always know who logged what — but it whispers. The activity matters more than the actor." />
            <Principle t="Soft, not sterile" d="Generous radii, warm shadows, gentle motion. Competent and calm, like a good night-nurse." />
          </div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionVisual });
