"use client";
import { useEffect, useState } from "react";
import type { Activity, Baby, Profile, VerbType } from "@/lib/types";
import { ago, ageLabel, todayWeekday } from "@/lib/format";
import { IcChevR, VERB_ICON } from "@/lib/icons";
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
  onClick,
}: {
  verb: VerbType;
  name: string;
  stat: string;
  unit: string;
  by?: string | null;
  byColor?: string | null;
  onClick: () => void;
}) {
  const Ic = VERB_ICON[verb];
  return (
    <button className="verb-card" onClick={onClick} aria-label={`${name}: ${stat} ${unit}`}>
      <span className={"verb-ic " + verb}>
        <Ic size={28} />
      </span>
      <span className="verb-meta">
        <span className="verb-name">{name}</span>
        <span className="verb-stat" style={{ display: "block" }}>
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
  onLogDiaper,
  onComingSoon,
}: {
  baby: Baby;
  profile: Profile | null;
  activities: Activity[];
  loading: boolean;
  online: boolean;
  forceOffline: boolean;
  onToggleOffline: () => void;
  onLogEat: () => void;
  onLogDiaper: () => void;
  onComingSoon: (verb: VerbType) => void;
}) {
  const [now, setNow] = useState(Date.now());
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    setDebug(isDebug());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const lastEat = activities.find((a) => a.type === "eat");
  const lastDiaper = activities.find((a) => a.type === "diaper");

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
          <VerbCard
            verb="eat"
            name={t("home.eat.name")}
            stat={lastEat ? ago(lastEat.started_at, now) : t("home.eat.empty.stat")}
            unit={lastEat ? t("home.ago") : t("home.eat.empty.unit")}
            by={lastEat && !lastEat._mine ? lastEat.logged_by_name : null}
            byColor={lastEat?.logged_by_color}
            onClick={onLogEat}
          />
          <VerbCard verb="sleep" name={t("home.sleep.name")} stat="—" unit={t("home.comingSoon")} onClick={() => onComingSoon("sleep")} />
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
