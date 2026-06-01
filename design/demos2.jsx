// demos2.jsx — offline queue, concurrency prompt, delete confirm, validation, skeletons
const { useState: uS2 } = React;

// 4 — Offline queue
function DemoOffline() {
  const [online, setOnline] = uS2(true);
  const [rows, setRows] = uS2([]);
  const idRef = React.useRef(0);
  const log = () => setRows(p => [...p, { id: idRef.current++, synced: online }]);
  const goOnline = () => { setOnline(true); setTimeout(() => setRows(p => p.map(r => ({ ...r, synced: true }))), 600); };
  return (
    <DemoShell title="Offline-safe writes" desc="Logging never blocks on a connection."
      note={<>Writes queue locally and show a <b>Queued</b> pill; when the connection returns they flush automatically and flip to <b>Synced</b>. The parent's job (logging) is never interrupted by the network's job (syncing).</>}
      ctrls={<>
        <button className="dbtn pri" onClick={log}>Log Eat</button>
        {online ? <button className="dbtn" onClick={() => setOnline(false)}>Go offline</button> : <button className="dbtn" onClick={goOnline}>Reconnect</button>}
        <button className="dbtn" onClick={() => setRows([])}>Reset</button>
      </>}>
      <Stage>
        <div className="mini">
          <div className={'netbar ' + (online ? 'on' : 'off')} style={{ marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
            {online ? 'Online · synced' : 'Offline · changes saved on this device'}
          </div>
          {rows.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--fg-faint)', padding: '8px 4px' }}>Tap “Log Eat”, then try going offline.</div>}
          {rows.map(r => (
            <div key={r.id} className="act-row" style={{ padding: '9px 4px' }}>
              <span className="act-ic eat" style={{ width: 34, height: 34 }}><IcEat size={17} /></span>
              <span className="act-main"><span className="act-title" style={{ fontSize: 14 }}>Eat · just now</span></span>
              {r.synced
                ? <span className="queued-pill synced-pill"><IcCheck size={11} /> Synced</span>
                : <span className="queued-pill"><span className="spin-sm" /> Queued</span>}
            </div>
          ))}
        </div>
      </Stage>
    </DemoShell>
  );
}

// 5 — Concurrency soft-prompt
function DemoConcurrency() {
  const [open, setOpen] = uS2(false);
  const [resolved, setResolved] = uS2(null);
  const choose = (r) => { setOpen(false); setResolved(r); setTimeout(() => setResolved(null), 2200); };
  return (
    <DemoShell title="Concurrency — soft prompt" desc="Two caregivers, one timer. Non-blocking, dismissible."
      note={<>If someone starts a Sleep/Eat timer within 60s of another, the second sees this gentle prompt — never an error, never a block. Default action is the least surprising one (open the existing timer).</>}
      ctrls={<button className="dbtn pri" onClick={() => setOpen(true)}>Start sleep timer</button>}>
      <Stage style={{ display: 'grid', placeItems: 'center' }}>
        {resolved
          ? <div style={{ textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13, fontWeight: 600 }}>{resolved === 'open' ? "Opened Mom's running timer →" : resolved === 'new' ? 'Started a separate timer →' : 'Dismissed'}</div>
          : <div style={{ textAlign: 'center', color: 'var(--fg-faint)', fontSize: 13 }}>Press start to simulate a clash.</div>}
        {open && (
          <div className="overlay" onClick={() => setOpen(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="st">Someone’s already on it</div>
              <div className="sd"><b style={{ color: 'var(--fg)' }}>Mom</b> started a sleep timer 40s ago. Open hers, or start a separate one?</div>
              <div className="sheet-actions">
                <Button kind="primary" block onClick={() => choose('open')}>Open Mom’s timer</Button>
                <Button kind="ghost" block onClick={() => choose('new')}>Start a new one</Button>
              </div>
            </div>
          </div>
        )}
      </Stage>
    </DemoShell>
  );
}

// 6 — Delete confirmation
function DemoDelete() {
  const [exists, setExists] = uS2(true);
  const [ask, setAsk] = uS2(false);
  const [toast, setToast] = uS2(false);
  const del = () => { setAsk(false); setExists(false); setToast(true); setTimeout(() => setToast(false), 2400); };
  return (
    <DemoShell title="Destructive action — confirm" desc="Delete asks once; everything else is forgiving."
      note={<>Only irreversible actions interrupt. Delete uses a confirm sheet with the destructive option clearly colored; the safe option is the easy one to hit. A toast confirms and could offer a final undo.</>}
      ctrls={<button className="dbtn" onClick={() => setExists(true)} disabled={exists}>Restore row</button>}>
      <Stage>
        {toast && <div className="toast ok"><IcCheck size={15} /> Entry deleted</div>}
        <div className="mini">
          {exists ? (
            <div className="act-row" style={{ padding: '10px 4px', borderBottom: 'none' }}>
              <span className="act-ic eat" style={{ width: 36, height: 36 }}><IcEat size={18} /></span>
              <span className="act-main"><span className="act-title" style={{ fontSize: 14 }}>Eat · 120 ml</span><span className="act-sub">8:21 PM · by Dad</span></span>
              <button className="iconbtn" onClick={() => setAsk(true)} style={{ color: 'var(--danger)' }}><IcTrash size={18} /></button>
            </div>
          ) : <div style={{ fontSize: 12.5, color: 'var(--fg-faint)', padding: '14px 4px', textAlign: 'center' }}>Entry deleted. Restore to try again.</div>}
        </div>
        {ask && (
          <div className="overlay" onClick={() => setAsk(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="st">Delete this entry?</div>
              <div className="sd">This removes the 8:21 PM feed for everyone caring for Mina. It can’t be undone.</div>
              <div className="sheet-actions">
                <Button kind="danger" block icon={<IcTrash size={18} />} onClick={del}>Delete entry</Button>
                <Button kind="ghost" block onClick={() => setAsk(false)}>Keep it</Button>
              </div>
            </div>
          </div>
        )}
      </Stage>
    </DemoShell>
  );
}

// 7 — Form validation
function DemoValidation() {
  const [v, setV] = uS2('anna@email');
  const [touched, setTouched] = uS2(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const err = touched && !valid;
  return (
    <DemoShell title="Inline validation" desc="Validate on blur, not on every keystroke."
      note={<>Errors appear after the field loses focus (or on submit), never mid-typing. The message says what to do, the input gets a non-color cue (icon + text), and the submit stays disabled until valid.</>}>
      <Stage style={{ minHeight: 0, padding: 14 }}>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Caregiver email</label>
          <input className={'input' + (err ? ' err' : '')} value={v} onChange={e => setV(e.target.value)} onBlur={() => setTouched(true)} />
          {err
            ? <span className="input-help err"><IcX size={13} /> Enter a valid email (e.g. anna@email.com)</span>
            : <span className="input-help">We’ll email an invite link, valid for 14 days.</span>}
        </div>
        <Button kind="primary" block disabled={!valid} icon={<IcMail size={18} />}>Send invite</Button>
      </Stage>
    </DemoShell>
  );
}

// 8 — Skeleton loading
function DemoSkeleton() {
  const [loading, setLoading] = uS2(true);
  const load = () => { setLoading(true); setTimeout(() => setLoading(false), 1500); };
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 1600); return () => clearTimeout(t); }, []);
  return (
    <DemoShell title="Loading — skeletons, not spinners" desc="The screen's shape is there before the data is."
      note={<>First paint shows the layout as shimmering placeholders so the app feels instant and doesn't reflow when data lands. Reserved for true cold loads; warm navigations use cached data + optimistic writes.</>}
      ctrls={<button className="dbtn pri" onClick={load} disabled={loading}>Reload</button>}>
      <Stage>
        <div className="mini" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0, 1, 2].map(i => {
            const verbs = ['eat', 'sleep', 'diaper'];
            const Ic = VERB_ICON[verbs[i]];
            return loading ? (
              <div key={i} className="mini-card">
                <span className="sk sk-circle" style={{ width: 44, height: 44 }} />
                <span style={{ flex: 1 }}><span className="sk sk-line" style={{ width: '40%', marginBottom: 8 }} /><span className="sk sk-line" style={{ width: '62%', height: 15 }} /></span>
              </div>
            ) : (
              <div key={i} className="mini-card">
                <span className={'mini-ic ' + verbs[i]} style={{ background: `var(--${verbs[i]}-tint)`, color: `var(--${verbs[i]})` }}><Ic size={22} /></span>
                <span style={{ flex: 1 }}><span className="verb-name">{verbs[i]}</span><span style={{ display: 'block', fontSize: 17, fontWeight: 800 }}>{['1h 12m ago', '22m asleep', '2h 04m ago'][i]}</span></span>
              </div>
            );
          })}
        </div>
      </Stage>
    </DemoShell>
  );
}

Object.assign(window, { DemoOffline, DemoConcurrency, DemoDelete, DemoValidation, DemoSkeleton });
