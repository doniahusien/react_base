import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore } from "../../stores/toast";
import type { Toast } from "../../types/toast";

const config = {
  success: { icon: CheckCircle, cls: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800", iconCls: "text-green-500", titleCls: "text-green-800 dark:text-green-300", descCls: "text-green-700 dark:text-green-400" },
  error:   { icon: XCircle,     cls: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",       iconCls: "text-red-500",   titleCls: "text-red-800 dark:text-red-300",   descCls: "text-red-700 dark:text-red-400"   },
  info:    { icon: Info,        cls: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",    iconCls: "text-blue-500",  titleCls: "text-blue-800 dark:text-blue-300", descCls: "text-blue-700 dark:text-blue-400" },
  warning: { icon: AlertTriangle, cls: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800", iconCls: "text-yellow-500", titleCls: "text-yellow-800 dark:text-yellow-300", descCls: "text-yellow-700 dark:text-yellow-400" },
} as const;

function ToastItem({ t }: { t: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const { icon: Icon, cls, iconCls, titleCls, descCls } = config[t.type] ?? config.info;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-slate-950/10 backdrop-blur-sm ${cls}`} role="alert">
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconCls}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${titleCls}`}>{t.title}</p>
        {t.description && <p className={`text-xs mt-0.5 ${descCls}`}>{t.description}</p>}
      </div>
      <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-black/5" aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 inset-e-5 z-[200] flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]">
      {toasts.map((t) => <ToastItem key={t.id} t={t} />)}
    </div>
  );
}
