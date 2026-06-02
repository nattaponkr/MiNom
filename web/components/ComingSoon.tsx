"use client";
import type { VerbType } from "@/lib/types";
import { VERB_ICON } from "@/lib/icons";
import { Button } from "./ui";
import { t } from "@/i18n";

export function ComingSoonSheet({ verb, onClose }: { verb: VerbType; onClose: () => void }) {
  const Ic = VERB_ICON[verb];
  const verbLabel = t(`verb.${verb}`);
  return (
    <div className="overlay" style={{ position: "fixed", zIndex: 70 }} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="sheet"
        style={{ width: "100%", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(18px + env(safe-area-inset-bottom,0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, padding: "12px 4px 6px" }}>
          <span className={"verb-ic " + verb} style={{ width: 56, height: 56 }}>
            <Ic size={28} />
          </span>
          <div className="st" style={{ textAlign: "center" }}>
            {t("comingSoon.title", { verb: verbLabel })}
          </div>
          <div className="sd" style={{ textAlign: "center" }}>
            {t("comingSoon.body", { verb: verbLabel })}
          </div>
        </div>
        <div className="sheet-actions">
          <Button kind="ghost" block onClick={onClose}>
            {t("comingSoon.gotIt")}
          </Button>
        </div>
      </div>
    </div>
  );
}
