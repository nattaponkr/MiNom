// thai_app.jsx — orchestrator for the Thai localization deliverable
const { useState: useTS, useEffect: useTE } = React;

const TH_SECTIONS = [
  ['brand', 'Brand'], ['type', 'Typography'], ['screens', 'Hi-fi screens'], ['microcopy', 'Microcopy'],
  ['clarifications', 'Clarifications'], ['consent', 'PDPA'],
];

function useSpy(ids) {
  const [active, setActive] = useTS(ids[0]);
  useTE(() => {
    const obs = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return active;
}

function ThHero() {
  return (
    <header style={{ padding: '52px 0 8px' }}>
      <div className="wrap">
        <p className="eyebrow">Rebrand + Thai localization · 2026-06-01</p>
        <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 18px', maxWidth: '22ch' }}>
          Say hello to <span lang="th" style={{ fontFamily: "'Anuphan',sans-serif", fontWeight: 600, color: 'var(--primary)' }}>ละมุน</span> — gentle by name, gentle by design.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: '62ch', color: 'var(--fg-muted)', margin: 0 }}>
          MiNom is retired user-facing (it read wrong in Thai); the app is now <b lang="th" style={{ fontFamily: "'Anuphan',sans-serif", color: 'var(--page-fg)' }}>ละมุน</b> <span style={{ fontStyle: 'italic' }}>(Lamoon — “soft, tender”)</span>. This pass covers the <b style={{ color: 'var(--page-fg)' }}>brand identity, Thai typography, native microcopy, the four hi-fi screens in real Thai</b>, PDPA consent — plus the <b style={{ color: 'var(--primary)' }}>five clarifications</b> Dev needs before Phase 3. The v0.2 colors, motion and behaviors are unchanged — only the name, type and words. Code stays “MiNom” internally.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
          {['Thai-only MVP', 'Anuphan · Cadson Demak', '24h · th-TH', 'PDPA-ready', 'i18n drop-in: th.json'].map(t => (
            <span key={t} style={{ fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)', boxShadow: 'var(--shadow-sm)' }}>{t}</span>
          ))}
        </div>
      </div>
    </header>
  );
}

function ThApp() {
  const [t, setTweak] = useTweaks({ dark: false });
  const active = useSpy(TH_SECTIONS.map(s => s[0]));
  const jump = (e, id) => { e.preventDefault(); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 96, behavior: 'smooth' }); };
  return (
    <div className="page" data-theme={t.dark ? 'dark' : undefined}>
      <div className="topbar"><div className="topbar-inner">
        <LamoonWordmark size={21} />
        <span className="meta">Rebrand + Thai localization</span>
        <span className="phase-chip">Designer → PM review</span>
      </div></div>
      <nav className="sectionnav"><div className="sectionnav-inner">
        {TH_SECTIONS.map(([id, label], i) => (
          <a key={id} href={'#' + id} onClick={(e) => jump(e, id)} className={active === id ? 'active' : ''}>
            <span style={{ opacity: 0.5, marginRight: 6 }}>{String(i + 1).padStart(2, '0')}</span>{label}
          </a>
        ))}
      </div></nav>

      <ThHero />
      <SectionBrand />
      <SectionThaiType />
      <SectionThaiScreens />
      <SectionMicrocopy />
      <SectionClarifications />
      <SectionConsent />

      <footer style={{ padding: '40px 0 70px', textAlign: 'center', color: 'var(--fg-faint)', fontSize: 13 }}>
        <div className="wrap"><span className="lamoon-latin">Lamoon</span> · ละมุน · rebrand + Thai localization · for PM + CPO review · 2026-06-01 · internal codename MiNom</div>
      </footer>

      <TweaksPanel>
        <TweakSection label="Display" />
        <TweakToggle label="Dark mode (page)" value={t.dark} onChange={(v) => setTweak('dark', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ThApp />);
