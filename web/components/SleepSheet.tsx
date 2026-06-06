"use client";
import { useEffect, useState } from "react";
import type { Activity } from "@/lib/types";
import { ago, clockTime, duration } from "@/lib/format";
import { IcCheck, IcPlay, IcSleep, IcStop, IcX } from "@/lib/icons";
import { Button } from "./ui";
import WhenCard from "./WhenCard";
import { t } from "@/i18n";

function elapsed(fromISO: string, now: number): string {
  const s = Math.max(0, Math.floor((now - new Date(fromISO).getTime()) / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function SleepSheet({
  running,
  editing,
  lastWokeAt,
  onStart,
  onStop,
  onUpdate,
  onClose,
}: {
  running: Activity | null;
  editing?: Activity | null; // a completed sleep being edited (from the Timeline detail sheet)
  lastWokeAt: string | null;
  onStart: (startedAt: string, details?: Record<string, unknown>) => void;
  onStop: (id: string, details?: Record<string, unknown>) => void;
  onUpdate?: (id: string, startedAt: string, details?: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const seed = (running ?? editing) as Activity | null;
  const [now, setNow] = useState(Date.now());
  const [startAt, setStartAt] = useState(() => editing?.started_at ?? new Date().toISOString());
  const [manual, setManual] = useState(false);
  const [notes, setNotes] = useState(() => (seed?.details_json as { notes?: string } | undefined)?.notes ?? "");

  const notesField = (
    <div className="field" style={{ margin: "0 0 4px" }}>
      <label htmlFor="sleep-notes">
        {t("eat.notes.label")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
      </label>
      <textarea id="sleep-notes" className="notes-area" placeholder={t("eat.notes.placeholder")} value={notes} onChange={(e) => setNotes(e.target.value)} />
    </div>
  );
  const startDetails = () => (notes.trim() ? { notes: notes.trim() } : undefined);
  const stopDetails = () => (notes.trim() ? { ...(running?.details_json ?? {}), notes: notes.trim() } : undefined);

  // Edit a completed sleep (from the Timeline detail sheet): adjust the start time +
  // notes; the recorded duration shows for context. Saves via onUpdate.
  if (editing && editing.ended_at) {
    const recorded = duration(new Date(editing.ended_at).getTime() - new Date(startAt).getTime());
    const saveEdit = () => onUpdate?.(editing.id, startAt, notes.trim() ? { ...(editing.details_json ?? {}), notes: notes.trim() } : (editing.details_json ?? {}));
    return (
      <div className="sheet-screen" onClick={onClose} role="dialog" aria-modal="true" aria-label={t("sleep.title")}>
        <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
            <div className="appbar" style={{ paddingBottom: 6 }}>
              <span className="verb-ic sleep" style={{ width: 40, height: 40, borderRadius: 13 }}>
                <IcSleep size={22} />
              </span>
              <span className="ttl">{t("sleep.title")}</span>
              <span className="spacer" />
              <button className="iconbtn primary-target" onClick={onClose} aria-label={t("common.cancel")} type="button">
                <IcX size={22} />
              </button>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "20px", textAlign: "center", marginBottom: 14, boxShadow: "var(--shadow-sm)" }}>
              <div className="mono" style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em" }}>{recorded}</div>
            </div>
            <WhenCard verb="sleep" startedAt={startAt} onChange={setStartAt} />
            {notesField}
            <div style={{ height: 10 }} />
            <Button kind="primary" size="lg" icon={<IcCheck size={20} />} style={{ background: "var(--sleep-strong)" }} onClick={saveEdit}>
              {t("common.save")}
            </Button>
            <div style={{ height: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="sheet-screen" onClick={onClose} role="dialog" aria-modal="true" aria-label={t("sleep.title")}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
          <div className="appbar" style={{ paddingBottom: 6 }}>
            <span className="verb-ic sleep" style={{ width: 40, height: 40, borderRadius: 13 }}>
              <IcSleep size={22} />
            </span>
            <span className="ttl">{t("sleep.title")}</span>
            <span className="spacer" />
            <button className="iconbtn primary-target" onClick={onClose} aria-label={t("common.cancel")} type="button">
              <IcX size={22} />
            </button>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)",
              padding: "30px 20px 26px",
              textAlign: "center",
              marginBottom: 14,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {running ? (
              <>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sleep-strong)" }} aria-live="polite">
                  <span className="pulse-dot" style={{ background: "var(--sleep-strong)" }} />
                  {t("sleep.sleeping")}
                </div>
                <div className="mono" style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.03em", margin: "8px 0 4px" }}>
                  {elapsed(running.started_at, now)}
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                  {t("sleep.startedBy", { time: clockTime(running.started_at), name: running._mine ? t("timeline.you") : running.logged_by_name })}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-muted)" }}>
                  {lastWokeAt ? t("sleep.awake", { dur: ago(lastWokeAt, now) }) : t("sleep.idleHint")}
                </div>
                <div className="mono" style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.03em", margin: "8px 0 4px", color: "var(--fg-faint)" }}>
                  00:00:00
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{t("sleep.idleHint")}</div>
              </>
            )}
          </div>

          {running ? (
            <>
              {notesField}
              <Button kind="primary" size="lg" icon={<IcStop size={20} />} style={{ background: "var(--sleep-strong)" }} onClick={() => onStop(running.id, stopDetails())}>
                {t("sleep.stop")}
              </Button>
            </>
          ) : (
            <>
              {manual && <WhenCard verb="sleep" startedAt={startAt} onChange={setStartAt} />}
              {notesField}
              <Button kind="primary" size="lg" icon={<IcPlay size={18} />} style={{ background: "var(--sleep-strong)" }} onClick={() => onStart(manual ? startAt : new Date().toISOString(), startDetails())}>
                {t("sleep.start")}
              </Button>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button className="edit-aff" type="button" onClick={() => setManual((m) => !m)} style={{ color: "var(--fg-muted)" }}>
                  {t("sleep.manual")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
