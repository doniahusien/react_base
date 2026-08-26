import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UserGroupIcon as SubAdminsIcon,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { SubAdmin } from "../../types/permissions";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function SubAdminsShowAll() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<SubAdmin>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "full_name", header: t("TITLES.name") },
      { index: 1, field: "email", header: t("TITLES.email") },
      { index: 2, field: "status", header: t("TITLES.status") },
      { index: 3, field: "permissions", header: t("TITLES.permissions") },
      { index: 4, field: "created_by", header: t("TITLES.createdBy") },
      { index: 5, field: "created_at", header: t("TITLES.createdAt") },
      { index: 6, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchSubAdmins"),
        prependInputIcon: Search as any,
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("sub-admins", {
        params: {
          page,
          search: search || undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<SubAdmin>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadSubAdmins"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const permLabel = (code: string, name?: string) => {
    if (i18n.language?.startsWith("ar")) return name || code;
    return name || code;
  };

  const renderCell = (field: string, item: SubAdmin) => {
    switch (field) {
      case "full_name":
        return (
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {displayName(item.full_name)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(`ROLES.${item.admin_role}`, {
                defaultValue: item.admin_role,
              })}
            </p>
          </div>
        );
      case "email":
        return (
          <span className="text-sm text-muted-foreground">{item.email}</span>
        );
      case "status":
        return (
          <StatusBadge
            status={item.status}
            label={
              item.status
                ? t(`STATUS.${item.status}`, {
                    defaultValue: item.status,
                  })
                : undefined
            }
          />
        );
      case "permissions":
        return (
          <div className="flex max-w-xs flex-wrap gap-1">
            {(item.permissions ?? []).slice(0, 3).map((p) => (
              <span
                key={p.id}
                className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                title={p.code}
              >
                {permLabel(p.code, p.name)}
              </span>
            ))}
            {(item.permissions?.length ?? 0) > 3 ? (
              <span className="text-[10px] text-muted-foreground">
                +{(item.permissions?.length ?? 0) - 3}
              </span>
            ) : null}
            {!item.permissions?.length ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : null}
          </div>
        );
      case "created_by":
        return (
          <span className="text-sm text-muted-foreground">
            {displayName(item.created_by?.full_name)}
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
                showUrl={`/sub-admins/${item.id}`}
                editUrl={`/sub-admins/${item.id}/edit`}
                deleteUrl={`sub-admins/${item.id}`}
                onReload={() => {
                  setOpenMenu(null);
                  fetchData();
                }}
                onClose={() => setOpenMenu(null)}
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
        title="subAdmins"
        subtitle="subAdminsDesc"
        icon={SubAdminsIcon}
        total={data.meta?.total ?? data.data.length}
        addHref="/sub-admins/create"
        addLabel="subAdmin"
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "subAdmins", icon: SubAdminsIcon },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="subAdmins"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
