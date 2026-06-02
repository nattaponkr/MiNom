"use client";
import { useEffect, useState } from "react";
import { IcSun, IcMoon } from "@/lib/icons";
import { t } from "@/i18n";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("minom_theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      className="iconbtn primary-target"
      onClick={toggle}
      aria-label={t("a11y.themeToggle")}
      type="button"
      data-theme-toggle
    >
      {theme === "dark" ? <IcSun size={20} /> : <IcMoon size={20} />}
    </button>
  );
}
