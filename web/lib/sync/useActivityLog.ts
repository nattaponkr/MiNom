"use client";
// useActivityLog — the Phase 2 sync engine.
//
// Responsibilities (all from HANDOFF_dev_01 §3 + section 05):
//   • Optimistic write: a log appears instantly as `queued`; no spinner.
//   • 5s undo: a snackbar lets the user reverse it; if it already synced, we
//     delete server-side.
//   • Offline-safe: writes persist to a localStorage outbox and flush when the
//     connection (or a manual offline toggle) comes back. Logging never blocks.
//   • Realtime: another caregiver's entry arrives within ~5s, animates in, and
//     raises a quiet toast — without stealing focus.
//   • Concurrency: detect a same-verb log by another caregiver in the last 60s.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Activity, EatDetails, SessionUser, VerbType } from "@/lib/types";
import { getRepo, type ActivityInsert, type Repo } from "./repo";

const UNDO_MS = 5000;
const FRESH_MS = 600; // matches --dur-slow arrival animation
const TOAST_MS = 2600;

type Snackbar = { id: string } | null;
type Toast = { name: string } | null;

function outboxKey(babyId: string) {
  return `minom_outbox_${babyId}`;
}
function cacheKey(babyId: string) {
  return `minom_today_${babyId}`;
}

