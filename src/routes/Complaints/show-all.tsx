import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ExclamationTriangleIcon as ComplaintIcon,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  CheckIcon as Check,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter } from "../../components/Filter/Filter";
import { UITable } from "../../components/UI/Table";
import { ActionsMenu } from "../../components/Shared/ActionsMenu";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  StatusBadge,
  displayName,
  formatDate,
} from "../../components/Shared/AccountHelpers";
import api from "../../lib/axios";
import { buildDynamicFilterItems } from "../../lib/buildDynamicFilters";
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { Complaint, ComplaintFiltersMeta } from "../../types/complaints";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

function mapFiltersMeta(fm?: ComplaintFiltersMeta | null) {
  if (!fm) return undefined;
  const filters: Record<string, Array<{ value: string; label: string }>> = {};
  if (fm.statuses?.length) {
    filters.status = fm.statuses.map((s) => ({
      value: s.key,
      label: `status.${s.key}`,
    }));
  }
  if (fm.types?.length) {
    filters.type = fm.types.map((s) => ({
      value: s.key,
      label: `complaint_type.${s.key}`,
    }));
  }
  return Object.keys(filters).length ? filters : undefined;
}

export default function ComplaintsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<Complaint>>({ data: [] });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "id", header: t("TITLES.id") },
      { index: 1, field: "submitted_by", header: t("TITLES.submittedBy") },
      { index: 2, field: "type", header: t("TITLES.type") },
      { index: 3, field: "status", header: t("TITLES.status") },
      { index: 4, field: "description", header: t("TITLES.description") },
      { index: 5, field: "created_at", header: t("TITLES.createdAt") },
      { index: 6, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems = useMemo(
    () =>
      buildDynamicFilterItems(t, data.meta?.filters, {
        placeholder: t("LABELS.searchComplaints"),
        prependInputIcon: Search as any,
      }),
    [t, data.meta?.filters]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const type = searchParams.get("type") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("complaints", {
        params: {
          page,
          search: search || undefined,
          status: status || undefined,
          type: type || "all",
          per_page: 15,
        },
      });
      const normalized = normalizeResponse<Complaint>(res.data);
      const fm = (res.data?.meta?.filters_metadata ??
        null) as ComplaintFiltersMeta | null;
      setData({
        ...normalized,
        meta: normalized.meta
          ? {
              ...normalized.meta,
              filters: mapFiltersMeta(fm) ?? normalized.meta.filters,
            }
          : normalized.meta,
      });
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadComplaints"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderCell = (field: string, item: Complaint) => {
    switch (field) {
      case "id":
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            #{item.id}
          </span>
        );
      case "submitted_by":
        return (
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {displayName(item.submitted_by?.name)}
            </p>
            {item.submitted_by?.type ? (
              <p className="text-xs text-muted-foreground">
                {t(`TITLES.${item.submitted_by.type}`, {
                  defaultValue: item.submitted_by.type,
                })}
              </p>
            ) : null}
          </div>
        );
      case "type":
        return (
          <span className="text-sm text-foreground">
            {item.type
              ? t(`COMPLAINT_TYPE.${item.type}`, {
                  defaultValue: item.type.replace(/_/g, " "),
                })
              : "—"}
          </span>
        );
      case "status":
        return (
          <StatusBadge
            status={item.status}
            label={
              item.status
                ? t(`STATUS.${item.status}`, {
                    defaultValue: item.status.replace(/_/g, " "),
                  })
                : undefined
            }
          />
        );
      case "description":
        return (
          <p
            className="max-w-xs truncate text-sm text-muted-foreground"
            title={item.description ?? undefined}
          >
            {item.description || "—"}
          </p>
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
                showUrl={`/complaints/${item.id}`}
                onClose={() => setOpenMenu(null)}
              >
                {item.status === "open" ? (
                  <Link
                    to={`/complaints/${item.id}?close=1`}
                    onClick={() => setOpenMenu(null)}
                    className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-primary hover:bg-primary/10"
                  >
                    <span className="action-btn primary">
                      <Check className="size-4" />
                    </span>
                    {t("ACTIONS.closeComplaint")}
                  </Link>
                ) : null}
              </ActionsMenu>
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
        title="complaints"
        subtitle="complaintsDesc"
        icon={ComplaintIcon}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "complaints", icon: ComplaintIcon },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="complaints"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
