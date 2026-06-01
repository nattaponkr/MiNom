// ui.jsx — shared primitives: PhoneFrame, Avatar, Button, etc.
const { useState } = React;

// ---- Phone frame. theme prop forces light/dark scope; omit to inherit. ----
function PhoneFrame({ theme, time = '9:41', children, dark }) {
  const t = theme || (dark ? 'dark' : undefined);
  return (
    <div className="phone" data-theme={t}>
      <div className="phone-screen">
        <StatusBar time={time} />
        {children}
        <div className="home-ind" />
      </div>
    </div>
  );
}

function StatusBar({ time }) {
  return (
    <div className="statusbar">
      <span>{time}</span>
      <span className="sb-r">
        <svg className="sig" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4"/></svg>
        <svg className="wifi" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 4.2a10 10 0 0 1 14 0M3.4 6.8a6.5 6.5 0 0 1 9.2 0"/><circle cx="8" cy="9.8" r="0.9" fill="currentColor" stroke="none"/></svg>
        <span className="bar" />
      </span>
    </div>
  );
}

const PALETTE = {
  Mom:   'oklch(0.62 0.13 25)',
  Dad:   'oklch(0.55 0.10 250)',
  Nanny: 'oklch(0.58 0.11 160)',
  Gran:  'oklch(0.60 0.10 300)',
};
function Avatar({ name, size = '', color }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bg = color || PALETTE[name] || 'oklch(0.55 0.08 60)';
  return <span className={'avatar ' + size} style={{ background: bg }}>{initials}</span>;
}

function Button({ kind = 'primary', size, children, icon, loading, disabled, style, block }) {
  const cls = ['btn', `btn-${kind}`, size === 'lg' && 'btn-lg', block && 'btn-block', disabled && 'btn-disabled']
    .filter(Boolean).join(' ');
  return (
    <button className={cls} disabled={disabled} style={style}>
      {loading ? <span className="spin" /> : icon}
      {children}
    </button>
  );
}

// Expander (used by Eat details — inline variant)
function Expander({ label, open: openProp, children }) {
  const [open, setOpen] = useState(openProp || false);
  return (
    <div className={'expander' + (open ? ' open' : '')}>
      <button className="expander-h" onClick={() => setOpen(o => !o)}>
        {label}
        <span className="chev"><IcChevD size={18} /></span>
      </button>
      {open && <div style={{ paddingBottom: 14 }}>{children}</div>}
    </div>
  );
}

// Generic WHO percentile chart placeholder (soft curves + a few plotted dots)
function PercentileChart({ accent = 'var(--grow)' }) {
  const curves = [22, 40, 60, 82, 104, 130]; // baseline y for bands at right edge
  return (
    <div className="chart-ph">
      <svg viewBox="0 0 320 188" preserveAspectRatio="none">
        {/* grid */}
        {[40, 80, 120, 160, 200, 240, 280].map(x => <line key={x} x1={x} y1="8" x2={x} y2="172" stroke="var(--border)" strokeWidth="1" />)}
        {[40, 80, 120, 160].map(y => <line key={y} x1="8" y1={y} x2="312" y2={y} stroke="var(--border)" strokeWidth="1" />)}
        {/* percentile bands */}
        {[[10,150],[30,124],[50,98],[70,74],[90,50],[97,30]].map(([p, y], i) => (
          <path key={p} d={`M8 ${y + 22} C 90 ${y + 12}, 200 ${y + 2}, 312 ${y - 8}`}
                fill="none" stroke="var(--border-strong)" strokeWidth={p === 50 ? 2 : 1.3}
                strokeDasharray={p === 50 ? '0' : '4 5'} opacity={p === 50 ? 0.9 : 0.6} />
        ))}
        {/* baby's plotted line */}
        <path d="M40 132 C 110 118, 180 96, 250 78 L 288 70" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        {[[40,132],[120,114],[200,90],[288,70]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4.5" fill={accent} stroke="var(--surface)" strokeWidth="2.5" />
        ))}
      </svg>
    </div>
  );
}

Object.assign(window, { PhoneFrame, StatusBar, Avatar, Button, Expander, PercentileChart, PALETTE });
