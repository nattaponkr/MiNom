import Link from "next/link";
import { t } from "@/i18n";

export default function PrivacyPage() {
  return (
    <div className="app">
      <div className="app-main">
        <div className="screen-body" lang="th" style={{ paddingTop: 20 }}>
          <div className="appbar">
            <span className="ttl">{t("privacy.title")}</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg-muted)" }}>{t("privacy.body")}</p>
          <ul style={{ fontSize: 13.5, lineHeight: 1.8, color: "var(--fg-muted)", paddingLeft: 18 }}>
            <li>{t("consent.line1")}</li>
            <li>{t("consent.line2")}</li>
            <li>{t("consent.line3")}</li>
          </ul>
          <p style={{ fontSize: 13, color: "var(--fg-faint)", marginTop: 16 }}>{t("privacy.contact")}</p>
          <div style={{ marginTop: 24 }}>
            <Link href="/" className="text-link" style={{ fontSize: 15 }}>
              ← {t("common.back")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
