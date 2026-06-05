"use client";
// Invite detail sheet (Handoff #06) — the persistent home of one pending invite.
// Share-first (navigator.share) where supported, copy-first otherwise. The link is
// an unauth token → never default-visible bold; revealed inside this sheet only.
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Invite } from "@/lib/types";
import { daysUntil, sentAgo } from "@/lib/format";
import { Button } from "./ui";
import { IcChevD, IcCheck, IcCopy, IcLink, IcMail, IcShare, IcTrash } from "@/lib/icons";
import { t } from "@/i18n";

const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

export default function InviteSheet({
  invite,
  babyName,
  myName,
  onRevoke,
  onClose,
}: {
  invite: Invite;
  babyName: string;
  myName: string;
  onRevoke: () => void;
  onClose: () => void;
}) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${invite.token}`;
  const display = url.replace(/^https?:\/\//, "");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [share, setShare] = useState(false);
  useEffect(() => setShare(canShare()), []);

  const days = daysUntil(invite.expires_at);
  const copy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  const doShare = async () => {
    try {
      await navigator.share({ title: t("brand.name"), text: t("invite.shareHint"), url });
    } catch {
      /* user dismissed the OS sheet / unsupported — no-op */
    }
  };

  const linkBox = (
    <div className="inv-linkbox">
      <span className="inv-link-label">{t("invite.linkLabel")}</span>
      <div className="inv-link-row">
        <IcLink size={16} />
        <span className="inv-url">{display}</span>
        <button className={"inv-copy-btn" + (copied ? " done" : "")} onClick={copy} type="button">
          {copied ? (
            <>
              <IcCheck size={15} /> {t("invite.copied")}
            </>
          ) : (
            <>
              <IcCopy size={15} /> {t("invite.copy")}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="overlay" style={{ position: "fixed", zIndex: 70 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={invite.email}>
      <div className="sheet inv-sheet" style={{ width: "100%", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(18px + env(safe-area-inset-bottom,0px))" }} onClick={(e) => e.stopPropagation()} lang="th">
        <div className="sheet-handle" />

        <div className="inv-head">
          <span className="inv-avatar">
            <IcMail size={20} />
          </span>
          <span>
            <span className="inv-email">{invite.email}</span>
            <span className="inv-status">
              {t("care.statusPending")} · {t("care.expiresIn", { dur: t("age.days", { n: days }) })}
            </span>
          </span>
        </div>

        <p className="inv-hint">{t("invite.sheetHint", { baby: babyName })}</p>

        {share ? (
          <>
            <Button kind="primary" size="lg" block icon={<IcShare size={18} />} style={{ background: "var(--primary)" }} onClick={doShare}>
              {t("invite.share")}
            </Button>
            <p className="inv-sub-hint">{t("invite.shareHint")}</p>
            {linkBox}
            <button className="inv-qr-toggle" onClick={() => setShowQR((s) => !s)} type="button" aria-expanded={showQR}>
              {showQR ? t("invite.hideQR") : t("invite.showQR")}
              <IcChevD size={16} />
            </button>
            {showQR && (
              <div className="inv-qr">
                <div className="inv-qr-frame">
                  <QRCodeSVG value={url} size={150} bgColor="#ffffff" fgColor="#2b2622" level="M" />
                </div>
                <span className="inv-qr-hint">{t("invite.qrHint")}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {linkBox}
            <Button kind="primary" size="lg" block icon={<IcCopy size={18} />} style={{ background: "var(--primary)" }} onClick={copy}>
              {copied ? t("invite.copied") : t("invite.copyPrimary")}
            </Button>
            <p className="inv-sub-hint">{t("invite.copyPrimaryHint")}</p>
          </>
        )}

        <div className="inv-foot">
          <span className="inv-meta">{t("invite.sentMeta", { name: invite.inviter || myName, time: sentAgo(invite.created_at) })}</span>
          <button className="inv-revoke" onClick={onRevoke} type="button">
            <IcTrash size={15} /> {t("invite.revoke")}
          </button>
        </div>
      </div>
    </div>
  );
}
