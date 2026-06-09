"use client";
import { useState } from "react";
import { getRepo } from "@/lib/sync/repo";
import type { BabySex } from "@/lib/types";
import { Button } from "./ui";
import { IcX } from "@/lib/icons";
import { track } from "@/lib/analytics";
import { t } from "@/i18n";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function BabySetup({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [sex, setSex] = useState<BabySex | null>(null);
  const [touched, setTouched] = useState<{ name?: boolean; birthdate?: boolean }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameValid = name.trim().length >= 1;
  const dateValid = !!birthdate && birthdate <= todayISO();
  const canSubmit = nameValid && dateValid && !saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, birthdate: true });
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const repo = await getRepo();
      await repo.createBaby(name, birthdate, sex);
      track("baby_created", {});
      onDone();
    } catch {
      setError(t("setup.createError"));
      setSaving(false);
    }
  };

  return (
    <div className="app">
      <div className="app-main">
        <form className="screen-body" onSubmit={submit} noValidate style={{ paddingTop: 24 }}>
          <div className="appbar">
            <span>
              <span className="ttl" style={{ fontSize: 22 }}>
                {t("setup.title")}
              </span>
              <span className="sub">{t("setup.subtitle")}</span>
            </span>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="bname">{t("setup.name.label")}</label>
            <input
              id="bname"
              className={"input" + (touched.name && !nameValid ? " err" : "")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              placeholder={t("setup.name.placeholder")}
              autoFocus
            />
            {touched.name && !nameValid && (
              <span className="input-help err">
                <IcX size={13} /> {t("setup.name.error")}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="bdate">{t("setup.birthday.label")}</label>
            <input
              id="bdate"
              type="date"
              max={todayISO()}
              className={"input" + (touched.birthdate && !dateValid ? " err" : "")}
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, birthdate: true }))}
            />
            {touched.birthdate && !dateValid && (
              <span className="input-help err">
                <IcX size={13} /> {t("setup.birthday.error")}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="bsex">
              {t("setup.sex.label")} <span style={{ color: "var(--fg-faint)", fontWeight: 600 }}>{t("setup.sex.optional")}</span>
            </label>
            <div id="bsex" className="seg" role="group" aria-label={t("setup.sex.label")} style={{ marginTop: 2 }}>
              <button type="button" className={"seg-opt" + (sex === "boy" ? " on" : "")} style={{ minHeight: 48 }} aria-pressed={sex === "boy"} onClick={() => setSex(sex === "boy" ? null : "boy")}>
                {t("setup.sex.boy")}
              </button>
              <button type="button" className={"seg-opt" + (sex === "girl" ? " on" : "")} style={{ minHeight: 48 }} aria-pressed={sex === "girl"} onClick={() => setSex(sex === "girl" ? null : "girl")}>
                {t("setup.sex.girl")}
              </button>
            </div>
            <span className="input-help">{t("setup.sex.hint")}</span>
          </div>

          <div className="note" style={{ fontSize: 12.5, marginTop: 4 }}>
            {t("setup.photoHint")}
          </div>

          {error && (
            <div className="form-error" role="alert" style={{ marginTop: 14 }}>
              <IcX size={15} /> {error}
            </div>
          )}

          <div style={{ height: 16 }} />
          <Button kind="primary" size="lg" type="submit" loading={saving} disabled={!canSubmit}>
            {t("setup.continue")}
          </Button>
        </form>
      </div>
    </div>
  );
}
