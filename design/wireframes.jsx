// wireframes.jsx — clean grayscale lo-fi wireframes for all 8 screens + supporting flows.
const Tl = ({ w = '100%', dk, style }) => <div className={'wftl' + (dk ? ' dk' : '')} style={{ width: w, ...style }} />;
const Pin = ({ n, style }) => <span className="pin" style={style}>{n}</span>;

function WfPhone({ children, pins }) {
  return (
    <div className="wfphone">
      <div className="wfscreen">
        <div className="wfsb"><span>9:41</span><span className="dots"><i /><i /><i /></span></div>
        {children}
        <div className="wfhome" />
        {pins}
      </div>
    </div>
  );
}

const WfTabbar = ({ active }) => (
  <div className="wftab">
    {[['home', 'Home', IcEat], ['tl', 'Timeline', IcList], ['gr', 'Growth', IcGrow], ['ca', 'Family', IcUsers], ['se', 'More', IcGear]].map(([id, l, Ic]) => (
      <span key={id} className={'ti' + (id === active ? ' on' : '')}><Ic size={17} /><span>{l}</span></span>
    ))}
  </div>
);

const WfAppbar = ({ title, sub, right }) => (
  <div className="wfrow" style={{ padding: '6px 2px 12px' }}>
    <div className="wfcol" style={{ flex: 1 }}><span className="wfttl">{title}</span>{sub && <span className="wftxt" style={{ opacity: 0.6, marginTop: 2 }}>{sub}</span>}</div>
    {right}
  </div>
);

const VerbCardWf = ({ verb, name, live }) => {
  const Ic = VERB_ICON[verb];
  return (
    <div className="wfcard wfrow" style={{ gap: 12, minHeight: 70 }}>
      <span className="wfsq" style={{ width: 44, height: 44 }}><Ic size={24} /></span>
      <div className="wfcol" style={{ flex: 1, gap: 7 }}>
        <span className="wflbl">{name}</span>
        <Tl w={live ? '60%' : '52%'} dk />
      </div>
      <span className="wfic"><IcChevR size={18} /></span>
    </div>
  );
};

// ---- 1. HOME ----
function WfHome() {
  return (
    <WfPhone pins={<>
      <Pin n="1" style={{ top: 14, right: 12 }} />
      <Pin n="2" style={{ top: 150, left: 8 }} />
      <Pin n="3" style={{ bottom: 92, right: 10 }} />
    </>}>
      <div className="wfbody">
        <WfAppbar title="Mina" sub="4 months · today" right={<div className="wfrow" style={{ gap: -6 }}>{['a', 'b', 'c'].map((k, i) => <span key={k} className="wfcirc" style={{ width: 26, height: 26, marginLeft: i ? -7 : 0, border: '2px solid var(--paper)' }} />)}</div>} />
        <div className="wfcol" style={{ gap: 10 }}>
          <VerbCardWf verb="eat" name="Eat — last 1h ago" />
          <VerbCardWf verb="sleep" name="Sleep — asleep 22m" live />
          <VerbCardWf verb="diaper" name="Diaper — 2h ago" />
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <div className="thumb-zone" />
      <WfTabbar active="home" />
    </WfPhone>
  );
}

// ---- 2. EAT ----
function WfEat() {
  return (
    <WfPhone pins={<><Pin n="1" style={{ top: 86, left: 8 }} /><Pin n="2" style={{ top: 168, right: 10 }} /><Pin n="3" style={{ bottom: 30, left: 8 }} /></>}>
      <div className="wfbody">
        <WfAppbar title="Eat" right={<span className="wfic"><IcX size={20} /></span>} />
        <div className="wfcard wfrow" style={{ gap: 10, marginBottom: 12 }}>
          <span className="wfsq" style={{ width: 38, height: 38 }}><IcClock size={18} /></span>
          <div className="wfcol" style={{ flex: 1, gap: 6 }}><span className="wflbl">When</span><Tl w="55%" dk /></div>
          <span className="wftxt" style={{ fontWeight: 700 }}>Edit</span>
        </div>
        <div className="wfbox" style={{ padding: 12, marginBottom: 12 }}>
          <div className="wfrow"><span className="wflbl" style={{ flex: 1 }}>Details (optional)</span><IcChevD size={16} /></div>
          <div className="wfcol" style={{ gap: 9, marginTop: 12 }}>
            <Tl w="35%" /><div className="wfrow" style={{ gap: 8 }}><span className="wfpill">Milk</span><span className="wfpill on">Food</span></div>
            <Tl w="30%" style={{ marginTop: 4 }} /><div className="wfrow" style={{ gap: 6, flexWrap: 'wrap' }}><span className="wfpill">L</span><span className="wfpill on">R</span><span className="wfpill">Bottle</span></div>
            <div className="wfbox" style={{ height: 40, marginTop: 4 }} />
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="wfbtn fill">Save feed</div>
      </div>
    </WfPhone>
  );
}

