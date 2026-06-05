"use client";
import { useState } from "react";
import type { Activity, DiaperKind } from "@/lib/types";
import { IcCheck, IcDrop, IcLeaf, IcDiaper, IcX } from "@/lib/icons";
import { Button } from "./ui";
import WhenCard from "./WhenCard";
import { t } from "@/i18n";

const OPTS: DiaperKind[] = ["wet", "dirty", "both"];

export default function DiaperSheet({
  editing,
  onSave,
  onUpdate,
  onClose,
}: {
  editing?: Activity | null;
  onSave: (kind: DiaperKind, startedAt: string, notes?: string) => void;
  onUpdate?: (id: string, kind: DiaperKind, startedAt: string, notes?: string) => void;
  onClose: () => void;
}) {
  const seed = editing?.details_json as { kind?: DiaperKind; notes?: string } | undefined;
  const [startedAt, setStartedAt] = useState(() => editing?.started_at ?? new Date().toISOString());
  const [sel, setSel] = useState<DiaperKind>(seed?.kind ?? "wet");
  const [notes, setNotes] = useState(seed?.notes ?? "");
  const save = () => {
    const n = notes.trim() || undefined;
    if (editing && onUpdate) onUpdate(editing.id, sel, startedAt, n);
    else onSave(sel, startedAt, n);
  };

  return (
    <div className="sheet-screen" onClick={onClose} role="dialog" aria-modal="true" aria-label={t("diaper.title")}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
          <div className="appbar" style={{ paddingBottom: 10 }}>
            <span className="verb-ic diaper" style={{ width: 40, height: 40, borderRadius: 13 }}>
              <IcDiaper size={22} />
            </span>
            <span className="ttl">{t("diaper.title")}</span>
            <span className="spacer" />
            <button className="iconbtn primary-target" onClick={onClose} aria-label={t("common.cancel")} type="button">
              <IcX size={22} />
            </button>
          </div>

          <div className="seg" style={{ marginBottom: 14 }} role="radiogroup" aria-label={t("diaper.title")}>
            {OPTS.map((id) => {
              const on = id === sel;
              return (
                <button
                  key={id}
                  className={"seg-opt" + (on ? " on diaper" : "")}
                  onClick={() => setSel(id)}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  style={{ minHeight: 64 }}
                >
                  <span className="si">
                    {id === "wet" && <IcDrop size={24} filled={on} />}
                    {id === "dirty" && <IcLeaf size={24} filled={on} />}
                    {id === "both" && (
                      <span style={{ display: "flex", gap: 2 }}>
                        <IcDrop size={18} filled={on} />
                        <IcLeaf size={18} filled={on} />
                      </span>
                    )}
                  </span>
                  {t(`diaper.${id}`)}
                </button>
              );
            })}
          </div>

          <WhenCard verb="diaper" startedAt={startedAt} onChange={setStartedAt} />

          <div className="field" style={{ marginBottom: 4 }}>
            <label htmlFor="diaper-notes">
              {t("eat.notes.label")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
            </label>
            <textarea id="diaper-notes" className="notes-area" placeholder={t("eat.notes.placeholder")} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button kind="primary" size="lg" icon={<IcCheck size={20} />} onClick={save}>
            {t("diaper.cta.save")}
          </Button>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
