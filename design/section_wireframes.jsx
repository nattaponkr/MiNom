// section_wireframes.jsx — lays out all lo-fi screens with captions + numbered legends
function WfCell({ step, title, Comp, legend }) {
  return (
    <div className="wf-cell">
      <div className="wf-cap"><span className="step">{step} · </span>{title}</div>
      <Comp />
      {legend && (
        <div className="wf-legend">
          {legend.map((l, i) => (
            <div className="li" key={i}><span className="n">{i + 1}</span><span><span className="cap-t">{l[0]}</span> {l[1]}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionWireframes({ annotate = true }) {
  return (
    <section className={'section wf' + (annotate ? '' : ' hide-anno')} id="wireframes">
      <div className="wrap">
        <p className="eyebrow">02 · Lo-fi wireframes</p>
        <h2 className="section-title">Structure, before style</h2>
        <p className="section-desc">All eight screens plus the supporting flows, in grayscale so the conversation stays on layout and flow. <b>Numbered pins call out the decisions that matter;</b> toggle them off in Tweaks for a clean read. Canvases are 290px — the 360px target minus device chrome.</p>

        <div className="subhead">Core · the daily loop</div>
        <div className="phones">
          <WfCell step="Screen 1" title="Home / Today" Comp={WfHome} legend={[
            ['Caregiver presence —', 'avatars show who else is in the app right now.'],
            ['Three “last X ago” cards', 'are the whole screen; the entire card is the tap target.'],
            ['Thumb arc —', 'all three quick-log targets sit in the natural one-handed reach zone.'],
          ]} />
          <WfCell step="Screen 2" title="Quick-Log: Eat" Comp={WfEat} legend={[
            ['Defaults to “now” —', 'a parent can Save without touching another field.'],
            ['Details collapsed', 'by default: amount, milk/food, source, notes — all optional, inline.'],
            ['One big Save', 'closes the sheet straight back to Home.'],
          ]} />
          <WfCell step="Screen 3" title="Quick-Log: Sleep" Comp={WfSleep} legend={[
            ['Timer is the hero —', 'Start is a single tap; the elapsed clock fills the card.'],
            ['Manual entry fallback', 'for the sleep you forgot to start.'],
          ]} />
          <WfCell step="Screen 4" title="Quick-Log: Diaper" Comp={WfDiaper} legend={[
            ['Wet / dirty / both', 'as big segmented targets — one tap selects.'],
            ['Save', 'with time pre-set to now.'],
          ]} />
        </div>

        <div className="subhead">Core · review &amp; manage</div>
        <div className="phones">
          <WfCell step="Screen 5" title="Timeline" Comp={WfTimeline} legend={[
            ['Today by default;', 'swipe ← for previous days — no date picker to fiddle with.'],
            ['Every row shows who logged it', '— a quiet avatar, never shouting.'],
          ]} />
          <WfCell step="Screen 6" title="Growth" Comp={WfGrowth} legend={[
            ['Add entry (+)', '— weight or height, manual.'],
            ['WHO percentile curve', 'with this baby’s line plotted over the bands.'],
          ]} />
          <WfCell step="Screen 7" title="Family / Caregivers" Comp={WfCaregivers} legend={[
            ['Owner badge;', 'tap a person to manage or remove. Up to 10.'],
            ['Add by email —', 'pending invites listed with a Revoke action.'],
          ]} />
          <WfCell step="Screen 8" title="Settings" Comp={WfSettings} />
        </div>

        <div className="subhead">Supporting flows · light-touch</div>
        <div className="phones">
          <WfCell step="Flow" title="Sign in / up" Comp={WfSignIn} />
          <WfCell step="Flow" title="Baby setup" Comp={WfBabySetup} legend={[
            ['Only name + birthdate', 'are required — sex, weight & length come later, if ever.'],
          ]} />
          <WfCell step="Flow" title="Accept invite" Comp={WfAcceptInvite} legend={[
            ['One tap', 'to accept and link to the shared baby.'],
          ]} />
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SectionWireframes });
