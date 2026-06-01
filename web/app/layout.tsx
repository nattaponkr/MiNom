import type { Metadata, Viewport } from "next";
// Design tokens + components + states are lifted verbatim from the Phase 1
// deliverable; globals.css adapts them to a real full-viewport app.
import "@/styles/tokens.css";
import "@/styles/components.css";
import "@/styles/states.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MiNom — the simplest baby tracker",
  description: "Eat, Sleep, Diaper, Grow — logged in two taps, shared in real time.",
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

// Set the theme before paint to avoid a flash. Honors a saved choice, else the
// OS preference.
const themeInit = `(function(){try{var t=localStorage.getItem('minom_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
