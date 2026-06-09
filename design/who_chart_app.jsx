// who_chart_app.jsx — orchestrator for the Growth-chart (WHO LMS) deliverable (Handoff #15)
const { useState: wcaU, useEffect: wcaE } = React;
const WCA_SECTIONS = [['why', 'The upgrade'], ['chart', 'The chart'], ['states', 'Data states'], ['sex', 'Sex dependency'], ['cite', 'Citation'], ['edges', 'Edge cases'], ['aa', 'AA audit'], ['spec', 'Spec']];
function useSpyWca(ids) {
  const [a, setA] = wcaU(ids[0]);
  wcaE(() => {
    const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setA(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) o.observe(el); });
    return () => o.disconnect();
  }, []);
  return a;
}
function WcHero() {
  return (
    <header style={{ padding: '52px 0 8px' }}>
      <div className="wrap">
        <p className="eyebrow">ละมุน · Growth chart · real WHO LMS · Handoff #15 · 2026-06-07</p>
        <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 18px', maxWidth: '21ch' }}>A growth chart that actually means something.</h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: '66ch', color: 'var(--fg-muted)', margin: 0 }}>The โต chart goes from decorative to diagnostic: real <b style={{ color: 'var(--page-fg)' }}>WHO percentile curves</b> (3/15/50/85/97) computed from LMS reference data, labeled age + weight/height axes, a today's-age marker, and a citation. When sex isn't set we <b style={{ color: 'var(--page-fg)' }}>degrade honestly</b> — points and axes, no faked curves — and prompt to set it. Curves are reference; the baby's dots are the overlay.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
          {['Real WHO LMS curves', 'Labeled axes + units', 'Today\u2019s-age marker', 'Sex-required graceful degrade', 'WHO citation', 'AA · both themes'].map((t) => (
            <span key={t} style={{ fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)', boxShadow: 'var(--shadow-sm)' }}>{t}</span>
          ))}
        </div>
      </div>
    </header>
  );
}
function WcApp() {
  const [t, setTweak] = useTweaks({ dark: false });
  const active = useSpyWca(WCA_SECTIONS.map((s) => s[0]));
  const jump = (e, id) => { e.preventDefault(); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 96, behavior: 'smooth' }); };
  return (
    <div className="page" data-theme={t.dark ? 'dark' : undefined}>
      <div className="topbar"><div className="topbar-inner">
        <span className="lamoon-wm" style={{ fontSize: 21 }}><span className="lm-dot"></span><span className="lm-word" lang="th">ละมุน</span></span>
        <span className="meta">Growth chart · WHO LMS — Handoff #15</span>
        <span className="phase-chip">Designer → PM review</span>
      </div></div>
      <nav className="sectionnav"><div className="sectionnav-inner">
        {WCA_SECTIONS.map(([id, label], i) => (<a key={id} href={'#' + id} onClick={(e) => jump(e, id)} className={active === id ? 'active' : ''}><span style={{ opacity: 0.5, marginRight: 6 }}>{String(i + 1).padStart(2, '0')}</span>{label}</a>))}
      </div></nav>
      <WcHero />
      <SecWcWhy />
      <SecWcChart />
      <SecWcStates />
      <SecWcSex />
      <SecWcCite />
      <SecWcEdges />
      <SecWcAudit />
      <SecWcSpec />
      <footer style={{ padding: '40px 0 70px', textAlign: 'center', color: 'var(--fg-faint)', fontSize: 13 }}>
        <div className="wrap">ละมุน · Growth chart · real WHO LMS data · for PM review · 2026-06-07 (Handoff #15)</div>
      </footer>
      <TweaksPanel>
        <TweakSection label="Display" />
        <TweakToggle label="Dark mode (page)" value={t.dark} onChange={(v) => setTweak('dark', v)} />
      </TweaksPanel>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<WcApp />);