// ---- 3. SLEEP ----
function WfSleep() {
  return (
    <WfPhone pins={<><Pin n="1" style={{ top: 120, right: 14 }} /><Pin n="2" style={{ bottom: 96, left: 8 }} /></>}>
      <div className="wfbody">
        <WfAppbar title="Sleep" right={<span className="wfic"><IcX size={20} /></span>} />
        <div className="wfcard wfcol" style={{ alignItems: 'center', gap: 10, padding: '34px 16px', marginBottom: 14 }}>
          <span className="wflbl">Awake 1h 40m</span>
          <div className="wfttl" style={{ fontSize: 30, fontFamily: 'var(--font-mono)' }}>00:00:00</div>
          <Tl w="60%" />
        </div>
        <div className="wfbtn fill" style={{ height: 52 }}><IcPlay size={16} /> Start sleep</div>
        <div className="wfrow" style={{ justifyContent: 'center', marginTop: 14 }}><span className="wftxt" style={{ fontWeight: 700, opacity: 0.7 }}>Enter time manually</span></div>
        <div style={{ flex: 1 }} />
      </div>
    </WfPhone>
  );
}

// ---- 4. DIAPER ----
function WfDiaper() {
  return (
    <WfPhone pins={<><Pin n="1" style={{ top: 78, left: 8 }} /><Pin n="2" style={{ bottom: 30, left: 8 }} /></>}>
      <div className="wfbody">
        <WfAppbar title="Diaper" right={<span className="wfic"><IcX size={20} /></span>} />
        <div className="wfseg" style={{ marginBottom: 14 }}>
          <span className="o"><IcDrop size={20} />Wet</span>
          <span className="o on"><IcLeaf size={20} />Dirty</span>
          <span className="o"><span style={{ display: 'flex', gap: 1 }}><IcDrop size={14} /><IcLeaf size={14} /></span>Both</span>
        </div>
        <div className="wfcard wfrow" style={{ gap: 10, marginBottom: 12 }}>
          <span className="wfsq" style={{ width: 38, height: 38 }}><IcClock size={18} /></span>
          <div className="wfcol" style={{ flex: 1, gap: 6 }}><span className="wflbl">When</span><Tl w="55%" dk /></div>
          <span className="wftxt" style={{ fontWeight: 700 }}>Edit</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="wfbtn fill">Save diaper</div>
      </div>
    </WfPhone>
  );
}

// ---- 5. TIMELINE ----
function WfTimeline() {
  const Row = ({ verb }) => {
    const Ic = VERB_ICON[verb];
    return (
      <div className="wfrow" style={{ gap: 11, padding: '11px 2px', borderBottom: '1.5px solid var(--line)' }}>
        <span className="wfsq" style={{ width: 36, height: 36 }}><Ic size={19} /></span>
        <div className="wfcol" style={{ flex: 1, gap: 6 }}>
          <Tl w="58%" dk />
          <div className="wfrow" style={{ gap: 5 }}><span className="wfcirc" style={{ width: 14, height: 14 }} /><Tl w="30%" /></div>
        </div>
        <Tl w="34px" />
      </div>
    );
  };
  return (
    <WfPhone pins={<><Pin n="1" style={{ top: 60, left: 8 }} /><Pin n="2" style={{ top: 150, right: 12 }} /></>}>
      <div className="wfbody">
        <WfAppbar title="Timeline" sub="Today · swipe ← for past days" right={<span className="wfic"><IcChevL size={18} /></span>} />
        <div className="wflbl" style={{ margin: '2px 2px 4px' }}>Today</div>
        <Row verb="sleep" /><Row verb="eat" /><Row verb="diaper" /><Row verb="eat" />
        <div style={{ flex: 1 }} />
      </div>
      <WfTabbar active="tl" />
    </WfPhone>
  );
}

