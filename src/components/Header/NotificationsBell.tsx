import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon as Bell } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { PERMISSION_CODES } from "../../lib/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import type { SystemNotification } from "../../types/notifications";

const POLL_INTERVAL_MS = 60_000;
const PER_PAGE = 15;

function isRead(value: SystemNotification["is_read"]): boolean {
  return value === true || value === 1 || value === "1";
}

function mapItem(raw: SystemNotification): SystemNotification {
  return {
    id: Number(raw.id),
    message: String(raw.message ?? ""),
    payload: raw.payload ?? null,
    is_read: isRead(raw.is_read),
    read_at: raw.read_at ?? null,
    created_at: raw.created_at ?? null,
  };
}

function resolveNotificationPath(item: SystemNotification): string | null {
  const raw = (item.payload?.url ?? "").trim();
  let path = raw.replace(/^https?:\/\/[^/]+/i, "");
  if (path.startsWith("/admin")) path = path.slice("/admin".length) || "/";
  if (path && !path.startsWith("/")) path = `/${path}`;

  const type = item.payload?.type ?? "";

  if (type === "lawyer_request" || /\/lawyers\/pending\/?$/.test(path)) {
    return "/verifications?status=pending";
  }

  const complaint = path.match(/\/complaints\/(\d+)/);
  if (complaint) return `/complaints/${complaint[1]}`;
  if (type === "new_complaint") return "/complaints?page=1";

  return path && path !== "/" ? path : null;
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const allowed = can(PERMISSION_CODES.manage_notifications);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SystemNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get("system-notifications", {
        params: { is_read: 0, per_page: 1 },
      });
      const normalized = normalizeResponse<SystemNotification>(res.data);
      const total = Number(normalized.meta?.total);
      setUnread(
        Number.isFinite(total)
          ? total
          : normalized.data.filter((item) => !isRead(item.is_read)).length
      );
    } catch {
      setUnread(0);
    }
  }, []);

  const fetchItems = useCallback(async (nextPage = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const res = await api.get("system-notifications", {
        params: { page: nextPage, per_page: PER_PAGE },
      });
      const normalized = normalizeResponse<SystemNotification>(res.data);
      const mapped = normalized.data.map(mapItem);
      setItems((prev) => (append ? [...prev, ...mapped] : mapped));
      setPage(nextPage);
      const lastPage = normalized.meta?.last_page ?? 1;
      setHasMore(nextPage < lastPage);
      if (!append && lastPage <= 1) {
        setUnread(mapped.filter((item) => !isRead(item.is_read)).length);
      }
    } catch {
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    fetchUnread();
    const id = window.setInterval(fetchUnread, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [allowed, fetchUnread]);

  useEffect(() => {
    if (open) fetchItems(1, false);
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

  const markRead = async (item: SystemNotification) => {
    if (isRead(item.is_read)) return;
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, is_read: true } : row
      )
    );
    setUnread((n) => Math.max(0, n - 1));
    try {
      await api.post(`system-notifications/${item.id}/read`);
    } catch {
      // Keep the optimistic unread state even if the mark-read call fails.
    }
  };

  const handleClick = async (item: SystemNotification) => {
    await markRead(item);
    const path = resolveNotificationPath(item);
    setOpen(false);
    if (path) navigate(path);
  };

  if (!allowed) return null;

  return (
    <div className="relative overflow-visible" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="header-icon-btn relative"
        aria-label={t("TITLES.systemNotifications")}
        title={t("TITLES.systemNotifications")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell width={15} height={15} />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-4 text-destructive-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute end-0 top-full z-9999 mt-2 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          role="menu"
        >
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
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
                {items.map((item) => {
                  const unreadItem = !isRead(item.is_read);
                  const type = item.payload?.type;
                  const typeLabel = type
                    ? t(`NOTIFICATION_TYPE.${type}`, { defaultValue: type })
                    : "";
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleClick(item)}
                        className={`flex w-full items-start gap-2 px-4 py-3 text-start transition-colors hover:bg-muted/50 ${
                          unreadItem ? "bg-primary/5" : ""
                        }`}
                      >
                        {!unreadItem ? (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-transparent" />
                        ) : (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm leading-5 text-foreground ${
                              unreadItem ? "font-semibold" : "font-medium"
                            }`}
                          >
                            {item.message || "—"}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {typeLabel && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {typeLabel}
                              </span>
                            )}
                            {item.created_at && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatWhen(item.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {hasMore && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => fetchItems(page + 1, true)}
              className="block w-full border-t border-border px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-muted/50 disabled:opacity-60"
            >
              {loadingMore ? t("TITLES.loading") : t("TITLES.loadMore")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;
