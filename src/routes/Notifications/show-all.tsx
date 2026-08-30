import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BellIcon as Bell,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import { formatDate } from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import {
  NOTIFICATION_TARGET_SEGMENTS,
  type AppNotification,
} from "../../types/notifications";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

const RESOURCE = "notifications";

export default function NotificationsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<AppNotification>>({ data: [] });
  const [segments, setSegments] = useState<string[]>(
    NOTIFICATION_TARGET_SEGMENTS
  );
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "title", header: t("TITLES.title") },
      { index: 1, field: "body", header: t("TITLES.body") },
      { index: 2, field: "target_segment", header: t("TITLES.targetSegment") },
      { index: 3, field: "recipient", header: t("TITLES.recipient") },
      { index: 4, field: "sent_by_admin", header: t("TITLES.sentBy") },
      { index: 5, field: "is_read", header: t("TITLES.status") },
      { index: 6, field: "created_at", header: t("TITLES.createdAt") },
      { index: 7, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "radio",
        key: "target_segment",
        label: t("TITLES.targetSegment"),
        options: segments.map((s) => ({
          id: s,
          label: t(`NOTIFICATION_SEGMENT.${s}`, { defaultValue: s }),
        })),
      },
    ],
    [t, segments]
  );

  const page = searchParams.get("page") ?? "1";
  const targetSegment = searchParams.get("target_segment") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(RESOURCE, {
        params: {
          page,
          target_segment: targetSegment || undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<AppNotification>(res.data));
      const available = res.data?.meta?.available_target_segments;
      if (Array.isArray(available) && available.length) setSegments(available);
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadNotifications"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, targetSegment, t]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get(`${RESOURCE}/unread-count`);
      setUnreadCount(res.data?.data?.unread_count ?? null);
    } catch {
      setUnreadCount(null);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const reload = () => {
    fetchData();
    fetchUnreadCount();
  };

  const renderCell = (field: string, item: AppNotification) => {
    switch (field) {
      case "title":
        return (
          <Link
            to={`/notifications/${item.id}`}
            className="min-w-0 block hover:text-primary"
          >
            <p className="truncate text-sm font-medium text-foreground hover:text-primary">
              {item.title || "—"}
            </p>
          </Link>
        );
      case "body":
        return (
          <p className="max-w-xs truncate text-sm text-muted-foreground">
            {item.body || "—"}
          </p>
        );
      case "target_segment":
        return item.target_segment ? (
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {t(`NOTIFICATION_SEGMENT.${item.target_segment}`, {
              defaultValue: item.target_segment,
            })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "recipient":
        return (
          <span className="text-sm text-foreground">
            {item.recipient?.full_name || "—"}
          </span>
        );
      case "sent_by_admin":
        return (
          <span className="text-sm text-foreground">
            {item.sent_by_admin?.full_name || t("TITLES.system")}
          </span>
        );
      case "is_read":
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              item.is_read
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600"
            }`}
          >
            {item.is_read ? t("STATUS.read") : t("STATUS.unread")}
          </span>
        );
      case "created_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.created_at)}
          </span>
        );
      case "actions":
        return (
          <div className="relative w-9 overflow-visible">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (openMenu?.id === item.id) {
                  setOpenMenu(null);
                  return;
                }
                setOpenMenu({ id: item.id, anchor: e.currentTarget });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              <MoreHorizontal width={16} height={16} />
            </button>
            {openMenu?.id === item.id && (
              <ActionsMenu
                anchorEl={openMenu.anchor}
                data={item}
                showUrl={`/notifications/${item.id}`}
                deleteUrl={`${RESOURCE}/${item.id}`}
                onClose={() => setOpenMenu(null)}
                onReload={() => {
                  setOpenMenu(null);
                  reload();
                }}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="notifications"
        subtitle="notificationsDesc"
        icon={Bell}
        total={data.meta?.total ?? data.data.length}
        addHref="/notifications/create"
        addLabel="notification"
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "notifications", icon: Bell },
        ]}
        rightActions={
          unreadCount != null ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t("TITLES.unreadCount")}
              <span className="tabular-nums text-primary">{unreadCount}</span>
            </span>
          ) : undefined
        }
      />
      <UITable
        data={data}
        columns={columns}
        title="notifications"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
