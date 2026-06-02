"use client";
import type { ReactNode } from "react";
import { Button } from "./ui";
import { IcTrash } from "@/lib/icons";
import { t } from "@/i18n";

// Full-viewport bottom sheet (fixed) reusing the design's .sheet visuals.
function BottomSheet({ title, body, children, onDismiss }: { title: string; body: ReactNode; children: ReactNode; onDismiss: () => void }) {
  return (
    <div
      className="overlay"
      style={{ position: "fixed", zIndex: 70 }}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="sheet"
        style={{ width: "100%", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(18px + env(safe-area-inset-bottom,0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="st">{title}</div>
        <div className="sd">{body}</div>
        <div className="sheet-actions">{children}</div>
      </div>
    </div>
  );
}

// Generic confirm sheet (account deletion, remove caregiver, transfer, …).
export function ConfirmSheet({
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <BottomSheet title={title} body={body} onDismiss={onCancel}>
      <Button kind={danger ? "danger" : "primary"} block icon={danger ? <IcTrash size={18} /> : undefined} onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button kind="ghost" block onClick={onCancel}>
        {cancelLabel}
      </Button>
    </BottomSheet>
  );
}

export function ConcurrencySheet({
  kind = "eat",
  name,
  agoText,
  onViewTheirs,
  onLogAnyway,
  onDismiss,
}: {
  kind?: "eat" | "sleep";
  name: string;
  agoText: string;
  onViewTheirs: () => void;
  onLogAnyway: () => void;
  onDismiss: () => void;
}) {
  const k = kind === "sleep" ? "concurrency.sleep" : "concurrency";
  return (
    <BottomSheet title={t(`${k}.title`)} body={t(`${k}.body`, { name, dur: agoText })} onDismiss={onDismiss}>
      <Button kind="primary" block onClick={onViewTheirs} style={kind === "sleep" ? { background: "var(--sleep)" } : undefined}>
        {t(`${k}.view`)}
      </Button>
      <Button kind="ghost" block onClick={onLogAnyway}>
        {t(`${k}.logAnyway`)}
      </Button>
    </BottomSheet>
  );
}

export function ConfirmDeleteSheet({
  timeText,
  babyName,
  onConfirm,
  onCancel,
  generic,
}: {
  timeText: string;
  babyName: string;
  onConfirm: () => void;
  onCancel: () => void;
  generic?: boolean;
}) {
  return (
    <BottomSheet title={t("delete.title")} body={generic ? t("common.deleteIrreversible") : t("delete.body", { time: timeText, baby: babyName })} onDismiss={onCancel}>
      <Button kind="danger" block icon={<IcTrash size={18} />} onClick={onConfirm}>
        {t("delete.confirm")}
      </Button>
      <Button kind="ghost" block onClick={onCancel}>
        {t("delete.keep")}
      </Button>
    </BottomSheet>
  );
}
