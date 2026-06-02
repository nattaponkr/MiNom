"use client";
import { useState } from "react";
import type { DiaperKind } from "@/lib/types";
import { IcCheck, IcDrop, IcLeaf, IcDiaper, IcX } from "@/lib/icons";
import { Button } from "./ui";
import WhenCard from "./WhenCard";
import { t } from "@/i18n";

const OPTS: DiaperKind[] = ["wet", "dirty", "both"];

export default function DiaperSheet({ onSave, onClose }: { onSave: (kind: DiaperKind, startedAt: string) => void; onClose: () => void }) {
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [sel, setSel] = useState<DiaperKind>("wet");

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

          <Button kind="primary" size="lg" icon={<IcCheck size={20} />} onClick={() => onSave(sel, startedAt)}>
            {t("diaper.cta.save")}
          </Button>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
