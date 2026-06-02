// Formatters — all locale-aware via Intl('th-TH'). Times are 24-hour; clock /
// duration / amount glyphs render in the Latin mono face. Numerals stay Arabic.
import { t, LOCALE } from "@/i18n";

const clockFmt = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false });
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });
const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric" });
const numFmt = new Intl.NumberFormat(LOCALE);

export function clockTime(iso: string): string {
  return clockFmt.format(new Date(iso));
}

// Within ~a minute of now → treat as "now" (for the When card display).
export function isNowish(iso: string, now = Date.now()): boolean {
  return Math.abs(now - new Date(iso).getTime()) < 60000;
}

// ISO ⇄ <input type="datetime-local"> local-wall-clock string.
const pad = (n: number) => String(n).padStart(2, "0");
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function fromLocalInput(local: string): string {
  return new Date(local).toISOString();
}
export function dateTime(iso: string): string {
  return `${dateFmt.format(new Date(iso))} · ${clockFmt.format(new Date(iso))}`;
}

export function formatDate(iso: string | number | Date): string {
  return dateFmt.format(new Date(iso));
}

export function num(n: number): string {
  return numFmt.format(n);
}

// Duration since `iso`, in Thai units. "เพิ่งเมื่อกี้" / "22 นาที" / "1 ชม. 12 นาที"
export function ago(iso: string, now = Date.now()): string {
  const ms = now - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return t("units.justNow");
  if (min < 60) return `${min} ${t("units.m")}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ${t("units.h")} ${m} ${t("units.m")}` : `${h} ${t("units.h")}`;
}

// Baby age in Thai. Uses age.* keys (added for Dev — flagged for Designer review).
export function ageLabel(birthdateISO: string, now = Date.now()): string {
  const b = new Date(birthdateISO);
  const days = Math.floor((now - b.getTime()) / 86400000);
  if (days < 0) return "";
  if (days < 14) return t("age.days", { n: days });
  if (days < 60) return t("age.weeks", { n: Math.floor(days / 7) });
  const months = Math.floor(days / 30.44);
  if (months < 24) return t("age.months", { n: months });
  return t("age.years", { n: Math.floor(months / 12) });
}

export function todayWeekday(now = Date.now()): string {
  return weekdayFmt.format(new Date(now));
}
