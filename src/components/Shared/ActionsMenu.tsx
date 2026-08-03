import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { Deleter } from "./Deleter";
import { useTranslation } from "react-i18next";

interface ActionsMenuProps {
  anchorEl?: HTMLElement | null;
  data: any;
  showUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
  onReload?: () => void;
  onRemove?: () => void;
  children?: ReactNode;
}

export function ActionsMenu({
  anchorEl, data, showUrl, editUrl, deleteUrl, onReload, onRemove, children,
}: ActionsMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchorEl || !menuRef.current) {
      setPosition(null);
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const top = rect.bottom + 2;
    const left = rect.right - 180; // width 400px approximate
    setPosition({ top, left });
  }, [anchorEl]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      data-id={data?.id}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-[9999] w-40 overflow-visible"
      style={position ? { top: position.top, left: position.left } : { visibility: "hidden" }}
    >
      <div className="relative overflow-visible rounded-b-2xl border border-border bg-card shadow-xl shadow-black/10">
        <div className="h-0.5 w-full bg-primary opacity-60" />
        <div className="p-1.5 space-y-0.5">
          {showUrl && (
            <a
              href={showUrl}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-all hover:text-primary"
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
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-all hover:text-primary"
            >
              <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-primary/8 rounded-xl" />
              <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
    </div>,
    document.body,
  );
}

export default ActionsMenu;
