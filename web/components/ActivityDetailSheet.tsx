"use client";
// Activity detail sheet (Timeline #09) — read-only entry; home of edit + delete.
// Tap-to-edit destination. แก้ไข reopens the per-verb sheet pre-filled; ลบรายการนี้
// confirms then deletes. Read-only fields render only when they have a value.
import type { Activity } from "@/lib/types";
import { clockTime, dateTimeBE } from "@/lib/format";
import { activityFields, activityHierarchy } from "@/lib/activity";
import { IcTrash, VERB_ICON } from "@/lib/icons";
import { Avatar, Button } from "./ui";
import { t } from "@/i18n";

export default function ActivityDetailSheet({
  activity,
  onEdit,
  onRequestDelete,
  onClose,
}: {
  activity: Activity;
  onEdit: (a: Activity) => void;
  onRequestDelete: (a: Activity) => void;
  onClose: () => void;
}) {
  const a = activity;
  const Ic = VERB_ICON[a.type];
  const { context, detail } = activityHierarchy(a);
  const who = a._mine ? t("timeline.you") : a.logged_by_name;

  return (
    <div className="overlay" style={{ position: "fixed", zIndex: 70 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={t("timeline.detail.title")}>
      <div className="sheet ad-sheet" style={{ width: "100%", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(18px + env(safe-area-inset-bottom,0px))" }} onClick={(e) => e.stopPropagation()} lang="th">
        <div className="sheet-handle" />

        <div className="ad-head">
          <span className={"ad-ic " + a.type}>
            <Ic size={26} />
          </span>
          <span>
            {context && <span className="ad-ctx">{context}</span>}
            <span className="ad-detail">{detail}</span>
          </span>
        </div>

        <div className="ad-fields">
          <div className="ad-field">
            <span className="ad-k">{t("timeline.detail.when")}</span>
            <span className="ad-v">{dateTimeBE(a.started_at)}</span>
          </div>
          {activityFields(a).map(([k, v]) => (
            <div className="ad-field" key={k}>
              <span className="ad-k">{k}</span>
              <span className="ad-v">{v}</span>
            </div>
          ))}
          <div className="ad-field">
            <span className="ad-k">{t("timeline.detail.loggedBy").split("{")[0].trim()}</span>
            <span className="ad-v" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <Avatar name={who} color={a.logged_by_color} /> {who} · {clockTime(a.started_at)}
            </span>
          </div>
        </div>

        <div className="ad-actions">
          <Button kind="primary" block style={{ background: "var(--primary)" }} onClick={() => onEdit(a)}>
            {t("timeline.detail.edit")}
          </Button>
          <button className="ad-del" onClick={() => onRequestDelete(a)} type="button">
            <IcTrash size={17} /> {t("timeline.detail.del")}
          </button>
        </div>
      </div>
    </div>
  );
}
