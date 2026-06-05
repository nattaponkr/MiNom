"use client";
// Caregivers screen (Handoff #06) — sectioned list with persistent pending invites.
// The old one-time invite link (lost on page exit) is gone: every pending invite is a
// row that opens its own detail sheet (the canonical home for sharing that invite).
import { useCallback, useEffect, useRef, useState } from "react";
import type { Baby, Caregiver, Invite, SessionUser } from "@/lib/types";
import { getRepo } from "@/lib/sync/repo";
import { daysUntil, sentAgo } from "@/lib/format";
import { Avatar, Button } from "./ui";
import { ConfirmSheet } from "./Sheets";
import InviteSheet from "./InviteSheet";
import { IcChevR, IcMail, IcPlus, IcRepeat, IcUsers, IcX } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { t } from "@/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isExpired = (inv: Invite) => new Date(inv.expires_at).getTime() < Date.now();

export default function CaregiversScreen({ me, baby, onChanged }: { me: SessionUser; baby: Baby; onChanged: () => void }) {
  const [rows, setRows] = useState<Caregiver[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Invite | null>(null); // open invite detail sheet
  const [revoking, setRevoking] = useState<Invite | null>(null); // revoke confirm
  const [confirm, setConfirm] = useState<{ kind: "remove" | "transfer" | "leave"; cg?: Caregiver } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async (): Promise<Invite[]> => {
    const repo = await getRepo();
    const [cgs, invs] = await Promise.all([repo.listCaregivers(baby.id), repo.listInvites(baby.id)]);
    setRows(cgs);
    setInvites(invs);
    setLoading(false);
    return invs;
  }, [baby.id]);
  useEffect(() => {
    void reload();
  }, [reload]);

  const myRole = rows.find((r) => r.user_id === me.id)?.role ?? "caregiver";
  const isOwner = myRole === "owner";
  const myName = rows.find((r) => r.user_id === me.id)?.display_name ?? t("timeline.you");
  const emailValid = EMAIL_RE.test(email);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Create (or resend) an invite, then open its detail sheet so the owner shares it.
  const invite = async (toEmail: string) => {
    const target = toEmail.trim().toLowerCase();
    setAdding(true);
    setError(null);
    const repo = await getRepo();
    const res = await repo.createInvite(baby.id, target);
    if (res.error || !res.token) {
      setAdding(false);
      setError(t(res.error ?? "care.error.generic"));
      return;
    }
    // Best-effort email; harmless when Resend is in test mode — the link is the path.
    void fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: res.token, to: target, inviterName: myName, babyName: baby.name }),
    }).catch(() => {});
    track("caregiver_invited", { channel: "email-new" });
    setAdding(false);
    const invs = await reload();
    const fresh = invs.find((i) => i.email === target && !isExpired(i));
    if (fresh) setSelected(fresh);
  };

  const onAdd = async () => {
    if (!emailValid) return;
    await invite(email);
    setEmail("");
  };

  const doRevoke = async () => {
    if (!revoking) return;
    const repo = await getRepo();
    await repo.revokeInvite(revoking.id);
    setRevoking(null);
    await reload();
    flash(t("invite.revoked"));
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

  const showEmpty = isOwner && !loading && rows.length <= 1 && invites.length === 0;

  return (
    <div className="screen-body" lang="th">
      <div className="appbar">
        <span>
          <span className="ttl">{t("tab.care")}</span>
          <span className="sub">{t("care.count", { n: rows.length })}</span>
        </span>
      </div>

      {showEmpty && (
        <div className="cg-empty">
          <span className="cg-empty-ic">
            <IcUsers size={30} />
          </span>
          <div className="cg-empty-t">{t("care.emptyTitle")}</div>
          <div className="cg-empty-b">{t("care.emptyBody", { baby: baby.name })}</div>
          <Button kind="primary" icon={<IcPlus size={18} />} style={{ marginTop: 4 }} onClick={() => inputRef.current?.focus()}>
            {t("care.emptyCta")}
          </Button>
        </div>
      )}

      {/* Active caregivers */}
      {!loading && !showEmpty && (
        <>
          <div className="cg-section">{t("care.sectionActive")}</div>
          <div className="cg-list">
            {rows.map((cg) => {
              const isMe = cg.user_id === me.id;
              const showControls = isOwner && !isMe && cg.role !== "owner";
              return (
                <div className="cg-row" key={cg.user_id}>
                  <Avatar name={isMe ? t("timeline.you") : cg.display_name} color={cg.avatar_color} size="lg" />
                  <span className="cg-main">
                    <span className="cg-name">{isMe ? t("timeline.you") : cg.display_name}</span>
                    {isOwner && cg.email && <span className="cg-sub">{cg.email}</span>}
                  </span>
                  {showControls ? (
                    <span className="cg-cta">
                      <button className="text-link" onClick={() => setConfirm({ kind: "transfer", cg })} type="button" style={{ fontSize: 13 }}>
                        {t("care.transfer")}
                      </button>
                      <button className="text-link" onClick={() => setConfirm({ kind: "remove", cg })} type="button" style={{ fontSize: 13, color: "var(--danger)" }}>
                        {t("care.remove")}
                      </button>
                    </span>
                  ) : (
                    <span className={"cg-badge" + (cg.role === "owner" ? " owner" : "")}>{cg.role === "owner" ? t("care.roleOwner") : t("care.roleCaregiver")}</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Pending invites (owner only; RLS returns none for caregivers) */}
      {invites.length > 0 && (
        <>
          <div className="cg-section">{t("care.sectionPending")}</div>
          <div className="cg-list">
            {invites.map((inv) => {
              const expired = isExpired(inv);
              const days = daysUntil(inv.expires_at);
              const soon = !expired && days <= 3;
              return (
                <button className="cg-row pending" key={inv.id} type="button" onClick={() => (expired ? void invite(inv.email) : setSelected(inv))}>
                  <span className="cg-avatar-pending">
                    <IcMail size={18} />
                  </span>
                  <span className="cg-main">
                    <span className="cg-name">{inv.email}</span>
                    <span className="cg-meta-row">
                      <span className={"cg-status" + (expired ? " expired" : "")}>{expired ? t("care.statusExpired") : t("care.statusPending")}</span>
                      <span className="cg-dot">·</span>
                      {expired ? (
                        <span className="cg-when">{t("care.expiredAt", { time: sentAgo(inv.expires_at) })}</span>
                      ) : (
                        <span className={"cg-when" + (soon ? " warn" : "")}>
                          {soon ? t("care.expiresSoon", { dur: t("age.days", { n: days }) }) : t("care.expiresIn", { dur: t("age.days", { n: days }) })}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className={"cg-go" + (expired ? " resend" : "")}>{expired ? <IcRepeat size={16} /> : <IcChevR size={18} />}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Invite a caregiver (owner only) */}
      {isOwner && (
        <>
          <div className="cg-section" style={{ marginTop: 18 }}>
            {t("care.add")}
          </div>
          <div className="field">
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
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
              <Button kind="primary" icon={<IcPlus size={18} />} disabled={!emailValid || adding} loading={adding} onClick={onAdd} aria-label={t("care.add")}>
                {t("care.add")}
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

      {/* Invite detail sheet */}
      {selected && (
        <InviteSheet
          invite={selected}
          babyName={baby.name}
          myName={myName}
          onRevoke={() => {
            setRevoking(selected);
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Revoke confirm */}
      {revoking && (
        <ConfirmSheet
          title={t("invite.revokeTitle")}
          body={t("invite.revokeBody", { email: revoking.email })}
          confirmLabel={t("invite.revokeConfirm")}
          cancelLabel={t("invite.revokeKeep")}
          danger
          onConfirm={doRevoke}
          onCancel={() => setRevoking(null)}
        />
      )}

      {/* Transfer / remove / leave confirm */}
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

      {toast && (
        <div className="toast-wrap">
          <div className="toast info" role="status">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
