import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parsePrivacy } from "@/lib/privacy";
import { t } from "@/i18n";

export const metadata = { title: `${"นโยบายความเป็นส่วนตัว"} — ละมุน` };

export default function PrivacyPage() {
  const p = parsePrivacy();
  return (
    <div className="app">
      <div className="app-main">
        <div className="screen-body privacy" lang="th" style={{ paddingTop: 18 }}>
          <div className="appbar" style={{ paddingBottom: 8 }}>
            <Link href="/" className="iconbtn primary-target" aria-label={t("common.back")}>
              ←
            </Link>
            <span className="ttl" style={{ fontSize: 17 }}>
              {t("privacy.title")}
            </span>
          </div>
          {p.updated && (
            <div style={{ fontSize: 12, color: "var(--fg-faint)", margin: "0 2px 12px" }}>ปรับปรุงล่าสุด: {p.updated}</div>
          )}

          {/* Summary card — most parents read only this */}
          <div
            style={{
              background: "var(--primary-tint)",
              border: "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
              borderRadius: "var(--r-lg)",
              padding: "13px 15px",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", marginBottom: 6 }}>สรุปสั้น ๆ ก่อน</div>
            <div className="privacy-md privacy-summary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.summary}</ReactMarkdown>
            </div>
          </div>

          {p.hasPlaceholders ? (
            // §1 entity info not yet filled — don't ship placeholder text. Show the
            // gist + contact, hold the full sectioned policy until the CPO fills it.
            <div className="note" style={{ fontSize: 13, lineHeight: 1.65 }}>
              ฉบับเต็มของนโยบายกำลังจัดทำให้สมบูรณ์ก่อนเปิดสาธารณะ ระหว่างนี้สรุปด้านบนคือสาระสำคัญ หากมีคำถามด้านข้อมูลส่วนบุคคล
              ติดต่อ <b>support@lamoon.app</b>
            </div>
          ) : (
            <>
              {/* Sticky TOC */}
              <nav className="privacy-toc" aria-label="สารบัญ">
                <div className="toc-h">สารบัญ</div>
                {p.sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="toc-link">
                    {s.title}
                  </a>
                ))}
              </nav>
              {/* Numbered sections */}
              {p.sections.map((s) => (
                <section key={s.id} id={s.id} className="privacy-section">
                  <h2>{s.title}</h2>
                  <div className="privacy-md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.body}</ReactMarkdown>
                  </div>
                </section>
              ))}
            </>
          )}

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
