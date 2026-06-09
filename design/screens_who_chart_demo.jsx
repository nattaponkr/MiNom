// screens_who_chart_demo.jsx — interactive Growth-chart demo (Handoff #15)
// One phone: metric tabs swap weight↔height (curves + axis + points recompute);
// a sex toggle flips between full curves and the graceful-degrade prompt.
const { useState: wdU } = React;

// Leon: boy, ~3.5 months old, four weight + four length measurements.
const DEMO_AGE_MO = 3.5;
const DEMO_POINTS = {
  weight: [
    { ageMo: 0.0, value: 3.4, dateBE: '20 ก.พ. 2569' },
    { ageMo: 1.0, value: 4.6, dateBE: '20 มี.ค. 2569' },
    { ageMo: 2.1, value: 5.8, dateBE: '23 เม.ย. 2569' },
    { ageMo: 3.4, value: 6.9, dateBE: '6 มิ.ย. 2569' },
  ],
  height: [
    { ageMo: 0.0, value: 50.5, dateBE: '20 ก.พ. 2569' },
    { ageMo: 1.0, value: 55.2, dateBE: '20 มี.ค. 2569' },
    { ageMo: 2.1, value: 59.1, dateBE: '23 เม.ย. 2569' },
    { ageMo: 3.4, value: 62.4, dateBE: '6 มิ.ย. 2569' },
  ],
};

// Full interactive growth screen
function GrowthScreen({ dark, sexSet = true, points = DEMO_POINTS, ageMo = DEMO_AGE_MO, sex = 'boy', title = 'โต' }) {
  const [metric, setMetric] = wdU('weight');
  const T = window.WHO_CHART;
  const effSex = sexSet ? sex : null;
  return (
    <PhoneFrame theme={dark ? 'dark' : 'light'}>
      <div className="screen-body" lang="th" style={{ minHeight: 560 }}>
        <div className="appbar"><span className="ttl">{title}</span><span className="spacer" />
          <button className="iconbtn" type="button"><IcPlus size={22} /></button></div>
        <MetricTabs metric={metric} onChange={setMetric} />
        <div className="wc-card">
          <PercentileChart metric={metric} sex={effSex} ageMo={ageMo} points={points[metric]} onPick={() => {}} />
          <Citation />
        </div>
        <AgeCaption ageMo={ageMo} />
        {!sexSet && <SexPrompt onSetSex={() => {}} />}
      </div>
    </PhoneFrame>
  );
}

// Empty-state variant (sex set, zero measurements)
function GrowthScreenEmpty({ dark, sex = 'boy', ageMo = DEMO_AGE_MO }) {
  const [metric, setMetric] = wdU('weight');
  return (
    <PhoneFrame theme={dark ? 'dark' : 'light'}>
      <div className="screen-body" lang="th" style={{ minHeight: 560 }}>
        <div className="appbar"><span className="ttl">โต</span><span className="spacer" />
          <button className="iconbtn" type="button"><IcPlus size={22} /></button></div>
        <MetricTabs metric={metric} onChange={setMetric} />
        <div className="wc-card">
          <PercentileChart metric={metric} sex={sex} ageMo={ageMo} points={[]} onPick={() => {}} />
          <Citation />
        </div>
        <AgeCaption ageMo={ageMo} />
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--fg-muted)' }} lang="th">เส้นโค้งคือค่าอ้างอิง · เพิ่มการวัดเพื่อเริ่มจุดของลูก</div>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, { GrowthScreen, GrowthScreenEmpty, DEMO_POINTS, DEMO_AGE_MO });
