// screens_th.jsx — Thai-localized product screens (consume window.TH).
// Reuse Phase-1 CSS classes, icons, PhoneFrame. Wrap content in lang="th".
const T = () => window.TH;

function ThTabBar({ active = 'home' }) {
  const t = T().tab;
  const tabs = [['home', t.home, IcEat], ['timeline', t.timeline, IcList], ['grow', t.grow, IcGrow], ['care', t.care, IcUsers], ['settings', t.settings, IcGear]];
  return (
    <div className="tabbar" lang="th">
      {tabs.map(([id, label, Ic]) => (
        <button key={id} className={'tab' + (id === active ? ' on' : '')}>
          <Ic size={22} /><span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function ThCareStack() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {['Mom', 'Dad', 'Nanny'].map((n, i) => (
        <span key={n} style={{ marginLeft: i ? -8 : 0, border: '2px solid var(--bg)', borderRadius: '50%', display: 'inline-flex' }}><Avatar name={n} size="lg" /></span>
      ))}
    </div>
  );
}

// ---------- HOME (populated) ----------
function ThHome({ live = true }) {
  const h = T().home;
  const Card = ({ verb, name, stat, unit, isLive, by }) => {
    const Ic = VERB_ICON[verb];
    return (
      <button className={'verb-card' + (isLive ? ' live' : '')}>
        <span className={'verb-ic ' + verb}><Ic size={28} /></span>
        <span className="verb-meta">
          <span className="verb-name">{name}</span>
          <span className="verb-stat" style={{ display: 'block' }}>{isLive && <span className="pulse-dot" />}{stat} <span className="u">{unit}</span></span>
          {by && <span className="who"><Avatar name={by === 'คุณพ่อ' ? 'Dad' : 'Nanny'} /><span className="nm">{h.by.replace('{name}', by)}</span></span>}
        </span>
        <span className="verb-go"><IcChevR size={18} /></span>
      </button>
    );
  };
  return (
    <>
      <div className="screen-body" lang="th">
        <div className="appbar">
          <span><span className="ttl">น้องฟ้า</span><span className="sub">4 เดือน · วันเสาร์</span></span>
          <span className="spacer" /><ThCareStack />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Card verb="eat" name={h.eatName} stat="1 ชม. 12 นาที" unit={h.ago} by="คุณพ่อ" />
          <Card verb="sleep" name={h.sleepName} stat="22 นาที" unit={h.sleepAsleep} isLive={live} />
          <Card verb="diaper" name={h.diaperName} stat="2 ชม. 04 นาที" unit={h.ago} by="พี่เลี้ยง" />
        </div>
      </div>
      <ThTabBar active="home" />
    </>
  );
}

// ---------- HOME (first-run, ghost) ----------
function ThHomeEmpty() {
  const h = T().home;
  const Ghost = ({ verb, name, hint }) => {
    const Ic = VERB_ICON[verb];
    return (
      <button className="verb-card" style={{ borderStyle: 'dashed', background: 'transparent' }}>
        <span className={'verb-ic ' + verb} style={{ opacity: 0.55 }}><Ic size={28} /></span>
        <span className="verb-meta"><span className="verb-name">{name}</span><span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg-faint)' }}>{hint}</span></span>
        <span className="verb-go" style={{ background: 'var(--primary-tint)', color: 'var(--primary)' }}><IcPlus size={18} /></span>
      </button>
    );
  };
  return (
    <>
      <div className="screen-body" lang="th">
        <div className="appbar"><span><span className="ttl">น้องฟ้า</span><span className="sub">{h.welcomeSub}</span></span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Ghost verb="eat" name={h.eatName} hint={h.ghostEat} />
          <Ghost verb="sleep" name={h.sleepName} hint={h.ghostSleep} />
          <Ghost verb="diaper" name={h.diaperName} hint={h.ghostDiaper} />
        </div>
        <div className="note" style={{ marginTop: 16, fontSize: 12.5 }}>{h.tip}</div>
      </div>
      <ThTabBar active="home" />
    </>
  );
}

// ---------- EAT ----------
function ThEat({ showTimeEdit = true }) {
  const e = T().eat, c = T().common;
  return (
    <>
      <div className="sheet-handle" />
      <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
        <div className="appbar" style={{ paddingBottom: 6 }}>
          <span className="verb-ic eat" style={{ width: 40, height: 40, borderRadius: 13 }}><IcEat size={22} /></span>
          <span className="ttl">{e.title}</span><span className="spacer" />
          <button className="iconbtn"><IcX size={22} /></button>
        </div>
        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span className="verb-go" style={{ background: 'var(--eat-tint)', color: 'var(--eat)' }}><IcClock size={20} /></span>
          <span><span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-muted)' }}>{e.whenLabel}</span><span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>{e.whenNow.replace('{time}', '21:41')}</span></span>
          <span className="spacer" />
          {showTimeEdit && <span className="edit-aff">{c.edit}</span>}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '2px 16px 6px' }}>
          <Expander label={e.detailsToggle} open={true}>
            <div className="field">
              <label>{e.amountLabel} <span style={{ fontWeight: 500, color: 'var(--fg-faint)' }}>· {c.optional}</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="iconbtn" style={{ background: 'var(--surface-2)', width: 48, height: 48 }}><IcChevL size={18} /></button>
                <span className="mono" style={{ fontSize: 26, fontWeight: 600, minWidth: 92, textAlign: 'center' }}>120 <span style={{ fontSize: 15, color: 'var(--fg-muted)' }}>{e.amountUnit}</span></span>
                <button className="iconbtn" style={{ background: 'var(--surface-2)', width: 48, height: 48 }}><IcPlus size={18} /></button>
              </div>
            </div>
            <div className="field"><label>{e.whatLabel}</label><div className="chiprow"><span className="chip on">{e.whatMilk}</span><span className="chip">{e.whatFood}</span></div></div>
            <div className="field"><label>{e.sourceLabel}</label><div className="chiprow"><span className="chip">{e.sourceBreastL}</span><span className="chip on">{e.sourceBreastR}</span><span className="chip">{e.sourceBottle}</span><span className="chip">{e.sourceSolid}</span></div></div>
            <div className="field" style={{ marginBottom: 4 }}><label>{e.notesLabel}</label><input className="input" placeholder={e.notesPlaceholder} /></div>
          </Expander>
        </div>
        <div style={{ height: 12 }} />
        <Button kind="primary" size="lg" icon={<IcCheck size={20} />}>{e.save}</Button>
        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

// ---------- SLEEP ----------
function ThSleep({ running = false }) {
  const s = T().sleep;
  return (
    <>
      <div className="sheet-handle" />
      <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
        <div className="appbar" style={{ paddingBottom: 6 }}>
          <span className="verb-ic sleep" style={{ width: 40, height: 40, borderRadius: 13 }}><IcSleep size={22} /></span>
          <span className="ttl">{s.title}</span><span className="spacer" />
          <button className="iconbtn"><IcX size={22} /></button>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '30px 20px 26px', textAlign: 'center', marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>
          {running ? (<>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sleep)' }}><span className="pulse-dot" />{s.sleeping}</div>
            <div className="mono" style={{ fontSize: 46, fontWeight: 600, letterSpacing: '-0.03em', margin: '8px 0 4px' }}>00:22:14</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{s.startedBy.replace('{time}', '21:19').replace('{name}', 'คุณแม่')}</div>
          </>) : (<>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-muted)' }}>{s.awake.replace('{dur}', '1 ชม. 40 นาที')}</div>
            <div className="mono" style={{ fontSize: 46, fontWeight: 600, letterSpacing: '-0.03em', margin: '8px 0 4px', color: 'var(--fg-faint)' }}>00:00:00</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{s.idleHint}</div>
          </>)}
        </div>
        {running
          ? <Button kind="primary" size="lg" icon={<IcStop size={20} />} style={{ background: 'var(--sleep)' }}>{s.stop}</Button>
          : <Button kind="primary" size="lg" icon={<IcPlay size={18} />} style={{ background: 'var(--sleep)' }}>{s.start}</Button>}
        <div style={{ textAlign: 'center', marginTop: 14 }}><button style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', fontWeight: 700, fontSize: 14, fontFamily: "'Anuphan',sans-serif" }}>{s.manual}</button></div>
      </div>
    </>
  );
}

