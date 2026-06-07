"use client";
// Eat v2 sheet — three baby-centric modes. นมแม่ · จับเวลา is now a PERSISTED session
// (#11): tap a side to start (inserts an open-ended row), tap the active side (or the CTA)
// to stop+save, tap the other side to switch. The session is parent-held (runningEat from
// Main, mirroring the Sleep timer); closing the sheet does NOT stop it — the timer ticks
// from started_at across navigation. `editing` seeds the sheet from a finished row (#09 edit).
import { useEffect, useState } from "react";
import type { Activity, EatCapture, EatDetails, EatMode, Portion, Side } from "@/lib/types";
import { isEatV2, type EatDefaults } from "@/lib/eat";
import { clockTime, num } from "@/lib/format";
import { IcBottle, IcCheck, IcClock, IcDrop, IcEat, IcPlus, IcRepeat, IcStop, IcX } from "@/lib/icons";
import { Button } from "./ui";
import WhenCard from "./WhenCard";
import { t } from "@/i18n";

const MODE_ICON = { bm: IcDrop, formula: IcBottle, solids: IcEat } as const;
const QUICK_AMOUNTS = [60, 90, 120, 150, 180];
const PORTIONS: { id: Portion; key: string }[] = [
  { id: "S", key: "eat.solids.small" },
  { id: "M", key: "eat.solids.medium" },
  { id: "L", key: "eat.solids.large" },
];
const other = (s: Side): Side => (s === "L" ? "R" : "L");
const sideLabel = (s: Side) => t(`eat.breast.${s === "L" ? "left" : "right"}`);
const fmtBig = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
};
const fmtSeg = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function EatSheet({
  defaults,
  editing,
  runningEat,
  onSave,
  onUpdate,
  onStartEat,
  onSwitchEat,
  onStopEat,
  onEditTime,
  noteDraft,
  onNoteDraftChange,
  onClose,
}: {
  defaults: EatDefaults;
  editing?: Activity | null;
  runningEat?: Activity | null;
  onSave: (d: EatDetails, startedAt: string) => void;
  onUpdate?: (id: string, d: EatDetails, startedAt: string) => void;
  onStartEat: (side: Side) => void;
  onSwitchEat: (side: Side) => void;
  onStopEat: () => void;
  onEditTime?: () => void; // #14: open the mid-session start-time picker (live นมแม่ timer)
  noteDraft: string;
  onNoteDraftChange: (v: string) => void;
  onClose: () => void;
}) {
  const seed = editing && isEatV2(editing.details_json) ? editing.details_json : null;
  // Active live session (mode=bm, capture=timer, open-ended) — drives the running UI.
  const live = runningEat && isEatV2(runningEat.details_json) && runningEat.details_json.mode === "bm" && runningEat.details_json.capture === "timer" ? runningEat : null;

  const [mode, setMode] = useState<EatMode>(live ? "bm" : (seed?.mode ?? defaults.mode));
  const [capture, setCapture] = useState<EatCapture>(live ? "timer" : seed?.mode === "bm" ? seed.capture : defaults.capture);
  const [startedAt, setStartedAt] = useState(() => editing?.started_at ?? new Date().toISOString());
  const [notes, setNotes] = useState(seed?.notes ?? "");
  const [capLockHint, setCapLockHint] = useState(false);
  const [now, setNow] = useState(Date.now());

  const initialAmount = (): number => {
    if (seed?.mode === "formula") return seed.amountMl;
    if (seed?.mode === "bm" && seed.capture === "amount") return seed.amountMl;
    return (seed?.mode ?? defaults.mode) === "formula" ? defaults.formulaAmount : defaults.bmAmount;
  };
  const [amount, setAmount] = useState<number>(initialAmount);
  const [food, setFood] = useState(seed?.mode === "solids" ? (seed.food ?? "") : "");
  const [portion, setPortion] = useState<Portion>(seed?.mode === "solids" ? seed.portion : defaults.portion);
  const [firstTime, setFirstTime] = useState(seed?.mode === "solids" ? seed.firstTime === true : false);
  const [acOpen, setAcOpen] = useState(false);

  // breast timer — idle (tap a side to start) / finished review
  const timerSeed = seed?.mode === "bm" && seed.capture === "timer" ? seed : null;
  const reviewTimer = !!timerSeed && !live; // editing a finished entry → static review
  // #14 Part 6: cap the editable start at min(ended_at, first side-switch) on a completed entry.
  const reviewFirstSwitchMs = timerSeed?.switches?.length ? new Date(timerSeed.switches[0].at).getTime() : null;
  const reviewEndMs = editing?.ended_at ? new Date(editing.ended_at).getTime() : null;
  const reviewMaxISO = reviewTimer && reviewEndMs != null ? new Date(reviewFirstSwitchMs != null ? Math.min(reviewEndMs, reviewFirstSwitchMs) : reviewEndMs).toISOString() : undefined;

  // Tick while a session is live (display derives from started_at, not mount time).
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live]);

  // Live session geometry (from the row's details_json).
  const ld = live ? (live.details_json as { side?: Side; perSideMs?: { L?: number; R?: number }; segStart?: string }) : null;
  const liveSide: Side = ld?.side ?? "L";
  const livePer = { L: ld?.perSideMs?.L ?? 0, R: ld?.perSideMs?.R ?? 0 };
  const liveSegStart = ld?.segStart ? new Date(ld.segStart).getTime() : now;
  const liveTotal = live ? livePer.L + livePer.R + (now - liveSegStart) : 0;
  const liveSideMs = (s: Side) => (s === liveSide ? livePer[s] + (now - liveSegStart) : livePer[s]);

  const selectMode = (m: EatMode) => {
    setMode(m);
    if (m === "formula") setAmount(defaults.formulaAmount);
    else if (m === "bm") setAmount(defaults.bmAmount);
  };
  const selectCapture = (c: EatCapture) => {
    if (live) {
      setCapLockHint(true);
      return;
    }
    setCapture(c);
    if (c === "amount") setAmount(defaults.bmAmount);
  };
  const tapSide = (s: Side) => {
    if (live) {
      if (s === liveSide) onStopEat();
      else onSwitchEat(s);
      return;
    }
    if (reviewTimer) return;
    onStartEat(s); // idle: tapping a side starts the session on it (state machine §05)
  };

  const commit = (d: EatDetails) => {
    if (editing && onUpdate) onUpdate(editing.id, d, startedAt);
    else onSave(d, startedAt);
  };
  const trimmedNotes = () => (notes.trim() ? { notes: notes.trim() } : {});
  const saveReviewTimer = () => {
    const acc = { L: timerSeed?.perSideMs?.L ?? 0, R: timerSeed?.perSideMs?.R ?? 0 };
    // #14 Part 6: if the start moved, absorb the delta into the first side so the recorded
    // duration stays (ended_at − started_at). firstSide = first switch's, else the timed side.
    if (editing && timerSeed && startedAt !== editing.started_at) {
      const delta = new Date(editing.started_at).getTime() - new Date(startedAt).getTime();
      const firstSide: Side = timerSeed.switches?.[0]?.from ?? (acc.L > 0 && acc.R === 0 ? "L" : acc.R > 0 && acc.L === 0 ? "R" : (timerSeed.side ?? timerSeed.endingSide ?? "L"));
      acc[firstSide] = Math.max(0, acc[firstSide] + delta);
    }
    commit({ mode: "bm", capture: "timer", side: timerSeed?.side, endingSide: timerSeed?.endingSide ?? timerSeed?.side, perSideMs: acc, ...(timerSeed?.switches?.length ? { switches: timerSeed.switches } : {}), ...trimmedNotes() });
  };
  const saveAmount = () => {
    if (mode === "formula") commit({ mode: "formula", amountMl: amount, ...trimmedNotes() });
    else commit({ mode: "bm", capture: "amount", amountMl: amount, ...trimmedNotes() });
  };
  const saveSolids = () => {
    commit({ mode: "solids", portion, ...(food.trim() ? { food: food.trim() } : {}), ...(firstTime ? { firstTime: true } : {}), ...trimmedNotes() });
  };

  const eatStyle = { background: "var(--eat-strong)", color: "var(--on-primary)" };

  const AmountBody = (
    <div className="field" style={{ marginBottom: 12 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {t("eat.amount.label")}
        <span className="last-hint">
          <IcRepeat size={12} /> {t("eat.amount.lastUsedHint")}
        </span>
      </label>
      <div className="amt-display">
        <span className="amt-num">{num(amount)}</span>
        <span className="amt-unit">{t("eat.amount.unit")}</span>
      </div>
      <div className="amt-row">
        <button className="amt-step" onClick={() => setAmount((a) => Math.max(0, a - 10))} aria-label="−10" type="button">
          <span aria-hidden="true" style={{ width: 16, height: 2.1, borderRadius: 2, background: "currentColor" }} />
        </button>
        <span style={{ fontSize: 12, color: "var(--fg-faint)", fontWeight: 600 }}>−/+ 10</span>
        <button className="amt-step" onClick={() => setAmount((a) => a + 10)} aria-label="+10" type="button">
          <IcPlus size={18} />
        </button>
      </div>
      <div className="qa-row">
        {QUICK_AMOUNTS.map((v) => (
          <button key={v} className={"qa-chip" + (v === amount ? " on" : "")} onClick={() => setAmount(v)} type="button">
            {num(v)}
          </button>
        ))}
      </div>
    </div>
  );

  // Notes: the running session keeps a parent-held draft so it survives close+reopen.
  const noteVal = live ? noteDraft : notes;
  const setNoteVal = live ? onNoteDraftChange : setNotes;
  const Notes = (
    <div className="field" style={{ marginBottom: 4 }}>
      <label htmlFor="eat-notes">
        {t("eat.notes.label")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
      </label>
      <textarea
        id="eat-notes"
        className="notes-area"
        placeholder={mode === "solids" ? t("eat.notes.solidsPlaceholder") : t("eat.notes.placeholder")}
        value={noteVal}
        onChange={(e) => setNoteVal(e.target.value)}
      />
    </div>
  );

  return (
    <div className="sheet-screen" onClick={onClose} role="dialog" aria-modal="true" aria-label={t("eat.title")}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="screen-body" lang="th" style={{ paddingTop: 2 }}>
          <div className="appbar" style={{ paddingBottom: 6 }}>
            <span className="verb-ic eat" style={{ width: 40, height: 40, borderRadius: 13 }}>
              <IcEat size={22} />
            </span>
            <span className="ttl">{t("eat.title")}</span>
            <span className="spacer" />
            <button className="iconbtn primary-target" onClick={onClose} aria-label={t("common.cancel")} type="button">
              <IcX size={22} />
            </button>
          </div>

          <div className="eat-modes" role="tablist" aria-label={t("eat.title")}>
            {(["bm", "formula", "solids"] as EatMode[]).map((m) => {
              const Ic = MODE_ICON[m];
              return (
                <button key={m} className={"eat-mode" + (m === mode ? " on" : "")} onClick={() => selectMode(m)} role="tab" aria-selected={m === mode} type="button" disabled={!!live}>
                  <span className="emi">
                    <Ic size={22} />
                  </span>
                  {t(`eat.mode.${m}`)}
                </button>
              );
            })}
          </div>

          {live && onEditTime ? (
            // #14: live นมแม่ timer — reinstated แก้ไข on the เวลา card, routes to the picker
            <div className="te-when te-eat">
              <span className="te-when-ic">
                <IcClock size={18} />
              </span>
              <span className="te-when-meta">
                <span className="te-when-k">{t("eat.when.label")}</span>
                <span className="te-when-v">{t("sleep.startedAt", { time: clockTime(live.started_at) })}</span>
              </span>
              <button className="te-edit" type="button" onClick={onEditTime} title={t("time.editHint")}>
                {t("time.editWhileRunning")}
              </button>
            </div>
          ) : (
            <WhenCard verb="eat" startedAt={live ? live.started_at : startedAt} onChange={setStartedAt} hideEdit={!!live} maxISO={reviewMaxISO} />
          )}

          {/* ── นมแม่ ── */}
          {mode === "bm" && (
            <>
              <div className="capture-toggle" role="tablist" aria-label={t("eat.mode.bm")}>
                <button className={"cap-opt" + (capture === "timer" ? " on" : "")} onClick={() => selectCapture("timer")} role="tab" aria-selected={capture === "timer"} type="button">
                  <IcClock size={16} /> {t("eat.bm.captureTimer")}
                </button>
                <button className={"cap-opt" + (capture === "amount" ? " on" : "") + (live ? " locked" : "")} onClick={() => selectCapture("amount")} role="tab" aria-selected={capture === "amount"} type="button" aria-disabled={!!live}>
                  <IcBottle size={16} /> {t("eat.bm.captureAmount")}
                </button>
              </div>
              {capLockHint && <div className="cap-lock-hint">{t("eat.bm.lockedWhileRunning")}</div>}

              {capture === "timer" ? (
                <>
                  <div className={"ep-timer" + (live ? " running" : "")}>
                    <div className={"ep-status" + (live ? " live" : "")} aria-live="polite">
                      <span className="dot" />
                      {live ? t("eat.breast.running") : reviewTimer ? t("eat.breast.running") : t("eat.breast.idleTapSide")}
                    </div>
                    <div className={"ep-big" + (live || reviewTimer ? "" : " idle")}>
                      {fmtBig(live ? liveTotal : reviewTimer ? (timerSeed!.perSideMs?.L ?? 0) + (timerSeed!.perSideMs?.R ?? 0) : 0)}
                    </div>
                    {!live && !reviewTimer && <div className="ep-subhint">{t("eat.breast.idleSub")}</div>}
                  </div>

                  <div className="ep-sides">
                    {(["L", "R"] as Side[]).map((s) => {
                      const isActive = live ? liveSide === s : false;
                      const isSuggested = !live && !reviewTimer && s === defaults.startingSide;
                      const ms = live ? liveSideMs(s) : reviewTimer ? (timerSeed!.perSideMs?.[s] ?? 0) : 0;
                      return (
                        <button
                          key={s}
                          className={"ep-side" + (isActive ? " active" : "") + (live && !isActive ? " rest" : "") + (isSuggested ? " suggested" : "")}
                          onClick={() => tapSide(s)}
                          disabled={reviewTimer}
                          type="button"
                        >
                          {isActive && <span className="tick"><IcClock size={14} /></span>}
                          <span className="lbl">{sideLabel(s)}</span>
                          {(live || reviewTimer) && <span className="val">{ms > 0 || isActive ? fmtSeg(ms) : "—"}</span>}
                          {isSuggested && <span className="aff">{t("eat.breast.sideSuggestion")}</span>}
                          {live && !isActive && <span className="aff">{t("eat.breast.switchAff")}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {live && <div className="ep-hint">{t("eat.breast.tapStop")}</div>}

                  {Notes}
                  <div style={{ height: 10 }} />
                  {live ? (
                    <Button kind="primary" size="lg" icon={<IcStop size={20} />} style={eatStyle} onClick={onStopEat}>
                      {t("eat.breast.stop")}
                    </Button>
                  ) : reviewTimer ? (
                    <Button kind="primary" size="lg" icon={<IcCheck size={20} />} style={eatStyle} onClick={saveReviewTimer}>
                      {t("common.save")}
                    </Button>
                  ) : (
                    // Idle: no separate start button — a side tap starts. Bottom CTA closes.
                    <Button kind="ghost" size="lg" onClick={onClose}>
                      {t("eat.breast.closeIdle")}
                    </Button>
                  )}
                  <div style={{ height: 8 }} />
                </>
              ) : (
                <>
                  {AmountBody}
                  {Notes}
                  <div style={{ height: 10 }} />
                  <Button kind="primary" size="lg" icon={<IcCheck size={20} />} style={eatStyle} onClick={saveAmount}>
                    {t("eat.bm.save")}
                  </Button>
                  <div style={{ height: 8 }} />
                </>
              )}
            </>
          )}

          {/* ── นมผง ── */}
          {mode === "formula" && (
            <>
              {AmountBody}
              {Notes}
              <div style={{ height: 10 }} />
              <Button kind="primary" size="lg" icon={<IcCheck size={20} />} style={eatStyle} onClick={saveAmount}>
                {t("eat.formula.save")}
              </Button>
              <div style={{ height: 8 }} />
            </>
          )}

          {/* ── อาหารแข็ง ── */}
          {mode === "solids" && (
            <>
              <div className="ac-wrap">
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="eat-food">
                    {t("eat.solids.foodLabel")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
                  </label>
                  <input
                    id="eat-food"
                    className="input"
                    placeholder={t("eat.solids.foodPlaceholder")}
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                    onFocus={() => setAcOpen(true)}
                    onBlur={() => setTimeout(() => setAcOpen(false), 120)}
                  />
                </div>
                {acOpen && defaults.pastFoods.filter((f) => f !== food).length > 0 && (
                  <div className="ac-menu">
                    <div className="ac-head">{t("eat.solids.suggestionHeader")}</div>
                    {defaults.pastFoods
                      .filter((f) => f.toLowerCase().includes(food.trim().toLowerCase()) && f !== food)
                      .slice(0, 4)
                      .map((f) => (
                        <button key={f} className="ac-item" onMouseDown={() => setFood(f)} type="button">
                          <span className="clock">
                            <IcClock size={15} />
                          </span>
                          {f}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label>{t("eat.solids.portionLabel")}</label>
                <div className="chiprow">
                  {PORTIONS.map((pp) => (
                    <button key={pp.id} className={"chip" + (portion === pp.id ? " on" : "")} onClick={() => setPortion(pp.id)} type="button">
                      {t(pp.key)}
                    </button>
                  ))}
                </div>
              </div>

              <button className={"allergen" + (firstTime ? " on" : "")} onClick={() => setFirstTime((v) => !v)} type="button" aria-pressed={firstTime}>
                <span className="box">
                  <IcCheck size={15} />
                </span>
                <span>
                  <span className="at" style={{ display: "block" }}>{t("eat.solids.firstTime")}</span>
                  <span className="ah">{t("eat.solids.firstTimeHint")}</span>
                </span>
              </button>

              {Notes}
              <div style={{ height: 10 }} />
              <Button kind="primary" size="lg" icon={<IcCheck size={20} />} style={eatStyle} onClick={saveSolids}>
                {t("eat.solids.save")}
              </Button>
              <div style={{ height: 8 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
