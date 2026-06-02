// ละมุน (Lamoon) brand marks — ported from design/brand.jsx. Styles in
// styles/brand.css. Internal code stays "MiNom"; these are user-facing only.

export function LamoonWordmark({ size = 22, onClay = false, weight = 500 }: { size?: number; onClay?: boolean; weight?: number }) {
  return (
    <span className={"lamoon-wm" + (onClay ? " on-clay" : "")} style={{ fontSize: size }}>
      <span className="lm-dot" />
      <span className="lm-word" lang="th" style={{ fontWeight: weight }}>
        ละมุน
      </span>
    </span>
  );
}

export function LamoonIcon({ size = 64 }: { size?: number }) {
  return (
    <span className="lamoon-icon" style={{ width: size, height: size, fontSize: size * 0.56 }}>
      <span className="glyph" lang="th">
        ล
      </span>
    </span>
  );
}
