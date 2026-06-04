"use client";
import { Avatar } from "./ui";
import { IcCheck } from "@/lib/icons";
import { t } from "@/i18n";

// Save snackbar — appears for 5s after an optimistic log. Names exactly what was
// recorded (Eat v2), with แก้ไข to open the just-logged entry and เลิกทำ to revert.
// Two-row layout so the Thai string + actions never overflow on 360px.
export function UndoSnackbar({ summary, repeated, onUndo, onEdit }: { summary: string; repeated?: boolean; onUndo: () => void; onEdit?: () => void }) {
  return (
    <div className="snackbar-wrap">
      <div className="snackbar snack-v2" role="status">
        <span className="snk-msg">
          <IcCheck size={16} /> {t(repeated ? "feedback.repeatedNamed" : "feedback.savedNamed", { summary })}
        </span>
        <span className="snk-actions">
          {onEdit && (
            <button className="snk-btn edit" onClick={onEdit} type="button">
              {t("feedback.edit")}
            </button>
          )}
          <button className="snk-btn" onClick={onUndo} type="button">
            {t("feedback.undo")}
          </button>
        </span>
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
