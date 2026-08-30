import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BellAlertIcon as BellAlert,
  MagnifyingGlassIcon as Search,
  Squares2X2Icon as LayoutDashboard,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { PageHeader } from "../../components/UI/PageHeader";
import { formatDate } from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { AppNotification } from "../../types/notifications";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

const RESOURCE = "system-notifications";

export default function SystemNotificationsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<AppNotification>>({ data: [] });
  const [loading, setLoading] = useState(false);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "title", header: t("TITLES.title") },
      { index: 1, field: "body", header: t("TITLES.body") },
      { index: 2, field: "recipient", header: t("TITLES.recipient") },
      { index: 3, field: "is_read", header: t("TITLES.status") },
      { index: 4, field: "created_at", header: t("TITLES.createdAt") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchNotifications"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "is_read",
        label: t("TITLES.status"),
        options: [
          { id: "1", label: t("STATUS.read") },
          { id: "0", label: t("STATUS.unread") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const isRead = searchParams.get("is_read") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(RESOURCE, {
        params: {
          page,
          search: search || undefined,
          is_read: isRead !== "" ? isRead : undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<AppNotification>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadSystemNotifications"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, isRead, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCell = (field: string, item: AppNotification) => {
    switch (field) {
      case "title":
        return (
          <p className="truncate text-sm font-medium text-foreground">
            {item.title || "—"}
          </p>
        );
      case "body":
        return (
          <p className="max-w-xs truncate text-sm text-muted-foreground">
            {item.body || "—"}
          </p>
        );
      case "recipient":
        return (
          <span className="text-sm text-foreground">
            {item.recipient?.full_name || "—"}
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
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="systemNotifications"
        subtitle="systemNotificationsDesc"
        icon={BellAlert}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "systemNotifications", icon: BellAlert },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="systemNotifications"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
