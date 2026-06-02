"use client";
import { useState } from "react";
import Link from "next/link";
import { getRepo } from "@/lib/sync/repo";
import { Button } from "./ui";
import { LamoonWordmark } from "./Brand";
import { IcX } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { t } from "@/i18n";
import { isDebug } from "@/lib/debug";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({ isDemo, onDone }: { isDemo: boolean; onDone: () => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean; name?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email);
  const passwordValid = password.length >= 6;
  const nameValid = mode === "in" || name.trim().length >= 1;
  const canSubmit = emailValid && passwordValid && nameValid && !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, name: true });
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    const repo = await getRepo();
    const res = mode === "in" ? await repo.signIn(email, password) : await repo.signUp(email, password, name);
    setSubmitting(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    if (mode === "up") {
      track("consent_accepted", {});
      track("signup_complete", { source: "organic" });
    }
    onDone();
  };

  return (
    <div className="app">
      <form className="center-screen" onSubmit={submit} noValidate>
        <div className="brand-mark">
          <LamoonWordmark size={42} />
          <span style={{ fontSize: 14, color: "var(--fg-muted)" }} lang="th">
            {t("auth.tagline")}
          </span>
        </div>

        {mode === "up" && (
          <div className="field">
            <label htmlFor="name">{t("auth.name.label")}</label>
            <input
              id="name"
              className={"input" + (touched.name && !nameValid ? " err" : "")}
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              placeholder={t("auth.name.placeholder")}
            />
            {touched.name && !nameValid && (
              <span className="input-help err">
                <IcX size={13} /> {t("auth.name.error")}
              </span>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="email">{t("auth.email.label")}</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={"input" + (touched.email && !emailValid ? " err" : "")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder={t("auth.email.placeholder")}
          />
          {touched.email && !emailValid && (
            <span className="input-help err">
              <IcX size={13} /> {t("auth.email.error")}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="password">{t("auth.password.label")}</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            className={"input" + (touched.password && !passwordValid ? " err" : "")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            placeholder={t("auth.password.placeholder")}
          />
          {touched.password && !passwordValid && (
            <span className="input-help err">
              <IcX size={13} /> {t("auth.password.error")}
            </span>
          )}
        </div>

        {formError && (
          <div className="form-error" role="alert">
            <IcX size={15} /> {formError}
          </div>
        )}

        {mode === "up" && (
          <div className="consent" lang="th">
            <div className="ct">
              {t("consent.line1")}
              <br />
              {t("consent.line2")}
              <br />
              {t("consent.line3")}
              <br />
              {t("consent.line4")} ·{" "}
              <Link href="/privacy" target="_blank">
                {t("consent.readFull")}
              </Link>
            </div>
          </div>
        )}

        <Button kind="primary" size="lg" type="submit" loading={submitting} disabled={!canSubmit}>
          {mode === "in" ? t("auth.signIn") : t("auth.createAccount")}
        </Button>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            className="muted-link"
            onClick={() => {
              setMode((m) => (m === "in" ? "up" : "in"));
              setFormError(null);
            }}
          >
            {mode === "in" ? (
              <>
                {t("auth.toSignUp")} <b>{t("auth.toSignUp.cta")}</b>
              </>
            ) : (
              <>
                {t("auth.toSignIn")} <b>{t("auth.toSignIn.cta")}</b>
              </>
            )}
          </button>
        </div>

        {isDemo && isDebug() && (
          <div className="note" style={{ fontSize: 12.5 }}>
            <b>Demo mode</b> (debug) — no backend; data lives in this browser only. Open a second tab signed into the same
            baby to see real-time sync. Add Supabase env vars for real multi-device.
          </div>
        )}
      </form>
    </div>
  );
}
