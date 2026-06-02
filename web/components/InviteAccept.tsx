"use client";
import { useCallback, useEffect, useState } from "react";
import { getRepo } from "@/lib/sync/repo";
import { track } from "@/lib/analytics";
import { LamoonWordmark } from "./Brand";
import AuthScreen from "./AuthScreen";
import { Button } from "./ui";
import { IcCheck, IcX } from "@/lib/icons";
import { t } from "@/i18n";

type Status = "checking" | "needauth" | "accepting" | "done" | "error";

export default function InviteAccept({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [err, setErr] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const doAccept = useCallback(async () => {
    setStatus("accepting");
    const repo = await getRepo();
    const res = await repo.acceptInvite(token);
    if (res.error) {
      setErr(t(res.error));
      setStatus("error");
      return;
    }
    track("caregiver_accepted", {});
    setStatus("done");
    setTimeout(() => {
      window.location.href = "/";
    }, 1300);
  }, [token]);

  useEffect(() => {
    (async () => {
      const repo = await getRepo();
      setIsDemo(repo.isDemo);
      const session = await repo.getSession();
      if (session) void doAccept();
      else setStatus("needauth");
    })();
  }, [doAccept]);

  if (status === "needauth") {
    // Branded invite intro, then the normal auth form; on auth success we accept.
    return (
      <div className="app">
        <div className="center-screen" style={{ gap: 8 }}>
          <div className="brand-mark">
            <LamoonWordmark size={40} />
          </div>
          <div className="note" lang="th" style={{ textAlign: "center" }}>
            <b>{t("invite.title")}</b>
            <div style={{ marginTop: 6, fontWeight: 400 }}>{t("invite.body")}</div>
          </div>
        </div>
        <AuthScreen isDemo={isDemo} onDone={doAccept} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="center-screen" style={{ alignItems: "center", textAlign: "center" }} lang="th">
        <div className="brand-mark">
          <LamoonWordmark size={40} />
        </div>
        {status === "error" ? (
          <>
            <div className="form-error" role="alert" style={{ justifyContent: "center" }}>
              <IcX size={15} /> {err}
            </div>
            <Button kind="ghost" onClick={() => (window.location.href = "/")}>
              {t("invite.toApp")}
            </Button>
          </>
        ) : status === "done" ? (
          <div style={{ color: "var(--good)", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <IcCheck size={20} /> {t("invite.done")}
          </div>
        ) : (
          <div style={{ color: "var(--fg-muted)" }}>{t("invite.accepting")}</div>
        )}
      </div>
    </div>
  );
}
