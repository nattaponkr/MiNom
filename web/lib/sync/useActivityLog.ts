"use client";
// useActivityLog — the sync engine (Phase 2 core, extended in Phase 3).
//
//   • Optimistic write: a log appears instantly as `queued`; no spinner.
//   • 5s undo on instant logs (Eat/Diaper); timers (Sleep) reverse via stop/delete.
//   • Offline-safe: every mutation persists to a localStorage outbox of *ops*
//     (insert | update | delete) and flushes in order when connectivity returns.
//   • Realtime: peers' inserts arrive (animate + quiet toast) and updates
//     (e.g. a sleep stop) reconcile silently — never stealing focus.
//   • Concurrency: detect a same-verb log by another caregiver in the last 60s.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Activity, SessionUser, VerbType } from "@/lib/types";
import { getRepo, type ActivityInsert, type ActivityPatch, type Repo } from "./repo";
import { track } from "@/lib/analytics";

const UNDO_MS = 5000;
const FRESH_MS = 600;
const TOAST_MS = 2600;

type Snackbar = { id: string } | null;
type Toast = { name: string } | null;

// Outbox op. Legacy entries (bare ActivityInsert) are normalized to insert.
type Op =
  | { op: "insert"; insert: ActivityInsert }
  | { op: "update"; id: string; patch: ActivityPatch }
  | { op: "delete"; id: string };

const outboxKey = (b: string) => `minom_outbox_${b}`;
const cacheKey = (b: string) => `minom_today_${b}`;
const opId = (o: Op) => (o.op === "insert" ? o.insert.id : o.id);

