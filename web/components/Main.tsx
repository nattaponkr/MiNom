"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity, Baby, DiaperKind, EatDetails, Profile, SessionUser, VerbType } from "@/lib/types";
import { ago, clockTime } from "@/lib/format";
import { useActivityLog } from "@/lib/sync/useActivityLog";
import { getRepo } from "@/lib/sync/repo";
import { DEFAULT_EAT, eatDefaults, eatSummary, isEatV2, type EatDefaults } from "@/lib/eat";
import { track } from "@/lib/analytics";
import HomeScreen from "./HomeScreen";
import Timeline from "./Timeline";
import EatSheet from "./EatSheet";
import DiaperSheet from "./DiaperSheet";
import SleepSheet from "./SleepSheet";
import GrowthScreen from "./GrowthScreen";
import SettingsScreen from "./SettingsScreen";
import CaregiversScreen from "./CaregiversScreen";
import TabBar, { type Tab } from "./TabBar";
import { ConcurrencySheet, ConfirmDeleteSheet } from "./Sheets";
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
  const recentEatsRef = useRef<Activity[]>([]); // server eat history (any day) for smart defaults
  const [diaperOpen, setDiaperOpen] = useState(false);
  const [editingDiaper, setEditingDiaper] = useState<Activity | null>(null);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [sleepSeed, setSleepSeed] = useState<Activity | null>(null);
  const [concurrency, setConcurrency] = useState<{ name: string; agoText: string; timer: boolean } | null>(null);
  const [sleepConc, setSleepConc] = useState<{ name: string; agoText: string; hit: Activity } | null>(null);
  const [deleteId, setDeleteId] = useState<{ id: string; timeText: string } | null>(null);
  const openedAt = useRef(0); // sheet open time → seconds_to_log

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
  const saveDiaper = (kind: DiaperKind, startedAt: string) => {
    track("activity_logged", { type: "diaper", ...logMetrics(startedAt) });
    log.log("diaper", { kind }, startedAt);
    setDiaperOpen(false);
    setEditingDiaper(null);
  };
  // Part-4 parity: [แก้ไข] on the Diaper save toast reopens the entry pre-filled.
  const openEditDiaper = (a: Activity) => {
    openedAt.current = Date.now();
    setEditingDiaper(a);
    setDiaperOpen(true);
  };
  const updateDiaper = (id: string, kind: DiaperKind, startedAt: string) => {
    track("activity_edited", { type: "diaper" });
    log.update(id, { kind }, startedAt);
    setDiaperOpen(false);
    setEditingDiaper(null);
  };

  // Sleep: if a timer is already running locally, just open it. Otherwise check
  // for a near-simultaneous start by another caregiver (concurrency, option A).
  const openSleep = async () => {
    openedAt.current = Date.now();
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
  };

  const lastWokeAt = log.activities.find((a) => a.type === "sleep" && a.ended_at)?.ended_at ?? null;

  const requestDelete = (id: string) => {
    const a = log.activities.find((x) => x.id === id);
    setDeleteId({ id, timeText: a ? clockTime(a.started_at) : "this" });
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
            runningSleep={log.runningSleep}
          />
        )}

        {tab === "timeline" && <Timeline babyId={baby.id} activities={log.activities} loading={log.loading} onDelete={requestDelete} />}

        {tab === "grow" && <GrowthScreen baby={baby} />}

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
          onSave={saveEat}
          onUpdate={updateEat}
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
          running={log.runningSleep ?? sleepSeed}
          lastWokeAt={lastWokeAt}
          onStart={(startedAt) => {
            track("activity_logged", { type: "sleep", ...logMetrics(startedAt) });
            log.startSleep(startedAt);
          }}
          onStop={(id) => {
            const a = log.activities.find((x) => x.id === id) ?? sleepSeed;
            track("activity_edited", { type: "sleep", hours_after_create: a ? Math.round((Date.now() - new Date(a.started_at).getTime()) / 3600000) : 0 });
            log.stopSleep(id);
            closeSleep();
          }}
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

      {deleteId && (
        <ConfirmDeleteSheet
          timeText={deleteId.timeText}
          babyName={baby.name}
          onConfirm={() => {
            const a = log.activities.find((x) => x.id === deleteId.id);
            track("activity_deleted", { type: (a?.type as VerbType) ?? "eat" });
            void log.remove(deleteId.id);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
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
