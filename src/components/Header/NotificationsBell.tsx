import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BellIcon as Bell } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { formatDate } from "../Shared/AccountHelpers";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSION_CODES } from "../../lib/permissions";
import type { AppNotification } from "../../types/notifications";

const POLL_INTERVAL_MS = 60_000;

export function NotificationsBell() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const allowed = can(PERMISSION_CODES.manage_notifications);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!allowed) return;
    try {
      const res = await api.get("notifications/unread-count");
      setUnread(Number(res.data?.data?.unread_count ?? 0));
    } catch {
      setUnread(0);
    }
  }, [allowed]);

  const fetchItems = useCallback(async () => {
    if (!allowed) return;
    try {
      setLoading(true);
      const res = await api.get("system-notifications", {
        params: { per_page: 5 },
      });
      setItems(normalizeResponse<AppNotification>(res.data).data.slice(0, 5));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [allowed]);

  useEffect(() => {
    fetchUnread();
    const id = window.setInterval(fetchUnread, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [fetchUnread]);

  useEffect(() => {
    if (open) fetchItems();
  }, [open, fetchItems]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!allowed) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="header-icon-btn relative"
        aria-label={t("TITLES.notifications")}
        title={t("TITLES.notifications")}
      >
        <Bell width={15} height={15} />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-4 text-destructive-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-foreground">
              {t("TITLES.systemNotifications")}
            </p>
            {unread > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                {t("TITLES.unreadCount")} {unread}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t("TITLES.loading")}
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t("LABELS.noData")}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`px-4 py-3 ${item.is_read ? "" : "bg-primary/5"}`}
                  >
                    <div className="flex items-start gap-2">
                      {!item.is_read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title || "—"}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.body || ""}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/system-notifications?page=1"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-muted/50"
          >
            {t("TITLES.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;
