"use client";
import { IcEat, IcList, IcGrow, IcUsers, IcGear } from "@/lib/icons";

export type Tab = "home" | "timeline" | "grow" | "care" | "settings";

const TABS: [Tab, string, (p: { size?: number }) => JSX.Element][] = [
  ["home", "Home", IcEat],
  ["timeline", "Timeline", IcList],
  ["grow", "Growth", IcGrow],
  ["care", "Family", IcUsers],
  ["settings", "Settings", IcGear],
];

export default function TabBar({ active, onNavigate }: { active: Tab; onNavigate: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map(([id, label, Ic]) => (
        <button
          key={id}
          className={"tab" + (id === active ? " on" : "")}
          onClick={() => onNavigate(id)}
          aria-current={id === active ? "page" : undefined}
          style={{ minHeight: 48 }}
        >
          <Ic size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