// ---------- DIAPER ----------
function ThDiaper({ sel = 'wet' }) {
  const d = T().diaper, c = T().common;
  const opts = [['wet', d.wet, IcDrop], ['dirty', d.dirty, IcLeaf], ['both', d.both, null]];
  return (
    <>
      <div className="sheet-handle" />
      <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
        <div className="appbar" style={{ paddingBottom: 10 }}>
          <span className="verb-ic diaper" style={{ width: 40, height: 40, borderRadius: 13 }}><IcDiaper size={22} /></span>
          <span className="ttl">{d.title}</span><span className="spacer" />
          <button className="iconbtn"><IcX size={22} /></button>
        </div>
        <div className="seg" style={{ marginBottom: 14 }}>
          {opts.map(([id, label, Ic]) => (
            <button key={id} className={'seg-opt' + (id === sel ? ' on diaper' : '')}>
              <span className="si">{Ic ? <Ic size={24} filled={id === sel} /> : <span style={{ display: 'flex', gap: 2 }}><IcDrop size={18} filled={id === sel} /><IcLeaf size={18} filled={id === sel} /></span>}</span>{label}
            </button>
          ))}
        </div>
        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span className="verb-go" style={{ background: 'var(--diaper-tint)', color: 'var(--diaper)' }}><IcClock size={20} /></span>
          <span><span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg-muted)' }}>{d.whenLabel}</span><span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>ตอนนี้ · 21:41</span></span>
          <span className="spacer" /><span className="edit-aff">{c.edit}</span>
        </div>
        <Button kind="primary" size="lg" icon={<IcCheck size={20} />}>{d.save}</Button>
        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

// ---------- TIMELINE ----------
function ThTimeline() {
  const tl = T().timeline;
  const Row = ({ verb, title, who, time, mine, pill }) => {
    const Ic = VERB_ICON[verb];
    return (
      <div className="act-row">
        <span className={'act-ic ' + verb}><Ic size={19} /></span>
        <span className="act-main"><span className="act-title">{title}</span>
          <span className="who"><Avatar name={mine ? 'You' : (who === 'คุณพ่อ' ? 'Dad' : 'Nanny')} /><span className="nm">{mine ? tl.you : who}</span></span></span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <span className="act-time">{time}</span>{pill}
        </span>
      </div>
    );
  };
  return (
    <>
      <div className="screen-body" lang="th">
        <div className="appbar"><span><span className="ttl">{tl.title}</span><span className="sub">{tl.today}</span></span></div>
        <div className="tl-day">{tl.today}</div>
        <Row verb="eat" title={tl.eatAmount.replace('{n}', '120')} who={tl.you} time="21:41" mine pill={<span className="queued-pill synced-pill"><IcCheck size={11} /> {T().sync.synced}</span>} />
        <Row verb="diaper" title={'ผ้าอ้อม · ' + T().diaper.wet} who="พี่เลี้ยง" time="20:40" />
        <Row verb="eat" title={tl.eatAmount.replace('{n}', '110')} who="คุณพ่อ" time="20:21" />
        <Row verb="sleep" title={'การนอน · 1 ชม. 32 นาที'} who="คุณแม่" time="19:33" />
      </div>
      <ThTabBar active="timeline" />
    </>
  );
}

Object.assign(window, { ThTabBar, ThHome, ThHomeEmpty, ThEat, ThSleep, ThDiaper, ThTimeline });
