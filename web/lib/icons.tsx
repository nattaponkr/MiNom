// icons.tsx — MiNom icon set, ported verbatim from the design (icons.jsx).
// Simple geometric line glyphs; `filled` variant available. 24x24 viewBox,
// currentColor, rounded caps. `size` controls px.
import type { ReactNode } from "react";

type IconProps = { size?: number; filled?: boolean };

function Svg({
  size = 24,
  children,
  sw = 1.9,
  ...rest
}: {
  size?: number;
  children: ReactNode;
  sw?: number;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

// ---- Verb icons ----
export const IcEat = ({ size, filled }: IconProps) => (
  <Svg size={size}>
    {filled ? (
      <path d="M3.5 11.5h17a8.5 8.5 0 0 1-8.5 7 8.5 8.5 0 0 1-8.5-7Z" fill="currentColor" stroke="none" />
    ) : (
      <path d="M3.5 11.5h17a8.5 8.5 0 0 1-8.5 7 8.5 8.5 0 0 1-8.5-7Z" />
    )}
    <path
      d="M9 8c0-1 .8-1.4.8-2.4S9 3.5 9 3.5M12 8c0-1 .8-1.4.8-2.4S12 3.5 12 3.5M15 8c0-1 .8-1.4.8-2.4S15 3.5 15 3.5"
      strokeWidth={1.6}
    />
  </Svg>
);
export const IcSleep = ({ size, filled }: IconProps) => (
  <Svg size={size}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" fill={filled ? "currentColor" : "none"} />
  </Svg>
);
export const IcDiaper = ({ size, filled }: IconProps) => (
  <Svg size={size}>
    <path d="M4 6h16v3a8 8 0 0 1-8 8 8 8 0 0 1-8-8V6Z" fill={filled ? "currentColor" : "none"} />
    <path d="M4 9h4.5M20 9h-4.5" strokeWidth={1.5} />
  </Svg>
);
export const IcGrow = ({ size, filled }: IconProps) => (
  <Svg size={size}>
    <path d="M12 21v-9" />
    <path d="M12 12c0-3 2.5-5 6-5 0 3-2.5 5-6 5Z" fill={filled ? "currentColor" : "none"} />
    <path d="M12 13c0-2.5-2-4.5-5-4.5 0 2.5 2 4.5 5 4.5Z" fill={filled ? "currentColor" : "none"} />
  </Svg>
);

// ---- Utility icons ----
export const IcClock = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
export const IcPlus = ({ size }: IconProps) => (
  <Svg size={size} sw={2.1}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IcChevR = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);
export const IcChevL = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);
export const IcChevD = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M5 9l7 7 7-7" />
  </Svg>
);
export const IcList = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </Svg>
);
export const IcGear = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.4 5.6l-1.4 1.4M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" />
  </Svg>
);
export const IcUsers = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5.8M17.5 19a5.5 5.5 0 0 0-3-4.9" strokeWidth={1.6} />
  </Svg>
);
export const IcCheck = ({ size }: IconProps) => (
  <Svg size={size} sw={2.2}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Svg>
);
export const IcX = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IcTrash = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </Svg>
);
export const IcMail = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M4 7l8 6 8-6" />
  </Svg>
);
export const IcSun = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="4" />
    <path
      d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3"
      strokeWidth={1.6}
    />
  </Svg>
);
export const IcMoon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" />
  </Svg>
);
export const IcDrop = ({ size, filled }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3.5c3.5 4 6 6.6 6 10a6 6 0 0 1-12 0c0-3.4 2.5-6 6-10Z" fill={filled ? "currentColor" : "none"} />
  </Svg>
);
export const IcLeaf = ({ size, filled }: IconProps) => (
  <Svg size={size}>
    <path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z" fill={filled ? "currentColor" : "none"} />
    <path d="M5 19c2.5-4 5.5-6.5 9-8.5" strokeWidth={1.5} />
  </Svg>
);
export const IcPlay = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />
  </Svg>
);
export const IcStop = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor" stroke="none" />
  </Svg>
);
// Pause glyph (#12) — two bars. Sleep หยุด *freezes* the nap (not a stop square).
export const IcPause = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="7" y="6" width="3.5" height="12" rx="1.4" fill="currentColor" stroke="none" />
    <rect x="13.5" y="6" width="3.5" height="12" rx="1.4" fill="currentColor" stroke="none" />
  </Svg>
);
// ---- Eat v2 glyphs (ported from design/icons_eat2.jsx) — non-anatomical ----
export const IcBottle = ({ size, filled }: IconProps) => (
  <Svg size={size}>
    <path d="M9 8.5h6v9a3 3 0 0 1-3 3 3 3 0 0 1-3-3v-9Z" fill={filled ? "currentColor" : "none"} />
    <path d="M9.6 8.5l.5-2h3.8l.5 2" />
    <path d="M10.2 6.5l-.4-1.2a1 1 0 0 1 .95-1.3h2.5a1 1 0 0 1 .95 1.3l-.4 1.2" />
    <path d="M11 13h2.5" strokeWidth={1.4} opacity={filled ? 0 : 0.9} />
  </Svg>
);
export const IcRepeat = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 9a8 8 0 0 1 13.5-3.5L20 8" />
    <path d="M20 4v4h-4" />
    <path d="M20 15a8 8 0 0 1-13.5 3.5L4 16" />
    <path d="M4 20v-4h4" />
  </Svg>
);
// ---- Invite-link UX glyphs (ported from design/icons_invite.jsx) ----
export const IcShare = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="17.5" cy="6" r="2.4" />
    <circle cx="17.5" cy="18" r="2.4" />
    <path d="M8.1 10.9 15.4 7.1M8.1 13.1l7.3 3.8" strokeWidth={1.7} />
  </Svg>
);
export const IcCopy = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
    <path d="M5.5 15.5H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5h9A1.5 1.5 0 0 1 15.5 5v.5" strokeWidth={1.7} />
  </Svg>
);
export const IcLink = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M9.5 14.5a3.5 3.5 0 0 1 0-5l2-2a3.5 3.5 0 0 1 5 5l-1 1" />
    <path d="M14.5 9.5a3.5 3.5 0 0 1 0 5l-2 2a3.5 3.5 0 0 1-5-5l1-1" />
  </Svg>
);

export const VERB_ICON = { eat: IcEat, sleep: IcSleep, diaper: IcDiaper, grow: IcGrow } as const;
