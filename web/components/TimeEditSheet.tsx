"use client";
// Mid-session / completed start-time picker (#14). Reuses the native datetime-local
// idiom (not a custom wheel) + steppers, with the three-step validation surfaced inline:
//   Risk C (future)  → Risk A (after first pause/switch)  → Risk B (active overlap).
// Save is visible but disabled until the picked value is valid; rejects render inline,
// never a modal. Duration preview recalculates live: (end − picked) − Σ pauses.
import { useState } from "react";
import { clockTime, dateTime, fromLocalInput, isNowish, toLocalInput } from "@/lib/format";
import { IcCheck, IcClock, IcX } from "@/lib/icons";
import { t } from "@/i18n";

function fmtDur(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return mm > 0 ? `${h} ${t("units.h")} ${mm} ${t("units.m")}` : `${h} ${t("units.h")}`;
  return `${m} ${t("units.m")}`;
}

export default function TimeEditSheet({
  verb,
  startedAt,
  endMs,
  pauseMs = 0,
  firstEventMs = null,
  firstEventReason = null,
  blockOverlap = false,
  onSave,
  onClose,
}: {
  verb: "sleep" | "eat";
  startedAt: string;
  endMs: number; // now (running) | paused_at (paused) | ended_at (completed)
  pauseMs?: number; // Σ completed pauses (Sleep); 0 for Eat
  firstEventMs?: number | null; // min(pause_log.paused_at) | first side-switch ts | null
  firstEventReason?: "pause" | "switch" | null;
  blockOverlap?: boolean; // Risk B — a concurrent active same-verb session exists
  onSave: (newISO: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState(() => new Date(startedAt).getTime());
  const [fieldOpen, setFieldOpen] = useState(false);

  const clampMax = Math.min(endMs, Date.now()); // Risk C bound (future / past ended_at)
  const maxAllowable = firstEventMs != null ? Math.min(firstEventMs, clampMax) : clampMax;

  // Validation, in the §05 order.
  const error =
    picked > clampMax
      ? t("time.editError.future")
      : firstEventMs != null && picked > firstEventMs
        ? t(firstEventReason === "switch" ? "time.editError.afterSwitch" : "time.editError.afterPause")
        : blockOverlap
          ? t("time.editError.overlap")
          : null;
  const valid = !error;
  const durMs = endMs - picked - pauseMs;

  const step = (deltaMin: number) => setPicked((p) => Math.min(maxAllowable, p + deltaMin * 60000));
  const accent = `var(--${verb}-strong)`;
  const pickedISO = new Date(picked).toISOString();
  const display = isNowish(pickedISO) ? clockTime(pickedISO) : dateTime(pickedISO);

  return (
    <div className={"sheet-screen te-" + verb} onClick={onClose} role="dialog" aria-modal="true" aria-label={t("time.picker.title")}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="screen-body te-picker" lang="th" style={{ paddingTop: 2 }}>
          <div className="appbar" style={{ paddingBottom: 4 }}>
            <span className="ttl">{t("time.picker.title")}</span>
            <span className="spacer" />
            <button className="iconbtn primary-target" onClick={onClose} aria-label={t("common.cancel")} type="button">
              <IcX size={22} />
            </button>
          </div>
          <p className="te-picker-sub">{t(verb === "sleep" ? "time.picker.subSleep" : "time.picker.subEat")}</p>

          {/* max-allowable hint — only when a prior pause/switch caps the reach (Risk A) */}
          {firstEventMs != null && (
            <div className="te-hint">
              <IcClock size={14} /> {t(firstEventReason === "switch" ? "time.hint.beforeSwitch" : "time.hint.beforePause")}
            </div>
          )}

          <button className={"te-field" + (error ? " invalid" : "")} type="button" onClick={() => setFieldOpen((o) => !o)}>
            <span className="te-field-k">{t("time.picker.field")}</span>
            <span className="te-field-v mono">{display}</span>
          </button>
          {fieldOpen && (
            <input
              type="datetime-local"
              className="input"
              style={{ marginTop: 8 }}
              value={toLocalInput(pickedISO)}
              max={toLocalInput(new Date(maxAllowable).toISOString())}
              onChange={(e) => {
                if (!e.target.value) return;
                setPicked(new Date(fromLocalInput(e.target.value)).getTime());
              }}
            />
          )}

          <div className="te-steppers">
            {[-10, -1, 1, 10].map((d) => (
              <button key={d} className="te-step" type="button" disabled={d > 0 && picked + d * 60000 > maxAllowable} onClick={() => step(d)}>
                {d > 0 ? `+${d}` : d} {t("units.m")}
              </button>
            ))}
          </div>

          {/* live duration preview */}
          <div className="te-preview">
            <span>{t("time.picker.newDuration")}</span>
            <span className="mono">{fmtDur(durMs)}</span>
          </div>

          {error && (
            <div className="te-error">
              <IcX size={14} /> {error}
            </div>
          )}

          <div className="te-actions">
            <button className="te-cancel" type="button" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button className="te-save" type="button" disabled={!valid} style={{ background: accent }} onClick={() => valid && onSave(pickedISO)}>
              <IcCheck size={18} /> {t("common.save")}
            </button>
          </div>
          <div style={{ height: 6 }} />
        </div>
      </div>
    </div>
  );
}
