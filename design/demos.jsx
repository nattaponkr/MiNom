// demos.jsx — interactive UX state demos for the States section.
const { useState: uS, useEffect: uE, useRef: uR } = React;

function useResetting(initial) {
  const [v, setV] = uS(initial);
  const t = uR(null);
  const setFor = (val, ms, back) => { setV(val); clearTimeout(t.current); if (ms) t.current = setTimeout(() => setV(back !== undefined ? back : initial), ms); };
  uE(() => () => clearTimeout(t.current), []);
  return [v, setV, setFor];
}

const Stage = ({ children, style }) => <div className="demo-stage" style={style}>{children}</div>;
const DemoShell = ({ title, desc, children, ctrls, note }) => (
  <div className="demo">
    <div className="demo-head"><span><span className="dt" style={{ display: 'block' }}>{title}</span><span className="dd">{desc}</span></span></div>
    {children}
    {ctrls && <div className="demo-ctrls">{ctrls}</div>}
    {note && <div className="demo-note">{note}</div>}
  </div>
);

// 1 — Optimistic log + undo
function DemoOptimisticUndo() {
  const [logged, setLogged] = uS(false);
  const [snack, setSnack] = uS(false);
  const tRef = uR(null);
  const log = () => {
    setLogged(true); setSnack(true);
    clearTimeout(tRef.current); tRef.current = setTimeout(() => setSnack(false), 5000);
  };
  const undo = () => { setLogged(false); setSnack(false); clearTimeout(tRef.current); };
  uE(() => () => clearTimeout(tRef.current), []);
  return (
    <DemoShell title="Optimistic logging + undo" desc="The write feels instant; the network catches up behind it."
      note={<>Tap commits <b>immediately</b> (optimistic) and shows a 5-second <code>Undo</code>. If the server rejects, we silently roll back and toast an error. No spinner on the happy path — logging must feel free.</>}
      ctrls={<><button className="dbtn pri" onClick={log} disabled={logged}>Tap to log Eat</button><button className="dbtn" onClick={undo} disabled={!logged}>Reset</button></>}>
      <Stage>
        <div className="mini">
          <div className="mini-card">
            <span className="mini-ic" style={{ background: 'var(--eat-tint)', color: 'var(--eat)' }}><IcEat size={24} /></span>
            <span style={{ flex: 1 }}>
              <span className="verb-name">Eat</span>
              <span style={{ display: 'block', fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', transition: 'color .2s' }}>
                {logged ? 'just now' : '1h 12m '}<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)' }}>{logged ? '' : 'ago'}</span>
              </span>
            </span>
            <span className="verb-go"><IcChevR size={18} /></span>
          </div>
        </div>
        {snack && (
          <div className="snackbar"><IcCheck size={16} /> Eat logged<button className="undo" onClick={undo}>UNDO</button><span className="snk-prog" /></div>
        )}
      </Stage>
    </DemoShell>
  );
}

// 2 — Save button feedback loop
function DemoSaveButton() {
  const [state, setState] = uS('idle'); // idle | loading | success
  const go = () => { setState('loading'); setTimeout(() => setState('success'), 1100); setTimeout(() => setState('idle'), 2600); };
  return (
    <DemoShell title="Action feedback — Save" desc="Idle → loading → success → reset. Button width is locked so nothing jumps."
      note={<>Used when a save genuinely waits on the network (e.g. editing a past entry). Spinner replaces the label in place; success shows a check for ~1.5s before the sheet dismisses.</>}
      ctrls={<button className="dbtn pri" onClick={go} disabled={state !== 'idle'}>Run save</button>}>
      <Stage style={{ display: 'grid', placeItems: 'center', padding: 18 }}>
        {state === 'success'
          ? <div className="success-pop"><span className="ring"><IcCheck size={28} /></span><span style={{ fontWeight: 700, fontSize: 14 }}>Saved</span></div>
          : <Button kind="primary" size="lg" loading={state === 'loading'} style={{ maxWidth: 240, pointerEvents: 'none' }} icon={state === 'idle' ? <IcCheck size={20} /> : null}>{state === 'loading' ? 'Saving' : 'Save feed'}</Button>}
      </Stage>
    </DemoShell>
  );
}

// 3 — Real-time sync arrival
function DemoSync() {
  const base = [
    { id: 0, verb: 'sleep', t: 'Sleep · 1h 32m', who: 'Mom', time: '7:33' },
    { id: 1, verb: 'eat', t: 'Eat · 120 ml', who: 'Dad', time: '8:21' },
  ];
  const [rows, setRows] = uS(base);
  const [toast, setToast] = uS(false);
  const [bump, setBump] = uS(false);
  const idRef = uR(2);
  const add = () => {
    const r = { id: idRef.current++, verb: 'diaper', t: 'Diaper · wet', who: 'Nanny', time: 'now', fresh: true };
    setRows(p => [r, ...p]); setBump(true); setToast(true);
    setTimeout(() => setBump(false), 400); setTimeout(() => setToast(false), 2600);
  };
  return (
    <DemoShell title="Real-time sync arrival" desc="A caregiver's entry appears within 5s, gently announced."
      note={<>New rows slide in with a brief tint and a non-intrusive toast. The presence avatar bumps. We never steal focus or move what the user is already reading below.</>}
      ctrls={<><button className="dbtn pri" onClick={add}>Nanny logs a diaper</button><button className="dbtn" onClick={() => setRows(base)}>Reset</button></>}>
      <Stage>
        {toast && <div className="toast info"><Avatar name="Nanny" /> Nanny added a diaper · now</div>}
        <div className="mini">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <span className={bump ? 'presence-bump' : ''} style={{ display: 'inline-flex' }}><Avatar name="Nanny" size="lg" /></span>
          </div>
          {rows.map(r => {
            const Ic = VERB_ICON[r.verb];
            return (
              <div key={r.id} className={'act-row' + (r.fresh ? ' sync-row' : '')} style={{ padding: '10px 4px' }}>
                <span className={'act-ic ' + r.verb} style={{ width: 36, height: 36 }}><Ic size={18} /></span>
                <span className="act-main"><span className="act-title" style={{ fontSize: 14 }}>{r.t}</span>
                  <span className="who"><Avatar name={r.who} /><span className="nm">{r.who}</span></span></span>
                <span className="act-time">{r.time}</span>
              </div>
            );
          })}
        </div>
      </Stage>
    </DemoShell>
  );
}

Object.assign(window, { Stage, DemoShell, useResetting, DemoOptimisticUndo, DemoSaveButton, DemoSync });
