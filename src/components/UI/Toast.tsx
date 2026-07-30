import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore } from "../../stores/toast";
import type { Toast } from "../../types/toast";

const config = {
  success: { icon: CheckCircle, cls: "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40", iconCls: "text-primary", titleCls: "text-primary dark:text-primary-foreground", descCls: "text-foreground dark:text-foreground" },
  error:   { icon: XCircle,     cls: "bg-destructive/10 border-destructive/30 dark:bg-destructive/20 dark:border-destructive/40", iconCls: "text-destructive", titleCls: "text-destructive dark:text-destructive", descCls: "text-foreground dark:text-foreground" },
  info:    { icon: Info,        cls: "bg-accent/10 border-accent/30 dark:bg-accent/20 dark:border-accent/40", iconCls: "text-accent", titleCls: "text-accent dark:text-accent-foreground", descCls: "text-foreground dark:text-foreground" },
  warning: { icon: AlertTriangle, cls: "bg-secondary/10 border-secondary/30 dark:bg-secondary/20 dark:border-secondary/40", iconCls: "text-secondary", titleCls: "text-secondary dark:text-secondary-foreground", descCls: "text-foreground dark:text-foreground" },
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
      <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity rounded p-0.5 hover:bg-foreground/10" aria-label="Dismiss">
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
