import type { ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { Deleter } from "./Deleter";
import { useTranslation } from "react-i18next";

interface ActionsMenuProps {
  data: any;
  showUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
  onReload?: () => void;
  onRemove?: () => void;
  children?: ReactNode;
}

export function ActionsMenu({
  data, showUrl, editUrl, deleteUrl, onReload, onRemove, children,
}: ActionsMenuProps) {
  const { t } = useTranslation();
  return (
    <div data-id={data?.id} onClick={(e) => e.stopPropagation()} className="absolute inset-e-0 top-[calc(100%+8px)] z-50 w-40">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-panel shadow-xl shadow-black/10">
        {/* single-color accent line using the primary token */}
        <div className="h-0.5 w-full bg-primary opacity-60" />
        <div className="p-1.5 space-y-0.5">
          {showUrl && (
            <a
              href={showUrl}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-text transition-all hover:text-primary"
            >
              <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-primary/8 rounded-xl" />
              <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Eye size={12} />
              </span>
              <span className="relative">{t("ACTIONS.show")}</span>
            </a>
          )}
          {editUrl && (
            <a
              href={editUrl}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-text transition-all hover:text-blue-600"
            >
              <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-blue-500/8 rounded-xl" />
              <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Pencil size={12} />
              </span>
              <span className="relative">{t("ACTIONS.edit")}</span>
            </a>
          )}
          {children}
          {(deleteUrl || onRemove) && (
            <>
              <div className="mx-2 my-1 h-px bg-border" />
              <Deleter url={deleteUrl} onReload={onReload} onRemove={onRemove} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActionsMenu;