// ---- 6. GROWTH ----
function WfGrowth() {
  return (
    <WfPhone pins={<><Pin n="1" style={{ top: 70, right: 14 }} /><Pin n="2" style={{ bottom: 150, right: 12 }} /></>}>
      <div className="wfbody">
        <WfAppbar title="Growth" right={<span className="wfic"><IcPlus size={20} /></span>} />
        <div className="wfrow" style={{ gap: 8, marginBottom: 12 }}><span className="wfpill on">Weight</span><span className="wfpill">Height</span></div>
        <div className="wfbox" style={{ height: 150, marginBottom: 12, display: 'grid', placeItems: 'center', color: 'var(--line)' }}>
          <div className="wfcol" style={{ alignItems: 'center', gap: 6 }}><IcGrow size={26} /><span className="wftxt" style={{ opacity: 0.7 }}>WHO percentile curve</span></div>
        </div>
        <div className="wflbl" style={{ margin: '2px 2px 6px' }}>History</div>
        {[0, 1].map(i => <div key={i} className="wfrow" style={{ padding: '9px 2px', borderBottom: '1.5px solid var(--line)', gap: 10 }}><Tl w="40%" dk /><div style={{ flex: 1 }} /><Tl w="44px" /></div>)}
        <div style={{ flex: 1 }} />
      </div>
      <WfTabbar active="gr" />
    </WfPhone>
  );
}

// ---- 7. CAREGIVERS ----
function WfCaregivers() {
  const Row = ({ badge }) => (
    <div className="wfrow" style={{ gap: 11, padding: '12px 2px', borderBottom: '1.5px solid var(--line)' }}>
      <span className="wfcirc" style={{ width: 36, height: 36 }} />
      <div className="wfcol" style={{ flex: 1, gap: 6 }}><Tl w="50%" dk />{badge && <span className="wfpill sm" style={{ height: 20, fontSize: 10, width: 'fit-content' }}>{badge}</span>}</div>
      <span className="wfic"><IcChevR size={16} /></span>
    </div>
  );
  return (
    <WfPhone pins={<><Pin n="1" style={{ top: 58, left: 8 }} /><Pin n="2" style={{ bottom: 120, left: 8 }} /></>}>
      <div className="wfbody">
        <WfAppbar title="Family" sub="3 of 10 caregivers" right={<span className="wfic"><IcGear size={18} /></span>} />
        <Row badge="Owner" /><Row /><Row />
        <div className="wflbl" style={{ margin: '14px 2px 6px' }}>Pending invite</div>
        <div className="wfrow" style={{ gap: 11, padding: '10px 2px' }}><span className="wfsq" style={{ width: 32, height: 32 }}><IcMail size={16} /></span><Tl w="55%" /><div style={{ flex: 1 }} /><span className="wftxt" style={{ fontWeight: 700 }}>Revoke</span></div>
        <div style={{ flex: 1 }} />
        <div className="wfbtn"><IcPlus size={16} /> Add caregiver</div>
      </div>
      <WfTabbar active="ca" />
    </WfPhone>
  );
}

