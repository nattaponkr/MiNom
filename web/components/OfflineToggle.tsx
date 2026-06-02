"use client";
import { t } from "@/i18n";
// Dev/QA-only (rendered only behind the debug flag, per Designer clarification
// #5). Simulates going offline without DevTools to exercise the offline outbox.
// Effective-offline = real offline OR this. Production shows only the automatic
// read-only offline banner (in Main).
export default function OfflineToggle({
  online,
  forceOffline,
  onToggle,
}: {
  online: boolean;
  forceOffline: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={"netbar " + (online ? "on" : "off")}
      onClick={onToggle}
      type="button"
      style={{ minHeight: 40, cursor: "pointer", fontSize: 11 }}
      aria-pressed={forceOffline}
      title={forceOffline ? "Simulating offline — tap to reconnect" : "Tap to simulate going offline (test)"}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />
      {online ? t("sync.online.chip") : t("sync.offline.chip")}
    </button>
  );
}
