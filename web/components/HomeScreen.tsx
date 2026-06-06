"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity, Baby, Profile, VerbType } from "@/lib/types";
import { ago, ageLabel, todayWeekday } from "@/lib/format";
import { IcChevR, IcEat, IcRepeat, IcStop, IcUsers, VERB_ICON } from "@/lib/icons";
import { eatSummary } from "@/lib/eat";

// Live elapsed of an active feeding session — accumulated per-side + the current segment.
function feedingMs(a: Activity, now: number): number {
  const d = a.details_json as { perSideMs?: { L?: number; R?: number }; segStart?: string };
  return (d.perSideMs?.L ?? 0) + (d.perSideMs?.R ?? 0) + (d.segStart ? now - new Date(d.segStart).getTime() : 0);
}
function feedingSideLabel(a: Activity): string {
  return t(`eat.breast.${((a.details_json as { side?: string }).side ?? "L") === "L" ? "left" : "right"}`);
}
function fmtMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
}
import { Avatar } from "./ui";
import ThemeToggle from "./ThemeToggle";
import OfflineToggle from "./OfflineToggle";
import { t } from "@/i18n";
import { isDebug } from "@/lib/debug";

// Live mm:ss (h:mm:ss past an hour) for the running-sleep card timer.
function liveElapsed(fromISO: string, now: number): string {
  const s = Math.max(0, Math.floor((now - new Date(fromISO).getTime()) / 1000));
  const h = Math.floor(s / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
}

// Part-4 parity: Sleep/Diaper share the Eat card's muted-context + bold-detail
// hierarchy (no modes / repeat bar — those are Eat-only). Verb-colored icon.
function VerbCardV2({
  verb,
  name,
  context,
  detail,
  empty,
  isLive,
  onClick,
}: {
  verb: VerbType;
  name: string;
  context?: string;
  detail: React.ReactNode;
  empty?: boolean;
  isLive?: boolean;
  onClick: () => void;
}) {
  const Ic = VERB_ICON[verb];
  return (
    <div className={"eat-card-v2 " + verb} lang="th">
      <button className="eat-card-main" onClick={onClick} aria-label={`${name}${context ? " · " + context : ""}`}>
        <span className="vi">
          <Ic size={28} />
        </span>
        <span className="eat-card-meta">
          <span className="eat-card-row1">
            <span className="eat-card-name">{name}</span>
            {context && <span className="eat-card-when">{context}</span>}
          </span>
          <span className={"eat-card-detail" + (empty ? " empty" : "")}>
            {isLive && <span className="pulse-dot" style={{ background: `var(--${verb})` }} />}
            {detail}
          </span>
        </span>
        <span className="eat-card-go">
          <IcChevR size={18} />
        </span>
      </button>
    </div>
  );
}

// Eat v2 home card: muted "กิน · {relative}" context over a bold mode-encoded
// hero stat-line, plus a visible "ทำซ้ำครั้งล่าสุด" bar (disabled with no feed).
// `flash` rings the card to confirm a just-logged/repeated feed.
function EatCardV2({
  lastEat,
  runningEat,
  now,
  flash,
  onOpen,
  onRepeat,
  onStop,
  onSwitch,
}: {
  lastEat: Activity | null;
  runningEat: Activity | null;
  now: number;
  flash: boolean;
  onOpen: () => void;
  onRepeat: () => void;
  onStop: () => void;
  onSwitch: () => void;
}) {
  // Active feeding session — live elapsed + หยุด / สลับข้าง quick actions (#11).
  if (runningEat) {
    return (
      <div className="eat-card-v2 feeding" lang="th">
        <button className="eat-card-main" onClick={onOpen} aria-label={t("home.eat.feeding")}>
          <span className="vi">
            <IcEat size={28} />
          </span>
          <span className="eat-card-meta">
            <span className="eat-card-row1">
              <span className="eat-card-name">{t("home.eat.name")}</span>
            </span>
            <span className="ep-live">
              <span className="dot" />
              <span className="ctx">{t("home.eat.feedingSide", { side: feedingSideLabel(runningEat) })}</span>
              <span className="mono">{fmtMs(feedingMs(runningEat, now))}</span>
            </span>
          </span>
          <span className="eat-card-go">
            <IcChevR size={18} />
          </span>
        </button>
        <div className="ep-actions">
          <button className="ep-act stop" onClick={onStop} type="button">
            <IcStop size={16} /> {t("home.eat.stopAction")}
          </button>
          <button className="ep-act switch" onClick={onSwitch} type="button">
            <IcRepeat size={16} /> {t("home.eat.switchAction")}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={"eat-card-v2" + (flash ? " just-logged" : "")} lang="th">
      <button className="eat-card-main" onClick={onOpen} aria-label={t("home.eat.name") + (lastEat ? ": " + eatSummary(lastEat.details_json) : "")}>
        <span className="vi">
          <IcEat size={28} />
        </span>
        <span className="eat-card-meta">
          <span className="eat-card-row1">
            <span className="eat-card-name">{t("home.eat.name")}</span>
            {lastEat && (
              <span className="eat-card-when">
                {ago(lastEat.started_at, now)} {t("home.ago")}
              </span>
            )}
          </span>
          {lastEat ? (
            <span className="eat-card-detail">{eatSummary(lastEat.details_json)}</span>
          ) : (
            <span className="eat-card-detail empty">{t("home.eat.empty")}</span>
          )}
        </span>
        <span className="eat-card-go">
          <IcChevR size={18} />
        </span>
      </button>
      {/* #07: repeat-last only when there's a last feed (no disabled placeholder), named */}
      {lastEat && (
        <button className="repeat-bar" onClick={onRepeat} type="button">
          <IcRepeat size={16} /> <span className="rp-label">{t("home.eat.repeatNamed", { summary: eatSummary(lastEat.details_json) })}</span>
        </button>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="verb-card" aria-hidden="true">
      <span className="sk sk-circle" style={{ width: 56, height: 56, borderRadius: 18 }} />
      <span style={{ flex: 1 }}>
        <span className="sk sk-line" style={{ width: "40%", marginBottom: 9 }} />
        <span className="sk sk-line" style={{ width: "62%", height: 15 }} />
      </span>
    </div>
  );
}

export default function HomeScreen({
  baby,
  profile,
  activities,
  loading,
  online,
  forceOffline,
  onToggleOffline,
  onLogEat,
  onLogSleep,
  onLogDiaper,
  onRepeatLast,
  onOpenFamily,
  caregiverCount,
  runningSleep,
  runningEat,
  onStopFeeding,
  onSwitchFeeding,
}: {
  baby: Baby;
  profile: Profile | null;
  activities: Activity[];
  loading: boolean;
  online: boolean;
  forceOffline: boolean;
  onToggleOffline: () => void;
  onLogEat: () => void;
  onLogSleep: () => void;
  onLogDiaper: () => void;
  onRepeatLast: () => void;
  onOpenFamily: () => void;
  caregiverCount: number; // co-caregivers (excludes self); family hint shows when < 1
  runningSleep: Activity | null;
  runningEat: Activity | null;
  onStopFeeding: () => void;
  onSwitchFeeding: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  const [debug, setDebug] = useState(false);
  useEffect(() => setDebug(isDebug()), []);
  // Tick every 1s while a sleep timer runs (live mm:ss on the card), else 30s.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), runningSleep || runningEat ? 1000 : 30000);
    return () => clearInterval(id);
  }, [runningSleep, runningEat]);

  const lastEat = activities.find((a) => a.type === "eat") ?? null;

  // Flash the Eat card when the latest feed changes (a fresh log or a repeat).
  const [flash, setFlash] = useState(false);
  const lastEatId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const id = lastEat?.id ?? null;
    if (lastEatId.current !== undefined && id && id !== lastEatId.current) {
      setFlash(true);
      const tmr = setTimeout(() => setFlash(false), 1000);
      lastEatId.current = id;
      return () => clearTimeout(tmr);
    }
    lastEatId.current = id;
  }, [lastEat?.id]);
  const lastDiaper = activities.find((a) => a.type === "diaper");
  const lastEndedSleep = activities.find((a) => a.type === "sleep" && a.ended_at);

  return (
    <div className="screen-body">
      <div className="appbar">
        <span>
          <span className="ttl">{baby.name}</span>
          <span className="sub">
            {ageLabel(baby.birthdate, now)} · {todayWeekday(now)}
          </span>
        </span>
        <span className="spacer" />
        {debug && <OfflineToggle online={online} forceOffline={forceOffline} onToggle={onToggleOffline} />}
        <ThemeToggle />
        {profile && (
          <span style={{ marginLeft: 4 }}>
            <Avatar name={profile.display_name} color={profile.avatar_color} size="lg" />
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <EatCardV2 lastEat={lastEat} runningEat={runningEat} now={now} flash={flash} onOpen={onLogEat} onRepeat={onRepeatLast} onStop={onStopFeeding} onSwitch={onSwitchFeeding} />
          {runningSleep ? (
            <VerbCardV2
              verb="sleep"
              name={t("home.sleep.name")}
              context={t("home.sleep.asleep")}
              detail={<span className="mono">{liveElapsed(runningSleep.started_at, now)}</span>}
              isLive
              onClick={onLogSleep}
            />
          ) : lastEndedSleep ? (
            <VerbCardV2
              verb="sleep"
              name={t("home.sleep.name")}
              context={t("home.sleep.justWoke")}
              detail={`${ago(lastEndedSleep.ended_at!, now)} ${t("home.ago")}`}
              onClick={onLogSleep}
            />
          ) : (
            <VerbCardV2 verb="sleep" name={t("home.sleep.name")} detail={t("home.sleep.empty")} empty onClick={onLogSleep} />
          )}
          {lastDiaper ? (
            <VerbCardV2
              verb="diaper"
              name={t("home.diaper.name")}
              context={`${ago(lastDiaper.started_at, now)} ${t("home.ago")}`}
              detail={(lastDiaper.details_json as { kind?: string }).kind ? t(`diaper.${(lastDiaper.details_json as { kind?: string }).kind}`) : t("verb.diaper")}
              onClick={onLogDiaper}
            />
          ) : (
            <VerbCardV2 verb="diaper" name={t("home.diaper.name")} detail={t("home.diaper.empty")} empty onClick={onLogDiaper} />
          )}
        </div>
      )}

      {/* #07: family hint only when there's no co-caregiver yet; whole card taps to Family */}
      {!loading && caregiverCount < 1 && (
        <button className="fam-hint" onClick={onOpenFamily} type="button" lang="th">
          <span className="fh-ic">
            <IcUsers size={20} />
          </span>
          <span className="fh-body">{t("home.familyHint")}</span>
          <span className="fh-go">
            <IcChevR size={18} />
          </span>
        </button>
      )}
    </div>
  );
}
