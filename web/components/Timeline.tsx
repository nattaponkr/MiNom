"use client";
import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/lib/types";
import { clockTime, num } from "@/lib/format";
import { IcCheck, IcList, IcTrash, VERB_ICON } from "@/lib/icons";
import { Avatar } from "./ui";
import { t } from "@/i18n";

function detailSummary(a: Activity): string {
  const d = a.details_json as { amount_ml?: number; what?: string; source?: string };
  if (a.type === "eat") {
    if (typeof d.amount_ml === "number") return t("timeline.eat.amount", { n: num(d.amount_ml) });
    if (d.what === "food") return t("timeline.eat.food");
    return t("timeline.eat.plain");
  }
  return t(`verb.${a.type}`);
}

function Pill({ status, justSynced }: { status: Activity["_sync"]; justSynced: boolean }) {
  if (status === "queued") {
    return (
      <span className="queued-pill">
        <span className="spin-sm" /> {t("sync.queued")}
      </span>
    );
  }
  if (justSynced) {
    return (
      <span className="queued-pill synced-pill">
        <IcCheck size={11} /> {t("sync.synced")}
      </span>
    );
  }
  return null;
}

export default function Timeline({
  activities,
  loading,
  onDelete,
}: {
  activities: Activity[];
  loading: boolean;
  onDelete: (id: string) => void;
}) {
  // Track queued→synced transitions to flash a "Synced" pill briefly.
  const prev = useRef<Map<string, Activity["_sync"]>>(new Map());
  const [justSynced, setJustSynced] = useState<Set<string>>(new Set());
  useEffect(() => {
    const flips: string[] = [];
    for (const a of activities) {
      if (prev.current.get(a.id) === "queued" && a._sync === "synced") flips.push(a.id);
      prev.current.set(a.id, a._sync);
    }
    if (flips.length) {
      setJustSynced((s) => new Set([...s, ...flips]));
      const t = setTimeout(() => {
        setJustSynced((s) => {
          const n = new Set(s);
          flips.forEach((id) => n.delete(id));
          return n;
        });
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [activities]);

  return (
    <div className="screen-body">
      <div className="appbar">
        <span>
          <span className="ttl">{t("timeline.title")}</span>
          <span className="sub">{t("timeline.today")}</span>
        </span>
      </div>

      {loading ? (
        <div>
          {[0, 1, 2, 3].map((i) => (
            <div className="act-row" key={i} aria-hidden="true">
              <span className="sk sk-circle" style={{ width: 42, height: 42, borderRadius: 13 }} />
              <span style={{ flex: 1 }}>
                <span className="sk sk-line" style={{ width: "52%", marginBottom: 8 }} />
                <span className="sk sk-line" style={{ width: "30%", height: 10 }} />
              </span>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 10,
            padding: "40px 18px",
          }}
        >
          <span
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              display: "grid",
              placeItems: "center",
              background: "var(--surface-2)",
              color: "var(--fg-faint)",
            }}
          >
            <IcList size={30} />
          </span>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{t("timeline.empty.title")}</div>
          <div style={{ fontSize: 13.5, color: "var(--fg-muted)", lineHeight: 1.5, maxWidth: 240 }}>
            {t("timeline.empty.body")}
          </div>
        </div>
      ) : (
        <>
          <div className="tl-day">{t("timeline.today")}</div>
          {activities.map((a) => {
            const Ic = VERB_ICON[a.type];
            return (
              <div key={a.id} className={"act-row" + (a._fresh ? " sync-row" : "")}>
                <span className={"act-ic " + a.type}>
                  <Ic size={19} />
                </span>
                <span className="act-main">
                  <span className="act-title">{detailSummary(a)}</span>
                  <span className="who">
                    <Avatar name={a._mine ? t("timeline.you") : a.logged_by_name} color={a.logged_by_color} />
                    <span className="nm">{a._mine ? t("timeline.you") : a.logged_by_name}</span>
                  </span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <span className="act-time">{clockTime(a.started_at)}</span>
                  <Pill status={a._sync} justSynced={justSynced.has(a.id)} />
                </span>
                <button
                  className="iconbtn"
                  style={{ color: "var(--danger)", width: 48, height: 48 }}
                  onClick={() => onDelete(a.id)}
                  aria-label={t("a11y.deleteEntry")}
                  type="button"
                >
                  <IcTrash size={18} />
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
