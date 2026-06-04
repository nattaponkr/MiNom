"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/lib/types";
import { clockTime, duration, formatDate } from "@/lib/format";
import { IcCheck, IcChevL, IcChevR, IcList, IcTrash, VERB_ICON } from "@/lib/icons";
import { Avatar } from "./ui";
import { getRepo } from "@/lib/sync/repo";
import { eatSummary, isFirstTimeFood } from "@/lib/eat";
import { t } from "@/i18n";

function detailSummary(a: Activity): string {
  const d = a.details_json as { kind?: string };
  if (a.type === "eat") return eatSummary(a.details_json, "timeline");
  if (a.type === "diaper") return d.kind ? `${t("verb.diaper")} · ${t(`diaper.${d.kind}`)}` : t("verb.diaper");
  if (a.type === "sleep") {
    if (!a.ended_at) return `${t("verb.sleep")} · ${t("sleep.sleeping")}`;
    return `${t("verb.sleep")} · ${duration(new Date(a.ended_at).getTime() - new Date(a.started_at).getTime())}`;
  }
  return t(`verb.${a.type}`);
}

function Pill({ status, justSynced }: { status: Activity["_sync"]; justSynced: boolean }) {
  if (status === "queued")
    return (
      <span className="queued-pill">
        <span className="spin-sm" /> {t("sync.queued")}
      </span>
    );
  if (justSynced)
    return (
      <span className="queued-pill synced-pill">
        <IcCheck size={11} /> {t("sync.synced")}
      </span>
    );
  return null;
}

function dayRange(offset: number): { fromISO: string; toISO: string; start: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - offset);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { fromISO: start.toISOString(), toISO: end.toISOString(), start };
}

function dayLabel(offset: number): string {
  if (offset === 0) return t("timeline.today");
  if (offset === 1) return t("timeline.yesterday");
  return formatDate(dayRange(offset).start);
}

export default function Timeline({
  babyId,
  activities,
  loading,
  onDelete,
}: {
  babyId: string;
  activities: Activity[]; // today, live
  loading: boolean;
  onDelete: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [past, setPast] = useState<Activity[]>([]);
  const [pastLoading, setPastLoading] = useState(false);
  const touchX = useRef<number | null>(null);

  // Fetch past days on demand (read-only history). Today uses the live prop.
  useEffect(() => {
    if (offset === 0) return;
    let alive = true;
    setPastLoading(true);
    (async () => {
      const repo = await getRepo();
      const { fromISO, toISO } = dayRange(offset);
      try {
        const rows = await repo.listRange(babyId, fromISO, toISO);
        if (alive) setPast(rows);
      } catch {
        if (alive) setPast([]);
      } finally {
        if (alive) setPastLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [offset, babyId]);

  const isToday = offset === 0;
  const rows = isToday ? activities : past;
  const busy = isToday ? loading : pastLoading;

  // queued→synced flash (today only)
  const prev = useRef<Map<string, Activity["_sync"]>>(new Map());
  const [justSynced, setJustSynced] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isToday) return;
    const flips: string[] = [];
    for (const a of activities) {
      if (prev.current.get(a.id) === "queued" && a._sync === "synced") flips.push(a.id);
      prev.current.set(a.id, a._sync);
    }
    if (flips.length) {
      setJustSynced((s) => new Set([...s, ...flips]));
      const id = setTimeout(() => setJustSynced((s) => { const n = new Set(s); flips.forEach((x) => n.delete(x)); return n; }), 2200);
      return () => clearTimeout(id);
    }
  }, [activities, isToday]);

  const older = () => setOffset((o) => o + 1);
  const newer = () => setOffset((o) => Math.max(0, o - 1));

  return (
    <div
      className="screen-body"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -50) older();
        else if (dx > 50) newer();
        touchX.current = null;
      }}
    >
      <div className="appbar">
        <span>
          <span className="ttl">{t("timeline.title")}</span>
          <span className="sub">{dayLabel(offset)}</span>
        </span>
        <span className="spacer" />
        <button className="iconbtn primary-target" onClick={older} aria-label={t("timeline.yesterday")} type="button">
          <IcChevL size={20} />
        </button>
        <button
          className="iconbtn primary-target"
          onClick={newer}
          aria-label={t("timeline.today")}
          type="button"
          disabled={isToday}
          style={{ opacity: isToday ? 0.35 : 1 }}
        >
          <IcChevR size={20} />
        </button>
      </div>

      {busy ? (
        <div>
          {[0, 1, 2].map((i) => (
            <div className="act-row" key={i} aria-hidden="true">
              <span className="sk sk-circle" style={{ width: 42, height: 42, borderRadius: 13 }} />
              <span style={{ flex: 1 }}>
                <span className="sk sk-line" style={{ width: "52%", marginBottom: 8 }} />
                <span className="sk sk-line" style={{ width: "30%", height: 10 }} />
              </span>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, padding: "40px 18px" }}>
          <span style={{ width: 68, height: 68, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--fg-faint)" }}>
            <IcList size={30} />
          </span>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{t("timeline.empty.title")}</div>
          <div style={{ fontSize: 13.5, color: "var(--fg-muted)", lineHeight: 1.5, maxWidth: 240 }}>{t("timeline.empty.body")}</div>
        </div>
      ) : (
        <>
          <div className="tl-day">{dayLabel(offset)}</div>
          {rows.map((a) => {
            const Ic = VERB_ICON[a.type];
            return (
              <div key={a.id} className={"act-row" + (a._fresh ? " sync-row" : "")}>
                <span className={"act-ic " + a.type}>
                  <Ic size={19} />
                </span>
                <span className="act-main">
                  <span className="act-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {detailSummary(a)}
                    {isFirstTimeFood(a.details_json) && <span className="ft-tag">{t("timeline.firstTimeTag")}</span>}
                  </span>
                  <span className="who">
                    <Avatar name={a._mine ? t("timeline.you") : a.logged_by_name} color={a.logged_by_color} />
                    <span className="nm">{a._mine ? t("timeline.you") : a.logged_by_name}</span>
                  </span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <span className="act-time">{clockTime(a.started_at)}</span>
                  {isToday && <Pill status={a._sync} justSynced={justSynced.has(a.id)} />}
                </span>
                {isToday && (
                  <button
                    className="iconbtn"
                    style={{ color: "var(--danger)", width: 48, height: 48 }}
                    onClick={() => onDelete(a.id)}
                    aria-label={t("a11y.deleteEntry")}
                    type="button"
                  >
                    <IcTrash size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
