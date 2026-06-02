// Dev/QA-only affordances (manual offline toggle, skeleton notes) are gated
// behind this flag so they never leak into the Thai product UX. Enable with
// ?debug=1 (persists) or localStorage.lamoon_debug = "1"; disable with ?debug=0.
// Per Designer clarification #5: the manual offline toggle is dev/QA-only;
// production shows only an automatic, read-only offline indicator.
export function isDebug(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("debug");
    if (q === "1") localStorage.setItem("lamoon_debug", "1");
    if (q === "0") localStorage.removeItem("lamoon_debug");
    return localStorage.getItem("lamoon_debug") === "1";
  } catch {
    return false;
  }
}
