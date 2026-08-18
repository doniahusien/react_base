import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { EyeIcon as Eye, PencilIcon as Pencil } from "@heroicons/react/24/outline";
import { Deleter } from "./Deleter";
import { useTranslation } from "react-i18next";

interface ActionsMenuProps {
  data: any;
  showUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
  onReload?: () => void;
  children?: ReactNode;
  anchorEl?: HTMLElement | null;
}

export function ActionsMenu({
  data,
  showUrl,
  editUrl,
  deleteUrl,
  onReload,
  children,
  anchorEl,
}: ActionsMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; maxHeight: number } | null>(null);

  useEffect(() => {
    if (!anchorEl) return;

    const updatePosition = () => {
      if (!anchorEl) return;
      
      const buttonRect = anchorEl.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight || 150;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let top: number;
      let maxHeight: number;

      // Check if menu fits below
      if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
        // Position below
        top = buttonRect.bottom + 4;
        maxHeight = spaceBelow - 8;
      } else {
        // Position above
        top = buttonRect.top - menuHeight - 4;
        maxHeight = spaceAbove - 8;
      }

      // Position horizontally (align to right edge of button)
      const left = buttonRect.right - 125; // 125px is menu width

      setPosition({ top, left, maxHeight });
    };

    // Immediate update
    updatePosition();
    
    // Delayed update to ensure DOM is ready
    const timeoutId = setTimeout(updatePosition, 0);
    
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [anchorEl]);

  if (!anchorEl) return null;

  return createPortal(
    <div
      ref={menuRef}
      data-id={data?.id}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-9999 flex w-31.25 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
      style={{
        top: position ? `${position.top}px` : '0px',
        left: position ? `${position.left}px` : '0px',
        maxHeight: position ? `${position.maxHeight}px` : '300px',
        opacity: position ? 1 : 0,
        pointerEvents: position ? 'auto' : 'none',
      }}
    >
      {showUrl && (
        <Link
          to={showUrl}
          className="flex items-center gap-2 rounded-t-2xl border-b border-border p-2 text-main hover:bg-main/10"
        >
          <span className="action-btn main">
            <Eye className="size-4" />
          </span>
          <span className="text-sm">{t("ACTIONS.show")}</span>
        </Link>
      )}
      
      {editUrl && (
        <Link
          to={editUrl}
          className="flex items-center gap-2 border-b border-border p-2 text-primary hover:bg-primary/10"
        >
          <span className="action-btn primary">
            <Pencil className="size-4" />
          </span>
          <span className="text-sm">{t("ACTIONS.edit")}</span>
        </Link>
      )}
      
      {children}
      
      {deleteUrl && (
        <Deleter 
          url={deleteUrl} 
          onReload={onReload} 
          text={t("ACTIONS.delete")}
        />
      )}
    </div>,
    document.body
  );
}

export default ActionsMenu;
