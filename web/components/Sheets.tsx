"use client";
import type { ReactNode } from "react";
import { Button } from "./ui";
import { IcTrash } from "@/lib/icons";

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

export function ConcurrencySheet({
  name,
  agoText,
  onViewTheirs,
  onLogAnyway,
  onDismiss,
}: {
  name: string;
  agoText: string;
  onViewTheirs: () => void;
  onLogAnyway: () => void;
  onDismiss: () => void;
}) {
  return (
    <BottomSheet
      title="Someone’s already on it"
      body={
        <>
          <b style={{ color: "var(--fg)" }}>{name}</b> logged a feed {agoText} ago. View it, or log another?
        </>
      }
      onDismiss={onDismiss}
    >
      <Button kind="primary" block onClick={onViewTheirs}>
        View theirs
      </Button>
      <Button kind="ghost" block onClick={onLogAnyway}>
        Log another anyway
      </Button>
    </BottomSheet>
  );
}

export function ConfirmDeleteSheet({
  timeText,
  babyName,
  onConfirm,
  onCancel,
}: {
  timeText: string;
  babyName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <BottomSheet
      title="Delete this entry?"
      body={
        <>
          This removes the {timeText} feed for everyone caring for {babyName}. It can’t be undone.
        </>
      }
      onDismiss={onCancel}
    >
      <Button kind="danger" block icon={<IcTrash size={18} />} onClick={onConfirm}>
        Delete entry
      </Button>
      <Button kind="ghost" block onClick={onCancel}>
        Keep it
      </Button>
    </BottomSheet>
  );
}
