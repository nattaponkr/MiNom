// section_hifi.jsx — the 4 priority screens in light + dark
function ModePair({ title, desc, Comp, props = {} }) {
  return (
    <div className="phone-cell" style={{ width: '100%' }}>
      <div className="phone-cap" style={{ maxWidth: 760, marginBottom: 4 }}>
        <div className="t" style={{ fontSize: 16 }}>{title}</div>
        <div className="d">{desc}</div>
      </div>
      <div className="mode-pair">
        <div className="phone-cell">
          <PhoneFrame theme="light"><Comp {...props} /></PhoneFrame>
          <span className="phone-cap"><span className="d" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IcSun size={14} /> Light</span></span>
        </div>
        <div className="phone-cell">
          <PhoneFrame theme="dark"><Comp {...props.dark ? props.dark : props} /></PhoneFrame>
          <span className="phone-cap"><span className="d" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IcMoon size={14} /> Dark</span></span>
        </div>
      </div>
    </div>
  );
}

function SectionHifi({ filled, homeLayout, eatDetails }) {
  return (
    <section className="section" id="hifi">
      <div className="wrap">
        <p className="eyebrow">03 · Hi-fi mockups</p>
        <h2 className="section-title">The four screens that are the app</h2>
        <p className="section-desc">Home and the three quick-logs are ~90% of every session, so they’re rendered to spec in <b>both light and dark</b> — same hierarchy, AA contrast in each. The Sleep timer is shown idle (light) and running (dark). Use the <b>Tweaks</b> panel to flip icon style, Home layout, and the Eat details pattern.</p>
        <div style={{ height: 30 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 46 }}>
          <ModePair title="Home / Today" desc="Three status cards, caregiver presence, bottom nav. The whole card logs — no hunting for a button." Comp={HomeScreen} props={{ filled, homeLayout }} />
          <ModePair title="Quick-Log: Eat" desc="Opens pre-set to “now.” Save in one more tap; details expand only if wanted." Comp={EatScreen} props={{ filled, eatDetails }} />
          <ModePair title="Quick-Log: Sleep" desc="Timer-first. Idle state invites a one-tap Start; running state owns the screen with a live clock." Comp={SleepScreen} props={{ filled, running: false, dark: { filled, running: true } }} />
          <ModePair title="Quick-Log: Diaper" desc="Wet / dirty / both as oversized segmented targets, then Save. Color + icon + label — never color alone." Comp={DiaperScreen} props={{ filled, sel: 'wet', dark: { filled, sel: 'both' } }} />
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionHifi, ModePair });
