"use client";
// A small affordance to simulate going offline without browser DevTools — used
// to demo/QA the offline outbox (the design's DemoOffline had explicit
// Go-offline / Reconnect buttons). Effective-offline = real offline OR this.
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
      {online ? "Online" : "Offline"}
    </button>
  );
}
