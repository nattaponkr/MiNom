"use client";
import { useState } from "react";
import { getRepo } from "@/lib/sync/repo";
import { Button } from "./ui";
import { IcX } from "@/lib/icons";

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
    onDone();
  };

  return (
    <div className="app">
      <form className="center-screen" onSubmit={submit} noValidate>
        <div className="brand-mark">
          <span className="dot" />
          <span className="wm">
            Mi<span className="n">Nom</span>
          </span>
          <span style={{ fontSize: 14, color: "var(--fg-muted)" }}>The simplest baby tracker</span>
        </div>

        {mode === "up" && (
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              className={"input" + (touched.name && !nameValid ? " err" : "")}
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="e.g. Mom, Dad, Nanny"
            />
            {touched.name && !nameValid && (
              <span className="input-help err">
                <IcX size={13} /> Tell us what to call you.
              </span>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={"input" + (touched.email && !emailValid ? " err" : "")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="you@email.com"
          />
          {touched.email && !emailValid && (
            <span className="input-help err">
              <IcX size={13} /> Enter a valid email (e.g. anna@email.com)
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            className={"input" + (touched.password && !passwordValid ? " err" : "")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            placeholder="At least 6 characters"
          />
          {touched.password && !passwordValid && (
            <span className="input-help err">
              <IcX size={13} /> Use at least 6 characters.
            </span>
          )}
        </div>

        {formError && (
          <div className="form-error" role="alert">
            <IcX size={15} /> {formError}
          </div>
        )}

        <Button kind="primary" size="lg" type="submit" loading={submitting} disabled={!canSubmit}>
          {mode === "in" ? "Sign in" : "Create account"}
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
                New here? <b>Create account</b>
              </>
            ) : (
              <>
                Have an account? <b>Sign in</b>
              </>
            )}
          </button>
        </div>

        {isDemo && (
          <div className="note" style={{ fontSize: 12.5 }}>
            <b>Demo mode</b> — no backend configured. Accounts and data are stored only in this browser. Open a second tab
            (or window) signed into the same baby to see real-time sync. Add Supabase keys to <code>.env.local</code> for
            real multi-device.
          </div>
        )}
      </form>
    </div>
  );
}
