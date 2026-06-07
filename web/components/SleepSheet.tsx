"use client";
import { useEffect, useState } from "react";
import type { Activity } from "@/lib/types";
import { ago, clockTime, duration } from "@/lib/format";
import { sleepActiveMs } from "@/lib/activity";
import { IcCheck, IcClock, IcPause, IcPlay, IcSleep, IcX } from "@/lib/icons";
import { Button } from "./ui";
import WhenCard from "./WhenCard";
import { t } from "@/i18n";

// Active sleep elapsed as HH:MM:SS — pause-aware (excludes resumed false-alarm wakes).
function fmtHMS(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export default function SleepSheet({
  running,
  editing,
  lastWokeAt,
  noteDraft,
  onNoteDraftChange,
  onStart,
  onPause,
  onResume,
  onComplete,
  onEditTime,
  onUpdate,
  onClose,
}: {
  running: Activity | null; // the active session — running OR paused (carries paused_at)
  editing?: Activity | null; // a completed sleep being edited (from the Timeline detail sheet)
  lastWokeAt: string | null;
  noteDraft: string; // parent-held (#12), survives close + pause/resume
  onNoteDraftChange: (v: string) => void;
  onStart: (startedAt: string, details?: Record<string, unknown>) => void;
  onPause: (id: string) => void; // Running → Paused
  onResume: (id: string) => void; // Paused → Running
  onComplete: (id: string) => void; // Paused/Running → Complete (ended_at = paused_at when paused)
  onEditTime?: () => void; // #14: open the mid-session start-time picker
  onUpdate?: (id: string, startedAt: string, details?: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const paused = !!running?.paused_at;
  const [now, setNow] = useState(Date.now());
  const [startAt, setStartAt] = useState(() => editing?.started_at ?? new Date().toISOString());
  const [manual, setManual] = useState(false);
  // Editing a *completed* sleep keeps its own local notes (the parent draft is the
  // live-session draft); session idle/running/paused uses the parent noteDraft.
  const [editNotes, setEditNotes] = useState(() => (editing?.details_json as { notes?: string } | undefined)?.notes ?? "");

  const notesField = (
    <div className="field" style={{ margin: "0 0 4px" }}>
      <label htmlFor="sleep-notes">
        {t("eat.notes.label")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
      </label>
      <textarea id="sleep-notes" className="notes-area" placeholder={t("eat.notes.placeholder")} value={noteDraft} onChange={(e) => onNoteDraftChange(e.target.value)} />
    </div>
  );

  // Edit a completed sleep (from the Timeline detail sheet): adjust the start time +
  // notes; the recorded (pause-aware) duration shows for context. Saves via onUpdate.
  if (editing && editing.ended_at) {
    // #14 Part 6: started_at editable; duration recomputes live as it changes. Cap the
    // editable start at min(ended_at, first pause) so it can't cross the end or a pause.
    const pl = ((editing.details_json as { pause_log?: { paused_at: string; resumed_at: string }[] }).pause_log) ?? [];
    const pauseMs = pl.reduce((s, p) => s + Math.max(0, new Date(p.resumed_at).getTime() - new Date(p.paused_at).getTime()), 0);
    const endMs = new Date(editing.ended_at).getTime();
    const firstPauseMs = pl.length ? Math.min(...pl.map((p) => new Date(p.paused_at).getTime())) : null;
    const editMaxISO = new Date(firstPauseMs != null ? Math.min(endMs, firstPauseMs) : endMs).toISOString();
    const recorded = duration(Math.max(0, endMs - new Date(startAt).getTime() - pauseMs));
    const saveEdit = () => onUpdate?.(editing.id, startAt, editNotes.trim() ? { ...(editing.details_json ?? {}), notes: editNotes.trim() } : (editing.details_json ?? {}));
    const editNotesField = (
      <div className="field" style={{ margin: "0 0 4px" }}>
        <label htmlFor="sleep-notes-edit">
          {t("eat.notes.label")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
        </label>
        <textarea id="sleep-notes-edit" className="notes-area" placeholder={t("eat.notes.placeholder")} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
      </div>
    );
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
            <WhenCard verb="sleep" startedAt={startAt} onChange={setStartAt} maxISO={editMaxISO} />
            {editNotesField}
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

  // Tick 1s while running; paused freezes (no interval) so the elapsed holds.
  useEffect(() => {
    if (!running || paused) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running, paused]);

  const elapsedMs = running ? sleepActiveMs(running, now) : 0;

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

          <div className={"sp-timer" + (running ? (paused ? " paused" : " running") : "")} aria-live="polite">
            {running ? (
              <>
                <div className={"sp-status " + (paused ? "held" : "live")}>
                  <span className="dot" />
                  {paused ? t("sleep.paused") : t("sleep.sleeping")}
                </div>
                <div className={"sp-big" + (paused ? " paused" : "")}>{fmtHMS(elapsedMs)}</div>
                {paused ? (
                  <div className="sp-frozen-cap">{t("sleep.frozenCap")}</div>
                ) : (
                  <div className="sp-sub">{t("sleep.startedBy", { time: clockTime(running.started_at), name: running._mine ? t("timeline.you") : running.logged_by_name })}</div>
                )}
              </>
            ) : (
              <>
                <div className="sp-status">{lastWokeAt ? t("sleep.awake", { dur: ago(lastWokeAt, now) }) : t("sleep.idleHint")}</div>
                <div className="sp-big idle">00:00:00</div>
                <div className="sp-sub">{t("sleep.idleHint")}</div>
              </>
            )}
          </div>

          {/* #14: reinstated แก้ไข on the เวลา card during Running + Paused */}
          {running && onEditTime && (
            <div className="te-when te-sleep">
              <span className="te-when-ic">
                <IcClock size={18} />
              </span>
              <span className="te-when-meta">
                <span className="te-when-k">{t("eat.when.label")}</span>
                <span className="te-when-v">{t("sleep.startedAt", { time: clockTime(running.started_at) })}</span>
              </span>
              <button className="te-edit" type="button" onClick={onEditTime} title={t("time.editHint")}>
                {t("time.editWhileRunning")}
              </button>
            </div>
          )}

          {running ? (
            paused ? (
              <>
                {notesField}
                {/* paused: two equal-weight choices — never primary-vs-destructive */}
                <div className="sp-actions-pair">
                  <button className="sp-btn resume" type="button" onClick={() => onResume(running.id)}>
                    <IcPlay size={18} /> {t("sleep.resume")}
                  </button>
                  <button className="sp-btn complete" type="button" onClick={() => onComplete(running.id)}>
                    <IcCheck size={18} /> {t("sleep.complete")}
                  </button>
                </div>
              </>
            ) : (
              <>
                {notesField}
                {/* running: single หยุด — pause glyph; freezes, does not end */}
                <Button kind="primary" size="lg" icon={<IcPause size={18} />} style={{ background: "var(--sleep-strong)" }} onClick={() => onPause(running.id)}>
                  {t("sleep.pause")}
                </Button>
              </>
            )
          ) : (
            <>
              {manual && <WhenCard verb="sleep" startedAt={startAt} onChange={setStartAt} />}
              {notesField}
              <Button kind="primary" size="lg" icon={<IcPlay size={18} />} style={{ background: "var(--sleep-strong)" }} onClick={() => onStart(manual ? startAt : new Date().toISOString(), noteDraft.trim() ? { notes: noteDraft.trim() } : undefined)}>
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
