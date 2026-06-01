"use client";
// ui.tsx — shared primitives ported from the design (ui.jsx): Avatar, Button, Expander.
import { useState, type ReactNode, type CSSProperties } from "react";
import { IcChevD } from "@/lib/icons";

// Fallback palette for demo display names; real users carry an avatar_color.
const PALETTE: Record<string, string> = {
  Mom: "oklch(0.62 0.13 25)",
  Dad: "oklch(0.55 0.10 250)",
  Nanny: "oklch(0.58 0.11 160)",
  Gran: "oklch(0.60 0.10 300)",
};

export function initialsOf(name: string): string {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Deterministic warm-spectrum color from a string seed (used when a user has
// no stored avatar_color yet). Hue spread keeps caregivers visually distinct.
export function colorFromSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `oklch(0.58 0.11 ${h})`;
}

export function Avatar({
  name,
  size = "",
  color,
}: {
  name: string;
  size?: "" | "lg" | "xl";
  color?: string | null;
}) {
  const bg = color || PALETTE[name] || colorFromSeed(name);
  return (
    <span className={"avatar " + size} style={{ background: bg }} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}

type ButtonKind = "primary" | "ghost" | "danger";
export function Button({
  kind = "primary",
  size,
  children,
  icon,
  loading,
  disabled,
  style,
  block,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
}: {
  kind?: ButtonKind;
  size?: "lg";
  children?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  block?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  "aria-label"?: string;
}) {
  const cls = ["btn", `btn-${kind}`, size === "lg" && "btn-lg", block && "btn-block", (disabled || loading) && "btn-disabled"]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      className={cls}
      disabled={disabled || loading}
      style={style}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="spin" /> : icon}
      {children}
    </button>
  );
}

export function Expander({ label, open: openProp, children }: { label: string; open?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(openProp || false);
  return (
    <div className={"expander" + (open ? " open" : "")}>
      <button className="expander-h" onClick={() => setOpen((o) => !o)} aria-expanded={open} type="button">
        {label}
        <span className="chev">
          <IcChevD size={18} />
        </span>
      </button>
      {open && <div style={{ paddingBottom: 14 }}>{children}</div>}
    </div>
  );
}
