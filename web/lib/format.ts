// Small formatters. All clock/duration output uses the mono font per the design.

export function clockTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// "1h 12m", "22m", "just now"
export function ago(iso: string, now = Date.now()): string {
  const ms = now - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
}

export function ageLabel(birthdateISO: string, now = Date.now()): string {
  const b = new Date(birthdateISO);
  const days = Math.floor((now - b.getTime()) / 86400000);
  if (days < 0) return "";
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `${Math.floor(days / 7)} weeks`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} month${months === 1 ? "" : "s"}`;
  return `${Math.floor(months / 12)} years`;
}

export function todayWeekday(now = Date.now()): string {
  return new Date(now).toLocaleDateString(undefined, { weekday: "long" });
}