// ---- 8. SETTINGS ----
function WfSettings() {
  const Row = ({ icon: Ic, val }) => (
    <div className="wfrow" style={{ gap: 11, padding: '13px 2px', borderBottom: '1.5px solid var(--line)' }}>
      <span className="wfsq" style={{ width: 30, height: 30 }}>{Ic && <Ic size={16} />}</span>
      <Tl w="40%" dk /><div style={{ flex: 1 }} />{val && <Tl w="44px" />}<span className="wfic"><IcChevR size={15} /></span>
    </div>
  );
  return (
    <WfPhone>
      <div className="wfbody">
        <WfAppbar title="Settings" />
        <div className="wflbl" style={{ margin: '2px 2px 6px' }}>Baby</div>
        <Row icon={IcGrow} val /><div className="wflbl" style={{ margin: '14px 2px 6px' }}>Preferences</div>
        <Row icon={IcGear} val /><Row icon={IcUsers} />
        <div className="wflbl" style={{ margin: '14px 2px 6px' }}>Account</div>
        <Row icon={IcMail} /><Row icon={IcList} />
        <div style={{ flex: 1 }} />
        <div className="wfbtn" style={{ borderColor: 'var(--line)' }}>Sign out</div>
      </div>
    </WfPhone>
  );
}

// ---- Supporting: SIGN IN ----
function WfSignIn() {
  return (
    <WfPhone>
      <div className="wfbody" style={{ justifyContent: 'center', gap: 14 }}>
        <div className="wfcol" style={{ alignItems: 'center', gap: 10, marginBottom: 10 }}><span className="wfcirc" style={{ width: 48, height: 48 }} /><div className="wfttl">MiNom</div><Tl w="60%" /></div>
        <div className="wfbox" style={{ height: 46 }} /><div className="wfbox" style={{ height: 46 }} />
        <div className="wfbtn fill" style={{ height: 50 }}>Sign in</div>
        <div className="wfrow" style={{ justifyContent: 'center', gap: 6 }}><span className="wftxt" style={{ opacity: 0.6 }}>New here?</span><span className="wftxt" style={{ fontWeight: 700 }}>Create account</span></div>
        <div className="wfrow" style={{ justifyContent: 'center' }}><span className="wftxt" style={{ opacity: 0.6 }}>Forgot password</span></div>
      </div>
    </WfPhone>
  );
}

// ---- Supporting: BABY SETUP ----
function WfBabySetup() {
  return (
    <WfPhone pins={<Pin n="1" style={{ top: 150, left: 8 }} />}>
      <div className="wfbody">
        <WfAppbar title="Add your baby" />
        <div className="wfcol" style={{ alignItems: 'center', gap: 8, margin: '6px 0 18px' }}><span className="wfcirc ghost" style={{ width: 72, height: 72, borderStyle: 'dashed' }}><IcPlus size={20} /></span><span className="wftxt" style={{ opacity: 0.6 }}>Add photo · optional</span></div>
        <Tl w="30%" /><div className="wfbox" style={{ height: 46, margin: '7px 0 14px' }} />
        <Tl w="35%" /><div className="wfbox" style={{ height: 46, margin: '7px 0 14px' }} />
        <div className="wfbox ghost" style={{ padding: 11 }}><span className="wftxt" style={{ opacity: 0.7 }}>Sex, birth weight & length — optional, add later</span></div>
        <div style={{ flex: 1 }} />
        <div className="wfbtn fill">Continue</div>
      </div>
    </WfPhone>
  );
}

// ---- Supporting: ACCEPT INVITE ----
function WfAcceptInvite() {
  return (
    <WfPhone pins={<Pin n="1" style={{ top: 120, left: 8 }} />}>
      <div className="wfbody" style={{ justifyContent: 'center', gap: 12 }}>
        <div className="wfcol" style={{ alignItems: 'center', gap: 12 }}>
          <span className="wfcirc" style={{ width: 56, height: 56 }} />
          <div className="wfttl" style={{ textAlign: 'center' }}>Join Mina on MiNom</div>
          <Tl w="80%" /><Tl w="60%" />
        </div>
        <div style={{ height: 8 }} />
        <div className="wfbtn fill" style={{ height: 50 }}>Accept invite</div>
        <div className="wfbtn">Decline</div>
      </div>
    </WfPhone>
  );
}

Object.assign(window, {
  WfPhone, WfHome, WfEat, WfSleep, WfDiaper, WfTimeline, WfGrowth, WfCaregivers, WfSettings,
  WfSignIn, WfBabySetup, WfAcceptInvite,
});
