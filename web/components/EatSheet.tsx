"use client";
// Eat v2 sheet — one sheet, three baby-centric modes (PRD §0.1, design spec
// design/section_eat2.jsx + screens_eat2.jsx):
//   • นมแม่ (bm)      — capture toggle จับเวลา/กรอกปริมาณ; live timer w/ tap-to-switch sides
//   • นมผง (formula)  — amount only
//   • อาหารแข็ง (solids) — food + portion + first-time allergen flag
// Smart last-used defaults keep the 2-tap path. `editing` seeds the sheet from an
// existing row for the toast's [แก้ไข] quick-correction.
import { useEffect, useRef, useState } from "react";
import type { Activity, EatCapture, EatDetails, EatMode, Portion, Side } from "@/lib/types";
import { isEatV2, type EatDefaults } from "@/lib/eat";
import { num } from "@/lib/format";
import { IcBottle, IcCheck, IcClock, IcDrop, IcEat, IcPlay, IcPlus, IcRepeat, IcStop, IcX } from "@/lib/icons";
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
const fmtBig = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const fmtSeg = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function EatSheet({
  defaults,
  editing,
  onSave,
  onUpdate,
  onClose,
}: {
  defaults: EatDefaults;
  editing?: Activity | null;
  onSave: (d: EatDetails, startedAt: string) => void;
  onUpdate?: (id: string, d: EatDetails, startedAt: string) => void;
  onClose: () => void;
}) {
  const seed = editing && isEatV2(editing.details_json) ? editing.details_json : null;

  const [mode, setMode] = useState<EatMode>(seed?.mode ?? defaults.mode);
  const [capture, setCapture] = useState<EatCapture>(seed?.mode === "bm" ? seed.capture : defaults.capture);
  const [startedAt, setStartedAt] = useState(() => editing?.started_at ?? new Date().toISOString());
  const [notes, setNotes] = useState(seed?.notes ?? "");

  // amount (นมผง + นมแม่·กรอกปริมาณ) — seeded per-mode; one tap on a chip overrides.
  const initialAmount = (): number => {
    if (seed?.mode === "formula") return seed.amountMl;
    if (seed?.mode === "bm" && seed.capture === "amount") return seed.amountMl;
    return (seed?.mode ?? defaults.mode) === "formula" ? defaults.formulaAmount : defaults.bmAmount;
  };
  const [amount, setAmount] = useState<number>(initialAmount);

  // solids
  const [food, setFood] = useState(seed?.mode === "solids" ? (seed.food ?? "") : "");
  const [portion, setPortion] = useState<Portion>(seed?.mode === "solids" ? seed.portion : defaults.portion);
  const [firstTime, setFirstTime] = useState(seed?.mode === "solids" ? seed.firstTime === true : false);
  const [acOpen, setAcOpen] = useState(false);

  // breast timer
  const timerSeed = seed?.mode === "bm" && seed.capture === "timer" ? seed : null;
  const [pickedSide, setPickedSide] = useState<Side | null>(timerSeed?.side ?? null);
  const [running, setRunning] = useState(false);
  const [activeSide, setActiveSide] = useState<Side>(timerSeed?.endingSide ?? timerSeed?.side ?? defaults.startingSide);
  const [accumMs, setAccumMs] = useState<{ L: number; R: number }>({ L: timerSeed?.perSideMs?.L ?? 0, R: timerSeed?.perSideMs?.R ?? 0 });
  const [segStart, setSegStart] = useState(0);
  const [now, setNow] = useState(Date.now());
  const reviewTimer = !!timerSeed; // editing a finished timer entry → static review

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const startSide: Side = pickedSide ?? defaults.startingSide;
  const liveActiveMs = accumMs[activeSide] + (running ? now - segStart : 0);
  const totalMs = accumMs.L + accumMs.R + (running ? now - segStart : 0);

  const selectMode = (m: EatMode) => {
    setMode(m);
    if (m === "formula") setAmount(defaults.formulaAmount);
    else if (m === "bm") setAmount(defaults.bmAmount);
  };
  const selectCapture = (c: EatCapture) => {
    setCapture(c);
    if (c === "amount") setAmount(defaults.bmAmount);
  };

  const startTimer = () => {
    setActiveSide(startSide);
    setAccumMs({ L: 0, R: 0 });
    setSegStart(Date.now());
    setNow(Date.now());
    setStartedAt(new Date().toISOString());
    setRunning(true);
  };
  const tapSide = (s: Side) => {
    if (!running) {
      setPickedSide(s);
      return;
    }
    if (s === activeSide) return; // tapping the active side is a no-op
    setAccumMs((p) => ({ ...p, [activeSide]: p[activeSide] + (Date.now() - segStart) }));
    setActiveSide(s);
    setSegStart(Date.now());
  };

  const commit = (d: EatDetails) => {
    if (editing && onUpdate) onUpdate(editing.id, d, startedAt);
    else onSave(d, startedAt);
  };
  const trimmedNotes = () => (notes.trim() ? { notes: notes.trim() } : {});

  const saveTimer = () => {
    const acc = { ...accumMs };
    if (running) acc[activeSide] += Date.now() - segStart;
    commit({ mode: "bm", capture: "timer", side: startSide, endingSide: activeSide, perSideMs: { L: acc.L, R: acc.R }, ...trimmedNotes() });
  };
  const saveAmount = () => {
    if (mode === "formula") commit({ mode: "formula", amountMl: amount, ...trimmedNotes() });
    else commit({ mode: "bm", capture: "amount", amountMl: amount, ...trimmedNotes() });
  };
  const saveSolids = () => {
    commit({ mode: "solids", portion, ...(food.trim() ? { food: food.trim() } : {}), ...(firstTime ? { firstTime: true } : {}), ...trimmedNotes() });
  };

  const eatStyle = { background: "var(--eat)", color: "var(--on-primary)" };

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

  const Notes = (
    <div className="field" style={{ marginBottom: 4 }}>
      <label htmlFor="eat-notes">
        {t("eat.notes.label")} <span style={{ fontWeight: 500, color: "var(--fg-faint)" }}>· {t("common.optional")}</span>
      </label>
      <textarea
        id="eat-notes"
        className="notes-area"
        placeholder={mode === "solids" ? t("eat.notes.solidsPlaceholder") : t("eat.notes.placeholder")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
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

          {/* Mode selector — segmented, defaults to last-used (PRD §0.1) */}
          <div className="eat-modes" role="tablist" aria-label={t("eat.title")}>
            {(["bm", "formula", "solids"] as EatMode[]).map((m) => {
              const Ic = MODE_ICON[m];
              return (
                <button
                  key={m}
                  className={"eat-mode" + (m === mode ? " on" : "")}
                  onClick={() => selectMode(m)}
                  role="tab"
                  aria-selected={m === mode}
                  type="button"
                  disabled={running}
                >
                  <span className="emi">
                    <Ic size={22} />
                  </span>
                  {t(`eat.mode.${m}`)}
                </button>
              );
            })}
          </div>

          <WhenCard verb="eat" startedAt={startedAt} onChange={setStartedAt} />

          {/* ── นมแม่ ── */}
          {mode === "bm" && (
            <>
              <div className="capture-toggle" role="tablist" aria-label={t("eat.mode.bm")}>
                <button className={"cap-opt" + (capture === "timer" ? " on" : "")} onClick={() => selectCapture("timer")} role="tab" aria-selected={capture === "timer"} type="button" disabled={running}>
                  <IcClock size={16} /> {t("eat.bm.captureTimer")}
                </button>
                <button className={"cap-opt" + (capture === "amount" ? " on" : "")} onClick={() => selectCapture("amount")} role="tab" aria-selected={capture === "amount"} type="button" disabled={running}>
                  <IcBottle size={16} /> {t("eat.bm.captureAmount")}
                </button>
              </div>

              {capture === "timer" ? (
                <>
                  <div className="bf-timer">
                    {running || reviewTimer ? (
                      <>
                        <div className={"bf-status" + (running ? " live" : "")} aria-live="polite">
                          {running && <span className="pulse-dot" style={{ background: "var(--eat)" }} />}
                          {t("eat.breast.running")}
                        </div>
                        <div className="bf-elapsed">{fmtBig(totalMs)}</div>
                        <div className="bf-runline">
                          {accumMs[other(activeSide)] > 0 ? (
                            <>
                              <span className="seg done">{t(`eat.breast.${other(activeSide) === "L" ? "left" : "right"}`)} {fmtSeg(accumMs[other(activeSide)])}</span>
                              <span className="arrow">→</span>
                              <span className="seg active">{t(`eat.breast.${activeSide === "L" ? "left" : "right"}`)} <IcClock size={12} /> {fmtSeg(liveActiveMs)}</span>
                            </>
                          ) : (
                            <span className="seg active">{t(`eat.breast.${activeSide === "L" ? "left" : "right"}`)} <IcClock size={12} /> {fmtSeg(liveActiveMs)}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bf-status">{t("eat.breast.pickSide")}</div>
                        <div className="bf-elapsed idle">00:00</div>
                        <div className="bf-runline" style={{ color: "var(--fg-faint)" }}>{t("eat.breast.idleHint")}</div>
                      </>
                    )}
                  </div>

                  <div className="side-pick">
                    {(["L", "R"] as Side[]).map((s) => {
                      const isActive = running && activeSide === s;
                      const isSuggested = !running && !reviewTimer && pickedSide === null && s === defaults.startingSide;
                      const isPicked = !running && !reviewTimer && pickedSide === s;
                      const sideMs = running ? (s === activeSide ? liveActiveMs : accumMs[s]) : accumMs[s];
                      return (
                        <button
                          key={s}
                          className={"side-btn" + (isActive || isPicked ? " on" : "") + (isSuggested ? " suggested" : "")}
                          onClick={() => tapSide(s)}
                          disabled={reviewTimer}
                          type="button"
                        >
                          {t(`eat.breast.${s === "L" ? "left" : "right"}`)}
                          {(running || reviewTimer) && <span className="sb-elapsed">{sideMs > 0 || isActive ? fmtSeg(sideMs) : "—"}</span>}
                          {isSuggested && <span className="sb-sub">{t("eat.breast.sideSuggestion")}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {running && <div className="switch-hint">{t("eat.breast.tapSwitchHint")}</div>}

                  {Notes}
                  <div style={{ height: 10 }} />
                  {running ? (
                    <Button kind="primary" size="lg" icon={<IcStop size={20} />} style={eatStyle} onClick={saveTimer}>
                      {t("eat.breast.stop")}
                    </Button>
                  ) : reviewTimer ? (
                    <Button kind="primary" size="lg" icon={<IcCheck size={20} />} style={eatStyle} onClick={saveTimer}>
                      {t("common.save")}
                    </Button>
                  ) : (
                    <Button kind="primary" size="lg" icon={<IcPlay size={18} />} style={eatStyle} onClick={startTimer}>
                      {t("eat.breast.start")}
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
                  {PORTIONS.map((p) => (
                    <button key={p.id} className={"chip" + (portion === p.id ? " on" : "")} onClick={() => setPortion(p.id)} type="button">
                      {t(p.key)}
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
