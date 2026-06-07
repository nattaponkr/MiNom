"use client";
// Timeline (polish #09) — rows mirror Home (muted context + bold detail); attribution
// shown only when the caregiver changed from the previous row; tap → activity detail
// sheet (edit + delete); swipe-left → quick delete; BE dates for full-date displays.
import { Fragment, useEffect, useRef, useState } from "react";
import type { Activity } from "@/lib/types";
import { clockTime, formatDateBE } from "@/lib/format";
import { IcChevL, IcChevR, IcCheck, IcEat, IcPause, IcPlay, IcRepeat, IcSleep, IcStop, IcTrash, VERB_ICON } from "@/lib/icons";
import { getRepo } from "@/lib/sync/repo";
import { activityHierarchy, activitySummary, daySummaryStats, sleepActiveMs } from "@/lib/activity";
import { isFirstTimeFood } from "@/lib/eat";
import ActivityDetailSheet from "./ActivityDetailSheet";
import { ConfirmSheet } from "./Sheets";
import { t } from "@/i18n";

// Active feeding session helpers (live elapsed from started_at + accumulators).
function feedingMs(a: Activity, now: number): number {
  const d = a.details_json as { perSideMs?: { L?: number; R?: number }; segStart?: string };
  return (d.perSideMs?.L ?? 0) + (d.perSideMs?.R ?? 0) + (d.segStart ? now - new Date(d.segStart).getTime() : 0);
}
function feedingSide(a: Activity): string {
  return t(`eat.breast.${((a.details_json as { side?: string }).side ?? "L") === "L" ? "left" : "right"}`);
}
function fmtMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
}

