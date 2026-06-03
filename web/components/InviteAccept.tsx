"use client";
import { useCallback, useEffect, useState } from "react";
import { getRepo } from "@/lib/sync/repo";
import type { InvitePreview } from "@/lib/sync/repo";
import { track } from "@/lib/analytics";
import { LamoonWordmark } from "./Brand";
import { Button } from "./ui";
import { IcCheck, IcMail, IcX } from "@/lib/icons";
import { t } from "@/i18n";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Phase = "loading" | "invalid" | "form" | "working" | "done" | "checkInbox" | "error";

// Module-scoped so its identity is stable across renders (an inner component
// would remount on every keystroke and corrupt the form inputs).
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <div className="center-screen" lang="th">
        <div className="brand-mark">
          <LamoonWordmark size={40} />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function InviteAccept({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [signinEmail, setSigninEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const finish = useCallback(() => {
    setPhase("done");
    setTimeout(() => (window.location.href = "/"), 1300);
  }, []);

  // Existing signed-in user (or after sign-in): link via the accept RPC.
  const acceptAsSignedIn = useCallback(async () => {
    setPhase("working");
    const repo = await getRepo();
    const res = await repo.acceptInvite(token);
    if (res.error) {
      setErr(t(res.error));
      setPhase("error");
      return;
    }
    track("caregiver_accepted", {});
    finish();
  }, [token, finish]);

  useEffect(() => {
    (async () => {
      const repo = await getRepo();
      const pv = await repo.getInvitePreview(token);
      if (!pv) {
        // maybe already signed in + already accepted, or invalid/expired
        const s = await repo.getSession();
        if (s) return void acceptAsSignedIn();
        setPhase("invalid");
        return;
      }
      setPreview(pv);
      const session = await repo.getSession();
      if (session) return void acceptAsSignedIn();
      setPhase("form");
    })();
  }, [token, acceptAsSignedIn]);

  // POST the auto-confirm endpoint; one retry if the signup row hasn't propagated.
  const autoConfirm = async (email: string): Promise<boolean> => {
    for (let i = 0; i < 2; i++) {
      try {
        const r = await fetch("/api/invite/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, email }) });
        const j = (await r.json()) as { ok?: boolean; reason?: string };
        if (j.ok) return true;
        if (j.reason === "no_user" && i === 0) {
          await sleep(900);
          continue;
        }
        return false;
      } catch {
        return false;
      }
    }
    return false;
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || password.length < 6 || name.trim().length < 1) return;
    setErr(null);
    setPhase("working");
    const repo = await getRepo();
    const email = preview.email;
    const res = await repo.signUp(email, password, name);
    if (res.error) {
      setErr(res.error);
      setPhase("form");
      return;
    }
    if (!res.needsConfirmation) {
      // demo / confirmations off → already has a session; just link.
      await repo.acceptInvite(token);
      track("signup_complete", { source: "invited" });
      track("caregiver_accepted", {});
      finish();
      return;
    }
    // confirmations ON → auto-confirm the invited email, then sign in.
    if (await autoConfirm(email)) {
      const si = await repo.signIn(email, password);
      if (!si.error) {
        await repo.acceptInvite(token); // idempotent (server already linked)
        track("signup_complete", { source: "invited" });
        track("caregiver_accepted", {});
        finish();
        return;
      }
    }
    // fallback: couldn't auto-confirm → standard email confirmation path
    setPhase("checkInbox");
  };

  const submitSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinEmail || password.length < 6) return;
    setErr(null);
    setPhase("working");
    const repo = await getRepo();
    const si = await repo.signIn(signinEmail.trim(), password);
    if (si.error) {
      setErr(t("auth.error.badCredentials"));
      setPhase("form");
      return;
    }
    await acceptAsSignedIn();
  };

  // ---- render ----
  if (phase === "loading" || phase === "working") return <Shell><div style={{ textAlign: "center", color: "var(--fg-muted)" }}>{t("invite.accepting")}</div></Shell>;
  if (phase === "done")
    return (
      <Shell>
        <div style={{ color: "var(--good)", fontWeight: 800, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <IcCheck size={20} /> {t("invite.done")}
        </div>
      </Shell>
    );
  if (phase === "invalid" || phase === "error")
    return (
      <Shell>
        <div className="form-error" role="alert" style={{ justifyContent: "center" }}>
          <IcX size={15} /> {err ?? t("care.error.invalidInvite")}
        </div>
        <Button kind="ghost" onClick={() => (window.location.href = "/")}>
          {t("invite.toApp")}
        </Button>
      </Shell>
    );
  if (phase === "checkInbox")
    return (
      <Shell>
        <div style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--primary-tint)", color: "var(--primary)" }}>
          <IcMail size={30} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, textAlign: "center" }}>{t("auth.signup.checkInbox.title")}</div>
        <div style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, textAlign: "center", maxWidth: 300 }}>
          {t("auth.signup.checkInbox.body", { email: preview?.email ?? "" })}
          <br />
          {t("auth.signup.checkInbox.inviteFallback")}
        </div>
      </Shell>
    );

  // phase === "form"
  return (
    <Shell>
      {mode === "signup" ? (
        <form onSubmit={submitSignup} noValidate style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{t("auth.invite.signup.title", { inviter: preview?.inviter ?? "" })}</div>
            <div style={{ fontSize: 13.5, color: "var(--fg-muted)", marginTop: 4 }}>{t("auth.invite.signup.sub", { baby: preview?.baby ?? "" })}</div>
          </div>
          <div className="field">
            <label htmlFor="iemail">{t("auth.email.label")}</label>
            <input id="iemail" className="input" value={preview?.email ?? ""} readOnly disabled />
          </div>
          <div className="field">
            <label htmlFor="iname">{t("auth.name.label")}</label>
            <input id="iname" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("auth.name.placeholder")} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="ipw">{t("auth.password.label")}</label>
            <input id="ipw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.password.placeholder")} autoComplete="new-password" />
          </div>
          {err && (
            <div className="form-error" role="alert">
              <IcX size={15} /> {err}
            </div>
          )}
          <Button kind="primary" size="lg" type="submit" disabled={password.length < 6 || name.trim().length < 1}>
            {t("auth.invite.signup.cta")}
          </Button>
          <button type="button" className="muted-link" onClick={() => { setMode("signin"); setErr(null); }}>
            {t("auth.invite.haveAccount")}
          </button>
        </form>
      ) : (
        <form onSubmit={submitSignin} noValidate style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          <div style={{ textAlign: "center", fontWeight: 800, fontSize: 18 }}>{t("invite.title")}</div>
          <div className="field">
            <label htmlFor="semail">{t("auth.email.label")}</label>
            <input id="semail" type="email" className="input" value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} placeholder={t("auth.email.placeholder")} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="spw">{t("auth.password.label")}</label>
            <input id="spw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {err && (
            <div className="form-error" role="alert">
              <IcX size={15} /> {err}
            </div>
          )}
          <Button kind="primary" size="lg" type="submit" disabled={password.length < 6}>
            {t("auth.signIn")}
          </Button>
          <button type="button" className="muted-link" onClick={() => { setMode("signup"); setErr(null); }}>
            {t("auth.toSignUp")} <b>{t("auth.toSignUp.cta")}</b>
          </button>
        </form>
      )}
    </Shell>
  );
}
