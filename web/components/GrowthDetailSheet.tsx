"use client";
// Growth detail sheet (#13) — reuses the #09 .ad-* shape with Growth-specific
// field labels. Read-only entry; home of แก้ไข (→ inline edit) + ลบรายการนี้ (→ confirm).
// Measurements aren't Activities, so this is a sibling of ActivityDetailSheet, not the
// same component — same CSS vocabulary, Growth data.
import type { GrowthKind, Measurement } from "@/lib/types";
import { formatDateBE, num } from "@/lib/format";
import { IcGrow, IcTrash } from "@/lib/icons";
import { Button } from "./ui";
import { t } from "@/i18n";

export default function GrowthDetailSheet({
  measurement,
  whoName,
  onEdit,
  onRequestDelete,
  onClose,
}: {
  measurement: Measurement;
  whoName: string;
  onEdit: (m: Measurement) => void;
  onRequestDelete: (m: Measurement) => void;
  onClose: () => void;
}) {
  const m = measurement;
  const kind: GrowthKind = m.kind;
  const unit = kind === "weight" ? t("growth.unit.kg") : t("growth.unit.cm");
  const value = `${num(m.value)} ${unit}`;

  return (
    <div className="overlay" style={{ position: "fixed", zIndex: 70 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={t("growth.detail.title")}>
      <div className="sheet ad-sheet" style={{ width: "100%", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(18px + env(safe-area-inset-bottom,0px))" }} onClick={(e) => e.stopPropagation()} lang="th">
        <div className="sheet-handle" />

        <div className="ad-head">
          <span className="ad-ic grow">
            <IcGrow size={26} />
          </span>
          <span>
            <span className="ad-ctx">{kind === "weight" ? t("growth.weight") : t("growth.height")}</span>
            <span className="ad-detail">{value}</span>
          </span>
        </div>

        <div className="ad-fields">
          <div className="ad-field">
            <span className="ad-k">{t("growth.detail.value")}</span>
            <span className="ad-v">{value}</span>
          </div>
          <div className="ad-field">
            <span className="ad-k">{t("growth.detail.date")}</span>
            <span className="ad-v">{formatDateBE(m.measured_at)}</span>
          </div>
          <div className="ad-field">
            <span className="ad-k">{t("growth.detail.loggedBy")}</span>
            <span className="ad-v">{whoName}</span>
          </div>
        </div>

        <div className="ad-actions">
          <Button kind="primary" block style={{ background: "var(--grow-strong)" }} onClick={() => onEdit(m)}>
            {t("growth.detail.edit")}
          </Button>
          <button className="ad-del" onClick={() => onRequestDelete(m)} type="button">
            <IcTrash size={17} /> {t("growth.detail.del")}
          </button>
        </div>
      </div>
    </div>
  );
}
