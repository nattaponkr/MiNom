"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Baby, Profile, SessionUser } from "@/lib/types";
import { getRepo } from "@/lib/sync/repo";
import { Avatar, Button } from "./ui";
import { ConfirmSheet } from "./Sheets";
import { IcCheck } from "@/lib/icons";
import { t } from "@/i18n";

export default function SettingsScreen({
  me,
  profile,
  baby,
  onSignedOut,
  onProfileChanged,
}: {
  me: SessionUser;
  profile: Profile | null;
  baby: Baby;
  onSignedOut: () => void;
  onProfileChanged: () => void;
}) {
  const [name, setName] = useState(profile?.display_name ?? "");
  const [notif, setNotif] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exported, setExported] = useState(false);
  const dirty = name.trim() && name.trim() !== profile?.display_name;

  useEffect(() => {
    setName(profile?.display_name ?? "");
  }, [profile?.display_name]);
  useEffect(() => {
    try {
      setNotif(localStorage.getItem("lamoon_notif") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const saveName = async () => {
    if (!dirty) return;
    const repo = await getRepo();
    await repo.updateProfile({ display_name: name.trim() });
    onProfileChanged();
  };

  const toggleNotif = () => {
    const next = !notif;
    setNotif(next);
    try {
      localStorage.setItem("lamoon_notif", next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const exportData = async () => {
    const repo = await getRepo();
    const data = await repo.exportMyData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lamoon-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const signOut = async () => {
    const repo = await getRepo();
    await repo.signOut();
    onSignedOut();
  };

  const doDelete = async () => {
    const repo = await getRepo();
    await repo.deleteAccount();
    setConfirmDelete(false);
    onSignedOut();
  };

  return (
    <div className="screen-body" lang="th">
      <div className="appbar">
        <span className="ttl">{t("tab.settings")}</span>
      </div>

      {/* Account */}
      <div className="tl-day">{t("settings.account")}</div>
      <div className="list">
        <div className="list-row">
          {profile && <Avatar name={profile.display_name} color={profile.avatar_color} size="lg" />}
          <span className="lr-main">
            <span className="lr-t">{profile?.display_name ?? t("timeline.you")}</span>
            <span className="lr-d">{me.email}</span>
          </span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="dname">{t("settings.displayName")}</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="dname" className="input" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
          {dirty && (
            <Button kind="primary" onClick={saveName} aria-label={t("common.save")}>
              {t("common.save")}
            </Button>
          )}
        </div>
      </div>
      <div className="list" style={{ marginTop: 4 }}>
        <div className="list-row">
          <span className="lr-main">
            <span className="lr-t">{t("settings.baby")}</span>
            <span className="lr-d">{baby.name}</span>
          </span>
        </div>
      </div>

      {/* Preferences */}
      <div className="tl-day" style={{ marginTop: 18 }}>
        {t("settings.preferences")}
      </div>
      <div className="list">
        <div className="list-row">
          <span className="lr-main">
            <span className="lr-t">{t("settings.notif")}</span>
            <span className="lr-d">{t("settings.notifHint")}</span>
          </span>
          <button
            role="switch"
            aria-checked={notif}
            aria-label={t("settings.notif")}
            onClick={toggleNotif}
            type="button"
            style={{
              width: 48,
              height: 28,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: notif ? "var(--primary)" : "var(--border-strong)",
              position: "relative",
              flex: "none",
            }}
          >
            <span style={{ position: "absolute", top: 3, left: notif ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
          </button>
        </div>
      </div>

      {/* Data & privacy (PDPA) */}
      <div className="tl-day" style={{ marginTop: 18 }}>
        {t("privacy.title")}
      </div>
      <div className="list">
        <button className="list-row" onClick={exportData} type="button" style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid var(--border)" }}>
          <span className="lr-main">
            <span className="lr-t">{exported ? <><IcCheck size={14} /> {t("settings.exportDone")}</> : t("settings.export")}</span>
          </span>
        </button>
        <Link href="/privacy" className="list-row" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="lr-main">
            <span className="lr-t">{t("privacy.title")}</span>
          </span>
        </Link>
      </div>

      <div style={{ height: 18 }} />
      <Button kind="ghost" block onClick={signOut}>
        {t("settings.signOut")}
      </Button>
      <div style={{ height: 10 }} />
      <Button kind="danger" block onClick={() => setConfirmDelete(true)}>
        {t("settings.deleteAccount")}
      </Button>

      {confirmDelete && (
        <ConfirmSheet
          title={t("settings.deleteConfirm.title")}
          body={t("settings.deleteConfirm.body")}
          confirmLabel={t("settings.deleteAccount")}
          cancelLabel={t("delete.keep")}
          danger
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
