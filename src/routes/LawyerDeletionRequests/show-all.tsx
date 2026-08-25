import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  TrashIcon as Trash,
  MagnifyingGlassIcon as Search,
  EllipsisHorizontalIcon as MoreHorizontal,
  Squares2X2Icon as LayoutDashboard,
  CheckIcon as Check,
  XMarkIcon as X,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Filter, type FilterItem } from "../../components/Filter/Filter";
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
import { normalizeResponse } from "../../lib/normalizeResponse";
import { toast } from "../../stores/toast";
import type { LawyerDeletionRequest } from "../../types/lawyerDeletionRequests";
import type { TableColumn } from "../../components/UI/ModifyColumns";
import type { TableData } from "../../components/UI/Table/types";

export default function LawyerDeletionRequestsShowAll() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<TableData<LawyerDeletionRequest>>({
    data: [],
  });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<{
    id: number;
    anchor: HTMLElement;
  } | null>(null);

  const columns: TableColumn[] = useMemo(
    () => [
      { index: 0, field: "lawyer", header: t("TITLES.lawyer") },
      { index:1, field: "reason", header: t("TITLES.reason") },
      { index: 2, field: "status", header: t("TITLES.status") },
      { index:3, field: "created_at", header: t("TITLES.createdAt") },
      { index: 4, field: "actions", header: t("TITLES.actions") },
    ],
    [t]
  );

  const filterItems: FilterItem[] = useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: t("TITLES.search"),
        placeholder: t("LABELS.searchDeletionRequests"),
        prependInputIcon: Search as any,
      },
      {
        type: "radio",
        key: "status",
        label: t("TITLES.status"),
        options: [
          { id: "pending", label: t("STATUS.pending") },
          { id: "approved", label: t("STATUS.approved") },
          { id: "rejected", label: t("STATUS.rejected") },
        ],
      },
    ],
    [t]
  );

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("lawyer-deletion-requests", {
        params: {
          page,
          search: search || undefined,
          status: status || undefined,
          per_page: 15,
        },
      });
      setData(normalizeResponse<LawyerDeletionRequest>(res.data));
    } catch (e: any) {
      toast.error(
        t("MESSAGES.failedToLoadDeletionRequests"),
        e?.response?.data?.message
      );
      setData({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const approve = async (item: LawyerDeletionRequest) => {
    try {
      const res = await api.put(`lawyer-deletion-requests/${item.id}/approve`);
      toast.success(
        t("MESSAGES.deletionRequestApproved"),
        res.data?.message
      );
      setOpenMenu(null);
      fetchData();
    } catch (e: any) {
      toast.error(
        t("MESSAGES.deletionRequestApproveFailed"),
        e?.response?.data?.message
      );
    }
  };

  const renderCell = (field: string, item: LawyerDeletionRequest) => {
    switch (field) {
      case "id":
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            #{item.id}
          </span>
        );
      case "lawyer":
        return (
          <div className="flex items-center gap-3">
            <Avatar name={item.lawyer?.name} />
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {displayName(item.lawyer?.name)}
              </p>
              {item.lawyer?.email ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail width={12} height={12} className="shrink-0" />
                  <span className="truncate">{item.lawyer.email}</span>
                </div>
              ) : null}
              {item.lawyer?.phone ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone width={12} height={12} className="shrink-0" />
                  <bdo dir="ltr">{item.lawyer.phone}</bdo>
                </div>
              ) : null}
            </div>
          </div>
        );
      case "reason":
        return (
          <p
            className="max-w-xs truncate text-sm text-muted-foreground"
            title={item.reason ?? undefined}
          >
            {item.reason || "—"}
          </p>
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
      case "created_at":
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(item.created_at)}
          </span>
        );
      case "actions": {
        const isPending = item.status === "pending";
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
                showUrl={`/lawyer-deletion-requests/${item.id}`}
                onClose={() => setOpenMenu(null)}
              >
                {isPending ? (
                  <>
                    <button
                      type="button"
                      onClick={() => approve(item)}
                      className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      <span className="action-btn primary">
                        <Check className="size-4" />
                      </span>
                      {t("ACTIONS.approve")}
                    </button>
                    <Link
                      to={`/lawyer-deletion-requests/${item.id}?reject=1`}
                      onClick={() => setOpenMenu(null)}
                      className="flex w-full items-center gap-2 border-b border-border p-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <span className="action-btn error">
                        <X className="size-4" />
                      </span>
                      {t("ACTIONS.reject")}
                    </Link>
                  </>
                ) : null}
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
        title="deletionRequests"
        subtitle="deletionRequestsDesc"
        icon={Trash}
        total={data.meta?.total ?? data.data.length}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          { label: "deletionRequests", icon: Trash },
        ]}
      />
      <UITable
        data={data}
        columns={columns}
        title="deletionRequests"
        loading={loading}
        renderCell={renderCell}
        filters={<Filter items={filterItems} />}
      />
    </div>
  );
}
