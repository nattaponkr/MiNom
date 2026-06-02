"use client";
// Analytics wrapper around PostHog (BETA_PLAN §5). Privacy-first:
//   • identify by Supabase user UUID only — never name/email/baby data.
//   • no autocapture, no pageview autocapture, inputs masked → no PII leaks.
//   • no-ops entirely when NEXT_PUBLIC_POSTHOG_KEY is absent (e.g. demo/local),
//     so event calls are safe to sprinkle anywhere.
// EU region default for PDPA comfort.
import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
export const ANALYTICS_ON = Boolean(KEY);

let started = false;

export function initAnalytics() {
  if (started || !ANALYTICS_ON || typeof window === "undefined") return;
  started = true;
  posthog.init(KEY!, {
    api_host: HOST,
    autocapture: false, // never auto-capture clicks/inputs (privacy)
    capture_pageview: false, // we send app_opened ourselves
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: "localStorage",
    mask_all_text: true,
    mask_all_element_attributes: true,
  });
  // Surface uncaught errors as a privacy-safe `error` event.
  window.addEventListener("error", (e) =>
    track("error", { error_id: String(e.message || "error").slice(0, 80), route: location.pathname }),
  );
  window.addEventListener("unhandledrejection", () => track("error", { error_id: "unhandledrejection", route: location.pathname }));
}

export function identify(userId: string) {
  if (!ANALYTICS_ON || typeof window === "undefined") return;
  posthog.identify(userId); // UUID only — no PII traits
}

export function resetAnalytics() {
  if (!ANALYTICS_ON || typeof window === "undefined") return;
  posthog.reset();
}

// Whitelisted, PII-free payloads only.
export function track(event: string, props: Record<string, string | number | boolean> = {}) {
  if (!ANALYTICS_ON || typeof window === "undefined") return;
  posthog.capture(event, props);
}
