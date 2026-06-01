"use client";
import { useState } from "react";
import type { Baby, EatDetails, Profile, SessionUser, VerbType } from "@/lib/types";
import { ago, clockTime } from "@/lib/format";
import { getRepo } from "@/lib/sync/repo";
import { useActivityLog } from "@/lib/sync/useActivityLog";
import HomeScreen from "./HomeScreen";
import Timeline from "./Timeline";
import EatSheet from "./EatSheet";
import TabBar, { type Tab } from "./TabBar";
import { ComingSoonSheet } from "./ComingSoon";
import { ConcurrencySheet, ConfirmDeleteSheet } from "./Sheets";
import { UndoSnackbar, SyncToast } from "./Feedback";
import { Avatar, Button } from "./ui";

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
  const [comingSoon, setComingSoon] = useState<VerbType | null>(null);
  const [concurrency, setConcurrency] = useState<{ name: string; agoText: string } | null>(null);
  const [deleteId, setDeleteId] = useState<{ id: string; timeText: string } | null>(null);

  const openEat = async () => {
    setEatOpen(true);
    const hit = await log.checkConcurrent("eat");
    if (hit) setConcurrency({ name: hit._mine ? "You" : hit.logged_by_name, agoText: ago(hit.started_at) });
  };

  const saveEat = (d: EatDetails) => {
    log.log("eat", d);
    setEatOpen(false);
  };

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
      {!log.online && <div className="offline-banner">Offline · changes saved on this device</div>}

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
            onComingSoon={(v) => setComingSoon(v)}
          />
        )}

        {tab === "timeline" && <Timeline activities={log.activities} loading={log.loading} onDelete={requestDelete} />}

        {(tab === "grow" || tab === "care") && (
          <div className="screen-body">
            <div className="appbar">
              <span className="ttl">{tab === "grow" ? "Growth" : "Family"}</span>
            </div>
            <div className="note" style={{ marginTop: 12 }}>
              <b>Phase 3.</b> {tab === "grow" ? "Growth charts" : "Caregiver management"} isn’t part of the walking
              skeleton — this phase proves the architecture on Eat only.
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="screen-body">
            <div className="appbar">
              <span className="ttl">Settings</span>
            </div>
            <div className="list" style={{ marginTop: 8 }}>
              <div className="list-row">
                {profile && <Avatar name={profile.display_name} color={profile.avatar_color} size="lg" />}
                <span className="lr-main">
                  <span className="lr-t">{profile?.display_name ?? "You"}</span>
                  <span className="lr-d">{me.email}</span>
                </span>
              </div>
              <div className="list-row">
                <span className="lr-main">
                  <span className="lr-t">Baby</span>
                  <span className="lr-d">{baby.name}</span>
                </span>
              </div>
            </div>
            <div style={{ height: 16 }} />
            <Button kind="ghost" block onClick={signOut}>
              Sign out
            </Button>
            <div className="note" style={{ marginTop: 16, fontSize: 12 }}>
              Units, data export, caregivers &amp; account deletion are Phase 3.
            </div>
          </div>
        )}
      </main>

      <TabBar active={tab} onNavigate={setTab} />

      {/* Overlays */}
      {eatOpen && <EatSheet onSave={saveEat} onClose={() => setEatOpen(false)} />}

      {comingSoon && <ComingSoonSheet verb={comingSoon} onClose={() => setComingSoon(null)} />}

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
