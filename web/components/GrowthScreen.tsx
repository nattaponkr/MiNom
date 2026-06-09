"use client";
import { useCallback, useEffect, useState } from "react";
import type { Baby, GrowthKind, Measurement, SessionUser } from "@/lib/types";
import { formatDateBE, num } from "@/lib/format";
import { getRepo } from "@/lib/sync/repo";
import { IcCheck, IcChevR, IcGrow, IcPlus, IcX } from "@/lib/icons";
import { Button } from "./ui";
import WhenCard from "./WhenCard";
import PercentileChart, { AgeCaption, Citation, SexPrompt, ageMonthsBetween, type ChartPoint } from "./PercentileChart";
import GrowthDetailSheet from "./GrowthDetailSheet";
import { ConfirmSheet } from "./Sheets";
import { track } from "@/lib/analytics";
import { t } from "@/i18n";

const UNDO_MS = 5000;

// Add OR edit a measurement (#13). When `editing` is set, the form pre-fills and the
// CTA becomes บันทึกการแก้ไข; the parent routes save → add vs update.
function MeasurementSheet({
  kind,
  editing,
  onSave,
  onClose,
}: {
  kind: GrowthKind;
  editing?: Measurement | null;
  onSave: (value: number, measuredAt: string) => void;
  onClose: () => void;
}) {
  const [measuredAt, setMeasuredAt] = useState(() => editing?.measured_at ?? new Date().toISOString());
  const [raw, setRaw] = useState(() => (editing ? String(editing.value) : ""));
  const [touched, setTouched] = useState(false);
  const value = parseFloat(raw);
  const valid = !Number.isNaN(value) && value > 0;
  const unit = kind === "weight" ? t("growth.unit.kg") : t("growth.unit.cm");

  return (
    <div className="sheet-screen" onClick={onClose} role="dialog" aria-modal="true" aria-label={editing ? t("growth.detail.edit") : t("growth.add")}>
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

          <Button kind="primary" size="lg" disabled={!valid} style={editing ? { background: "var(--grow-strong)" } : undefined} onClick={() => valid && onSave(value, measuredAt)}>
            {editing ? t("growth.detail.saveEdit") : t("common.save")}
          </Button>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}

export default function GrowthScreen({ baby, me, onNavSettings }: { baby: Baby; me: SessionUser; onNavSettings?: () => void }) {
  const [kind, setKind] = useState<GrowthKind>("weight");
  const [rows, setRows] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Measurement | null>(null);
  const [detail, setDetail] = useState<Measurement | null>(null);
  const [confirmDel, setConfirmDel] = useState<Measurement | null>(null);
  const [undo, setUndo] = useState<{ m: Measurement; timer: ReturnType<typeof setTimeout> } | null>(null);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    const repo = await getRepo();
    setRows(await repo.listMeasurements(baby.id));
    setLoading(false);
  }, [baby.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Part 5 — realtime re-plot: a peer's new/edited/deleted measurement re-fetches
  // the list (~1s), so the chart stays live. Measurements are their own table, so
  // this is a dedicated subscription (separate from the activity realtime path).
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const repo = await getRepo();
      unsub = repo.subscribeMeasurements(baby.id, () => void reload());
    })();
    return () => unsub();
  }, [baby.id, reload]);

  // Caregiver id→name map for the detail sheet's "บันทึกโดย" field.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const repo = await getRepo();
        const cgs = await repo.listCaregivers(baby.id);
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const c of cgs) map[c.user_id] = c.display_name;
        setNameMap(map);
      } catch {
        /* names just fall back to a generic caregiver label */
      }
    })();
    return () => {
      alive = false;
    };
  }, [baby.id]);

  const ofKind = rows.filter((m) => m.kind === kind);
  const unit = kind === "weight" ? t("growth.unit.kg") : t("growth.unit.cm");
  const chrono = [...ofKind].reverse(); // oldest→newest, matches the chart x-order
  const sex = baby.sex ?? null;
  const ageMoToday = ageMonthsBetween(baby.birthdate, new Date().toISOString());
  // age at each measurement drives the x-position (real WHO chart is age-based, #15).
  const chartPoints: ChartPoint[] = chrono.map((m) => ({ ageMo: ageMonthsBetween(baby.birthdate, m.measured_at), value: m.value, dateBE: formatDateBE(m.measured_at) }));
  const whoOf = (m: Measurement) => (m.logged_by_user_id === me.id ? t("timeline.you") : (nameMap[m.logged_by_user_id] ?? t("care.roleCaregiver")));
  const summaryOf = (m: Measurement) => `${num(m.value)} ${m.kind === "weight" ? t("growth.unit.kg") : t("growth.unit.cm")}`;

  const save = async (value: number, measuredAt: string) => {
    const repo = await getRepo();
    await repo.addMeasurement({ id: crypto.randomUUID(), baby_id: baby.id, kind, value, measured_at: measuredAt });
    track("activity_logged", { type: "grow", seconds_to_log: 0, was_backdated: Date.now() - new Date(measuredAt).getTime() > 70000 });
    setAddOpen(false);
    void reload();
  };

  const saveEdit = async (value: number, measuredAt: string) => {
    if (!editing) return;
    const repo = await getRepo();
    await repo.updateMeasurement(editing.id, { value, measured_at: measuredAt });
    track("activity_edited", { type: "grow" });
    setEditing(null);
    void reload();
  };

  // Optimistic delete + 5s undo (#13). Measurements aren't in the activity outbox, so
  // this is a self-contained optimistic remove → server delete → re-add on undo.
  const doDelete = async (m: Measurement) => {
    setConfirmDel(null);
    setDetail(null);
    setRows((prev) => prev.filter((x) => x.id !== m.id));
    const repo = await getRepo();
    try {
      await repo.deleteMeasurement(m.id);
    } catch {
      /* offline: reappears on next reload */
    }
    track("activity_deleted", { type: "grow" });
    if (undo) clearTimeout(undo.timer);
    const timer = setTimeout(() => setUndo(null), UNDO_MS);
    setUndo({ m, timer });
  };

  const doUndo = async () => {
    if (!undo) return;
    clearTimeout(undo.timer);
    const m = undo.m;
    setUndo(null);
    const repo = await getRepo();
    try {
      await repo.addMeasurement({ id: m.id, baby_id: m.baby_id, kind: m.kind, value: m.value, measured_at: m.measured_at });
    } catch {
      /* offline: restore locally; syncs on reconnect via reload */
    }
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
      ) : rows.length === 0 ? (
        // first-launch (both metrics empty) — the full-screen empty, unchanged
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
      ) : ofKind.length === 0 ? (
        // this metric empty but the other has data — per-metric tappable nudge
        <button className="gr-empty" onClick={() => setAddOpen(true)} type="button" lang="th">
          <span className="gi">
            <IcGrow size={26} />
          </span>
          <span className="gt">{t("growth.historyEmpty.title")}</span>
          <span className="gb">{t("growth.historyEmpty.body", { kind: kind === "weight" ? t("growth.weight") : t("growth.height") })}</span>
          <span className="gcta">
            <IcPlus size={16} /> {t("growth.historyEmpty.cta")}
          </span>
        </button>
      ) : (
        <>
          <div className="wc-card">
            <PercentileChart metric={kind} sex={sex} ageMo={ageMoToday} points={chartPoints} onPick={(i) => setDetail(chrono[i])} />
          </div>
          <AgeCaption ageMo={ageMoToday} />
          <Citation />
          {/* Part 4 — sex unset: chart degrades to points+axes+marker (no curves); prompt to set it. */}
          {!sex && <SexPrompt onSetSex={() => onNavSettings?.()} />}
          <div className="tl-day gr-history-h">{t("growth.history")}</div>
          {ofKind.map((m) => (
            <button className="gr-row" key={m.id} onClick={() => setDetail(m)} type="button" lang="th">
              <span className="gr-ic">
                <IcGrow size={20} />
              </span>
              <span className="gr-meta">
                <span className="gr-value">
                  <span className="n">{num(m.value)}</span>
                  <span className="u">{unit}</span>
                </span>
                <span className="gr-date">{formatDateBE(m.measured_at)}</span>
              </span>
              <span className="gr-go">
                <IcChevR size={18} />
              </span>
            </button>
          ))}
        </>
      )}

      {(addOpen || editing) && (
        <MeasurementSheet
          kind={editing ? editing.kind : kind}
          editing={editing}
          onSave={editing ? saveEdit : save}
          onClose={() => {
            setAddOpen(false);
            setEditing(null);
          }}
        />
      )}

      {detail && (
        <GrowthDetailSheet
          measurement={detail}
          whoName={whoOf(detail)}
          onEdit={(m) => {
            setDetail(null);
            setEditing(m);
          }}
          onRequestDelete={(m) => {
            setDetail(null);
            setConfirmDel(m);
          }}
          onClose={() => setDetail(null)}
        />
      )}

      {confirmDel && (
        <ConfirmSheet
          title={t("growth.detail.delConfirmTitle")}
          body={t("growth.detail.delBody", { summary: summaryOf(confirmDel) })}
          confirmLabel={t("growth.detail.delConfirm")}
          cancelLabel={t("growth.detail.delKeep")}
          danger
          onConfirm={() => void doDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {undo && (
        <div className="snackbar-wrap">
          <div className="snackbar snack-v2" role="status">
            <span className="snk-msg">
              <IcCheck size={16} /> {t("timeline.detail.deleted")}
            </span>
            <span className="snk-actions">
              <button className="snk-btn" onClick={() => void doUndo()} type="button">
                {t("feedback.undo")}
              </button>
            </span>
            <span className="snk-prog" />
          </div>
        </div>
      )}
    </div>
  );
}
