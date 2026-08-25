import { useLayoutEffect, useEffect, useRef, useState } from "react";
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
  deleteLabel?: string;
  onReload?: () => void;
  onClose?: () => void;
  children?: ReactNode;
  anchorEl: HTMLElement;
}

function computePosition(anchorEl: HTMLElement, menuEl: HTMLElement | null) {
  const rect = anchorEl.getBoundingClientRect();
  const menuHeight = menuEl?.offsetHeight || 160;
  const menuWidth = menuEl?.offsetWidth || 128;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;
  const rtl = document.documentElement.dir === "rtl";

  let top: number;
  let maxHeight: number;

  if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
    top = rect.bottom + 4;
    maxHeight = Math.max(spaceBelow - 8, 120);
  } else {
    top = Math.max(rect.top - menuHeight - 4, 8);
    maxHeight = Math.max(spaceAbove - 8, 120);
  }

  let left = rtl ? rect.left : rect.right - menuWidth;
  left = Math.min(Math.max(8, left), viewportWidth - menuWidth - 8);

  return { top, left, maxHeight };
}

export function ActionsMenu({
  data,
  showUrl,
  editUrl,
  deleteUrl,
  deleteLabel,
  onReload,
  onClose,
  children,
  anchorEl,
}: ActionsMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef(anchorEl);
  anchorRef.current = anchorEl;

  const [position, setPosition] = useState(() =>
    computePosition(anchorEl, null)
  );

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor.isConnected) return;
      setPosition(computePosition(anchor, menuRef.current));
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [anchorEl]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current.contains(target)) return;
      onCloseRef.current?.();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };

    const timeoutId = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("touchstart", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorEl]);

  return createPortal(
    <div
      ref={menuRef}
      data-id={data?.id}
      role="menu"
      onClick={(e) => e.stopPropagation()}
      className="fixed z-[9999] flex min-w-32 max-w-56 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: position.maxHeight,
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
          text={deleteLabel ?? t("ACTIONS.delete")}
        />
      )}
    </div>,
    document.body
  );
}

export default ActionsMenu;
