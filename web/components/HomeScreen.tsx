"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity, Baby, Profile, VerbType } from "@/lib/types";
import { ago, ageLabel, todayWeekday } from "@/lib/format";
import { IcChevR, IcEat, IcRepeat, VERB_ICON } from "@/lib/icons";
import { eatSummary } from "@/lib/eat";
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
  now,
  flash,
  onOpen,
  onRepeat,
}: {
  lastEat: Activity | null;
  now: number;
  flash: boolean;
  onOpen: () => void;
  onRepeat: () => void;
}) {
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
            <span className="eat-card-detail empty">
              {t("home.eat.empty.stat")} · {t("home.eat.empty.unit")}
            </span>
          )}
        </span>
        <span className="eat-card-go">
          <IcChevR size={18} />
        </span>
      </button>
      {lastEat ? (
        <button className="repeat-bar" onClick={onRepeat} type="button">
          <IcRepeat size={16} /> {t("home.eat.repeatLast")}
        </button>
      ) : (
        <div className="repeat-bar disabled" aria-disabled="true">
          <IcRepeat size={16} /> {t("home.eat.repeatLast")}
        </div>
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
  runningSleep,
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
  runningSleep: Activity | null;
}) {
  const [now, setNow] = useState(Date.now());
  const [debug, setDebug] = useState(false);
  useEffect(() => setDebug(isDebug()), []);
  // Tick every 1s while a sleep timer runs (live mm:ss on the card), else 30s.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), runningSleep ? 1000 : 30000);
    return () => clearInterval(id);
  }, [runningSleep]);

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
          <EatCardV2 lastEat={lastEat} now={now} flash={flash} onOpen={onLogEat} onRepeat={onRepeatLast} />
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
            <VerbCardV2 verb="sleep" name={t("home.sleep.name")} detail={`${t("home.eat.empty.stat")} · ${t("home.eat.empty.unit")}`} empty onClick={onLogSleep} />
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
            <VerbCardV2 verb="diaper" name={t("home.diaper.name")} detail={`${t("home.eat.empty.stat")} · ${t("home.eat.empty.unit")}`} empty onClick={onLogDiaper} />
          )}
        </div>
      )}

      <div className="note" style={{ marginTop: 16, fontSize: 12.5 }} lang="th">
        {t("home.tip")}
      </div>
    </div>
  );
}
