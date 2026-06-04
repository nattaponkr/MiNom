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

function VerbCard({
  verb,
  name,
  stat,
  unit,
  by,
  byColor,
  isLive,
  onClick,
}: {
  verb: VerbType;
  name: string;
  stat: string;
  unit: string;
  by?: string | null;
  byColor?: string | null;
  isLive?: boolean;
  onClick: () => void;
}) {
  const Ic = VERB_ICON[verb];
  return (
    <button className={"verb-card" + (isLive ? " live" : "")} onClick={onClick} aria-label={`${name}: ${stat} ${unit}`}>
      <span className={"verb-ic " + verb}>
        <Ic size={28} />
      </span>
      <span className="verb-meta">
        <span className="verb-name">{name}</span>
        <span className="verb-stat" style={{ display: "block" }}>
          {isLive && <span className="pulse-dot" />}
          <span className="tnum">{stat}</span> <span className="u">{unit}</span>
        </span>
        {by && (
          <span className="who">
            <Avatar name={by} color={byColor} />
            <span className="nm">{t("home.by", { name: by })}</span>
          </span>
        )}
      </span>
      <span className="verb-go">
        <IcChevR size={18} />
      </span>
    </button>
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
  useEffect(() => {
    setDebug(isDebug());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

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
          <VerbCard
            verb="sleep"
            name={t("home.sleep.name")}
            stat={runningSleep ? ago(runningSleep.started_at, now) : lastEndedSleep ? ago(lastEndedSleep.ended_at!, now) : t("home.eat.empty.stat")}
            unit={runningSleep ? t("home.sleep.asleep") : lastEndedSleep ? t("home.ago") : t("home.eat.empty.unit")}
            isLive={!!runningSleep}
            onClick={onLogSleep}
          />
          <VerbCard
            verb="diaper"
            name={t("home.diaper.name")}
            stat={lastDiaper ? ago(lastDiaper.started_at, now) : t("home.eat.empty.stat")}
            unit={lastDiaper ? t("home.ago") : t("home.eat.empty.unit")}
            by={lastDiaper && !lastDiaper._mine ? lastDiaper.logged_by_name : null}
            byColor={lastDiaper?.logged_by_color}
            onClick={onLogDiaper}
          />
        </div>
      )}

      <div className="note" style={{ marginTop: 16, fontSize: 12.5 }} lang="th">
        {t("home.tip")}
      </div>
    </div>
  );
}
