"use client";
import { Avatar } from "./ui";
import { IcCheck } from "@/lib/icons";

// Undo snackbar — appears for 5s after an optimistic log (section 05).
export function UndoSnackbar({ onUndo }: { onUndo: () => void }) {
  return (
    <div className="snackbar-wrap">
      <div className="snackbar" role="status">
        <IcCheck size={16} /> Eat logged
        <button className="undo" onClick={onUndo} type="button">
          UNDO
        </button>
        <span className="snk-prog" />
      </div>
    </div>
  );
}

// Quiet toast when another caregiver's entry arrives via realtime.
export function SyncToast({ name }: { name: string }) {
  return (
    <div className="toast-wrap">
      <div className="toast info" role="status">
        <Avatar name={name} /> {name} added a feed · now
      </div>
    </div>
  );
}