// Day summary — count-led hero numbers per verb, on a quiet --surface-2 band, under the
// day label and above the rows. Hidden entirely when the day has no entries (#10).
// `now` ticks the live eat duration while a session is running (#11).
function DaySummary({ activities, now }: { activities: Activity[]; now: number }) {
  const stats = daySummaryStats(activities, now);
  if (!stats.length) return null;
  return (
    <div className="dsum" lang="th">
      <div className="dsum-grid">
        {stats.map((s, i) => (
          <Fragment key={s.verb}>
            {i > 0 && <span className="dsum-div" aria-hidden="true" />}
            <div className="dsum-stat">
              <span className="dsum-label">
                <span className={"dsum-dot " + s.verb} aria-hidden="true" />
                {s.label}
              </span>
              <span className="dsum-hero">
                {s.value.map((tk, j) => (
                  <span className="dsum-vg" key={j}>
                    <span className="dsum-n">{tk.n}</span>
                    <span className="dsum-u">{tk.u}</span>
                  </span>
                ))}
              </span>
              {Array.isArray(s.sub) ? (
                s.sub.map((line, k) => (
                  <span className="dsum-sub" key={k}>
                    {line}
                  </span>
                ))
              ) : s.sub ? (
                <span className="dsum-sub">{s.sub}</span>
              ) : (
                <span className="dsum-sub dsum-sub-blank" aria-hidden="true">
                  &nbsp;
                </span>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function Pill({ status, justSynced }: { status: Activity["_sync"]; justSynced: boolean }) {
  if (status === "queued")
    return (
      <span className="queued-pill">
        <span className="spin-sm" /> {t("sync.queued")}
      </span>
    );
  if (justSynced)
    return (
      <span className="queued-pill synced-pill">
        <IcCheck size={11} /> {t("sync.synced")}
      </span>
    );
  return null;
}

function dayRange(offset: number): { fromISO: string; toISO: string; start: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - offset);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { fromISO: start.toISOString(), toISO: end.toISOString(), start };
}

function dayLabel(offset: number): string {
  if (offset === 0) return t("timeline.today");
  if (offset === 1) return t("timeline.yesterday");
  return formatDateBE(dayRange(offset).start); // #7b Buddhist-Era full date
}

export default function Timeline({
  babyId,
  babyName,
  activities,
  loading,
  onEdit,
  onDelete,
  runningEat,
  onStopFeeding,
  onSwitchFeeding,
  runningSleep,
  onPauseSleep,
  onResumeSleep,
  onCompleteSleep,
}: {
  babyId: string;
  babyName: string;
  activities: Activity[]; // today, live
  loading: boolean;
  onEdit: (a: Activity) => void; // route to the per-verb edit sheet (Main)
  onDelete: (id: string) => void; // actual deletion (Main)
  runningEat: Activity | null;
  onStopFeeding: () => void;
  onSwitchFeeding: () => void;
  runningSleep: Activity | null;
  onPauseSleep: () => void;
  onResumeSleep: () => void;
  onCompleteSleep: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [past, setPast] = useState<Activity[]>([]);
  const [pastLoading, setPastLoading] = useState(false);
  const [detail, setDetail] = useState<Activity | null>(null);
  const [confirmDel, setConfirmDel] = useState<Activity | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const touch = useRef<{ x: number; id: string } | null>(null);

  // Tick the active-feeding/sleep elapsed + day-summary while a session runs.
  // A paused sleep is frozen, so only tick for a running (non-paused) sleep.
  const sleepTicking = !!runningSleep && !runningSleep.paused_at;
  useEffect(() => {
    if (!runningEat && !sleepTicking) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [runningEat, sleepTicking]);

  // Fetch past days on demand (read-only history). Today uses the live prop.
  useEffect(() => {
    if (offset === 0) return;
    let alive = true;
    setPastLoading(true);
    (async () => {
      const repo = await getRepo();
      const { fromISO, toISO } = dayRange(offset);
      try {
        const rows = await repo.listRange(babyId, fromISO, toISO);
        if (alive) setPast(rows);
      } catch {
        if (alive) setPast([]);
      } finally {
        if (alive) setPastLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [offset, babyId]);

  const isToday = offset === 0;
  const rows = isToday ? activities : past;
  const busy = isToday ? loading : pastLoading;

  // queued→synced flash (today only)
  const prev = useRef<Map<string, Activity["_sync"]>>(new Map());
  const [justSynced, setJustSynced] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isToday) return;
    const flips: string[] = [];
    for (const a of activities) {
      if (prev.current.get(a.id) === "queued" && a._sync === "synced") flips.push(a.id);
      prev.current.set(a.id, a._sync);
    }
    if (flips.length) {
      setJustSynced((s) => new Set([...s, ...flips]));
      const id = setTimeout(() => setJustSynced((s) => { const n = new Set(s); flips.forEach((x) => n.delete(x)); return n; }), 2200);
      return () => clearTimeout(id);
    }
  }, [activities, isToday]);

  const older = () => { setSwipedId(null); setOffset((o) => o + 1); };
  const newer = () => { setSwipedId(null); setOffset((o) => Math.max(0, o - 1)); };
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  return (
    <div className="screen-body" lang="th">
      {/* #1 header: no subtitle (the section label carries the day). #6 chevron states. */}
      <div className="tl-head">
        <button className="tl-nav" onClick={older} aria-label={t("timeline.yesterday")} type="button">
          <IcChevL size={20} />
        </button>
        <span className="tl-title">{t("timeline.title")}</span>
        <button className={"tl-nav" + (isToday ? " off" : "")} onClick={newer} disabled={isToday} aria-label={t("timeline.today")} type="button">
          <IcChevR size={20} />
        </button>
      </div>

      {busy ? (
        <div>
          {[0, 1, 2].map((i) => (
            <div className="tlr" key={i} aria-hidden="true">
              <span className="sk sk-circle" style={{ width: 42, height: 42, borderRadius: 13 }} />
              <span style={{ flex: 1 }}>
                <span className="sk sk-line" style={{ width: "30%", marginBottom: 8, height: 10 }} />
                <span className="sk sk-line" style={{ width: "52%" }} />
              </span>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <>
          <div className="tl-section">{dayLabel(offset)}</div>
          <div className="tl-empty">
            <div className="tl-empty-t">{t("timeline.empty.title")}</div>
            <div className="tl-empty-b">{t("timeline.empty.body")}</div>
          </div>
        </>
      ) : (
        <>
          <div className="tl-section">{dayLabel(offset)}</div>
          <DaySummary activities={rows} now={now} />
          {/* #11: active feeding session — elevated row at top, today only (not a completed row) */}
          {isToday && runningEat && (
            <div className="tl-active">
              <div className="tl-active-top">
                <span className="vi">
                  <IcEat size={22} />
                </span>
                <span className="tl-active-meta">
                  <span className="tl-active-k">
                    <span className="dot" />
                    {t("timeline.activeFeedingSide", { side: feedingSide(runningEat) })}
                  </span>
                  <span className="tl-active-v">
                    <span className="mono">{fmtMs(feedingMs(runningEat, now))}</span>
                  </span>
                </span>
              </div>
              <div className="ep-actions">
                <button className="ep-act stop" onClick={onStopFeeding} type="button">
                  <IcStop size={16} /> {t("home.eat.stopAction")}
                </button>
                <button className="ep-act switch" onClick={onSwitchFeeding} type="button">
                  <IcRepeat size={16} /> {t("home.eat.switchAction")}
                </button>
              </div>
            </div>
          )}
          {/* #12: active sleep session — running (หยุด) / paused (หลับต่อ + บันทึก), today only */}
          {isToday && runningSleep && (
            <div className={"tl-active sleep" + (runningSleep.paused_at ? " held" : "")}>
              <div className="tl-active-top">
                <span className="vi">
                  <IcSleep size={22} />
                </span>
                <span className="tl-active-meta">
                  <span className="tl-active-k">
                    <span className="dot" />
                    {t(runningSleep.paused_at ? "timeline.sleepPaused" : "timeline.sleepActive")}
                  </span>
                  <span className="tl-active-v">
                    <span className="mono">{fmtMs(sleepActiveMs(runningSleep, now))}</span>
                  </span>
                </span>
              </div>
              <div className="sp-chips">
                {runningSleep.paused_at ? (
                  <>
                    <button className="sp-chip resume" onClick={onResumeSleep} type="button">
                      <IcPlay size={15} /> {t("sleep.resume")}
                    </button>
                    <button className="sp-chip complete" onClick={onCompleteSleep} type="button">
                      <IcCheck size={15} /> {t("sleep.completeShort")}
                    </button>
                  </>
                ) : (
                  <button className="sp-chip stop" onClick={onPauseSleep} type="button">
                    <IcPause size={15} /> {t("sleep.pause")}
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="tl-list">
            {rows.filter((a) => !(isToday && ((runningEat && a.id === runningEat.id) || (runningSleep && a.id === runningSleep.id)))).map((a) => {
              const Ic = VERB_ICON[a.type];
              const { context, detail: bold } = activityHierarchy(a);
              const swiped = swipedId === a.id;
              return (
                <div
                  key={a.id}
                  className={"tlr-wrap" + (swiped ? " swiped" : "") + (a._fresh ? " sync-row" : "")}
                  onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, id: a.id })}
                  onTouchEnd={(e) => {
                    if (touch.current?.id === a.id) {
                      const dx = e.changedTouches[0].clientX - touch.current.x;
                      if (dx < -45) setSwipedId(a.id);
                      else if (dx > 45) setSwipedId(null);
                    }
                    touch.current = null;
                  }}
                >
                  {swiped && (
                    <button className="tlr-reveal" onClick={() => { setSwipedId(null); setConfirmDel(a); }} type="button" aria-label={t("a11y.deleteEntry")}>
                      <IcTrash size={20} />
                      <span>{t("timeline.swipeDelete")}</span>
                    </button>
                  )}
                  {/* #10 Part A: attribution chip + spacer removed product-wide. Who-logged-it
                      lives only in the detail sheet now. Time sits alone, right. */}
                  <button className="tlr tlr-noattr" type="button" onClick={() => (swiped ? setSwipedId(null) : setDetail(a))}>
                    <span className={"tlr-ic " + a.type}>
                      <Ic size={22} />
                    </span>
                    <span className="tlr-meta">
                      {context ? (
                        <>
                          <span className="tlr-ctx">{context}</span>
                          <span className="tlr-detail">
                            {bold}
                            {isFirstTimeFood(a.details_json) && <span className="ft-tag">{t("timeline.firstTimeTag")}</span>}
                          </span>
                        </>
                      ) : (
                        <span className="tlr-detail solo">{bold}</span>
                      )}
                    </span>
                    <span className="tlr-right">
                      <span className="tlr-time">{clockTime(a.started_at)}</span>
                      {isToday && <Pill status={a._sync} justSynced={justSynced.has(a.id)} />}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {detail && (
        <ActivityDetailSheet
          activity={detail}
          onEdit={(a) => { setDetail(null); onEdit(a); }}
          onRequestDelete={(a) => { setDetail(null); setConfirmDel(a); }}
          onClose={() => setDetail(null)}
        />
      )}

      {confirmDel && (
        <ConfirmSheet
          title={t("timeline.detail.delTitle")}
          body={t("timeline.detail.delBody", { summary: activitySummary(confirmDel), time: clockTime(confirmDel.started_at), baby: babyName })}
          confirmLabel={t("timeline.detail.delConfirm")}
          cancelLabel={t("timeline.detail.delKeep")}
          danger
          onConfirm={() => { onDelete(confirmDel.id); setConfirmDel(null); flash(t("timeline.detail.deleted")); }}
          onCancel={() => setConfirmDel(null)}
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
