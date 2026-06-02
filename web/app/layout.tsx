import type { Metadata, Viewport } from "next";
import { Anuphan, Spline_Sans_Mono } from "next/font/google";
// Design tokens + components + states lifted verbatim from Phase 1; thai.css adds
// the [lang="th"] type overrides; brand.css the ละมุน marks; globals adapts to a
// real full-viewport app. Order matters: thai overrides components, globals last.
import "@/styles/tokens.css";
import "@/styles/components.css";
import "@/styles/states.css";
import "@/styles/brand.css";
import "@/styles/thai.css";
import "@/styles/globals.css";
import { t } from "@/i18n";

// Thai-first faces. Subset + preload to keep first paint within the mobile-4G
// budget (PRD §11.6). Anuphan = UI + wordmark; Spline mono = Latin numerals only.
const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
  preload: true,
});
const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-spline-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${t("brand.name")} — ${t("brand.tagline")}`,
  description: t("brand.positioning"),
  openGraph: { title: t("brand.name"), description: t("brand.positioning") },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(0.984 0.008 76)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.205 0.012 64)" },
  ],
};

const themeInit = `(function(){try{var t=localStorage.getItem('minom_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${anuphan.variable} ${splineMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
