"use client";
import { useState } from "react";
import type { EatDetails } from "@/lib/types";
import { IcCheck, IcChevL, IcEat, IcPlus, IcX } from "@/lib/icons";
import { Button, Expander } from "./ui";
import WhenCard from "./WhenCard";
import { t } from "@/i18n";

const SOURCES: NonNullable<EatDetails["source"]>[] = ["breast_l", "breast_r", "bottle", "solid"];

export default function EatSheet({ onSave, onClose }: { onSave: (d: EatDetails, startedAt: string) => void; onClose: () => void }) {
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
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
    onSave(d, startedAt);
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
            <span className="ttl">{t("eat.title")}</span>
            <span className="spacer" />
            <button className="iconbtn primary-target" onClick={onClose} aria-label={t("common.cancel")} type="button">
              <IcX size={22} />
            </button>
          </div>

          {/* When — defaults to now; แก้ไข reveals a back-dating input (PRD §4) */}
          <WhenCard verb="eat" startedAt={startedAt} onChange={setStartedAt} />

          {/* Optional details — collapsed by default; Save works with none of this */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "2px 16px 6px" }}>
            <Expander label={t("eat.details.toggle")}>
              <div className="field">
                <label>
                  {t("eat.amount.label")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    className="iconbtn"
                    style={{ background: "var(--surface-2)", width: 48, height: 48 }}
                    onClick={() => setAmount((a) => Math.max(0, (a ?? 0) - 10))}
                    aria-label="−"
                    type="button"
                  >
                    <IcChevL size={18} />
                  </button>
                  <span className="mono" style={{ fontSize: 26, fontWeight: 600, minWidth: 92, textAlign: "center" }}>
                    {amount == null ? "—" : amount}{" "}
                    <span style={{ fontSize: 15, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>{t("eat.amount.unit")}</span>
                  </span>
                  <button
                    className="iconbtn"
                    style={{ background: "var(--surface-2)", width: 48, height: 48 }}
                    onClick={() => setAmount((a) => (a == null ? 60 : a + 10))}
                    aria-label="+"
                    type="button"
                  >
                    <IcPlus size={18} />
                  </button>
                </div>
              </div>

              <div className="field">
                <label>{t("eat.what.label")}</label>
                <div className="chiprow">
                  <button className={"chip" + (what === "milk" ? " on" : "")} onClick={() => setWhat(what === "milk" ? undefined : "milk")} type="button">
                    {t("eat.what.milk")}
                  </button>
                  <button className={"chip" + (what === "food" ? " on" : "")} onClick={() => setWhat(what === "food" ? undefined : "food")} type="button">
                    {t("eat.what.food")}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>{t("eat.source.label")}</label>
                <div className="chiprow">
                  {SOURCES.map((id) => (
                    <button
                      key={id}
                      className={"chip" + (source === id ? " on" : "")}
                      onClick={() => setSource(source === id ? undefined : id)}
                      type="button"
                    >
                      {t(`eat.source.${id}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field" style={{ marginBottom: 4 }}>
                <label htmlFor="notes">{t("eat.notes.label")}</label>
                <input id="notes" className="input" placeholder={t("eat.notes.placeholder")} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </Expander>
          </div>

          <div style={{ height: 12 }} />
          <Button kind="primary" size="lg" icon={<IcCheck size={20} />} onClick={save}>
            {t("eat.cta.save")}
          </Button>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
