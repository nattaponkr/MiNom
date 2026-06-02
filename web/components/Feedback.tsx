"use client";
import { Avatar } from "./ui";
import { IcCheck } from "@/lib/icons";
import { t } from "@/i18n";

// Undo snackbar — appears for 5s after an optimistic log (section 05).
export function UndoSnackbar({ onUndo }: { onUndo: () => void }) {
  return (
    <div className="snackbar-wrap">
      <div className="snackbar" role="status">
        <IcCheck size={16} /> {t("feedback.eatLogged")}
        <button className="undo" onClick={onUndo} type="button">
          {t("feedback.undo")}
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
        <Avatar name={name} /> {t("feedback.caregiverAdded", { name })}
      </div>
    </div>
  );
}
