// app.jsx — orchestrator: header, scroll-spy nav, sections, tweaks
const { useState: useS, useEffect: useE, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "icons": "line",
  "homeLayout": "cards",
  "eatDetails": "inline",
  "annotate": true
}/*EDITMODE-END*/;

const SECTIONS = [
  ['ia', 'IA'], ['wireframes', 'Wireframes'], ['hifi', 'Hi-fi'], ['visual', 'Visual'], ['states', 'States'], ['components', 'Components'],
];

function useScrollSpy(ids) {
  const [active, setActive] = useS(ids[0]);
  useE(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return active;
}

function Hero() {
  return (
    <header style={{ padding: '52px 0 8px' }}>
      <div className="wrap">
        <p className="eyebrow">MiNom · Phase 1 design · 2026-05-31</p>
        <h1 style={{ fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.0, margin: '0 0 18px', maxWidth: 16 + 'ch' }}>
          The simplest baby tracker.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: '60ch', color: 'var(--fg-muted)', margin: 0 }}>
          From the baby’s side there are only four verbs — <b style={{ color: 'var(--primary)' }}>Eat, Sleep, Diaper, Grow</b>. Everything else is parent metadata, hidden until asked for. This deck takes that idea from <b style={{ color: 'var(--page-fg)' }}>sitemap → wireframes → hi-fi → visual direction → live state &amp; motion specs → a component stub</b> a developer can build from tomorrow.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
          {['Mobile-first · 360px', 'One-handed · 2-second log', 'Dark mode mandatory', 'WCAG 2.1 AA', 'Multi-caregiver'].map(t => (
            <span key={t} style={{ fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)', boxShadow: 'var(--shadow-sm)' }}>{t}</span>
          ))}
        </div>
      </div>
    </header>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const active = useScrollSpy(SECTIONS.map(s => s[0]));
  const filled = t.icons === 'filled';

  const jump = (e, id) => { e.preventDefault(); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 96, behavior: 'smooth' }); };

  return (
    <div className="page" data-theme={t.dark ? 'dark' : undefined}>
      <div className="topbar">
        <div className="topbar-inner">
          <span className="wordmark"><span className="dot" />Mi<span className="n">Nom</span></span>
          <span className="meta">Phase 1 — Design deliverable</span>
          <span className="phase-chip">Designer → PM review</span>
        </div>
      </div>
      <nav className="sectionnav">
        <div className="sectionnav-inner">
          {SECTIONS.map(([id, label], i) => (
            <a key={id} href={'#' + id} onClick={(e) => jump(e, id)} className={active === id ? 'active' : ''}>
              <span style={{ opacity: 0.5, marginRight: 6 }}>{String(i + 1).padStart(2, '0')}</span>{label}
            </a>
          ))}
        </div>
      </nav>

      <Hero />
      <SectionIA />
      <SectionWireframes annotate={t.annotate} />
      <SectionHifi filled={filled} homeLayout={t.homeLayout} eatDetails={t.eatDetails} />
      <SectionVisual filled={filled} homeLayout={t.homeLayout} />
      <SectionStates filled={filled} />
      <SectionComponents />

      <footer style={{ padding: '40px 0 70px', textAlign: 'center', color: 'var(--fg-faint)', fontSize: 13 }}>
        <div className="wrap">MiNom · Phase 1 design deliverable · prepared for PM + CPO review · 2026-05-31</div>
      </footer>

      <TweaksPanel>
        <TweakSection label="Display" />
        <TweakToggle label="Dark mode (page)" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakRadio label="Icon style" value={t.icons} options={['line', 'filled']} onChange={(v) => setTweak('icons', v)} />
        <TweakToggle label="Wireframe annotations" value={t.annotate} onChange={(v) => setTweak('annotate', v)} />
        <TweakSection label="Layout options" />
        <TweakRadio label="Home layout" value={t.homeLayout} options={['cards', 'thumb']} onChange={(v) => setTweak('homeLayout', v)} />
        <TweakRadio label="Eat details" value={t.eatDetails} options={['inline', 'sheet']} onChange={(v) => setTweak('eatDetails', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