function normalizeOps(raw: unknown): Op[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e) => (e && typeof e === "object" && "op" in e ? (e as Op) : { op: "insert", insert: e as ActivityInsert }));
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

  const readOutbox = useCallback((): Op[] => {
    if (!babyId || typeof window === "undefined") return [];
    try {
      return normalizeOps(JSON.parse(localStorage.getItem(outboxKey(babyId)) || "[]"));
    } catch {
      return [];
    }
  }, [babyId]);

  const writeOutbox = useCallback(
    (ops: Op[]) => {
      if (babyId && typeof window !== "undefined") localStorage.setItem(outboxKey(babyId), JSON.stringify(ops));
    },
    [babyId],
  );

  const enqueue = useCallback((op: Op) => writeOutbox([...readOutbox(), op]), [readOutbox, writeOutbox]);

  // Flush queued ops in order. Safe to call often; no-ops when offline/empty.
  const flush = useCallback(async () => {
    if (!repoRef.current || !effectiveOnlineRef.current) return;
    const pending = readOutbox();
    if (!pending.length) return;
    const remaining: Op[] = [];
    for (const op of pending) {
      try {
        if (op.op === "insert") await repoRef.current.insertActivity(op.insert);
        else if (op.op === "update") await repoRef.current.updateActivity(op.id, op.patch);
        else await repoRef.current.deleteActivity(op.id);
        if (op.op !== "delete") setActivities((prev) => prev.map((a) => (a.id === opId(op) ? { ...a, _sync: "synced" } : a)));
      } catch {
        remaining.push(op); // still offline / failed — keep queued (preserve order)
        // A failure while we believe we're online is a real sync problem (not just offline).
        if (effectiveOnlineRef.current && op.op === "insert") track("sync_failed", { type: op.insert.type });
      }
    }
    writeOutbox(remaining);
  }, [readOutbox, writeOutbox]);

  // Initial load: hydrate cache (warm) then refresh from repo (cold → skeleton),
  // re-applying still-queued optimistic ops on top of server truth.
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

      const ops = readOutbox();
      try {
        const server = await repo.listToday(babyId);
        if (!alive) return;
        const insertOps = ops.filter((o): o is Extract<Op, { op: "insert" }> => o.op === "insert");
        const optimistic: Activity[] = insertOps
          .filter((o) => !server.some((s) => s.id === o.insert.id))
          .map((o) => ({
            id: o.insert.id,
            baby_id: o.insert.baby_id,
            type: o.insert.type,
            started_at: o.insert.started_at,
            ended_at: o.insert.ended_at ?? null,
            details_json: o.insert.details_json as Record<string, unknown>,
            logged_by_user_id: me?.id ?? "",
            created_at: o.insert.started_at,
            updated_at: o.insert.started_at,
            logged_by_name: "You",
            logged_by_color: null,
            _sync: "queued" as const,
            _mine: true,
          }));
        let merged: Activity[] = [...optimistic, ...server];
        // Re-apply queued updates/deletes so a pending sleep-stop etc. shows.
        for (const o of ops) {
          if (o.op === "update") merged = merged.map((a) => (a.id === o.id ? { ...a, ...o.patch, _sync: "queued" } : a));
          if (o.op === "delete") merged = merged.filter((a) => a.id !== o.id);
        }
        merged.sort((x, y) => (x.started_at < y.started_at ? 1 : -1));
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

  useEffect(() => {
    if (babyId && !loading) {
      try {
        localStorage.setItem(cacheKey(babyId), JSON.stringify(activities));
      } catch {
        /* quota — ignore */
      }
    }
  }, [activities, babyId, loading]);

  // Realtime.
  useEffect(() => {
    if (!babyId || !repoRef.current) return;
    const repo = repoRef.current;
    const unsub = repo.subscribe(babyId, {
      onInsert: (row) => {
        setActivities((prev) => {
          if (prev.some((a) => a.id === row.id)) return prev.map((a) => (a.id === row.id ? { ...a, _sync: "synced" } : a));
          const incoming: Activity = { ...row, _sync: "synced", _mine: row.logged_by_user_id === me?.id, _fresh: true };
          if (!incoming._mine) {
            setToast({ name: row.logged_by_name });
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
          }
          setTimeout(() => setActivities((p) => p.map((a) => (a.id === row.id ? { ...a, _fresh: false } : a))), FRESH_MS);
          return [incoming, ...prev].sort((x, y) => (x.started_at < y.started_at ? 1 : -1));
        });
      },
      // Peer edit (e.g. a sleep stop): reconcile quietly, never steal focus.
      onUpdate: (row) => {
        setActivities((prev) =>
          prev.some((a) => a.id === row.id)
            ? prev.map((a) => (a.id === row.id ? { ...a, ended_at: row.ended_at, details_json: row.details_json, started_at: row.started_at, _sync: "synced" } : a))
            : prev,
        );
      },
      onDelete: (id) => setActivities((prev) => prev.filter((a) => a.id !== id)),
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [babyId, repoRef.current, me?.id]);

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

  useEffect(() => {
    if (effectiveOnline) void flush();
  }, [effectiveOnline, flush]);

  // ---- actions ----

  // Build an optimistic row from an insert.
  const optimisticRow = useCallback(
    (insert: ActivityInsert): Activity => ({
      id: insert.id,
      baby_id: insert.baby_id,
      type: insert.type,
      started_at: insert.started_at,
      ended_at: insert.ended_at ?? null,
      details_json: insert.details_json as Record<string, unknown>,
      logged_by_user_id: me?.id ?? "",
      created_at: insert.started_at,
      updated_at: insert.started_at,
      logged_by_name: "You",
      logged_by_color: null,
      _sync: "queued",
      _mine: true,
    }),
    [me?.id],
  );

  // Instant log (Eat/Diaper): optimistic + 5s undo.
  const log = useCallback(
    (type: VerbType, details: Record<string, unknown> = {}, startedAtISO?: string) => {
      if (!babyId) return null;
      const insert: ActivityInsert = { id: crypto.randomUUID(), baby_id: babyId, type, started_at: startedAtISO ?? new Date().toISOString(), details_json: details };
      setActivities((prev) => [optimisticRow(insert), ...prev]);
      enqueue({ op: "insert", insert });
      setSnackbar({ id: insert.id });
      if (snackTimer.current) clearTimeout(snackTimer.current);
      snackTimer.current = setTimeout(() => setSnackbar(null), UNDO_MS);
      void flush();
      return insert.id;
    },
    [babyId, optimisticRow, enqueue, flush],
  );

  // Sleep timer start — an open-ended activity (ended_at null), no undo snackbar.
  const startSleep = useCallback(
    (startedAtISO?: string) => {
      if (!babyId) return null;
      const insert: ActivityInsert = { id: crypto.randomUUID(), baby_id: babyId, type: "sleep", started_at: startedAtISO ?? new Date().toISOString(), ended_at: null, details_json: {} };
      setActivities((prev) => [optimisticRow(insert), ...prev]);
      enqueue({ op: "insert", insert });
      void flush();
      return insert.id;
    },
    [babyId, optimisticRow, enqueue, flush],
  );

  // Sleep timer stop — patch ended_at (optimistic), queue an update op.
  const stopSleep = useCallback(
    (id: string, endedAtISO?: string) => {
      const ended_at = endedAtISO ?? new Date().toISOString();
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ended_at, _sync: "queued" } : a)));
      enqueue({ op: "update", id, patch: { ended_at } });
      void flush();
    },
    [enqueue, flush],
  );

  const dropOps = useCallback((id: string) => writeOutbox(readOutbox().filter((o) => opId(o) !== id)), [readOutbox, writeOutbox]);

  const undo = useCallback(
    async (id: string) => {
      setSnackbar(null);
      if (snackTimer.current) clearTimeout(snackTimer.current);
      const wasSynced = activities.find((a) => a.id === id)?._sync === "synced";
      setActivities((prev) => prev.filter((a) => a.id !== id));
      dropOps(id);
      if (wasSynced && repoRef.current) {
        try {
          await repoRef.current.deleteActivity(id);
        } catch {
          /* cleaned up on next load */
        }
      }
    },
    [activities, dropOps],
  );

  const remove = useCallback(
    async (id: string) => {
      const wasSynced = activities.find((a) => a.id === id)?._sync === "synced";
      setActivities((prev) => prev.filter((a) => a.id !== id));
      dropOps(id);
      if (wasSynced && repoRef.current) {
        try {
          await repoRef.current.deleteActivity(id);
        } catch {
          /* offline: reappears on reload until reconnect */
        }
      }
    },
    [activities, dropOps],
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

  const runningSleep = activities.find((a) => a.type === "sleep" && !a.ended_at) ?? null;
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
    startSleep,
    stopSleep,
    runningSleep,
    undo,
    remove,
    checkConcurrent,
  };
}
