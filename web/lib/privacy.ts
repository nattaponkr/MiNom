// Server-only parser for the Thai privacy policy. Single source of truth is
// content/privacy_th.md (synced from the repo-root PRIVACY_TH.md) — the policy
// text is never duplicated in code. Splits into summary + numbered sections for
// the TOC layout, strips the internal "หมายเหตุภายในทีม" note, and flags the
// §1 entity placeholders so the page can block until the CPO fills them in.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type PrivacySection = { id: string; num: number; title: string; body: string };
export type ParsedPrivacy = {
  updated: string;
  summary: string; // markdown body of the "สรุปสั้น ๆ" section
  sections: PrivacySection[];
  hasPlaceholders: boolean; // §1 entity info not yet filled by CPO
};

const INTERNAL_HEADING = "หมายเหตุภายในทีม";
const PLACEHOLDER_MARKER = "CPO ต้องกรอก";

export function parsePrivacy(): ParsedPrivacy {
  const raw = readFileSync(join(process.cwd(), "content/privacy_th.md"), "utf8");
  const updated = raw.match(/ปรับปรุงล่าสุด:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? "";

  const parts = raw.split(/\n## /).slice(1); // drop the title/blockquote preamble
  let summary = "";
  const sections: PrivacySection[] = [];
  let hasPlaceholders = false;

  for (const part of parts) {
    const nl = part.indexOf("\n");
    const heading = part.slice(0, nl).trim();
    const body = part
      .slice(nl + 1)
      .replace(/\n---\s*$/, "")
      .trim();

    if (heading.startsWith(INTERNAL_HEADING)) continue; // never render internal note
    if (body.includes(PLACEHOLDER_MARKER)) hasPlaceholders = true;

    const m = heading.match(/^(\d+)\.\s*(.+)$/);
    if (m) {
      sections.push({ id: `sec-${m[1]}`, num: Number(m[1]), title: heading, body });
    } else if (heading.startsWith("สรุป")) {
      summary = body;
    }
  }

  return { updated, summary, sections, hasPlaceholders };
}
