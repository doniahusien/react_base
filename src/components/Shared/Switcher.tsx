import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "../UI/Button";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import "./Switcher.css";
import { useTranslation } from "react-i18next";

interface SwitcherProps {
  value: boolean; url?: string; body?: any;
  method?: string; onReload?: () => void;
}

export function Switcher({ value, url, body, method = "PUT", onReload }: SwitcherProps) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(!!value);
  const [busy, setBusy] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => setEnabled(!!value), [value]);

  const changeStatus = async () => {
    if (!url) { setEnabled((v) => !v); onReload?.(); setShowDialog(false); return; }
    try {
      setBusy(true);
      const res = await api({ url, method, data: body ?? undefined });
      setEnabled((v) => !v); onReload?.(); setShowDialog(false);
      toast.success(t("MESSAGES.statusUpdated"), res.data?.message);
    } catch (err: any) {
      toast.error(t("MESSAGES.statusUpdateFailed"), err?.response?.data?.message);
    } finally { setBusy(false); }
  };

  return (
    <>
      <label className={`heart-switch${enabled ? " is-active" : ""}${busy ? " opacity-50 pointer-events-none" : ""}`} aria-pressed={enabled} onClick={(e) => { e.preventDefault(); setShowDialog(true); }}>
        <input type="checkbox" checked={enabled} readOnly disabled={busy} />
        <svg viewBox="0 0 33 23" aria-hidden="true">
          <path d="M23.5,0.5 C28.4705627,0.5 32.5,4.52943725 32.5,9.5 C32.5,16.9484448 21.46672,22.5 16.5,22.5 C11.53328,22.5 0.5,16.9484448 0.5,9.5 C0.5,4.52952206 4.52943725,0.5 9.5,0.5 C12.3277083,0.5 14.8508336,1.80407476 16.5007741,3.84362242 C18.1491664,1.80407476 20.6722917,0.5 23.5,0.5 Z" />
        </svg>
      </label>
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDialog(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-body p-6 shadow-2xl shadow-slate-950/20">
            <h3 className="text-base font-semibold text-text mb-2">{t("TITLES.changeStatus")}</h3>
            <p className="text-sm text-app-muted mb-6">{t("MESSAGES.changeStatus", { status: enabled ? t("TITLES.inactive") : t("TITLES.active") })}</p>
            <div className="flex items-center gap-3">
              <Button className="flex-1 max-w-full" loading={busy} onClick={changeStatus}>{t("BUTTONS.yes")} <Check size={16} /></Button>
              <Button reverse className="flex-1 max-w-full" onClick={() => setShowDialog(false)}>{t("BUTTONS.no")} <X size={16} /></Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Switcher;
