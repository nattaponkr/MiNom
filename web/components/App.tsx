"use client";
import { useCallback, useEffect, useState } from "react";
import { getRepo } from "@/lib/sync/repo";
import type { Baby, Profile, SessionUser } from "@/lib/types";
import AuthScreen from "./AuthScreen";
import BabySetup from "./BabySetup";
import Main from "./Main";

type Status = "loading" | "auth" | "setup" | "app";

export default function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [me, setMe] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [baby, setBaby] = useState<Baby | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const refresh = useCallback(async () => {
    const repo = await getRepo();
    setIsDemo(repo.isDemo);
    const session = await repo.getSession();
    setMe(session);
    if (!session) {
      setProfile(null);
      setBaby(null);
      setStatus("auth");
      return;
    }
    setProfile(await repo.getProfile());
    const babies = await repo.listBabies();
    if (!babies.length) {
      setStatus("setup");
    } else {
      setBaby(babies[0]); // single-baby in v0.2; selector is Phase 3
      setStatus("app");
    }
  }, []);

  useEffect(() => {
    void refresh();
    let unsub = () => {};
    (async () => {
      const repo = await getRepo();
      unsub = repo.onAuthChange(() => void refresh());
    })();
    return () => unsub();
  }, [refresh]);

  if (status === "loading") {
    return (
      <div className="app">
        <div className="center-screen" aria-busy="true">
          <div className="brand-mark">
            <span className="dot" />
            <span className="wm">
              Mi<span className="n">Nom</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "auth") return <AuthScreen isDemo={isDemo} onDone={refresh} />;
  if (status === "setup") return <BabySetup onDone={refresh} />;
  if (status === "app" && me && baby) return <Main me={me} profile={profile} baby={baby} onSignOut={refresh} />;
  return null;
}
