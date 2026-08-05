import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { EyeIcon as Eye, PencilIcon as Pencil } from "@heroicons/react/24/outline";
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
  anchorEl,
  data,
  showUrl,
  editUrl,
  deleteUrl,
  onReload,
  onRemove,
  children,
}: ActionsMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number>();

  // Calculate position relative to viewport (for fixed positioning)
  const calculatePosition = useCallback(() => {
    if (!anchorEl || !menuRef.current) {
      setPosition(null);
      return;
    }

    const buttonRect = anchorEl.getBoundingClientRect();
    const menuElement = menuRef.current;
    const menuWidth = 160; // w-40 = 10rem = 160px
    
    // Wait a frame to ensure menu is rendered with content
    const menuHeight = menuElement.offsetHeight || 120;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 8;

    // Calculate vertical position (default: below button)
    let top = buttonRect.bottom + gap;
    
    // Calculate horizontal position (default: align right edge)
    let left = buttonRect.right - menuWidth;

    // Prevent overflow on left
    if (left < gap) {
      left = buttonRect.left;
    }

    // Prevent overflow on right
    if (left + menuWidth > viewportWidth - gap) {
      left = Math.max(gap, viewportWidth - menuWidth - gap);
    }

    // Flip to top if menu would overflow bottom
    if (top + menuHeight > viewportHeight - gap) {
      const topPosition = buttonRect.top - menuHeight - gap;
      if (topPosition >= gap) {
        top = topPosition;
      } else {
        // If can't fit above or below, position at bottom with some space
        top = Math.max(gap, viewportHeight - menuHeight - gap);
      }
    }

    setPosition({ top, left });
  }, [anchorEl]);

  // Initial position and position updates
  useEffect(() => {
    if (!anchorEl) {
      setPosition(null);
      return;
    }

    // Calculate position immediately and after render
    calculatePosition();
    
    // Recalculate after a short delay to account for content loading
    const timeoutId = setTimeout(calculatePosition, 10);

    return () => clearTimeout(timeoutId);
  }, [anchorEl, calculatePosition]);

  // Listen to scroll and resize events
  useEffect(() => {
    if (!anchorEl) return;

    const handleUpdate = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule update on next animation frame for smooth performance
      rafRef.current = requestAnimationFrame(calculatePosition);
    };

    // Listen to ALL scroll events (capture phase catches all scrollable containers)
    document.addEventListener("scroll", handleUpdate, { capture: true, passive: true });
    
    // Listen to window resize
    window.addEventListener("resize", handleUpdate, { passive: true });

    // Listen to specific scrollable containers if needed
    const scrollableParent = anchorEl.closest("[class*='overflow']");
    if (scrollableParent) {
      scrollableParent.addEventListener("scroll", handleUpdate, { passive: true } as any);
    }

    return () => {
      document.removeEventListener("scroll", handleUpdate, { capture: true });
      window.removeEventListener("resize", handleUpdate);
      
      if (scrollableParent) {
        scrollableParent.removeEventListener("scroll", handleUpdate);
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [anchorEl, calculatePosition]);

  if (typeof document === "undefined" || !anchorEl) {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      data-id={data?.id}
      onClick={(e) => e.stopPropagation()}
      className="fixed w-40"
      style={{
        top: `${position?.top ?? -9999}px`,
        left: `${position?.left ?? -9999}px`,
        opacity: position ? 1 : 0,
        pointerEvents: position ? "auto" : "none",
        zIndex: 999999,
        transition: "opacity 0.15s ease-out",
      }}
    >
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div className="h-0.5 w-full bg-primary opacity-60" />
        <div className="p-1.5 space-y-0.5">
          {showUrl && (
            <a
              href={showUrl}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-all hover:text-primary"
            >
              <span className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200 bg-primary/8 rounded-xl" />
              <span className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Eye width={12} height={12} />
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
                <Pencil width={12} height={12} />
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
