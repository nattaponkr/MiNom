"use client";
// The "เวลา" (When) card shared by the quick-logs. Defaults to now; the แก้ไข
// affordance reveals a native datetime input, capped not-in-future (PRD §4
// back-dating, locked 2026-06-01). The 2-tap path is untouched when "now" is right.
import { useState } from "react";
import type { VerbType } from "@/lib/types";
import { clockTime, dateTime, fromLocalInput, isNowish, toLocalInput } from "@/lib/format";
import { IcClock } from "@/lib/icons";
import { t } from "@/i18n";

export default function WhenCard({ verb, startedAt, onChange }: { verb: VerbType; startedAt: string; onChange: (iso: string) => void }) {
  const [editing, setEditing] = useState(false);
  const nowMax = toLocalInput(new Date().toISOString());
  const display = isNowish(startedAt) ? t("eat.when.now", { time: clockTime(startedAt) }) : dateTime(startedAt);

  return (
    <div
      style={{
        width: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="verb-go" style={{ background: `var(--${verb}-tint)`, color: `var(--${verb})` }}>
          <IcClock size={20} />
        </span>
        <span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-muted)" }}>{t("eat.when.label")}</span>
          <span style={{ display: "block", fontSize: 18, fontWeight: 800 }}>{display}</span>
        </span>
        <span className="spacer" style={{ flex: 1 }} />
        <button className="edit-aff" type="button" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
          {t("common.edit")}
        </button>
      </div>
      {editing && (
        <input
          type="datetime-local"
          className="input"
          style={{ marginTop: 12 }}
          value={toLocalInput(startedAt)}
          max={nowMax}
          onChange={(e) => {
            if (!e.target.value) return;
            const iso = fromLocalInput(e.target.value);
            // clamp not-in-future
            onChange(new Date(iso).getTime() > Date.now() ? new Date().toISOString() : iso);
          }}
        />
      )}
    </div>
  );
}