export function useActivityLog(babyId: string | null, me: SessionUser | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [forceOffline, setForceOffline] = useState(false);
  const [snackbar, setSnackbar] = useState<Snackbar>(null);
  const [toast, setToast] = useState<Toast>(null);

  const repoRef = useRef<Repo | null>(null);
  const snackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectiveOnline = online && !forceOffline;
  const effectiveOnlineRef = useRef(effectiveOnline);
  effectiveOnlineRef.current = effectiveOnline;

  const readOutbox = useCallback((): ActivityInsert[] => {
    if (!babyId || typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(outboxKey(babyId)) || "[]");
    } catch {
      return [];
    }
  }, [babyId]);

  const writeOutbox = useCallback(
    (items: ActivityInsert[]) => {
      if (babyId && typeof window !== "undefined") localStorage.setItem(outboxKey(babyId), JSON.stringify(items));
    },
    [babyId],
  );

  // Flush queued writes. Safe to call often; no-ops when offline or empty.
  const flush = useCallback(async () => {
    if (!repoRef.current || !effectiveOnlineRef.current) return;
    const pending = readOutbox();
    if (!pending.length) return;
    const remaining: ActivityInsert[] = [];
    for (const item of pending) {
      try {
        await repoRef.current.insertActivity(item);
        setActivities((prev) => prev.map((a) => (a.id === item.id ? { ...a, _sync: "synced" } : a)));
      } catch {
        remaining.push(item); // still offline / failed — keep it queued
      }
    }
    writeOutbox(remaining);
  }, [readOutbox, writeOutbox]);

  // Initial load: hydrate from cache (warm) then refresh from the repo (cold
  // load shows skeletons because there is no cache yet).
  useEffect(() => {
    if (!babyId) return;
    let alive = true;
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    let hadCache = false;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey(babyId)) || "null");
      if (cached && Array.isArray(cached)) {
        setActivities(cached);
        setLoading(false);
        hadCache = true;
      }
    } catch {
      /* ignore */
    }
    if (!hadCache) setLoading(true);

    (async () => {
      const repo = await getRepo();
      if (!alive) return;
      repoRef.current = repo;

      // Re-apply any still-queued optimistic writes on top of server truth.
      const queued = readOutbox();
      try {
        const server = await repo.listToday(babyId);
        if (!alive) return;
        const queuedIds = new Set(queued.map((q) => q.id));
        const optimistic: Activity[] = queued
          .filter((q) => !server.some((s) => s.id === q.id))
          .map((q) => ({
            id: q.id,
            baby_id: q.baby_id,
            type: q.type,
            started_at: q.started_at,
            ended_at: q.ended_at ?? null,
            details_json: q.details_json as Record<string, unknown>,
            logged_by_user_id: me?.id ?? "",
            created_at: q.started_at,
            updated_at: q.started_at,
            logged_by_name: "You",
            logged_by_color: null,
            _sync: "queued" as const,
            _mine: true,
          }));
        const merged = [...optimistic, ...server.map((s) => ({ ...s, _sync: queuedIds.has(s.id) ? ("synced" as const) : s._sync }))].sort(
          (x, y) => (x.started_at < y.started_at ? 1 : -1),
        );
        setActivities(merged);
        localStorage.setItem(cacheKey(babyId), JSON.stringify(merged));
      } catch {
        /* offline cold load: keep cache/optimistic only */
      } finally {
        if (alive) setLoading(false);
      }

      void flush();
    })();

    return () => {
      alive = false;
    };
  }, [babyId, me?.id, readOutbox, flush]);

  // Persist the working set so warm navigations are instant.
  useEffect(() => {
    if (babyId && !loading) {
      try {
        localStorage.setItem(cacheKey(babyId), JSON.stringify(activities));
      } catch {
        /* quota — ignore */
      }
    }
  }, [activities, babyId, loading]);

  // Realtime subscription.
  useEffect(() => {
    if (!babyId || !repoRef.current) return;
    const repo = repoRef.current;
    const unsub = repo.subscribe(babyId, {
      onInsert: (row) => {
        setActivities((prev) => {
          if (prev.some((a) => a.id === row.id)) {
            // Our own echo (or a dup): just confirm it's synced.
            return prev.map((a) => (a.id === row.id ? { ...a, _sync: "synced" } : a));
          }
          const incoming: Activity = { ...row, _sync: "synced", _mine: row.logged_by_user_id === me?.id, _fresh: true };
          // Quiet toast for someone else's arrival; never for our own.
          if (!incoming._mine) {
            setToast({ name: row.logged_by_name });
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
          }
          setTimeout(() => setActivities((p) => p.map((a) => (a.id === row.id ? { ...a, _fresh: false } : a))), FRESH_MS);
          return [incoming, ...prev].sort((x, y) => (x.started_at < y.started_at ? 1 : -1));
        });
      },
      onDelete: (id) => setActivities((prev) => prev.filter((a) => a.id !== id)),
    });
    return unsub;
    // re-subscribe once the repo is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [babyId, repoRef.current, me?.id]);

  // Connectivity listeners.
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Flush whenever we (re)gain connectivity.
  useEffect(() => {
    if (effectiveOnline) void flush();
  }, [effectiveOnline, flush]);

  // ---- actions ----

  const log = useCallback(
    (type: VerbType, details: EatDetails = {}) => {
      if (!babyId) return null;
      const id = crypto.randomUUID();
      const startedAt = new Date().toISOString();
      const insert: ActivityInsert = { id, baby_id: babyId, type, started_at: startedAt, details_json: details };

      const optimistic: Activity = {
        id,
        baby_id: babyId,
        type,
        started_at: startedAt,
        ended_at: null,
        details_json: details as Record<string, unknown>,
        logged_by_user_id: me?.id ?? "",
        created_at: startedAt,
        updated_at: startedAt,
        logged_by_name: "You",
        logged_by_color: null,
        _sync: "queued",
        _mine: true,
      };
      setActivities((prev) => [optimistic, ...prev]);
      writeOutbox([...readOutbox(), insert]);

      // 5s undo window.
      setSnackbar({ id });
      if (snackTimer.current) clearTimeout(snackTimer.current);
      snackTimer.current = setTimeout(() => setSnackbar(null), UNDO_MS);

      void flush();
      return id;
    },
    [babyId, me?.id, readOutbox, writeOutbox, flush],
  );

  const undo = useCallback(
    async (id: string) => {
      setSnackbar(null);
      if (snackTimer.current) clearTimeout(snackTimer.current);
      const wasSynced = activities.find((a) => a.id === id)?._sync === "synced";
      setActivities((prev) => prev.filter((a) => a.id !== id));
      writeOutbox(readOutbox().filter((q) => q.id !== id));
      if (wasSynced && repoRef.current) {
        try {
          await repoRef.current.deleteActivity(id);
        } catch {
          /* will be cleaned up on next load */
        }
      }
    },
    [activities, readOutbox, writeOutbox],
  );

  const remove = useCallback(
    async (id: string) => {
      const wasSynced = activities.find((a) => a.id === id)?._sync === "synced";
      setActivities((prev) => prev.filter((a) => a.id !== id));
      writeOutbox(readOutbox().filter((q) => q.id !== id));
      if (wasSynced && repoRef.current) {
        try {
          await repoRef.current.deleteActivity(id);
        } catch {
          /* offline: best-effort; row reappears on reload until reconnect */
        }
      }
    },
    [activities, readOutbox, writeOutbox],
  );

  const checkConcurrent = useCallback(
    async (type: VerbType): Promise<Activity | null> => {
      if (!babyId || !repoRef.current) return null;
      try {
        return await repoRef.current.recentByOther(babyId, type, 60);
      } catch {
        return null;
      }
    },
    [babyId],
  );

  const queuedCount = activities.filter((a) => a._sync === "queued").length;

  return {
    activities,
    loading,
    online: effectiveOnline,
    forceOffline,
    setForceOffline,
    queuedCount,
    snackbar,
    toast,
    dismissToast: () => setToast(null),
    log,
    undo,
    remove,
    checkConcurrent,
  };
}
