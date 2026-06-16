import type { ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { Deleter } from "./Deleter";
import { useTranslation } from "react-i18next";

interface ActionsMenuProps {
  data: any; showUrl?: string; editUrl?: string; deleteUrl?: string;
  onReload?: () => void; onRemove?: () => void; children?: ReactNode;
}

export function ActionsMenu({ data, showUrl, editUrl, deleteUrl, onReload, onRemove, children }: ActionsMenuProps) {
  const { t } = useTranslation();
  return (
    <div data-id={data?.id} onClick={(e) => e.stopPropagation()} className="absolute inset-e-0 top-[calc(100%+8px)] z-50 w-40">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/20 ring-1 ring-black/5 dark:ring-white/5">
        <div className="h-0.5 w-full bg-linear-to-r from-purple-500 via-blue-500 to-pink-500" />
        <div className="p-1.5 space-y-0.5">
          {showUrl && (
            <a href={showUrl} className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:text-purple-600 dark:hover:text-purple-400">
              <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-linear-to-r from-purple-500/10 to-transparent rounded-xl" />
              <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-purple-500/20 to-purple-600/10 text-purple-500 shadow-sm shadow-purple-500/10 group-hover:shadow-purple-500/30 group-hover:from-purple-500/30 transition-all"><Eye size={12} /></span>
              <span className="relative">{t("ACTIONS.show")}</span>
            </a>
          )}
          {editUrl && (
            <a href={editUrl} className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:text-blue-600 dark:hover:text-blue-400">
              <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-linear-to-r from-blue-500/10 to-transparent rounded-xl" />
              <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500/20 to-blue-600/10 text-blue-500 shadow-sm shadow-blue-500/10 group-hover:shadow-blue-500/30 group-hover:from-blue-500/30 transition-all"><Pencil size={12} /></span>
              <span className="relative">{t("ACTIONS.edit")}</span>
            </a>
          )}
          {children}
          {(deleteUrl || onRemove) && (
            <>
              <div className="mx-2 my-1 h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              <Deleter url={deleteUrl} onReload={onReload} onRemove={onRemove} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActionsMenu;
