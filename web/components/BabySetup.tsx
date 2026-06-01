"use client";
import { useState } from "react";
import { getRepo } from "@/lib/sync/repo";
import { Button } from "./ui";
import { IcX } from "@/lib/icons";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function BabySetup({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
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
      await repo.createBaby(name, birthdate);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the baby profile.");
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
                Add your baby
              </span>
              <span className="sub">Just a name and birthday to start.</span>
            </span>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="bname">Baby&apos;s name</label>
            <input
              id="bname"
              className={"input" + (touched.name && !nameValid ? " err" : "")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="e.g. Mina"
              autoFocus
            />
            {touched.name && !nameValid && (
              <span className="input-help err">
                <IcX size={13} /> A name (or nickname) is required.
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="bdate">Birthday</label>
            <input
              id="bdate"
              type="date"
              max={todayISO()}
              className={"input" + (touched.birthdate && !dateValid ? " err" : "")}
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, birthdate: true }))}
            />
            {touched.birthdate && !dateValid && (
              <span className="input-help err">
                <IcX size={13} /> Pick a birthday (today or earlier).
              </span>
            )}
          </div>

          <div className="note" style={{ fontSize: 12.5, marginTop: 4 }}>
            Sex, birth weight &amp; length, and a photo are optional — add them later in Settings.
          </div>

          {error && (
            <div className="form-error" role="alert" style={{ marginTop: 14 }}>
              <IcX size={15} /> {error}
            </div>
          )}

          <div style={{ height: 16 }} />
          <Button kind="primary" size="lg" type="submit" loading={saving} disabled={!canSubmit}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
