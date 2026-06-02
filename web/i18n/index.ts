// Minimal flat-key i18n for the single-locale (Thai) v1.
//
// Why not next-intl: the Designer's th.json uses flat dotted keys with
// intentional collisions (e.g. "auth.toSignUp" is a string AND
// "auth.toSignUp.cta" exists) — next-intl's nested-namespace model can't
// represent both. For one locale this tiny resolver is the right "equivalent"
// (per HANDOFF_dev_02 "next-intl or equivalent"). When EN lands, swap this for
// a provider that selects the active locale's dictionary.
import th from "@/locales/th.json";

// th.json carries a non-string "_meta" block alongside the string entries; cast
// through unknown. _meta is never looked up as a translation key.
const messages = th as unknown as Record<string, string>;

// Track keys requested but absent — surfaced in dev to flag to the Designer.
const missing = new Set<string>();

export function t(key: string, params?: Record<string, string | number>): string {
  let s = messages[key];
  if (s == null) {
    if (!missing.has(key)) {
      missing.add(key);
      if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key: ${key}`);
    }
    return key; // visible fallback so gaps are obvious, never blank
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

export const LOCALE = "th-TH";
export function missingKeys(): string[] {
  return [...missing];
}
