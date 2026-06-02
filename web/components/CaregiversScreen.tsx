"use client";
import { useCallback, useEffect, useState } from "react";
import type { Baby, Caregiver, SessionUser } from "@/lib/types";
import { getRepo } from "@/lib/sync/repo";
import { Avatar, Button } from "./ui";
import { ConfirmSheet } from "./Sheets";
import { IcMail, IcPlus, IcX } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { t } from "@/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CaregiversScreen({ me, baby, onChanged }: { me: SessionUser; baby: Baby; onChanged: () => void }) {
  const [rows, setRows] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "remove" | "transfer" | "leave"; cg?: Caregiver } | null>(null);

  const reload = useCallback(async () => {
    const repo = await getRepo();
    setRows(await repo.listCaregivers(baby.id));
    setLoading(false);
  }, [baby.id]);
  useEffect(() => {
    void reload();
  }, [reload]);

  const myRole = rows.find((r) => r.user_id === me.id)?.role ?? "caregiver";
  const isOwner = myRole === "owner";
  const emailValid = EMAIL_RE.test(email);

  const add = async () => {
    if (!emailValid) return;
    setAdding(true);
    setError(null);
    const repo = await getRepo();
    const res = await repo.addCaregiverByEmail(baby.id, email);
    setAdding(false);
    if (res.error) {
      setError(t(res.error));
      return;
    }
    track("caregiver_invited", { channel: "email-existing" });
    setEmail("");
    void reload();
  };

  const doConfirm = async () => {
    if (!confirm) return;
    const repo = await getRepo();
    try {
      if (confirm.kind === "transfer" && confirm.cg) await repo.transferOwnership(baby.id, confirm.cg.user_id);
      else if (confirm.kind === "remove" && confirm.cg) await repo.removeCaregiver(baby.id, confirm.cg.user_id);
      else if (confirm.kind === "leave") await repo.removeCaregiver(baby.id, me.id);
    } catch {
      /* ignore in demo */
    }
    setConfirm(null);
    if (confirm.kind === "leave") onChanged();
    else void reload();
  };

  return (
    <div className="screen-body" lang="th">
      <div className="appbar">
        <span>
          <span className="ttl">{t("tab.care")}</span>
          <span className="sub">{t("care.count", { n: rows.length })}</span>
        </span>
      </div>

      {!loading && (
        <div className="list">
          {rows.map((cg) => {
            const isMe = cg.user_id === me.id;
            return (
              <div className="list-row" key={cg.user_id}>
                <Avatar name={isMe ? t("timeline.you") : cg.display_name} color={cg.avatar_color} size="lg" />
                <span className="lr-main">
                  <span className="lr-t">
                    {isMe ? t("timeline.you") : cg.display_name} {cg.role === "owner" && <span className="badge owner">{t("care.owner")}</span>}
                  </span>
                  {isOwner && cg.email && <span className="lr-d">{cg.email}</span>}
                </span>
                {isOwner && !isMe && (
                  <span style={{ display: "flex", gap: 6 }}>
                    {cg.role !== "owner" && (
                      <button className="text-link" onClick={() => setConfirm({ kind: "transfer", cg })} type="button" style={{ fontSize: 13 }}>
                        {t("care.transfer")}
                      </button>
                    )}
                    {cg.role !== "owner" && (
                      <button className="text-link" onClick={() => setConfirm({ kind: "remove", cg })} type="button" style={{ fontSize: 13, color: "var(--danger)" }}>
                        {t("care.remove")}
                      </button>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add caregiver (owner only) */}
      {isOwner && (
        <>
          <div className="tl-day" style={{ marginTop: 18 }}>
            {t("care.add")}
          </div>
          <div className="field">
            <label htmlFor="cgemail">{t("care.email.label")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="cgemail"
                type="email"
                inputMode="email"
                className={"input" + (error ? " err" : "")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder={t("care.email.placeholder")}
                style={{ flex: 1 }}
              />
              <Button kind="primary" icon={<IcPlus size={18} />} disabled={!emailValid || adding} loading={adding} onClick={add} aria-label={t("care.send")}>
                {t("care.send")}
              </Button>
            </div>
            {error ? (
              <span className="input-help err">
                <IcX size={13} /> {error}
              </span>
            ) : (
              <span className="input-help">
                <IcMail size={12} /> {t("care.inviteHelper")}
              </span>
            )}
          </div>
        </>
      )}

      {/* Non-owner: leave */}
      {!isOwner && !loading && (
        <>
          <div style={{ height: 18 }} />
          <Button kind="ghost" block onClick={() => setConfirm({ kind: "leave" })}>
            {t("care.leave")}
          </Button>
        </>
      )}

      {confirm && (
        <ConfirmSheet
          title={confirm.kind === "transfer" ? t("care.transferConfirm.title", { name: confirm.cg?.display_name ?? "" }) : confirm.kind === "remove" ? t("care.removeConfirm.title") : t("care.leave")}
          body={
            confirm.kind === "transfer"
              ? t("care.transferConfirm.body", { name: confirm.cg?.display_name ?? "" })
              : confirm.kind === "remove"
                ? t("care.removeConfirm.body", { name: confirm.cg?.display_name ?? "" })
                : t("care.removeConfirm.body", { name: t("timeline.you") })
          }
          confirmLabel={confirm.kind === "transfer" ? t("care.transfer") : confirm.kind === "remove" ? t("care.remove") : t("care.leave")}
          cancelLabel={t("common.cancel")}
          danger={confirm.kind !== "transfer"}
          onConfirm={doConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
