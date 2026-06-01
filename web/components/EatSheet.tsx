"use client";
import { useState } from "react";
import type { EatDetails } from "@/lib/types";
import { clockTime } from "@/lib/format";
import { IcCheck, IcChevL, IcClock, IcEat, IcPlus, IcX } from "@/lib/icons";
import { Button, Expander } from "./ui";

const SOURCES: [NonNullable<EatDetails["source"]>, string][] = [
  ["breast_l", "Breast L"],
  ["breast_r", "Breast R"],
  ["bottle", "Bottle"],
  ["solid", "Solid"],
];

export default function EatSheet({ onSave, onClose }: { onSave: (d: EatDetails) => void; onClose: () => void }) {
  const startedAt = useState(() => new Date().toISOString())[0];
  const [amount, setAmount] = useState<number | null>(null);
  const [what, setWhat] = useState<EatDetails["what"] | undefined>(undefined);
  const [source, setSource] = useState<EatDetails["source"] | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const save = () => {
    const d: EatDetails = {};
    if (amount != null) d.amount_ml = amount;
    if (what) d.what = what;
    if (source) d.source = source;
    if (notes.trim()) d.notes = notes.trim();
    onSave(d);
  };

  return (
    <div className="sheet-screen" onClick={onClose} role="dialog" aria-modal="true" aria-label="Log a feed">
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="screen-body" style={{ paddingTop: 2 }}>
          <div className="appbar" style={{ paddingBottom: 6 }}>
            <span className="verb-ic eat" style={{ width: 40, height: 40, borderRadius: 13 }}>
              <IcEat size={22} />
            </span>
            <span className="ttl">Eat</span>
            <span className="spacer" />
            <button className="iconbtn primary-target" onClick={onClose} aria-label="Close" type="button">
              <IcX size={22} />
            </button>
          </div>

          {/* When — defaults to now (editing time is Phase 3) */}
          <div
            style={{
              width: "100%",
              textAlign: "left",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <span className="verb-go" style={{ background: "var(--eat-tint)", color: "var(--eat)" }}>
              <IcClock size={20} />
            </span>
            <span>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                When
              </span>
              <span style={{ display: "block", fontSize: 18, fontWeight: 800 }}>Now · {clockTime(startedAt)}</span>
            </span>
          </div>

          {/* Optional details — collapsed by default; Save works with none of this */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "2px 16px 6px" }}>
            <Expander label="Details · optional">
              <div className="field">
                <label>
                  Amount <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· optional</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    className="iconbtn"
                    style={{ background: "var(--surface-2)", width: 48, height: 48 }}
                    onClick={() => setAmount((a) => Math.max(0, (a ?? 0) - 10))}
                    aria-label="Decrease amount"
                    type="button"
                  >
                    <IcChevL size={18} />
                  </button>
                  <span className="mono" style={{ fontSize: 26, fontWeight: 600, minWidth: 92, textAlign: "center" }}>
                    {amount == null ? "—" : amount} <span style={{ fontSize: 15, color: "var(--fg-muted)" }}>ml</span>
                  </span>
                  <button
                    className="iconbtn"
                    style={{ background: "var(--surface-2)", width: 48, height: 48 }}
                    onClick={() => setAmount((a) => (a == null ? 60 : a + 10))}
                    aria-label="Increase amount"
                    type="button"
                  >
                    <IcPlus size={18} />
                  </button>
                </div>
              </div>

              <div className="field">
                <label>What</label>
                <div className="chiprow">
                  <button className={"chip" + (what === "milk" ? " on" : "")} onClick={() => setWhat(what === "milk" ? undefined : "milk")} type="button">
                    Milk
                  </button>
                  <button className={"chip" + (what === "food" ? " on" : "")} onClick={() => setWhat(what === "food" ? undefined : "food")} type="button">
                    Food
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Source</label>
                <div className="chiprow">
                  {SOURCES.map(([id, label]) => (
                    <button
                      key={id}
                      className={"chip" + (source === id ? " on" : "")}
                      onClick={() => setSource(source === id ? undefined : id)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field" style={{ marginBottom: 4 }}>
                <label htmlFor="notes">Notes</label>
                <input id="notes" className="input" placeholder="Anything to remember…" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </Expander>
          </div>

          <div style={{ height: 12 }} />
          <Button kind="primary" size="lg" icon={<IcCheck size={20} />} onClick={save}>
            Save feed
          </Button>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
