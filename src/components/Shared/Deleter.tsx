import { useState } from "react";
import type { ReactNode } from "react";
import { Trash } from "lucide-react";
import { Button } from "../UI/Button";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import { useTranslation } from "react-i18next";

interface DeleterProps {
  url?: string; method?: string; body?: any;
  disabled?: boolean; text?: ReactNode;
  onReload?: () => void; onRemove?: () => void;
}

export function Deleter({ url, method = "DELETE", body, disabled, text, onReload, onRemove }: DeleterProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (url) {
      setLoading(true);
      try {
        const res = await api({ url, method, data: body ?? undefined });
        toast.success(t("MESSAGES.deletedSuccess"), res.data?.message);
        onReload?.();
      } catch (err: any) {
        toast.error(t("MESSAGES.deletedFailed"), err?.response?.data?.message);
      } finally { setLoading(false); }
    } else { onRemove?.(); }
  };

  return (
    <>
      <button type="button" onClick={() => setVisible(true)} disabled={loading || disabled} className="group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">
        <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-linear-to-r from-red-500/10 to-transparent rounded-xl" />
        <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-red-500/20 to-red-600/10 text-red-500 shadow-sm shadow-red-500/10 group-hover:shadow-red-500/30 group-hover:from-red-500/30 transition-all"><Trash size={12} /></span>
        {text !== undefined ? <span className="relative">{text}</span> : <span className="relative">{t("BUTTONS.delete")}</span>}
      </button>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setVisible(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-body p-6 shadow-2xl shadow-slate-950/20">
            <h3 className="text-base font-semibold text-text mb-2">{t("TITLES.confirmDelete")}</h3>
            <p className="text-sm text-muted mb-6">{t("MESSAGES.confirmDelete")}</p>
            <div className="flex items-center gap-3">
              <Button reverse className="flex-1 max-w-full" onClick={() => setVisible(false)}>{t("BUTTONS.cancel")}</Button>
              <Button className="flex-1 max-w-full !bg-red-600 hover:!bg-red-700" loading={loading} onClick={() => { submit(); setVisible(false); }}>{t("BUTTONS.delete")}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Deleter;
