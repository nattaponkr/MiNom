// section_ia.jsx — Information architecture / sitemap
function IANode({ kind = '', verb, icon: Ic, title, desc }) {
  return (
    <div className={'ia-node ' + kind + (verb ? ' verb ' + verb : '')}>
      {Ic && <span className="ia-ic">{Ic}</span>}
      <span><span className="nt">{title}</span>{desc && <span className="nd" style={{ display: 'block' }}>{desc}</span>}</span>
    </div>
  );
}
const Arrow = () => <div className="ia-arrow"><IcChevD size={22} /></div>;

function SectionIA() {
  return (
    <section className="section" id="ia">
      <div className="wrap">
        <p className="eyebrow">01 · Information architecture</p>
        <h2 className="section-title">Where everything lives</h2>
        <p className="section-desc">Eight screens, one hub. <b>Almost every session is the same shape:</b> open the app, land on Home, tap a verb, save, done. That hot path is highlighted below — it has to stay two taps deep, forever.</p>

        <div className="note" style={{ margin: '20px 0 28px', maxWidth: 640 }}>
          <span className="tag">Most-traveled path</span>
          Home → tap <b>Eat / Sleep / Diaper</b> → <span className="kbd">Save</span> → back to Home. Two taps, under two seconds, one thumb. Everything else (Timeline, Growth, Family, Settings) is review &amp; management — reached but rarely on the critical loop.
        </div>

        <div className="ia">
          {/* Entry */}
          <div className="ia-tier">
            <div className="ia-tier-head"><span className="tl">Entry · first run</span></div>
            <div className="ia-nodes">
              <IANode icon={<IcMail size={20} />} title="Sign in / up" desc="Email + password" />
              <IANode icon={<IcGrow size={20} />} title="Baby setup" desc="Name + birthdate" />
              <IANode icon={<IcUsers size={20} />} title="Accept invite" desc="From a caregiver" />
            </div>
          </div>
          <Arrow />

          {/* Hub */}
          <div className="ia-tier">
            <div className="ia-tier-head"><span className="tl">Daily hub</span></div>
            <div className="ia-nodes">
              <IANode kind="hub" icon={<IcEat size={24} />} title="Home / Today" desc="3 cards · last X ago · live caregiver presence" />
            </div>
          </div>
          <Arrow />

          {/* Hot path */}
          <div className="ia-tier hot">
            <div className="ia-tier-head"><span className="tl">Quick-log</span><span className="badge-hot">≈90% of sessions</span></div>
            <div className="ia-nodes">
              <IANode kind="verb" verb="eat" icon={<IcEat size={22} />} title="Eat" desc="Now · optional details" />
              <IANode kind="verb" verb="sleep" icon={<IcSleep size={22} />} title="Sleep" desc="Start / stop timer" />
              <IANode kind="verb" verb="diaper" icon={<IcDiaper size={22} />} title="Diaper" desc="Wet / dirty / both" />
            </div>
          </div>
          <Arrow />

          {/* Review & manage */}
          <div className="ia-tier">
            <div className="ia-tier-head"><span className="tl">Review &amp; manage</span></div>
            <div className="ia-nodes">
              <IANode icon={<IcList size={20} />} title="Timeline" desc="Today · swipe back · who logged it" />
              <IANode icon={<IcGrow size={20} />} title="Growth" desc="Weight + height · WHO curve" />
              <IANode icon={<IcUsers size={20} />} title="Family" desc="Invite / remove / transfer" />
              <IANode icon={<IcGear size={20} />} title="Settings" desc="Units · export · sign out" />
            </div>
            <div className="ia-detail">
              <div className="ia-sub"><IcChevR size={14} /> Timeline → <b style={{ color: 'var(--fg)' }}>&nbsp;Activity detail</b> &nbsp;(view / edit / delete a single entry)</div>
              <div className="ia-sub"><IcChevR size={14} /> Family → <b style={{ color: 'var(--fg)' }}>&nbsp;Add caregiver</b> &nbsp;(email invite · pending · transfer ownership)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionIA });
