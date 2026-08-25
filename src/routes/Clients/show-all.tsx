import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UsersIcon as Users,
  MagnifyingGlassIcon as Search,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  ArrowPathIcon as Restore,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  Avatar,
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { buildDynamicFilterItems } from "../../lib/buildDynamicFilters";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { ClientListItem } from "../../types/accounts";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function ClientsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<ClientListItem>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "full_name", header: t("TITLES.name") },
      { index: 1, field: "email", header: t("TITLES.email"), sortable: true },
      { index: 2, field: "phone", header: t("TITLES.phone") },
      { index: 3, field: "status", header: t("TITLES.status") },
      { index: 4, field: "joined_at", header: t("TITLES.joinedAt") },
      { index: 5, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems = useMemo(
    () =>
      buildDynamicFilterItems(t, data.meta?.filters, {
        placeholder: t("LABELS.searchClients"),
        prependInputIcon: Search as any,
      }),
    [t, data.meta?.filters]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("clients", {
        params: {
          page,
          search: search || undefined,
          status: status || undefined,
        },
      });
      setData(normalizeResponse<ClientListItem>(res.data));
    } catch (e: any) {
      toast.error(t("MESSAGES.failedToLoadClients"), e?.response?.data?.message);
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const restore = async (id: number) => {
    try {
      const res = await api.put(`clients/${id}/restore`);
      toast.success(t("MESSAGES.restoredSuccess"), res.data?.message);
      setOpenMenu(null);
      fetchData();
    } catch (e: any) {
      toast.error(t("MESSAGES.restoreFailed"), e?.response?.data?.message);
    }
  };

  const renderCell = (field: string, item: ClientListItem) => {
    switch (field) {
      case "full_name":
        return (
          <div className="flex items-center gap-3">
            <Avatar name={item.full_name} />
            <div>
              <p className="text-sm font-medium text-foreground">
                {displayName(item.full_name)}
              </p>
              {item.gender && (
                <p className="text-xs capitalize text-muted-foreground">
                  {t(`TITLES.${item.gender}`, { defaultValue: item.gender })}
                </p>
              )}
            </div>
          </div>
        );
      case "email":
        return item.email ? (
          <div className="flex items-center gap-1.5">
            <Mail width={14} height={14} className="shrink-0 text-muted-foreground" />
            <a
              href={`mailto:${item.email}`}
              className="text-sm text-primary transition-colors hover:opacity-80"
            >
              {item.email}
            </a>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "phone":
        return item.phone ? (
          <div className="flex items-center gap-1.5">
            <Phone width={14} height={14} className="shrink-0 text-muted-foreground" />
            <bdo dir="ltr" className="text-sm text-foreground">
              {item.phone}
            </bdo>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      case "status": {
        const status = item.status === "suspended" ? "suspended" : item.status === "active" ? "active" : null;
        return status ? (
          <StatusBadge
            status={status}
            label={t(`STATUS.${status}`)}
          />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      }
      case "joined_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.joined_at)}
          </span>
        );
      case "actions": {
        const isSuspended = item.status === "suspended";
        const isActive = item.status === "active";
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
                showUrl={`/clients/${item.id}`}
                deleteUrl={isActive ? `clients/${item.id}` : undefined}
                deleteLabel={t("ACTIONS.suspend")}
                onClose={() => setOpenMenu(null)}
                onReload={() => {
                  setOpenMenu(null);
                  fetchData();
                }}
              >
                {isSuspended && (
                  <button
                    type="button"
                    onClick={() => restore(item.id)}
                    className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-foreground hover:bg-muted"
                  >
                    <span className="action-btn primary">
                      <Restore className="size-4" />
                    </span>
                    {t("ACTIONS.restore")}
                  </button>
                )}
              </ActionsMenu>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="clients"
        subtitle="clientsDesc"
        icon={Users}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "clients", icon: Users },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="clients"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
