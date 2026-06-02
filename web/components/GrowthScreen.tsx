"use client";
import { useCallback, useEffect, useState } from "react";
import type { Baby, GrowthKind, Measurement } from "@/lib/types";
import { formatDate, num } from "@/lib/format";
import { getRepo } from "@/lib/sync/repo";
import { IcGrow, IcPlus, IcTrash, IcX } from "@/lib/icons";
import { Button } from "./ui";
import WhenCard from "./WhenCard";
import PercentileChart from "./PercentileChart";
import { ConfirmDeleteSheet } from "./Sheets";
import { track } from "@/lib/analytics";
import { t } from "@/i18n";

function AddMeasurementSheet({ kind, babyName, onSave, onClose }: { kind: GrowthKind; babyName: string; onSave: (value: number, measuredAt: string) => void; onClose: () => void }) {
  const [measuredAt, setMeasuredAt] = useState(() => new Date().toISOString());
  const [raw, setRaw] = useState("");
  const [touched, setTouched] = useState(false);
  const value = parseFloat(raw);
  const valid = !Number.isNaN(value) && value > 0;
  const unit = kind === "weight" ? t("growth.unit.kg") : t("growth.unit.cm");

  return (
    <div className="sheet-screen" onClick={onClose} role="dialog" aria-modal="true" aria-label={t("growth.add")}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
          <div className="appbar" style={{ paddingBottom: 6 }}>
            <span className="verb-ic grow" style={{ width: 40, height: 40, borderRadius: 13 }}>
              <IcGrow size={22} />
            </span>
            <span className="ttl">{kind === "weight" ? t("growth.weight") : t("growth.height")}</span>
            <span className="spacer" />
            <button className="iconbtn primary-target" onClick={onClose} aria-label={t("common.cancel")} type="button">
              <IcX size={22} />
            </button>
          </div>

          <div className="field">
            <label htmlFor="gval">{t(kind === "weight" ? "growth.value.weight" : "growth.value.height", { unit })}</label>
            <input
              id="gval"
              className={"input" + (touched && !valid ? " err" : "")}
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={t(kind === "weight" ? "growth.placeholder.weight" : "growth.placeholder.height")}
              autoFocus
            />
            {touched && !valid && (
              <span className="input-help err">
                <IcX size={13} /> {t("growth.valueError")}
              </span>
            )}
          </div>

          <WhenCard verb="grow" startedAt={measuredAt} onChange={setMeasuredAt} />

          <Button kind="primary" size="lg" disabled={!valid} onClick={() => valid && onSave(value, measuredAt)}>
            {t("common.save")}
          </Button>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}

export default function GrowthScreen({ baby }: { baby: Baby }) {
  const [kind, setKind] = useState<GrowthKind>("weight");
  const [rows, setRows] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const repo = await getRepo();
    setRows(await repo.listMeasurements(baby.id));
    setLoading(false);
  }, [baby.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const ofKind = rows.filter((m) => m.kind === kind);
  const unit = kind === "weight" ? t("growth.unit.kg") : t("growth.unit.cm");
  // chart wants chronological (oldest→newest)
  const chartValues = [...ofKind].reverse().map((m) => m.value);

  const save = async (value: number, measuredAt: string) => {
    const repo = await getRepo();
    await repo.addMeasurement({ id: crypto.randomUUID(), baby_id: baby.id, kind, value, measured_at: measuredAt });
    track("activity_logged", { type: "grow", seconds_to_log: 0, was_backdated: Date.now() - new Date(measuredAt).getTime() > 70000 });
    setAddOpen(false);
    void reload();
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    const repo = await getRepo();
    await repo.deleteMeasurement(deleteId);
    track("activity_deleted", { type: "grow" });
    setDeleteId(null);
    void reload();
  };

  return (
    <div className="screen-body">
      <div className="appbar">
        <span className="ttl">{t("growth.title")}</span>
        <span className="spacer" />
        <button className="iconbtn primary-target" onClick={() => setAddOpen(true)} aria-label={t("growth.add")} type="button">
          <IcPlus size={22} />
        </button>
      </div>

      <div className="chiprow" style={{ marginBottom: 14 }} role="tablist">
        <button className={"chip" + (kind === "weight" ? " on" : "")} onClick={() => setKind("weight")} type="button" role="tab" aria-selected={kind === "weight"}>
          {t("growth.weight")}
        </button>
        <button className={"chip" + (kind === "height" ? " on" : "")} onClick={() => setKind("height")} type="button" role="tab" aria-selected={kind === "height"}>
          {t("growth.height")}
        </button>
      </div>

      {loading ? (
        <div className="sk sk-line" style={{ height: 188, borderRadius: "var(--r-lg)" }} />
      ) : ofKind.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, padding: "30px 18px" }}>
          <span style={{ width: 68, height: 68, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--fg-faint)" }}>
            <IcGrow size={30} />
          </span>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{t("growth.empty.title")}</div>
          <div style={{ fontSize: 13.5, color: "var(--fg-muted)", lineHeight: 1.5, maxWidth: 240 }}>{t("growth.empty.body", { baby: baby.name })}</div>
          <div style={{ marginTop: 6 }}>
            <Button kind="primary" icon={<IcPlus size={18} />} onClick={() => setAddOpen(true)}>
              {t("growth.empty.cta")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PercentileChart values={chartValues} />
          <div style={{ fontSize: 12, color: "var(--fg-faint)", textAlign: "center", margin: "6px 0 2px" }}>{t("growth.chartLabel")}</div>
          <div className="tl-day">{t("growth.history")}</div>
          {ofKind.map((m) => (
            <div className="act-row" key={m.id}>
              <span className="act-main">
                <span className="act-title mono">
                  {num(m.value)} {unit}
                </span>
                <span className="act-sub">{formatDate(m.measured_at)}</span>
              </span>
              <button className="iconbtn" style={{ color: "var(--danger)", width: 48, height: 48 }} onClick={() => setDeleteId(m.id)} aria-label={t("a11y.deleteEntry")} type="button">
                <IcTrash size={18} />
              </button>
            </div>
          ))}
        </>
      )}

      {addOpen && <AddMeasurementSheet kind={kind} babyName={baby.name} onSave={save} onClose={() => setAddOpen(false)} />}
      {deleteId && (
        <ConfirmDeleteSheet timeText="" babyName={baby.name} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} generic />
      )}
    </div>
  );
}
