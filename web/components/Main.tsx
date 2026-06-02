"use client";
import { useState } from "react";
import type { Baby, DiaperKind, EatDetails, Profile, SessionUser } from "@/lib/types";
import { ago, clockTime } from "@/lib/format";
import { getRepo } from "@/lib/sync/repo";
import { useActivityLog } from "@/lib/sync/useActivityLog";
import HomeScreen from "./HomeScreen";
import Timeline from "./Timeline";
import EatSheet from "./EatSheet";
import DiaperSheet from "./DiaperSheet";
import SleepSheet from "./SleepSheet";
import GrowthScreen from "./GrowthScreen";
import TabBar, { type Tab } from "./TabBar";
import { ConcurrencySheet, ConfirmDeleteSheet } from "./Sheets";
import { UndoSnackbar, SyncToast } from "./Feedback";
import { Avatar, Button } from "./ui";
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
  const [diaperOpen, setDiaperOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [concurrency, setConcurrency] = useState<{ name: string; agoText: string } | null>(null);
  const [deleteId, setDeleteId] = useState<{ id: string; timeText: string } | null>(null);

  const openEat = async () => {
    setEatOpen(true);
    const hit = await log.checkConcurrent("eat");
    if (hit) setConcurrency({ name: hit._mine ? t("timeline.you") : hit.logged_by_name, agoText: ago(hit.started_at) });
  };

  const saveEat = (d: EatDetails, startedAt: string) => {
    log.log("eat", d, startedAt);
    setEatOpen(false);
  };

  const saveDiaper = (kind: DiaperKind, startedAt: string) => {
    log.log("diaper", { kind }, startedAt);
    setDiaperOpen(false);
  };

  const lastWokeAt = log.activities.find((a) => a.type === "sleep" && a.ended_at)?.ended_at ?? null;

  const requestDelete = (id: string) => {
    const a = log.activities.find((x) => x.id === id);
    setDeleteId({ id, timeText: a ? clockTime(a.started_at) : "this" });
  };

  const signOut = async () => {
    const repo = await getRepo();
    await repo.signOut();
    onSignOut();
  };

  return (
    <div className="app">
      {!log.online && <div className="offline-banner">{t("sync.offline.banner")}</div>}

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
            onLogSleep={() => setSleepOpen(true)}
            onLogDiaper={() => setDiaperOpen(true)}
            runningSleep={log.runningSleep}
          />
        )}

        {tab === "timeline" && <Timeline babyId={baby.id} activities={log.activities} loading={log.loading} onDelete={requestDelete} />}

        {tab === "grow" && <GrowthScreen baby={baby} />}

        {tab === "care" && (
          <div className="screen-body">
            <div className="appbar">
              <span className="ttl">{t("tab.care")}</span>
            </div>
            <div className="note" style={{ marginTop: 12 }} lang="th">
              {t("phase3.soon")}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="screen-body">
            <div className="appbar">
              <span className="ttl">{t("tab.settings")}</span>
            </div>
            <div className="list" style={{ marginTop: 8 }}>
              <div className="list-row">
                {profile && <Avatar name={profile.display_name} color={profile.avatar_color} size="lg" />}
                <span className="lr-main">
                  <span className="lr-t">{profile?.display_name ?? t("timeline.you")}</span>
                  <span className="lr-d">{me.email}</span>
                </span>
              </div>
              <div className="list-row">
                <span className="lr-main">
                  <span className="lr-t">{t("settings.baby")}</span>
                  <span className="lr-d">{baby.name}</span>
                </span>
              </div>
            </div>
            <div style={{ height: 16 }} />
            <Button kind="ghost" block onClick={signOut}>
              {t("settings.signOut")}
            </Button>
            <div className="note" style={{ marginTop: 16, fontSize: 12 }} lang="th">
              {t("phase3.soon")}
            </div>
          </div>
        )}
      </main>

      <TabBar active={tab} onNavigate={setTab} />

      {/* Overlays */}
      {eatOpen && <EatSheet onSave={saveEat} onClose={() => setEatOpen(false)} />}

      {diaperOpen && <DiaperSheet onSave={saveDiaper} onClose={() => setDiaperOpen(false)} />}

      {sleepOpen && (
        <SleepSheet
          running={log.runningSleep}
          lastWokeAt={lastWokeAt}
          onStart={(startedAt) => log.startSleep(startedAt)}
          onStop={(id) => {
            log.stopSleep(id);
            setSleepOpen(false);
          }}
          onClose={() => setSleepOpen(false)}
        />
      )}

      {concurrency && (
        <ConcurrencySheet
          name={concurrency.name}
          agoText={concurrency.agoText}
          onViewTheirs={() => {
            setConcurrency(null);
            setEatOpen(false);
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
            void log.remove(deleteId.id);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Feedback */}
      {log.snackbar && <UndoSnackbar onUndo={() => void log.undo(log.snackbar!.id)} />}
      {log.toast && <SyncToast name={log.toast.name} />}
    </div>
  );
}
