"use client";
import { IcEat, IcList, IcGrow, IcUsers, IcGear } from "@/lib/icons";
import { t } from "@/i18n";

export type Tab = "home" | "timeline" | "grow" | "care" | "settings";

const TABS: [Tab, string, (p: { size?: number }) => JSX.Element][] = [
  ["home", "tab.home", IcEat],
  ["timeline", "tab.timeline", IcList],
  ["grow", "tab.grow", IcGrow],
  ["care", "tab.care", IcUsers],
  ["settings", "tab.settings", IcGear],
];

export default function TabBar({ active, onNavigate }: { active: Tab; onNavigate: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label={t("a11y.primaryNav")}>
      {TABS.map(([id, label, Ic]) => (
        <button
          key={id}
          className={"tab" + (id === active ? " on" : "")}
          onClick={() => onNavigate(id)}
          aria-current={id === active ? "page" : undefined}
          style={{ minHeight: 48 }}
        >
          <Ic size={22} />
          <span>{t(label)}</span>
        </button>
      ))}
    </nav>
  );
}
