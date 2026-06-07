"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity, Baby, DiaperKind, EatDetails, Profile, SessionUser, VerbType } from "@/lib/types";
import { ago } from "@/lib/format";
import { useActivityLog } from "@/lib/sync/useActivityLog";
import { getRepo } from "@/lib/sync/repo";
import { DEFAULT_EAT, eatDefaults, eatSummary, isEatV2, type EatDefaults } from "@/lib/eat";
import { track } from "@/lib/analytics";
import HomeScreen from "./HomeScreen";
import Timeline from "./Timeline";
import EatSheet from "./EatSheet";
import DiaperSheet from "./DiaperSheet";
import SleepSheet from "./SleepSheet";
import TimeEditSheet from "./TimeEditSheet";
import GrowthScreen from "./GrowthScreen";
import SettingsScreen from "./SettingsScreen";
import CaregiversScreen from "./CaregiversScreen";
import TabBar, { type Tab } from "./TabBar";
import { ConcurrencySheet } from "./Sheets";
import { UndoSnackbar, SyncToast } from "./Feedback";
import { t } from "@/i18n";

export default function Main({
  me,
  profile,
  baby,
  onSignOut,
}: {
  me: SessionUser;
  profile: Profile | null;
  baby: Baby;
  onSignOut: () => void;
}) {
  const log = useActivityLog(baby.id, me);
  const [tab, setTab] = useState<Tab>("home");
  const [eatOpen, setEatOpen] = useState(false);
  const [editingEat, setEditingEat] = useState<Activity | null>(null);
  const [eatDefs, setEatDefs] = useState<EatDefaults>(DEFAULT_EAT);
  const [eatNoteDraft, setEatNoteDraft] = useState(""); // note draft for the active feeding session (survives sheet close)
  const recentEatsRef = useRef<Activity[]>([]); // server eat history (any day) for smart defaults
  const [diaperOpen, setDiaperOpen] = useState(false);
  const [editingDiaper, setEditingDiaper] = useState<Activity | null>(null);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [sleepSeed, setSleepSeed] = useState<Activity | null>(null);
  const [editingSleep, setEditingSleep] = useState<Activity | null>(null);
  const [sleepNoteDraft, setSleepNoteDraft] = useState(""); // note draft for the active sleep session (#12) — survives close + pause/resume
  // Mid-session/completed start-time edit (#14): the picker target + a 5s undo toast.
  const [timeEdit, setTimeEdit] = useState<{ id: string; verb: "sleep" | "eat"; startedAt: string; endMs: number; pauseMs: number; firstEventMs: number | null; firstEventReason: "pause" | "switch" | null; blockOverlap: boolean } | null>(null);
  const [timeUndo, setTimeUndo] = useState<{ id: string; prev: { started_at: string; details_json: Record<string, unknown> } } | null>(null);
  const timeUndoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [concurrency, setConcurrency] = useState<{ name: string; agoText: string; timer: boolean } | null>(null);
  const [sleepConc, setSleepConc] = useState<{ name: string; agoText: string; hit: Activity } | null>(null);
  const [coCaregivers, setCoCaregivers] = useState(0); // caregivers besides me → gates the Home family hint
  const openedAt = useRef(0); // sheet open time → seconds_to_log

  // Co-caregiver count for the Home family-hint visibility (#07).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const repo = await getRepo();
        const cgs = await repo.listCaregivers(baby.id);
        if (alive) setCoCaregivers(cgs.filter((c) => c.user_id !== me.id).length);
      } catch {
        /* ignore — hint just stays visible until it loads */
      }
    })();
    return () => {
      alive = false;
    };
  }, [baby.id, me.id]);

  // Load this caregiver's recent eat history once per baby → smart last-used
  // defaults (roams across devices via the server, satisfying mode-persistence).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const repo = await getRepo();
        const rows = await repo.recentEats(baby.id, 20);
        if (!alive) return;
        recentEatsRef.current = rows;
        setEatDefs(eatDefaults(rows, me.id));
      } catch {
        /* offline: generic defaults until history loads */
      }
    })();
    return () => {
      alive = false;
    };
  }, [baby.id, me.id]);

  // Freshest defaults: merge live today-activities with loaded server history.
  const computeEatDefaults = (): EatDefaults => {
    const seen = new Set<string>();
    const merged: Activity[] = [];
    for (const a of [...log.activities, ...recentEatsRef.current]) {
      if (a.type !== "eat" || seen.has(a.id)) continue;
      seen.add(a.id);
      merged.push(a);
    }
    merged.sort((x, y) => (x.started_at < y.started_at ? 1 : -1));
    return eatDefaults(merged, me.id);
  };
  const eatModeOf = (d: Record<string, unknown>) => (isEatV2(d) ? d.mode : "legacy");

  // seconds open→save; was_backdated if the chosen time is well before now.
  const logMetrics = (startedAt: string) => ({
    seconds_to_log: Math.max(0, Math.round((Date.now() - openedAt.current) / 1000)),
    was_backdated: Date.now() - new Date(startedAt).getTime() > 70000,
  });

  const openEat = async () => {
    openedAt.current = Date.now();
    setEditingEat(null);
    setEatDefs(computeEatDefaults());
    setEatOpen(true);
    if (log.runningEat) return; // an active session is showing — no new-feed concurrency check
    const hit = await log.checkConcurrent("eat");
    if (hit)
      setConcurrency({
        name: hit._mine ? t("timeline.you") : hit.logged_by_name,
        agoText: ago(hit.started_at),
        timer: isEatV2(hit.details_json) && hit.details_json.mode === "bm" && hit.details_json.capture === "timer",
      });
  };

  const saveEat = (d: EatDetails, startedAt: string) => {
    track("activity_logged", { type: "eat", mode: eatModeOf(d), ...logMetrics(startedAt) });
    log.log("eat", d, startedAt);
    setEatOpen(false);
    setEditingEat(null);
  };

  // ── นมแม่ active feeding session (#11) — parent-held, mirrors Sleep ──
  // Seed the note draft when a session begins (from the row), clear it when it ends.
  const runningEatId = log.runningEat?.id ?? null;
  useEffect(() => {
    if (!runningEatId) {
      setEatNoteDraft("");
      return;
    }
    const r = log.activities.find((a) => a.id === runningEatId);
    setEatNoteDraft(((r?.details_json as { notes?: string } | undefined)?.notes ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningEatId]);

  const startEatSession = (side: "L" | "R") => log.startEat(side);
  const switchEatSession = (side: "L" | "R") => {
    if (log.runningEat) log.switchEat(log.runningEat.id, side);
  };
  const toggleEatSide = () => {
    const cur = (log.runningEat?.details_json as { side?: "L" | "R" } | undefined)?.side ?? "L";
    switchEatSession(cur === "L" ? "R" : "L");
  };
  const stopEatSession = () => {
    if (!log.runningEat) return;
    track("activity_logged", { type: "eat", mode: "bm", ...logMetrics(log.runningEat.started_at) });
    log.stopEat(log.runningEat.id, eatNoteDraft);
    setEatOpen(false);
    setEditingEat(null);
  };

  // Edit-from-toast: re-open the just-logged entry pre-filled, save as an update.
  const openEditEat = (a: Activity) => {
    openedAt.current = Date.now();
    setEatDefs(computeEatDefaults());
    setEditingEat(a);
    setEatOpen(true);
  };
  const updateEat = (id: string, d: EatDetails, startedAt: string) => {
    const a = log.activities.find((x) => x.id === id);
    track("activity_edited", { type: "eat", mode: eatModeOf(d), hours_after_create: a ? Math.round((Date.now() - new Date(a.started_at).getTime()) / 3600000) : 0 });
    log.update(id, d, startedAt);
    setEatOpen(false);
    setEditingEat(null);
  };

  // Repeat last feed (Home affordance) — duplicate at now, named confirmation.
  const repeatLastEat = () => {
    const last = log.activities.find((a) => a.type === "eat") ?? recentEatsRef.current[0];
    if (!last) return;
    track("activity_logged", { type: "eat", mode: eatModeOf(last.details_json), repeated: true, seconds_to_log: 0, was_backdated: false });
    log.repeatLast(last);
  };

  const openDiaper = () => {
    openedAt.current = Date.now();
    setEditingDiaper(null);
    setDiaperOpen(true);
  };
  const saveDiaper = (kind: DiaperKind, startedAt: string, notes?: string) => {
    track("activity_logged", { type: "diaper", ...logMetrics(startedAt) });
    log.log("diaper", { kind, ...(notes ? { notes } : {}) }, startedAt);
    setDiaperOpen(false);
    setEditingDiaper(null);
  };
  // Part-4 parity: [แก้ไข] on the Diaper save toast reopens the entry pre-filled.
  const openEditDiaper = (a: Activity) => {
    openedAt.current = Date.now();
    setEditingDiaper(a);
    setDiaperOpen(true);
  };
  const updateDiaper = (id: string, kind: DiaperKind, startedAt: string, notes?: string) => {
    track("activity_edited", { type: "diaper" });
    log.update(id, { kind, ...(notes ? { notes } : {}) }, startedAt);
    setDiaperOpen(false);
    setEditingDiaper(null);
  };

  // Sleep: if a timer is already running locally, just open it. Otherwise check
  // for a near-simultaneous start by another caregiver (concurrency, option A).
  const openSleep = async () => {
    openedAt.current = Date.now();
    setEditingSleep(null);
    if (log.runningSleep) {
      setSleepSeed(null);
      setSleepOpen(true);
      return;
    }
    const hit = await log.checkConcurrent("sleep");
    if (hit && !hit.ended_at) {
      setSleepConc({ name: hit._mine ? t("timeline.you") : hit.logged_by_name, agoText: ago(hit.started_at), hit });
    } else {
      setSleepSeed(null);
      setSleepOpen(true);
    }
  };
  const closeSleep = () => {
    setSleepOpen(false);
    setSleepSeed(null);
    setEditingSleep(null);
  };

  // Sleep note draft (#12) — seed when a session begins (from the row), clear when it ends.
  // Mirrors the eat draft; keyed on the active session id so it survives close/pause/resume.
  const runningSleepId = log.runningSleep?.id ?? null;
  useEffect(() => {
    if (!runningSleepId) {
      setSleepNoteDraft("");
      return;
    }
    const r = log.activities.find((a) => a.id === runningSleepId);
    setSleepNoteDraft((r?.details_json as { notes?: string } | undefined)?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningSleepId]);

  // Sleep three-state handlers (#12) — same code path for sheet + Home card + Timeline row.
  const pauseSleepSession = () => {
    if (log.runningSleep) log.pauseSleep(log.runningSleep.id);
  };
  const resumeSleepSession = () => {
    if (log.runningSleep) log.resumeSleep(log.runningSleep.id);
  };
  const completeSleepSession = () => {
    if (!log.runningSleep) return;
    const a = log.runningSleep;
    track("activity_logged", { type: "sleep", hours_after_create: Math.round((Date.now() - new Date(a.started_at).getTime()) / 3600000) });
    log.stopSleep(a.id, sleepNoteDraft);
    closeSleep();
  };

  // ── Start-time editing (#14) — Running/Paused (Sleep+Eat) + completed (Part 6) ──
  // Compute the constraint set for the picker from the row + the live activity list.
  const timeConstraints = (a: Activity) => {
    const now = Date.now();
    const completed = !!a.ended_at;
    const endMs = a.ended_at ? new Date(a.ended_at).getTime() : a.paused_at ? new Date(a.paused_at).getTime() : now;
    let pauseMs = 0;
    let firstEventMs: number | null = null;
    let firstEventReason: "pause" | "switch" | null = null;
    if (a.type === "sleep") {
      const pl = ((a.details_json as { pause_log?: { paused_at: string; resumed_at: string }[] }).pause_log) ?? [];
      pauseMs = pl.reduce((s, p) => s + Math.max(0, new Date(p.resumed_at).getTime() - new Date(p.paused_at).getTime()), 0);
      const pausedAts = [...pl.map((p) => new Date(p.paused_at).getTime()), ...(a.paused_at ? [new Date(a.paused_at).getTime()] : [])];
      if (pausedAts.length) {
        firstEventMs = Math.min(...pausedAts);
        firstEventReason = "pause";
      }
    } else {
      const sw = ((a.details_json as { switches?: { at: string; from: string }[] }).switches) ?? [];
      if (sw.length) {
        firstEventMs = new Date(sw[0].at).getTime();
        firstEventReason = "switch";
      }
    }
    // Risk B: another ACTIVE same-verb session (not this row) → block. Never for completed.
    const blockOverlap = !completed && log.activities.some((x) => x.type === a.type && !x.ended_at && x.id !== a.id);
    return { id: a.id, verb: a.type as "sleep" | "eat", startedAt: a.started_at, endMs, pauseMs, firstEventMs, firstEventReason, blockOverlap };
  };
  const openTimeEdit = (a: Activity | null) => {
    if (a && (a.type === "sleep" || a.type === "eat")) setTimeEdit(timeConstraints(a));
  };
  const commitTimeEdit = (newISO: string) => {
    if (!timeEdit) return;
    const a = log.activities.find((x) => x.id === timeEdit.id);
    const prev = log.editStartedAt(timeEdit.id, newISO);
    if (prev) {
      track("activity_started_at_edited", {
        verb: timeEdit.verb,
        state_when_edited: a?.ended_at ? "completed" : a?.paused_at ? "paused" : "running",
        from_time_iso: prev.started_at,
        to_time_iso: newISO,
        delta_seconds: Math.round((new Date(newISO).getTime() - new Date(prev.started_at).getTime()) / 1000),
      });
      if (timeUndoTimer.current) clearTimeout(timeUndoTimer.current);
      setTimeUndo({ id: timeEdit.id, prev });
      timeUndoTimer.current = setTimeout(() => setTimeUndo(null), 5000);
    }
    setTimeEdit(null);
  };
  const undoTimeEdit = () => {
    if (!timeUndo) return;
    if (timeUndoTimer.current) clearTimeout(timeUndoTimer.current);
    log.patchRow(timeUndo.id, timeUndo.prev);
    setTimeUndo(null);
  };

  const lastWokeAt = log.activities.find((a) => a.type === "sleep" && a.ended_at)?.ended_at ?? null;

  // Edit a completed sleep from the Timeline detail sheet.
  const openEditSleep = (a: Activity) => {
    openedAt.current = Date.now();
    setSleepSeed(null);
    setEditingSleep(a);
    setSleepOpen(true);
  };
  const updateSleep = (id: string, startedAt: string, details?: Record<string, unknown>) => {
    track("activity_edited", { type: "sleep" });
    log.update(id, details ?? {}, startedAt);
    closeSleep();
  };

  // Timeline tap-to-edit → route to the right per-verb sheet, pre-filled.
  const openEditFromTimeline = (a: Activity) => {
    if (a.type === "eat") openEditEat(a);
    else if (a.type === "diaper") openEditDiaper(a);
    else openEditSleep(a);
  };
  // Timeline delete (detail sheet / swipe) — confirm lives in Timeline; this deletes.
  const deleteActivity = (id: string) => {
    const a = log.activities.find((x) => x.id === id);
    track("activity_deleted", { type: (a?.type as VerbType) ?? "eat" });
    void log.remove(id);
  };

  return (
    <div className="app">
      {!log.online && (
        <div className="offline-banner" role="status" aria-live="polite">
          {t("sync.offline.banner")}
        </div>
      )}

      <main className="app-main">
        {tab === "home" && (
          <HomeScreen
            baby={baby}
            profile={profile}
            activities={log.activities}
            loading={log.loading}
            online={log.online}
            forceOffline={log.forceOffline}
            onToggleOffline={() => log.setForceOffline(!log.forceOffline)}
            onLogEat={openEat}
            onLogSleep={openSleep}
            onLogDiaper={openDiaper}
            onRepeatLast={repeatLastEat}
            onOpenFamily={() => setTab("care")}
            caregiverCount={coCaregivers}
            runningSleep={log.runningSleep}
            runningEat={log.runningEat}
            onStopFeeding={stopEatSession}
            onSwitchFeeding={toggleEatSide}
            onPauseSleep={pauseSleepSession}
            onResumeSleep={resumeSleepSession}
            onCompleteSleep={completeSleepSession}
          />
        )}

        {tab === "timeline" && (
          <Timeline
            babyId={baby.id}
            babyName={baby.name}
            activities={log.activities}
            loading={log.loading}
            onEdit={openEditFromTimeline}
            onDelete={deleteActivity}
            runningEat={log.runningEat}
            onStopFeeding={stopEatSession}
            onSwitchFeeding={toggleEatSide}
            runningSleep={log.runningSleep}
            onPauseSleep={pauseSleepSession}
            onResumeSleep={resumeSleepSession}
            onCompleteSleep={completeSleepSession}
          />
        )}

        {tab === "grow" && <GrowthScreen baby={baby} me={me} />}

        {tab === "care" && <CaregiversScreen me={me} baby={baby} onChanged={onSignOut} />}

        {tab === "settings" && (
          <SettingsScreen me={me} profile={profile} baby={baby} onSignedOut={onSignOut} onProfileChanged={onSignOut} />
        )}
      </main>

      <TabBar active={tab} onNavigate={setTab} />

      {/* Overlays */}
      {eatOpen && (
        <EatSheet
          defaults={eatDefs}
          editing={editingEat}
          runningEat={editingEat ? null : log.runningEat}
          onSave={saveEat}
          onUpdate={updateEat}
          onStartEat={startEatSession}
          onSwitchEat={switchEatSession}
          onStopEat={stopEatSession}
          onEditTime={() => openTimeEdit(log.runningEat)}
          noteDraft={eatNoteDraft}
          onNoteDraftChange={setEatNoteDraft}
          onClose={() => {
            setEatOpen(false);
            setEditingEat(null);
          }}
        />
      )}

      {diaperOpen && (
        <DiaperSheet
          editing={editingDiaper}
          onSave={saveDiaper}
          onUpdate={updateDiaper}
          onClose={() => {
            setDiaperOpen(false);
            setEditingDiaper(null);
          }}
        />
      )}

      {sleepOpen && (
        <SleepSheet
          running={editingSleep ? null : (log.runningSleep ?? sleepSeed)}
          editing={editingSleep}
          onUpdate={updateSleep}
          lastWokeAt={lastWokeAt}
          noteDraft={sleepNoteDraft}
          onNoteDraftChange={setSleepNoteDraft}
          onStart={(startedAt, details) => {
            track("activity_logged", { type: "sleep", ...logMetrics(startedAt) });
            log.startSleep(startedAt, details);
          }}
          onPause={() => pauseSleepSession()}
          onResume={() => resumeSleepSession()}
          onComplete={() => completeSleepSession()}
          onEditTime={() => openTimeEdit(log.runningSleep)}
          onClose={closeSleep}
        />
      )}

      {sleepConc && (
        <ConcurrencySheet
          kind="sleep"
          name={sleepConc.name}
          agoText={sleepConc.agoText}
          onViewTheirs={() => {
            setSleepSeed(sleepConc.hit);
            setSleepConc(null);
            setSleepOpen(true);
          }}
          onLogAnyway={() => {
            setSleepSeed(null);
            setSleepConc(null);
            setSleepOpen(true);
          }}
          onDismiss={() => setSleepConc(null)}
        />
      )}

      {concurrency && (
        <ConcurrencySheet
          timer={concurrency.timer}
          name={concurrency.name}
          agoText={concurrency.agoText}
          onViewTheirs={() => {
            setConcurrency(null);
            setEatOpen(false);
            setEditingEat(null);
            setTab("timeline");
          }}
          onLogAnyway={() => setConcurrency(null)}
          onDismiss={() => setConcurrency(null)}
        />
      )}

      {timeEdit && (
        <TimeEditSheet
          verb={timeEdit.verb}
          startedAt={timeEdit.startedAt}
          endMs={timeEdit.endMs}
          pauseMs={timeEdit.pauseMs}
          firstEventMs={timeEdit.firstEventMs}
          firstEventReason={timeEdit.firstEventReason}
          blockOverlap={timeEdit.blockOverlap}
          onSave={commitTimeEdit}
          onClose={() => setTimeEdit(null)}
        />
      )}

      {timeUndo && (
        <div className="te-toast" role="status">
          <span className="te-toast-msg">{t("time.editUndo.msg")}</span>
          <button className="te-toast-undo" type="button" onClick={undoTimeEdit}>
            {t("time.editUndo.cta")}
          </button>
          <span className="te-toast-bar" />
        </div>
      )}

      {/* Feedback */}
      {log.snackbar &&
        (() => {
          const a = log.activities.find((x) => x.id === log.snackbar!.id) ?? null;
          const kind = (a?.details_json as { kind?: string } | undefined)?.kind;
          const summary = !a
            ? t("feedback.saved")
            : a.type === "eat"
              ? eatSummary(a.details_json)
              : a.type === "diaper"
                ? `${t("verb.diaper")}${kind ? " · " + t(`diaper.${kind}`) : ""}`
                : t(`verb.${a.type}`);
          return (
            <UndoSnackbar
              summary={summary}
              repeated={log.snackbar.repeated}
              onUndo={() => void log.undo(log.snackbar!.id)}
              onEdit={a?.type === "eat" ? () => openEditEat(a) : a?.type === "diaper" ? () => openEditDiaper(a) : undefined}
            />
          );
        })()}
      {log.toast && <SyncToast name={log.toast.name} />}
    </div>
  );
}
